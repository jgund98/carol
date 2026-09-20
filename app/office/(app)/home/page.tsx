// Today: what is waiting, at a glance, in the order it came in.
import Link from "next/link";
import { listInquiries, listOrders } from "@/lib/studio/store";
import { dayLine, greeting } from "@/lib/studio/time";
import { money } from "@/lib/site";
import { KindChip, PageHead, Row, Thumb, timeAgo, personLine } from "@/components/office/ui";
import SalesPanel, { type SlimOrder } from "@/components/office/SalesPanel";

export default async function Today() {
  const [inq, ord] = await Promise.all([listInquiries(), listOrders()]);
  const newInq = inq.filter((i) => i.status === "new");
  const newOrd = ord.filter((o) => o.status === "new");
  const waiting = [
    ...newOrd.map((o) => ({ kind: "order" as const, at: o.createdAt, o })),
    ...newInq.map((i) => ({ kind: "inquiry" as const, at: i.createdAt, i })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const total = waiting.length;
  const today = dayLine();
  const slim: SlimOrder[] = ord.map((o) => ({ id: o.id, name: o.name || "Someone", subtotal: o.subtotal, status: o.status, createdAt: o.createdAt, paidAt: o.paidAt, refundAmount: o.refundAmount, pieces: o.items.reduce((n, i) => n + i.qty, 0), first: o.items[0]?.name ?? "" }));

  return (
    <>
      <PageHead kicker={today} title={`${greeting()}, Carol.`} />

      <p className="o-summary o-in-view -mt-2 sm:-mt-4" style={{ animationDelay: "60ms" }}>
        <Link href="/office/inbox?f=new">
          <b className={newInq.length ? "is-new" : ""}>{newInq.length}</b> new {newInq.length === 1 ? "inquiry" : "inquiries"}
        </Link>
        <Link href="/office/orders?f=new">
          <b className={newOrd.length ? "is-new" : ""}>{newOrd.length}</b> new {newOrd.length === 1 ? "sale" : "sales"}
        </Link>
      </p>

      {/* what needs her */}
      <section className="o-in-view mt-5 sm:mt-9" style={{ animationDelay: "120ms" }}>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="o-h2">{total ? "Waiting for you" : "All caught up"}</h2>
          {total > 0 && (
            <Link href="/office/inbox?f=new" className="text-[0.95rem] font-semibold text-[var(--o-soft)] hover:text-[var(--o-ink)]">
              All new inquiries
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
                <Row
                  key={w.o.id}
                  href={`/office/orders/${w.o.id}`}
                  isNew
                  tone="pink"
                  flash
                  thumb={w.o.items[0] ? <Thumb work={{ ...w.o.items[0], imageSm: w.o.items[0].image, iw: 4, ih: 5, kind: "painting" }} size={48} /> : undefined}
                  title={w.o.name || "Someone"}
                  meta={
                    <>
                      <span className="o-chip o-chip-pink">New sale</span> · <b className="text-[var(--o-ink)]">{money(w.o.subtotal)}</b> · {w.o.items.map((i) => i.name).join(", ")}
                    </>
                  }
                  time={timeAgo(w.o.createdAt)}
                />
              ) : (
                <Row
                  key={w.i.id}
                  href={`/office/inbox/${w.i.id}`}
                  isNew
                  title={personLine(w.i)}
                  meta={
                    <>
                      <KindChip kind={w.i.kind} /> · {w.i.fields["Artwork"] ? `About ${w.i.fields["Artwork"]}` : w.i.message || w.i.email || "No message"}
                    </>
                  }
                  time={timeAgo(w.i.createdAt)}
                />
              )
            )}
          </div>
        )}
      </section>

      <div className="mt-5 sm:mt-9">
        <SalesPanel orders={slim} />
      </div>


    </>
  );
}

