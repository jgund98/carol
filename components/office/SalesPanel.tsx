"use client";
// Sales at a glance, the way every dashboard does it: pick a window, see the
// money. A sale counts once it is paid (paid, shipped or delivered); requests
// that have not been paid yet are "orders waiting", not revenue. Refunds and
// cancellations never count.
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { money } from "@/lib/site";
import type { OrderStatus } from "@/lib/studio/types";
import { OrderStatusChip, timeAgo } from "./ui";

export type SlimOrder = { id: string; name: string; subtotal: number; status: OrderStatus; createdAt: string; paidAt: string | null; refundAmount: number | null; pieces: number; first: string };

const WINDOWS = [
  { key: "1", label: "Today", days: 1 },
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "all", label: "All time", days: 0 },
] as const;
type Key = (typeof WINDOWS)[number]["key"];

const PAID: OrderStatus[] = ["paid", "shipped", "delivered"];

export default function SalesPanel({ orders }: { orders: SlimOrder[] }) {
  const [win, setWin] = useState<Key>("7");
  const days = WINDOWS.find((w) => w.key === win)!.days;
  const since = days ? Date.now() - days * 86400000 : 0;

  const view = useMemo(() => {
    const inWindow = (iso: string | null) => Boolean(iso) && new Date(iso as string).getTime() >= since;
    const sales = orders.filter((o) => PAID.includes(o.status) && inWindow(o.paidAt ?? o.createdAt)).sort((a, b) => (b.paidAt ?? b.createdAt).localeCompare(a.paidAt ?? a.createdAt));
    const requests = orders.filter((o) => inWindow(o.createdAt)).length;
    const revenue = sales.reduce((n, o) => n + o.subtotal, 0);
    const pieces = sales.reduce((n, o) => n + o.pieces, 0);
    const refunded = orders.filter((o) => o.status === "refunded" && inWindow(o.createdAt)).reduce((n, o) => n + (o.refundAmount ?? 0), 0);
    return { sales, requests, revenue, pieces, refunded };
  }, [orders, since]);

  return (
    <section className="o-card o-in-view overflow-hidden" style={{ animationDelay: "150ms" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
        <h2 className="o-h2 inline-flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[var(--o-pink)]" /> Sales
        </h2>
        <div className="flex gap-1 rounded-full bg-[rgba(18,23,43,0.05)] p-1" role="tablist" aria-label="Time window">
          {WINDOWS.map((w) => (
            <button key={w.key} type="button" role="tab" aria-selected={win === w.key} onClick={() => setWin(w.key)} className={`rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${win === w.key ? "bg-[var(--o-ink)] text-white" : "text-[var(--o-soft)] hover:text-[var(--o-ink)]"}`}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--o-hair)] border-y border-[var(--o-hair)]">
        <Figure n={money(view.revenue)} label="Revenue" big />
        <Figure n={String(view.sales.length)} label={view.sales.length === 1 ? "Sale" : "Sales"} />
        <Figure n={String(view.pieces)} label={view.pieces === 1 ? "Piece sold" : "Pieces sold"} />
      </div>

      {view.sales.length === 0 ? (
        <p className="o-muted px-4 py-5 text-[0.95rem] sm:px-6">
          No paid sales {win === "all" ? "yet" : `in the last ${days === 1 ? "day" : `${days} days`}`}.{view.requests > 0 ? ` ${view.requests} order request${view.requests === 1 ? "" : "s"} came in; mark one Paid once the money arrives and it lands here.` : ""}
        </p>
      ) : (
        <div>
          {view.sales.slice(0, 6).map((o) => (
            <Link key={o.id} href={`/office/orders/${o.id}`} className="o-row">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[1rem] font-semibold">
                  {o.name} · {o.first}
                  {o.pieces > 1 ? ` +${o.pieces - 1}` : ""}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-[0.82rem] text-[var(--o-faint)]">
                  <OrderStatusChip status={o.status} /> {timeAgo(o.paidAt ?? o.createdAt)}
                </p>
              </div>
              <span className="o-num shrink-0 text-[1.2rem]">{money(o.subtotal)}</span>
              <ArrowRight className="hidden h-5 w-5 shrink-0 text-[var(--o-faint)] sm:block" />
            </Link>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--o-hair)] px-4 py-3 text-[0.82rem] text-[var(--o-faint)] sm:px-6">
        <span>
          {view.requests} request{view.requests === 1 ? "" : "s"} in this window{view.refunded ? ` · ${money(view.refunded)} refunded` : ""}
        </span>
        <Link href="/office/orders?f=all" className="font-semibold text-[var(--o-soft)] hover:text-[var(--o-ink)]">
          All orders
        </Link>
      </div>
    </section>
  );
}

function Figure({ n, label, big = false }: { n: string; label: string; big?: boolean }) {
  return (
    <div className="min-w-0 px-3 py-3 text-center sm:py-4">
      <p className={`o-num truncate ${big ? "text-[1.5rem] sm:text-[2.1rem]" : "text-[1.5rem] sm:text-[2.1rem]"}`}>{n}</p>
      <p className="o-label mt-1 text-[0.58rem] tracking-[0.12em] sm:text-[0.66rem]">{label}</p>
    </div>
  );
}
