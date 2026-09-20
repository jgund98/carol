import { notFound } from "next/navigation";
import { getInvoice, invoiceUrl } from "@/lib/studio/invoices";
import { getSettings } from "@/lib/studio/store";
import { PageHead, fullDate } from "@/components/office/ui";
import InvoiceDocument from "@/components/office/InvoiceDocument";
import InvoiceActions from "@/components/office/InvoiceActions";
import { stripeEnabled } from "@/lib/studio/stripe";

const LABEL = { draft: "Not sent yet", sent: "Sent", paid: "Paid", refunded: "Refunded", void: "Void" } as const;
const TONE = { draft: "o-chip-muted", sent: "o-chip-ocean", paid: "o-chip-green", refunded: "o-chip-red", void: "o-chip-red" } as const;

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string }> }) {
  const [{ id }, { sent }] = await Promise.all([params, searchParams]);
  const justSent = sent ? sent.split(",").filter(Boolean) : [];
  const [inv, settings] = await Promise.all([getInvoice(id), getSettings()]);
  if (!inv) notFound();
  const url = invoiceUrl(inv);

  return (
    <>
      <PageHead back={{ href: "/office/invoices", label: "All invoices" }} kicker={`${inv.number} · ${fullDate(inv.createdAt)}`} title={inv.name || inv.number} action={<span className={`o-chip ${TONE[inv.status]}`}>{LABEL[inv.status]}</span>} />
      <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.3fr_0.8fr] lg:items-start">
        <div className="order-2 lg:order-1">
          <InvoiceDocument inv={inv} payInstructions={settings.payInstructions} />
        </div>
        <aside className="order-1 grid gap-3 sm:gap-5 lg:order-2 lg:sticky lg:top-12">
          <section className="o-card p-4 sm:p-6">
            <InvoiceActions inv={inv} url={url} justSent={justSent} />
            <p className="mt-4 break-all text-[0.8rem] text-[var(--o-faint)]">{url}</p>
            <p className="mt-2 text-[0.82rem] text-[var(--o-faint)]">{stripeEnabled() ? "The buyer can pay by card from this link; it marks itself paid." : "Card payments are not switched on yet; mark it paid when the money arrives."}</p>
          </section>
          {inv.paidAt && (
            <section className="o-card-soft p-4 text-[0.9rem]">
              <p className="font-semibold text-[var(--o-green)]">Paid {fullDate(inv.paidAt)}{inv.paidHow === "card" ? " by card" : ""}</p>
              {inv.receiptSentAt && <p className="text-[var(--o-soft)]">Receipt sent to the buyer.</p>}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
