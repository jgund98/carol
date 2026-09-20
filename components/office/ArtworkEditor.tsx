"use client";
// The one screen where a piece is made or changed. Big fields, one column on a
// phone, a live preview of the shop card and the true-to-scale view, and a
// Save bar that never scrolls away.
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpToLine, Check, RotateCcw } from "lucide-react";
import type { Kind, Work } from "@/lib/works";
import type { CollectionDef } from "@/lib/studio/types";
import WorkCard from "@/components/WorkCard";
import PhotoUploader, { type Photo } from "./PhotoUploader";
import { ConfirmButton } from "./Controls";
import { useToast } from "./Toast";
import { deleteWorkAction, moveWorkTopAction, saveWorkAction, type WorkInput } from "@/app/office/actions";
import { ActionButton } from "./Controls";

const KINDS: { key: Kind; label: string; hint: string }[] = [
  { key: "painting", label: "Painting", hint: "An original on canvas, linen or glass" },
  { key: "mini", label: "Mini", hint: "A small piece, like the Goddess minis" },
  { key: "surfboard", label: "Surfboard", hint: "A Nomad board" },
  { key: "book", label: "Book", hint: "Flower Power, Ocean Power" },
];

const STATUSES: { key: WorkInput["status"]; label: string; hint: string }[] = [
  { key: "sale", label: "For sale", hint: "Shown on the website with its price" },
  { key: "sold", label: "Sold", hint: "Still shown, marked Sold" },
  { key: "hold", label: "On hold", hint: "Shown, but cannot be bought" },
  { key: "hidden", label: "Hidden", hint: "Not on the website at all" },
];

function statusOf(w?: Work): WorkInput["status"] {
  if (!w) return "sale";
  if (w.hidden) return "hidden";
  if (w.sold) return "sold";
  if (!w.available) return "hold";
  return "sale";
}

const autoDescription = (width: string, height: string, medium: string) => {
  const size = width && height ? `${width} x ${height} in.` : "";
  return [size, medium.trim()].filter(Boolean).join(" ");
};

