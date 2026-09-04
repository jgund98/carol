"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Work } from "@/lib/works";
import { dims, img } from "@/lib/catalog";

/**
 * A real canvas on a real easel.
 * Hover tilts the canvas in 3D, click (or tap) flips it to read the label on the back;
 * click again and it turns to the next painting. It also turns on its own when idle.
 */
export default function Easel({ works, autoplay = true, className = "", controls = true, glow = true }: { works: Work[]; autoplay?: boolean; className?: string; controls?: boolean; glow?: boolean }) {
  const [turns, setTurns] = useState(0); // each turn is 180°; even = a painting faces you
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const front = works[Math.floor(turns / 2) % works.length];
  const next = works[(Math.floor(turns / 2) + 1) % works.length];
  const showingBack = turns % 2 === 1;
  // While the back is showing, the front face already holds the NEXT painting so the
  // second half-turn reveals it seamlessly.
  const faceWork = showingBack ? next : front;
  const labelWork = front;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 18 });
  const flip = useSpring(0, { stiffness: 46, damping: 13, mass: 1.1 });
  const rotY = useTransform(() => ry.get() + flip.get());

  useEffect(() => {
    flip.set(turns * 180);
  }, [turns, flip]);

  // If the tab was hidden mid-turn the spring froze; land it exactly when we come back.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") flip.jump(turns * 180);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [turns, flip]);

  // The canvas turns on its own every few seconds. Any interaction just delays the next turn.
  const schedule = useCallback(
    (delay: number) => {
      if (!autoplay) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setTurns((n) => n + 1);
        schedule(3000);
      }, delay);
    },
    [autoplay],
  );
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    schedule(3000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [schedule]);
  const poke = useCallback(() => schedule(4500), [schedule]);

  const onMove = (e: React.PointerEvent) => {
    const r = sceneRef.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    poke();
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };
  const turn = () => {
    setTurns((n) => n + 1);
    poke();
  };

  // Aspect of the visible canvas, clamped so odd panoramas still read as a canvas.
  const ratio = Math.min(1.45, Math.max(0.68, faceWork.iw / faceWork.ih));
  const shade = faceWork.color;

  return (
    <div className={`relative ${className}`} style={{ containerType: "inline-size" }}>
      {/* Light on the wall */}
      {glow && <div className="pointer-events-none absolute inset-x-[-10%] top-[-12%] h-[80%] rounded-[50%] bg-[radial-gradient(50%_60%_at_50%_30%,rgba(255,250,236,0.95),rgba(255,250,236,0)_70%)]" />}

      <div
        ref={sceneRef}
        className="relative mx-auto aspect-[4/5] w-full max-w-[min(100%,560px)] select-none"
        style={{ perspective: "1400px" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {/* Walnut floor easel */}
        <WalnutEasel />

        {/* Canvas */}
        <motion.div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              turn();
            }
          }}
          aria-label={showingBack ? `Turn to the next painting, ${next.name}` : `Turn ${front.name} around to read its label`}
          onClick={turn}
          className="absolute bottom-[37%] left-1/2 block cursor-pointer outline-none [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-hibiscus/50"
          style={{
            width: `min(${ratio * 60}cqw, 78cqw)`,
            aspectRatio: `${ratio}`,
            x: "-50%",
            rotateX: rx,
            rotateY: rotY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Painting face */}
          <div className="absolute inset-0 overflow-hidden bg-linen [backface-visibility:hidden]" style={{ transform: "translateZ(14px)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={faceWork.slug} src={img(faceWork)} alt={`${faceWork.name} by Carol Calicchio`} className="h-full w-full object-cover" draggable={false} fetchPriority={turns === 0 ? "high" : "auto"} decoding="async" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_38%,rgba(0,0,0,0.05)_100%)]" />
          </div>
          {/* Gallery-wrap edges */}
          <div className="absolute left-0 top-0 h-full w-[28px] origin-left" style={{ transform: "rotateY(-90deg) translateX(-14px)", background: `linear-gradient(90deg, ${shade}, ${shade}cc)`, filter: "brightness(0.78)" }} />
          <div className="absolute right-0 top-0 h-full w-[28px] origin-right" style={{ transform: "rotateY(90deg) translateX(14px)", background: `linear-gradient(90deg, ${shade}cc, ${shade})`, filter: "brightness(0.7)" }} />
          <div className="absolute left-0 top-0 h-[28px] w-full origin-top" style={{ transform: "rotateX(90deg) translateY(-14px)", background: shade, filter: "brightness(1.05)" }} />
          <div className="absolute bottom-0 left-0 h-[28px] w-full origin-bottom" style={{ transform: "rotateX(-90deg) translateY(14px)", background: shade, filter: "brightness(0.55)" }} />
          {/* Back of the canvas */}
          <div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden p-[6%] text-left [backface-visibility:hidden]"
            style={{
              transform: "rotateY(180deg) translateZ(14px)",
              background:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 3px), linear-gradient(180deg,#e9dfcd,#dccfb8)",
            }}
          >
            {/* stretcher bars */}
            <div className="pointer-events-none absolute inset-[5%] border-[10px] border-[#c9b48f]/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]" />
            <div className="pointer-events-none absolute left-[5%] right-[5%] top-1/2 h-[10px] -translate-y-1/2 bg-[#c9b48f]/80" />
            <div className="relative z-10 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm">
              <p className="label text-[0.58rem] text-muted">Carol Calicchio</p>
              <p className="display mt-1 text-[clamp(1.05rem,4.5cqw,1.6rem)] leading-tight">{labelWork.name}</p>
              <p className="mt-1 text-[0.8rem] text-muted">
                {dims(labelWork) ? `${dims(labelWork)} · ` : ""}
                {labelWork.medium}
              </p>
            </div>
            <div className="relative z-10 flex h-[12%] items-center justify-between gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/sig-ink.png" alt="Signed, Carol Calicchio" width={2160} height={680} className="block h-auto w-[38%] opacity-70" draggable={false} />
              <p className="label whitespace-nowrap text-[0.55rem] leading-none text-ink/50">Delray Beach</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      {controls && (
      <div className="mt-2 flex items-center justify-center gap-4 whitespace-nowrap text-[0.78rem] text-muted">
        <button type="button" onClick={turn} className="inline-flex items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
          {showingBack ? "Next painting" : "Turn the canvas"}
        </button>
        <span aria-hidden>·</span>
        <span>{showingBack ? labelWork.name : faceWork.name}</span>
      </div>
      )}
    </div>
  );
}

function WalnutEasel() {
  // A slim walnut display easel: two front legs rising into an arched crown with a cut-out,
  // a rear leg, and a thin tray with brackets. Grain comes from a turbulence filter, so it is
  // real texture, not a gradient. Canvas rests on the tray at 63% of the scene height.
  return (
    <svg viewBox="0 0 400 500" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <filter id="walnut" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.5 0.012" numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="lum" />
          <feComponentTransfer in="lum" result="wood">
            <feFuncR type="table" tableValues="0.20 0.36 0.52 0.66" />
            <feFuncG type="table" tableValues="0.09 0.18 0.28 0.38" />
            <feFuncB type="table" tableValues="0.04 0.08 0.13 0.18" />
            <feFuncA type="table" tableValues="1 1" />
          </feComponentTransfer>
        </filter>
        <linearGradient id="edgeL" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="edgeT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <filter id="blur6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="blur2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" /></filter>
        <clipPath id="frame">
          {/* crown + two front legs as one piece */}
          <path d="M120 488 L182 66 C 186 44, 214 44, 218 66 L 280 488 L 268 488 L 209 84 C 207 74, 193 74, 191 84 L 132 488 Z" />
          {/* rear leg */}
          <path d="M197 62 L232 486 L242 486 L207 62 Z" />
          {/* tray */}
          <path d="M112 314 L288 314 L288 324 L112 324 Z" />
          <path d="M112 306 L288 306 L288 314 L112 314 Z" />
          {/* tray brackets */}
          <path d="M150 324 L162 324 L162 342 Z" />
          <path d="M250 324 L238 324 L238 342 Z" />
        </clipPath>
      </defs>

      {/* shadows: floor, feet, and the tray's cast on the legs */}
      <ellipse cx="200" cy="490" rx="150" ry="7" fill="rgba(18,23,43,0.22)" filter="url(#blur6)" />
      <ellipse cx="126" cy="489" rx="12" ry="2.5" fill="rgba(18,23,43,0.4)" filter="url(#blur2)" />
      <ellipse cx="274" cy="489" rx="12" ry="2.5" fill="rgba(18,23,43,0.4)" filter="url(#blur2)" />
      <ellipse cx="237" cy="487" rx="9" ry="2" fill="rgba(18,23,43,0.3)" filter="url(#blur2)" />

      {/* rear leg is a touch darker: paint it first, then the front frame over it */}
      <g clipPath="url(#frame)">
        <rect x="0" y="0" width="400" height="500" filter="url(#walnut)" />
      </g>
      {/* dim the rear leg */}
      <path d="M197 62 L232 486 L242 486 L207 62 Z" fill="#000" opacity="0.22" />
      {/* lighting on the front legs: lit left edge, shaded right edge */}
      <path d="M120 488 L182 66 C 186 44, 214 44, 218 66 L 280 488 L 268 488 L 209 84 C 207 74, 193 74, 191 84 L 132 488 Z" fill="url(#edgeL)" />
      {/* tray lighting: bright top face, dark front */}
      <path d="M112 306 L288 306 L288 314 L112 314 Z" fill="#fff" opacity="0.22" />
      <path d="M112 314 L288 314 L288 324 L112 324 Z" fill="url(#edgeT)" />
      <path d="M112 324 L288 324 L288 330 L112 330 Z" fill="#000" opacity="0.18" filter="url(#blur2)" />
      {/* brass screws on the tray */}
      <circle cx="122" cy="319" r="1.6" fill="#d9b25c" />
      <circle cx="278" cy="319" r="1.6" fill="#d9b25c" />
      {/* the canvas's shadow on the tray */}
      <ellipse cx="200" cy="308" rx="100" ry="3" fill="rgba(18,23,43,0.3)" filter="url(#blur2)" />
    </svg>
  );
}
