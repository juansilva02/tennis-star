import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_INTERNAL_URL ?? "http://localhost:4000"}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${process.env.API_INTERNAL_URL ?? "http://localhost:4000"}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
