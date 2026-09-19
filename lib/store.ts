// What the WEBSITE reads: the live catalog minus hidden pieces, with the
// collections in Carol's order. Server components call these; client
// components receive the results as props. Cached per request (React cache)
// so the layout, header and page share one read.
import { cache } from "react";
import type { Work } from "@/lib/works";
import type { CollectionDef, Catalog } from "@/lib/studio/types";
import { listAllWorks, listCollections } from "@/lib/studio/store";

export type { CollectionDef, Catalog };

export const getCatalog = cache(async (): Promise<Catalog> => {
  const [all, collections] = await Promise.all([listAllWorks(), listCollections()]);
  return { works: all.filter((w) => !w.hidden), collections };
});

export const getWorks = async (): Promise<Work[]> => (await getCatalog()).works;
export const getCollections = async (): Promise<CollectionDef[]> => (await getCatalog()).collections;

export async function getWork(slug: string): Promise<Work | undefined> {
  return (await getWorks()).find((w) => w.slug === slug);
}

/** A collection plus what the header/footer/collection pages need to draw it. */
export type CollectionView = CollectionDef & { heroWork: Work | null; count: number };

export const getCollectionViews = cache(async (): Promise<CollectionView[]> => {
  const { works, collections } = await getCatalog();
  return collections.map((c) => {
    const inIt = works.filter((w) => w.collections.includes(c.id));
    const heroWork = (c.hero && works.find((w) => w.slug === c.hero)) || inIt[0] || null;
    return { ...c, heroWork, count: inIt.length };
  });
});
