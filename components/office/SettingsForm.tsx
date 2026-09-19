"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsAction } from "@/app/office/actions";
import type { Settings } from "@/lib/studio/types";
import { useToast } from "./Toast";

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState(initial);
  const [busy, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const dirty = JSON.stringify(s) !== JSON.stringify(initial);
  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveSettingsAction(s);
          if (r.ok) {
            toast("Saved.");
            router.refresh();
          } else toast(r.error, "error");
        });
      }}
    >
      <label className="o-field">
        <span>Send new inquiries and orders to</span>
        <input type="email" required value={s.notifyEmail} onChange={(e) => setS({ ...s, notifyEmail: e.target.value })} className="o-in" placeholder="Carol@carolcalicchioart.com" />
        <span className="o-help">Every message and order also lands in this office, so nothing depends on email alone.</span>
      </label>
      <label className="o-field">
        <span>Also send a copy to · optional</span>
        <input type="email" value={s.notifyEmail2} onChange={(e) => setS({ ...s, notifyEmail2: e.target.value })} className="o-in" placeholder="An assistant or a family member" />
      </label>
      <div className="border-t border-[var(--o-hair)] pt-5">
        <label className="o-choice relative mb-4" data-on={s.textAlerts}>
          <input type="checkbox" checked={s.textAlerts} onChange={() => setS({ ...s, textAlerts: !s.textAlerts })} />
          <span className="o-choice-dot" />
          Text me when something comes in
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="o-field">
            <span>Mobile number</span>
            <input type="tel" value={s.notifyPhone} onChange={(e) => setS({ ...s, notifyPhone: e.target.value })} className="o-in" placeholder="561-400-0678" />
          </label>
          <label className="o-field">
            <span>Second number · optional</span>
            <input type="tel" value={s.notifyPhone2} onChange={(e) => setS({ ...s, notifyPhone2: e.target.value })} className="o-in" placeholder="An assistant or family member" />
          </label>
        </div>
      </div>
      <label className="o-field border-t border-[var(--o-hair)] pt-5">
        <span>How buyers can pay you · shown on invoices</span>
        <textarea value={s.payInstructions} onChange={(e) => setS({ ...s, payInstructions: e.target.value })} rows={3} className="o-in" placeholder="Card, PayPal, wire, check, Zelle…" />
      </label>
      <button type="submit" disabled={!dirty || busy} className="btn btn-ink w-full sm:w-max">
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
