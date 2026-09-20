// Card payments through Stripe Checkout, for the website and for invoices.
// Same plumbing as Epic: the amount comes straight from the pieces' listed
// prices (or the invoice lines), a hosted Checkout page collects the card, and
// the return page verifies the session server-side before anything is
// recorded as paid. Switched on by STRIPE_SECRET_KEY.
import Stripe from "stripe";
import type { StudioInvoice } from "./invoice-shared";
import type { OrderItem } from "./types";
import { packPurchase, type Buyer, type CartLine } from "./purchase";

// Only a real Stripe secret counts; anything else pasted in the env var is ignored.
const key = (process.env.STRIPE_SECRET_KEY || "").trim();
export const stripe = /^(sk|rk)_(live|test)_/.test(key) ? new Stripe(key) : null;
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

/** Hosted Checkout for a website purchase: one line per piece at its listed price. The order is created only after payment. */
export async function createOrderCheckout(p: { buyer: Buyer; lines: CartLine[]; items: OrderItem[]; subtotal: number }, baseUrl: string): Promise<string | null> {
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: p.buyer.email || undefined,
    line_items: p.items.map((it) => ({
      quantity: it.qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(it.price * 100),
        product_data: { name: it.name.slice(0, 120), description: it.dims ? `${it.dims} · Original by Carol Calicchio` : "Original by Carol Calicchio", images: it.image.startsWith("http") ? [it.image] : undefined },
      },
    })),
    metadata: packPurchase(p.buyer, p.lines),
    payment_intent_data: { description: `Carol Calicchio Art Studio · ${p.items.map((i) => i.name).join(", ").slice(0, 200)}` },
    success_url: `${baseUrl}/checkout/paid?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout?cancelled=1`,
  });
  return session.url;
}

/** After Stripe sends the buyer back: did that session actually pay, and what for? */
export async function paidSession(sessionId: string): Promise<{ kind: "invoice"; id: string } | { kind: "order"; metadata: Record<string, string> } | null> {
  if (!stripe) return null;
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.payment_status !== "paid") return null;
    const m = (s.metadata || {}) as Record<string, string>;
    if (m.kind === "order") return { kind: "order", metadata: m };
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

/** Was this paid through a real Stripe Checkout session (not a simulated test purchase)? */
export const isStripeSession = (id: string | null | undefined) => Boolean(id && id.startsWith("cs_"));

/** Send money back to the card that paid a Checkout session. `cents` may be less than the charge (partial refund). */
export async function refundSession(sessionId: string, cents: number, reason?: string): Promise<{ id: string; amount: number }> {
  if (!stripe) throw new Error("Card payments are not switched on.");
  const s = await stripe.checkout.sessions.retrieve(sessionId);
  const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
  if (!pi) throw new Error("No payment found for this order in Stripe.");
  const r = await stripe.refunds.create({ payment_intent: pi, amount: Math.round(cents), metadata: reason ? { reason: reason.slice(0, 500) } : undefined });
  return { id: r.id, amount: r.amount };
}
