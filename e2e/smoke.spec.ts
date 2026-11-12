// Every page of the starter and of the gallery, in English and Arabic: the page is drawn in the
// right language and direction, with no console error, no hydration warning, no failed request,
// and no axe finding (WCAG 2.2 AA).
import { expect, test } from '@playwright/test';
import {
  axeFindings,
  GALLERY_MISSING,
  GALLERY_PAGES,
  LOCALES,
  setLook,
  settle,
  STARTER_PAGES,
  watchPage,
} from './support';

const dirOf = (locale: string) => (locale === 'ar' ? 'rtl' : 'ltr');

/** What a gallery page shows besides the shell. */
const PAGE_PART: Record<string, string | undefined> = {
  '/rawaq-gallery/loading': 'page-skeleton',
  '/rawaq-gallery/empty': 'empty-state',
  '/rawaq-gallery/error': 'reference-code',
};

for (const path of STARTER_PAGES) {
  test(`starter ${path}`, async ({ page }) => {
    const problems = watchPage(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await settle(page);
    const locale = path.split('/')[1] ?? 'en';
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', dirOf(locale));
    expect(await axeFindings(page), 'axe').toEqual([]);
    expect(problems.list, 'console, hydration and requests').toEqual([]);
  });
}

for (const locale of LOCALES) {
  test.describe(`gallery (${locale})`, () => {
    test.beforeEach(async ({ context, baseURL }) => {
      await setLook(context, baseURL ?? '', { locale });
    });

    for (const path of GALLERY_PAGES) {
      test(path, async ({ page }) => {
        const problems = watchPage(page);
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await settle(page);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('html')).toHaveAttribute('dir', dirOf(locale));
        const part = PAGE_PART[path];
        if (part) {
          await expect(page.getByTestId(part)).toBeVisible();
        }
        if (path.endsWith('/error')) {
          // An error screen shows a reference code only: never a message or a stack.
          await expect(page.getByTestId('reference-code')).toHaveText(/[A-Z0-9]{4}/);
          await expect(page.getByTestId('empty-state')).not.toContainText(/Error:|at \w+ \(/);
        }
        expect(await axeFindings(page), 'axe').toEqual([]);
        expect(problems.list, 'console, hydration and requests').toEqual([]);
      });
    }

    test('a missing page answers 404 with the not-found state', async ({ page }) => {
      const problems = watchPage(page, GALLERY_MISSING);
      const response = await page.goto(GALLERY_MISSING);
      expect(response?.status()).toBe(404);
      await settle(page);
      // Next.js draws a page's not-found file in the browser (PROGRESS.md, A7): wait for it.
      const state = page.getByTestId('empty-state');
      await expect(state).toBeVisible();
      await expect(state).toHaveAttribute('data-variant', 'not-found');
      await expect(page.locator('html')).toHaveAttribute('dir', dirOf(locale));
      expect(await axeFindings(page), 'axe').toEqual([]);
      expect(problems.list, 'console, hydration and requests').toEqual([]);
    });
  });
}
