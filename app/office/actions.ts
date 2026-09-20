"use server";
// Everything the Studio Office can change. Each action checks the session,
// makes one change, then tells the website to redraw the pages that show it.
// Actions return { ok, error } instead of throwing so the screen can say what
// happened in plain words.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkCredentials, isSignedIn, signIn, signOut } from "@/lib/studio/auth";
import {
  StudioError,
  deleteCollection,
  deleteWork,
  getCollection,
  getInquiry,
  getOrder,
  getWorkBySlug,
  listAllWorks,
  listCollections,
  saveCollection,
  saveInquiry,
  saveOrder,
  saveSettings,
  getSettings,
  saveWork,
  slugify,
  uniqueSlug,
} from "@/lib/studio/store";
import { removeStored } from "@/lib/studio/images";
import { emailInvoice, getInvoice, newInvoice, nextNumber, saveInvoice, textInvoice } from "@/lib/studio/invoices";
import type { InvoiceItem } from "@/lib/studio/invoice-shared";
import { sendOrderShipped, sendPaymentReceipt } from "@/lib/studio/customer-notify";
import { isStripeSession, refundSession, stripeEnabled } from "@/lib/studio/stripe";
import { money } from "@/lib/site";
import type { Kind, Work } from "@/lib/works";
import type { CollectionDef, OrderStatus, Settings } from "@/lib/studio/types";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function guard(): Promise<void> {
  if (!(await isSignedIn())) redirect("/login");
}

function explain(e: unknown): string {
  if (e instanceof StudioError) return e.message;
  console.error("[office]", e);
  return "Something went wrong on our side. Nothing was changed. Please try again in a moment.";
}

/** The website shows the catalog on nearly every page; redraw them all. */
function refreshSite() {
  revalidatePath("/", "layout");
}

/* ───────── sign in / out ───────── */

