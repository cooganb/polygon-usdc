/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    POLYGON_RPC_ENDPOINT: process.env.POLYGON_RPC_ENDPOINT,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
  },
}

module.exports = nextConfig