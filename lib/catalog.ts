import { works, type Work, type Collection } from "./works";
import { collections } from "./content";

export const bySlug = (slug: string): Work | undefined => works.find((w) => w.slug === slug);

export const inCollection = (key: Collection): Work[] => works.filter((w) => w.collections.includes(key));

export const paintings = works.filter((w) => w.kind === "painting" || w.kind === "mini");

export const available = works.filter((w) => w.available && !w.sold);

export const collectionBySlug = (slug: string) => collections.find((c) => c.slug === slug);

export const collectionsOf = (w: Work) => w.collections.map((k) => collections.find((c) => c.key === k)!).filter(Boolean);

export const img = (w: Work, size: "full" | "sm" = "full") => `/${size === "sm" ? "art-sm" : "art"}/${w.file}.jpg`;

export const aspect = (w: Work) => w.iw / w.ih;

export const dims = (w: Work) => (w.width && w.height ? `${w.width} × ${w.height} in.` : null);

/** Physical inches for scale views; falls back to image aspect on a 48 in. tall canvas. */
export const inches = (w: Work) => {
  if (w.width && w.height) return { w: w.width, h: w.height };
  const h = 48;
  return { w: Math.round(h * aspect(w)), h };
};

/** Curated highlights for the hero easel and features. */
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

/** Related pieces: same collection first, then similar price. */
export const related = (w: Work, n = 4) => {
  const same = works.filter((x) => x.slug !== w.slug && x.kind === w.kind && x.collections.some((c) => w.collections.includes(c)));
  const rest = works.filter((x) => x.slug !== w.slug && x.kind === w.kind && !same.includes(x)).sort((a, b) => Math.abs(a.price - w.price) - Math.abs(b.price - w.price));
  return [...same, ...rest].slice(0, n);
};
