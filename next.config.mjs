/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? '/rohan-raid-composition-editor/' : '',
  basePath: isProd ? '/rohan-raid-composition-editor' : '',
  output: 'export',
}

export default nextConfig
