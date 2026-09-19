import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getOrder, getWorkBySlug } from "@/lib/studio/store";
import { money } from "@/lib/site";
import { ContactButtons, OrderStatusChip, PageHead, Thumb, fullDate } from "@/components/office/ui";
import { ActionButton, ConfirmButton, NotesBox, OrderStatusStepper } from "@/components/office/Controls";
import { deleteOrderAction, markOrderSoldAction, saveOrderNotesAction, setOrderStatusAction } from "@/app/office/actions";

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
      <PageHead back={{ href: "/office/orders", label: "All orders" }} kicker={`Order ${o.ref} · ${money(o.subtotal)} · ${fullDate(o.createdAt)}`} title={o.name || "Someone"} />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="grid gap-5">
          <section className="o-card o-in-view p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="o-label">The pieces</p>
              <OrderStatusChip status={o.status} />
            </div>
            <ul className="mt-4 divide-y divide-[var(--o-hair)]">
              {pieces.map(({ it, work }) => (
                <li key={it.slug} className="flex items-center gap-4 py-4">
                  <Thumb work={work ?? { ...it, imageSm: it.image, iw: 4, ih: 5, kind: "painting" }} size={72} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[1.08rem] font-semibold leading-tight">
                      {it.name}
                      {it.qty > 1 ? ` × ${it.qty}` : ""}
                    </p>
                    <p className="text-[0.88rem] text-[var(--o-soft)]">{it.dims ?? work?.medium ?? ""}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem]">
                      {work ? (
                        <>
                          {work.sold ? <span className="o-chip o-chip-ink">Sold on the website</span> : <span className="o-chip o-chip-green">Still for sale</span>}
                          <Link href={`/office/artwork/${work.slug}`} className="font-semibold text-[var(--o-soft)] underline-offset-4 hover:underline">
                            Edit
                          </Link>
                        </>
                      ) : (
                        <span className="text-[var(--o-faint)]">No longer in the shop</span>
                      )}
                    </div>
                  </div>
                  <p className="o-num text-[1.25rem]">{money(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-[var(--o-hair)] pt-4">
              <span className="o-muted">Subtotal</span>
              <span className="o-num text-[2rem]">{money(o.subtotal)}</span>
            </div>
            <p className="text-[0.86rem] text-[var(--o-faint)]">Shipping or installation is quoted by you, separately.</p>
            {unsold > 0 && (
              <div className="o-card-soft mt-5 flex flex-wrap items-center gap-3 p-4">
                <p className="flex-1 text-[0.95rem]">
                  {unsold === 1 ? "This piece still shows as for sale on the website." : `${unsold} of these pieces still show as for sale on the website.`}
                </p>
                <ActionButton className="btn btn-ink btn-sm" done="Marked sold on the website." action={markOrderSoldAction} args={[o.id]}>
                  Mark {unsold === 1 ? "it" : "them"} sold
                </ActionButton>
              </div>
            )}
          </section>

          <section className="o-card o-in-view p-5 sm:p-7" style={{ animationDelay: "80ms" }}>
            <p className="o-label">The buyer</p>
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
            <div className="mt-7">
              <ContactButtons name={o.name} phone={o.phone} email={o.email} subject={`Your order ${o.ref} from Carol Calicchio Art`} />
            </div>
          </section>

          <section className="o-card-soft o-in-view p-5 sm:p-6" style={{ animationDelay: "120ms" }}>
            <p className="o-label">Card payments</p>
            <p className="mt-2 text-[0.95rem] text-[var(--o-soft)]">
              Once Jordan connects your Stripe account, buyers will be able to pay by card at checkout and paid orders will show up here already marked <strong>Paid</strong>. Until then, settle payment with them the way you do now and mark it here yourself.
            </p>
          </section>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-12 lg:self-start">
          <section className="o-card o-in-view p-5 sm:p-6" style={{ animationDelay: "100ms" }}>
            <p className="o-label mb-3">Where this order stands</p>
            <OrderStatusStepper current={o.status} action={setOrderStatusAction} id={o.id} />
          </section>
          <section className="o-card o-in-view p-5 sm:p-6" style={{ animationDelay: "160ms" }}>
            <p className="o-label mb-3">Your notes</p>
            <NotesBox initial={o.notes} action={saveOrderNotesAction} id={o.id} placeholder="Delivery date, framing, what you agreed on the phone…" />
          </section>
          <div className="o-in-view" style={{ animationDelay: "200ms" }}>
            <ConfirmButton label="Remove this order" question="Remove this order for good?" action={deleteOrderAction} args={[o.id]} afterHref="/office/orders" />
          </div>
        </aside>
      </div>
    </>
  );
}
