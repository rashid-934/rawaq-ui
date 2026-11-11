// Runs axe on every story of the built Storybook: in English and Arabic, in all seven presets,
// with reduced motion, against the WCAG 2.2 AA rules. Any violation fails the run.
//
//   yarn storybook:build && yarn axe            every story, both languages, seven presets
//   yarn axe --quick                            the default preset only (a fast local check)
//
// It uses the Chrome that is already installed (no browser download) and writes no files.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright-core';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const LOCALES = ['en', 'ar'];
const PRESETS = [
  'sand-forest',
  'stone-navy',
  'pearl-teal',
  'linen-burgundy',
  'graphite-amber',
  'slate-gray',
  'onyx-black',
];
const PAGES_AT_ONCE = 4;

const quick = process.argv.includes('--quick');
const site = fileURLToPath(new URL('../storybook-static/', import.meta.url));
const indexFile = join(site, 'index.json');

if (!existsSync(indexFile)) {
  console.error('axe: there is no built Storybook. Run `yarn storybook:build` first.');
  process.exit(1);
}

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

/** A tiny file server for the built Storybook, on this computer only. */
const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const file = normalize(join(site, path === '/' ? 'index.html' : path));
  // Never serve a file from outside the Storybook folder.
  if (!file.startsWith(site) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const stories = Object.values(JSON.parse(readFileSync(indexFile, 'utf8')).entries).filter(
  (entry) => entry.type === 'story'
);
const jobs = stories.flatMap((story) =>
  LOCALES.flatMap((locale) =>
    (quick ? PRESETS.slice(0, 1) : PRESETS).map((preset) => ({
      name: `${story.title} / ${story.name} (${locale}, ${preset})`,
      url: `${origin}/iframe.html?id=${story.id}&viewMode=story&globals=locale:${locale};preset:${preset}`,
    }))
  )
);

const browser = await chromium.launch({ channel: process.env.AXE_BROWSER_CHANNEL ?? 'chrome' });
const context = await browser.newContext({
  reducedMotion: 'reduce',
  viewport: { width: 1280, height: 720 },
});

const failures = [];

async function check(page, job) {
  await page.goto(job.url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#storybook-root > *', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  // A story that crashed shows Storybook's error screen, not the story.
  if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) {
    failures.push(`${job.name}: the story did not render`);
    return;
  }
  // Scan a settled page. Several pages are checked at once, and a page that is not in front
  // does not advance its clock: a colour transition would sit at its start, where a button is
  // still see-through, and axe would read white text on the page behind it.
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        // An endless animation cannot be finished; with reduced motion there is none.
      }
    }
  });
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
  for (const violation of violations) {
    const where = violation.nodes.map((node) => node.target.join(' ')).join(', ');
    failures.push(`${job.name}: ${violation.id} (${violation.help}) at ${where}`);
  }
}

let next = 0;
async function worker() {
  const page = await context.newPage();
  while (next < jobs.length) {
    const job = jobs[next];
    next += 1;
    try {
      await check(page, job);
    } catch (error) {
      failures.push(
        `${job.name}: ${error instanceof Error ? error.message.split('\n')[0] : error}`
      );
    }
  }
  await page.close();
}

const started = Date.now();
await Promise.all(Array.from({ length: PAGES_AT_ONCE }, worker));
await browser.close();
server.close();

const seconds = Math.round((Date.now() - started) / 1000);
if (failures.length > 0) {
  console.error(`axe: ${failures.length} problem(s) in ${jobs.length} checks (${seconds} s)`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}
console.log(
  `axe: ${jobs.length} checks (${stories.length} stories, ${LOCALES.length} languages, ` +
    `${quick ? 1 : PRESETS.length} preset(s)), no violations (${seconds} s)`
);
