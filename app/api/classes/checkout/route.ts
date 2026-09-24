// Reserve seats at a class: check the date and the room, then open Stripe
// Checkout for exactly seats × price. The booking exists only once Stripe
// confirms payment (see /classes/reserved and the webhook).
import { createClassCheckout, stripeEnabled } from "@/lib/studio/stripe";
import { reservable, type Guest } from "@/lib/studio/bookings";
import { PurchaseError } from "@/lib/studio/purchase";
import { officeBase } from "@/lib/studio/mail";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const s = (v: unknown) => String(v ?? "").trim();

export async function POST(req: Request) {
  let body: Partial<Guest> & { classId?: string; qty?: number; _honey?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (body._honey) return Response.json({ ok: true, url: "/classes" });
  const guest: Guest = { name: s(body.name), email: s(body.email).toLowerCase(), phone: s(body.phone), note: s(body.note) };
  const qty = Math.floor(Number(body.qty) || 1);
  if (!guest.name || !guest.email || !guest.phone) return Response.json({ ok: false, error: "Please fill in your name, email and mobile number." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) return Response.json({ ok: false, error: "That email address does not look right." }, { status: 400 });
  if (guest.phone.replace(/\D/g, "").length < 10) return Response.json({ ok: false, error: "Please enter a 10-digit mobile number so we can text your confirmation." }, { status: 400 });
  try {
    const c = await reservable(s(body.classId), qty);
    if (!stripeEnabled()) return Response.json({ ok: false, error: `Online reservations are being switched on. To reserve now, call Carol at ${site.phone}.` }, { status: 503 });
    const url = await createClassCheckout({ guest, cls: c, qty }, officeBase());
    if (!url) throw new Error("no checkout url");
    return Response.json({ ok: true, url });
  } catch (e) {
    if (e instanceof PurchaseError) return Response.json({ ok: false, error: e.message }, { status: 409 });
    console.error("[classes/checkout]", e);
    return Response.json({ ok: false, error: `The payment page could not open. Please call Carol at ${site.phone}.` }, { status: 500 });
  }
}
