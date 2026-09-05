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
        {/* A real wooden easel, photographed (CC0), paint still on the tray */}
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[0.5%] h-[5%] rounded-[50%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(18,23,43,0.28),rgba(18,23,43,0)_70%)] blur-[6px]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/easel.png" alt="" aria-hidden width={900} height={1503} className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom" draggable={false} />

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
          className="absolute bottom-[27.5%] left-1/2 block cursor-pointer outline-none [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-hibiscus/50"
          style={{
            width: `min(${ratio * 72}cqw, 84cqw)`,
            aspectRatio: `${ratio}`,
            x: "-50%",
            rotate: -3.6,
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
