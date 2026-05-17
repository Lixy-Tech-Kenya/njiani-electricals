/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/njianadmin',
  output: 'standalone',
  transpilePackages: ['@njiani/shared'],
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
