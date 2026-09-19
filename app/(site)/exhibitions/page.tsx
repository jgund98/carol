import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { exhibitions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Exhibitions & Events | Carol Calicchio",
  description: "Exhibition history for Palm Beach artist Carol Calicchio: The Breakers, Palm Beach Show, Fivestory New York, Cultural Council for Palm Beach County, The Ben Hotel, J.McLaughlin and more since 2019.",
  alternates: { canonical: "/exhibitions" },
};

export default function ExhibitionsPage() {
  const years = [...new Set(exhibitions.map((e) => e.year))].sort((a, b) => b - a);
  return (
    <>
      <PageHero kicker="Exhibitions & events" title="Where the work has hung." text="From the Armory Art Center in 2019 to Fivestory New York, the Palm Beach Show and The Breakers. Stay tuned for the new studio's first season of events." />
      <section className="wrap pb-24">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <Reveal variant="scale" className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
            <div className="wrap-edge relative aspect-[3/4] overflow-hidden bg-linen">
              <Image src="/photos/twilight-invite.jpg" alt="Invitation to Twilight in the Garden, the Delray Beach Historical Society's premier fundraiser, featuring Carol's painting" fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover" />
            </div>
            <p className="mt-3 text-xs text-muted">Twilight in the Garden, April 2026, with Carol&rsquo;s painting on the invitation.</p>
          </Reveal>
          <div>
            {years.map((y) => (
              <Reveal key={y} className="grid gap-4 border-t border-ink/15 py-8 md:grid-cols-[100px_1fr]">
                <p className="display text-[2.2rem] leading-none text-hibiscus">{y}</p>
                <ul className="space-y-4">
                  {exhibitions.filter((e) => e.year === y).map((e, i) => (
                    <li key={i}>
                      <p className="display text-[1.25rem] leading-tight">{e.title}</p>
                      <p className="mt-1 text-sm text-muted">{[e.venue, e.date].filter(Boolean).join(" · ")}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
