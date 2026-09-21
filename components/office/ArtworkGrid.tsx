"use client";
// The artwork cards, with a Select mode: tap pieces, then hide them from the
// website, mark them sold, or put them back for sale, all at once.
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CheckSquare, X } from "lucide-react";
import { bulkWorkStatusAction } from "@/app/office/actions";
import { money } from "@/lib/site";
import { WorkStatusChip } from "./ui";
import { useToast } from "./Toast";

import type { Work } from "@/lib/works";
export type GridWork = Pick<Work, "slug" | "name" | "price" | "sold" | "hidden" | "available" | "stock" | "kind" | "iw" | "ih" | "imageSm" | "medium"> & { line: string };

export default function ArtworkGrid({ list }: { list: GridWork[] }) {
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const n = picked.size;

  const toggle = (slug: string) =>
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  const leave = () => {
    setSelecting(false);
    setPicked(new Set());
  };
  const apply = (status: "hidden" | "sold" | "sale", word: string) =>
    start(async () => {
      const r = await bulkWorkStatusAction([...picked], status);
      if (r.ok) {
        toast(`${r.count} ${r.count === 1 ? "piece" : "pieces"} ${word}. The website is updated.`);
        leave();
        router.refresh();
      } else toast(r.error, "error");
    });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <p className="o-muted text-[0.95rem]">{selecting ? (n ? `${n} selected` : "Tap the pieces you want to change.") : ""}</p>
        <button type="button" onClick={() => (selecting ? leave() : setSelecting(true))} className={`btn btn-sm shrink-0 ${selecting ? "btn-line" : "btn-ink"}`}>
          {selecting ? (
            <>
              <X className="h-4 w-4" /> Done
            </>
          ) : (
            <>
              <CheckSquare className="h-4 w-4" /> Select
            </>
          )}
        </button>
      </div>

      <div className={`o-in-view grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 ${selecting ? "o-selecting" : ""}`}>
        {list.map((w) => {
          const a = w.iw / w.ih;
          const board = w.kind === "surfboard";
          const widthPct = board ? 100 : a >= 0.8 ? 86 : 107.5 * a;
          const on = picked.has(w.slug);
          const inner = (
            <>
              <div className="plaster relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border-b border-[var(--o-hair)]">
                <div className="spot pointer-events-none absolute -top-[30%] left-1/2 h-[60%] w-[140%] -translate-x-1/2 opacity-70" />
                <div className="wrap-edge relative overflow-hidden bg-linen transition-transform duration-500 group-hover:-translate-y-1" style={board ? { width: "100%", height: "100%" } : { width: `${widthPct}%`, aspectRatio: `${w.iw} / ${w.ih}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.imageSm} alt={w.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                {w.hidden && <div className="absolute inset-0 bg-[rgba(246,242,234,0.55)]" />}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[9%] bg-[linear-gradient(180deg,rgba(18,23,43,0.03),rgba(18,23,43,0.09))]" />
                {selecting && (
                  <span className={`o-tick ${on ? "o-tick-on" : ""}`} aria-hidden>
                    {on && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                )}
              </div>
              <div className="p-3.5 sm:p-4">
                <p className="truncate text-[1rem] font-semibold leading-tight sm:text-[1.05rem]">{w.name}</p>
                <p className="mt-1 truncate text-[0.82rem] text-[var(--o-soft)]">{w.line}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  {w.sold ? (
                    <p className="o-num text-[1.15rem] text-[var(--o-red)] line-through decoration-2">{money(w.price)}</p>
                  ) : (
                    <p className="o-num text-[1.15rem]">{money(w.price)}</p>
                  )}
                  <WorkStatusChip work={w} />
                </div>
              </div>
            </>
          );
          return selecting ? (
            <button key={w.slug} type="button" onClick={() => toggle(w.slug)} aria-pressed={on} className={`o-card group overflow-hidden text-left transition-transform ${on ? "o-card-picked" : ""}`}>
              {inner}
            </button>
          ) : (
            <Link key={w.slug} href={`/office/artwork/${w.slug}`} className="o-card group overflow-hidden transition-transform hover:-translate-y-0.5">
              {inner}
            </Link>
          );
        })}
      </div>

      {selecting && n > 0 && (
        <div className="o-bulkbar">
          <p className="o-bulkbar-count">{n} selected</p>
          <div className="o-bulkbar-actions">
            <button type="button" disabled={busy} onClick={() => apply("hidden", "hidden from the website")} className="btn btn-ink btn-sm">
              Hide from website
            </button>
            <button type="button" disabled={busy} onClick={() => apply("sold", "marked sold")} className="btn btn-line btn-sm">
              Mark sold
            </button>
            <button type="button" disabled={busy} onClick={() => apply("sale", "back for sale")} className="btn btn-line btn-sm">
              Put back for sale
            </button>
          </div>
        </div>
      )}
    </>
  );
}
