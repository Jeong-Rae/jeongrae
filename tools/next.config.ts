import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["j-3000.jeongrae.me"],
  transpilePackages: ["@jeongrae/ui"],
};

export default nextConfig;
