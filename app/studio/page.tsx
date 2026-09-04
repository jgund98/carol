import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import VideoPlayer from "@/components/VideoPlayer";
import LeadForm from "@/components/LeadForm";
import { site } from "@/lib/site";
import { faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Studio | Carol Calicchio Art Studio, Delray Beach",
  description: "Visit Carol Calicchio Art Studio at 2559 Webb Avenue, Delray Beach, FL. A new gallery and working studio, open by appointment for private viewings, commissions, workshops and events.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      {/* Dark cinematic hero with the studio tour */}
      <section className="relative min-h-[100svh] overflow-hidden bg-ink text-white">
        <video className="absolute inset-0 h-full w-full object-cover opacity-70" src="/video/studio-tour.mp4" poster="/video/studio-tour.jpg" autoPlay muted loop playsInline preload="auto" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,23,43,0.55)_0%,rgba(18,23,43,0.15)_45%,rgba(18,23,43,0.9)_100%)]" />
        <div className="wrap relative flex min-h-[100svh] flex-col justify-end pb-16 pt-[calc(var(--header-h)+3rem)]">
          <p className="label text-gold-2">Carol Calicchio Art Studio · opened August 2026</p>
          <h1 className="display mt-4 max-w-4xl text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.96]">A white room, built for color.</h1>
          <p className="pretty mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/80">
            {site.studio.street}, {site.studio.city}. Gallery in front, working studio behind, Ketra lighting in the tracks overhead. Open to collectors, designers and friends of the work, by appointment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#visit" className="btn btn-white">Book a private viewing</a>
            <a href={site.studio.mapsHref} target="_blank" rel="noopener" className="btn btn-line-white">Directions</a>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="label text-hibiscus">From construction to first hang</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.6rem)]">Watched over a summer.</h2>
            <p className="pretty mt-5 text-[1.02rem] leading-relaxed text-ink/75">
              Carol shared the build all season: bare walls in May, scaffolding and lighting tracks in June, the kitchen in July, and in August the reveal, a gallery with room to hang 60 and 72 inch canvases at eye level. It is where the paintings now live between shows, and where commissions begin.
            </p>
            <ul className="mt-6 grid gap-3 text-[0.95rem] text-ink/75 sm:grid-cols-2">
              {["Private viewings by appointment", "Commission consultations", "Paint & Sip workshops and events", "Designer and trade visits welcome"].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-hibiscus" />{t}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal variant="scale" className="grid grid-cols-3 gap-3">
            <VideoPlayer src="gesso" className="wrap-edge aspect-[9/16]" />
            <VideoPlayer src="white-detail" className="wrap-edge aspect-[9/16]" />
            <div className="wrap-edge relative aspect-[9/16] overflow-hidden">
              <Image src="/photos/white-series-gallery.jpg" alt="Two White Series paintings installed in a gallery" fill sizes="20vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper">
        <div className="wrap section grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="label text-hibiscus">Workshops &amp; events</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.6rem)]">Paint with Carol.</h2>
            <p className="pretty mt-5 text-[1.02rem] leading-relaxed text-ink/75">
              Carol hosts Paint &amp; Sip evenings and pop-up workshops with the Delray Beach Historical Society and around Palm Beach County, from Sip into Color at the West Palm Beach GreenMarket to Twilight in the Garden, the Society&rsquo;s premier fundraiser. Join the list below to hear about the next one first.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="wrap-edge relative aspect-[3/4] overflow-hidden bg-linen">
                <Image src="/photos/paint-sip.jpg" alt="Paint and Sip with Carol Calicchio at the Delray Beach Historical Society" fill sizes="25vw" className="object-cover" />
              </div>
              <div className="wrap-edge relative aspect-[3/4] overflow-hidden bg-linen">
                <Image src="/photos/popup-workshop.jpg" alt="Pop-up workshop with easels by the water" fill sizes="25vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} id="visit" as="div" className="scroll-mt-28 rounded-2xl bg-white p-6 shadow-sm md:p-10">
            <p className="label text-hibiscus">Visit</p>
            <h2 className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)]">Book a private viewing.</h2>
            <p className="mt-3 text-sm text-muted">
              {site.studio.street}, {site.studio.city}, {site.studio.state} {site.studio.zip} · {site.studio.note} · <a href={site.phoneHref} className="font-semibold text-ink">{site.phone}</a>
            </p>
            <div className="mt-6">
              <LeadForm
                formType="visit"
                submitLabel="Request a visit"
                fields={[
                  { name: "name", label: "Name", required: true, half: true, placeholder: "First name is fine" },
                  { name: "phone", label: "Phone", type: "tel", required: true, half: true },
                  { name: "email", label: "Email", type: "email", required: true },
                  { name: "when", label: "When would suit you", placeholder: "Weekday mornings, next Saturday…" },
                  { name: "message", label: "What are you looking for", textarea: true, placeholder: "A piece for the living room, a commission, a workshop…" },
                ]}
                success={{ title: "See you at the studio.", text: "Carol will reply personally to confirm a time." }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="wrap section">
        <p className="label text-hibiscus">Good to know</p>
        <h2 className="display mt-3 text-[clamp(2rem,4vw,3.4rem)]">Questions collectors ask.</h2>
        <div className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {faqs.map((f) => (
            <Reveal key={f.q} className="border-t border-ink/15 pt-5">
              <h3 className="display text-[1.35rem]">{f.q}</h3>
              <p className="pretty mt-2 text-[0.95rem] leading-relaxed text-ink/70">{f.a}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
