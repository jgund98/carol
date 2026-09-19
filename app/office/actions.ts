"use server";
// Everything the Studio Office can change. Each action checks the session,
// makes one change, then tells the website to redraw the pages that show it.
// Actions return { ok, error } instead of throwing so the screen can say what
// happened in plain words.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, isSignedIn, signIn, signOut } from "@/lib/studio/auth";
import {
  StudioError,
  deleteCollection,
  deleteInquiry,
  deleteOrder,
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
  saveWork,
  slugify,
  uniqueSlug,
} from "@/lib/studio/store";
import { removeStored } from "@/lib/studio/images";
import type { Kind, Work } from "@/lib/works";
import type { CollectionDef, OrderStatus, Settings } from "@/lib/studio/types";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function guard(): Promise<void> {
  if (!(await isSignedIn())) redirect("/office");
}

function explain(e: unknown): string {
  if (e instanceof StudioError) return e.message;
  console.error("[office]", e);
  return "Something went wrong on our side. Nothing was changed. Try again in a moment, and if it keeps happening, tell Jordan.";
}

/** The website shows the catalog on nearly every page; redraw them all. */
function refreshSite() {
  revalidatePath("/", "layout");
}

/* ───────── sign in / out ───────── */

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") || "");
  const remember = formData.get("remember") !== "off";
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    redirect("/office?wrong=1");
  }
  await signIn(remember);
  redirect("/office/home");
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/office");
}

/* ───────── artwork ───────── */

export type WorkInput = {
  slug?: string;
  name: string;
  price: number;
  status: "sale" | "sold" | "hold" | "hidden";
  kind: Kind;
  medium: string;
  width: number | null;
  height: number | null;
  collections: string[];
  description: string;
  story: string;
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
    const w: Work = {
      slug,
      file: existing?.file ?? slug,
      name,
      price: Math.max(0, Math.round(input.price || 0)),
      sold: input.status === "sold",
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
    await saveWork({ ...w, sold: status === "sold", hidden: status === "hidden", available: status !== "hold" });
    refreshSite();
    return { ok: true };
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

export async function deleteInquiryAction(id: string): Promise<Result> {
  await guard();
  try {
    await deleteInquiry(id);
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
    await saveOrder({ ...o, status, paidAt: status === "paid" || status === "delivered" ? o.paidAt ?? new Date().toISOString() : o.paidAt });
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

export async function deleteOrderAction(id: string): Promise<Result> {
  await guard();
  try {
    await deleteOrder(id);
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
    await saveSettings({ notifyEmail: email, notifyEmail2: input.notifyEmail2.trim(), notifyPhone: input.notifyPhone.trim() });
    revalidatePath("/office", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: explain(e) };
  }
}

