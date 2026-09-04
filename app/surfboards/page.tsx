import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import VideoPlayer from "@/components/VideoPlayer";
import WorkCard from "@/components/WorkCard";
import { inCollection } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Surfboards | Carol Calicchio × Nomad Surf Shop",
  description: "Limited-edition art surfboards by Carol Calicchio with Nomad Surf Shop, Boynton Beach. Floral designs from the Flower Power paintings, shown at The Shops at The Breakers, Palm Beach.",
  alternates: { canonical: "/surfboards" },
};

export default function SurfboardsPage() {
  const boards = inCollection("surfboards");
  return (
    <>
      <PageHero kicker="Surfboards · with Nomad Surf Shop" title="Paintings you can ride." text="Surfing is not just for the beach. Carol's limited-edition boards bring the spirit of the sport to a home, office, cabana or hotel lobby, and they are built to ride." />
      <section className="wrap pb-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal variant="scale" className="grid grid-cols-2 gap-4">
            <VideoPlayer src="breakers" sound priority className="wrap-edge aspect-[9/16]" caption="At The Breakers" />
            <div className="pt-12">
              {boards.map((b) => (
                <WorkCard key={b.slug} work={b} size="lg" priority />
              ))}
            </div>
          </Reveal>
          <Reveal className="space-y-5 text-[1.05rem] leading-[1.75] text-ink/80">
            <p className="pretty">Carol teamed up with Boynton Beach&rsquo;s Nomad Surf Shop, open since 1968, to create limited-edition boards printed from her paintings. The first designs come from Flower Power; new board designs follow her ocean paintings.</p>
            <p className="pretty">This past season the boards were featured at The Shops at The Breakers in Palm Beach, a fusion of color, culture and craftsmanship that felt right at home in the resort. Paradiso Grand, the first board, has found its owner.</p>
            <p className="pretty">Each board is one of a kind. For the next release, or a board printed from a painting you already own, get in touch.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/contact" className="btn btn-ink">Ask about the next board</Link>
              <Link href="/collections/recent-work" className="btn btn-line">The paintings behind them</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
