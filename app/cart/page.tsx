"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { money } from "@/lib/site";
import { dims, img } from "@/lib/catalog";

export default function CartPage() {
  const { items, subtotal, remove, setQty, count } = useCart();
  return (
    <section className="pt-[calc(var(--header-h)+3rem)] pb-24">
      <div className="wrap">
        <p className="label text-hibiscus">Your selection</p>
        <h1 className="display mt-4 text-[clamp(2.6rem,6vw,5rem)]">{count === 0 ? "Nothing here yet." : `${count} piece${count === 1 ? "" : "s"}, waiting on you.`}</h1>

        {items.length === 0 ? (
          <div className="mt-10">
            <p className="max-w-md text-ink/70">Every original is one of a kind. Find the one that changes the room.</p>
            <Link href="/shop" className="btn btn-ink mt-6">Browse the collection</Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
            <ul className="divide-y divide-ink/10">
              {items.map(({ work, qty }) => (
                <li key={work.slug} className="flex gap-6 py-6">
                  <Link href={`/shop/${work.slug}`} className="wrap-edge relative w-32 shrink-0 overflow-hidden bg-linen sm:w-44" style={{ aspectRatio: `${work.iw} / ${work.ih}` }}>
                    <Image src={img(work, "sm")} alt={work.name} fill sizes="176px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="display text-[1.6rem] leading-tight">{work.name}</p>
                    <p className="mt-1 text-sm text-muted">{[dims(work), work.medium].filter(Boolean).join(" · ")}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
                      <p className="text-lg font-semibold">{money(work.price * qty)}</p>
                      {work.kind === "book" && (
                        <label className="flex items-center gap-2 text-sm text-muted">
                          Qty
                          <input type="number" min={1} value={qty} onChange={(e) => setQty(work.slug, Number(e.target.value))} className="field h-9 w-16 px-2 py-1" />
                        </label>
                      )}
                      <button type="button" onClick={() => remove(work.slug)} className="text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-max rounded-2xl bg-paper p-8">
              <div className="flex items-baseline justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="display text-3xl">{money(subtotal)}</span>
              </div>
              <p className="pretty mt-3 text-sm text-muted">Shipping, delivery and installation are quoted per piece and arranged directly with the studio after checkout. Credit and debit cards, PayPal and offline payment accepted.</p>
              <Link href="/checkout" className="btn btn-pink mt-6 w-full">Proceed to checkout</Link>
              <Link href="/shop" className="btn btn-line mt-3 w-full">Keep looking</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
