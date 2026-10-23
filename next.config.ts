import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `npm run export` builds a plain static site (./out) that any static host can serve.
  ...(process.env.STATIC_EXPORT ? { output: "export" as const, trailingSlash: true } : {}),
};

export default nextConfig;
