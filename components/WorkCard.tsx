import Link from "next/link";
import Image from "next/image";
import type { Work } from "@/lib/works";
import { dims, img } from "@/lib/catalog";
import { money } from "@/lib/site";

/**
 * Every card is the same wall swatch (4:5) with the canvas hung in the middle at its true
 * aspect ratio, so rows stay level whatever the painting's shape.
 */
export default function WorkCard({ work, priority = false, size = "md" }: { work: Work; priority?: boolean; size?: "md" | "lg" }) {
  const a = work.iw / work.ih;
  const widthPct = a >= 0.8 ? 86 : 107.5 * a;
  return (
    <Link href={`/shop/${work.slug}`} className="group block" data-cursor={work.sold ? "Sold" : "View"} data-cursor-color={work.color}>
      <div className="plaster relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-sm border border-ink/[0.06]">
        <div className="spot pointer-events-none absolute -top-[30%] left-1/2 h-[60%] w-[140%] -translate-x-1/2 opacity-70" />
        <div
          className="wrap-edge relative overflow-hidden bg-linen transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1.5"
          style={{ width: `${widthPct}%`, aspectRatio: `${work.iw} / ${work.ih}` }}
        >
          <Image
            src={img(work, size === "lg" ? "full" : "sm")}
            alt={`${work.name} by Carol Calicchio`}
            fill
            priority={priority}
            sizes={size === "lg" ? "(min-width:1024px) 40vw, 90vw" : "(min-width:1280px) 20vw, (min-width:1024px) 26vw, (min-width:640px) 40vw, 86vw"}
            className="object-cover"
          />
        </div>
        {work.sold && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-white">SOLD</span>}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[9%] bg-[linear-gradient(180deg,rgba(18,23,43,0.03),rgba(18,23,43,0.09))]" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="display text-[1.2rem] leading-tight">{work.name}</p>
          <p className="mt-1 text-[0.78rem] text-muted">{dims(work) ?? work.medium}</p>
        </div>
        <p className="shrink-0 text-[0.9rem] font-semibold">{work.sold ? "Sold" : money(work.price)}</p>
      </div>
    </Link>
  );
}
