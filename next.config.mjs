/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    PORT: process.env.PORT || '0', 
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
