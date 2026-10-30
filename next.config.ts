import type { NextConfig } from "next";

// Cache Components is off on purpose: pages here read the database and the URL (searchParams)
// at request time, and the classic rendering model keeps that simple.
const nextConfig: NextConfig = {
  // Gallery photos go through a server action: up to 6 photos of 8 MB at once, plus form overhead.
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
