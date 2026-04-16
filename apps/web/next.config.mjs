/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@njiani/shared'],
  images: {
    remotePatterns: [
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
