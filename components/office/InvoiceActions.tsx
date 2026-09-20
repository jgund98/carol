"use client";
// Send it, text it, copy the link, mark it paid. Resends are deliberately
// slow: a button greys out for a minute after each send and always shows
// when it last went out, so a nervous double-tap cannot send twice.
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Copy, Mail, MessageSquare, Printer } from "lucide-react";
import { markInvoiceAction, sendInvoiceAction } from "@/app/office/actions";
import type { StudioInvoice } from "@/lib/studio/invoice-shared";
import { timeAgo } from "@/lib/studio/time";
import { useToast } from "./Toast";

const COOLDOWN = 60; // seconds

export default function InvoiceActions({ inv, url, justSent = [] }: { inv: StudioInvoice; url: string; justSent?: string[] }) {
  const [busy, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const [wait, setWait] = useState<{ email: number; text: number }>({ email: 0, text: 0 });
  const [, tick] = useState(0);
  const toast = useToast();
  const router = useRouter();

  // A send within the last minute (this visit or a previous one) starts the cooldown.
  useEffect(() => {
    const left = (iso: string | null) => (iso ? Math.max(0, COOLDOWN - Math.floor((Date.now() - new Date(iso).getTime()) / 1000)) : 0);
    setWait({ email: left(inv.emailedAt), text: left(inv.textedAt) });
  }, [inv.emailedAt, inv.textedAt]);
  useEffect(() => {
    const t = setInterval(() => {
      setWait((w) => ({ email: Math.max(0, w.email - 1), text: Math.max(0, w.text - 1) }));
      tick((n) => n + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string, channel?: "email" | "text") =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast(done);
        if (channel) setWait((w) => ({ ...w, [channel]: COOLDOWN }));
        router.refresh();
      } else toast(r.error ?? "That did not work.", "error");
    });
  const open = inv.status === "draft" || inv.status === "sent";

  return (
    <div className="grid gap-3">
      {justSent.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-[rgba(47,122,79,0.35)] bg-[rgba(47,122,79,0.08)] p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--o-green)]" />
          <div className="text-[0.95rem]">
            <p className="font-semibold text-[var(--o-green)]">Sent. {inv.name.split(/\s+/)[0] || "They"} just received it.</p>
            <p className="text-[var(--o-soft)]">
              {justSent.includes("emailed") && `Emailed to ${inv.email}`}
              {justSent.includes("emailed") && justSent.includes("texted") && " and "}
              {justSent.includes("texted") && `texted to ${inv.phone}`}. No need to send it again.
            </p>
          </div>
        </div>
      )}

      {open && (
        <>
          <div>
            <button type="button" disabled={busy || !inv.email || wait.email > 0} onClick={() => run(() => sendInvoiceAction(inv.id, "email"), `Emailed to ${inv.email}.`, "email")} className={`btn w-full ${inv.emailedAt ? "btn-line" : "btn-pink"}`}>
              <Mail className="h-4 w-4" /> {wait.email > 0 ? `Emailed · wait ${wait.email}s` : inv.emailedAt ? "Email it again" : "Email the invoice"}
            </button>
            <SentLine label="Last emailed" at={inv.emailedAt} missing={!inv.email ? "No email address on this invoice" : undefined} />
          </div>
          <div>
            <button type="button" disabled={busy || !inv.phone || wait.text > 0} onClick={() => run(() => sendInvoiceAction(inv.id, "text"), `Texted to ${inv.phone}.`, "text")} className={`btn w-full ${inv.textedAt ? "btn-line" : "btn-ink"}`}>
              <MessageSquare className="h-4 w-4" /> {wait.text > 0 ? `Texted · wait ${wait.text}s` : inv.textedAt ? "Text it again" : "Text the invoice"}
            </button>
            <SentLine label="Last texted" at={inv.textedAt} missing={!inv.phone ? "No mobile number on this invoice" : undefined} />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              toast("Could not copy. Long-press the link below instead.", "error");
            }
          }}
          className="btn btn-line btn-sm"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
        </button>
        <a href={url} target="_blank" rel="noopener" className="btn btn-line btn-sm">
          <Printer className="h-4 w-4" /> Print / PDF
        </a>
      </div>

      {open && (
        <div className="mt-2 border-t border-[var(--o-hair)] pt-4">
          <p className="mb-2 text-[0.9rem] text-[var(--o-soft)]">When the money arrives:</p>
          <button type="button" disabled={busy} onClick={() => run(() => markInvoiceAction(inv.id, "paid"), "Marked paid.")} className="btn btn-green w-full">
            <Check className="h-4 w-4" /> Mark as paid
          </button>
          <button type="button" disabled={busy} onClick={() => run(() => markInvoiceAction(inv.id, "void"), "Invoice voided.")} className="btn btn-line btn-sm mt-2 w-full">
            Void this invoice
          </button>
        </div>
      )}
      {inv.status === "paid" && (
        <button type="button" disabled={busy} onClick={() => run(() => markInvoiceAction(inv.id, "sent"), "Back to unpaid.")} className="btn btn-line btn-sm w-full">
          Actually, not paid yet
        </button>
      )}
      {inv.status === "void" && (
        <button type="button" disabled={busy} onClick={() => run(() => markInvoiceAction(inv.id, "draft"), "Invoice restored.")} className="btn btn-line btn-sm w-full">
          Restore this invoice
        </button>
      )}
    </div>
  );
}

function SentLine({ label, at, missing }: { label: string; at: string | null; missing?: string }) {
  if (missing) return <p className="mt-1 text-center text-[0.8rem] text-[var(--o-faint)]">{missing}</p>;
  if (!at) return null;
  return (
    <p className="mt-1 text-center text-[0.8rem] text-[var(--o-faint)]">
      {label} {timeAgo(at)}
    </p>
  );
}
