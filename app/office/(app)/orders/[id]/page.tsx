import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Pencil } from "lucide-react";
import { getOrder, getWorkBySlug } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { stockLabel } from "@/lib/works";
import { ContactButtons, OrderStatusChip, PageHead, Thumb, fullDate } from "@/components/office/ui";
import { ActionButton, NotesBox, OrderStatusStepper } from "@/components/office/Controls";
import { RefundBox, ShippingBox } from "@/components/office/OrderBoxes";
import { markOrderSoldAction, saveOrderNotesAction, setOrderPieceAction, setOrderStatusAction } from "@/app/office/actions";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOrder(id);
  if (!o) notFound();
  const pieces = await Promise.all(o.items.map(async (it) => ({ it, work: await getWorkBySlug(it.slug) })));
  const unsold = pieces.filter((p) => p.work && p.work.kind !== "book" && !p.work.sold).length;
  const addr = [o.address, o.city, `${o.state} ${o.zip}`].filter((s) => s && s.trim()).join(", ");
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

  return (
    <>
      <PageHead back={{ href: "/office/orders", label: "All orders" }} kicker={`Order ${o.ref} · ${money(o.subtotal)} · ${fullDate(o.createdAt)}`} title={o.name || "Someone"} action={<OrderStatusChip status={o.status} />} />

      <div className="grid min-w-0 gap-3 sm:gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="grid min-w-0 gap-3 sm:gap-5">
          {/* the pieces */}
          <section className="o-card o-in-view p-4 sm:p-7">
            <p className="o-label">The pieces</p>
            <ul className="mt-4 divide-y divide-[var(--o-hair)]">
              {pieces.map(({ it, work }) => (
                <li key={it.slug} className="py-4">
                  <div className="flex items-center gap-4">
                    <Thumb work={work ?? { ...it, imageSm: it.image, iw: 4, ih: 5, kind: "painting" }} size={72} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-start gap-2 text-[1.08rem] font-semibold leading-tight">
                        <span className="min-w-0">
                          {it.name}
                          {it.qty > 1 ? ` × ${it.qty}` : ""}
                        </span>
                        {work && work.kind !== "book" && (
                          <Link href={`/office/artwork/${work.slug}`} aria-label={`Edit ${work.name}`} title="Edit the piece" className="o-editlink">
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </p>
                      <p className="text-[0.88rem] text-[var(--o-soft)]">{it.dims ?? work?.medium ?? ""}</p>
                      <div className="mt-1.5">
                        {work ? work.hidden ? <span className="o-chip o-chip-muted">Off the website</span> : work.sold ? <span className="o-chip o-chip-red">SOLD</span> : <span className="o-chip o-chip-green">{stockLabel(work) ? `For sale online · ${stockLabel(work)}` : "For sale online"}</span> : it.slug.startsWith("class-") ? <span className="o-chip o-chip-ocean">Class seat{it.qty > 1 ? "s" : ""}</span> : <span className="o-chip o-chip-muted">No longer in the shop</span>}
                      </div>
                    </div>
                    <p className="o-num shrink-0 text-[1.25rem]">{money(it.price * it.qty)}</p>
                  </div>
                  {work && work.kind !== "book" && (
                    <div className="mt-3 flex flex-wrap gap-2 sm:pl-[calc(72px+1rem)]">
                      {!work.sold && !work.hidden && (
                        <ActionButton className="btn btn-ink btn-sm" done={`${work.name} is marked sold on the website.`} action={setOrderPieceAction} args={[o.id, work.slug, "sold"]}>
                          Mark as sold
                        </ActionButton>
                      )}
                      {!work.hidden && (
                        <ActionButton className="btn btn-line btn-sm" done={`${work.name} is off the website.`} action={setOrderPieceAction} args={[o.id, work.slug, "hide"]}>
                          Remove from the website
                        </ActionButton>
                      )}
                      {(work.sold || work.hidden) && (
                        <ActionButton className="btn btn-line btn-sm" done={`${work.name} is back for sale.`} action={setOrderPieceAction} args={[o.id, work.slug, "restore"]}>
                          Put it back for sale
                        </ActionButton>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-[var(--o-hair)] pt-4">
              <span className="o-muted">Subtotal</span>
              <span className="o-num text-[2rem]">{money(o.subtotal)}</span>
            </div>
            <p className="text-[0.86rem] text-[var(--o-faint)]">Shipping or installation is quoted by you, separately.</p>
            {unsold > 1 && (
              <div className="o-card-soft mt-5 flex flex-wrap items-center gap-3 p-4">
                <p className="flex-1 text-[0.95rem]">{unsold} of these pieces still show as for sale on the website.</p>
                <ActionButton className="btn btn-ink btn-sm" done="All marked sold on the website." action={markOrderSoldAction} args={[o.id]}>
                  Mark them all sold
                </ActionButton>
              </div>
            )}
          </section>

          {/* the buyer */}
          <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "80ms" }}>
            <p className="o-label">The buyer{o.confirmationSentAt ? " · sent an order confirmation" : ""}</p>
            <p className="o-h2 mt-2">{o.name}</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="o-label">Phone</dt>
                <dd className="mt-1 text-[1.02rem] font-semibold">
                  <a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`}>{o.phone}</a>
                </dd>
              </div>
              <div>
                <dt className="o-label">Email</dt>
                <dd className="mt-1 break-all text-[1.02rem] font-semibold">
                  <a href={`mailto:${o.email}`}>{o.email}</a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="o-label">Where it is going</dt>
                <dd className="mt-1 text-[1.02rem]">
                  {addr || "Not given"}
                  {addr && (
                    <a href={mapsHref} target="_blank" rel="noopener" className="ml-3 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-[var(--o-ocean)]">
                      <MapPin className="h-4 w-4" /> Open in Maps
                    </a>
                  )}
                </dd>
              </div>
              <div>
                <dt className="o-label">They would like to pay by</dt>
                <dd className="mt-1 text-[1.02rem] font-semibold">{o.payment || "Not given"}</dd>
              </div>
              <div>
                <dt className="o-label">Delivery</dt>
                <dd className="mt-1 text-[1.02rem] font-semibold">{o.delivery || "Not given"}</dd>
              </div>
            </dl>
            {o.message && (
              <blockquote className="mt-6 border-l-2 border-[var(--o-pink)] pl-5">
                <p className="o-label mb-2">Their note</p>
                <p className="whitespace-pre-line text-[1.05rem] leading-[1.65]">{o.message}</p>
              </blockquote>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <ContactButtons name={o.name} phone={o.phone} email={o.email} subject={`Your order ${o.ref} from Carol Calicchio Art`} />
              {(o.status === "new" || o.status === "contacted") && (
                <Link href={`/office/invoices/new?order=${o.id}`} className="btn btn-line btn-sm">
                  Send an invoice
                </Link>
              )}
            </div>
          </section>

          {/* shipping */}
          <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "120ms" }}>
            <p className="o-label">Shipping</p>
            <p className="o-muted mt-1 text-[0.95rem]">When it leaves the studio, note how it went and the tracking number. Saving a tracking number moves the order to Shipped and sends the buyer the tracking link by email and text.</p>
            <div className="mt-4">
              <ShippingBox id={o.id} carrier={o.carrier} tracking={o.tracking} shippedAt={o.shippedAt} deliveredAt={o.deliveredAt} toldFor={o.shippedNoticeFor ?? null} />
            </div>
          </section>

          {/* refund */}
          <section className="o-card o-in-view p-4 sm:p-7" style={{ animationDelay: "160ms" }}>
            <p className="o-label">Refund</p>
            <div className="mt-3">
              <RefundBox id={o.id} subtotal={o.subtotal} refundedAt={o.refundedAt} refundAmount={o.refundAmount} refundNote={o.refundNote} byCard={Boolean(o.stripeSessionId && o.stripeSessionId.startsWith("cs_"))} />
            </div>
          </section>
        </div>

        <aside className="grid gap-3 sm:gap-5 lg:sticky lg:top-12 lg:self-start">
          <section className="o-card o-in-view p-4 sm:p-6" style={{ animationDelay: "100ms" }}>
            <p className="o-label mb-3">Where this order stands</p>
            <OrderStatusStepper current={o.status} action={setOrderStatusAction} id={o.id} />
          </section>
          <section className="o-card o-in-view p-4 sm:p-6" style={{ animationDelay: "160ms" }}>
            <p className="o-label mb-3">Your notes</p>
            <NotesBox initial={o.notes} action={saveOrderNotesAction} id={o.id} placeholder="Delivery date, framing, what you agreed on the phone…" />
          </section>
        </aside>
      </div>
    </>
  );
}
