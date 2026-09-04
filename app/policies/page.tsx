import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Store Policy",
  description: "Shipping, returns and payment methods for original artwork purchased from Carol Calicchio Art Studio.",
  alternates: { canonical: "/policies" },
};

export default function PoliciesPage() {
  return (
    <>
      <PageHero kicker="Store policy" title="The fine print, briefly." />
      <section className="wrap pb-24">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="display text-2xl">Shipping</h2>
            <p className="pretty mt-3 text-[0.98rem] leading-relaxed text-ink/75">Every original is packed and shipped, delivered, or installed individually. Costs are quoted per piece and destination after your order request. Local delivery and installation across Palm Beach County are available.</p>
          </div>
          <div>
            <h2 className="display text-2xl">Returns</h2>
            <p className="pretty mt-3 text-[0.98rem] leading-relaxed text-ink/75">Original artwork is sold as final sale once delivered and accepted. If a piece arrives damaged, contact the studio within 48 hours with photographs and it will be made right.</p>
          </div>
          <div>
            <h2 className="display text-2xl">Payment</h2>
            <p className="pretty mt-3 text-[0.98rem] leading-relaxed text-ink/75">Credit and debit cards, PayPal, and offline payments (wire or check) arranged directly with the studio. No payment is taken on this website; Carol confirms every order personally.</p>
          </div>
        </div>
        <p className="mt-12 text-sm text-muted">
          Questions: <a href={site.phoneHref} className="font-semibold text-ink">{site.phone}</a> · <a href={`mailto:${site.email}`} className="font-semibold text-ink">{site.email}</a>
        </p>
      </section>
    </>
  );
}
