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
      <svg viewBox="0 0 200 30" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.22em] left-[-3%] h-[0.42em] w-[106%] overflow-visible" aria-hidden>
        <defs>
          <filter id={`sm-${id}`} x="-5%" y="-40%" width="110%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.35" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g className="smear" filter={`url(#sm-${id})`}>
          {/* the loaded stroke: thick in the middle, tapered ends, slightly rising */}
          <path d="M2 17 C 30 6, 70 22, 100 12 C 130 3, 165 20, 198 10 L 197 15 C 168 25, 130 9, 100 19 C 70 28, 30 12, 4 22 Z" fill={color} />
          {/* a second, thinner drag of the brush */}
          <path d="M8 24 C 50 19, 90 27, 140 21 C 165 18, 185 21, 194 20 L 194 22 C 180 25, 160 22, 140 25 C 90 31, 50 23, 9 27 Z" fill={color} opacity="0.55" />
        </g>
      </svg>
    </span>
  );
}