export default function ArtworkEditor({ work, collections, mediums }: { work?: Work; collections: CollectionDef[]; mediums: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, start] = useTransition();

  const [name, setName] = useState(work?.name ?? "");
  const [price, setPrice] = useState(work ? String(work.price) : "");
  const [stock, setStock] = useState(work && work.stock != null ? String(work.stock) : "");
  const [status, setStatus] = useState<WorkInput["status"]>(statusOf(work));
  const [kind, setKind] = useState<Kind>(work?.kind ?? "painting");
  const [medium, setMedium] = useState(work?.medium ?? "");
  const [customMedium, setCustomMedium] = useState(work?.medium && !mediums.includes(work.medium) ? work.medium : "");
  const [width, setWidth] = useState(work?.width ? String(work.width) : "");
  const [height, setHeight] = useState(work?.height ? String(work.height) : "");
  const [colls, setColls] = useState<string[]>(work?.collections ?? []);
  const initialAuto = autoDescription(width, height, medium);
  const [description, setDescription] = useState(work?.description ?? "");
  const [descTouched, setDescTouched] = useState(Boolean(work && work.description && work.description !== initialAuto));
  const [story, setStory] = useState(work?.story ?? "");
  const [featured, setFeatured] = useState(work?.featured ?? false);
  const [photo, setPhoto] = useState<Photo | null>(null);

  const effectiveMedium = medium === "__other" ? customMedium : medium;
  const auto = autoDescription(width, height, effectiveMedium);
  const shownDescription = descTouched ? description : auto;

  const currentPhoto = photo ?? (work ? { image: work.image, imageSm: work.imageSm, iw: work.iw, ih: work.ih, color: work.color } : null);
  const priceNum = Math.max(0, Math.round(Number(price.replace(/[^\d.]/g, "")) || 0));
  const stockNum = stock.trim() === "" ? null : Math.max(0, Math.floor(Number(stock) || 0));

  const preview: Work | null = useMemo(() => {
    if (!currentPhoto) return null;
    return {
      slug: work?.slug ?? "preview",
      file: work?.file ?? "preview",
      name: name || "Untitled",
      price: priceNum,
      stock: stockNum,
      sold: status === "sold" || stockNum === 0,
      available: status !== "hold",
      hidden: status === "hidden",
      medium: effectiveMedium || null,
      width: Number(width) || null,
      height: Number(height) || null,
      iw: currentPhoto.iw,
      ih: currentPhoto.ih,
      color: currentPhoto.color,
      collections: colls,
      description: shownDescription,
      story: story || null,
      featured,
      kind,
      image: currentPhoto.image,
      imageSm: currentPhoto.imageSm,
      position: 0,
      createdAt: "",
      updatedAt: "",
    };
  }, [currentPhoto, work, name, priceNum, stockNum, status, effectiveMedium, width, height, colls, shownDescription, story, kind, featured]);

  const canSave = name.trim().length > 0 && Boolean(currentPhoto) && !busy;
  const needsPrice = status === "sale" && priceNum <= 0;

  // Leaving with unsaved changes should ask first (the browser's own dialog).
  const snapshot = JSON.stringify({ name, price, stock, status, kind, medium, customMedium, width, height, colls, description, descTouched, story, featured, photo });
  const [saved, setSaved] = useState(snapshot);
  const dirty = snapshot !== saved;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save() {
    if (needsPrice) {
      toast("Set a price, or change the status to On hold or Hidden.", "error");
      return;
    }
    start(async () => {
      const r = await saveWorkAction({
        slug: work?.slug,
        name,
        price: priceNum,
        stock: stockNum,
        status,
        kind,
        medium: effectiveMedium,
        width: Number(width) || null,
        height: Number(height) || null,
        collections: colls,
        description: shownDescription,
        story,
        featured,
        photo,
      });
      if (!r.ok) {
        toast(r.error, "error");
        return;
      }
      if (status === "hidden") toast("Saved. It is hidden from the website until you change its status.");
      else toast(r.created ? "Saved. It is live at the top of the shop." : "Saved. The website is updated.", "ok", { href: `/shop/${r.slug}`, label: "See it" });
      setPhoto(null);
      setSaved(JSON.stringify({ name, price, stock, status, kind, medium, customMedium, width, height, colls, description, descTouched, story, featured, photo: null }));
      if (r.created) router.replace(`/office/artwork/${r.slug}`);
      else router.refresh();
    });
  }

  const S = ({ title }: { n?: number; title: string; hint?: string }) => <h2 className="o-h2 mb-4">{title}</h2>;

  return (
    <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.25fr_0.85fr] lg:items-start">
      <div className="grid gap-3 sm:gap-5">
        {/* 1 photo */}
        <section className="o-card o-in-view p-4 sm:p-7">
          <S title="Photo" />
          <PhotoUploader current={currentPhoto} name={name} kind={kind} onDone={(p) => setPhoto(p)} />
          {photo && (
            <p className="mt-3 inline-flex items-center gap-2 text-[0.92rem] font-semibold text-[var(--o-green)]">
              <Check className="h-4 w-4" /> New photo ready. It goes live when you save.
            </p>
          )}
        </section>

        {/* 2 title, price, status */}
        <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "60ms" }}>
          <S title="Title and price" />
          <div className="grid gap-5">
            <label className="o-field">
              <span>Title</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="o-in" placeholder="Celestial Moonlight" autoComplete="off" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="o-field">
                <span>Price</span>
                <div className="o-money">
                  <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="o-in" placeholder="14000" />
                </div>
              </label>
              <label className="o-field">
                <span>How many you have</span>
                <input value={stock} onChange={(e) => setStock(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="o-in" placeholder="One of a kind" />
                <span className="o-help">Leave empty for a one-of-a-kind original. For boards, books or prints, enter the number. It counts down with each sale and shows Sold at 0.</span>
              </label>
            </div>
            <div className="o-field">
              <span className="o-field-label">Status</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <label key={s.key} className="o-choice relative" data-on={status === s.key} title={s.hint}>
                    <input type="radio" name="status" checked={status === s.key} onChange={() => setStatus(s.key)} />
                    <span className="o-choice-dot" />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3 size & medium */}
        <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "120ms" }}>
          <S title="Size and medium" />
          <div className="grid gap-5">
            <div className="o-field">
              <span className="o-field-label">Type</span>
              <div className="flex flex-wrap gap-2">
                {KINDS.map((k) => (
                  <label key={k.key} className="o-choice relative" data-on={kind === k.key} title={k.hint}>
                    <input type="radio" name="kind" checked={kind === k.key} onChange={() => setKind(k.key)} />
                    {k.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="o-field">
                <span>Width (inches)</span>
                <input value={width} onChange={(e) => setWidth(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="o-in" placeholder="48" />
              </label>
              <label className="o-field">
                <span>Height (inches)</span>
                <input value={height} onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="o-in" placeholder="36" />
              </label>
            </div>
            <label className="o-field">
              <span>Medium</span>
              <select value={mediums.includes(medium) || medium === "" ? medium : "__other"} onChange={(e) => setMedium(e.target.value)} className="o-in">
                <option value="">Choose one…</option>
                {mediums.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="__other">Something else…</option>
              </select>
            </label>
            {(medium === "__other" || (medium && !mediums.includes(medium))) && (
              <label className="o-field">
                <span>Write the medium</span>
                <input value={medium === "__other" ? customMedium : medium} onChange={(e) => (medium === "__other" ? setCustomMedium(e.target.value) : setMedium(e.target.value))} className="o-in" placeholder="Oil and gold leaf on linen" />
              </label>
            )}
          </div>
        </section>

        {/* 4 collections */}
        <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "180ms" }}>
          <S title="Collections" />
          {collections.length === 0 ? (
            <p className="o-muted">No collections yet. You can make them under Collections.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => {
                const on = colls.includes(c.id);
                return (
                  <label key={c.id} className="o-choice relative" data-on={on}>
                    <input type="checkbox" checked={on} onChange={() => setColls(on ? colls.filter((x) => x !== c.id) : [...colls, c.id])} />
                    <span className="o-choice-dot" />
                    {c.name}
                  </label>
                );
              })}
            </div>
          )}
          <div className="mt-6 border-t border-[var(--o-hair)] pt-5">
            <label className="o-choice relative" data-on={featured}>
              <input type="checkbox" checked={featured} onChange={() => setFeatured(!featured)} />
              <span className="o-choice-dot" />
              Show on the home page
            </label>
          </div>
          {work && !work.hidden && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ActionButton className="btn btn-line btn-sm" done="Moved to the top of the shop." action={moveWorkTopAction} args={[work.slug]}>
                <ArrowUpToLine className="h-4 w-4" /> Move to the top of the shop
              </ActionButton>
            </div>
          )}
        </section>

        {/* 5 words */}
        <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "240ms" }}>
          <S title="Description" />
          <div className="grid gap-5">
            <label className="o-field">
              <span>Short description</span>
              <input
                value={shownDescription}
                onChange={(e) => {
                  setDescTouched(true);
                  setDescription(e.target.value);
                }}
                className="o-in"
                placeholder={auto || "48 x 36 in. Acrylic on Canvas"}
              />
              {descTouched && auto && (
                <button
                  type="button"
                  onClick={() => {
                    setDescTouched(false);
                    setDescription("");
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--o-soft)] hover:text-[var(--o-ink)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Use “{auto}”
                </button>
              )}
            </label>
            <label className="o-field">
              <span>About this piece · optional</span>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={4} className="o-in" placeholder="Optional. Shown on its page under the price." />
            </label>
          </div>
        </section>

        {work && (
          <div className="o-in-view" style={{ animationDelay: "300ms" }}>
            <ConfirmButton label="Remove this piece from the shop" question={`Remove “${work.name}” from the website for good?`} confirmLabel="Yes, remove it" action={deleteWorkAction} args={[work.slug]} afterHref="/office/artwork" />
          </div>
        )}
        <div className="h-24 lg:hidden" />
      </div>

      {/* preview + save */}
      <aside className="grid gap-3 sm:gap-5 lg:sticky lg:top-12">
        <section className="o-card o-in-view p-4 sm:p-6" style={{ animationDelay: "120ms" }}>
          <p className="o-label mb-4">In the shop</p>
          {preview ? (
            <div className="pointer-events-none mx-auto max-w-[300px]">
              <WorkCard work={preview} />
            </div>
          ) : (
            <div className="o-thumb grid aspect-[4/5] max-w-[300px] place-items-center text-[0.95rem] text-[var(--o-faint)]">Add a photo to see it</div>
          )}
        </section>
        <div className="hidden lg:block">
          <SaveBar canSave={canSave} busy={busy} status={status} isNew={!work} onSave={save} />
        </div>
      </aside>

      {/* phone: the save bar sits above the tabs */}
      <div className="fixed inset-x-0 bottom-[calc(var(--o-tab-h)+env(safe-area-inset-bottom))] z-50 border-t border-[var(--o-hair)] bg-[rgba(251,249,245,0.94)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <SaveBar canSave={canSave} busy={busy} status={status} isNew={!work} onSave={save} compact />
      </div>
    </div>
  );
}

function SaveBar({ canSave, busy, status, isNew, onSave, compact = false }: { canSave: boolean; busy: boolean; status: WorkInput["status"]; isNew: boolean; onSave: () => void; compact?: boolean }) {
  const label = busy ? "Saving…" : isNew ? (status === "hidden" ? "Save (hidden)" : "Save and put it in the shop") : status === "hidden" ? "Save (stays hidden)" : "Save changes";
  return (
    <div className={compact ? "flex items-center gap-3" : "o-card p-5"}>
      <button type="button" onClick={onSave} disabled={!canSave} className={`btn btn-pink ${compact ? "flex-1" : "w-full"}`}>
        {label}
      </button>
    </div>
  );
}
