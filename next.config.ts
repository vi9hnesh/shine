import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable optimized prefetching
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  }
};

export default nextConfig;
