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
        <span>Email alerts to</span>
        <input type="email" required value={s.notifyEmail} onChange={(e) => setS({ ...s, notifyEmail: e.target.value })} className="o-in" placeholder="Carol@carolcalicchioart.com" />
              </label>
      <label className="o-field">
        <span>Text alerts to</span>
        <input type="tel" value={s.notifyPhone} onChange={(e) => setS({ ...s, notifyPhone: e.target.value })} className="o-in" placeholder="561-400-0678" />
        <span className="o-help">A short text for every new inquiry and order.</span>
      </label>
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
