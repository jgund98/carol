import Link from "next/link";
import { listOrders } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { ORDER_STATUS, type OrderStatus } from "@/lib/studio/types";
import { Empty, OrderStatusChip, PageHead, Row, Thumb, timeAgo } from "@/components/office/ui";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "open" } = await searchParams;
  const all = await listOrders();
  const list = all.filter((o) => (f === "all" ? true : f === "open" ? o.status === "new" || o.status === "contacted" : o.status === (f as OrderStatus)));
  const newCount = all.filter((o) => o.status === "new").length;
  const filters = [
    { key: "open", label: "Open" },
    ...ORDER_STATUS.map((s) => ({ key: s.key, label: s.label })),
    { key: "all", label: "Everything" },
  ];

  return (
    <>
      <PageHead
        kicker="Orders"
        title={newCount ? `${newCount} new order${newCount === 1 ? "" : "s"}.` : "Orders from the website."}
        text="When someone checks out, their order lands here with the pieces, where it is going and how they would like to pay. You settle payment with them, then move the order along: paid, shipped, delivered."
      />

      <nav className="rail -mx-4 mb-3 flex gap-2 px-4 sm:mx-0 sm:mb-5 sm:flex-wrap sm:px-0" aria-label="Filter">
        {filters.map((x) => (
          <Link key={x.key} href={x.key === "open" ? "/office/orders" : `/office/orders?f=${x.key}`} className="o-choice shrink-0" data-on={f === x.key}>
            {x.label}
            {x.key === "new" && newCount > 0 && <span className="rounded-full bg-[var(--o-pink)] px-1.5 text-[0.7rem] font-extrabold text-white">{newCount}</span>}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <Empty title={all.length === 0 ? "No orders yet." : "Nothing here."} text={all.length === 0 ? "The first time someone checks out on the website, the order appears here and you get an email." : "Try a different filter above."} />
      ) : (
        <div className="o-card o-in-view overflow-hidden">
          {list.map((o) => (
            <Row
              key={o.id}
              href={`/office/orders/${o.id}`}
              isNew={o.status === "new"}
              tone="pink"
              flash={o.status === "new"}
              thumb={o.items[0] ? <Thumb work={{ ...o.items[0], imageSm: o.items[0].image, iw: 4, ih: 5, kind: "painting" }} size={48} /> : undefined}
              title={o.name || "Someone"}
              meta={<><OrderStatusChip status={o.status} /> · <b className="text-[var(--o-ink)]">{money(o.subtotal)}</b> · {o.items.map((i) => i.name).join(", ")}{o.city ? ` · ${o.city}, ${o.state}` : ""}</>}
              time={timeAgo(o.createdAt)}
            />
          ))}
        </div>
      )}
    </>
  );
}
