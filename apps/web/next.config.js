/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@crowdfest/contracts'],
};

module.exports = nextConfig;
