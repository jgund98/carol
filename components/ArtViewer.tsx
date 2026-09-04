"use client";
import { useRef, useState } from "react";
import type { Work } from "@/lib/works";
import { img } from "@/lib/catalog";

/**
 * Product-page viewer: the canvas tilts with your pointer like it does on the easel,
 * and a magnifier lets collectors read the brushwork. Touch: pinch-free tap to zoom.
 */
export default function ArtViewer({ work }: { work: Work }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setPos({ x: px * 100, y: py * 100 });
    if (!zoom) setTilt({ x: (0.5 - py) * 8, y: (px - 0.5) * 10 });
  };
  const leave = () => setTilt({ x: 0, y: 0 });

  return (
    <div style={{ perspective: "1600px" }}>
      <div
        ref={ref}
        className="wrap-edge relative mx-auto max-h-[80vh] overflow-hidden bg-linen transition-transform duration-300 ease-out will-change-transform"
        style={{ aspectRatio: `${work.iw} / ${work.ih}`, transform: zoom ? "none" : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, cursor: zoom ? "zoom-out" : "zoom-in" }}
        onPointerMove={move}
        onPointerLeave={leave}
        onClick={() => setZoom((z) => !z)}
        role="button"
        aria-label={zoom ? "Zoom out" : "Zoom in to the brushwork"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img(work)}
          alt={`${work.name} by Carol Calicchio`}
          className="h-full w-full object-cover transition-transform duration-300"
          style={zoom ? { transform: "scale(2.4)", transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.14),rgba(255,255,255,0)_40%)]" />
      </div>
      <p className="mt-3 text-center text-xs text-muted">{zoom ? "Move to explore the brushwork · tap to zoom out" : "Tap to zoom into the paint"}</p>
    </div>
  );
}
