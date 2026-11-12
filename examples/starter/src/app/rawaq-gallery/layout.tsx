// The gallery: full composed pages in every look, to check the theme by eye and in the browser
// tests. Its own root layout (no language in the address): the language is one of the switches.
import '@mantine/core/styles.css';
import 'rawaq-ui/styles.css';

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '@fontsource-variable/plus-jakarta-sans/index.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import { directionOf } from 'rawaq-ui/tokens';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { readLook } from './look';
import { GalleryProviders } from './providers';
import '../starter.css';
import './gallery.css';

// Drawn for each request: the look comes from the cookie, and the switch below is read at run time.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Rawaq UI gallery',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
};

export default async function GalleryLayout({ children }: { children: ReactNode }) {
  const look = await readLook();
  // A tool for checking the theme, not a part of the app: in production it answers 404 unless
  // the server was started with RAWAQ_GALLERY=1.
  if (process.env.NODE_ENV === 'production' && process.env.RAWAQ_GALLERY !== '1') {
    notFound();
  }
  const dir = directionOf(look.locale);

  return (
    <html lang={look.locale} dir={dir} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <GalleryProviders look={look} dir={dir}>
          {children}
        </GalleryProviders>
      </body>
    </html>
  );
}
