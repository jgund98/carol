import type { Metadata, Viewport } from "next";
import "./office.css";

export const metadata: Metadata = {
  title: { absolute: "Studio Office · Carol Calicchio" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f2ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function OfficeRoot({ children }: { children: React.ReactNode }) {
  return <div className="office">{children}</div>;
}
