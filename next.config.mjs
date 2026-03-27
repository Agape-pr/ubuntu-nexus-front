/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // For initial migration safety
  },
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_PROXY_TARGET || 'http://localhost:8000';
    // Clean trailing slash to prevent double-slash 404 errors when proxying to strict gateways
    const cleanTarget = target.endsWith('/') ? target.slice(0, -1) : target;
    return [
      {
        source: '/api/:path*',
        destination: `${cleanTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
