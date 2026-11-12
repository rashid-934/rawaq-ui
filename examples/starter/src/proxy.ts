import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Adds the language to the address (/en, /ar) before a page is served.
export const proxy = createIntlMiddleware(routing);

export const config = {
  // Skip Next.js internals, files with an extension, and the gallery (its language is a switch).
  matcher: ['/((?!api|_next|_vercel|rawaq-gallery|.*\\..*).*)'],
};
