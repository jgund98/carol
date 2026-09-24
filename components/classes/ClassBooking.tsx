"use client";
// Pick a date, pick seats, leave your details, pay on Stripe.
import { useEffect, useMemo, useState } from "react";
import { CLASS, classDay, classTime, type StudioClass } from "@/lib/classes";
import { site } from "@/lib/site";

export type DateOption = StudioClass & { left: number };

export default function ClassBooking({ dates }: { dates: DateOption[] }) {
  const open = dates.filter((d) => d.left > 0);
  const [classId, setClassId] = useState(open[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [t0] = useState(() => Date.now());
  const chosen = useMemo(() => dates.find((d) => d.id === classId) ?? null, [dates, classId]);
  const cap = Math.max(1, Math.min(CLASS.maxSeats, chosen?.left ?? 1));

  useEffect(() => {
    setCancelled(new URLSearchParams(window.location.search).get("cancelled") === "1");
  }, []);
  useEffect(() => {
    if (qty > cap) setQty(cap);
  }, [cap, qty]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("_honey") || Date.now() - t0 < 2000) return;
    if (!chosen) return;
    setState("sending");
    setError("");
    try {
      const r = await fetch("/api/classes/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, qty, name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), note: fd.get("note") }),
      });
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string };
      if (r.ok && d.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      setError(d.error || `That did not go through. Call ${site.phone} and Carol will reserve it by hand.`);
      setState("error");
    } catch {
      setError(`That did not go through. Call ${site.phone} and Carol will reserve it by hand.`);
      setState("error");
    }
  }

  if (dates.length === 0)
    return (
      <div className="rounded-3xl bg-paper p-8 text-center sm:p-12">
        <p className="display text-[1.8rem]">The next dates are on their way.</p>
        <p className="pretty mx-auto mt-3 max-w-md text-ink/70">Carol announces each evening here first. Leave your email on the studio list and you will hear the moment seats open.</p>
        <a href="/contact" className="btn btn-ink mt-6">Keep me posted</a>
      </div>
    );

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-8">
        <fieldset>
          <legend className="label mb-3 text-muted">Choose your evening</legend>
          <div className="grid gap-3">
            {dates.map((d) => {
              const soldOut = d.left <= 0;
              const on = classId === d.id;
              return (
                <label
                  key={d.id}
                  className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-5 py-4 transition ${soldOut ? "cursor-not-allowed opacity-55" : on ? "border-ink shadow-[0_10px_30px_rgba(18,23,43,0.08)]" : "border-ink/15 hover:border-ink/40"}`}
                >
                  <input type="radio" name="classId" value={d.id} checked={on} disabled={soldOut} onChange={() => setClassId(d.id)} className="accent-ink" />
                  <span className="min-w-0 flex-1">
                    <span className="display block text-[1.35rem] leading-tight">{classDay(d)}</span>
                    <span className="mt-0.5 block text-[0.9rem] text-ink/65">{classTime(d)} · Delray Beach</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[0.72rem] font-bold tracking-[0.14em] ${soldOut ? "bg-ink/10 text-ink/60" : d.left <= 4 ? "bg-hibiscus text-white" : "bg-paper text-ink/70"}`}>
                    {soldOut ? "SOLD OUT" : d.left <= 4 ? `${d.left} LEFT` : "OPEN"}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label mb-3 text-muted">How many seats</legend>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-ink/15 bg-white">
              <button type="button" aria-label="Fewer seats" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center rounded-full text-xl text-ink transition hover:bg-ink/5 disabled:opacity-30" disabled={qty <= 1}>−</button>
              <span className="display w-10 text-center text-[1.6rem]">{qty}</span>
              <button type="button" aria-label="More seats" onClick={() => setQty((q) => Math.min(cap, q + 1))} className="grid h-12 w-12 place-items-center rounded-full text-xl text-ink transition hover:bg-ink/5 disabled:opacity-30" disabled={qty >= cap}>+</button>
            </div>
            <p className="text-[0.9rem] text-ink/65">{qty === 1 ? "Just you." : `${qty} of you, seated together.`}{chosen && chosen.left <= CLASS.maxSeats ? ` ${chosen.left} ${chosen.left === 1 ? "seat" : "seats"} left on this date.` : ""}</p>
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <h3 className="display text-2xl sm:col-span-2">Who is coming</h3>
          <label className="block sm:col-span-2"><span className="label mb-2 block text-muted">Your name</span><input name="name" required autoComplete="name" className="field" /></label>
          <label className="block"><span className="label mb-2 block text-muted">Email</span><input name="email" type="email" required autoComplete="email" className="field" /></label>
          <label className="block"><span className="label mb-2 block text-muted">Mobile</span><input name="phone" type="tel" required autoComplete="tel" className="field" placeholder="For your confirmation text" /></label>
          <label className="block sm:col-span-2"><span className="label mb-2 block text-muted">A note for Carol · optional</span><textarea name="note" rows={2} className="field resize-y" placeholder="A gift for someone? Celebrating something? Names of your guests?" /></label>
        </div>
      </div>

      <aside className="h-max rounded-3xl bg-paper p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
        <p className="display-light text-[1rem] italic text-ink/60">Your reservation</p>
        <p className="display mt-2 text-[1.7rem] leading-tight">{chosen ? classDay(chosen) : "Choose a date"}</p>
        {chosen && (
          <p className="mt-1 text-[0.95rem] text-ink/70">
            {classTime(chosen)}
            <br />
            {CLASS.venue.street}, Delray Beach
          </p>
        )}
        <dl className="mt-6 grid gap-2 border-t border-ink/10 pt-5 text-[0.95rem]">
          <div className="flex justify-between"><dt className="text-ink/65">{qty} {qty === 1 ? "seat" : "seats"} × ${CLASS.price}</dt><dd className="font-semibold">${CLASS.price * qty}</dd></div>
          <div className="flex justify-between"><dt className="text-ink/65">Canvas, paints, brushes, apron</dt><dd className="font-semibold">Included</dd></div>
          <div className="flex justify-between"><dt className="text-ink/65">Light refreshments</dt><dd className="font-semibold">Included</dd></div>
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-5">
          <span className="text-ink/65">Total today</span>
          <span className="display text-3xl">${CLASS.price * qty}</span>
        </div>
        {cancelled && <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-[0.9rem] text-ink/80">No charge was made. Your details are still here whenever you are ready.</p>}
        <button type="submit" disabled={state === "sending" || !chosen} className="btn btn-pink mt-6 w-full">
          {state === "sending" ? "Opening secure payment…" : `Reserve ${qty === 1 ? "my seat" : `${qty} seats`} · $${CLASS.price * qty}`}
        </button>
        {state === "error" && <p className="mt-3 text-sm text-coral">{error}</p>}
        <p className="mt-4 text-[0.8rem] leading-relaxed text-ink/55">Cards are taken on Stripe&rsquo;s secure page. You will get a confirmation by text and email the moment it goes through. Seats are transferable to another evening with 48 hours&rsquo; notice.</p>
      </aside>
    </form>
  );
}
