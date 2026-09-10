import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Trip photos and videos go through server actions.
      bodySizeLimit: "256mb",
    },
  },
};

export default nextConfig;
