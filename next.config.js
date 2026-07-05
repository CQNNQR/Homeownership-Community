/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // WordPress.com staging host — for serving blog-post featured images
      // through Vercel's image optimizer. Add other WP domains here if the
      // CMS moves.
      {
        protocol: 'https',
        hostname: 'bdixon7955e29543-dcwxs.wpcomstaging.com',
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy WordPress.com staging images through our own domain so that
      // JSON-LD `image`, og:image, and twitter:image all reference the
      // production hostname. Without this proxy, the schema bug from the
      // 2026-07-05 audit (Tier 1 #4) would still surface a wpcomstaging.com
      // URL in the rendered article body when the featured image is shown
      // via the post's `image` field.
      //
      // Path mapping:
      //   src/lib/site-config.ts → proxyWpImage() drops the leading
      //   `/wp-content` from the WP path so that the proxy URL is
      //   `/wp-image/uploads/...`. This rewrite re-prepends `/wp-content`.
      {
        source: '/wp-image/:path*',
        destination: 'https://bdixon7955e29543-dcwxs.wpcomstaging.com/wp-content/:path*',
      },
    ]
  },
}

module.exports = nextConfig