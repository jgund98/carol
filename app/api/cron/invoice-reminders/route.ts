// Once a day (vercel.json): remind buyers about invoices past their due date.
// First reminder the day after it is due, then every 3 days, three at most.
import { listInvoices, saveInvoice } from "@/lib/studio/invoices";
import { sendInvoiceReminder } from "@/lib/studio/customer-notify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY = 86400000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });

  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const sent: string[] = [];
  for (const inv of await listInvoices()) {
    if (inv.status !== "sent" || !inv.dueDate || inv.dueDate >= today) continue;
    if ((inv.remindCount ?? 0) >= 3) continue;
    if (inv.remindedAt && now - new Date(inv.remindedAt).getTime() < 3 * DAY) continue;
    const r = await sendInvoiceReminder(inv);
    if (r.email || r.sms) {
      await saveInvoice({ ...inv, remindedAt: new Date().toISOString(), remindCount: (inv.remindCount ?? 0) + 1 });
      sent.push(inv.number);
    }
  }
  return Response.json({ ok: true, reminded: sent });
}
