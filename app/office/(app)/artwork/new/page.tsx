import { listAllWorks, listCollections } from "@/lib/studio/store";
import { PageHead } from "@/components/office/ui";
import ArtworkEditor from "@/components/office/ArtworkEditor";
import { mediumsFrom } from "@/lib/studio/mediums";

export default async function NewArtworkPage() {
  const [works, collections] = await Promise.all([listAllWorks(), listCollections()]);
  return (
    <>
      <PageHead back={{ href: "/office/artwork", label: "All artwork" }} kicker="New piece" title="Add a piece to the shop." />
      <ArtworkEditor collections={collections} mediums={mediumsFrom(works)} />
    </>
  );
}
