// The Brevo key, however it was pasted. Brevo's MCP page hands out the key
// wrapped as base64 JSON ({"api_key":"xkeysib-…"}); the raw key starts with
// "xkeysib-". Either form works here so a paste can never silently 401.
let cached: { raw: string | undefined; key: string | null } | null = null;

export function brevoKey(): string | null {
  const raw = process.env.BREVO_API_KEY?.trim();
  if (cached && cached.raw === raw) return cached.key;
  let key: string | null = raw || null;
  if (raw && !raw.startsWith("xkeysib-") && raw.startsWith("eyJ")) {
    try {
      const j = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as Record<string, unknown>;
      const found = Object.values(j).find((v) => typeof v === "string" && v.startsWith("xkeysib-")) as string | undefined;
      key = found || raw;
    } catch {
      key = raw;
    }
  }
  cached = { raw, key };
  return key;
}
