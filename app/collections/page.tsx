import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import BrushReveal from "@/components/BrushReveal";
import { collections } from "@/lib/content";
import { bySlug, inCollection, img } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Collections | Flower Power, Blue Series, White Series",
  description: "Browse Carol Calicchio's collections: Flower Power florals, the Blue Series seascapes, the sculpted White Series, Goddess minis, surfboards and books.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <>
      <PageHero kicker="Collections" title="Every series, one light." text="Florals over galactic blue, seas in cerulean and pthalo, gardenias sculpted in white. Choose a door." />
      <section className="wrap pb-24">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => {
            const w = bySlug(c.hero)!;
            const n = inCollection(c.key).length;
            return (
              <Reveal key={c.slug} delay={(i % 3) * 100}>
                <Link href={`/collections/${c.slug}`} className="group block" data-cursor="Enter" data-cursor-color={w.color}>
                  <div className="wrap-edge overflow-hidden bg-linen" style={{ aspectRatio: "4 / 5" }}>
                    <BrushReveal src={img(w)} alt={`${w.name}, ${c.name}`} className="h-full w-full transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <div>
                      <p className="label text-muted">{c.kicker}</p>
                      <h2 className="display mt-1 text-[1.9rem] leading-none">{c.name}</h2>
                    </div>
                    <span className="text-sm text-muted">{n} piece{n === 1 ? "" : "s"}</span>
                  </div>
                  <p className="pretty mt-3 text-[0.95rem] leading-relaxed text-ink/70">{c.blurb}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
