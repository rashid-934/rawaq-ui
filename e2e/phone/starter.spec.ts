import { expect, test } from '@playwright/test';
import { axeFindings, settle, watchPage } from '../support';
import { focusWalk, sidewaysScroll, smallTargets } from './checks';

// The starter on a phone (docs/DESIGN_THEME.md, "Phone layout"), at every phone size of the
// project: the bottom bar instead of the rail, nothing sideways, 48 px targets, axe clean.

const PAGES = [
  '/en',
  '/ar',
  '/en/requests',
  '/ar/requests',
  '/en/quotes',
  '/ar/quotes',
  '/en/suppliers',
  '/ar/reports',
];

for (const path of PAGES) {
  test(`${path} works on a phone`, async ({ page }) => {
    const problems = watchPage(page);
    await page.goto(path);
    await settle(page);
    await expect(page.getByTestId('bottom-bar')).toBeVisible();
    await expect(page.getByTestId('phone-bar')).toBeVisible();
    await expect(page.locator('#app-navigation')).toBeHidden();
    expect(await sidewaysScroll(page)).toBe(0);
    expect(await smallTargets(page)).toEqual([]);
    expect(await axeFindings(page)).toEqual([]);
    // The end of the page is never under the bar.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const gap = await page.evaluate(() => {
      const last = document.querySelector('main')?.getBoundingClientRect();
      const bar = document.querySelector('[data-testid="bottom-bar"]')?.getBoundingClientRect();
      return last && bar ? bar.top - last.bottom : 0;
    });
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(problems.list).toEqual([]);
  });
}

test('the keyboard reaches every part in order, and nothing it reaches hides under the bar', async ({
  page,
}) => {
  await page.goto('/en/requests');
  await settle(page);
  const { names, hidden } = await focusWalk(page);
  expect(hidden).toEqual([]);
  // The phone bar's action first, the bottom bar last.
  const action = names.findIndex((name) => name.includes('New request'));
  const more = names.findIndex((name) => name === 'More');
  expect(action).toBeGreaterThanOrEqual(0);
  expect(more).toBeGreaterThan(action);
});

test('More opens the sheet; Back closes it and stays; a tile opens its page', async ({ page }) => {
  await page.goto('/ar/requests');
  await settle(page);
  await page.getByTestId('bar-more').click();
  const sheet = page.getByRole('dialog', { name: 'المزيد' });
  await expect(sheet).toBeVisible();
  expect(await smallTargets(page)).toEqual([]);
  expect(await axeFindings(page)).toEqual([]);
  await page.goBack();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/\/ar\/requests$/);

  await page.getByTestId('bar-more').click();
  await page.getByTestId('more-reports').click();
  await expect(page).toHaveURL(/\/ar\/reports$/);
  // "More" has the glow for a page of the sheet; it is a button, so no current mark.
  await expect(page.locator('li:has(> [data-testid="bar-more"])')).toHaveAttribute(
    'data-bar-active'
  );
  await expect(page.getByTestId('bar-more')).not.toHaveAttribute('aria-current');
  await page.goBack();
  await expect(page).toHaveURL(/\/ar\/requests$/);
});

test('the language switch in the sheet keeps the page and leaves no step behind', async ({
  page,
}) => {
  await page.goto('/ar/requests');
  await settle(page);
  await page.getByTestId('bar-more').click();
  await page.getByRole('dialog').getByText('English', { exact: true }).click();
  await expect(page).toHaveURL(/\/en\/requests$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('the quotes table scrolls sideways under its fixed first column, in Arabic too', async ({
  page,
}) => {
  for (const locale of ['en', 'ar']) {
    await page.goto(`/${locale}/quotes`);
    await settle(page);
    await expect(page.getByTestId('swipe-hint')).toBeVisible();
    const moved = await page.evaluate(() => {
      const wrap = document.querySelector<HTMLElement>('.table-wrap');
      const first = wrap?.querySelector<HTMLElement>('tbody td:first-child');
      const second = wrap?.querySelector<HTMLElement>('tbody td:nth-child(2)');
      if (!wrap || !first || !second) {
        return null;
      }
      const before = [first.getBoundingClientRect().x, second.getBoundingClientRect().x];
      // Sideways toward the end side: negative in a right-to-left page.
      wrap.scrollLeft = getComputedStyle(wrap).direction === 'rtl' ? -120 : 120;
      const after = [first.getBoundingClientRect().x, second.getBoundingClientRect().x];
      return { first: after[0]! - before[0]!, second: after[1]! - before[1]! };
    });
    expect(moved).not.toBeNull();
    // The first column stays; the next one moves.
    expect(Math.abs(moved!.first)).toBeLessThanOrEqual(1);
    expect(Math.abs(moved!.second)).toBeGreaterThan(10);
  }
});
