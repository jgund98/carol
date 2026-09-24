// An Evening in the Studio: the guided painting class, with reservations.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CLASS, classDay, classDayYear, classTime } from "@/lib/classes";
import { classAvailability } from "@/lib/studio/classes-server";
import { site } from "@/lib/site";
import ClassBooking from "@/components/classes/ClassBooking";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "An Evening in the Studio, a guided painting class | Carol Calicchio Art Studio, Delray Beach",
  description: "Paint your own abstract floral beside Carol Calicchio in her Delray Beach studio. One evening, all materials included, light refreshments served. $100 per seat. Reserve online.",
  alternates: { canonical: "/classes" },
  openGraph: { title: "An Evening in the Studio with Carol Calicchio", description: "A guided painting class in Delray Beach. All materials included. Reserve your seat.", images: [{ url: CLASS.photo }] },
};

const STEPS = [
  { n: "01", title: "Arrive at seven.", text: "A stretched canvas, brushes, a palette of Carol's colors and an apron are already waiting at your easel. Find your seat, say hello, settle in." },
  { n: "02", title: "Watch, then paint.", text: "Carol shows the floating-flower technique behind her collections, stroke by stroke, then walks the room while you make it your own. No experience needed. Most guests have never held a brush." },
  { n: "03", title: "Leave with a painting.", text: "Sixty minutes later you carry out an original abstract floral, signed by you, dry enough to hang that night. And a very good story." },
];

const FAQ = [
  { q: "I have never painted in my life.", a: "Then you are exactly who this evening is for. Carol's method is built for first-timers. You will be surprised what comes off your brush." },
  { q: "What should I wear?", a: "Something you would not mind a fleck of paint on. Aprons are provided, but paint has a mind of its own." },
  { q: "Can I bring friends?", a: "Please do. Reserve several seats in one go and you will be seated together. It makes a wonderful birthday, girls' night or date night." },
  { q: "Is this a gift?", a: "A very good one. Reserve the seat, put their name in the note, and Carol will have their canvas waiting with a card." },
  { q: "What if my plans change?", a: "Seats are transferable. Call or email the studio at least 48 hours ahead and Carol will move you to the next evening." },
  { q: "What is included?", a: "Everything. Canvas, paints, brushes, apron, Carol's instruction, and light refreshments through the evening." },
];

