import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "scontent.cdninstagram.com",
      "lh3.googleusercontent.com", // For Google profile images
      "platform-lookaside.fbsbx.com", // For Facebook profile images (if needed)
      "instagram.fbom19-2.fna.fbcdn.net", // For Instagram profile images (if needed)
    ],
  },
};

export default nextConfig;
