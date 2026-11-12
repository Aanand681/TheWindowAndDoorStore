import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Enable React 19 Compiler
  reactCompiler: true,

  // Package import optimization for tree-shaking
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@hugeicons/react",
      "sonner",
      "framer-motion",
      "pdf-lib",
      "date-fns",
    ],
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "**.cdn.jsdelivr.net" },
      { protocol: "https", hostname: "**.googleapis.com" },
    ],
  },

  // Enable compression
  compress: true,

  // Security and static asset caching headers
  async headers() {
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "worker-src 'self' blob: https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.cdn.jsdelivr.net https://*.googleapis.com https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' blob: https://api.openrouteservice.org https://api.heigit.org https://geocoder.ca https://nominatim.openstreetmap.org https://*.pusher.com wss://*.pusher.com",
      "frame-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; ")

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/:path*.pdf",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ]
  },

  // Webpack: Disable canvas dependency for pdfjs-dist
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },

  // Allow dev origins for local network testing
  allowedDevOrigins: ["10.0.0.194", "192.168.2.211"],
  turbopack: {},
}

export default nextConfig
