const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  output: 'export',
  distDir: 'dist',
}

module.exports = withContentlayer(nextConfig)
