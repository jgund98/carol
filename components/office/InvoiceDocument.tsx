// The invoice itself: what Carol previews, what the buyer opens, what prints.
import Image from "next/image";
import { site } from "@/lib/site";
import { fmtDate, fmtMoney, type StudioInvoice } from "@/lib/studio/invoice-shared";

/** 5615550142 → 561-555-0142; anything else is shown as typed. */
function prettyPhone(p: string | null | undefined): string {
  const d = (p || "").replace(/D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d[0] === "1") return `${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
  return p || "";
}

export default function InvoiceDocument({ inv, payInstructions }: { inv: StudioInvoice; payInstructions: string }) {
  return (
    <article className="o-card mx-auto max-w-2xl p-6 sm:p-10 print:max-w-none print:border-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <Image src="/brand/sig-ink.png" alt="Carol Calicchio" width={420} height={132} className="h-auto w-[170px] sm:w-[200px]" />
        <div className="text-right">
          <p className="o-h2">Invoice</p>
          <p className="text-[0.9rem] text-[var(--o-soft)]">{inv.number}</p>
          {inv.status === "paid" && <p className="mt-1 text-[0.9rem] font-semibold text-[var(--o-green)]">Paid{inv.paidAt ? ` · ${fmtDate(inv.paidAt)}` : ""}</p>}
          {inv.status === "void" && <p className="mt-1 text-[0.9rem] font-semibold text-[var(--o-red)]">Void</p>}
        </div>
      </div>

      <div className="mt-8 grid gap-5 text-[0.95rem] sm:grid-cols-2">
        <div>
          <p className="o-label">From</p>
          <p className="mt-1 font-semibold">{site.studio.name}</p>
          <p className="text-[var(--o-soft)]">
            {site.studio.street}
            <br />
            {site.studio.city}, {site.studio.state} {site.studio.zip}
            <br />
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div>
          <p className="o-label">To</p>
          <p className="mt-1 font-semibold">{inv.name || "—"}</p>
          <p className="break-words text-[var(--o-soft)]">
            {inv.email}
            {inv.email && inv.phone ? <br /> : null}
            {prettyPhone(inv.phone)}
          </p>
          <p className="mt-3 text-[var(--o-soft)]">
            Issued <span className="font-semibold text-[var(--o-ink)]">{fmtDate(inv.createdAt)}</span>
            {inv.dueDate && (
              <>
                <br />
                Due <span className="font-semibold text-[var(--o-ink)]">{fmtDate(inv.dueDate)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <table className="mt-8 w-full text-[0.98rem]">
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i} className="border-b border-[var(--o-hair)]">
              <td className="py-3 pr-4">{it.description}</td>
              <td className="o-num whitespace-nowrap py-3 text-right text-[1.1rem]">{fmtMoney(it.cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-baseline justify-end gap-6">
        <span className="text-[var(--o-soft)]">Total</span>
        <span className="o-num text-[2rem]">{fmtMoney(inv.totalCents)}</span>
      </div>

      {inv.note && <p className="mt-6 whitespace-pre-line border-t border-[var(--o-hair)] pt-5 text-[0.95rem] text-[var(--o-soft)]">{inv.note}</p>}
      {payInstructions && inv.status !== "paid" && inv.status !== "void" && (
        <div className="mt-6 rounded-2xl bg-[var(--o-paper)] p-4 text-[0.95rem]">
          <p className="font-semibold">How to pay</p>
          <p className="mt-1 whitespace-pre-line text-[var(--o-soft)]">{payInstructions}</p>
        </div>
      )}
      <p className="mt-8 text-[0.85rem] text-[var(--o-faint)]">Thank you. Every piece is original and signed by the artist.</p>
    </article>
  );
}
