// Today: what is waiting, at a glance, in the order it came in.
import Link from "next/link";
import { Plus, ArrowRight, ExternalLink } from "lucide-react";
import { listAllWorks, listInquiries, listOrders } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { KindChip, NewDot, OrderChip, PageHead, Thumb, timeAgo, personLine } from "@/components/office/ui";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Today() {
  const [inq, ord, works] = await Promise.all([listInquiries(), listOrders(), listAllWorks()]);
  const newInq = inq.filter((i) => i.status === "new");
  const newOrd = ord.filter((o) => o.status === "new");
  const forSale = works.filter((w) => !w.hidden && !w.sold && w.available).length;
  const sold = works.filter((w) => w.sold).length;
  const waiting = [
    ...newOrd.map((o) => ({ kind: "order" as const, at: o.createdAt, o })),
    ...newInq.map((i) => ({ kind: "inquiry" as const, at: i.createdAt, i })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const total = waiting.length;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const recentDone = [...inq.filter((i) => i.status === "handled"), ...ord.filter((o) => o.status !== "new")]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <>
      <PageHead
        kicker={today}
        title={`${greeting()}, Carol.`}
        text={
          total === 0
            ? "Nothing is waiting on you. Enjoy the studio."
            : `You have ${newOrd.length ? `${newOrd.length} new order${newOrd.length === 1 ? "" : "s"}` : ""}${newOrd.length && newInq.length ? " and " : ""}${newInq.length ? `${newInq.length} new inquir${newInq.length === 1 ? "y" : "ies"}` : ""}.`
        }
      />

      {/* the numbers */}
      <section className="o-card o-in-view grid grid-cols-4 divide-x divide-[var(--o-hair)] overflow-hidden" style={{ animationDelay: "60ms" }}>
        <Stat href="/office/inbox" n={newInq.length} label="New inquiries" hot={newInq.length > 0} />
        <Stat href="/office/orders" n={newOrd.length} label="New orders" hot={newOrd.length > 0} />
        <Stat href="/office/artwork?f=sale" n={forSale} label="For sale" />
        <Stat href="/office/artwork?f=sold" n={sold} label="Sold" />
      </section>

      {/* what needs her */}
      <section className="o-in-view mt-5 sm:mt-9" style={{ animationDelay: "120ms" }}>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="o-h2">{total ? "Waiting for you" : "All caught up"}</h2>
          {total > 0 && (
            <Link href="/office/inbox" className="text-[0.95rem] font-semibold text-[var(--o-soft)] hover:text-[var(--o-ink)]">
              See everything
            </Link>
          )}
        </div>
        {total === 0 ? (
          <div className="o-card-soft px-6 py-10 text-center">
            <p className="o-kicker">Every inquiry and order has been looked after.</p>
            <p className="o-muted mt-2 text-[0.95rem]">New ones will appear here the moment they arrive, and you will get an email too.</p>
          </div>
        ) : (
          <div className="o-card overflow-hidden">
            {waiting.map((w) =>
              w.kind === "order" ? (
                <Link key={w.o.id} href={`/office/orders/${w.o.id}`} className="o-row">
                  <NewDot on />
                  {w.o.items[0] && <Thumb work={{ ...w.o.items[0], imageSm: w.o.items[0].image, iw: 4, ih: 5, kind: "painting" }} size={56} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderChip />
                      <span className="text-[0.82rem] text-[var(--o-faint)]">{timeAgo(w.o.createdAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-[1.05rem] font-semibold">
                      {w.o.name || "Someone"} wants {w.o.items.map((i) => i.name).join(", ")}
                    </p>
                    <p className="truncate text-[0.9rem] text-[var(--o-soft)]">
                      {money(w.o.subtotal)} · {w.o.payment} · {w.o.delivery}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[var(--o-faint)]" />
                </Link>
              ) : (
                <Link key={w.i.id} href={`/office/inbox/${w.i.id}`} className="o-row">
                  <NewDot on />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <KindChip kind={w.i.kind} />
                      <span className="text-[0.82rem] text-[var(--o-faint)]">{timeAgo(w.i.createdAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-[1.05rem] font-semibold">{personLine(w.i)}</p>
                    <p className="truncate text-[0.9rem] text-[var(--o-soft)]">{w.i.message || w.i.fields["Artwork"] || w.i.email || "No message"}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[var(--o-faint)]" />
                </Link>
              )
            )}
          </div>
        )}
      </section>

      {/* shortcuts */}
      <section className="o-in-view mt-5 grid gap-2.5 sm:mt-9 sm:gap-3 sm:grid-cols-3" style={{ animationDelay: "180ms" }}>
        <Link href="/office/artwork/new" className="o-card flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-12 sm:w-12 bg-[var(--o-pink)] text-white">
            <Plus className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold">Add a new piece</span>
            <span className="block text-[0.86rem] text-[var(--o-soft)]">Photo, title, price. Live in a minute.</span>
          </span>
        </Link>
        <Link href="/office/guide" className="o-card flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-12 sm:w-12 bg-[var(--o-gold)] text-white o-num text-lg">?</span>
          <span>
            <span className="block font-semibold">How to photograph a piece</span>
            <span className="block text-[0.86rem] text-[var(--o-soft)]">So it fits the website perfectly.</span>
          </span>
        </Link>
        <a href="/shop" target="_blank" rel="noopener" className="o-card flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-12 sm:w-12 bg-[var(--o-ink)] text-white">
            <ExternalLink className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold">See the shop as visitors do</span>
            <span className="block text-[0.86rem] text-[var(--o-soft)]">Opens the website in a new tab.</span>
          </span>
        </a>
      </section>

      {recentDone.length > 0 && (
        <section className="o-in-view mt-6 sm:mt-9" style={{ animationDelay: "240ms" }}>
          <h2 className="o-h2 mb-3">Recently looked after</h2>
          <div className="o-card overflow-hidden">
            {recentDone.map((r) =>
              "items" in r ? (
                <Link key={r.id} href={`/office/orders/${r.id}`} className="o-row">
                  <NewDot on={false} />
                  <OrderChip />
                  <span className="min-w-0 flex-1 truncate">
                    {r.name} · {money(r.subtotal)}
                  </span>
                  <span className="text-[0.82rem] text-[var(--o-faint)]">{timeAgo(r.createdAt)}</span>
                </Link>
              ) : (
                <Link key={r.id} href={`/office/inbox/${r.id}`} className="o-row">
                  <NewDot on={false} />
                  <KindChip kind={r.kind} />
                  <span className="min-w-0 flex-1 truncate">{personLine(r)}</span>
                  <span className="text-[0.82rem] text-[var(--o-faint)]">{timeAgo(r.createdAt)}</span>
                </Link>
              )
            )}
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ href, n, label, hot = false }: { href: string; n: number; label: string; hot?: boolean }) {
  return (
    <Link href={href} className="flex min-w-0 flex-col items-center px-2 py-4 text-center transition-colors hover:bg-[rgba(18,23,43,0.03)] sm:py-5">
      <span className="flex items-center gap-1.5">
        {hot && <span className="o-new" />}
        <span className="o-num text-[1.9rem] sm:text-[2.4rem]">{n}</span>
      </span>
      <span className="o-label mt-1 text-[0.58rem] leading-tight tracking-[0.12em] sm:text-[0.68rem]">{label}</span>
    </Link>
  );
}
