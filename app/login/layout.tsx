import type { Metadata, Viewport } from "next";
import "../office/office.css";

export const metadata: Metadata = {
  title: { absolute: "Sign in · Studio Office" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f6f2ea", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
