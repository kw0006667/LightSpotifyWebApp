/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.scdn.co',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.spotifycdn.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.github.com',
        pathname: '/**'
      }
    ]
  }
}

module.exports = nextConfig
