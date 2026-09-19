import { listOrders } from "@/lib/studio/store";
import { money } from "@/lib/site";
import type { OrderStatus } from "@/lib/studio/types";
import { Empty, OrderStatusChip, PageHead, Row, Thumb, timeAgo } from "@/components/office/ui";
import { Tabs } from "@/components/office/Tabs";

const OPEN: OrderStatus[] = ["new", "contacted"];
const PAID: OrderStatus[] = ["paid", "shipped", "delivered"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "open" } = await searchParams;
  const all = await listOrders();
  const open = all.filter((o) => OPEN.includes(o.status));
  const paid = all.filter((o) => PAID.includes(o.status));
  const list = f === "open" ? open : f === "paid" ? paid : f === "all" ? all : all.filter((o) => o.status === (f as OrderStatus));
  const tab = f === "open" || f === "paid" || f === "all" ? f : PAID.includes(f as OrderStatus) ? "paid" : OPEN.includes(f as OrderStatus) ? "open" : "all";
  const newCount = all.filter((o) => o.status === "new").length;

  return (
    <>
      <PageHead kicker="Orders" title={newCount ? `${newCount} new order${newCount === 1 ? "" : "s"}.` : "Orders from the website."} text="Open orders are still being settled with the buyer. Paid orders have been paid and are being shipped or delivered." />

      <Tabs
        current={tab}
        tabs={[
          { key: "open", label: "Open", count: open.length, href: "/office/orders" },
          { key: "paid", label: "Paid", count: paid.length, href: "/office/orders?f=paid" },
          { key: "all", label: "All", count: all.length, href: "/office/orders?f=all" },
        ]}
      />

      {list.length === 0 ? (
        <Empty
          title={all.length === 0 ? "No orders yet." : tab === "open" ? "No open orders." : tab === "paid" ? "No paid orders yet." : "Nothing here."}
          text={all.length === 0 ? "The first time someone checks out on the website, the order appears here and you get an email." : tab === "open" ? "Every order has been paid or closed. Paid orders are under the Paid tab." : tab === "paid" ? "When you mark an open order Paid, it moves here." : undefined}
        />
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
              meta={
                <>
                  <OrderStatusChip status={o.status} /> · <b className="text-[var(--o-ink)]">{money(o.subtotal)}</b> · {o.items.map((i) => i.name).join(", ")}
                  {o.city ? ` · ${o.city}, ${o.state}` : ""}
                </>
              }
              time={timeAgo(o.createdAt)}
            />
          ))}
        </div>
      )}
    </>
  );
}
