/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // For initial migration safety
  },
  experimental: {
    // Turbopack's on-disk dev cache (SST/compaction files under .next/dev) keeps
    // getting corrupted by file locking on this machine — every restart throws
    // "Persisting failed" / "Compaction failed" / MODULE_NOT_FOUND until .next is
    // wiped. Keeping the cache in memory only avoids the on-disk writes entirely.
    turbopackFileSystemCacheForDev: false,
  },
  async headers() {
    return [
      {
        // The admin console must never be indexed, cached or framed.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
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
