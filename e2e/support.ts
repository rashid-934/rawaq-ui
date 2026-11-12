// Shared parts of the browser tests: the pages, the gallery's look cookie, a watcher for console
// errors, hydration warnings and failed requests, axe, and the package's own tokens.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AxeBuilder } from '@axe-core/playwright';
import type { BrowserContext, Page } from '@playwright/test';

export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

/** The starter's own pages: the language is in the address. */
export const STARTER_PAGES = ['/en', '/en/suppliers', '/ar', '/ar/suppliers'];

/** The gallery's pages: the language is a switch, kept in a cookie. */
export const GALLERY = '/rawaq-gallery';
export const GALLERY_PAGES = ['', '/work', '/loading', '/empty', '/error', '/form'].map(
  (page) => `${GALLERY}${page}`
);
/** An address the gallery does not have: it answers 404 with the gallery's not-found page. */
export const GALLERY_MISSING = `${GALLERY}/no-such-page`;

export const LOOK_COOKIE = 'rawaq-gallery-look';

export interface Look {
  preset?: string;
  sidebar?: string;
  density?: string;
  locale?: Locale;
}

/** Saves a look in the gallery's cookie, the way the switch bar does. */
export async function setLook(context: BrowserContext, baseURL: string, look: Look) {
  const value = new URLSearchParams(
    Object.entries(look).filter((entry): entry is [string, string] => Boolean(entry[1]))
  ).toString();
  await context.addCookies([
    { name: LOOK_COOKIE, value, url: `${baseURL}${GALLERY}`, sameSite: 'Lax' },
  ]);
}

/** The tokens of the package the starter has installed, i.e. the package under test. */
interface TokenFile {
  defaults: { preset: string; sidebar: string; density: string };
  presets: Record<string, { sidebar: string }>;
  density: Record<string, { spacing: Record<string, string> }>;
}
export const tokens: TokenFile = JSON.parse(
  readFileSync(
    join(
      import.meta.dirname,
      '..',
      'examples',
      'starter',
      'node_modules',
      'rawaq-ui',
      'dist',
      'tokens.json'
    ),
    'utf8'
  )
);

/** `#173B30` as `[23, 59, 48]`. */
export function rgbOf(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export interface Problems {
  list: string[];
}

/**
 * Watches a page from before its first request: console errors, hydration warnings, script errors,
 * answers of 400 and up, and requests that failed. `expect404` is the one address that is allowed
 * to answer 404 (the gallery's missing page).
 */
export function watchPage(page: Page, expect404?: string): Problems {
  const problems: Problems = { list: [] };
  const expected = (url: string) => expect404 !== undefined && new URL(url).pathname === expect404;
  page.on('console', (message) => {
    const text = message.text();
    const isError = message.type() === 'error';
    const isHydration = /hydrat/i.test(text);
    if (!isError && !isHydration) {
      return;
    }
    // The browser notes the missing page's own 404 in the console; that answer is the point.
    if (isError && /status of 404/.test(text) && expected(message.location().url || page.url())) {
      return;
    }
    problems.list.push(`console ${message.type()}: ${text.slice(0, 300)}`);
  });
  page.on('pageerror', (error) =>
    problems.list.push(`script error: ${error.message.slice(0, 300)}`)
  );
  page.on('response', (response) => {
    if (response.status() >= 400 && !(response.status() === 404 && expected(response.url()))) {
      problems.list.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) =>
    problems.list.push(`failed ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
  );
  return problems;
}

/** WCAG 2.2 AA, as `yarn axe` checks the stories. */
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** axe's findings on the page, one line each (empty when the page passes). */
export async function axeFindings(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
  return results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact ?? 'n/a'}): ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(', ')}`
  );
}

/** Waits until the shell is drawn and the page is quiet (fonts in, no request in flight). */
export async function settle(page: Page) {
  await page.getByTestId('app-frame').waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}
