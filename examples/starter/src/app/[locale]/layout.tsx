// Styles, in this order: Mantine, the fonts, Rawaq UI, then the app's own.
import '@mantine/core/styles.css';
import '@fontsource-variable/plus-jakarta-sans/index.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import 'rawaq-ui/styles.css';
import '../starter.css';

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { directionOf } from 'rawaq-ui/tokens';
import { routing } from '@/i18n/routing';
import { Providers } from './providers';
import { Shell } from './shell';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'app' });
  return { title: t('name'), description: t('description'), icons: { icon: '/favicon.svg' } };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  // Rawaq UI knows which languages are written right to left.
  const dir = directionOf(locale);

  return (
    <html lang={locale} dir={dir} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <NextIntlClientProvider>
          <Providers locale={locale} dir={dir}>
            <Shell>{children}</Shell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
