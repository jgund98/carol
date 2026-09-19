import { notFound } from "next/navigation";
import { getInvoice, invoiceUrl } from "@/lib/studio/invoices";
import { getSettings } from "@/lib/studio/store";
import { PageHead, fullDate } from "@/components/office/ui";
import InvoiceDocument from "@/components/office/InvoiceDocument";
import InvoiceActions from "@/components/office/InvoiceActions";

const LABEL = { draft: "Not sent yet", sent: "Sent", paid: "Paid", void: "Void" } as const;
const TONE = { draft: "o-chip-muted", sent: "o-chip-ocean", paid: "o-chip-green", void: "o-chip-red" } as const;

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
            <InvoiceActions inv={inv} url={url} />
            <p className="mt-4 break-all text-[0.8rem] text-[var(--o-faint)]">{url}</p>
          </section>
          {(inv.emailedAt || inv.textedAt || inv.paidAt) && (
            <section className="o-card-soft p-4 text-[0.9rem] text-[var(--o-soft)]">
              {inv.emailedAt && <p>Emailed {fullDate(inv.emailedAt)}</p>}
              {inv.textedAt && <p>Texted {fullDate(inv.textedAt)}</p>}
              {inv.paidAt && <p className="font-semibold text-[var(--o-green)]">Paid {fullDate(inv.paidAt)}</p>}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
