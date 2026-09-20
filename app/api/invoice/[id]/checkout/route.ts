// "Pay now" on an invoice: build a Stripe Checkout session and send the buyer
// there. The link needs the invoice's private token, like the page itself.
import { NextResponse } from "next/server";
import { getInvoice, saveInvoice, officeBase } from "@/lib/studio/invoices";
import { createInvoiceCheckout, stripeEnabled } from "@/lib/studio/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const k = new URL(req.url).searchParams.get("k") || "";
  const inv = await getInvoice(id);
  if (!inv || k !== inv.token) return new Response("Not found", { status: 404 });
  const back = new URL(`/invoice/${id}?k=${inv.token}`, officeBase());
  if (!stripeEnabled() || inv.status === "paid" || inv.status === "void") return NextResponse.redirect(back, { status: 303 });
  try {
    const url = await createInvoiceCheckout(inv, officeBase());
    if (!url) return NextResponse.redirect(back, { status: 303 });
    await saveInvoice({ ...inv, stripeSessionId: "pending" });
    return NextResponse.redirect(url, { status: 303 });
  } catch (e) {
    console.error("[checkout]", id, e);
    back.searchParams.set("err", "1");
    return NextResponse.redirect(back, { status: 303 });
  }
}
