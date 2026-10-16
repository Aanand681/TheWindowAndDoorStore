import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.194', '192.168.2.211'],
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

export default nextConfig
