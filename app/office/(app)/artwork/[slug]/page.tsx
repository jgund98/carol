import { notFound } from "next/navigation";
import { getWorkBySlug, listAllWorks, listCollections } from "@/lib/studio/store";
import { PageHead } from "@/components/office/ui";
import ArtworkEditor from "@/components/office/ArtworkEditor";
import { mediumsFrom } from "@/lib/studio/mediums";

export default async function EditArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [work, works, collections] = await Promise.all([getWorkBySlug(slug), listAllWorks(), listCollections()]);
  if (!work) notFound();
  return (
    <>
      <PageHead
        back={{ href: "/office/artwork", label: "All artwork" }}
        kicker={work.hidden ? "Hidden from the website" : "On the website"}
        title={work.name}
        action={
          !work.hidden ? (
            <a href={`/shop/${work.slug}`} target="_blank" rel="noopener" className="btn btn-line btn-sm">
              See it on the website
            </a>
          ) : undefined
        }
      />
      <ArtworkEditor work={work} collections={collections} mediums={mediumsFrom(works)} />
    </>
  );
}
