// Every form on the site posts here. Two things happen: the message is saved
// into the Studio Office (Inquiries, or Orders for a checkout) and Carol gets
// an email about it. If the email cannot be sent the message is still saved,
// so nothing is ever lost.
import { money } from "@/lib/site";
import { alertCarol, type Field as LeadField } from "@/lib/studio/alerts";
import { stripeEnabled } from "@/lib/studio/stripe";
import { carol } from "@/lib/studio/texts";
import { sendOrderReceived } from "@/lib/studio/customer-notify";
import { newId, saveInquiry, saveOrder } from "@/lib/studio/store";
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
  let orderId: string | null = null;
  let alert: { subject: string; sms: string } | null = null;
  try {
    if (formType === "order" && body.order) {
      const id = newId("ord");
      const o: StudioOrder = {
        id,
        ref: (body.order.ref || "").trim() || `CC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
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
        carrier: null,
        tracking: null,
        shippedAt: null,
        deliveredAt: null,
        refundedAt: null,
        refundAmount: null,
        refundNote: null,
        stripeSessionId: null,
      };
      await saveOrder(o);
      orderId = id;
      officeLink = `${officeBase()}/office/orders/${id}`;
      alert = carol.newOrder(o);
      // The buyer hears back right away, email and text.
      try {
        const r = await sendOrderReceived(o);
        if (r.email || r.sms) await saveOrder({ ...o, confirmationSentAt: new Date().toISOString() });
      } catch (e) {
        console.error("[lead] order confirmation:", e);
      }
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
      const about = (extraFields.Artwork || "").replace(/\s*\(.*$/, "").trim() || null;
      alert = kind === "newsletter" ? carol.newsletter(body.email || "") : carol.inquiry(kind, id, body.name, about);
    }
  } catch (err) {
    // Read-only deployment (no database yet) or a hiccup: the email below still goes out.
    console.error("[lead] could not save to the office:", err);
  }

  // 2. Tell Carol, email and text. Newsletter signups are quiet.
  const known: LeadField[] = [
    ["Name", body.name],
    ["Email", body.email],
    ["Phone", body.phone],
    ["Company", body.company],
    ["Message", body.message],
  ];
  const extra: LeadField[] = Object.entries(extraFields).map(([k, v]) => [k, v] as LeadField);
  // If saving failed (no database yet) fall back to a plain wording so Carol still hears.
  const fallback = carol.inquiry(KIND[formType] || "other", "", body.name);
  if (formType !== "newsletter" || !process.env.BREVO_API_KEY) {
    await alertCarol({
      subject: alert?.subject || subject,
      sms: alert ? alert.sms : fallback.sms.replace(/ \S+\/q\/$/, ""),
      fields: [...known, ...extra],
      link: officeLink,
    });
  }
  if (!process.env.BREVO_API_KEY) {
    console.log("[lead:" + subject + "]", JSON.stringify([...known, ...extra]));
    return Response.json({ ok: true, skipped: true, orderId, pay: Boolean(orderId) && stripeEnabled() });
  }
  return Response.json({ ok: true, skipped: false, orderId, pay: Boolean(orderId) && stripeEnabled() });
}
