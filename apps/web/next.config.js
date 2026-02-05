/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@relique/shared", "@relique/ui"],
  experimental: {
    // Allow resolving modules outside of app dir (pnpm store paths land outside apps/web)
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Supabase Storage (marketplace ảnh từ admin upload)
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: 'https',
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
              pathname: '/storage/v1/object/**',
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
