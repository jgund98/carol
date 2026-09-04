import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import VideoPlayer from "@/components/VideoPlayer";
import LeadForm from "@/components/LeadForm";
import { site } from "@/lib/site";
import { faqs } from "@/lib/content";
import PaintBlob from "@/components/PaintBlob";
import Scribble from "@/components/Scribble";

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
      {/* Light, photo-led hero: the gallery itself */}
      <section className="relative min-h-[92svh] overflow-hidden bg-gallery">
        <Image src="/photos/white-series-gallery.jpg" alt="Two White Series paintings installed on the gallery wall" fill priority sizes="100vw" className="object-cover object-[68%_50%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,249,245,0.96)_0%,rgba(251,249,245,0.9)_34%,rgba(251,249,245,0.35)_60%,rgba(251,249,245,0)_100%)] lg:bg-[linear-gradient(90deg,rgba(251,249,245,0.97)_0%,rgba(251,249,245,0.92)_30%,rgba(251,249,245,0.2)_58%,rgba(251,249,245,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(251,249,245,0),#fbf9f5)]" />
        <PaintBlob of="gardenia-goddess" shape={3} size="clamp(110px,14vw,220px)" className="right-[6%] top-[14%] hidden lg:block" focus={[0.5, 0.5]} speed={0.35} base={-12} />
        <div className="wrap relative flex min-h-[92svh] flex-col justify-center pb-16 pt-[calc(var(--header-h)+2rem)]">
          <p className="display-light text-[1.05rem] italic text-ink/60">Carol Calicchio Art Studio, opened August 2026</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.8rem,6.6vw,5.8rem)] leading-[0.96]">A white room, built for <Scribble>color.</Scribble></h1>
          <p className="pretty mt-6 max-w-lg text-[1.05rem] leading-relaxed text-ink/75">
            {site.studio.street}, {site.studio.city}. Gallery in front, working studio behind, Ketra lighting in the tracks overhead. Open to collectors, designers and friends of the work, by appointment.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#visit" className="btn btn-ink">Book a private viewing</a>
            <a href={site.studio.mapsHref} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
              Directions
              <span className="h-px w-8 bg-ink/40 transition-all group-hover:w-12 group-hover:bg-ink" />
            </a>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="display-light text-[1.05rem] italic text-ink/60">From construction to first hang</p>
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
            <div className="rotate-[-1.5deg]"><VideoPlayer src="gesso" className="wrap-edge aspect-[9/16]" /></div>
            <div className="rotate-[1.2deg] pt-6"><VideoPlayer src="studio-tour" sound className="wrap-edge aspect-[9/16]" caption="The tour" /></div>
            <div className="wrap-edge relative aspect-[9/16] rotate-[-1deg] overflow-hidden">
              <Image src="/photos/carol-easel-portrait.jpg" alt="Carol Calicchio beside her easel" fill sizes="20vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper">
        <div className="wrap section grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="display-light text-[1.05rem] italic text-ink/60">Workshops &amp; events</p>
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
            <p className="display-light text-[1.05rem] italic text-ink/60">Visit</p>
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
        <p className="display-light text-[1.05rem] italic text-ink/60">Good to know</p>
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
