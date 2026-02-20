/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable source maps in development to avoid path resolution issues
    if (dev) {
      config.devtool = false
    }
    return config
  },
}

export default nextConfig
