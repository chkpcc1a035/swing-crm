/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // ...
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ilhhxjajdfiflqltyhcw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/products_image/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  },
  // ...
};

module.exports = nextConfig;
