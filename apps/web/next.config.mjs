/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/db"],
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.MAPBOX_PUBLIC_TOKEN,
  },
};

export default nextConfig;
