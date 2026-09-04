import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/webp"], minimumCacheTTL: 60 * 60 * 24 * 30 },
};

export default nextConfig;
