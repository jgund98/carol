import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import WorkCard from "@/components/WorkCard";
import Easel from "@/components/Easel";
import { collections } from "@/lib/content";
import { collectionBySlug, inCollection } from "@/lib/catalog";

export const dynamicParams = false;
export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) return {};
  return {
    title: `${c.name} | Original paintings by Carol Calicchio`,
    description: `${c.blurb} Original works from the ${c.name} collection by Palm Beach abstract artist Carol Calicchio.`,
    alternates: { canonical: `/collections/${c.slug}` },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) notFound();
  const works = inCollection(c.key);
  const others = collections.filter((x) => x.slug !== c.slug);
  const easelWorks = works.filter((w) => w.kind !== "book").slice(0, 5);

  return (
    <>
      <PageHero kicker={c.kicker} title={c.name} text={c.blurb}>
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Other collections">
          {others.map((o) => (
            <Link key={o.slug} href={`/collections/${o.slug}`} className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-ink hover:text-ink">
              {o.name}
            </Link>
          ))}
        </nav>
      </PageHero>

      {easelWorks.length > 1 && (
        <section className="wrap pb-16">
          <div className="grid items-center gap-8 rounded-2xl bg-paper p-6 md:grid-cols-[1fr_1fr] md:p-12">
            <div>
              <p className="display-light text-[1.05rem] italic text-ink/60">On the easel</p>
              <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,3rem)]">Turn through the series.</h2>
              <p className="pretty mt-4 text-[0.98rem] leading-relaxed text-ink/70">Hover to tilt, tap to flip. The back of every canvas carries its label, size and medium.</p>
            </div>
            <Easel works={easelWorks} autoplay className="mx-auto w-full max-w-[400px]" />
          </div>
        </section>
      )}

      <section className="wrap pb-24">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((w, i) => (
            <Reveal key={w.slug} delay={(i % 3) * 80}>
              <WorkCard work={w} size={works.length <= 2 ? "lg" : "md"} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
