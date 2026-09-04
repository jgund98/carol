import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import VideoPlayer from "@/components/VideoPlayer";
import { bio, quotes, statement } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Carol Calicchio | Palm Beach Abstract Artist",
  description: "Carol Calicchio, Fairfield County native and one of South Florida's leading contemporary artists. NYSID and School of Visual Arts trained, painting abstract florals and seascapes from her Delray Beach studio.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero art={["palm-beach-blooms", "morning-white"]} kicker="About the artist" title="Carol Calicchio" text="Fairfield County native. New York School of Interior Design, then the School of Visual Arts. Now painting the light of South Florida from a studio on the Intracoastal." />

      <section className="wrap pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal variant="scale" className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
            <div className="wrap-edge relative aspect-[4/5] overflow-hidden bg-linen">
              <Image src="/photos/carol-easel-portrait.jpg" alt="Carol Calicchio standing beside a floral painting on her easel" fill priority sizes="(min-width:1024px) 42vw, 100vw" className="object-cover" />
            </div>
            <Image src="/brand/sig-ink.png" alt="" aria-hidden width={220} height={70} className="mt-6 h-auto w-[200px] opacity-80" />
          </Reveal>
          <div className="space-y-6 text-[1.05rem] leading-[1.75] text-ink/80 md:text-[1.12rem]">
            {bio.map((p, i) => (
              <Reveal key={i} as="p" className="pretty" delay={i * 60}>
                {p}
              </Reveal>
            ))}
            <Reveal className="rounded-2xl bg-paper p-6 md:p-8">
              <p className="display-light text-[1.05rem] italic text-ink/60">Also</p>
              <ul className="mt-3 space-y-2 text-[0.98rem]">
                <li>Author of Flower Power and Ocean Power, two hardcover monographs published with the Historical Society of Palm Beach County.</li>
                <li>Named one of Palm Beach County&rsquo;s top ten influencers by Schneps Media and Dan&rsquo;s Papers.</li>
                <li>Founder of Carol&rsquo;s Pet Collective, rescuing pets in need across South Florida.</li>
                <li>Surfboard collaboration with Nomad Surf Shop, on view at The Shops at The Breakers.</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#0b1226] text-white">
        <div className="wrap section grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
          <Reveal>
            <p className="display-light text-[1.05rem] italic text-gold-2">Artist statement</p>
            <blockquote className="display-light mt-5 text-[clamp(1.8rem,3.6vw,3.2rem)] leading-[1.12]">“{statement.quote}”</blockquote>
            <p className="mt-6 text-white/60">{statement.by}</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {[quotes[0], quotes[1]].map((q, i) => (
                <div key={i} className="border-t border-white/15 pt-4">
                  <p className="display-light text-[1.2rem] leading-snug">“{q.text}”</p>
                  <p className="mt-2 text-xs text-white/50">{q.source}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal variant="scale" className="grid grid-cols-2 gap-4">
            <VideoPlayer src="hibiscus-close" className="wrap-edge aspect-[9/16]" />
            <div className="wrap-edge relative aspect-[9/16] overflow-hidden">
              <Image src="/photos/carol-studio-seated.jpg" alt="Carol seated in her studio surrounded by paintings" fill sizes="30vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="wrap section">
        <div className="grid gap-10 md:grid-cols-2">
          <Reveal className="wrap-edge relative aspect-[3/2] overflow-hidden bg-linen">
            <Image src="/photos/carol-living-room.jpg" alt="Carol Calicchio seated beneath one of her landscape paintings in a collector's living room" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={100} className="flex flex-col justify-center">
            <p className="display-light text-[1.05rem] italic text-ink/60">Collectors</p>
            <h2 className="display mt-3 text-[clamp(2rem,3.6vw,3.2rem)]">Art that changes the energy of a room.</h2>
            <p className="pretty mt-4 text-[1.02rem] leading-relaxed text-ink/75">
              Carol&rsquo;s work hangs in private homes from Palm Beach to Nantucket and New York, in hotels including Canopy by Hilton West Palm Beach, and in showrooms and galleries across South Florida. She welcomes collectors and designers to the studio, by appointment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/studio#visit" className="btn btn-ink">Visit the studio</Link>
              <Link href="/exhibitions" className="btn btn-line">Exhibition history</Link>
            </div>
            <p className="mt-6 text-sm text-muted">
              Follow along at <a href={site.social.instagram} className="font-semibold text-ink" target="_blank" rel="noopener">{site.social.instagramHandle}</a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
