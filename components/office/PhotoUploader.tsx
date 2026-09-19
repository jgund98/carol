"use client";
// Take or choose a photo, drag the corners to the edges of the canvas, done.
// The browser shrinks the photo (phones shoot 12MB) and crops it before
// anything is uploaded, so the upload is quick and the server gets a clean
// picture of just the artwork.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, Images, RotateCw, Check, Maximize2 } from "lucide-react";
import type { Kind } from "@/lib/works";

export type Photo = { image: string; imageSm: string; iw: number; ih: number; color: string };
type Box = { x: number; y: number; w: number; h: number }; // 0..1 of the working image
type Drag = { kind: "move" | "nw" | "ne" | "sw" | "se"; startX: number; startY: number; box: Box };

const MAX_WORK = 2400;
const MIN = 0.08;

export default function PhotoUploader({ current, name, kind, onDone }: { current: Pick<Photo, "image" | "iw" | "ih"> | null; name: string; kind: Kind; onDone: (p: Photo) => void }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [work, setWork] = useState<HTMLCanvasElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [box, setBox] = useState<Box>({ x: 0.04, y: 0.04, w: 0.92, h: 0.92 });
  const [busy, setBusy] = useState<"reading" | "uploading" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy("reading");
    try {
      const bmp = await loadBitmap(file);
      const scale = Math.min(1, MAX_WORK / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
      if ("close" in bmp) (bmp as ImageBitmap).close();
      setWork(c);
      setSrc(c.toDataURL("image/jpeg", 0.85));
      setBox({ x: 0.04, y: 0.04, w: 0.92, h: 0.92 });
    } catch {
      setError("That file could not be opened. Try a JPG or PNG photo.");
    } finally {
      setBusy(null);
    }
  }

  function rotate() {
    if (!work) return;
    const c = document.createElement("canvas");
    c.width = work.height;
    c.height = work.width;
    const ctx = c.getContext("2d")!;
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(work, -work.width / 2, -work.height / 2);
    setWork(c);
    setSrc(c.toDataURL("image/jpeg", 0.85));
    setBox({ x: 0.04, y: 0.04, w: 0.92, h: 0.92 });
  }

  async function finish() {
    if (!work) return;
    setBusy("uploading");
    setError(null);
    try {
      const sx = Math.round(box.x * work.width), sy = Math.round(box.y * work.height);
      const sw = Math.max(1, Math.round(box.w * work.width)), sh = Math.max(1, Math.round(box.h * work.height));
      const out = document.createElement("canvas");
      out.width = sw;
      out.height = sh;
      out.getContext("2d")!.drawImage(work, sx, sy, sw, sh, 0, 0, sw, sh);
      const blob: Blob = await new Promise((res, rej) => out.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.9));
      const fd = new FormData();
      fd.append("file", blob, "artwork.jpg");
      fd.append("name", name || "piece");
      const r = await fetch("/api/office/upload", { method: "POST", body: fd });
      const d = (await r.json().catch(() => null)) as (Photo & { ok: true }) | { ok: false; error: string } | null;
      if (!d || !d.ok) throw new Error(d && "error" in d ? d.error : "The upload did not go through. Check your connection and try again.");
      onDone({ image: d.image, imageSm: d.imageSm, iw: d.iw, ih: d.ih, color: d.color });
      setWork(null);
      setSrc(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The upload did not go through.");
    } finally {
      setBusy(null);
    }
  }

  /* ── drag the box or a corner ── */
  function pointOf(e: PointerEvent | React.PointerEvent) {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }
  function down(kind: Drag["kind"]) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const p = pointOf(e);
      drag.current = { kind, startX: p.x, startY: p.y, box };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    };
  }
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !stageRef.current) return;
      const p = pointOf(e);
      const dx = p.x - d.startX, dy = p.y - d.startY;
      let { x, y, w, h } = d.box;
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      if (d.kind === "move") {
        x = clamp(x + dx, 0, 1 - w);
        y = clamp(y + dy, 0, 1 - h);
      } else {
        const right = x + w, bottom = y + h;
        if (d.kind === "nw" || d.kind === "sw") x = clamp(x + dx, 0, right - MIN);
        if (d.kind === "ne" || d.kind === "se") w = clamp(right + dx, x + MIN, 1) - x;
        if (d.kind === "nw" || d.kind === "ne") y = clamp(y + dy, 0, bottom - MIN);
        if (d.kind === "sw" || d.kind === "se") h = clamp(bottom + dy, y + MIN, 1) - y;
        if (d.kind === "nw" || d.kind === "sw") w = right - x;
        if (d.kind === "nw" || d.kind === "ne") h = bottom - y;
      }
      setBox({ x, y, w, h });
    };
    const up = () => (drag.current = null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const pickers = (
    <div className="flex flex-wrap gap-2.5">
      <button type="button" onClick={() => cameraRef.current?.click()} className="btn btn-ink w-full sm:w-auto">
        <Camera className="h-4 w-4" /> Take a photo
      </button>
      <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-line w-full sm:w-auto">
        <Images className="h-4 w-4" /> Choose from your photos
      </button>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
    </div>
  );

  // cropping
  if (src) {
    const cropped = { iw: Math.round(box.w * (work?.width ?? 1)), ih: Math.round(box.h * (work?.height ?? 1)) };
    return (
      <div className="grid gap-4">
        <p className="text-[0.95rem] font-semibold">Drag the pink corners to the edges of the {kind === "surfboard" ? "board" : kind === "book" ? "cover" : "canvas"}.</p>
        <div ref={stageRef} className="o-crop-stage mx-auto w-full max-w-[560px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} />
          <div className="o-crop-box" style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }} onPointerDown={down("move")}>
            <span className="o-crop-handle" style={{ left: 0, top: 0 }} onPointerDown={down("nw")} />
            <span className="o-crop-handle" style={{ right: 0, top: 0, margin: "-22px" }} onPointerDown={down("ne")} />
            <span className="o-crop-handle" style={{ left: 0, bottom: 0 }} onPointerDown={down("sw")} />
            <span className="o-crop-handle" style={{ right: 0, bottom: 0 }} onPointerDown={down("se")} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => setBox({ x: 0, y: 0, w: 1, h: 1 })} className="btn btn-line btn-sm">
            <Maximize2 className="h-4 w-4" /> Use the whole photo
          </button>
          <button type="button" onClick={rotate} className="btn btn-line btn-sm">
            <RotateCw className="h-4 w-4" /> Rotate
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-line btn-sm">
            Different photo
          </button>
          <span className={`text-[0.85rem] font-semibold ${quality(cropped).tone}`}>
            {cropped.iw} × {cropped.ih} px · {quality(cropped).label}
          </span>
        </div>
        <button type="button" onClick={finish} disabled={busy === "uploading"} className="btn btn-pink w-full sm:w-max">
          <Check className="h-4 w-4" /> {busy === "uploading" ? "Uploading…" : "Looks right, use this"}
        </button>
        {error && <p className="font-semibold text-[var(--o-red)]">{error}</p>}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      </div>
    );
  }

  // nothing yet
  if (!current)
    return (
      <div className="grid gap-4">
        <div className="o-thumb grid aspect-[4/5] w-full max-w-[280px] place-items-center rounded-[18px] text-center">
          <div className="p-6">
            <Camera className="mx-auto h-9 w-9 text-[var(--o-faint)]" strokeWidth={1.5} />
            <p className="mt-3 text-[0.95rem] text-[var(--o-soft)]">Your photo goes here</p>
          </div>
        </div>
        {busy === "reading" ? <p className="o-muted">Opening the photo…</p> : pickers}
        {error && <p className="font-semibold text-[var(--o-red)]">{error}</p>}
        <p className="text-[0.88rem] text-[var(--o-faint)]">Straight on, in daylight. <Link href="/office/guide" className="font-semibold underline underline-offset-4">Photo guide</Link></p>
      </div>
    );

  // has a photo
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="o-thumb grid h-[240px] w-[220px] place-items-center rounded-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.image} alt="" style={{ maxWidth: "84%", maxHeight: "84%", width: "auto", height: "auto" }} />
      </div>
      <div className="grid gap-3">
        <p className="text-[0.95rem] text-[var(--o-soft)]">
          {current.iw} × {current.ih} px
        </p>
        {busy === "reading" ? <p className="o-muted">Opening the photo…</p> : pickers}
        {error && <p className="font-semibold text-[var(--o-red)]">{error}</p>}
      </div>
    </div>
  );
}

/** Sizes measured against how the website shows a piece: 1600 px wide on its own page, 700 px in the shop grid, zoomed 2.4× in the viewer. */
function quality({ iw, ih }: { iw: number; ih: number }): { label: string; tone: string } {
  const long = Math.max(iw, ih);
  if (long >= 2400) return { label: "perfect", tone: "text-[var(--o-green)]" };
  if (long >= 1600) return { label: "very good", tone: "text-[var(--o-green)]" };
  if (long >= 1000) return { label: "fine for the shop, a little soft when zoomed", tone: "text-[#7d5f1e]" };
  return { label: "too small, get closer or use a bigger photo", tone: "text-[var(--o-red)]" };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(url);
        res(im);
      };
      im.onerror = rej;
      im.src = url;
    });
  }
}
