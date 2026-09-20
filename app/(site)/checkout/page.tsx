"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { money, site } from "@/lib/site";
import { dims, img } from "@/lib/catalog";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    setCancelled(new URLSearchParams(window.location.search).get("cancelled") === "1");
  }, []);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [t0] = useState(() => Date.now());

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("_honey") || Date.now() - t0 < 2500) return;
    setState("sending");
    setError("");
    const body = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      city: String(fd.get("city") || ""),
      state: String(fd.get("state") || ""),
      zip: String(fd.get("zip") || ""),
      delivery: String(fd.get("delivery") || ""),
      message: String(fd.get("message") || ""),
      items: items.map((i) => ({ slug: i.work.slug, qty: i.qty })),
    };
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string };
      if (r.ok && d.ok && d.url) {
        // The selection is kept until the payment is confirmed, so backing out of the card page loses nothing.
        window.location.href = d.url;
        return;
      }
      setError(d.error || `That did not go through. Call ${site.phone} or email ${site.email}.`);
      setState("error");
    } catch {
      setError(`That did not go through. Call ${site.phone} or email ${site.email}.`);
      setState("error");
    }
  }

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
        <p className="display-light text-[1.05rem] italic text-ink/60">Checkout</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,5vw,4.4rem)]">Almost yours.</h1>
        <p className="pretty mt-4 max-w-2xl text-ink/70">
          Tell Carol where the piece is going, then pay securely by card. Every painting is an original, so it comes off the collection the moment it is yours. Carol arranges shipping, delivery or installation with you personally; that part is quoted separately.
        </p>
        {cancelled && <p className="mt-4 max-w-2xl rounded-2xl bg-paper px-5 py-4 text-sm text-ink/80">No charge was made. Your selection is still here whenever you are ready.</p>}

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
            <fieldset className="mt-4 sm:col-span-2">
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
              <button type="submit" disabled={state === "sending"} className="btn btn-pink">{state === "sending" ? "Opening secure payment…" : `Pay ${money(subtotal)}`}</button>
              <span className="text-xs text-muted">Cards are taken on Stripe&rsquo;s secure page. Your details never touch our servers.</span>
            </div>
            {state === "error" && <p className="sm:col-span-2 text-sm text-coral">{error}</p>}
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
              <span className="text-muted">Total today</span>
              <span className="display text-3xl">{money(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-muted">Shipping or installation quoted separately.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
