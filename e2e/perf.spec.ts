// @perf: with the processor slowed 4 times (Chromium only), on the starter:
//  - loading a page has no long task over 200 ms;
//  - the smooth gate for the slides: during the 0.25 s after the click, no long task and no gap
//    between two frames over 50 ms. One visit alone is too noisy for a 50 ms gate, so each page is
//    visited VISITS times and the result is "passes out of VISITS".
// The glow slide must pass in most visits. "Show labels" is reported as it is: the owner kept its
// 0.2 s slide on 12 Nov 2026 (docs/DESIGN_THEME.md section 7), although it misses this gate at 4x.
//
// When the slide starts: "Show labels" slides at the click, so its window starts at the press (as
// measured for the owner). The glow slides only once the click's new page is in place (Rail.tsx
// follows the address), 0.2 to 0.4 s after the press at 4x; before that the browser is busy with
// the page change, not with the glow. So the glow's window starts at its own `transitionstart`.
//
//   yarn e2e:perf        runs only these tests, one at a time (nothing else runs next to them)
import { writeFileSync } from 'node:fs';
import { type CDPSession, expect, type Page, test, type TestInfo } from '@playwright/test';
import { GALLERY, setLook } from './support';

const RATE = 4;
const VISITS = Number(process.env.E2E_PERF_VISITS ?? 7);
const LOAD_LIMIT_MS = 200;
const GATE_MS = 50;
const SLIDE_MS = 250;
const LOAD_PAGES = ['/en', '/en/suppliers', '/ar', '/ar/suppliers'];
// The heaviest table page of the starter, in both directions.
const SLIDE_PAGES = ['/en/suppliers', '/ar/suppliers'];

test.skip(({ browserName }) => browserName !== 'chromium', 'CPU throttling is Chromium only.');
test.describe.configure({ mode: 'serial' });
// The slides are what is measured: motion stays on.
test.use({ reducedMotion: 'no-preference' });

interface Slide {
  frames: number;
  maxGapMs: number;
  longTasks: number;
  longestTaskMs: number;
}

async function slowDown(page: Page): Promise<CDPSession> {
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  return client;
}

/** Long tasks of the load so far (the browser keeps them for a late observer). */
const loadTasks = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number[]>((done) => {
        const tasks: number[] = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            tasks.push(Math.round(entry.duration));
          }
        }).observe({ type: 'longtask', buffered: true });
        setTimeout(() => done(tasks), 300);
      })
  );

/**
 * Frames and long tasks from the start of a slide to SLIDE_MS after it. The start is the press of
 * the click, or with `glow` the moment the glow's own slide starts.
 */
async function watchSlide(
  page: Page,
  click: () => Promise<void>,
  startsAt: 'press' | 'glow' = 'press'
): Promise<Slide> {
  await page.evaluate((glow) => {
    const state = window as unknown as Record<string, unknown>;
    const frames: number[] = [];
    const long: { start: number; duration: number }[] = [];
    state.__frames = frames;
    state.__long = long;
    state.__clicked = null;
    state.__watching = true;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        long.push({ start: entry.startTime, duration: entry.duration });
      }
    });
    observer.observe({ type: 'longtask' });
    state.__observer = observer;
    if (glow) {
      const onStart = (event: TransitionEvent) => {
        const target = event.target as Element | null;
        if (event.propertyName === 'transform' && target?.matches('[data-testid="rail-glow"]')) {
          state.__clicked = performance.now();
          removeEventListener('transitionstart', onStart, true);
        }
      };
      addEventListener('transitionstart', onStart, true);
    } else {
      addEventListener(
        'pointerdown',
        () => {
          state.__clicked = performance.now();
        },
        { capture: true, once: true }
      );
    }
    const tick = (time: number) => {
      frames.push(time);
      if (state.__watching) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, startsAt === 'glow');
  await page.waitForTimeout(300);
  await click();
  await page.waitForTimeout(startsAt === 'glow' ? 1500 : 900);
  return page.evaluate((slide) => {
    const state = window as unknown as {
      __frames: number[];
      __long: { start: number; duration: number }[];
      __clicked: number | null;
      __watching: boolean;
      __observer: PerformanceObserver;
    };
    state.__watching = false;
    state.__observer.disconnect();
    const from = state.__clicked;
    if (from === null) {
      throw new Error('the slide did not start');
    }
    const to = from + slide;
    const frames = state.__frames.filter((time) => time >= from && time <= to);
    const points = [from, ...frames];
    const gaps = points.slice(1).map((time, index) => time - (points[index] ?? time));
    const long = state.__long.filter(
      (task) => task.start < to && task.start + task.duration > from
    );
    return {
      frames: frames.length,
      maxGapMs: Math.round(Math.max(0, ...gaps) * 10) / 10,
      longTasks: long.length,
      longestTaskMs: Math.round(Math.max(0, ...long.map((task) => task.duration))),
    };
  }, SLIDE_MS);
}

