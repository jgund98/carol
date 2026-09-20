// Card payments through Stripe Checkout, for invoices and for the website's
// checkout. Same plumbing as Epic: the amount comes straight from the pieces'
// prices (or the invoice lines), a hosted Checkout page collects the card, and
// the return page verifies the session server-side before anything is marked
// paid. Switched on by STRIPE_SECRET_KEY.
import Stripe from "stripe";
import type { StudioInvoice } from "./invoice-shared";
import type { StudioOrder } from "./types";

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
    metadata: { kind: "invoice", invoiceId: inv.id, invoiceNumber: inv.number },
    payment_intent_data: { description: `Invoice ${inv.number} · Carol Calicchio Art Studio` },
    success_url: `${back}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: back,
  });
  return session.url;
}

/** Hosted Checkout for a website order: one line per piece at its listed price. */
export async function createOrderCheckout(o: StudioOrder, baseUrl: string): Promise<string | null> {
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: o.email || undefined,
    line_items: o.items.map((it) => ({
      quantity: it.qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(it.price * 100),
        product_data: { name: it.name.slice(0, 120), description: it.dims ? `${it.dims} · Original by Carol Calicchio` : "Original by Carol Calicchio", images: it.image.startsWith("http") ? [it.image] : undefined },
      },
    })),
    metadata: { kind: "order", orderId: o.id, ref: o.ref },
    payment_intent_data: { description: `Order ${o.ref} · Carol Calicchio Art Studio` },
    success_url: `${baseUrl}/checkout/paid?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/paid?order=${o.id}&cancelled=1`,
  });
  return session.url;
}

/** After Stripe sends the buyer back: did that session actually pay, and for what? */
export async function paidSession(sessionId: string): Promise<{ kind: "invoice" | "order"; id: string } | null> {
  if (!stripe) return null;
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.payment_status !== "paid") return null;
    const m = s.metadata || {};
    if (m.kind === "invoice" && m.invoiceId) return { kind: "invoice", id: m.invoiceId };
    if (m.kind === "order" && m.orderId) return { kind: "order", id: m.orderId };
    // older sessions carried only invoiceId
    if (m.invoiceId) return { kind: "invoice", id: m.invoiceId };
    return null;
  } catch {
    return null;
  }
}

export async function sessionPaid(sessionId: string, invoiceId: string): Promise<boolean> {
  const p = await paidSession(sessionId);
  return Boolean(p && p.kind === "invoice" && p.id === invoiceId);
}
