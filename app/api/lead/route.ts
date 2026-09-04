// Client Email Protocol — universal lead endpoint.
// Forms POST JSON here; the owner gets an email whose SUBJECT depends on the
// form (formType -> subject), or you can pass an explicit `subject`.
import { sendLead, type LeadField } from "@/lib/lead-email";

export const dynamic = "force-dynamic";

// Map a form's `formType` to its email subject. Add a client's form types here,
// or just send an explicit `subject` from the form and skip the map entirely.
const SUBJECTS: Record<string, string> = {
  contact: "New Website Lead",
  website: "New Website Lead",
  quote: "New Quote Request",
  estimate: "New Estimate Request",
  booking: "New Booking Request",
  job: "New Job Application",
  career: "New Job Application",
  dealer: "New Dealer Application",
  wholesale: "New Wholesale Inquiry",
  newsletter: "New Newsletter Signup",
  support: "New Support Request",
  inquiry: "New Artwork Inquiry",
  order: "New Order Request",
  commission: "New Commission Request",
  visit: "New Studio Visit Request",
};

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;

type LeadBody = {
  formType?: string;
  subject?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  // Any extra custom fields (shown in the email as label/value rows).
  fields?: Record<string, string | number | null | undefined>;
};

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const subject =
    (body.subject && body.subject.trim()) ||
    SUBJECTS[String(body.formType || "").toLowerCase()] ||
    "New Website Lead";

  const known: LeadField[] = [
    ["Name", body.name],
    ["Email", body.email],
    ["Phone", body.phone],
    ["Company", body.company],
    ["Message", body.message],
  ];
  const extra: LeadField[] = Object.entries(body.fields || {}).map(
    ([k, v]) => [k, v == null ? undefined : String(v)] as LeadField
  );

  const replyTo =
    body.email && EMAIL_RE.test(body.email)
      ? { email: body.email, name: body.name }
      : undefined;

  const res = await sendLead({ subject, fields: [...known, ...extra], replyTo });
  if (res.skipped) {
    // No BREVO_API_KEY yet (local/dev): log the lead so nothing is silently lost.
    console.log("[lead:" + subject + "]", JSON.stringify([...known, ...extra]));
    return Response.json({ ok: true, skipped: true });
  }
  return Response.json({ ok: res.ok, skipped: false }, { status: res.ok ? 200 : 502 });
}
