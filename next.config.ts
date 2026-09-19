import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Artwork photos uploaded from the Studio Office live in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  serverExternalPackages: ["sharp", "postgres"],
};

export default nextConfig;
