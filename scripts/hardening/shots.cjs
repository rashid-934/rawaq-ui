// Baseline pictures of a built Storybook.
//   node shots.cjs <storybook-static dir> <out dir>
// Every story x 7 presets x 2 densities x English and Arabic at 1280 x 720, plus the Dashboard
// screen at 1920 x 1080. Reduced motion, animations finished, fonts loaded.
//
// Chrome runs with --disable-partial-raster. Without it, Chrome repaints only the changed
// rectangles of a tile while the page loads, and soft shadows and smooth edges keep traces of the
// order of those repaints: up to 1 level of 255 in a shadow, and up to about 20 in one smooth edge
// pixel. That order depends on timing, so the same build gave different pictures from one run to
// the next (found on 12 Nov 2026). With the switch, two runs and two builds that draw the same
// page give the same pixels.
const { existsSync, mkdirSync, readFileSync, statSync } = require('node:fs');
const { createServer } = require('node:http');
const { extname, join, normalize, resolve } = require('node:path');
const { chromium } = require('playwright-core');

const site = resolve(process.argv[2]) + require('node:path').sep;
const out = resolve(process.argv[3]);
mkdirSync(out, { recursive: true });

const PRESETS = [
  'sand-forest',
  'stone-navy',
  'pearl-teal',
  'linen-burgundy',
  'graphite-amber',
  'slate-gray',
  'onyx-black',
];
const DENSITIES = ['compact', 'comfortable'];
const LOCALES = ['en', 'ar'];
const WIDE_STORY = 'screens--overview';
const ONLY_WIDE = process.env.ONLY_WIDE === '1';
// ONLY_STORIES=screens--loading,screens--overview takes those stories only (quick rounds).
const ONLY_STORIES = (process.env.ONLY_STORIES || '').split(',').filter(Boolean);
const WORKERS = 2;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  const file = normalize(join(site, path === '/' ? 'index.html' : path));
  if (!file.startsWith(site) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  response.end(readFileSync(file));
});

(async () => {
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const stories = Object.values(JSON.parse(readFileSync(join(site, 'index.json'), 'utf8')).entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.id)
    .filter((id) => ONLY_STORIES.length === 0 || ONLY_STORIES.includes(id))
    .sort();

  const jobs = [];
  for (const id of stories) {
    for (const preset of PRESETS) {
      for (const density of DENSITIES) {
        for (const locale of LOCALES) {
          if (!ONLY_WIDE) {
            jobs.push({ id, preset, density, locale, width: 1280, height: 720 });
          }
          if (id === WIDE_STORY) {
            jobs.push({ id, preset, density, locale, width: 1920, height: 1080 });
          }
        }
      }
    }
  }

  // See the top of this file. CHROME_ARGS="..." adds more switches.
  const args = ['--disable-partial-raster', ...(process.env.CHROME_ARGS || '').split(' ')];
  const browser = await chromium.launch({ channel: 'chrome', args: args.filter(Boolean) });
  const failures = [];
  let next = 0;

  async function worker() {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    while (next < jobs.length) {
      const job = jobs[next];
      next += 1;
      const name = `${job.id}__${job.preset}__${job.density}__${job.locale}__${job.width}.png`;
      try {
        await page.setViewportSize({ width: job.width, height: job.height });
        const globals = `locale:${job.locale};preset:${job.preset};density:${job.density}`;
        await page.goto(`${origin}/iframe.html?id=${job.id}&viewMode=story&globals=${globals}`, {
          waitUntil: 'networkidle',
        });
        await page.waitForSelector('#storybook-root > *', { state: 'attached' });
        if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) {
          failures.push(`${name}: the story did not render`);
          continue;
        }
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => {
          for (const animation of document.getAnimations()) {
            try {
              animation.finish();
            } catch {
              // An endless animation cannot be finished.
            }
          }
        });
        await page.mouse.move(0, 0);
        await page.screenshot({ path: join(out, name), animations: 'disabled', caret: 'hide' });
      } catch (error) {
        failures.push(`${name}: ${String(error && error.message).split('\n')[0]}`);
      }
    }
    await context.close();
  }

  const started = Date.now();
  await Promise.all(Array.from({ length: WORKERS }, worker));
  await browser.close();
  server.close();
  console.log(
    `shots: ${jobs.length} pictures of ${stories.length} stories in ` +
      `${Math.round((Date.now() - started) / 1000)} s, ${failures.length} failure(s)`
  );
  for (const failure of failures) {
    console.log(`- ${failure}`);
  }
  process.exit(failures.length > 0 ? 1 : 0);
})();
