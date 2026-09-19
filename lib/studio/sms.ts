// Text messages through Brevo's transactional SMS API, on the same key the
// emails use. Used for Carol's own alerts and for texting an invoice link.
// No-ops cleanly when the key is missing.
const ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/sms";
const SENDER = (process.env.SMS_SENDER || "CarolArt").slice(0, 11);

/** US-friendly E.164: "561-555-0142" → "+15615550142". Returns null if it cannot be a phone number. */
export function e164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^\+\d{10,15}$/.test(digits)) return digits;
  const d = digits.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

export async function sendSms(to: string | null | undefined, content: string): Promise<{ ok: boolean; skipped?: boolean }> {
  const key = process.env.BREVO_API_KEY;
  const recipient = e164(to);
  if (!key || !recipient) return { ok: false, skipped: true };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ type: "transactional", unicodeEnabled: false, sender: SENDER, recipient, content: content.slice(0, 480) }),
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