export default async function ClassesPage() {
  const dates = await classAvailability();
  const next = dates.find((d) => d.left > 0) ?? dates[0] ?? null;
  const jsonLd = next
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${CLASS.title} with Carol Calicchio`,
        startDate: `${next.date}T${next.start}:00-04:00`,
        endDate: `${next.date}T${next.end}:00-04:00`,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "Place", name: CLASS.venue.name, address: { "@type": "PostalAddress", streetAddress: CLASS.venue.street, addressLocality: "Delray Beach", addressRegion: "FL", postalCode: "33444", addressCountry: "US" } },
        image: [`${site.url}${CLASS.photo}`],
        description: "A guided painting class in Carol Calicchio's Delray Beach studio. All materials included.",
        offers: { "@type": "Offer", url: `${site.url}/classes`, price: CLASS.price, priceCurrency: "USD", availability: next.left > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut" },
        performer: { "@type": "Person", name: "Carol Calicchio" },
        organizer: { "@type": "Organization", name: CLASS.venue.name, url: site.url },
      }
    : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="wrap grid items-center gap-10 pb-16 pt-[calc(var(--header-h)+2.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-[calc(var(--header-h)+4rem)]">
          <div>
            <p className="display-light text-[1.05rem] italic text-ink/60">{CLASS.kicker}</p>
            <h1 className="display mt-4 text-[clamp(2.9rem,7vw,6rem)] leading-[0.94]">
              An evening <em>in the studio.</em>
            </h1>
            <p className="pretty mt-6 max-w-lg text-[1.08rem] leading-relaxed text-ink/75">
              One evening, one canvas, and Carol at your shoulder. Paint your own abstract floral in the room where her collections are born, then carry it home the same night. Nothing to bring but yourself.
            </p>
            {next && (
              <ul className="mt-7 grid gap-2.5 text-[0.98rem]">
                <li className="flex items-start gap-3"><span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-hibiscus" /><span>{next.left > 0 ? <><strong>{classDayYear(next)}</strong>{`, ${classTime(next)}`}</> : "Next date coming soon"}</span></li>
                <li className="flex items-start gap-3"><span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-hibiscus" /><span>{CLASS.venue.street}, {CLASS.venue.city}</span></li>
                <li className="flex items-start gap-3"><span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-hibiscus" /><span><strong>${CLASS.price} per seat.</strong> All materials and light refreshments included.</span></li>
              </ul>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#reserve" className="btn btn-pink">Reserve your seat</a>
              <a href="#how" className="btn btn-line">How the evening goes</a>
            </div>
            {next && next.left > 0 && next.left <= 6 && <p className="mt-4 text-[0.88rem] font-semibold text-hibiscus">Only {next.left} {next.left === 1 ? "seat" : "seats"} left for {classDay(next)}.</p>}
            {next && next.left > 6 && <p className="mt-4 text-[0.88rem] text-ink/55">Space is limited to {next.seats} guests so Carol can work with every one of you.</p>}
          </div>
          <Reveal className="relative">
            <div className="wrap-edge relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-linen shadow-[0_40px_90px_rgba(18,23,43,0.18)]">
              <Image src={CLASS.photo} alt="Carol Calicchio seated in her Delray Beach studio" fill priority sizes="(min-width:1024px) 45vw, 100vw" className="object-cover object-[50%_25%]" />
            </div>
            <div className="absolute -bottom-6 -left-4 max-w-[260px] rounded-2xl bg-gallery p-5 shadow-[0_20px_50px_rgba(18,23,43,0.15)] sm:-left-8">
              <p className="display text-[1.15rem] leading-snug">&ldquo;Leave the paints, the easel and the evening to us. Just bring yourself.&rdquo;</p>
              <p className="mt-2 text-[0.8rem] text-ink/55">Carol</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* how it goes */}
      <section id="how" className="bg-paper">
        <div className="wrap section">
          <div className="max-w-2xl">
            <p className="display-light text-[1.05rem] italic text-ink/60">How the evening goes</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.6rem)]">Sixty minutes. One painting. Yours.</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="rounded-3xl bg-gallery p-7">
                <p className="display text-[2.4rem] leading-none text-hibiscus">{s.n}</p>
                <h3 className="display mt-4 text-[1.5rem]">{s.title}</h3>
                <p className="pretty mt-3 text-[0.98rem] leading-relaxed text-ink/72">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* the room */}
      <section className="wrap section grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-linen lg:order-2">
          <Image src={CLASS.photoWide} alt="Carol Calicchio at her easel" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-[50%_20%]" />
        </Reveal>
        <div>
          <p className="display-light text-[1.05rem] italic text-ink/60">The room</p>
          <h2 className="display mt-3 text-[clamp(2rem,4vw,3.6rem)]">Painted where the paintings happen.</h2>
          <p className="pretty mt-5 text-[1.02rem] leading-relaxed text-ink/75">
            This is not a rented hall with a projector. It is Carol&rsquo;s working studio in Delray Beach, white walls, north light, her canvases on the racks and the collection on the walls around you. Twelve easels, one artist, and a room that smells faintly of fresh paint.
          </p>
          <p className="pretty mt-4 text-[1.02rem] leading-relaxed text-ink/75">
            Carol keeps the group small on purpose. She wants to stand at every easel, see what you are reaching for, and help you get there.
          </p>
          <ul className="mt-6 space-y-2.5 text-[0.95rem] text-ink/75">
            {["Canvas, paints, brushes and apron at your easel", "Carol's floating-flower technique, taught live", "Light refreshments through the evening", "Your finished painting to take home"].map((x) => (
              <li key={x} className="flex gap-3"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-hibiscus" />{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* reserve */}
      <section id="reserve" className="bg-gallery scroll-mt-[calc(var(--header-h)+1rem)]">
        <div className="wrap section">
          <div className="max-w-2xl">
            <p className="display-light text-[1.05rem] italic text-ink/60">Reserve</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.6rem)]">Save your easel.</h2>
            <p className="pretty mt-4 text-[1.02rem] leading-relaxed text-ink/75">Pick your evening, tell us how many are coming, and pay securely by card. Your seat is confirmed the moment it goes through.</p>
          </div>
          <div className="mt-10">
            <ClassBooking dates={dates} />
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="bg-paper">
        <div className="wrap section grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="display-light text-[1.05rem] italic text-ink/60">Good to know</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.4rem)]">Questions, answered.</h2>
            <p className="pretty mt-4 text-[1rem] text-ink/70">Anything else? Call the studio at <a href={site.phoneHref} className="font-semibold text-ink whitespace-nowrap">{site.phone}</a> or <Link href="/contact" className="font-semibold text-ink underline underline-offset-4">send a note</Link>.</p>
          </div>
          <dl className="grid gap-3">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl bg-gallery p-5 sm:p-6">
                <dt className="display text-[1.2rem]">{f.q}</dt>
                <dd className="pretty mt-2 text-[0.96rem] leading-relaxed text-ink/72">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
