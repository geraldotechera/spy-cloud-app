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
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    // Completely disable source maps to avoid path resolution issues
    config.devtool = false
    
    // Override any source map plugins
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'SourceMapDevToolPlugin'
    )
    
    return config
  },
  env: {
    GENERATE_SOURCEMAP: 'false',
  },
}

export default nextConfig
