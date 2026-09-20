// Card payments for invoices through Stripe Checkout. Switched on by
// STRIPE_SECRET_KEY; without it the invoice simply shows "How to pay".
import Stripe from "stripe";
import type { StudioInvoice } from "./invoice-shared";

const key = process.env.STRIPE_SECRET_KEY;
export const stripe = key ? new Stripe(key) : null;
export const stripeEnabled = () => Boolean(stripe);

/** Hosted Checkout for one invoice. Returns the URL to send the buyer to. */
export async function createInvoiceCheckout(inv: StudioInvoice, baseUrl: string): Promise<string | null> {
  if (!stripe) return null;
  const back = `${baseUrl}/invoice/${inv.id}?k=${inv.token}`;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: inv.email || undefined,
    line_items: inv.items.map((it) => ({
      quantity: 1,
      price_data: { currency: "usd", unit_amount: it.cents, product_data: { name: it.description.slice(0, 120) } },
    })),
    metadata: { invoiceId: inv.id, invoiceNumber: inv.number },
    payment_intent_data: { description: `Invoice ${inv.number} · Carol Calicchio Art Studio` },
    success_url: `${back}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: back,
  });
  return session.url;
}

/** After Stripe sends the buyer back: did that session actually pay? */
export async function sessionPaid(sessionId: string, invoiceId: string): Promise<boolean> {
  if (!stripe) return false;
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    return s.payment_status === "paid" && s.metadata?.invoiceId === invoiceId;
  } catch {
    return false;
  }
}
