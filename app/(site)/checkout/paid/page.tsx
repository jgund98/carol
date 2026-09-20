// Back from Stripe after a purchase. The session is verified server-side,
// the order is recorded (once), Carol is told and the buyer gets a receipt.
import type { Metadata } from "next";
import Link from "next/link";
import { getOrder } from "@/lib/studio/store";
import { paidSession } from "@/lib/studio/stripe";
import { completePurchase, unpackPurchase } from "@/lib/studio/purchase";
import { money, site } from "@/lib/site";
import ClearCart from "@/components/cart/ClearCart";
import type { StudioOrder } from "@/lib/studio/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

export default async function PaidPage({ searchParams }: { searchParams: Promise<{ session_id?: string; order?: string }> }) {
  const { session_id, order } = await searchParams;
  let o: StudioOrder | null = null;

  if (session_id) {
    const p = await paidSession(session_id);
    if (p && p.kind === "order") {
      const u = unpackPurchase(p.metadata);
      if (u) {
        try {
          o = await completePurchase(u.buyer, u.lines, session_id);
        } catch (e) {
          console.error("[checkout/paid]", e);
        }
      }
    }
  } else if (order) {
    o = await getOrder(order);
    if (o && o.status !== "paid" && o.status !== "shipped" && o.status !== "delivered") o = null;
  }

  if (!o)
    return (
      <Wrap kicker="Checkout" title="We could not confirm that payment." text={`If your card was charged, Carol has the record and will be in touch. Otherwise please call ${site.phone} and she will take care of it.`}>
        <a href={site.phoneHref} className="btn btn-ink">Call {site.phone}</a>
        <Link href="/shop" className="btn btn-line">Back to the collection</Link>
      </Wrap>
    );

  const first = o.name.trim().split(/\s+/)[0] || "";
  return (
    <>
      <ClearCart />
      <Wrap kicker={`Order ${o.ref} · ${money(o.subtotal)}`} title={first ? `Thank you, ${first}.` : "Thank you."} text={`${o.items.map((i) => i.name).join(", ")} is yours. A receipt is on its way to ${o.email}, and Carol will call you personally to arrange ${o.delivery ? o.delivery.toLowerCase() : "delivery"}.`}>
        <Link href="/shop" className="btn btn-ink">Back to the collection</Link>
        <a href={site.phoneHref} className="btn btn-line">Call {site.phone}</a>
      </Wrap>
    </>
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
