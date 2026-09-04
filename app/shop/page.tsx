import type { Metadata } from "next";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import ShopGrid from "@/components/ShopGrid";
import { works } from "@/lib/works";

export const metadata: Metadata = {
  title: "Shop Original Paintings | Abstract Art for Sale, Palm Beach",
  description: "Buy original abstract floral and seascape paintings by Carol Calicchio. Large-scale acrylic and oil canvases, White Series impasto, Goddess minis, surfboards and books. Ships from Delray Beach, FL.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  // Curated order: recent first, then paintings, minis, surfboards, books.
  const order = ["recent", "blue", "white"] as const;
  const rank = (s: (typeof works)[number]) => {
    if (s.kind === "book") return 9;
    if (s.kind === "surfboard") return 8;
    if (s.kind === "mini") return 7;
    const i = order.findIndex((k) => s.collections.includes(k));
    return i === -1 ? 5 : i;
  };
  const sorted = [...works].sort((a, b) => rank(a) - rank(b) || (a.sold === b.sold ? 0 : a.sold ? 1 : -1));
  return (
    <>
      <PageHero art={["hummingbirds", "crystal"]} kicker="The shop" title="Originals, one of each." text="Every painting here is the only one. Add it to your selection to check out, or send an inquiry and Carol will call you back about the piece, the room and delivery." />
      <section className="wrap pb-24">
        <Suspense>
          <ShopGrid works={sorted} />
        </Suspense>
      </section>
    </>
  );
}
