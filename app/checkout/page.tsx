"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { money, site } from "@/lib/site";
import { dims, img } from "@/lib/catalog";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [t0] = useState(() => Date.now());
  const [orderRef, setOrderRef] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("_honey") || Date.now() - t0 < 2500) return;
    setState("sending");
    const ref = `CC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const body = {
      formType: "order",
      subject: `New Order Request ${ref} · ${money(subtotal)}`,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      message: String(fd.get("message") || ""),
      fields: {
        "Order ref": ref,
        Pieces: items.map((i) => `${i.work.name} (${dims(i.work) ?? i.work.medium ?? ""}) × ${i.qty} · ${money(i.work.price * i.qty)}`).join("\n"),
        Subtotal: money(subtotal),
        "Ship to": [fd.get("address"), fd.get("city"), fd.get("state"), fd.get("zip")].filter(Boolean).join(", "),
        Payment: String(fd.get("payment") || ""),
        Delivery: String(fd.get("delivery") || ""),
      },
    };
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) {
        setOrderRef(ref);
        setState("done");
        clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "done")
    return (
      <section className="grid min-h-[100svh] place-items-center pt-[var(--header-h)]">
        <div className="wrap max-w-2xl py-16 text-center">
          <p className="label text-hibiscus">Order request {orderRef}</p>
          <h1 className="display mt-4 text-[clamp(2.4rem,5vw,4.4rem)]">Thank you. Carol has it.</h1>
          <p className="pretty mx-auto mt-5 max-w-lg text-ink/70">She will confirm the piece is still available, settle payment your way, and arrange delivery or installation with you personally. Expect to hear from her within one business day.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={site.phoneHref} className="btn btn-ink">Call {site.phone}</a>
            <Link href="/shop" className="btn btn-line">Back to the collection</Link>
          </div>
        </div>
      </section>
    );

  if (items.length === 0)
    return (
      <section className="pt-[calc(var(--header-h)+3rem)] pb-24">
        <div className="wrap">
          <h1 className="display text-[clamp(2.4rem,5vw,4.4rem)]">Your selection is empty.</h1>
          <Link href="/shop" className="btn btn-ink mt-6">Browse the collection</Link>
        </div>
      </section>
    );

  return (
    <section className="pt-[calc(var(--header-h)+3rem)] pb-24">
      <div className="wrap">
        <p className="label text-hibiscus">Checkout</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,5vw,4.4rem)]">Almost yours.</h1>
        <p className="pretty mt-4 max-w-2xl text-ink/70">
          Original art is not a click-and-ship purchase and we do not pretend it is. Tell Carol where the piece is going and how you would like to pay. She confirms availability, takes payment securely by card, PayPal or wire, and arranges delivery herself.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <h2 className="display text-2xl sm:col-span-2">Your details</h2>
            <label className="block"><span className="label mb-2 block text-muted">Full name</span><input name="name" required autoComplete="name" className="field" /></label>
            <label className="block"><span className="label mb-2 block text-muted">Email</span><input name="email" type="email" required autoComplete="email" className="field" /></label>
            <label className="block sm:col-span-2"><span className="label mb-2 block text-muted">Phone</span><input name="phone" type="tel" required autoComplete="tel" className="field" placeholder="For delivery scheduling" /></label>
            <h2 className="display mt-4 text-2xl sm:col-span-2">Where it is going</h2>
            <label className="block sm:col-span-2"><span className="label mb-2 block text-muted">Street address</span><input name="address" required autoComplete="street-address" className="field" /></label>
            <label className="block"><span className="label mb-2 block text-muted">City</span><input name="city" required autoComplete="address-level2" className="field" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="label mb-2 block text-muted">State</span><input name="state" required autoComplete="address-level1" className="field" defaultValue="FL" /></label>
              <label className="block"><span className="label mb-2 block text-muted">ZIP</span><input name="zip" required autoComplete="postal-code" className="field" /></label>
            </div>
            <h2 className="display mt-4 text-2xl sm:col-span-2">How you would like to proceed</h2>
            <fieldset className="sm:col-span-2">
              <legend className="label mb-2 text-muted">Payment</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Credit or debit card", "PayPal", "Wire or check"].map((p, i) => (
                  <label key={p} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm has-[:checked]:border-ink">
                    <input type="radio" name="payment" value={p} defaultChecked={i === 0} className="accent-ink" />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="sm:col-span-2">
              <legend className="label mb-2 text-muted">Delivery</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Ship to me", "White-glove delivery and installation", "Pick up at the studio"].map((p, i) => (
                  <label key={p} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm has-[:checked]:border-ink">
                    <input type="radio" name="delivery" value={p} defaultChecked={i === 0} className="accent-ink" />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block sm:col-span-2"><span className="label mb-2 block text-muted">Anything Carol should know · optional</span><textarea name="message" rows={3} className="field resize-y" placeholder="Wall size, framing, a date you need it by…" /></label>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
              <button type="submit" disabled={state === "sending"} className="btn btn-pink">{state === "sending" ? "Sending…" : `Request this order · ${money(subtotal)}`}</button>
              <span className="text-xs text-muted">No payment is taken on this page.</span>
            </div>
            {state === "error" && <p className="sm:col-span-2 text-sm text-coral">That did not go through. Call {site.phone} or email {site.email}.</p>}
          </form>

          <aside className="h-max rounded-2xl bg-paper p-6 md:p-8">
            <h2 className="display text-2xl">Your selection</h2>
            <ul className="mt-4 divide-y divide-ink/10">
              {items.map(({ work, qty }) => (
                <li key={work.slug} className="flex items-center gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-linen">
                    <Image src={img(work, "sm")} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="display text-lg leading-tight">{work.name}</p>
                    <p className="text-xs text-muted">{dims(work) ?? work.medium}{qty > 1 ? ` × ${qty}` : ""}</p>
                  </div>
                  <p className="text-sm font-semibold">{money(work.price * qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-4">
              <span className="text-muted">Subtotal</span>
              <span className="display text-3xl">{money(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-muted">Shipping or installation quoted separately.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
