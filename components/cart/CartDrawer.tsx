"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { money } from "@/lib/site";
import { dims, img } from "@/lib/catalog";

export default function CartDrawer() {
  const { open, setOpen, items, subtotal, remove, count } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div className={`fixed inset-0 z-[150] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-400 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-label="Your cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-gallery shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="display text-2xl">Your selection</h2>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="display text-2xl">Nothing here yet.</p>
                <p className="mt-2 text-sm text-muted">Every original is one of a kind. Find the one that changes the room.</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-ink btn-sm mt-6">
                  Browse the collection
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {items.map(({ work, qty }) => (
                <li key={work.slug} className="flex gap-4 py-4">
                  <Link href={`/shop/${work.slug}`} onClick={() => setOpen(false)} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-linen">
                    <Image src={img(work, "sm")} alt={work.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="display text-lg leading-tight">{work.name}</p>
                    <p className="mt-1 text-xs text-muted">{dims(work) ?? work.medium}</p>
                    <p className="mt-2 text-sm font-semibold">{money(work.price * qty)}{qty > 1 ? ` · ${qty}` : ""}</p>
                  </div>
                  <button type="button" onClick={() => remove(work.slug)} className="self-start text-xs font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Subtotal · {count} piece{count === 1 ? "" : "s"}</span>
              <span className="display text-2xl">{money(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping, delivery and installation are arranged with the studio.</p>
            <div className="mt-4 grid gap-2">
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-pink w-full">
                Checkout
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="btn btn-line w-full">
                Review selection
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
