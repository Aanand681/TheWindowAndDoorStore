import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Package import optimization for tree-shaking
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@hugeicons/react',
      'sonner',
      'framer-motion',
      'pdf-lib',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdn.jsdelivr.net' },
      { protocol: 'https', hostname: '**.googleapis.com' },
    ],
  },

  // Enable compression
  compress: true,

  // Security and static asset caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/:path*.pdf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Webpack: Disable canvas dependency for pdfjs-dist
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  // Allow dev origins for local network testing
  allowedDevOrigins: ['10.0.0.194', '192.168.2.211'],
  turbopack: {},
};

export default nextConfig;
