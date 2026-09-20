import Link from "next/link";
import { Plus } from "lucide-react";
import { fmtMoney, listInvoices } from "@/lib/studio/invoices";
import type { StudioInvoice } from "@/lib/studio/invoice-shared";
import { Empty, PageHead, Row, timeAgo } from "@/components/office/ui";
import { SelectFilter, Tabs } from "@/components/office/Tabs";

const LABEL = { draft: "Not sent yet", sent: "Sent, awaiting payment", paid: "Paid ✓", refunded: "Refunded", void: "Void" } as const;
const TONE = { draft: "o-chip-gold", sent: "o-chip-ocean", paid: "o-chip-green", refunded: "o-chip-red", void: "o-chip-red" } as const;
const RANK = { draft: 0, sent: 1, paid: 2, refunded: 3, void: 4 } as const;

const SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "amount", label: "Largest amount" },
  { key: "status", label: "By status" },
];

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ f?: string; sort?: string }> }) {
  const { f = "unpaid", sort = "newest" } = await searchParams;
  const all = await listInvoices();
  const unpaid = all.filter((i) => i.status === "draft" || i.status === "sent");
  const paid = all.filter((i) => i.status === "paid");
  const base = f === "unpaid" ? unpaid : f === "paid" ? paid : all;
  const by: Record<string, (a: StudioInvoice, b: StudioInvoice) => number> = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
    amount: (a, b) => b.totalCents - a.totalCents,
    status: (a, b) => RANK[a.status] - RANK[b.status] || b.createdAt.localeCompare(a.createdAt),
  };
  const list = [...base].sort(by[sort] ?? by.newest);
  const owed = unpaid.reduce((n, i) => n + i.totalCents, 0);

  return (
    <>
      <PageHead
        kicker="Invoices"
        title={unpaid.length ? `${unpaid.length} awaiting payment · ${fmtMoney(owed)}` : "Invoices."}
        text="Write an invoice for a piece, a commission or a delivery. It is emailed and texted the moment you save it; mark it paid when the money arrives, or let a card payment mark it for you."
        action={
          <Link href="/office/invoices/new" className="btn btn-pink w-full sm:w-auto">
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          current={f}
          tabs={[
            { key: "unpaid", label: "Unpaid", count: unpaid.length, href: `/office/invoices?sort=${sort}` },
            { key: "paid", label: "Paid", count: paid.length, href: `/office/invoices?f=paid&sort=${sort}` },
            { key: "all", label: "All", count: all.length, href: `/office/invoices?f=all&sort=${sort}` },
          ]}
        />
        <div className="mb-4">
          <SelectFilter label="Sort" param="sort" value={sort} base={`/office/invoices?f=${f}`} options={SORTS} />
        </div>
      </div>
      {list.length === 0 ? (
        <Empty title={all.length === 0 ? "No invoices yet." : f === "unpaid" ? "Nothing awaiting payment." : "Nothing here."} text={all.length === 0 ? "Tap New invoice to write the first one." : undefined} />
      ) : (
        <div className="o-card o-in-view overflow-hidden">
          {list.map((i) => (
            <Row
              key={i.id}
              href={`/office/invoices/${i.id}`}
              isNew={i.status === "draft"}
              title={i.name || i.number}
              meta={
                <>
                  <span className={`o-chip ${TONE[i.status]}`}>{LABEL[i.status]}</span> · <b className="text-[var(--o-ink)]">{fmtMoney(i.totalCents)}</b> · {i.number}
                  {i.items[0] ? ` · ${i.items[0].description}` : ""}
                </>
              }
              time={i.status === "paid" && i.paidAt ? `paid ${timeAgo(i.paidAt)}` : timeAgo(i.createdAt)}
            />
          ))}
        </div>
      )}
    </>
  );
}
