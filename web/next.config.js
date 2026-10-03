const createNextIntlPlugin = require('next-intl/plugin');
const { withContentlayer } = require('next-contentlayer2');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Gives `next dev` access to the Cloudflare bindings (the local D1 database).
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then((m) =>
    m.initOpenNextCloudflareForDev()
  );
}

module.exports = withContentlayer(withNextIntl(nextConfig));
