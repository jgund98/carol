// One branded email shell for everything the studio sends to a buyer: her
// signature on top, plain type, the studio's address at the bottom, reply-to
// Carol. Through Brevo on the same key as the alerts. No-ops without a key.
import { site } from "@/lib/site";

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export const officeBase = () => process.env.OFFICE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://carol.epicdevsolutions.com";

export function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:22px;background:#e8397f;color:#fff;text-decoration:none;font:700 15px system-ui;padding:14px 26px;border-radius:999px">${esc(label)}</a>`;
}

export function shell(body: string): string {
  return `<div style="background:#f6f2ea;padding:32px 16px;font-family:system-ui,-apple-system,Segoe UI,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:36px 32px;border:1px solid #ece7de">
    <img src="${officeBase()}/brand/sig-ink.png" alt="Carol Calicchio" width="180" style="display:block;width:180px;height:auto" />
    <div style="margin-top:22px;font:15px/1.6 system-ui;color:#12172b">${body}</div>
    <p style="margin:26px 0 0;padding-top:18px;border-top:1px solid #ece7de;font:13px/1.55 system-ui;color:#7a7f8e">${esc(site.studio.name)} · ${esc(site.studio.street)}, ${esc(site.studio.city)}, ${esc(site.studio.state)} ${esc(site.studio.zip)} · ${esc(site.phone)}<br>Reply to this email to reach Carol directly.</p>
  </div>
</div>`;
}

export async function sendMail(opts: { to: string; name?: string; subject: string; html: string }): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  if (!key || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.to)) return false;
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: process.env.LEAD_FROM_EMAIL || "noreply@epicdevsolutions.com", name: "Carol Calicchio Art" },
        to: [{ email: opts.to, name: opts.name || undefined }],
        replyTo: { email: site.email, name: "Carol Calicchio" },
        subject: opts.subject,
        htmlContent: opts.html,
      }),
    });
    if (!res.ok) console.error("[mail] Brevo failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[mail] error:", e);
    return false;
  }
}
