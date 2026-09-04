"use client";
import { useEffect, useRef } from "react";
import type { Work } from "@/lib/works";
import Easel from "./Easel";

/**
 * Carol in the hero: a lit doorway into her new gallery (real footage, August 2026)
 * with the easel standing in front of it. Nothing is cut out; she is simply there.
 */
export default function StudioHero({ works }: { works: Work[] }) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    el.play().catch(() => {});
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause())), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[380px] sm:max-w-[520px] lg:max-w-[680px]" style={{ width: "min(100%, calc((100svh - var(--header-h) - 120px) * 0.8))" }}>
      <div className="relative aspect-[4/5] w-full">
        {/* Doorway into the studio */}
        <div className="absolute right-0 top-0 h-[92%] w-[58%] overflow-hidden rounded-[4px] bg-ink shadow-[0_40px_80px_-30px_rgba(18,23,43,0.45)] ring-1 ring-ink/10 lg:w-[56%]">
          <video
            ref={v}
            src="/video/studio-tour.mp4"
            poster="/video/studio-tour.jpg"
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            className="h-full w-full object-cover"
            aria-label="Carol Calicchio walking through her new gallery in Delray Beach"
          />
          {/* warm light from above, floor fall-off */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,236,0.18),rgba(255,250,236,0)_30%,rgba(18,23,43,0)_70%,rgba(18,23,43,0.35)_100%)]" />
          <p className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[0.66rem] font-semibold tracking-[0.08em] text-ink backdrop-blur">Inside the new studio</p>
        </div>
        {/* Plaster jamb to sell the doorway */}
        <div className="pointer-events-none absolute right-0 top-0 h-[92%] w-[58%] translate-x-[10px] translate-y-[10px] rounded-[4px] border border-ink/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(235,227,214,0.5))] lg:w-[56%]" style={{ zIndex: -1 }} />
        {/* Easel in front */}
        <div className="absolute bottom-0 left-0 w-[74%] sm:w-[70%]">
          <Easel works={works} className="w-full" controls={false} glow={false} />
        </div>
      </div>
      <p className="mt-3 text-center text-[0.78rem] text-muted">Tap the canvas to turn it over. It turns on its own if you wait.</p>
    </div>
  );
}
