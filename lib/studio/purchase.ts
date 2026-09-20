// A purchase on the website: the buyer pays by card, then the order exists.
// Nothing is saved until the payment is confirmed, so an abandoned card page
// leaves no trace in Carol's office.
//
//   priceCart()        the pieces at their listed prices, checked server-side
//   completePurchase() record the paid order, mark the pieces sold, tell
//                      Carol, receipt the buyer (safe to call twice)
import { revalidatePath } from "next/cache";
import { getWorkBySlug, listOrders, newId, saveOrder, saveWork } from "./store";
import { alertCarol } from "./alerts";
import { sendOrderPaid } from "./customer-notify";
import { officeBase } from "./mail";
import { carol } from "./texts";
import { money } from "@/lib/site";
import { dims, img } from "@/lib/catalog";
import type { OrderItem, StudioOrder } from "./types";

export type Buyer = { name: string; email: string; phone: string; address: string; city: string; state: string; zip: string; delivery: string; message: string };
export type CartLine = { slug: string; qty: number };

export class PurchaseError extends Error {}

/** Look every piece up and price it from the catalog, never from the browser. */
export async function priceCart(lines: CartLine[]): Promise<{ items: OrderItem[]; subtotal: number }> {
  const items: OrderItem[] = [];
  for (const l of lines) {
    const w = await getWorkBySlug(l.slug);
    if (!w || w.hidden) throw new PurchaseError("One of the pieces is no longer available.");
    if (w.sold) throw new PurchaseError(`${w.name} has just sold.`);
    if (!w.price || w.price <= 0) throw new PurchaseError(`${w.name} is not priced for online purchase. Please call the studio.`);
    const qty = w.kind === "book" ? Math.max(1, Math.min(10, Math.floor(l.qty || 1))) : 1;
    items.push({ slug: w.slug, name: w.name, qty, price: w.price, image: img(w, "sm"), dims: dims(w) });
  }
  if (!items.length) throw new PurchaseError("Your selection is empty.");
  return { items, subtotal: items.reduce((s, i) => s + i.price * i.qty, 0) };
}

/** Pack a purchase into Stripe metadata (string values, 500 chars each). */
export function packPurchase(buyer: Buyer, lines: CartLine[]): Record<string, string> {
  const m: Record<string, string> = { kind: "order", items: lines.map((l) => `${l.slug}:${l.qty}`).join(",") };
  for (const k of Object.keys(buyer) as (keyof Buyer)[]) m[k] = String(buyer[k] || "").slice(0, 500);
  return m;
}

export function unpackPurchase(m: Record<string, string>): { buyer: Buyer; lines: CartLine[] } | null {
  if (m.kind !== "order" || !m.items) return null;
  const lines = m.items.split(",").filter(Boolean).map((s) => { const [slug, q] = s.split(":"); return { slug, qty: Number(q) || 1 }; });
  const buyer: Buyer = { name: m.name || "", email: m.email || "", phone: m.phone || "", address: m.address || "", city: m.city || "", state: m.state || "", zip: m.zip || "", delivery: m.delivery || "", message: m.message || "" };
  return { buyer, lines };
}

const newRef = () => `CC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/** Record a paid purchase. `sessionId` makes it idempotent: the same Stripe session never creates two orders. */
export async function completePurchase(buyer: Buyer, lines: CartLine[], sessionId: string | null): Promise<StudioOrder> {
  if (sessionId) {
    const existing = (await listOrders()).find((o) => o.stripeSessionId === sessionId);
    if (existing) return existing;
  }
  const { items, subtotal } = await priceCart(lines).catch(async () => {
    // The card was already charged: record the order with whatever the catalog says now, never lose a paid sale.
    const items: OrderItem[] = [];
    for (const l of lines) {
      const w = await getWorkBySlug(l.slug);
      if (w) items.push({ slug: w.slug, name: w.name, qty: w.kind === "book" ? l.qty || 1 : 1, price: w.price, image: img(w, "sm"), dims: dims(w) });
    }
    return { items, subtotal: items.reduce((s, i) => s + i.price * i.qty, 0) };
  });
  const now = new Date().toISOString();
  const o: StudioOrder = {
    id: newId("ord"),
    ref: newRef(),
    createdAt: now,
    updatedAt: now,
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    address: buyer.address,
    city: buyer.city,
    state: buyer.state,
    zip: buyer.zip,
    payment: sessionId ? "Card (Stripe)" : "Card (test)",
    delivery: buyer.delivery,
    message: buyer.message,
    items,
    subtotal,
    status: "paid",
    notes: null,
    paidAt: now,
    carrier: null,
    tracking: null,
    shippedAt: null,
    deliveredAt: null,
    refundedAt: null,
    refundAmount: null,
    refundNote: null,
    stripeSessionId: sessionId,
  };
  await saveOrder(o);

  // Originals are one of a kind: the moment one is paid for it comes off the shop.
  for (const it of items) {
    const w = await getWorkBySlug(it.slug);
    if (w && w.kind !== "book" && !w.sold) await saveWork({ ...w, sold: true, updatedAt: now });
  }
  try {
    revalidatePath("/", "layout");
  } catch {
    /* outside a request scope */
  }

  const t = carol.newSale(o);
  await Promise.all([
    alertCarol({
      ...t,
      fields: [
        ["Pieces", items.map((i) => `${i.name}${i.dims ? ` (${i.dims})` : ""}${i.qty > 1 ? ` × ${i.qty}` : ""} · ${money(i.price * i.qty)}`).join("\n")],
        ["Paid", `${money(subtotal)} by card`],
        ["Buyer", o.name],
        ["Phone", o.phone],
        ["Email", o.email],
        ["Ship to", [o.address, o.city, o.state, o.zip].filter(Boolean).join(", ")],
        ["Delivery", o.delivery],
        ["Their note", o.message],
      ],
      link: `${officeBase()}/office/orders/${o.id}`,
    }).catch((e) => console.error("[purchase] alert:", e)),
    sendOrderPaid(o).catch((e) => console.error("[purchase] receipt:", e)),
  ]);
  return o;
}
