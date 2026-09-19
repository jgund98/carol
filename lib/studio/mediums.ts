import type { Work } from "@/lib/works";

export const DEFAULT_MEDIUMS = ["Acrylic on Canvas", "Acrylic on Canvas & Mixed Media", "Oil on Canvas", "Oil on Belgian Linen", "Acrylic & Mixed Media on Canvas", "Acrylic with Healing Stones on Glass"];

/** Carol's usual mediums plus anything already used in the shop, so the dropdown always fits her work. */
export function mediumsFrom(works: Work[]): string[] {
  const seen = new Set<string>(DEFAULT_MEDIUMS);
  for (const w of works) if (w.medium && w.kind !== "surfboard") seen.add(w.medium);
  return [...seen];
}
