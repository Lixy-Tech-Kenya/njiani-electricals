/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/njiani-admin',
  transpilePackages: ['@njiani/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'http',  hostname: 'localhost', port: '3500', pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
