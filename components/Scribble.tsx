"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** A word with a loaded-brush smear of paint beneath it, wiped in from the left when it scrolls into view. */
export default function Scribble({ children, color = "#e8397f", className = "" }: { children: ReactNode; color?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className={`scribble relative inline-block ${className}`}>
      {children}
      <svg viewBox="0 0 400 44" className="pointer-events-none absolute -bottom-[0.3em] left-[-2%] w-[104%] overflow-visible" style={{ aspectRatio: "400 / 44", transform: "rotate(-1.2deg)" }} aria-hidden>
        <g className="smear">
          {/* the loaded stroke: thin entry, full body, tapered flick */}
          <path
            d="M4 27 C 40 18, 90 30, 150 22 C 210 14, 270 28, 330 18 C 355 14, 380 16, 396 12 L 394 19 C 378 22, 356 22, 332 26 C 272 36, 212 22, 152 31 C 92 39, 42 28, 6 33 Z"
            fill={color}
          />
          {/* dry-brush bristles trailing out of the stroke */}
          <path d="M300 34 C 330 33, 360 30, 392 26 L 392 28.5 C 360 32.5, 330 35.5, 300 36.5 Z" fill={color} opacity="0.8" />
          <path d="M280 12 C 320 9, 350 9, 388 8 L 388 10 C 350 11.5, 320 12.5, 280 14.5 Z" fill={color} opacity="0.7" />
          <path d="M20 36 C 60 33, 100 37, 140 34 L 140 36 C 100 39, 60 35.5, 20 38 Z" fill={color} opacity="0.55" />
          {/* a lighter second pass where the brush doubled back */}
          <path d="M60 24 C 120 19, 180 27, 250 21 L 250 24 C 180 30, 120 22, 60 27 Z" fill="#fff" opacity="0.18" />
        </g>
      </svg>
    </span>
  );
}
