import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/ml/:path*",
        destination: process.env.ML_ENGINE_URL
          ? `${process.env.ML_ENGINE_URL}/api/:path*`
          : "http://127.0.0.1:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
