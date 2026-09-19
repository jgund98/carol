import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

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
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${manrope.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
