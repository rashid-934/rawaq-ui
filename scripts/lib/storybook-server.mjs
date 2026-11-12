// A tiny file server for the built Storybook, on this computer only, and the list of its stories.
// Used by `yarn axe` and `yarn comfort`.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PRESETS = [
  'sand-forest',
  'stone-navy',
  'pearl-teal',
  'linen-burgundy',
  'graphite-amber',
  'slate-gray',
  'onyx-black',
];
export const DENSITIES = ['compact', 'comfortable'];
export const LOCALES = ['en', 'ar'];

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

/**
 * Serves `storybook-static` on a free port of 127.0.0.1. Stops the process with a message when
 * there is no built Storybook.
 */
export async function serveStorybook(name) {
  const site = fileURLToPath(new URL('../../storybook-static/', import.meta.url));
  const indexFile = join(site, 'index.json');
  if (!existsSync(indexFile)) {
    console.error(`${name}: there is no built Storybook. Run \`yarn storybook:build\` first.`);
    process.exit(1);
  }
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const file = normalize(join(site, path === '/' ? 'index.html' : path));
    // Never serve a file from outside the Storybook folder.
    if (!file.startsWith(site) || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const stories = Object.values(JSON.parse(readFileSync(indexFile, 'utf8')).entries).filter(
    (entry) => entry.type === 'story'
  );
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    stories,
    close: () => server.close(),
  };
}

/** The address of one story with the toolbar's choices. */
export function storyUrl(origin, id, { locale = 'en', preset, density } = {}) {
  const globals = [
    `locale:${locale}`,
    preset ? `preset:${preset}` : null,
    density ? `density:${density}` : null,
  ]
    .filter(Boolean)
    .join(';');
  return `${origin}/iframe.html?id=${id}&viewMode=story&globals=${globals}`;
}

/** Opens a story and waits until it is drawn, its fonts are in and its animations are done. */
export async function openStory(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#storybook-root > *', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  // A story that crashed shows Storybook's error screen, not the story.
  if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) {
    throw new Error('the story did not render');
  }
  // Several pages are checked at once, and a page that is not in front does not advance its
  // clock: a colour transition would sit at its start. Finish everything first.
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        // An endless animation cannot be finished; with reduced motion there is none.
      }
    }
  });
}

/** Runs `check(page, job)` for every job on a few pages at once and collects the failures. */
export async function runJobs(context, jobs, check, pagesAtOnce = 4) {
  const failures = [];
  let next = 0;
  async function worker() {
    const page = await context.newPage();
    while (next < jobs.length) {
      const job = jobs[next];
      next += 1;
      try {
        for (const problem of (await check(page, job)) ?? []) {
          failures.push(`${job.name}: ${problem}`);
        }
      } catch (error) {
        failures.push(
          `${job.name}: ${error instanceof Error ? error.message.split('\n')[0] : error}`
        );
      }
    }
    await page.close();
  }
  await Promise.all(Array.from({ length: pagesAtOnce }, worker));
  return failures;
}
