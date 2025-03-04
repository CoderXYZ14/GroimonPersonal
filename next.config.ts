import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  output: "standalone", // Optional: Useful if using serverless functions
  eslint: {
    ignoreDuringBuilds: true,
  },
};
