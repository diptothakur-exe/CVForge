import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth", "@sparticuz/chromium", "puppeteer-core"],
  },
};

export default nextConfig;
