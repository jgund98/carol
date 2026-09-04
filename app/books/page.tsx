import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { books } from "@/lib/content";
import { bySlug, img } from "@/lib/catalog";
import { money } from "@/lib/site";

export const metadata: Metadata = {
  title: "Books | Flower Power & Ocean Power by Carol Calicchio",
  description: "Two hardcover monographs on the paintings of Carol Calicchio, written by Bruce Helander with essays by Anthony Haden-Guest and Elizabeth Sobieski, published with the Historical Society of Palm Beach County.",
  alternates: { canonical: "/books" },
};

export default function BooksPage() {
  return (
    <>
      <PageHero kicker="Books" title="Two volumes of light." text="Flower Power and Ocean Power: the florals and the blues, in hardcover." />
      <section className="wrap pb-24">
        <div className="grid gap-16">
          {books.map((b, i) => {
            const w = bySlug(b.slug)!;
            return (
              <Reveal key={b.slug} className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="wrap-edge relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden bg-linen">
                  <Image src={img(w)} alt={`${b.title}: ${b.subtitle}`} fill priority={i === 0} sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
                </div>
                <div>
                  <p className="label text-hibiscus">{b.publisher}</p>
                  <h2 className="display mt-3 text-[clamp(2.2rem,4.6vw,4rem)]">{b.title}</h2>
                  <p className="display-light mt-1 text-[1.3rem] text-ink/70">{b.subtitle}</p>
                  <p className="pretty mt-5 text-[1.02rem] leading-relaxed text-ink/75">{b.text}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="display text-2xl">{money(w.price)}</span>
                    {w.available ? (
                      <Link href={`/shop/${w.slug}`} className="btn btn-pink">Order the book</Link>
                    ) : (
                      <>
                        <a href={b.external} target="_blank" rel="noopener" className="btn btn-ink">Order from the Historical Society</a>
                        <Link href={`/contact?about=${w.slug}`} className="btn btn-line">Ask for a signed copy</Link>
                      </>
                    )}
                  </div>
                  {!w.available && <p className="mt-3 text-xs text-muted">Currently out of stock in the studio shop.</p>}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
