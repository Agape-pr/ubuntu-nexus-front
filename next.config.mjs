/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // For initial migration safety
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_PROXY_TARGET || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
