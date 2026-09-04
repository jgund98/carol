"use client";
import { useState } from "react";
import type { Work } from "@/lib/works";
import { img, inches } from "@/lib/catalog";

/**
 * True-to-scale view. The painting is drawn in inches against a 5'8" figure and a sofa,
 * or hung on a plaster wall above a sofa. No fake room photos, just proportion.
 */
export default function ScaleView({ work }: { work: Work }) {
  const [mode, setMode] = useState<"scale" | "room">("room");
  const { w, h } = inches(work);
  // Stage is 180 in. wide by 110 in. tall.
  const STAGE_W = 180, STAGE_H = 110;
  const pw = (w / STAGE_W) * 100, ph = (h / STAGE_H) * 100;
  const person = { h: (68 / STAGE_H) * 100, w: (20 / STAGE_W) * 100 };
  const sofa = { w: (84 / STAGE_W) * 100, h: (32 / STAGE_H) * 100 };
  const artTop = mode === "room" ? Math.max(6, 100 - sofa.h - 8 - ph) : 100 - ph - 2;

  return (
    <div>
      <div className="flex items-center gap-2">
        {(["room", "scale"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors ${mode === m ? "bg-ink text-white" : "bg-ink/5 text-ink hover:bg-ink/10"}`}
          >
            {m === "room" ? "On the wall" : "Next to you"}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">
          {w} × {h} in.
        </span>
      </div>

      <div className="plaster relative mt-4 aspect-[180/110] w-full overflow-hidden rounded-xl border border-ink/10">
        {/* floor */}
        <div className="absolute inset-x-0 bottom-0 h-[10%] bg-[linear-gradient(180deg,#e2dbd0,#d5cdc0)]" />
        {/* painting */}
        <div
          className="wrap-edge absolute overflow-hidden bg-linen transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${pw}%`, height: `${ph}%`, left: mode === "room" ? `${50 - pw / 2}%` : `${58 - pw / 2}%`, top: `${artTop}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(work, "sm")} alt="" className="h-full w-full object-cover" />
        </div>
        {/* sofa */}
        <svg
          viewBox="0 0 84 32"
          className="absolute transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${sofa.w}%`, height: `${sofa.h}%`, left: `${50 - sofa.w / 2}%`, bottom: "9%", opacity: mode === "room" ? 1 : 0 }}
          aria-hidden
        >
          <rect x="4" y="6" width="76" height="16" rx="3" fill="#cfc5b6" />
          <rect x="0" y="12" width="84" height="14" rx="3" fill="#bfb3a1" />
          <rect x="8" y="13" width="32" height="9" rx="2" fill="#d9d0c2" />
          <rect x="44" y="13" width="32" height="9" rx="2" fill="#d9d0c2" />
          <rect x="6" y="26" width="3" height="6" fill="#7b573a" />
          <rect x="75" y="26" width="3" height="6" fill="#7b573a" />
        </svg>
        {/* person, 5'8" */}
        <svg
          viewBox="0 0 20 68"
          className="absolute transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${person.w}%`, height: `${person.h}%`, left: mode === "room" ? "8%" : `${58 - pw / 2 - person.w - 4}%`, bottom: "10%", opacity: 1 }}
          aria-label="A person 5 feet 8 inches tall, for scale"
        >
          <circle cx="10" cy="6" r="5" fill="#8b8f9c" />
          <path d="M5 13h10l2 22h-3l-1 33h-3l-1-24-1 24H5l-1-33H1z" fill="#8b8f9c" />
        </svg>
        <p className="absolute bottom-2 left-3 text-[0.62rem] font-semibold tracking-[0.14em] text-ink/45">FIGURE 5&#8242;8&#8243; · SOFA 84 IN.</p>
      </div>
    </div>
  );
}
