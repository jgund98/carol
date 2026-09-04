"use client";
import { useEffect, useRef } from "react";
import type { Work } from "@/lib/works";
import { img } from "@/lib/catalog";

/**
 * "Natural light is a limitless spectrum of color."
 * The painting hangs in a dim gallery; your pointer is the light. Two real image files
 * (dim + full color) and a CSS radial mask, so it works on every mobile browser.
 * touch-action: pan-y keeps the page scrollable on phones.
 */
export default function LightReveal({ work, className = "" }: { work: Work; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const color = colorRef.current!;
    let x = 0.5, y = 0.35, tx = 0.5, ty = 0.35, r = 0, tr = 0.16, raf = 0, active = false, t0 = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      const rad = Math.max(w, h) * r;
      const mask = `radial-gradient(circle ${rad.toFixed(0)}px at ${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 45%, rgba(0,0,0,0) 100%)`;
      color.style.maskImage = mask;
      color.style.webkitMaskImage = mask;
    };
    const loop = (now: number) => {
      if (!active) {
        // A slow sweep of light when nobody is pointing at it.
        const t = (now - t0) / 1000;
        tx = 0.5 + Math.sin(t * 0.45) * 0.32;
        ty = 0.42 + Math.cos(t * 0.31) * 0.22;
        tr = 0.2;
      }
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      r += (tr - r) * 0.08;
      paint();
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      tx = (e.clientX - b.left) / b.width;
      ty = (e.clientY - b.top) / b.height;
      tr = 0.34;
      active = true;
    };
    const leave = () => {
      active = false;
      t0 = performance.now() - 1000;
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerdown", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);
    if (reduced) {
      r = 0.9;
      paint();
    } else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointercancel", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-[#0b1226] ${className}`}
      style={{ touchAction: "pan-y", aspectRatio: `${work.iw} / ${work.ih}` }}
      data-cursor="Light"
      data-cursor-color="#e5c877"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/fx/${work.file}-dim.jpg`} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div ref={colorRef} className="absolute inset-0 will-change-[mask-image]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(work)} alt={`${work.name} by Carol Calicchio`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      </div>
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.55)]" />
    </div>
  );
}
