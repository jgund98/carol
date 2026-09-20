// Back from Stripe after a website order. Verifies the session server-side,
// marks the order paid, tells Carol, sends the buyer a receipt. If the buyer
// backed out, the request still stands and they can pay now or later.
import type { Metadata } from "next";
import Link from "next/link";
import { getOrder, saveOrder } from "@/lib/studio/store";
import { paidSession } from "@/lib/studio/stripe";
import { alertCarol } from "@/lib/studio/alerts";
import { sendOrderPaid } from "@/lib/studio/customer-notify";
import { money, site } from "@/lib/site";
import { officeBase } from "@/lib/studio/mail";
import { carol } from "@/lib/studio/texts";
import { stripeEnabled } from "@/lib/studio/stripe";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

export default async function PaidPage({ searchParams }: { searchParams: Promise<{ session_id?: string; order?: string; cancelled?: string; err?: string }> }) {
  const { session_id, order, cancelled, err } = await searchParams;

  if (session_id) {
    const p = await paidSession(session_id);
    if (p && p.kind === "order") {
      let o = await getOrder(p.id);
      if (o && o.status !== "paid" && o.status !== "shipped" && o.status !== "delivered") {
        const now = new Date().toISOString();
        o = { ...o, status: "paid", paidAt: now, stripeSessionId: session_id };
        await saveOrder(o);
        try {
          await Promise.all([
            alertCarol({
              ...carol.orderPaid(o),
              fields: [["Buyer", o.name], ["Email", o.email], ["Phone", o.phone], ["Pieces", o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")], ["Amount", money(o.subtotal)], ["Ship to", [o.address, o.city, o.state, o.zip].filter(Boolean).join(", ")], ["Delivery", o.delivery]],
              link: `${officeBase()}/office/orders/${o.id}`,
            }),
            sendOrderPaid(o),
          ]);
        } catch (e) {
          console.error("[checkout/paid] notify:", e);
        }
      }
      if (o)
        return (
          <Wrap kicker={`Order ${o.ref}`} title="Paid. Thank you." text="Your payment went through and a receipt is on its way to your email. Carol will call to arrange delivery or installation personally.">
            <Link href="/shop" className="btn btn-line">Back to the collection</Link>
          </Wrap>
        );
    }
  }

  if (order) {
    const o = await getOrder(order);
    if (o)
      return (
        <Wrap kicker={`Order request ${o.ref}`} title={cancelled ? "No charge was made." : "Carol has your request."} text={err ? "The card page could not open just now. Your request is with Carol and she will call within one business day to settle it your way." : "Your request is with Carol either way. You can pay by card now, or wait for her call and settle it your way."}>
          {(o.status === "new" || o.status === "contacted") && stripeEnabled() && !err && <a href={`/p/${o.id}`} className="btn btn-pink">Pay {money(o.subtotal)} by card</a>}
          <a href={site.phoneHref} className="btn btn-line">Call {site.phone}</a>
        </Wrap>
      );
  }

  return (
    <Wrap kicker="Checkout" title="Thank you." text="If you completed a payment, Carol has it and will be in touch.">
      <Link href="/shop" className="btn btn-ink">Back to the collection</Link>
    </Wrap>
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
