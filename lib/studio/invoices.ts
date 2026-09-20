// Invoices: Carol writes one (or starts from an order), sends it by email or
// text, and marks it paid when the money arrives. The buyer opens a private
// link, no login. Money is stored in whole cents.
import { randomBytes } from "node:crypto";
import { store, newId } from "./store";
import { sendSms } from "./sms";
import { esc, officeBase, sendMail, shell } from "./mail";
import { buyer } from "./texts";

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
    stripeSessionId: null,
    ...partial,
    items,
    totalCents: items.reduce((n, i) => n + i.cents, 0),
  };
}

export { officeBase };
export const invoiceUrl = (inv: StudioInvoice) => `${officeBase()}/invoice/${inv.id}?k=${inv.token}`;
/** Short and plain for a text message, so it stays one SMS and never turns into an MMS. */
export const invoiceShortUrl = (inv: StudioInvoice) => `${officeBase().replace(/^https?:\/\//, "")}/i/${inv.id}`;

export function invoiceEmailHtml(inv: StudioInvoice, payInstructions: string): string {
  const url = invoiceUrl(inv);
  const rows = inv.items.map((it) => `<tr><td style="padding:9px 0;border-bottom:1px solid #ece7de">${esc(it.description)}</td><td style="padding:9px 0;border-bottom:1px solid #ece7de;text-align:right;white-space:nowrap">${fmtMoney(it.cents)}</td></tr>`).join("");
  const first = inv.name.trim().split(/\s+/)[0] || "";
  return shell(`
    <p>${first ? `Dear ${esc(first)},` : "Hello,"}</p>
    <p>Here is your invoice from Carol Calicchio Art Studio${inv.dueDate ? `, due ${esc(fmtDate(inv.dueDate))}` : ""}.</p>
    <p style="margin:22px 0 6px;font-size:13px;color:#7a7f8e">Invoice ${esc(inv.number)}</p>
    <table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding:14px 0 0;font-weight:600">Total</td><td style="padding:14px 0 0;text-align:right;font:600 22px Georgia,serif">${fmtMoney(inv.totalCents)}</td></tr></table>
    ${inv.note ? `<p style="margin:18px 0 0;color:#4b5060">${esc(inv.note).replace(/\n/g, "<br>")}</p>` : ""}
    <a href="${url}" style="display:inline-block;margin-top:24px;background:#e8397f;color:#fff;text-decoration:none;font:700 15px system-ui;padding:14px 26px;border-radius:999px">View and pay the invoice</a>
    ${payInstructions ? `<p style="margin:22px 0 0;padding-top:18px;border-top:1px solid #ece7de;font-size:13px;color:#4b5060"><strong style="color:#12172b">How to pay.</strong> ${esc(payInstructions)}</p>` : ""}`);
}

/** Email the invoice through Brevo. Reply-to is Carol. */
export async function emailInvoice(inv: StudioInvoice, payInstructions: string): Promise<boolean> {
  if (!inv.email) return false;
  return sendMail({ to: inv.email, name: inv.name, subject: buyer.invoiceSent(inv).subject, html: invoiceEmailHtml(inv, payInstructions) });
}

/** Text a short link. Plain ASCII so it stays one cheap segment. */
export async function textInvoice(inv: StudioInvoice): Promise<boolean> {
  const r = await sendSms(inv.phone, buyer.invoiceSent(inv).sms);
  return r.ok;
}
