import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 家目录有多余的 package-lock.json，防止 Next 误判 workspace 根目录
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
