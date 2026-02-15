import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "192.168.1.105",
  ],
};

export default withSerwist(nextConfig);
