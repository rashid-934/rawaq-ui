// Phone speed of a built Next.js app (the Rawaq UI starter) on this computer.
//   node phone-speed.cjs <app dir> <out.json> [--pages=en,en/requests] [--runs=5]
// It starts `next start` itself, measures in Chrome at 390 x 844 (a phone: touch, 3x pixels)
// with the processor slowed 4 times, and stops the app again. For each page, the median of the
// runs (each in a fresh browser context, after one warm-up load):
//  - the longest task of the first load (until the page is quiet)
//  - LCP of the first load
//  - a tap on "More" in the bottom bar until the next paint (Event Timing), when there is one
// Pages are given without the first slash: Git Bash on Windows rewrites `/en` into a path.
const { spawn } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { chromium } = require('playwright-core');

const app = resolve(process.argv[2]);
const out = resolve(process.argv[3]);
const option = (name, fallback) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const PAGES = option('pages', 'en,en/requests')
  .split(',')
  .map((page) => `/${page.replace(/^\/+/, '')}`);
const RUNS = Number(option('runs', '5'));
const PORT = 4312;
const origin = `http://localhost:${PORT}`;

const median = (list) => {
  const known = list.filter((value) => typeof value === 'number');
  return known.length === 0 ? null : [...known].sort((a, b) => a - b)[Math.floor(known.length / 2)];
};

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      if ((await fetch(`${origin}${PAGES[0]}`)).ok) {
        return;
      }
    } catch {
      // Not up yet.
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error('the app did not start');
}

async function run(browser, path) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__speed = { longest: 0, lcp: 0, tap: null };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__speed.longest = Math.max(window.__speed.longest, entry.duration);
      }
    }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) {
        window.__speed.lcp = last.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto(`${origin}${path}`, { waitUntil: 'load' });
  // Quiet: no long task in the last two seconds.
  await page.waitForTimeout(3000);
  const load = await page.evaluate(() => ({ ...window.__speed }));

  let tapMs = null;
  const more = page.getByTestId('bar-more');
  if (await more.isVisible().catch(() => false)) {
    await page.evaluate(() => {
      window.__taps = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId) {
            window.__taps.push(entry.duration);
          }
        }
      }).observe({ type: 'event', durationThreshold: 16, buffered: false });
    });
    await more.tap();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page.waitForTimeout(1000);
    tapMs = await page.evaluate(() => (window.__taps.length ? Math.max(...window.__taps) : 16));
  }
  await context.close();
  return { longestTaskMs: Math.round(load.longest), lcpMs: Math.round(load.lcp), tapMs };
}

(async () => {
  const server = spawn(
    process.execPath,
    [join(app, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(PORT)],
    { cwd: app, stdio: 'inherit' }
  );
  const result = { app, viewport: '390x844', cpu: '4x', runs: RUNS, pages: {} };
  try {
    await waitForServer();
    const browser = await chromium.launch({ channel: 'chrome' });
    for (const path of PAGES) {
      await run(browser, path);
      const runs = [];
      for (let i = 0; i < RUNS; i += 1) {
        runs.push(await run(browser, path));
      }
      result.pages[path] = {
        longestTaskMs: median(runs.map((entry) => entry.longestTaskMs)),
        lcpMs: median(runs.map((entry) => entry.lcpMs)),
        tapMoreToPaintMs: median(runs.map((entry) => entry.tapMs)),
        runs,
      };
      console.log(path, JSON.stringify({ ...result.pages[path], runs: undefined }));
    }
    await browser.close();
  } finally {
    server.kill();
  }
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
})();
