/** @type {import('next').NextConfig} */
const adminUrl = process.env.ADMIN_URL ?? 'http://localhost:3502';

const nextConfig = {
  transpilePackages: ['@njiani/shared'],
  async rewrites() {
    return [
      {
        source: '/njiani-admin',
        destination: `${adminUrl}/njiani-admin`,
      },
      {
        source: '/njiani-admin/:path*',
        destination: `${adminUrl}/njiani-admin/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'http',  hostname: 'localhost', port: '3500', pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
