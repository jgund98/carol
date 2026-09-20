// The buyer's view of an invoice. Private link (id + token), no login, prints
// cleanly. With Stripe connected there is a Pay button; coming back from
// Stripe with a paid session marks the invoice (and any linked order) paid.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreditCard } from "lucide-react";
import { getInvoice, saveInvoice } from "@/lib/studio/invoices";
import { getOrder, getSettings, saveOrder } from "@/lib/studio/store";
import { sessionPaid, stripeEnabled } from "@/lib/studio/stripe";
import { settleInvoice } from "@/lib/studio/settle";
import { fmtMoney } from "@/lib/studio/invoice-shared";
import { officeBase } from "@/lib/studio/mail";
import InvoiceDocument from "@/components/office/InvoiceDocument";
import PrintButton from "@/components/office/PrintButton";
import "../../office/office.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Invoice · Carol Calicchio Art Studio" }, robots: { index: false, follow: false } };

export default async function PublicInvoice({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string; session_id?: string; err?: string }> }) {
  const [{ id }, { k, session_id, err }] = await Promise.all([params, searchParams]);
  let inv = await getInvoice(id);
  if (!inv || !k || k !== inv.token) notFound();

  // Back from Stripe: verify server-side, then record the payment (the webhook may already have).
  if (session_id && inv.status !== "paid" && (await sessionPaid(session_id, inv.id))) inv = (await settleInvoice(inv.id, session_id)) ?? inv;

  const settings = await getSettings();
  const open = inv.status === "draft" || inv.status === "sent";
  const justPaid = Boolean(session_id) && inv.status === "paid";

  return (
    <div className="office">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-14 print:p-0">
        {justPaid && (
          <div className="o-card mx-auto mb-5 max-w-2xl p-5 text-center print:hidden">
            <p className="o-h2 text-[var(--o-green)]">Thank you, payment received.</p>
            <p className="o-muted mt-1 text-[0.95rem]">Carol will be in touch about delivery. A receipt from Stripe is on its way to your email.</p>
          </div>
        )}
        {err && <p className="o-card mx-auto mb-5 max-w-2xl p-4 text-center text-[0.95rem] text-[var(--o-red)] print:hidden">The payment page could not open just now. Please try again in a minute.</p>}
        {open && stripeEnabled() && (
          <form method="post" action={`/api/invoice/${inv.id}/checkout?k=${inv.token}`} className="mx-auto mb-5 max-w-2xl print:hidden">
            <button type="submit" className="btn btn-pink w-full sm:w-auto">
              <CreditCard className="h-4 w-4" /> Pay {fmtMoney(inv.totalCents)} by card
            </button>
          </form>
        )}
        <InvoiceDocument inv={inv} payInstructions={settings.payInstructions} />
        <div className="mt-6 flex justify-center print:hidden">
          <PrintButton />
        </div>
      </main>
    </div>
  );
}
