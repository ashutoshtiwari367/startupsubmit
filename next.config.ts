import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap/index",
      },
      {
        source: "/sitemap/:id.xml",
        destination: "/api/sitemap/:id",
      },
    ];
  },
};

export default nextConfig;
