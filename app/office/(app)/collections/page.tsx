import { listAllWorks, listCollections } from "@/lib/studio/store";
import { PageHead } from "@/components/office/ui";
import CollectionsManager from "@/components/office/CollectionsManager";

export default async function CollectionsPage() {
  const [works, collections] = await Promise.all([listAllWorks(), listCollections()]);
  const slim = works.map((w) => ({ slug: w.slug, name: w.name, imageSm: w.imageSm, iw: w.iw, ih: w.ih, kind: w.kind, collections: w.collections, hidden: w.hidden }));
  return (
    <>
      <PageHead kicker="Collections" title="Your series." text="Collections are the doors into your work: Flower Power, Blue Series, White Series. They appear in the website's menu, on the Collections page and as filters in the shop, in this order. Add one, rename one, or move one up." />
      <CollectionsManager collections={collections} works={slim} />
    </>
  );
}
