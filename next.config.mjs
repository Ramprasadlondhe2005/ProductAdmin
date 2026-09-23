/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
      },
      {
        protocol: 'https',
        hostname: 'i.dummyjson.com',
      },
    ],
    // Allow any external image URL through unoptimized if needed
    unoptimized: false,
  },
  eslint: {
    // Allow production builds to complete even if there are eslint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
