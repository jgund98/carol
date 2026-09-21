// Pure helpers over a catalog. Nothing here reads the database: server
// components fetch works/collections from lib/store.ts and pass them in, so
// these can run on the client too.
import type { Work } from "./works";
import type { CollectionDef } from "./studio/types";

export const bySlug = (works: Work[], slug: string): Work | undefined => works.find((w) => w.slug === slug);

export const inCollection = (works: Work[], key: string): Work[] => works.filter((w) => w.collections.includes(key));

export const available = (works: Work[]) => works.filter((w) => w.available && !w.sold);

export const collectionBySlug = (collections: CollectionDef[], slug: string) => collections.find((c) => c.slug === slug);

export const collectionsOf = (collections: CollectionDef[], w: Work) => w.collections.map((k) => collections.find((c) => c.id === k)).filter((c): c is CollectionDef => Boolean(c));

export const img = (w: Work, size: "full" | "sm" = "full") => (size === "sm" ? w.imageSm : w.image);

export const aspect = (w: Work) => w.iw / w.ih;

export const dims = (w: Pick<Work, "width" | "height">) => (w.width && w.height ? `${w.width} × ${w.height} in.` : null);

/** Physical inches for scale views; falls back to image aspect on a 48 in. tall canvas. */
export const inches = (w: Work) => {
  if (w.width && w.height) return { w: w.width, h: w.height };
  const h = 48;
  return { w: Math.round(h * aspect(w)), h };
};

/** Curated highlights for the hero easel and features (skipped automatically if a piece is removed). */
export const heroSlugs = ["celestial-moonlight", "midnight-bliss", "gardenia-goddess", "crystal", "hummingbirds", "palm-way"];

export const wallSlugs = [
  "celestial-moonlight",
  "the-provider",
  "gardenia-goddess",
  "crystal",
  "midnight-bliss",
  "morning-white",
  "hummingbirds",
  "southern-cross",
  "alluring-light",
  "circadian-splendor",
  "galaxy-of-love",
  "palm-way",
];

export const pick = (works: Work[], slugs: string[]) => slugs.map((s) => bySlug(works, s)).filter((w): w is Work => Boolean(w));

/** Pieces Carol marked "show on the home page" first, then the curated defaults to fill, never a book. */
export const featuredFor = (works: Work[], fallback: string[], n: number): Work[] => {
  const seen = new Set<string>();
  const out: Work[] = [];
  for (const w of [...works.filter((w) => w.featured && w.kind !== "book").sort((a, b) => a.position - b.position), ...pick(works, fallback), ...works.filter((w) => w.kind === "painting")]) {
    if (seen.has(w.slug)) continue;
    seen.add(w.slug);
    out.push(w);
    if (out.length === n) break;
  }
  return out;
};

/** Related pieces: same collection first, then similar price. */
export const related = (works: Work[], w: Work, n = 4) => {
  const same = works.filter((x) => x.slug !== w.slug && x.kind === w.kind && x.collections.some((c) => w.collections.includes(c)));
  const rest = works
    .filter((x) => x.slug !== w.slug && x.kind === w.kind && !same.includes(x))
    .sort((a, b) => Math.abs(a.price - w.price) - Math.abs(b.price - w.price));
  return [...same, ...rest].slice(0, n);
};

/** The shop's default order: Carol's position first, then recent, paintings, minis, boards, books. A sold piece keeps its place, marked Sold. */
export const shopOrder = (works: Work[], collections: CollectionDef[]) => {
  const first = collections.map((c) => c.id);
  const rank = (s: Work) => {
    if (s.kind === "book") return 9;
    if (s.kind === "surfboard") return 8;
    if (s.kind === "mini") return 7;
    const i = first.findIndex((k) => s.collections.includes(k));
    return i === -1 ? 5 : Math.min(i, 4);
  };
  // Pieces added in the Studio Office carry a negative position (newest lowest) and lead the shop.
  const pin = (w: Work) => (w.position < 0 ? w.position : 0);
  return [...works].sort((a, b) => pin(a) - pin(b) || rank(a) - rank(b) || a.position - b.position);
};
