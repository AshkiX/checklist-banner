/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  experimental: {
    outputFileTracingIncludes: {
      '/api/generate-banner': ['./fonts/**'],
    },
  },
};

export default nextConfig;
