import bundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? (() => {
            try {
              const { protocol, hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
              const normalizedProtocol = protocol.replace(":", "");
              return [
                {
                  protocol: normalizedProtocol,
                  hostname,
                  pathname: "/storage/v1/object/**",
                },
              ];
            } catch {
              return [];
            }
          })()
        : []),
    ],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
