import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  basePath: isProd ? '/habitflow' : '',
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
