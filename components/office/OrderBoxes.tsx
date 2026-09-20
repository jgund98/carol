"use client";
// Shipping details and refunds for one order.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Truck } from "lucide-react";
import { CARRIERS } from "@/lib/studio/types";
import { money } from "@/lib/site";
import { recordRefundAction, saveShippingAction } from "@/app/office/actions";
import { useToast } from "./Toast";
import { fullDate } from "@/lib/studio/time";
import { trackingLink } from "@/lib/studio/shipping";

export function ShippingBox({ id, carrier, tracking, shippedAt, deliveredAt, toldFor }: { id: string; carrier: string | null; tracking: string | null; shippedAt: string | null; deliveredAt: string | null; toldFor?: string | null }) {
  const [c, setC] = useState(carrier ?? "");
  const [custom, setCustom] = useState(carrier && !CARRIERS.includes(carrier) ? carrier : "");
  const [t, setT] = useState(tracking ?? "");
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const effective = c === "Other" ? custom : c;
  const dirty = effective !== (carrier ?? "") || t !== (tracking ?? "");
  const trackHref = trackingLink(effective, t);

  return (
    <div className="grid gap-4">
      {(shippedAt || deliveredAt) && (
        <p className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-[var(--o-green)]">
          <Truck className="h-4 w-4" /> {deliveredAt ? `Delivered ${fullDate(deliveredAt)}` : `Shipped ${fullDate(shippedAt!)}`}
        </p>
      )}
      {toldFor && toldFor === tracking && <p className="text-[0.88rem] text-[var(--o-soft)]">The buyer was sent this tracking number by email and text.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="o-field">
          <span>How it is going</span>
          <select value={CARRIERS.includes(c) || c === "" ? c : "Other"} onChange={(e) => setC(e.target.value)} className="o-in">
            <option value="">Choose…</option>
            {CARRIERS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label className="o-field">
          <span>Tracking number · if there is one</span>
          <input value={t} onChange={(e) => setT(e.target.value)} className="o-in" placeholder="1Z 999 AA1 01 2345 6784" autoComplete="off" />
          {trackHref && (
            <a href={trackHref} target="_blank" rel="noopener" className="o-help font-semibold text-[var(--o-ocean)]">
              Track this package ↗
            </a>
          )}
        </label>
      </div>
      {c === "Other" && (
        <label className="o-field">
          <span>Who is carrying it</span>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} className="o-in" placeholder="Name of the shipper" />
        </label>
      )}
      {dirty && (
        <button
          type="button"
          disabled={busy}
          className="btn btn-ink w-full sm:w-max"
          onClick={() =>
            start(async () => {
              const r = await saveShippingAction(id, effective, t);
              if (r.ok) {
                toast(r.told ? "Shipping saved. The buyer has been emailed and texted the tracking number." : "Shipping saved.");
                router.refresh();
              } else toast(r.error, "error");
            })
          }
        >
          {busy ? "Saving…" : "Save shipping details"}
        </button>
      )}
    </div>
  );
}

export function RefundBox({ id, subtotal, refundedAt, refundAmount, refundNote }: { id: string; subtotal: number; refundedAt: string | null; refundAmount: number | null; refundNote: string | null }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(subtotal));
  const [note, setNote] = useState("");
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  if (refundedAt)
    return (
      <div className="o-card-soft p-4">
        <p className="inline-flex items-center gap-2 font-semibold text-[var(--o-red)]">
          <Check className="h-4 w-4" /> Refunded {money(refundAmount ?? 0)} on {fullDate(refundedAt)}
        </p>
        {refundNote && <p className="o-muted mt-1 text-[0.95rem]">{refundNote}</p>}
      </div>
    );

  if (!open)
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="o-muted flex-1 text-[0.95rem]">If the sale falls through after payment, record the refund here so the order reads right.</p>
        <button type="button" onClick={() => setOpen(true)} className="btn btn-danger btn-sm">
          Refund this order
        </button>
      </div>
    );

  return (
    <div className="grid gap-4">
      <label className="o-field">
        <span>Amount refunded</span>
        <div className="o-money">
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="o-in" />
        </div>
        <span className="o-help">The order total was {money(subtotal)}.</span>
      </label>
      <label className="o-field">
        <span>Why · optional</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="o-in" placeholder="Changed their mind, damaged in transit…" />
      </label>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          disabled={busy}
          className="btn btn-sm bg-[var(--o-red)] text-white"
          onClick={() =>
            start(async () => {
              const r = await recordRefundAction(id, Number(amount), note);
              if (r.ok) {
                toast("Refund recorded. The order is marked Refunded.");
                setOpen(false);
                router.refresh();
              } else toast(r.error, "error");
            })
          }
        >
          {busy ? "Saving…" : `Record a ${money(Number(amount) || 0)} refund`}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-line btn-sm">
          Never mind
        </button>
      </div>
    </div>
  );
}
