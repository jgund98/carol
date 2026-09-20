// Stripe calls this when a Checkout session is paid, so a purchase or invoice
// is recorded even if the buyer closes the tab before coming back to the
// site. Register the endpoint in Stripe (Developers → Webhooks) for
// checkout.session.completed and checkout.session.async_payment_succeeded,
// and put its signing secret in STRIPE_WEBHOOK_SECRET.
import type Stripe from "stripe";
import { stripe } from "@/lib/studio/stripe";
import { completePurchase, unpackPurchase } from "@/lib/studio/purchase";
import { settleInvoice } from "@/lib/studio/settle";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Webhook not configured", { status: 503 });
  const sig = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    console.error("[webhook] bad signature:", e);
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status === "paid") {
      const m = (s.metadata || {}) as Record<string, string>;
      try {
        if (m.kind === "order") {
          const u = unpackPurchase(m);
          if (u) await completePurchase(u.buyer, u.lines, s.id);
        } else if (m.invoiceId) {
          await settleInvoice(m.invoiceId, s.id);
        }
      } catch (e) {
        console.error("[webhook] settle:", e);
        return new Response("Settle failed", { status: 500 });
      }
    }
  }
  return Response.json({ received: true });
}
