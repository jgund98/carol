import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import { press, quotes } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Press | Carol Calicchio in Palm Beach Illustrated, Dan's Papers & more",
  description: "Press and features on abstract artist Carol Calicchio: Palm Beach Illustrated, Elevated Magazine by Bruce Helander, Dan's Papers cover artist, Power Women podcast, Boca Raton Museum of Art.",
  alternates: { canonical: "/press" },
};

export default function PressPage() {
  return (
    <>
      <PageHero kicker="Press" title="On the record." text="Features, interviews and the critics' words." />
      <Marquee items={site.featuredIn.map((f) => `Featured in ${f}`)} />
      <section className="wrap section">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
          {press.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 100} className="border-t border-ink/15 pt-6">
              <p className="display-light text-[1.05rem] italic text-ink/60">{p.outlet}</p>
              <h2 className="display mt-3 text-[1.7rem] leading-tight">{p.title}</h2>
              <p className="mt-1 text-sm text-muted">{p.date}</p>
              <p className="pretty mt-4 text-[0.98rem] leading-relaxed text-ink/75">{p.text}</p>
              <a href={p.href} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
                Read it
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-midnight text-white">
        <div className="wrap section grid gap-10 md:grid-cols-2">
          {[quotes[2], quotes[3]].map((q, i) => (
            <Reveal key={i} delay={i * 100}>
              <p className="display-light text-[clamp(1.5rem,2.6vw,2.2rem)] leading-snug">“{q.text}”</p>
              <p className="mt-4 text-sm font-semibold text-gold-2">{q.by}</p>
              <p className="text-xs text-white/50">{q.source}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
