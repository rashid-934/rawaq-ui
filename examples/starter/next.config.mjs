import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

// What the pages may load, and from where. Everything this app needs comes from itself: its
// scripts, its styles, and the font files it hosts (the @fontsource packages). Next.js and
// Mantine write small inline scripts and styles, so 'unsafe-inline' stays; a stricter policy
// needs a nonce for every request. Add your own API address to connect-src when you have one.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // The same as frame-ancestors 'none', for older browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Browsers follow this on https only.
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]),
];

export default withNextIntl({
  reactStrictMode: true,
  poweredByHeader: false,
  // The source of the app is not handed to the browser.
  productionBrowserSourceMaps: false,
  // This folder is the whole project, also while it sits inside the Rawaq UI repository.
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
});
