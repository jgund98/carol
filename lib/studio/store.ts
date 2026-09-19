// Typed access to the studio's data. Server-only. Public pages read the
// catalog through lib/store.ts (which filters hidden pieces and caches per
// request); the Studio Office and the lead endpoint use this module directly.
import { cache } from "react";
import { works as seedWorks, type Work } from "@/lib/works";
import { collections as seedCollections } from "@/lib/content";
import { pickStore, readonlyStore, StudioError, type DocStore, type StoreMode } from "./docstore";
import type { CollectionDef, Inquiry, Settings, StudioOrder } from "./types";

export { StudioError };

const SEED_COLLECTIONS: CollectionDef[] = seedCollections.map((c, i) => ({
  id: c.key,
  slug: c.slug,
  name: c.name,
  kicker: c.kicker,
  blurb: c.blurb,
  hero: c.hero,
  position: i * 10,
}));

const DEFAULT_SETTINGS: Settings = {
  notifyEmail: process.env.LEAD_TO_EMAIL || "Carol@carolcalicchioart.com",
  notifyEmail2: "",
  notifyPhone: "",
};

function seedShape() {
  return {
    work: Object.fromEntries(seedWorks.map((w) => [w.slug, w])),
    collection: Object.fromEntries(SEED_COLLECTIONS.map((c) => [c.id, c])),
    inquiry: {},
    order: {},
    setting: { seeded: { value: "1" }, settings: DEFAULT_SETTINGS },
  };
}

let storeP: Promise<DocStore> | null = null;
/** The store, seeded on first use so the office never opens empty. */
export function store(): Promise<DocStore> {
  if (storeP) return storeP;
  storeP = (async () => {
    const s = pickStore(seedShape);
    if (s.mode === "readonly") return s;
    try {
      const flag = await s.get<{ value: string }>("setting", "seeded");
      if (!flag) {
        if ((await s.count("work")) === 0) for (const w of seedWorks) await s.put("work", w.slug, w);
        if ((await s.count("collection")) === 0) for (const c of SEED_COLLECTIONS) await s.put("collection", c.id, c);
        await s.put("setting", "seeded", { value: "1" });
      }
    } catch (e) {
      // A cold database that cannot be reached should not take the website
      // down: fall back to the seed for this process and try again next time.
      console.error("[studio] store init failed, using seed:", e);
      storeP = null;
      return readonlyStore(seedShape);
    }
    return s;
  })();
  return storeP;
}

export async function storeMode(): Promise<StoreMode> {
  return (await store()).mode;
}

/* ───────── works ───────── */

export const listAllWorks = cache(async (): Promise<Work[]> => {
  const rows = await (await store()).list<Work>("work");
  return rows.map(normalizeWork).sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
});

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const w = await (await store()).get<Work>("work", slug);
  return w ? normalizeWork(w) : null;
}

export async function saveWork(w: Work): Promise<void> {
  await (await store()).put("work", w.slug, normalizeWork({ ...w, updatedAt: new Date().toISOString() }));
}

export async function deleteWork(slug: string): Promise<void> {
  await (await store()).del("work", slug);
}

/** Old rows may predate a field; fill every gap so the rest of the code can trust the shape. */
function normalizeWork(w: Partial<Work> & { slug: string }): Work {
  return {
    slug: w.slug,
    file: w.file ?? w.slug,
    name: w.name ?? "Untitled",
    price: Number(w.price ?? 0),
    sold: Boolean(w.sold),
    available: w.available ?? true,
    hidden: Boolean(w.hidden),
    medium: w.medium ?? null,
    width: w.width ?? null,
    height: w.height ?? null,
    iw: w.iw ?? 4,
    ih: w.ih ?? 5,
    color: w.color ?? "#a5a29d",
    collections: w.collections ?? [],
    description: w.description ?? "",
    story: w.story ?? null,
    kind: w.kind ?? "painting",
    image: w.image ?? `/art/${w.file ?? w.slug}.jpg`,
    imageSm: w.imageSm ?? `/art-sm/${w.file ?? w.slug}.jpg`,
    position: w.position ?? 0,
    createdAt: w.createdAt ?? new Date().toISOString(),
    updatedAt: w.updatedAt ?? new Date().toISOString(),
  };
}

/* ───────── collections ───────── */

export const listCollections = cache(async (): Promise<CollectionDef[]> => {
  const rows = await (await store()).list<CollectionDef>("collection");
  return rows.sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
});

export async function getCollection(id: string): Promise<CollectionDef | null> {
  return (await store()).get<CollectionDef>("collection", id);
}

export async function saveCollection(c: CollectionDef): Promise<void> {
  await (await store()).put("collection", c.id, c);
}

export async function deleteCollection(id: string): Promise<void> {
  const s = await store();
  await s.del("collection", id);
  // pieces keep existing, they simply lose this tag
  for (const w of await s.list<Work>("work")) {
    if (w.collections?.includes(id)) await s.put("work", w.slug, { ...w, collections: w.collections.filter((k) => k !== id) });
  }
}

/* ───────── inquiries ───────── */

export const listInquiries = cache(async (): Promise<Inquiry[]> => {
  const rows = await (await store()).list<Inquiry>("inquiry");
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});

export async function getInquiry(id: string): Promise<Inquiry | null> {
  return (await store()).get<Inquiry>("inquiry", id);
}

export async function saveInquiry(i: Inquiry): Promise<void> {
  await (await store()).put("inquiry", i.id, i);
}

export async function deleteInquiry(id: string): Promise<void> {
  await (await store()).del("inquiry", id);
}

/* ───────── orders ───────── */

export const listOrders = cache(async (): Promise<StudioOrder[]> => {
  const rows = await (await store()).list<StudioOrder>("order");
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});

export async function getOrder(id: string): Promise<StudioOrder | null> {
  return (await store()).get<StudioOrder>("order", id);
}

export async function saveOrder(o: StudioOrder): Promise<void> {
  await (await store()).put("order", o.id, { ...o, updatedAt: new Date().toISOString() });
}

export async function deleteOrder(id: string): Promise<void> {
  await (await store()).del("order", id);
}

/* ───────── settings ───────── */

export const getSettings = cache(async (): Promise<Settings> => {
  const s = await (await store()).get<Partial<Settings>>("setting", "settings");
  return { ...DEFAULT_SETTINGS, ...(s ?? {}) };
});

export async function saveSettings(s: Settings): Promise<void> {
  await (await store()).put("setting", "settings", s);
}

/* ───────── helpers ───────── */

export function newId(prefix = ""): string {
  const s = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  return prefix ? `${prefix}_${s}` : s;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "piece";
}

/** A slug nobody else has: "aphrodite", then "aphrodite-2", "aphrodite-3"… */
export async function uniqueSlug(base: string, taken: Set<string>): Promise<string> {
  let slug = slugify(base);
  let n = 2;
  while (taken.has(slug)) slug = `${slugify(base)}-${n++}`;
  return slug;
}
