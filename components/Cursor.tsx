"use client";
import { useEffect, useRef } from "react";

/** A small ink dot that swells into a colored "View" disc over artwork (data-cursor). Pointer devices only. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!on) {
        on = true;
        el.classList.add("on");
        x = tx;
        y = ty;
      }
      const t = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (t) {
        el.classList.add("big");
        el.dataset.label = t.dataset.cursor || "View";
        el.style.setProperty("--cursor-color", t.dataset.cursorColor || "");
      } else el.classList.remove("big");
    };
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const leave = () => {
      on = false;
      el.classList.remove("on");
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="cursor-dot hidden md:block" aria-hidden />;
}
