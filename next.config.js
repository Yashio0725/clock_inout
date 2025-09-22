/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14では appDir はデフォルトで有効
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
