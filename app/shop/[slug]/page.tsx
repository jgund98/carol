import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { works } from "@/lib/works";
import { bySlug, collectionsOf, dims, img, related } from "@/lib/catalog";
import { money, site } from "@/lib/site";
import AddToCart from "@/components/AddToCart";
import ScaleView from "@/components/ScaleView";
import WorkCard from "@/components/WorkCard";
import Reveal from "@/components/Reveal";
import ArtViewer from "@/components/ArtViewer";

export const dynamicParams = false;
export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = bySlug(slug);
  if (!w) return {};
  const d = dims(w);
  return {
    title: `${w.name}${d ? `, ${d}` : ""} | Original by Carol Calicchio`,
    description: `${w.name} by Carol Calicchio. ${d ? `${d}, ` : ""}${w.medium ?? ""}. ${w.sold ? "Sold." : `${money(w.price)}. Original abstract painting available from the artist's Delray Beach studio.`}`,
    alternates: { canonical: `/shop/${w.slug}` },
    openGraph: { images: [{ url: img(w), alt: `${w.name} by Carol Calicchio` }] },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = bySlug(slug);
  if (!w) notFound();
  const colls = collectionsOf(w);
  const rel = related(w, 4);
  const d = dims(w);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "VisualArtwork"],
    name: w.name,
    image: `${site.url}${img(w)}`,
    description: `${w.name}, ${d ?? ""} ${w.medium ?? ""} by Carol Calicchio`.trim(),
    creator: { "@type": "Person", name: "Carol Calicchio" },
    artMedium: w.medium ?? undefined,
    artform: w.kind === "surfboard" ? "Surfboard" : w.kind === "book" ? "Book" : "Painting",
    ...(w.width && w.height ? { width: { "@type": "Distance", name: `${w.width} in` }, height: { "@type": "Distance", name: `${w.height} in` } } : {}),
    brand: { "@type": "Brand", name: "Carol Calicchio Art" },
    offers: {
      "@type": "Offer",
      price: w.price,
      priceCurrency: "USD",
      availability: w.sold ? "https://schema.org/SoldOut" : w.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/shop/${w.slug}`,
      seller: { "@type": "Organization", name: site.legalName },
    },
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${site.url}/shop` },
      ...(colls[0] ? [{ "@type": "ListItem", position: 2, name: colls[0].name, item: `${site.url}/collections/${colls[0].slug}` }] : []),
      { "@type": "ListItem", position: colls[0] ? 3 : 2, name: w.name, item: `${site.url}/shop/${w.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, crumbs]) }} />
      <section className="pt-[calc(var(--header-h)+1.5rem)]">
        <div className="wrap">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
            <Link href="/shop" className="hover:text-ink">Shop</Link>
            {colls[0] && (
              <>
                <span>/</span>
                <Link href={`/collections/${colls[0].slug}`} className="hover:text-ink">{colls[0].name}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-ink">{w.name}</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <ArtViewer work={w} />
            </div>

            <div className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
              <p className="display-light text-[1.05rem] italic text-ink/60">{colls.map((c) => c.name).join(" · ") || (w.kind === "painting" ? "Original painting" : w.kind)}</p>
              <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.98]">{w.name}</h1>
              <p className="mt-4 text-[1rem] text-ink/75">
                {d && <span>{d}</span>}
                {d && w.medium && <span> · </span>}
                {w.medium && <span>{w.medium}</span>}
              </p>
              <p className="display mt-6 text-[2rem]">{w.sold ? "Sold" : money(w.price)}</p>
              <div className="mt-6">
                <AddToCart work={w} />
              </div>
              <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-[0.92rem] text-ink/75">
                <li className="flex gap-3"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-hibiscus" />Original, signed by the artist. One of a kind.</li>
                {w.kind === "painting" && <li className="flex gap-3"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-hibiscus" />Painted in Carol&rsquo;s studio in Delray Beach, Florida.</li>}
                <li className="flex gap-3"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-hibiscus" />Shipping, delivery and installation arranged individually with the studio. Credit and debit cards, PayPal and offline payment accepted.</li>
                <li className="flex gap-3"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-hibiscus" />See it in person by appointment: <a href={site.phoneHref} className="font-semibold text-ink">{site.phone}</a>.</li>
              </ul>
              {w.kind === "painting" && w.width && w.height && (
                <div className="mt-8">
                  <p className="label text-muted">True to scale</p>
                  <div className="mt-3">
                    <ScaleView work={w} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {rel.length > 0 && (
        <section className="wrap section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-[clamp(1.9rem,3.4vw,3rem)]">You may also love</h2>
            <Link href="/shop" className="btn btn-line btn-sm">All work</Link>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {rel.map((r, i) => (
              <Reveal key={r.slug} delay={i * 80}>
                <WorkCard work={r} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="wrap pb-24">
        <div className="grid items-center gap-8 rounded-2xl bg-midnight p-8 text-white md:grid-cols-[auto_1fr_auto] md:p-10">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gold/60">
            <Image src="/photos/carol-studio-seated.jpg" alt="Carol Calicchio in her studio" fill sizes="96px" className="object-cover object-top" />
          </div>
          <div>
            <p className="display text-[1.6rem]">Want to see how it lives in your room?</p>
            <p className="pretty mt-2 text-sm text-white/70">Send Carol a photo of the wall. She will tell you honestly whether this is the piece, or paint the one that is.</p>
          </div>
          <Link href={`/contact?about=${w.slug}`} className="btn btn-white">Ask Carol</Link>
        </div>
      </section>
    </>
  );
}