/** Keeps the numbers of a test next to its results (`e2e-results/<test>/numbers.json`). */
function keep(info: TestInfo, numbers: unknown) {
  const text = JSON.stringify(numbers);
  info.annotations.push({ type: 'numbers', description: text });
  writeFileSync(
    info.outputPath('numbers.json'),
    `${JSON.stringify({ test: info.title, numbers }, null, 2)}
`
  );
}

const passes = (slide: Slide) => slide.maxGapMs <= GATE_MS && slide.longTasks === 0;

function summary(list: Slide[]) {
  return {
    passes: `${list.filter(passes).length} of ${list.length}`,
    worstGapMs: Math.max(0, ...list.map((slide) => slide.maxGapMs)),
    longestTaskMs: Math.max(0, ...list.map((slide) => slide.longestTaskMs)),
  };
}

test.describe('@perf CPU 4x', () => {
  for (const path of LOAD_PAGES) {
    test(`load ${path}: no long task over ${LOAD_LIMIT_MS} ms`, async ({ page }, info) => {
      // A first visit warms the server, so the load measured is the browser's work.
      await page.goto(path);
      await slowDown(page);
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      const tasks = await loadTasks(page);
      const longest = Math.max(0, ...tasks);
      keep(info, { longTasksMs: tasks });
      expect(longest, `longest task of the load at ${RATE}x`).toBeLessThanOrEqual(LOAD_LIMIT_MS);
    });
  }

  for (const path of SLIDE_PAGES) {
    test(`slides ${path}: smooth gate over ${VISITS} visits`, async ({ page }, info) => {
      test.setTimeout(VISITS * 25_000);
      const open: Slide[] = [];
      const close: Slide[] = [];
      const glow: Slide[] = [];
      await page.goto(path);
      for (let visit = 0; visit < VISITS; visit += 1) {
        const client = await slowDown(page);
        await page.goto(path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500);
        const toggle = page.getByTestId('rail-labels');
        open.push(await watchSlide(page, () => toggle.click()));
        close.push(await watchSlide(page, () => toggle.click()));
        // The glow slides to another entry of the rail (the page changes with it).
        const other = page.locator('[data-rail-item]:not([aria-current])').first();
        glow.push(await watchSlide(page, () => other.click(), 'glow'));
        await client.detach();
      }
      const result = {
        showLabelsOpen: summary(open),
        showLabelsClose: summary(close),
        glowSlide: summary(glow),
      };
      keep(info, result);
      // The glow passes the gate in most visits. "Show labels" is reported only (see the top).
      expect(
        glow.filter(passes).length,
        `glow slide passes out of ${VISITS}: ${JSON.stringify(glow)}`
      ).toBeGreaterThan(VISITS / 2);
    });
  }

  // The glow alone: the next page is a light one, so the page change does not land in the frame
  // that starts the slide (on the starter the Overview's first layout sometimes does).
  for (const locale of ['en', 'ar'] as const) {
    test(`glow to a light page (${locale}): smooth gate over ${VISITS} visits`, async ({
      page,
      context,
      baseURL,
    }, info) => {
      test.setTimeout(VISITS * 15_000);
      await setLook(context, baseURL ?? '', { locale });
      const glow: Slide[] = [];
      await page.goto(`${GALLERY}/work`);
      for (let visit = 0; visit < VISITS; visit += 1) {
        const client = await slowDown(page);
        await page.goto(`${GALLERY}/work`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500);
        glow.push(await watchSlide(page, () => page.getByTestId('nav-empty').click(), 'glow'));
        await client.detach();
      }
      const result = summary(glow);
      keep(info, { glowSlide: result });
      expect(
        glow.filter(passes).length,
        `glow slide passes out of ${VISITS}: ${JSON.stringify(glow)}`
      ).toBeGreaterThan(VISITS / 2);
    });
  }
});
