// What the studio sends to buyers, email and text together:
//   order received · paid by card · shipped (only once there is a tracking
//   number) · invoice receipt · a gentle reminder on an overdue invoice.
// Wording for every text and subject line lives in texts.ts. Each function
// returns what went out; nothing here ever throws into a page.
import { money } from "@/lib/site";
import { button, esc, officeBase, sendMail, shell } from "./mail";
import { sendSms } from "./sms";
import { trackingLink } from "./shipping";
import { calendarDate } from "./time";
import { fmtMoney, type StudioInvoice } from "./invoice-shared";
import { stripeEnabled } from "./stripe";
import { buyer } from "./texts";
import type { StudioOrder } from "./types";

const first = (name: string) => name.trim().split(/\s+/)[0] || "";
const dear = (name: string) => `<p>Dear ${esc(first(name) || "friend")},</p>`;

function orderRows(o: StudioOrder, totalLabel: string): string {
  const rows = o.items.map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ece7de">${esc(i.name)}${i.dims ? `<span style="color:#7a7f8e"> · ${esc(i.dims)}</span>` : ""}${i.qty > 1 ? ` × ${i.qty}` : ""}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;white-space:nowrap">${money(i.price * i.qty)}</td></tr>`).join("");
  return `<table style="width:100%;border-collapse:collapse;margin-top:14px">${rows}<tr><td style="padding:12px 0 0;font-weight:600">${esc(totalLabel)}</td><td style="padding:12px 0 0;text-align:right;font:600 20px Georgia,serif">${money(o.subtotal)}</td></tr></table>`;
}

export async function sendOrderReceived(o: StudioOrder): Promise<{ email: boolean; sms: boolean }> {
  const t = buyer.orderReceived(o);
  const card = stripeEnabled();
  const html = shell(`
    ${dear(o.name)}
    <p>Thank you. Your request <strong>${esc(o.ref)}</strong> has reached the studio.</p>
    ${orderRows(o, "Subtotal")}
    ${card ? button(`${officeBase()}/p/${o.id}`, `Pay ${money(o.subtotal)} by card`) : ""}
    <p style="margin-top:18px">${card ? "You can pay securely by card above, or wait for Carol's call. " : ""}Carol will call you within one business day to confirm the piece is still available, settle payment your way (${esc(o.payment || "card, PayPal, wire or check")}) and arrange ${esc(o.delivery ? o.delivery.toLowerCase() : "delivery")}. Shipping or installation is quoted separately.</p>
    <p>Nothing has been charged.</p>`);
  const email = o.email ? await sendMail({ to: o.email, name: o.name, subject: t.subject, html }) : false;
  const sms = o.phone ? (await sendSms(o.phone, t.sms)).ok : false;
  return { email, sms };
}

export async function sendOrderPaid(o: StudioOrder): Promise<{ email: boolean; sms: boolean }> {
  const t = buyer.orderPaid(o);
  const html = shell(`
    ${dear(o.name)}
    <p>Payment received, thank you. This is your receipt for order <strong>${esc(o.ref)}</strong>.</p>
    ${orderRows(o, "Paid by card")}
    <p style="margin-top:18px">Carol will call to arrange ${esc(o.delivery ? o.delivery.toLowerCase() : "delivery")}. Every piece is original and signed by the artist.</p>`);
  const email = o.email ? await sendMail({ to: o.email, name: o.name, subject: t.subject, html }) : false;
  const sms = o.phone ? (await sendSms(o.phone, t.sms)).ok : false;
  return { email, sms };
}

export async function sendOrderShipped(o: StudioOrder): Promise<{ email: boolean; sms: boolean }> {
  const link = trackingLink(o.carrier, o.tracking);
  const t = buyer.shipped(o, Boolean(link));
  const pieces = o.items.map((i) => i.name).join(", ");
  const html = shell(`
    ${dear(o.name)}
    <p><strong>${esc(pieces)}</strong> is on its way to you${o.carrier ? ` with ${esc(o.carrier)}` : ""}.</p>
    <p style="margin-top:14px">Tracking number<br><strong style="font-size:18px">${esc(o.tracking || "")}</strong></p>
    ${link ? button(link, "Track the package") : ""}
    <p style="margin-top:18px">Original art travels crated or double-boxed. If anything about the delivery needs a hand, reply here or call the studio.</p>`);
  const email = o.email ? await sendMail({ to: o.email, name: o.name, subject: t.subject, html }) : false;
  const sms = o.phone ? (await sendSms(o.phone, t.sms)).ok : false;
  return { email, sms };
}

export async function sendPaymentReceipt(inv: StudioInvoice): Promise<{ email: boolean; sms: boolean }> {
  const t = buyer.invoicePaid(inv);
  const rows = inv.items.map((it) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ece7de">${esc(it.description)}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;white-space:nowrap">${fmtMoney(it.cents)}</td></tr>`).join("");
  const when = inv.paidAt ? calendarDate(inv.paidAt) : calendarDate(new Date().toISOString());
  const html = shell(`
    ${dear(inv.name)}
    <p>Payment received, thank you. This is your receipt for invoice <strong>${esc(inv.number)}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:14px">${rows}<tr><td style="padding:12px 0 0;font-weight:600">Paid ${esc(when)}${inv.paidHow === "card" ? " by card" : ""}</td><td style="padding:12px 0 0;text-align:right;font:600 20px Georgia,serif">${fmtMoney(inv.totalCents)}</td></tr></table>
    ${button(`${officeBase()}/invoice/${inv.id}?k=${inv.token}`, "View the paid invoice")}
    <p style="margin-top:18px">Carol will be in touch about delivery. Every piece is original and signed by the artist.</p>`);
  const email = inv.email ? await sendMail({ to: inv.email, name: inv.name, subject: t.subject, html }) : false;
  const sms = inv.phone ? (await sendSms(inv.phone, t.sms)).ok : false;
  return { email, sms };
}

export async function sendInvoiceReminder(inv: StudioInvoice): Promise<{ email: boolean; sms: boolean }> {
  const t = buyer.invoiceReminder(inv);
  const due = inv.dueDate ? calendarDate(inv.dueDate) : null;
  const html = shell(`
    ${dear(inv.name)}
    <p>A gentle reminder that invoice <strong>${esc(inv.number)}</strong> for <strong>${fmtMoney(inv.totalCents)}</strong>${due ? ` was due ${esc(due)}` : " is still open"}.</p>
    ${button(`${officeBase()}/invoice/${inv.id}?k=${inv.token}`, "View and pay the invoice")}
    <p style="margin-top:18px">If it has already been taken care of, please ignore this note, and thank you.</p>`);
  const email = inv.email ? await sendMail({ to: inv.email, name: inv.name, subject: t.subject, html }) : false;
  const sms = inv.phone ? (await sendSms(inv.phone, t.sms)).ok : false;
  return { email, sms };
}
