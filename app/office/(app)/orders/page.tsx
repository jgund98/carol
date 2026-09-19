import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listOrders } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { ORDER_STATUS, type OrderStatus } from "@/lib/studio/types";
import { Empty, NewDot, OrderStatusChip, PageHead, Thumb, timeAgo } from "@/components/office/ui";

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
        text="When someone checks out, their order lands here with the pieces, where it is going and how they would like to pay. Card payments through the website are coming once Stripe is connected; until then you settle payment with them directly, as you do today."
      />

      <nav className="rail -mx-5 mb-5 flex gap-2 px-5 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter">
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
            <Link key={o.id} href={`/office/orders/${o.id}`} className="o-row">
              <NewDot on={o.status === "new"} />
              {o.items[0] && <Thumb work={{ ...o.items[0], imageSm: o.items[0].image, iw: 4, ih: 5, kind: "painting" }} size={56} />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusChip status={o.status} />
                  <span className="text-[0.82rem] text-[var(--o-faint)]">
                    {o.ref} · {timeAgo(o.createdAt)}
                  </span>
                </div>
                <p className={`mt-1 truncate text-[1.05rem] ${o.status === "new" ? "font-semibold" : ""}`}>
                  {o.name || "Someone"} · {o.items.map((i) => i.name).join(", ")}
                </p>
                <p className="truncate text-[0.9rem] text-[var(--o-soft)]">
                  <span className="font-semibold text-[var(--o-ink)] sm:hidden">{money(o.subtotal)} · </span>
                  {o.city ? `${o.city}, ${o.state}` : ""} · {o.delivery}
                </p>
              </div>
              <span className="o-num hidden shrink-0 text-[1.3rem] sm:block">{money(o.subtotal)}</span>
              <ArrowRight className="hidden h-5 w-5 shrink-0 text-[var(--o-faint)] sm:block" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
