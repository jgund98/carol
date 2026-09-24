// A seat at one of Carol's classes, bought on the website. Same shape as a
// purchase: Stripe takes the card, then the booking exists as a paid order in
// her office, Carol is told, and the guest gets a confirmation.
import { revalidatePath } from "next/cache";
import { listOrders, newId, saveOrder } from "./store";
import { alertCarol } from "./alerts";
import { sendClassConfirmation } from "./customer-notify";
import { officeBase } from "./mail";
import { carol } from "./texts";
import { money } from "@/lib/site";
import { CLASS, classById, classDayYear, classSlug, classTime, upcomingClasses, type StudioClass } from "@/lib/classes";
import type { StudioOrder } from "./types";
import { PurchaseError } from "./purchase";
import { seatsTaken } from "./classes-server";

export type Guest = { name: string; email: string; phone: string; note: string };

/** Check the date is still open and has room, and return it. */
export async function reservable(classId: string, qty: number): Promise<StudioClass> {
  const c = classById(classId);
  if (!c || !upcomingClasses().some((u) => u.id === c.id)) throw new PurchaseError("That date is no longer open for reservations.");
  if (qty < 1 || qty > CLASS.maxSeats) throw new PurchaseError(`You can reserve between 1 and ${CLASS.maxSeats} seats at a time.`);
  const left = c.seats - ((await seatsTaken())[c.id] ?? 0);
  if (left <= 0) throw new PurchaseError("That evening is sold out.");
  if (qty > left) throw new PurchaseError(left === 1 ? "Only one seat is left for that evening." : `Only ${left} seats are left for that evening.`);
  return c;
}

export function packBooking(guest: Guest, classId: string, qty: number): Record<string, string> {
  return { kind: "class", classId, qty: String(qty), name: guest.name.slice(0, 200), email: guest.email.slice(0, 200), phone: guest.phone.slice(0, 40), note: guest.note.slice(0, 500) };
}

export function unpackBooking(m: Record<string, string>): { guest: Guest; classId: string; qty: number } | null {
  if (m.kind !== "class" || !m.classId) return null;
  return { guest: { name: m.name || "", email: m.email || "", phone: m.phone || "", note: m.note || "" }, classId: m.classId, qty: Math.max(1, Number(m.qty) || 1) };
}

const newRef = () => `CC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/** Record a paid booking. Idempotent on the Stripe session, so the return page and the webhook never double-book. */
export async function completeBooking(guest: Guest, classId: string, qty: number, sessionId: string): Promise<StudioOrder> {
  const existing = (await listOrders()).find((o) => o.stripeSessionId === sessionId);
  if (existing) return existing;
  const c = classById(classId);
  if (!c) throw new PurchaseError("Unknown class.");
  const now = new Date().toISOString();
  const o: StudioOrder = {
    id: newId("ord"),
    ref: newRef(),
    createdAt: now,
    updatedAt: now,
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    address: "",
    city: "",
    state: "",
    zip: "",
    payment: "Card (Stripe)",
    delivery: "In the studio",
    message: guest.note,
    items: [{ slug: classSlug(c), name: `${c.title} · ${classDayYear(c)}`, qty, price: c.price, image: CLASS.photo, dims: classTime(c) }],
    subtotal: c.price * qty,
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
  try {
    revalidatePath("/classes");
  } catch {
    /* outside a request scope */
  }
  const t = carol.newBooking(o, c, qty);
  await Promise.all([
    alertCarol({
      ...t,
      fields: [
        ["Class", c.title],
        ["When", `${classDayYear(c)}, ${classTime(c)}`],
        ["Seats", String(qty)],
        ["Paid", `${money(o.subtotal)} by card`],
        ["Guest", o.name],
        ["Phone", o.phone],
        ["Email", o.email],
        ["Their note", o.message],
      ],
      link: `${officeBase()}/office/orders/${o.id}`,
    }).catch((e) => console.error("[booking] alert:", e)),
    sendClassConfirmation(o, c, qty).catch((e) => console.error("[booking] confirmation:", e)),
  ]);
  return o;
}
