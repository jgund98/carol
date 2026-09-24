// What the studio sends to buyers, email and text together:
//   receipt for a purchase · shipped (only once there is a tracking number) ·
//   invoice receipt · a gentle reminder on an overdue invoice.
// Wording for every text and subject line lives in texts.ts. Each function
// returns what went out; nothing here ever throws into a page.
import { money } from "@/lib/site";
import { button, esc, officeBase, sendMail, shell, totalRows } from "./mail";
import { sendSms } from "./sms";
import { trackingLink } from "./shipping";
import { calendarDate } from "./time";
import { fmtMoney, type StudioInvoice } from "./invoice-shared";
import { buyer } from "./texts";
import type { StudioOrder } from "./types";
import { CLASS, calendarUrl, classDayYear, classTime, type StudioClass } from "@/lib/classes";

const first = (name: string) => name.trim().split(/\s+/)[0] || "";
const dear = (name: string) => `<p>Dear ${esc(first(name) || "friend")},</p>`;

function orderRows(o: StudioOrder, totalLabel: string, note?: string): string {
  const rows = o.items.map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ece7de">${esc(i.name)}${i.dims ? `<span style="color:#7a7f8e"> · ${esc(i.dims)}</span>` : ""}${i.qty > 1 ? ` × ${i.qty}` : ""}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;white-space:nowrap;vertical-align:top;padding-left:16px">${money(i.price * i.qty)}</td></tr>`).join("");
  return `<table style="width:100%;border-collapse:collapse;margin-top:14px">${rows}${totalRows(totalLabel, money(o.subtotal), note)}</table>`;
}

export async function sendOrderPaid(o: StudioOrder): Promise<{ email: boolean; sms: boolean }> {
  const t = buyer.receipt(o);
  const html = shell(`
    ${dear(o.name)}
    <p>Thank you for your purchase. Your payment has been received and this is your receipt for order <strong>${esc(o.ref)}</strong>.</p>
    ${orderRows(o, "Total paid", `Paid ${calendarDate(o.paidAt || new Date().toISOString())} by card`)}
    <p style="margin-top:18px">Carol will call you personally to arrange ${esc(o.delivery ? o.delivery.toLowerCase() : "delivery")}. Shipping or installation is quoted separately at that point.</p>
    <p>Every piece is an original, signed by the artist. Thank you for bringing one home.</p>`);
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
  const rows = inv.items.map((it) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ece7de">${esc(it.description)}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;white-space:nowrap;vertical-align:top;padding-left:16px">${fmtMoney(it.cents)}</td></tr>`).join("");
  const when = inv.paidAt ? calendarDate(inv.paidAt) : calendarDate(new Date().toISOString());
  const html = shell(`
    ${dear(inv.name)}
    <p>Payment received, thank you. This is your receipt for invoice <strong>${esc(inv.number)}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:14px">${rows}${totalRows("Total paid", fmtMoney(inv.totalCents), `Paid ${when}${inv.paidHow === "card" ? " by card" : ""}`)}</table>
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

/** Seats reserved at a class: everything they need for the evening, email and text. */
export async function sendClassConfirmation(o: StudioOrder, c: StudioClass, qty: number): Promise<{ email: boolean; sms: boolean }> {
  const t = buyer.classConfirmed(o, c, qty);
  const html = shell(`
    ${dear(o.name)}
    <p>You're in. ${qty === 1 ? "Your seat is" : `Your ${qty} seats are`} reserved for <strong>${esc(c.title)}</strong> with Carol.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:15px">
      <tr><td style="padding:7px 14px 7px 0;color:#7a7f8e;font-weight:600;white-space:nowrap;vertical-align:top">When</td><td style="padding:7px 0"><strong>${esc(classDayYear(c))}</strong><br>${esc(classTime(c))}. Doors open ten minutes early.</td></tr>
      <tr><td style="padding:7px 14px 7px 0;color:#7a7f8e;font-weight:600;white-space:nowrap;vertical-align:top">Where</td><td style="padding:7px 0">${esc(CLASS.venue.name)}<br>${esc(CLASS.venue.street)}, ${esc(CLASS.venue.city)}</td></tr>
      <tr><td style="padding:7px 14px 7px 0;color:#7a7f8e;font-weight:600;white-space:nowrap;vertical-align:top">Seats</td><td style="padding:7px 0">${qty}</td></tr>
      ${totalRows("Total paid", money(o.subtotal), `Order ${esc(o.ref)}, paid by card`)}
    </table>
    ${button(calendarUrl(c), "Add to my calendar")}
    <p style="margin-top:22px"><strong>Bring nothing.</strong> A canvas, brushes, paints and an apron will be waiting at your easel, and light refreshments are served. Wear something you would not mind a fleck of paint on.</p>
    <p>Change of plans? Reply to this email or call the studio at least 48 hours ahead and Carol will move you to the next evening.</p>
    <p>See you in the studio.</p>`);
  const email = o.email ? await sendMail({ to: o.email, name: o.name, subject: t.subject, html }) : false;
  const sms = o.phone ? (await sendSms(o.phone, t.sms)).ok : false;
  return { email, sms };
}
