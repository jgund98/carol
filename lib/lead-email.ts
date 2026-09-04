// ─────────────────────────────────────────────────────────────────────────
// Client Email Protocol — portable lead notifier (Brevo transactional API).
// Drop this file into any Next.js client site. Forms POST to /api/lead and the
// owner gets a tidy "New <Whatever> Lead" email.
//
// Env vars:
//   BREVO_API_KEY    (required)  your Brevo v3 API key  (xkeysib-…)
//   LEAD_TO_EMAIL    (required)  where THIS client's leads go (their inbox)
//   LEAD_FROM_EMAIL  (optional)  default noreply@epicdevsolutions.com
//   LEAD_FROM_NAME   (optional)  default "Website"
//   LEAD_SITE_NAME   (optional)  shown as "via <site>" in the email
// ─────────────────────────────────────────────────────────────────────────

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const FROM_EMAIL = process.env.LEAD_FROM_EMAIL || "noreply@epicdevsolutions.com";
const FROM_NAME = process.env.LEAD_FROM_NAME || "Carol Calicchio Art";
const TO_EMAIL = process.env.LEAD_TO_EMAIL || "Carol@carolcalicchioart.com";
const SITE_NAME = process.env.LEAD_SITE_NAME || "carolcalicchioart.com";

export type LeadField = [label: string, value: string | undefined | null];

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
  );

function leadHtml(heading: string, fields: LeadField[], footer?: string): string {
  const rows = fields
    .filter(([, v]) => v && String(v).trim())
    .map(
      ([label, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#6b6256;font:600 13px system-ui,sans-serif;vertical-align:top;white-space:nowrap">${esc(
          label
        )}</td><td style="padding:6px 0;color:#1a1a1a;font:14px system-ui,sans-serif;vertical-align:top">${esc(
          String(v)
        ).replace(/\n/g, "<br>")}</td></tr>`
    )
    .join("");
  return `<div style="max-width:560px;margin:0 auto;padding:24px;background:#ffffff;border-radius:14px;border:1px solid #ececec;font-family:system-ui,sans-serif">
    <h2 style="margin:0 0 4px;font:800 20px system-ui;color:#111">${esc(heading)}</h2>
    ${SITE_NAME ? `<p style="margin:0 0 16px;font:13px system-ui;color:#8a8a8a">via ${esc(SITE_NAME)}</p>` : ""}
    <table style="border-collapse:collapse;width:100%">${rows}</table>
    <p style="margin:18px 0 0;font:13px system-ui;color:#8a8a8a">${esc(
      footer || "Reply to this email to respond to them directly."
    )}</p>
  </div>`;
}

/** Send one lead notification. No-ops cleanly if the key/recipient are unset. */
export async function sendLead(opts: {
  subject: string;
  fields: LeadField[];
  replyTo?: { email: string; name?: string };
  footer?: string;
}): Promise<{ ok: boolean; skipped?: boolean; status?: number }> {
  const key = process.env.BREVO_API_KEY;
  if (!key || !TO_EMAIL) {
    console.warn("[lead] BREVO_API_KEY or LEAD_TO_EMAIL missing — skipping send.");
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: TO_EMAIL }],
        ...(opts.replyTo?.email ? { replyTo: opts.replyTo } : {}),
        subject: opts.subject,
        htmlContent: leadHtml(opts.subject, opts.fields, opts.footer),
      }),
    });
    if (!res.ok) {
      console.error("[lead] Brevo send failed:", res.status, await res.text().catch(() => ""));
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error("[lead] send error:", err);
    return { ok: false };
  }
}
