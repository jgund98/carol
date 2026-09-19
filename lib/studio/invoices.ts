// Invoices: Carol writes one (or starts from an order), sends it by email or
// text, and marks it paid when the money arrives. The buyer opens a private
// link, no login. Money is stored in whole cents.
import { randomBytes } from "node:crypto";
import { store, newId } from "./store";
import { site } from "@/lib/site";
import { sendSms } from "./sms";

export type { InvoiceItem, InvoiceStatus, StudioInvoice } from "./invoice-shared";
export { fmtMoney, fmtDate } from "./invoice-shared";
import { fmtMoney, fmtDate, type InvoiceItem, type StudioInvoice } from "./invoice-shared";

export async function listInvoices(): Promise<StudioInvoice[]> {
  const rows = await (await store()).list<StudioInvoice>("invoice");
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getInvoice(id: string): Promise<StudioInvoice | null> {
  return (await store()).get<StudioInvoice>("invoice", id);
}

export async function saveInvoice(inv: StudioInvoice): Promise<void> {
  await (await store()).put("invoice", inv.id, { ...inv, updatedAt: new Date().toISOString() });
}

export async function nextNumber(): Promise<string> {
  const n = (await (await store()).count("invoice")) + 1;
  return `INV-${String(n).padStart(4, "0")}`;
}

export function newInvoice(partial: Partial<StudioInvoice>): StudioInvoice {
  const now = new Date().toISOString();
  const items = partial.items ?? [];
  return {
    id: newId("inv"),
    number: partial.number ?? "INV-0000",
    token: randomBytes(12).toString("hex"),
    createdAt: now,
    updatedAt: now,
    name: "",
    email: "",
    phone: "",
    dueDate: null,
    note: "",
    status: "draft",
    sentAt: null,
    emailedAt: null,
    textedAt: null,
    paidAt: null,
    paidHow: null,
    orderId: null,
    ...partial,
    items,
    totalCents: items.reduce((n, i) => n + i.cents, 0),
  };
}

export const officeBase = () => process.env.OFFICE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://carol.epicdevsolutions.com";
export const invoiceUrl = (inv: StudioInvoice) => `${officeBase()}/invoice/${inv.id}?k=${inv.token}`;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function invoiceEmailHtml(inv: StudioInvoice, payInstructions: string): string {
  const url = invoiceUrl(inv);
  const rows = inv.items
    .map((it) => `<tr><td style="padding:9px 0;border-bottom:1px solid #ece7de;font:15px Georgia,serif;color:#12172b">${esc(it.description)}</td><td style="padding:9px 0;border-bottom:1px solid #ece7de;text-align:right;font:15px Georgia,serif;color:#12172b;white-space:nowrap">${fmtMoney(it.cents)}</td></tr>`)
    .join("");
  const first = inv.name.trim().split(/\s+/)[0] || "";
  return `<div style="background:#f6f2ea;padding:32px 16px;font-family:system-ui,-apple-system,Segoe UI,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:36px 32px;border:1px solid #ece7de">
    <img src="${officeBase()}/brand/sig-ink.png" alt="Carol Calicchio" width="180" style="display:block;width:180px;height:auto" />
    <p style="margin:22px 0 0;font:15px/1.55 system-ui;color:#12172b">${first ? `Dear ${esc(first)},` : "Hello,"}</p>
    <p style="margin:10px 0 0;font:15px/1.55 system-ui;color:#12172b">Here is your invoice from Carol Calicchio Art Studio${inv.dueDate ? `, due ${esc(fmtDate(inv.dueDate))}` : ""}.</p>
    <p style="margin:22px 0 6px;font:13px system-ui;color:#7a7f8e">Invoice ${esc(inv.number)}</p>
    <table style="width:100%;border-collapse:collapse">${rows}
      <tr><td style="padding:14px 0 0;font:600 16px system-ui;color:#12172b">Total</td><td style="padding:14px 0 0;text-align:right;font:600 22px Georgia,serif;color:#12172b">${fmtMoney(inv.totalCents)}</td></tr>
    </table>
    ${inv.note ? `<p style="margin:18px 0 0;font:14px/1.55 system-ui;color:#4b5060">${esc(inv.note).replace(/\n/g, "<br>")}</p>` : ""}
    <a href="${url}" style="display:inline-block;margin-top:24px;background:#e8397f;color:#fff;text-decoration:none;font:700 15px system-ui;padding:14px 26px;border-radius:999px">View the invoice</a>
    ${payInstructions ? `<p style="margin:22px 0 0;padding-top:18px;border-top:1px solid #ece7de;font:13px/1.55 system-ui;color:#4b5060"><strong style="color:#12172b">How to pay.</strong> ${esc(payInstructions)}</p>` : ""}
    <p style="margin:22px 0 0;font:13px/1.55 system-ui;color:#7a7f8e">${esc(site.studio.name)} · ${esc(site.studio.street)}, ${esc(site.studio.city)}, ${esc(site.studio.state)} ${esc(site.studio.zip)} · ${esc(site.phone)}<br>Reply to this email to reach Carol directly.</p>
  </div>
</div>`;
}

/** Email the invoice through Brevo. Reply-to is Carol. */
export async function emailInvoice(inv: StudioInvoice, payInstructions: string): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  if (!key || !inv.email) return false;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: process.env.LEAD_FROM_EMAIL || "noreply@epicdevsolutions.com", name: "Carol Calicchio Art" },
      to: [{ email: inv.email, name: inv.name || undefined }],
      replyTo: { email: site.email, name: "Carol Calicchio" },
      subject: `Invoice ${inv.number} from Carol Calicchio Art Studio · ${fmtMoney(inv.totalCents)}`,
      htmlContent: invoiceEmailHtml(inv, payInstructions),
    }),
  });
  if (!res.ok) console.error("[invoice] email failed:", res.status, await res.text().catch(() => ""));
  return res.ok;
}

/** Text a short link. Plain ASCII so it stays one cheap segment. */
export async function textInvoice(inv: StudioInvoice): Promise<boolean> {
  const first = inv.name.trim().split(/\s+/)[0];
  const text = `${first ? `Hi ${first}, ` : "Hi, "}this is Carol Calicchio Art Studio. Your invoice ${inv.number} for ${fmtMoney(inv.totalCents)} is ready: ${invoiceUrl(inv)} Reply STOP to opt out.`;
  const r = await sendSms(inv.phone, text);
  return r.ok;
}
