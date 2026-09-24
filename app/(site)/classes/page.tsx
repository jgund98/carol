// An Evening in the Studio: the guided painting class, with reservations.
import type { Metadata } from "next";
import Image from "next/image";
import { CLASS, classDay, classDayYear, classTime } from "@/lib/classes";
import { classAvailability } from "@/lib/studio/classes-server";
import { site } from "@/lib/site";
import ClassBooking from "@/components/classes/ClassBooking";
import ReserveBar from "@/components/classes/ReserveBar";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "An Evening in the Studio, a guided painting class | Carol Calicchio Art Studio, Delray Beach",
  description: "Paint your own abstract floral beside Carol Calicchio in her Delray Beach studio. All materials included, light refreshments served. $100 per seat. Reserve online.",
  alternates: { canonical: "/classes" },
  openGraph: { title: "An Evening in the Studio with Carol Calicchio", description: "A guided painting class in Delray Beach. All materials included. Reserve your seat.", images: [{ url: CLASS.photo }] },
};

const STEPS = [
  { n: "01", title: "Arrive.", text: "Canvas, brushes, paints and an apron are waiting at your easel." },
  { n: "02", title: "Paint with Carol.", text: "She shows her floating-flower technique, then helps you make it yours. No experience needed." },
  { n: "03", title: "Take it home.", text: "An original abstract floral, painted by you, dry enough to hang tonight." },
];

const FAQ = [
  { q: "I have never painted.", a: "Most guests haven't. Carol's method is built for first-timers." },
  { q: "Coming with friends, or giving a seat as a gift?", a: "Reserve several seats and you're seated together. For a gift, put their name in the note and Carol will have a card at their easel." },
  { q: "Plans change?", a: "Seats are transferable. Call or email at least 48 hours ahead and Carol will move you to the next evening." },
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
  const cta = next && next.left > 0 ? `Reserve your seat · $${CLASS.price}` : "See the next dates";

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ReserveBar label={cta} />

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="wrap grid items-center gap-8 pb-12 pt-[calc(var(--header-h)+2rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20 lg:pt-[calc(var(--header-h)+4rem)]">
          <div>
            <p className="display-light text-[1.05rem] italic text-ink/60">{CLASS.kicker}</p>
            <h1 className="display mt-4 text-[clamp(2.9rem,7vw,6rem)] leading-[0.94]">
              An evening <em>in the studio.</em>
            </h1>
            <p className="pretty mt-5 max-w-lg text-[1.08rem] leading-relaxed text-ink/75">
              Paint your own abstract floral beside Carol, in the room where her collections are born, and carry it home the same night.
            </p>
            {next && (
              <ul className="mt-6 grid gap-2.5 text-[0.98rem]">
                <li className="flex items-start gap-3"><span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-hibiscus" /><span>{next.left > 0 ? <><strong>{classDayYear(next)}</strong>{`, ${classTime(next)}`}</> : "Next date coming soon"}</span></li>
                <li className="flex items-start gap-3"><span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-hibiscus" /><span>{CLASS.venue.street}, Delray Beach</span></li>
                <li className="flex items-start gap-3"><span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-hibiscus" /><span><strong>${CLASS.price} per seat.</strong> Everything included, light refreshments served.</span></li>
              </ul>
            )}
            <div className="mt-7 hidden sm:block">
              <a href="#reserve" className="btn btn-pink">{cta}</a>
            </div>
            {next && next.left > 0 && next.left <= 6 && <p className="mt-4 text-[0.88rem] font-semibold text-hibiscus">Only {next.left} {next.left === 1 ? "seat" : "seats"} left for {classDay(next)}.</p>}
            {next && next.left > 6 && <p className="mt-4 text-[0.88rem] text-ink/55">Limited to {next.seats} guests.</p>}
          </div>
          <div className="relative">
            <div className="wrap-edge relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-linen shadow-[0_40px_90px_rgba(18,23,43,0.18)]">
              <Image src={CLASS.photo} alt="Carol Calicchio seated in her Delray Beach studio" fill priority sizes="(min-width:1024px) 45vw, 100vw" className="object-cover object-[50%_25%]" />
            </div>
          </div>
        </div>
      </section>

      {/* reserve */}
      <section id="reserve" className="bg-paper scroll-mt-[calc(var(--header-h)+0.5rem)]">
        <div className="wrap py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="display-light text-[1.05rem] italic text-ink/60">Reserve</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.6rem)]">Save your easel.</h2>
          </div>
          <div className="mt-8">
            <ClassBooking dates={dates} />
          </div>
        </div>
      </section>

      {/* three steps */}
      <section className="wrap py-14 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80} className="rounded-3xl bg-paper p-6 sm:p-7">
              <p className="display text-[2rem] leading-none text-hibiscus">{s.n}</p>
              <h3 className="display mt-3 text-[1.4rem]">{s.title}</h3>
              <p className="pretty mt-2 text-[0.96rem] leading-relaxed text-ink/72">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* good to know */}
      <section className="bg-paper">
        <div className="wrap grid gap-8 py-14 sm:py-20 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h2 className="display text-[clamp(1.8rem,3.5vw,3rem)]">Good to know.</h2>
            <p className="mt-3 text-[0.98rem] text-ink/70">Questions? <a href={site.phoneHref} className="font-semibold text-ink whitespace-nowrap">{site.phone}</a></p>
          </div>
          <dl className="grid gap-3">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl bg-gallery p-5">
                <dt className="display text-[1.15rem]">{f.q}</dt>
                <dd className="pretty mt-1.5 text-[0.95rem] leading-relaxed text-ink/72">{f.a}</dd>
              </div>
            ))}
          </dl>
          <div className="lg:col-span-2">
            <a href="#reserve" className="btn btn-pink">{cta}</a>
          </div>
        </div>
      </section>
      <div className="h-20 sm:hidden" aria-hidden />
    </>
  );
}
