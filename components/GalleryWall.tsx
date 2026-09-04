"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Work } from "@/lib/works";
import { dims, img, inches } from "@/lib/catalog";
import { money } from "@/lib/site";

/**
 * Walk the wall. Paintings hang to true relative scale on one long gallery wall.
 * Desktop: the wall glides sideways as you scroll (manual rAF, no framer scroll hooks).
 * Touch: a native horizontal rail, nothing hijacked.
 */
export default function GalleryWall({ works }: { works: Work[] }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current!, t = track.current!;
    const fine = window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024;
    if (!fine) return;
    let raf = 0, cur = 0, target = 0;
    const tick = () => {
      cur += (target - cur) * 0.1;
      t.style.transform = `translate3d(${-cur}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const r = o.getBoundingClientRect();
      const total = o.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const max = t.scrollWidth - window.innerWidth;
      target = p * max;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    raf = requestAnimationFrame(tick);
    o.classList.add("wall-pinned");
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const PX_PER_IN = 6.2; // 60 in. canvas ≈ 372px on the wall

  return (
    <div ref={outer} className="wall relative lg:h-[320vh]">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        <div className="wrap pt-6 lg:absolute lg:left-0 lg:right-0 lg:top-[calc(var(--header-h)+8px)] lg:z-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="display-light text-[1.05rem] italic text-ink/60">Walk the wall</p>
              <h2 className="display mt-2 text-[clamp(2rem,4.2vw,3.6rem)]">Hung to scale, the way they hang at home.</h2>
            </div>
            <p className="hidden max-w-xs text-sm text-muted lg:block">Keep scrolling and the wall glides past. Every canvas is drawn in true proportion to its neighbors.</p>
            <p className="text-sm text-muted lg:hidden">Swipe along the wall.</p>
          </div>
        </div>

        <div className="rail relative mt-6 lg:mt-0 lg:h-full lg:overflow-visible">
          <div ref={track} className="flex h-[440px] items-end gap-[clamp(28px,4vw,72px)] px-[clamp(1.1rem,4vw,3.5rem)] pb-16 pt-10 will-change-transform lg:h-full lg:pb-24 lg:pt-[190px]">
            {works.map((w, i) => {
              const { w: wi, h: hi } = inches(w);
              const scale = PX_PER_IN;
              return (
                <Link
                  key={w.slug}
                  href={`/shop/${w.slug}`}
                  className="group relative shrink-0 snap-center"
                  style={{ width: wi * scale, height: hi * scale }}
                  data-cursor={w.sold ? "Sold" : "View"}
                  data-cursor-color={w.color}
                >
                  <div className="wrap-edge h-full w-full overflow-hidden bg-linen transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(w, i < 4 ? "full" : "sm")} alt={`${w.name} by Carol Calicchio`} className="h-full w-full object-cover" loading={i < 3 ? "eager" : "lazy"} draggable={false} />
                  </div>
                  <div className="absolute -bottom-12 left-0 w-max max-w-[260px] text-left">
                    <p className="display text-[1.05rem] leading-tight">{w.name}</p>
                    <p className="text-[0.72rem] text-muted">
                      {dims(w)} · {w.sold ? "Sold" : money(w.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
            <div className="shrink-0 pl-6">
              <Link href="/shop" className="btn btn-ink">
                See every piece
              </Link>
            </div>
          </div>
          {/* floor */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,rgba(18,23,43,0.05),rgba(18,23,43,0.1))] lg:h-24" />
        </div>
      </div>
    </div>
  );
}
