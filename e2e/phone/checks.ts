import type { Page } from '@playwright/test';

/** The smallest tap target on a phone (Android guidance; docs/DESIGN_THEME.md, "Phone layout"). */
export const TOUCH_TARGET = 48;

/** How far the page scrolls sideways: 0 on a page that fits the phone. */
export function sidewaysScroll(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

/**
 * Every visible thing a finger can press that is smaller than 48 x 48 px. A touch area drawn by
 * `::before` around a control (the filter chips) counts. Things off screen or hidden are left out,
 * so is a skip link until it has the focus.
 */
export function smallTargets(page: Page) {
  return page.evaluate((min) => {
    const selector =
      'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [role="tab"], [tabindex]:not([tabindex="-1"])';
    const problems: string[] = [];
    for (const element of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || element.closest('[hidden], [aria-hidden="true"]')) {
        continue;
      }
      // A radio or checkbox drawn as a label (a segmented control) is pressed through its label.
      // A password field's input sits inside the visible box: the box is what a finger presses.
      const target =
        element instanceof HTMLInputElement && ['radio', 'checkbox'].includes(element.type)
          ? (element.closest('label') ?? element.labels?.[0] ?? element)
          : (element.closest<HTMLElement>('.mantine-PasswordInput-input') ?? element);
      const box = target.getBoundingClientRect();
      if (box.width === 0 || box.height === 0 || box.bottom < 0 || box.right < 0) {
        continue;
      }
      if (box.left >= window.innerWidth || box.top >= document.documentElement.scrollHeight) {
        continue;
      }
      const before = getComputedStyle(target, '::before');
      let height = box.height;
      let width = box.width;
      if (before.content !== 'none' && before.position === 'absolute') {
        height += Math.max(0, -parseFloat(before.top) || 0) + Math.max(0, -parseFloat(before.bottom) || 0);
        width += Math.max(0, -parseFloat(before.left) || 0) + Math.max(0, -parseFloat(before.right) || 0);
      }
      if (Math.round(height) < min || Math.round(width) < min) {
        const name = (target.getAttribute('aria-label') || target.textContent || target.tagName)
          .trim()
          .slice(0, 40);
        problems.push(`${name}: ${Math.round(width)} x ${Math.round(height)}`);
      }
    }
    return problems;
  }, TOUCH_TARGET);
}

/**
 * Walks the page with Tab and gives back each stop's name, and every stop that sits under the
 * floating bottom bar (outside the bar itself) once the browser scrolled it into view.
 */
export async function focusWalk(page: Page, stops = 40) {
  const names: string[] = [];
  const hidden: string[] = [];
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (let index = 0; index < stops; index += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) {
        return null;
      }
      const name = (element.getAttribute('aria-label') || element.textContent || element.tagName)
        .trim()
        .slice(0, 40);
      const bar = document.querySelector('[data-testid="bottom-bar"]');
      const barBox = bar?.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      const underBar =
        !!barBox &&
        barBox.height > 0 &&
        !bar?.contains(element) &&
        box.bottom > barBox.top + 1 &&
        box.top < barBox.bottom;
      return { name, underBar };
    });
    if (!stop) {
      break;
    }
    names.push(stop.name);
    if (stop.underBar) {
      hidden.push(stop.name);
    }
  }
  return { names, hidden };
}
