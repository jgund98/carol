"use client";
// Send it, text it, copy the link, mark it paid.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Mail, MessageSquare, Printer } from "lucide-react";
import { markInvoiceAction, sendInvoiceAction } from "@/app/office/actions";
import type { StudioInvoice } from "@/lib/studio/invoice-shared";
import { useToast } from "./Toast";

export default function InvoiceActions({ inv, url }: { inv: StudioInvoice; url: string }) {
  const [busy, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast(done);
        router.refresh();
      } else toast(r.error ?? "That did not work.", "error");
    });
  const open = inv.status === "draft" || inv.status === "sent";

  return (
    <div className="grid gap-3">
      {open && (
        <>
          <button type="button" disabled={busy || !inv.email} onClick={() => run(() => sendInvoiceAction(inv.id, "email"), `Emailed to ${inv.email}.`)} className="btn btn-pink w-full">
            <Mail className="h-4 w-4" /> {inv.emailedAt ? "Email it again" : "Email the invoice"}
          </button>
          <button type="button" disabled={busy || !inv.phone} onClick={() => run(() => sendInvoiceAction(inv.id, "text"), `Texted to ${inv.phone}.`)} className="btn btn-ink w-full">
            <MessageSquare className="h-4 w-4" /> {inv.textedAt ? "Text it again" : "Text the invoice"}
          </button>
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
