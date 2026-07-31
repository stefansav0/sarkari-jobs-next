import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Image Optimization Configuration (Fixes the Unsplash & ImgBB Errors)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', 
      },
      // ✅ Added i.ibb.co for your Study News cover images
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**', 
      },
      // You can add more domains here in the future if needed!
    ],
  },

  // 2. CORS Headers Configuration (Allows admin panel access)
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://admin.finderight.com" }, 
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { 
            key: "Access-Control-Allow-Headers", 
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" 
          },
        ],
      },
    ];
  },
};

export default nextConfig;