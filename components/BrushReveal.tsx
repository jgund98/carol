"use client";
import { useEffect, useId, useRef } from "react";

/**
 * The image is painted in with six loaded brushstrokes when it scrolls into view.
 * Uses an SVG mask of thick round-capped paths whose dashoffset animates in CSS.
 */
export default function BrushReveal({ src, alt, className = "", sizes, priority = false, fit = "cover" }: { src: string; alt: string; className?: string; sizes?: string; priority?: boolean; fit?: "cover" | "contain" }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // Strokes drawn across a 100x100 box; stroke widths overlap to cover the plane.
  const strokes = [
    "M-10 8 C 30 2, 70 14, 112 6",
    "M112 26 C 70 20, 30 34, -12 24",
    "M-10 44 C 40 36, 60 52, 112 42",
    "M112 62 C 70 56, 30 70, -12 60",
    "M-10 80 C 40 72, 60 88, 112 78",
    "M112 98 C 70 92, 30 106, -12 96",
  ];
  return (
    <svg ref={ref} viewBox="0 0 100 100" preserveAspectRatio="none" className={`brush-mask block ${className}`} aria-label={alt} role="img">
      <defs>
        <mask id={`m-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          {strokes.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="white" strokeWidth="21" strokeLinecap="round" pathLength={1} style={{ animationDelay: `${i * 140}ms` }} />
          ))}
        </mask>
      </defs>
      <image href={src} x={fit === "contain" ? 8 : 0} y={fit === "contain" ? 8 : 0} width={fit === "contain" ? 84 : 100} height={fit === "contain" ? 84 : 100} preserveAspectRatio={fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"} mask={`url(#m-${id})`} {...(priority ? {} : { loading: "lazy" as never })} data-sizes={sizes} />
    </svg>
  );
}
