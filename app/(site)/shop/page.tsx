import type { Metadata } from "next";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import ShopGrid from "@/components/ShopGrid";
import { getCatalog } from "@/lib/store";
import { shopOrder } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Original Paintings | Abstract Art for Sale, Palm Beach",
  description: "Buy original abstract floral and seascape paintings by Carol Calicchio. Large-scale acrylic and oil canvases, White Series impasto, Goddess minis, surfboards and books. Ships from Delray Beach, FL.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const { works, collections } = await getCatalog();
  const sorted = shopOrder(works, collections);
  return (
    <>
      <PageHero art={["hummingbirds", "crystal"]} kicker="The shop" title="Originals, one of each." text="Every painting here is the only one. Add it to your selection to check out, or send an inquiry and Carol will call you back about the piece, the room and delivery." />
      <section className="wrap pb-24">
        <Suspense>
          <ShopGrid works={sorted} collections={collections} />
        </Suspense>
      </section>
    </>
  );
}
