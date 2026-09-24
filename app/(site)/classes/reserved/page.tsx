// Back from Stripe after reserving seats. Verifies the session, records the
// booking once, and tells the guest everything they need.
import type { Metadata } from "next";
import Link from "next/link";
import { paidSession } from "@/lib/studio/stripe";
import { completeBooking, unpackBooking } from "@/lib/studio/bookings";
import { CLASS, calendarUrl, classById, classDayYear, classTime } from "@/lib/classes";
import { money, site } from "@/lib/site";
import type { StudioOrder } from "@/lib/studio/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "You're in", robots: { index: false, follow: false } };

export default async function ReservedPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let o: StudioOrder | null = null;
  let classId = "";
  let qty = 1;
  if (session_id) {
    const p = await paidSession(session_id);
    if (p && p.kind === "class") {
      const b = unpackBooking(p.metadata);
      if (b) {
        classId = b.classId;
        qty = b.qty;
        try {
          o = await completeBooking(b.guest, b.classId, b.qty, session_id);
        } catch (e) {
          console.error("[classes/reserved]", e);
        }
      }
    }
  }
  const c = classId ? classById(classId) : null;

  if (!o || !c)
    return (
      <Wrap kicker="Reservations" title="We could not confirm that payment." text={`If your card was charged, Carol has the record and will be in touch. Otherwise please call ${site.phone} and she will reserve your seat by hand.`}>
        <a href={site.phoneHref} className="btn btn-ink">Call {site.phone}</a>
        <Link href="/classes" className="btn btn-line">Back to the class</Link>
      </Wrap>
    );

  const first = o.name.trim().split(/\s+/)[0] || "";
  return (
    <section className="grid min-h-[100svh] place-items-center pt-[var(--header-h)]">
      <div className="wrap max-w-2xl py-16">
        <p className="display-light text-center text-[1.05rem] italic text-ink/60">Order {o.ref} · {money(o.subtotal)}</p>
        <h1 className="display mt-4 text-center text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.96]">{first ? `You're in, ${first}.` : "You're in."}</h1>
        <p className="pretty mx-auto mt-5 max-w-lg text-center text-ink/70">
          {qty === 1 ? "Your seat is" : `Your ${qty} seats are`} reserved. A confirmation with everything below is on its way to {o.email}{o.phone ? " and your phone" : ""}.
        </p>
        <div className="mt-10 rounded-3xl bg-paper p-6 sm:p-8">
          <dl className="grid gap-4 text-[1rem]">
            <div className="grid gap-1 sm:grid-cols-[6rem_1fr]"><dt className="text-ink/55">When</dt><dd><strong>{classDayYear(c)}</strong><br />{classTime(c)}. Doors open ten minutes early.</dd></div>
            <div className="grid gap-1 sm:grid-cols-[6rem_1fr]"><dt className="text-ink/55">Where</dt><dd>{CLASS.venue.name}<br />{CLASS.venue.street}, {CLASS.venue.city}</dd></div>
            <div className="grid gap-1 sm:grid-cols-[6rem_1fr]"><dt className="text-ink/55">Bring</dt><dd>Nothing. Canvas, paints, brushes and an apron are waiting at your easel. Light refreshments are served.</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/10 pt-6">
            <a href={calendarUrl(c)} target="_blank" rel="noopener" className="btn btn-ink">Add to calendar</a>
            <a href={CLASS.mapsUrl} target="_blank" rel="noopener" className="btn btn-line">Directions</a>
            <Link href="/shop" className="btn btn-line">Browse the collection</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-[0.88rem] text-ink/55">Change of plans? Call {site.phone} at least 48 hours ahead and Carol will move you to the next evening.</p>
      </div>
    </section>
  );
}

function Wrap({ kicker, title, text, children }: { kicker: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="grid min-h-[100svh] place-items-center pt-[var(--header-h)]">
      <div className="wrap max-w-2xl py-16 text-center">
        <p className="display-light text-[1.05rem] italic text-ink/60">{kicker}</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,5vw,4.4rem)]">{title}</h1>
        <p className="pretty mx-auto mt-5 max-w-lg text-ink/70">{text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  );
}
