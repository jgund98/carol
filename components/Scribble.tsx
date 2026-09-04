"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";

/** A word with a loaded-brush smear of paint beneath it, wiped in from the left when it scrolls into view. */
export default function Scribble({ children, color = "#e8397f", className = "" }: { children: ReactNode; color?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId().replace(/:/g, "");
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
      <svg viewBox="0 0 400 60" className="pointer-events-none absolute -bottom-[0.34em] left-[-3%] w-[106%] overflow-visible" style={{ aspectRatio: "400 / 60", transform: "rotate(-1.5deg)" }} aria-hidden>
        <defs>
          <mask id={`bm-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="60">
            {/* the loaded stroke: fat rounded head on the left, ragged body, dry tail on the right */}
            <path
              d="M8 30 C 4 18, 16 10, 30 12 C 48 6, 66 16, 88 10 C 112 4, 134 14, 158 9 C 184 4, 206 15, 232 10 C 258 5, 282 14, 308 9 C 332 5, 356 12, 380 9 C 390 8, 397 12, 398 17 C 396 24, 386 28, 372 31 C 348 36, 322 30, 296 36 C 268 42, 244 34, 218 41 C 190 48, 164 40, 138 46 C 112 52, 88 44, 64 49 C 44 53, 24 50, 14 44 C 8 40, 6 35, 8 30 Z"
              fill="white"
            />
            {/* bristle tails trailing off the end */}
            <path d="M330 8 C 352 6, 374 5, 399 4 L 399 7 C 374 8, 352 10, 330 12 Z" fill="white" />
            <path d="M338 32 C 360 31, 380 28, 399 24 L 399 27 C 380 31, 360 34, 338 36 Z" fill="white" />
            <path d="M320 38 C 340 39, 360 37, 384 33 L 384 35 C 360 39.5, 340 41.5, 320 41 Z" fill="white" />
            {/* dry-brush gaps where the bristles skipped */}
            <path d="M150 44 C 190 40, 230 43, 270 38 L 270 40 C 230 45, 190 42, 150 46 Z" fill="black" />
            <path d="M250 14 C 280 11, 300 13, 330 11 L 330 12.5 C 300 14.5, 280 12.5, 250 15.5 Z" fill="black" />
            <path d="M60 18 C 90 15, 110 17, 130 15 L 130 16.5 C 110 18.5, 90 16.5, 60 19.5 Z" fill="black" opacity="0.8" />
          </mask>
        </defs>
        <g className="smear" mask={`url(#bm-${id})`}>
          <rect x="0" y="0" width="400" height="60" fill={color} />
          {/* impasto: a lit ridge along the top of the stroke, shadow along the bottom */}
          <path d="M14 20 C 60 12, 120 20, 180 14 C 240 8, 300 16, 380 10 L 380 13 C 300 20, 240 12, 180 18 C 120 24, 60 16, 14 24 Z" fill="#fff" opacity="0.28" />
          <path d="M20 40 C 70 46, 130 38, 200 44 C 260 49, 320 40, 372 30 L 372 33 C 320 44, 260 53, 200 48 C 130 42, 70 50, 20 44 Z" fill="#000" opacity="0.16" />
          <path d="M40 30 C 100 26, 160 34, 220 28 C 280 22, 330 30, 370 24 L 370 26 C 330 32, 280 24, 220 30 C 160 36, 100 28, 40 32 Z" fill="#000" opacity="0.08" />
        </g>
      </svg>
    </span>
  );
}
