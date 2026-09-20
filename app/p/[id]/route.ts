// Pay a website order by card: /p/<id> opens Stripe Checkout for exactly the
// order's total (each piece at its listed price). If cards are off or the
// order is already settled, the buyer lands on the order's thank-you page.
import { redirect } from "next/navigation";
import { getOrder } from "@/lib/studio/store";
import { createOrderCheckout, stripeEnabled } from "@/lib/studio/stripe";
import { officeBase } from "@/lib/studio/mail";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOrder(id);
  if (!o) return new Response("Not found", { status: 404 });
  const fallback = `/checkout/paid?order=${encodeURIComponent(o.id)}`;
  if (!stripeEnabled() || (o.status !== "new" && o.status !== "contacted")) redirect(fallback);
  try {
    const url = await createOrderCheckout(o, officeBase());
    if (url) return Response.redirect(url, 303);
  } catch (e) {
    console.error("[pay] order", id, e);
  }
  redirect(`${fallback}&err=1`);
}
