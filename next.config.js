/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "i.scdn.co", 
      "github.com", 
      "thisis-images.scdn.co", 
      "seeded-session-images.scdn.co", 
      "mosaic.scdn.co",
      "t.scdn.co",
      "scontent-iad3-2.xx.fbcdn.net",
      "scontent-iad3-1.xx.fbcdn.net",
      "charts-images.scdn.co",
      "scontent-ord5-1.xx.fbcdn.net",
      "scontent-ort2-1.xx.fbcdn.net",
      "scontent-ort2-2.xx.fbcdn.net",
      "scontent-atl3-1.xx.fbcdn.net",
      "seed-mix-image.spotifycdn.com"],
  },
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
}

module.exports = nextConfig
