"use client";
import { useId, useRef } from "react";
import { useParallax } from "@/lib/parallax";
import { img } from "@/lib/catalog";
import { bySlug } from "@/lib/catalog";

const SHAPES = [
  "M52 3C70 2 88 14 94 32C100 50 96 72 82 85C68 98 44 100 28 90C12 80 2 62 4 44C6 26 20 6 52 3Z",
  "M40 6C58 0 80 8 90 24C100 40 98 62 88 78C78 94 56 100 38 94C20 88 6 74 4 56C2 38 10 12 40 6Z",
  "M46 2C66 2 84 10 92 28C100 46 98 68 84 82C70 96 48 100 30 92C12 84 0 66 4 46C8 26 26 2 46 2Z",
  "M56 4C74 8 90 22 94 40C98 58 92 80 76 90C60 100 38 98 22 86C6 74 0 52 8 34C16 16 38 0 56 4Z",
];

type Props = {
  /** work slug whose paint fills the blob */
  of: string;
  shape?: 0 | 1 | 2 | 3;
  /** focal point of the crop, 0..1 */
  focus?: [number, number];
  /** css size, e.g. "22vw" or "260px" */
  size?: string;
  className?: string;
  speed?: number;
  rotate?: number;
  base?: number;
  opacity?: number;
};

/**
 * A daub of Carol's actual paint: a crop of one of her canvases clipped to an organic shape,
 * edges roughened with turbulence so it reads as a brush-loaded stroke, drifting on scroll.
 */
export default function PaintBlob({ of, shape = 0, focus = [0.5, 0.5], size = "240px", className = "", speed = 0.4, rotate = 0.5, base = 0, opacity = 1 }: Props) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref, speed, rotate, base);
  const w = bySlug(of);
  if (!w) return null;
  const S = 175;
  const x = -(S - 100) * focus[0];
  const y = -(S - 100) * focus[1];
  return (
    <div ref={ref} className={`paint-blob pointer-events-none absolute will-change-transform ${className}`} style={{ width: size, height: size, opacity, transform: `rotate(${base}deg)` }} aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible drop-shadow-[0_18px_30px_rgba(18,23,43,0.18)]">
        <defs>
          <filter id={`rough-${id}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={shape * 7 + 3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <clipPath id={`clip-${id}`}>
            <path d={SHAPES[shape]} />
          </clipPath>
        </defs>
        <g filter={`url(#rough-${id})`}>
          <g clipPath={`url(#clip-${id})`}>
            <image href={img(w, "sm")} x={x} y={y} width={S} height={S} preserveAspectRatio="xMidYMid slice" />
            {/* wet highlight */}
            <path d={SHAPES[shape]} fill="url(#gloss)" opacity="0.35" />
          </g>
        </g>
        <defs>
          <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
