// Every form on the site posts here. Two things happen: the message is saved
// into the Studio Office (Inquiries, or Orders for a checkout) and Carol gets
// an email about it. If the email cannot be sent the message is still saved,
// so nothing is ever lost.
import { sendLead, type LeadField } from "@/lib/lead-email";
import { getSettings, newId, saveInquiry, saveOrder } from "@/lib/studio/store";
import type { Inquiry, InquiryKind, OrderItem, StudioOrder } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

const SUBJECTS: Record<string, string> = {
  contact: "New Website Lead",
  website: "New Website Lead",
  newsletter: "New Newsletter Signup",
  inquiry: "New Artwork Inquiry",
  order: "New Order Request",
  commission: "New Commission Request",
  visit: "New Studio Visit Request",
};

const KIND: Record<string, InquiryKind> = {
  contact: "contact",
  website: "contact",
  inquiry: "inquiry",
  commission: "commission",
  visit: "visit",
  newsletter: "newsletter",
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
  workSlug?: string;
  fields?: Record<string, string | number | null | undefined>;
  order?: {
    ref: string;
    items: OrderItem[];
    subtotal: number;
    address: string;
    city: string;
    state: string;
    zip: string;
    payment: string;
    delivery: string;
  };
};

const officeBase = () => process.env.OFFICE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://carol.epicdevsolutions.com";

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const formType = String(body.formType || "").toLowerCase();
  const subject = (body.subject && body.subject.trim()) || SUBJECTS[formType] || "New Website Lead";
  const now = new Date().toISOString();
  const extraFields = Object.fromEntries(
    Object.entries(body.fields || {})
      .filter(([, v]) => v != null && String(v).trim())
      .map(([k, v]) => [k, String(v)])
  );

  // 1. Save it where Carol will see it.
  let officeLink = `${officeBase()}/office/inbox`;
  try {
    if (formType === "order" && body.order) {
      const id = newId("ord");
      const o: StudioOrder = {
        id,
        ref: body.order.ref,
        createdAt: now,
        updatedAt: now,
        name: body.name || "",
        email: body.email || "",
        phone: body.phone || "",
        address: body.order.address || "",
        city: body.order.city || "",
        state: body.order.state || "",
        zip: body.order.zip || "",
        payment: body.order.payment || "",
        delivery: body.order.delivery || "",
        message: body.message || "",
        items: body.order.items || [],
        subtotal: Number(body.order.subtotal || 0),
        status: "new",
        notes: null,
        paidAt: null,
        stripeSessionId: null,
      };
      await saveOrder(o);
      officeLink = `${officeBase()}/office/orders/${id}`;
    } else {
      const id = newId("inq");
      const kind: InquiryKind = KIND[formType] || "other";
      const i: Inquiry = {
        id,
        createdAt: now,
        kind,
        subject,
        name: body.name || null,
        email: body.email || null,
        phone: body.phone || null,
        message: body.message || (kind === "newsletter" ? "Joined the mailing list." : null),
        fields: extraFields,
        workSlug: body.workSlug || null,
        // A newsletter signup needs no reply, so it never waits on Carol.
        status: kind === "newsletter" ? "handled" : "new",
        notes: null,
        handledAt: kind === "newsletter" ? now : null,
      };
      await saveInquiry(i);
      officeLink = `${officeBase()}/office/inbox/${id}`;
    }
  } catch (err) {
    // Read-only deployment (no database yet) or a hiccup: the email below still goes out.
    console.error("[lead] could not save to the office:", err);
  }

  // 2. Email Carol.
  const known: LeadField[] = [
    ["Name", body.name],
    ["Email", body.email],
    ["Phone", body.phone],
    ["Company", body.company],
    ["Message", body.message],
  ];
  const extra: LeadField[] = Object.entries(extraFields).map(([k, v]) => [k, v] as LeadField);
  const replyTo = body.email && EMAIL_RE.test(body.email) ? { email: body.email, name: body.name } : undefined;

  let to: string[] | undefined;
  try {
    const s = await getSettings();
    to = [s.notifyEmail, s.notifyEmail2].filter((e) => e && EMAIL_RE.test(e));
  } catch {
    /* defaults inside sendLead */
  }

  const res = await sendLead({
    subject,
    fields: [...known, ...extra],
    replyTo,
    to,
    footer: `Open it in your Studio Office: ${officeLink}`,
  });
  if (res.skipped) {
    console.log("[lead:" + subject + "]", JSON.stringify([...known, ...extra]));
    return Response.json({ ok: true, skipped: true });
  }
  // The message is already saved; a failed email should not show the visitor an error.
  return Response.json({ ok: true, skipped: false, emailed: res.ok });
}
