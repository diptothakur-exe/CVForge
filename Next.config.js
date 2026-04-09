/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth", "puppeteer"],
  },
};
 
module.exports = nextConfig;
 