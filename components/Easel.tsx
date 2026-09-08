"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
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

  const flip = useSpring(0, { stiffness: 46, damping: 13, mass: 1.1 });

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

  const onMove = () => poke();
  const onLeave = () => {};
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
        <BrassEasel />

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
          className="absolute bottom-[37.4%] left-1/2 block cursor-pointer outline-none [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-hibiscus/50"
          style={{
            width: `min(${ratio * 66}cqw, 80cqw)`,
            aspectRatio: `${ratio}`,
            x: "-50%",
            rotateY: flip,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Painting face */}
          <div className="absolute inset-0 overflow-hidden bg-linen shadow-[0_44px_70px_-34px_rgba(18,23,43,0.55),0_8px_18px_-10px_rgba(18,23,43,0.35)] [backface-visibility:hidden]" style={{ transform: "translateZ(14px)" }}>
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
              <p className="mt-1 text-[0.7rem] leading-snug text-muted sm:text-[0.8rem]">
                {dims(labelWork) ? `${dims(labelWork)} · ` : ""}
                {labelWork.medium}
              </p>
            </div>
            <div className="relative z-10 flex h-[12%] items-center justify-between gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/sig-ink.png" alt="Signed, Carol Calicchio" width={2160} height={680} className="block h-auto w-[38%] opacity-70" draggable={false} />
              <p className="label hidden text-[0.55rem] leading-none text-ink/50 sm:block" style={{ whiteSpace: "nowrap" }}>Delray Beach</p>
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

/**
 * A slim brass display easel, the kind a gallery stands a canvas on for an opening.
 * Tubular legs shaded across their width with user-space gradients (so the highlight runs
 * along each leg), a crown plate and finial, a narrow tray with a lip, a lower rail, dark feet.
 */
function BrassEasel() {
  // Leg centre lines: left (172,44)->(112,566), right (228,44)->(288,566), back (200,52)->(200,580).
  // Each gradient vector is perpendicular to its leg so the shading reads as a round tube.
  return (
    <svg viewBox="0 0 400 600" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="bz-l" gradientUnits="userSpaceOnUse" x1="137.5" y1="304.5" x2="146.5" y2="305.5">
          <stop offset="0" stopColor="#5e4218" /><stop offset="0.28" stopColor="#c9a25f" /><stop offset="0.48" stopColor="#f4e6c6" /><stop offset="0.7" stopColor="#c19a55" /><stop offset="1" stopColor="#4f3612" />
        </linearGradient>
        <linearGradient id="bz-r" gradientUnits="userSpaceOnUse" x1="223.5" y1="305.5" x2="232.5" y2="304.5">
          <stop offset="0" stopColor="#5e4218" /><stop offset="0.28" stopColor="#c9a25f" /><stop offset="0.48" stopColor="#f4e6c6" /><stop offset="0.7" stopColor="#c19a55" /><stop offset="1" stopColor="#4f3612" />
        </linearGradient>
        <linearGradient id="bz-b" gradientUnits="userSpaceOnUse" x1="196" y1="0" x2="204" y2="0">
          <stop offset="0" stopColor="#3f2c0f" /><stop offset="0.45" stopColor="#a8864a" /><stop offset="0.6" stopColor="#c7a664" /><stop offset="1" stopColor="#3a280d" />
        </linearGradient>
        <linearGradient id="bz-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1e1bd" /><stop offset="0.4" stopColor="#c9a25f" /><stop offset="1" stopColor="#6a4a1c" />
        </linearGradient>
        <linearGradient id="bz-lip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a6a30" /><stop offset="1" stopColor="#3f2c0f" />
        </linearGradient>
        <radialGradient id="bz-knob" cx="0.38" cy="0.32" r="0.7">
          <stop offset="0" stopColor="#fbf1d8" /><stop offset="0.5" stopColor="#c9a25f" /><stop offset="1" stopColor="#4a3210" />
        </radialGradient>
        <filter id="bz-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id="bz-soft2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" /></filter>
      </defs>

      {/* floor shadow */}
      <ellipse cx="200" cy="582" rx="150" ry="9" fill="rgba(18,23,43,0.22)" filter="url(#bz-soft)" />
      <ellipse cx="112" cy="572" rx="14" ry="4" fill="rgba(18,23,43,0.35)" filter="url(#bz-soft2)" />
      <ellipse cx="288" cy="572" rx="14" ry="4" fill="rgba(18,23,43,0.35)" filter="url(#bz-soft2)" />
      <ellipse cx="200" cy="584" rx="12" ry="3.5" fill="rgba(18,23,43,0.3)" filter="url(#bz-soft2)" />

      {/* back leg, hinged at the crown */}
      <path d="M200 52 L200 580" stroke="#2a1d08" strokeWidth="9.5" strokeLinecap="round" opacity="0.6" />
      <path d="M200 52 L200 580" stroke="url(#bz-b)" strokeWidth="8" strokeLinecap="round" />

      {/* front legs */}
      <path d="M172 44 L112 566" stroke="#2a1d08" strokeWidth="10.5" strokeLinecap="round" opacity="0.55" />
      <path d="M172 44 L112 566" stroke="url(#bz-l)" strokeWidth="9" strokeLinecap="round" />
      <path d="M228 44 L288 566" stroke="#2a1d08" strokeWidth="10.5" strokeLinecap="round" opacity="0.55" />
      <path d="M228 44 L288 566" stroke="url(#bz-r)" strokeWidth="9" strokeLinecap="round" />

      {/* lower rail between the front legs */}
      <rect x="121" y="466" width="158" height="6" rx="3" fill="url(#bz-h)" />
      <rect x="121" y="471" width="158" height="1.5" fill="#3a280d" opacity="0.5" />

      {/* tray: top face, front lip, brackets */}
      <rect x="94" y="370" width="212" height="9" rx="2" fill="url(#bz-h)" />
      <rect x="94" y="379" width="212" height="7" rx="1.5" fill="url(#bz-lip)" />
      <path d="M118 386 L128 386 L118 402 Z" fill="#4f3612" />
      <path d="M282 386 L272 386 L282 402 Z" fill="#4f3612" />
      <rect x="94" y="386" width="212" height="6" fill="rgba(18,23,43,0.25)" filter="url(#bz-soft2)" />

      {/* crown plate and finial */}
      <rect x="181" y="30" width="38" height="26" rx="6" fill="url(#bz-h)" />
      <rect x="181" y="52" width="38" height="4" rx="2" fill="#3a280d" opacity="0.5" />
      <circle cx="200" cy="24" r="8" fill="url(#bz-knob)" />

      {/* feet */}
      <rect x="104" y="560" width="16" height="12" rx="4" fill="#1d1a16" />
      <rect x="280" y="560" width="16" height="12" rx="4" fill="#1d1a16" />
      <rect x="192" y="574" width="16" height="12" rx="4" fill="#1d1a16" />
    </svg>
  );
}
