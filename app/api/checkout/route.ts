// Checkout: price the selection server-side and open Stripe Checkout for
// exactly that amount. The order is only recorded once Stripe confirms
// payment (see /checkout/paid). While testing without a Stripe key, a test
// buyer's purchase is recorded as paid straight away so the notifications
// can be seen end to end.
import { createOrderCheckout, stripeEnabled } from "@/lib/studio/stripe";
import { completePurchase, packPurchase, priceCart, PurchaseError, type Buyer, type CartLine } from "@/lib/studio/purchase";
import { isTester } from "@/lib/studio/notify";
import { officeBase } from "@/lib/studio/mail";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Body = Partial<Buyer> & { items?: CartLine[]; _honey?: string };
const s = (v: unknown) => String(v ?? "").trim();

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (body._honey) return Response.json({ ok: true, url: "/shop" });
  const buyer: Buyer = { name: s(body.name), email: s(body.email).toLowerCase(), phone: s(body.phone), address: s(body.address), city: s(body.city), state: s(body.state), zip: s(body.zip), delivery: s(body.delivery), message: s(body.message) };
  const lines: CartLine[] = (body.items || []).map((i) => ({ slug: s(i.slug), qty: Number(i.qty) || 1 })).filter((i) => i.slug);
  if (!buyer.name || !buyer.email || !buyer.phone) return Response.json({ ok: false, error: "Please fill in your name, email and phone." }, { status: 400 });

  try {
    const { items, subtotal } = await priceCart(lines);
    if (stripeEnabled()) {
      const url = await createOrderCheckout({ buyer, lines, items, subtotal }, officeBase());
      if (!url) throw new Error("no checkout url");
      return Response.json({ ok: true, url });
    }
    if (isTester(buyer.email)) {
      const o = await completePurchase(buyer, lines, null);
      return Response.json({ ok: true, url: `/checkout/paid?order=${o.id}` });
    }
    return Response.json({ ok: false, error: `Card payments are being switched on. To purchase now, call Carol at ${site.phone}.` }, { status: 503 });
  } catch (e) {
    if (e instanceof PurchaseError) return Response.json({ ok: false, error: e.message }, { status: 409 });
    console.error("[checkout]", e);
    return Response.json({ ok: false, error: `The payment page could not open. Please call Carol at ${site.phone}.` }, { status: 500 });
  }
}
