// Text messages through Brevo's transactional SMS API, on the same key the
// emails use. Same shape as Epic's lib/sms.ts, which is proven in production.
// Sender comes from BREVO_SMS_SENDER (a registered 10DLC number once there is
// one); until then an alphanumeric "CarolArt". No-ops cleanly without a key.
import { gsm, smsLength, SMS_LIMIT } from "./texts";

const ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/sms";

/** Brevo wants the international number with no symbols: "561-555-0142" → "15615550142". */
export function smsNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, "");
  if (d.length === 10) d = "1" + d;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

export function smsEnabled(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function sendSms(to: string | null | undefined, content: string): Promise<{ ok: boolean; skipped?: boolean }> {
  const key = process.env.BREVO_API_KEY;
  const recipient = smsNumber(to);
  if (!key || !recipient) return { ok: false, skipped: true };
  const text = gsm(content);
  if (smsLength(text) > SMS_LIMIT) console.warn(`[sms] ${smsLength(text)} chars, will split into more than one segment: ${text.slice(0, 60)}...`);
  const rawSender = (process.env.BREVO_SMS_SENDER || process.env.SMS_SENDER || "CarolArt").trim();
  const sender = /^\+?\d+$/.test(rawSender) ? rawSender.replace(/\D/g, "").slice(0, 15) : rawSender.slice(0, 11);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ type: "transactional", sender, recipient, content: text.slice(0, 480) }),
    });
    if (!res.ok) {
      console.error("[sms] Brevo failed:", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[sms] error:", e);
    return { ok: false };
  }
}
