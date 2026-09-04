"use client";
import { useEffect, type RefObject } from "react";

/** One shared rAF loop drives every parallax element on the page (manual, no framer scroll hooks). */
type Entry = { el: HTMLElement; speed: number; rot: number; base: number };
const entries = new Set<Entry>();
let raf = 0;
let running = false;

function tick() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  entries.forEach((e) => {
    const r = e.el.getBoundingClientRect();
    // distance of the element's centre from the viewport centre, in viewport units
    const d = (r.top + r.height / 2 - vh / 2) / vh;
    e.el.style.transform = `translate3d(0, ${(-d * e.speed * 120).toFixed(1)}px, 0) rotate(${(e.base + d * e.rot * 18).toFixed(2)}deg)`;
  });
  raf = requestAnimationFrame(tick);
  void y;
}

export function useParallax(ref: RefObject<HTMLElement | null>, speed = 0.4, rot = 0.5, base = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const e: Entry = { el, speed, rot, base };
    entries.add(e);
    if (!running) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
    return () => {
      entries.delete(e);
      if (entries.size === 0) {
        cancelAnimationFrame(raf);
        running = false;
      }
    };
  }, [ref, speed, rot, base]);
}
