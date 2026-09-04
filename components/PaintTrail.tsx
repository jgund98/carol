"use client";
import { useEffect, useRef } from "react";

/**
 * Over artwork, the pointer leaves soft daubs of that painting's color that fade like wet paint.
 * Fine pointers only; a single canvas, capped at 60 daubs.
 */
export default function PaintTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    type D = { x: number; y: number; r: number; a: number; col: string; vx: number; vy: number; rot: number };
    const daubs: D[] = [];
    let raf = 0, last = 0, w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.("[data-cursor-color]") as HTMLElement | null;
      if (!t) return;
      const now = performance.now();
      if (now - last < 28) return;
      last = now;
      const col = t.dataset.cursorColor || "#e8397f";
      daubs.push({ x: e.clientX, y: e.clientY, r: 6 + Math.random() * 12, a: 0.55, col, vx: (Math.random() - 0.5) * 0.4, vy: 0.25 + Math.random() * 0.4, rot: Math.random() * Math.PI });
      if (daubs.length > 60) daubs.shift();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = daubs.length - 1; i >= 0; i--) {
        const d = daubs[i];
        d.a -= 0.009;
        d.y += d.vy;
        d.x += d.vx;
        d.r += 0.12;
        if (d.a <= 0) {
          daubs.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = d.a;
        ctx.fillStyle = d.col;
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, d.r * 1.35, d.r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = daubs.length ? requestAnimationFrame(loop) : 0;
    };
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[190] hidden md:block" aria-hidden />;
}
