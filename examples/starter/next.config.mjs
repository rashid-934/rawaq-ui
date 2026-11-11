import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
  reactStrictMode: true,
  poweredByHeader: false,
  // This folder is the whole project, also while it sits inside the Rawaq UI repository.
  turbopack: { root: import.meta.dirname },
});
