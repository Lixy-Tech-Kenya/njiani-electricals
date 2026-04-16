/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@njiani/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3500',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.njiani.co.ke',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
