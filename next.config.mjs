/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  experimental: {
    outputFileTracingRoot: undefined,
  },
  generateEtags: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ilhhxjajdfiflqltyhcw.supabase.co",
        pathname: "/storage/v1/object/sign/products/**",
      },
    ],
  },
  basePath: process.env.NODE_ENV === "production" ? "" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "" : "",
  trailingSlash: false,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/login",
          destination: "/login/page",
        },
        {
          source: "/:path*",
          destination: "/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
