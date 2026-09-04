"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** A word with a hand-pulled brush underline that draws itself when it scrolls into view. */
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
      <svg viewBox="0 0 200 22" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.14em] left-[-2%] h-[0.32em] w-[104%]" aria-hidden>
        <path d="M4 14 C 40 4, 80 20, 120 10 S 180 4, 196 12" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" pathLength={1} />
      </svg>
    </span>
  );
}
