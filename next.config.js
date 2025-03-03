/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [], // Add remote patterns here if needed
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
  // Enable static image optimization for local images
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp)$/i,
      type: 'asset/resource'
    });
    return config;
  }
};

module.exports = nextConfig;