export async function loginAction(formData: FormData): Promise<void> {
  const user = String(formData.get("user") || "");
  const password = String(formData.get("password") || "");
  const remember = formData.get("remember") !== "off";
  const next = String(formData.get("next") || "");
  if (!checkCredentials(user, password)) {
    await new Promise((r) => setTimeout(r, 600));
    redirect(`/login?wrong=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }
  await signIn(remember);
  redirect(/^\/office\/[\w\-/]*$/.test(next) ? next : "/office/home");
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/login");
}

/* ───────── artwork ───────── */

export type WorkInput = {
  slug?: string;
  name: string;
  price: number;
  status: "sale" | "sold" | "hold" | "hidden";
  /** null = one of a kind */
  stock: number | null;
  kind: Kind;
  medium: string;
  width: number | null;
  height: number | null;
  collections: string[];
  description: string;
  story: string;
  featured: boolean;
  photo: { image: string; imageSm: string; iw: number; ih: number; color: string } | null;
};

export async function saveWorkAction(input: WorkInput): Promise<Result<{ slug: string; created: boolean }>> {
  await guard();
  try {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "Give the piece a title first." };
    const existing = input.slug ? await getWorkBySlug(input.slug) : null;
    if (!existing && !input.photo) return { ok: false, error: "Add a photo of the piece before saving." };

    let slug = existing?.slug;
    if (!slug) {
      const taken = new Set((await listAllWorks()).map((w) => w.slug));
      slug = await uniqueSlug(name, taken);
    }
    const all = existing ? null : await listAllWorks();
    const topPosition = all ? Math.min(0, ...all.map((w) => w.position)) - 10 : 0;
    const photo = input.photo ?? { image: existing!.image, imageSm: existing!.imageSm, iw: existing!.iw, ih: existing!.ih, color: existing!.color };
    if (existing && input.photo && input.photo.image !== existing.image) {
      await removeStored(existing.image);
      await removeStored(existing.imageSm);
    }
    const now = new Date().toISOString();
    // A count of 0 means sold out; "Sold" as a status zeroes a count.
    const stock = input.stock == null ? null : input.status === "sold" ? 0 : Math.max(0, Math.floor(input.stock));
    const w: Work = {
      slug,
      file: existing?.file ?? slug,
      name,
      price: Math.max(0, Math.round(input.price || 0)),
      stock,
      sold: input.status === "sold" || stock === 0,
      available: input.status === "sale" || input.status === "sold" || input.status === "hidden",
      hidden: input.status === "hidden",
      medium: input.medium.trim() || null,
      width: input.width || null,
      height: input.height || null,
      iw: photo.iw,
      ih: photo.ih,
      color: photo.color,
      collections: input.collections,
      description: input.description.trim(),
      story: input.story.trim() || null,
      kind: input.kind,
      featured: input.featured,
      image: photo.image,
      imageSm: photo.imageSm,
      position: existing?.position ?? topPosition,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await saveWork(w);
    refreshSite();
    return { ok: true, slug, created: !existing };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function setWorkStatusAction(slug: string, status: WorkInput["status"]): Promise<Result> {
  await guard();
  try {
    const w = await getWorkBySlug(slug);
    if (!w) return { ok: false, error: "That piece is no longer in the shop." };
    await saveWork({ ...w, sold: status === "sold", hidden: status === "hidden", available: status !== "hold", stock: w.stock == null ? null : status === "sold" ? 0 : Math.max(1, w.stock) });
    refreshSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/** Several pieces at once, from the Artwork list: hide, mark sold, or put back for sale. */
export async function bulkWorkStatusAction(slugs: string[], status: "sale" | "sold" | "hidden"): Promise<Result<{ count: number }>> {
  await guard();
  try {
    let count = 0;
    for (const slug of slugs.slice(0, 200)) {
      const w = await getWorkBySlug(slug);
      if (!w) continue;
      await saveWork({ ...w, sold: status === "sold", hidden: status === "hidden", available: true, stock: w.stock == null ? null : status === "sold" ? 0 : Math.max(1, w.stock), updatedAt: new Date().toISOString() });
      count++;
    }
    refreshSite();
    return { ok: true, count };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function moveWorkTopAction(slug: string): Promise<Result> {
  await guard();
  try {
    const all = await listAllWorks();
    const w = all.find((x) => x.slug === slug);
    if (!w) return { ok: false, error: "That piece is no longer in the shop." };
    await saveWork({ ...w, position: Math.min(0, ...all.map((x) => x.position)) - 10 });
    refreshSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function deleteWorkAction(slug: string): Promise<Result> {
  await guard();
  try {
    const w = await getWorkBySlug(slug);
    if (w) {
      await deleteWork(slug);
      await removeStored(w.image);
      await removeStored(w.imageSm);
    }
    refreshSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/* ───────── collections ───────── */

export type CollectionInput = { id?: string; name: string; kicker: string; blurb: string; hero: string | null };

export async function saveCollectionAction(input: CollectionInput): Promise<Result<{ id: string }>> {
  await guard();
  try {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "Give the collection a name first." };
    const all = await listCollections();
    const existing = input.id ? all.find((c) => c.id === input.id) : undefined;
    let id = existing?.id;
    let slug = existing?.slug;
    if (!id) {
      const taken = new Set([...all.map((c) => c.id), ...all.map((c) => c.slug)]);
      id = await uniqueSlug(name, taken);
      slug = id;
    }
    const c: CollectionDef = {
      id,
      slug: slug ?? slugify(name),
      name,
      kicker: input.kicker.trim(),
      blurb: input.blurb.trim(),
      hero: input.hero || null,
      position: existing?.position ?? (all.length ? Math.max(...all.map((x) => x.position)) + 10 : 0),
    };
    await saveCollection(c);
    refreshSite();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function moveCollectionAction(id: string, dir: "up" | "down"): Promise<Result> {
  await guard();
  try {
    const all = await listCollections();
    const i = all.findIndex((c) => c.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= all.length) return { ok: true };
    // renumber cleanly so positions never collide
    const order = [...all];
    [order[i], order[j]] = [order[j], order[i]];
    for (let k = 0; k < order.length; k++) if (order[k].position !== k * 10) await saveCollection({ ...order[k], position: k * 10 });
    refreshSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function deleteCollectionAction(id: string): Promise<Result> {
  await guard();
  try {
    if (await getCollection(id)) await deleteCollection(id);
    refreshSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/* ───────── inquiries ───────── */

export async function setInquiryStatusAction(id: string, status: "new" | "handled"): Promise<Result> {
  await guard();
  try {
    const i = await getInquiry(id);
    if (!i) return { ok: false, error: "That message is gone." };
    await saveInquiry({ ...i, status, handledAt: status === "handled" ? new Date().toISOString() : null });
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function saveInquiryNotesAction(id: string, notes: string): Promise<Result> {
  await guard();
  try {
    const i = await getInquiry(id);
    if (!i) return { ok: false, error: "That message is gone." };
    await saveInquiry({ ...i, notes: notes.trim() || null });
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/* ───────── orders ───────── */

export async function setOrderStatusAction(id: string, status: OrderStatus): Promise<Result> {
  await guard();
  try {
    const o = await getOrder(id);
    if (!o) return { ok: false, error: "That order is gone." };
    const now = new Date().toISOString();
    const paidLike = status === "paid" || status === "shipped" || status === "delivered";
    await saveOrder({
      ...o,
      status,
      paidAt: paidLike ? o.paidAt ?? now : o.paidAt,
      shippedAt: status === "shipped" ? o.shippedAt ?? now : status === "delivered" ? o.shippedAt : o.shippedAt,
      deliveredAt: status === "delivered" ? o.deliveredAt ?? now : null,
    });
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function saveOrderNotesAction(id: string, notes: string): Promise<Result> {
  await guard();
  try {
    const o = await getOrder(id);
    if (!o) return { ok: false, error: "That order is gone." };
    await saveOrder({ ...o, notes: notes.trim() || null });
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function saveShippingAction(id: string, carrier: string, tracking: string): Promise<Result<{ told?: boolean }>> {
  await guard();
  try {
    const o = await getOrder(id);
    if (!o) return { ok: false, error: "That order is gone." };
    const now = new Date().toISOString();
    const hasShip = Boolean(carrier.trim() || tracking.trim());
    let next: typeof o = {
      ...o,
      carrier: carrier.trim() || null,
      tracking: tracking.trim() || null,
      // adding shipping details moves a paid order along to Shipped automatically
      status: hasShip && (o.status === "paid" || o.status === "contacted" || o.status === "new") ? "shipped" : o.status,
      shippedAt: hasShip ? o.shippedAt ?? now : o.shippedAt,
    };
    // The buyer is told only when there is a tracking number, and only once per number.
    let told = false;
    if (next.tracking && next.tracking !== o.shippedNoticeFor) {
      const r = await sendOrderShipped(next);
      told = r.email || r.sms;
      if (told) next = { ...next, shippedNoticeFor: next.tracking };
    }
    await saveOrder(next);
    revalidatePath("/office", "layout");
    return told ? { ok: true, told: true } : { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/** Record a refund on the order. */
export async function recordRefundAction(id: string, amount: number, note: string): Promise<Result> {
  await guard();
  try {
    const o = await getOrder(id);
    if (!o) return { ok: false, error: "That order is gone." };
    const amt = Math.max(0, Math.round(amount || 0));
    if (!amt) return { ok: false, error: "Enter the amount to refund." };
    if (amt > o.subtotal) return { ok: false, error: `The order total was ${money(o.subtotal)}; you cannot refund more than that.` };
    let refundId: string | null = null;
    if (isStripeSession(o.stripeSessionId) && stripeEnabled()) {
      // Paid by card: the money goes back to the card through Stripe. If Stripe says no, nothing is recorded.
      try {
        refundId = (await refundSession(o.stripeSessionId!, amt * 100, note)).id;
      } catch (e) {
        console.error("[refund]", e);
        return { ok: false, error: "Stripe could not process this refund. Nothing was changed. " + ((e as Error).message || "") };
      }
    }
    await saveOrder({ ...o, status: "refunded", refundedAt: new Date().toISOString(), refundAmount: amt, refundNote: note.trim() || null, refundId });
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/** One piece in an order: mark it sold on the website, or take it off the website. */
export async function setOrderPieceAction(orderId: string, slug: string, what: "sold" | "hide" | "restore"): Promise<Result> {
  await guard();
  try {
    const w = await getWorkBySlug(slug);
    if (!w) return { ok: false, error: "That piece is no longer in the shop." };
    if (what === "sold") await saveWork({ ...w, sold: true, hidden: false, stock: w.stock == null ? null : 0 });
    else if (what === "hide") await saveWork({ ...w, hidden: true });
    else await saveWork({ ...w, sold: false, hidden: false, available: true, stock: w.stock == null ? null : Math.max(1, w.stock) });
    refreshSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/** Flip every original in the order to Sold on the website. */
export async function markOrderSoldAction(id: string): Promise<Result<{ count: number }>> {
  await guard();
  try {
    const o = await getOrder(id);
    if (!o) return { ok: false, error: "That order is gone." };
    let count = 0;
    for (const it of o.items) {
      const w = await getWorkBySlug(it.slug);
      if (w && w.kind !== "book" && !w.sold) {
        await saveWork({ ...w, sold: true });
        count++;
      }
    }
    refreshSite();
    return { ok: true, count };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/* ───────── invoices ───────── */

export type InvoiceInput = { name: string; email: string; phone: string; dueDate: string | null; note: string; orderId: string | null; items: InvoiceItem[] };

export async function createInvoiceAction(input: InvoiceInput): Promise<Result<{ id: string; sent: string[] }>> {
  await guard();
  try {
    if (!input.name.trim()) return { ok: false, error: "Who is this invoice for?" };
    if (!input.email.trim() && !input.phone.trim()) return { ok: false, error: "Add an email or a mobile number so it can be sent." };
    if (!input.items.length) return { ok: false, error: "Add at least one line with an amount." };
    let inv = newInvoice({ number: await nextNumber(), name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), dueDate: input.dueDate, note: input.note.trim(), orderId: input.orderId, items: input.items });
    await saveInvoice(inv);
    // Send it straight away, email and text, the way Epic's portal does.
    const now = new Date().toISOString();
    const sent: string[] = [];
    if (inv.email && (await emailInvoice(inv, (await getSettings()).payInstructions))) {
      inv = { ...inv, status: "sent", sentAt: now, emailedAt: now };
      sent.push("emailed");
    }
    if (inv.phone && (await textInvoice(inv))) {
      inv = { ...inv, status: "sent", sentAt: now, textedAt: now };
      sent.push("texted");
    }
    if (sent.length) await saveInvoice(inv);
    revalidatePath("/office", "layout");
    return { ok: true, id: inv.id, sent };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function sendInvoiceAction(id: string, via: "email" | "text"): Promise<Result> {
  await guard();
  try {
    const inv = await getInvoice(id);
    if (!inv) return { ok: false, error: "That invoice is gone." };
    if (inv.status === "paid" || inv.status === "void") return { ok: false, error: "This invoice is closed." };
    const now = new Date().toISOString();
    const recent = (iso: string | null) => Boolean(iso) && Date.now() - new Date(iso as string).getTime() < 60_000;
    if (via === "email") {
      if (!inv.email) return { ok: false, error: "There is no email address on this invoice." };
      if (recent(inv.emailedAt)) return { ok: false, error: "That was emailed less than a minute ago. Give it a moment." };
      const ok = await emailInvoice(inv, (await getSettings()).payInstructions);
      if (!ok) return { ok: false, error: "The email could not be sent right now. Copy the link and send it yourself, or try again in a minute." };
      await saveInvoice({ ...inv, status: "sent", sentAt: inv.sentAt ?? now, emailedAt: now });
    } else {
      if (!inv.phone) return { ok: false, error: "There is no mobile number on this invoice." };
      if (recent(inv.textedAt)) return { ok: false, error: "That was texted less than a minute ago. Give it a moment." };
      const ok = await textInvoice(inv);
      if (!ok) return { ok: false, error: "The text could not be sent right now. Copy the link and send it yourself, or try again in a minute." };
      await saveInvoice({ ...inv, status: "sent", sentAt: inv.sentAt ?? now, textedAt: now });
    }
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

export async function markInvoiceAction(id: string, status: "paid" | "void" | "sent" | "draft"): Promise<Result> {
  await guard();
  try {
    const inv = await getInvoice(id);
    if (!inv) return { ok: false, error: "That invoice is gone." };
    let next = { ...inv, status, paidAt: status === "paid" ? inv.paidAt ?? new Date().toISOString() : null };
    if (status === "paid" && !inv.receiptSentAt) {
      const r = await sendPaymentReceipt(next);
      if (r.email || r.sms) next = { ...next, receiptSentAt: new Date().toISOString() };
    }
    await saveInvoice(next);
    // a paid invoice tied to an order marks the order paid too
    if (status === "paid" && inv.orderId) {
      const o = await getOrder(inv.orderId);
      if (o && (o.status === "new" || o.status === "contacted")) await saveOrder({ ...o, status: "paid", paidAt: new Date().toISOString() });
    }
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/** Refund a card-paid invoice in full through Stripe. */
export async function refundInvoiceAction(id: string): Promise<Result> {
  await guard();
  try {
    const inv = await getInvoice(id);
    if (!inv) return { ok: false, error: "That invoice is gone." };
    if (inv.status !== "paid") return { ok: false, error: "Only a paid invoice can be refunded." };
    if (!isStripeSession(inv.stripeSessionId) || !stripeEnabled()) return { ok: false, error: "This invoice was not paid by card here, so there is nothing to send back through Stripe. Mark it Void if the sale fell through." };
    let refundId: string;
    try {
      refundId = (await refundSession(inv.stripeSessionId!, inv.totalCents, `Invoice ${inv.number}`)).id;
    } catch (e) {
      console.error("[refund invoice]", e);
      return { ok: false, error: "Stripe could not process this refund. Nothing was changed. " + ((e as Error).message || "") };
    }
    const now = new Date().toISOString();
    await saveInvoice({ ...inv, status: "refunded", refundedAt: now, refundId });
    if (inv.orderId) {
      const o = await getOrder(inv.orderId);
      if (o && o.status === "paid") await saveOrder({ ...o, status: "refunded", refundedAt: now, refundAmount: Math.round(inv.totalCents / 100), refundNote: `Invoice ${inv.number} refunded`, refundId });
    }
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

/* ───────── settings ───────── */

export async function saveSettingsAction(input: Settings): Promise<Result> {
  await guard();
  try {
    const email = input.notifyEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "That first email address does not look right." };
    await saveSettings({ ...input, notifyEmail: email, notifyEmail2: "", notifyPhone: input.notifyPhone.trim(), notifyPhone2: "", textAlerts: true, payInstructions: input.payInstructions.trim() });
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

