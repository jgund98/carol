// What happens once Stripe says an invoice is paid. Used by the buyer's return
// to the invoice page and by the webhook, so it must be safe to run twice.
import { getInvoice, saveInvoice } from "./invoices";
import { getOrder, saveOrder } from "./store";
import { sendPaymentReceipt } from "./customer-notify";
import { alertCarol } from "./alerts";
import { carol } from "./texts";
import { fmtMoney, type StudioInvoice } from "./invoice-shared";
import { officeBase } from "./mail";

export async function settleInvoice(invoiceId: string, sessionId: string): Promise<StudioInvoice | null> {
  let inv = await getInvoice(invoiceId);
  if (!inv) return null;
  if (inv.status === "paid" || inv.status === "refunded") return inv;
  const now = new Date().toISOString();
  inv = { ...inv, status: "paid", paidAt: now, paidHow: "card", stripeSessionId: sessionId };
  await saveInvoice(inv);
  try {
    const r = await sendPaymentReceipt(inv);
    if (r.email || r.sms) {
      inv = { ...inv, receiptSentAt: now };
      await saveInvoice(inv);
    }
  } catch (e) {
    console.error("[settle] receipt:", e);
  }
  if (inv.orderId) {
    const o = await getOrder(inv.orderId);
    if (o && (o.status === "new" || o.status === "contacted")) await saveOrder({ ...o, status: "paid", paidAt: now, stripeSessionId: sessionId });
  }
  try {
    await alertCarol({
      ...carol.invoicePaid(inv),
      fields: [["Buyer", inv.name], ["Email", inv.email], ["Phone", inv.phone], ["Invoice", inv.number], ["Amount", `${fmtMoney(inv.totalCents)} by card`], ["For", inv.items.map((i) => i.description).join(", ")]],
      link: `${officeBase()}/office/invoices/${inv.id}`,
    });
  } catch (e) {
    console.error("[settle] alert:", e);
  }
  return inv;
}
