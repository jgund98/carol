// Alerts to Carol herself: an email and a text for every new order, inquiry
// and payment. Same branded shell as the buyer emails (her signature on top).
// Recipients = Settings (her email + mobile) plus the extras in notify.ts.
// The wording of every subject and text lives in texts.ts.
import { getSettings } from "./store";
import { sendSms } from "./sms";
import { esc, button, sendMail, shell } from "./mail";
import { EXTRA_ALERT_EMAILS, EXTRA_ALERT_PHONES } from "./notify";

export type Field = [label: string, value: string | undefined | null];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function alertRecipients(): Promise<{ emails: string[]; phones: string[] }> {
  let emails: string[] = [...EXTRA_ALERT_EMAILS];
  let phones: string[] = [...EXTRA_ALERT_PHONES];
  try {
    const s = await getSettings();
    emails = [s.notifyEmail, ...emails];
    phones = [s.notifyPhone, ...phones];
  } catch {
    /* defaults */
  }
  return {
    emails: [...new Set(emails.filter((e) => e && EMAIL_RE.test(e)))],
    phones: [...new Set(phones.map((p) => (p || "").replace(/\D/g, "")).filter((p) => p.length >= 10))],
  };
}

export function alertHtml(heading: string, fields: Field[], link: string, cta = "Open in the Studio Office"): string {
  const rows = fields
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `<tr><td style="padding:7px 14px 7px 0;color:#7a7f8e;font-weight:600;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:7px 0;vertical-align:top">${esc(String(v)).replace(/\n/g, "<br>")}</td></tr>`)
    .join("");
  return shell(`<p style="font:600 20px Georgia,serif;margin:0 0 6px">${esc(heading)}</p><table style="border-collapse:collapse;width:100%;font-size:15px">${rows}</table>${button(link, cta)}`);
}

/** One event, both channels. `sms` is the complete text (already carries its link); `fields` become the email rows. An empty `sms` means email only. */
export async function alertCarol(opts: { subject: string; sms: string; fields: Field[]; link: string }): Promise<void> {
  const { emails, phones } = await alertRecipients();
  const html = alertHtml(opts.subject, opts.fields, opts.link);
  await Promise.all([...emails.map((to) => sendMail({ to, subject: opts.subject, html })), ...(opts.sms ? phones.map((p) => sendSms(p, opts.sms)) : [])]);
}
