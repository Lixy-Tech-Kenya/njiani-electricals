/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@njiani/shared'],
  async rewrites() {
    return [
      {
        source: '/njianadmin',
        destination: 'http://localhost:3502/njianadmin',
      },
      {
        source: '/njianadmin/:path*',
        destination: 'http://localhost:3502/njianadmin/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http',  hostname: 'localhost', port: '3500', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '*.njiani.co.ke', pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
