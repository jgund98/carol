// The public website's chrome: header, footer, cursor, smooth scroll, cart.
// The Studio Office at /office has its own shell and skips all of this.
import { site } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import PaintTrail from "@/components/PaintTrail";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import { getCatalog, getCollectionViews } from "@/lib/store";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ArtGallery", "LocalBusiness"],
      "@id": `${site.url}/#studio`,
      name: site.legalName,
      url: site.url,
      telephone: "+1-561-400-0678",
      email: site.email,
      image: `${site.url}/og.jpg`,
      priceRange: "$$$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.studio.street,
        addressLocality: site.studio.city,
        addressRegion: site.studio.state,
        postalCode: site.studio.zip,
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: site.studio.lat, longitude: site.studio.lng },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "17:00",
        description: "By appointment only",
      },
      areaServed: site.areaServed.map((n) => ({ "@type": "City", name: n })),
      sameAs: [site.social.instagram, site.social.facebookPage, site.social.artsy, site.social.linkedin],
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#carol`,
      name: "Carol Calicchio",
      jobTitle: "Abstract Artist",
      url: site.url,
      image: `${site.url}/photos/carol-easel-portrait.jpg`,
      alumniOf: ["New York School of Interior Design", "School of Visual Arts"],
      sameAs: [site.social.instagram, site.social.artsy, site.social.linkedin],
      worksFor: { "@id": `${site.url}/#studio` },
    },
  ],
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ works }, collections] = await Promise.all([getCatalog(), getCollectionViews()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CartProvider works={works}>
        <SmoothScroll />
        <Cursor />
        <PaintTrail />
        <Header collections={collections} />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </>
  );
}
