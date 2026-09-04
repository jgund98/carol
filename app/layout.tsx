import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Carol Calicchio | Abstract Artist, Palm Beach & Delray Beach, FL",
    template: "%s | Carol Calicchio",
  },
  description:
    "Original abstract floral and seascape paintings by Palm Beach artist Carol Calicchio. Flower Power, Blue Series and White Series originals, commissions, books and surfboards. Studio in Delray Beach by appointment.",
  openGraph: {
    type: "website",
    siteName: "Carol Calicchio Art",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Celestial Moonlight by Carol Calicchio" }],
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.png", apple: "/icon.png" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  width: "device-width",
  initialScale: 1,
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${manrope.variable}`}>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <CartProvider>
          <SmoothScroll />
          <Cursor />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
