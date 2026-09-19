import Link from "next/link";
import { Plus } from "lucide-react";
import { fmtMoney, listInvoices } from "@/lib/studio/invoices";
import { Empty, PageHead, Row, timeAgo } from "@/components/office/ui";
import { Tabs } from "@/components/office/Tabs";

const LABEL = { draft: "Not sent yet", sent: "Sent", paid: "Paid", void: "Void" } as const;
const TONE = { draft: "o-chip-muted", sent: "o-chip-ocean", paid: "o-chip-green", void: "o-chip-red" } as const;

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "unpaid" } = await searchParams;
  const all = await listInvoices();
  const unpaid = all.filter((i) => i.status === "draft" || i.status === "sent");
  const paid = all.filter((i) => i.status === "paid");
  const list = f === "unpaid" ? unpaid : f === "paid" ? paid : all;

  return (
    <>
      <PageHead
        kicker="Invoices"
        title={unpaid.length ? `${unpaid.length} waiting to be paid.` : "Invoices."}
        text="Write an invoice for a piece, a commission or a delivery, send it by email or text, and mark it paid when the money arrives."
        action={
          <Link href="/office/invoices/new" className="btn btn-pink w-full sm:w-auto">
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        }
      />
      <Tabs
        current={f}
        tabs={[
          { key: "unpaid", label: "Unpaid", count: unpaid.length, href: "/office/invoices" },
          { key: "paid", label: "Paid", count: paid.length, href: "/office/invoices?f=paid" },
          { key: "all", label: "All", count: all.length, href: "/office/invoices?f=all" },
        ]}
      />
      {list.length === 0 ? (
        <Empty title={all.length === 0 ? "No invoices yet." : "Nothing here."} text={all.length === 0 ? "Tap New invoice to write the first one." : undefined} />
      ) : (
        <div className="o-card o-in-view overflow-hidden">
          {list.map((i) => (
            <Row key={i.id} href={`/office/invoices/${i.id}`} isNew={i.status === "draft"} title={i.name || i.number} meta={<><span className={`o-chip ${TONE[i.status]}`}>{LABEL[i.status]}</span> · <b className="text-[var(--o-ink)]">{fmtMoney(i.totalCents)}</b> · {i.number} · {i.items[0]?.description ?? ""}</>} time={timeAgo(i.createdAt)} />
          ))}
        </div>
      )}
    </>
  );
}
