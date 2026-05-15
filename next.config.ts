import type { NextConfig } from "next";
import { securityHeadersForNext } from "./lib/security-headers";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return securityHeadersForNext();
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
