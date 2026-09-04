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
        {/* Easel */}
        <EaselFrame />

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
          className="absolute bottom-[21%] left-1/2 block cursor-pointer outline-none [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-hibiscus/50"
          style={{
            width: `min(${ratio * 78}cqw, 92cqw)`,
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

function EaselFrame() {
  // A studio lyre easel: two splayed front legs, a rear strut, a central mast with a sliding
  // clamp, and a tray the canvas actually rests on. The canvas sits on the tray at ~79% height.
  return (
    <svg viewBox="0 0 400 500" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="wd" x1="0" x2="1">
          <stop offset="0" stopColor="#d9ae7a" />
          <stop offset="0.18" stopColor="#b98a58" />
          <stop offset="0.55" stopColor="#8c6238" />
          <stop offset="0.85" stopColor="#6d4a2a" />
          <stop offset="1" stopColor="#4e341d" />
        </linearGradient>
        <linearGradient id="wdBack" x1="0" x2="1">
          <stop offset="0" stopColor="#7d5836" />
          <stop offset="1" stopColor="#4a3119" />
        </linearGradient>
        <linearGradient id="trayTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2bb86" />
          <stop offset="1" stopColor="#c4955f" />
        </linearGradient>
        <linearGradient id="trayFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f6539" />
          <stop offset="1" stopColor="#5a3c20" />
        </linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3dc9a" />
          <stop offset="0.5" stopColor="#b8893a" />
          <stop offset="1" stopColor="#7a5a1f" />
        </linearGradient>
        <pattern id="grain" width="7" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(84)">
          <path d="M0 0h7" stroke="#3b2612" strokeWidth="0.6" opacity="0.35" />
          <path d="M0 3h7" stroke="#f0d4a8" strokeWidth="0.4" opacity="0.35" />
        </pattern>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="soft2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* floor shadow and the feet's contact shadows */}
      <ellipse cx="200" cy="488" rx="165" ry="9" fill="rgba(18,23,43,0.22)" filter="url(#soft)" />
      <ellipse cx="94" cy="486" rx="16" ry="3" fill="rgba(18,23,43,0.35)" filter="url(#soft2)" />
      <ellipse cx="306" cy="486" rx="16" ry="3" fill="rgba(18,23,43,0.35)" filter="url(#soft2)" />
      <ellipse cx="236" cy="482" rx="12" ry="2.5" fill="rgba(18,23,43,0.25)" filter="url(#soft2)" />

      {/* rear strut, hinged at the top block */}
      <path d="M197 58 L214 476 L226 476 L207 58 Z" fill="url(#wdBack)" />
      <path d="M197 58 L214 476 L226 476 L207 58 Z" fill="url(#grain)" opacity="0.5" />

      {/* central mast */}
      <path d="M192 28 L192 420 L208 420 L208 28 Z" fill="url(#wd)" />
      <path d="M192 28 L192 420 L208 420 L208 28 Z" fill="url(#grain)" opacity="0.6" />
      <path d="M192 28 L194 28 L194 420 L192 420 Z" fill="#f2d7ad" opacity="0.5" />

      {/* front legs, turned slightly: light left edge, dark right edge */}
      <path d="M186 36 L84 486 L102 486 L200 40 Z" fill="url(#wd)" />
      <path d="M186 36 L84 486 L102 486 L200 40 Z" fill="url(#grain)" opacity="0.55" />
      <path d="M186 36 L84 486 L88 486 L189 37 Z" fill="#f2d7ad" opacity="0.55" />
      <path d="M214 36 L316 486 L298 486 L200 40 Z" fill="url(#wd)" />
      <path d="M214 36 L316 486 L298 486 L200 40 Z" fill="url(#grain)" opacity="0.55" />
      <path d="M312 486 L316 486 L214 36 L211 37 Z" fill="#3b2612" opacity="0.45" />

      {/* top block joining the legs, with a brass hinge */}
      <path d="M178 26 L222 26 L226 48 L174 48 Z" fill="url(#wd)" />
      <path d="M178 26 L222 26 L224 30 L176 30 Z" fill="#f2d7ad" opacity="0.5" />
      <rect x="192" y="34" width="16" height="7" rx="1" fill="url(#brass)" />
      <circle cx="196" cy="37.5" r="1.2" fill="#3b2612" opacity="0.6" />
      <circle cx="204" cy="37.5" r="1.2" fill="#3b2612" opacity="0.6" />

      {/* sliding clamp on the mast, above the canvas */}
      <path d="M181 60 L219 60 L219 80 L181 80 Z" fill="url(#wd)" />
      <path d="M181 60 L219 60 L219 63 L181 63 Z" fill="#f2d7ad" opacity="0.5" />
      <path d="M186 80 L214 80 L214 86 L186 86 Z" fill="#4e341d" />
      {/* brass wing nut */}
      <path d="M200 70 m-9 0 a9 4 0 1 0 18 0 a9 4 0 1 0 -18 0" fill="url(#brass)" />
      <circle cx="200" cy="70" r="3" fill="url(#brass)" stroke="#5a3c14" strokeWidth="0.6" />

      {/* cross brace behind the canvas */}
      <path d="M130 298 L270 298 L272 308 L128 308 Z" fill="url(#wdBack)" />

      {/* canvas contact shadow on the tray and mast */}
      <ellipse cx="200" cy="396" rx="120" ry="5" fill="rgba(18,23,43,0.35)" filter="url(#soft2)" />

      {/* tray: top face, front face, lip, brackets */}
      <path d="M110 392 L290 392 L296 402 L104 402 Z" fill="url(#trayTop)" />
      <path d="M104 402 L296 402 L296 416 L104 416 Z" fill="url(#trayFront)" />
      <path d="M104 402 L296 402 L296 404 L104 404 Z" fill="#f2d7ad" opacity="0.45" />
      <path d="M110 384 L290 384 L290 392 L110 392 Z" fill="#c9985f" />
      <path d="M110 384 L290 384 L290 386 L110 386 Z" fill="#f6e2bf" opacity="0.7" />
      {/* support brackets under the tray */}
      <path d="M126 416 L146 416 L146 436 Z" fill="url(#trayFront)" />
      <path d="M274 416 L254 416 L254 436 Z" fill="url(#trayFront)" />
      {/* brass screws on the tray ends */}
      <circle cx="112" cy="409" r="2.2" fill="url(#brass)" />
      <circle cx="288" cy="409" r="2.2" fill="url(#brass)" />

      {/* feet caps */}
      <path d="M84 480 L102 480 L103 486 L83 486 Z" fill="#3b2612" />
      <path d="M298 480 L316 480 L317 486 L297 486 Z" fill="#3b2612" />
    </svg>
  );
}
