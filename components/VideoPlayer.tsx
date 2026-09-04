"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string; // name inside /video, without extension
  className?: string;
  sound?: boolean; // show tap-for-sound control
  cover?: boolean;
  priority?: boolean;
  caption?: string;
};

/** Muted autoplay loop that only plays while on screen. Tap for sound when allowed. */
export default function VideoPlayer({ src, className = "", sound = false, cover = true, priority = false, caption }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current!;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) v.play().then(() => setPlaying(true)).catch(() => {});
          else {
            v.pause();
            setPlaying(false);
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`group relative overflow-hidden bg-ink ${className}`}>
      <video
        ref={ref}
        src={`/video/${src}.mp4`}
        poster={`/video/${src}.jpg`}
        muted={muted}
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        className={`h-full w-full ${cover ? "object-cover" : "object-contain"}`}
        onClick={() => {
          const v = ref.current!;
          if (sound) setMuted((m) => !m);
          else if (v.paused) v.play();
          else v.pause();
        }}
      />
      {sound && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="absolute bottom-4 right-4 inline-flex h-10 items-center gap-2 rounded-full bg-white/90 px-4 text-xs font-semibold text-ink shadow-lg backdrop-blur transition-transform hover:scale-105"
          aria-label={muted ? "Turn sound on" : "Mute"}
        >
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="m23 9-6 6M17 9l6 6" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
          )}
          {muted ? "Sound" : "Mute"}
        </button>
      )}
      {caption && <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/55 px-3 py-1 text-[0.7rem] font-semibold text-white backdrop-blur">{caption}</p>}
      {!playing && <div className="pointer-events-none absolute inset-0 grid place-items-center"><span className="grid h-14 w-14 place-items-center rounded-full bg-white/85 text-ink"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span></div>}
    </div>
  );
}
