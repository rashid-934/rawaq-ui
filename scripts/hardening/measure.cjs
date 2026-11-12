// Measures a built Next.js app (the Rawaq UI starter) on this computer.
//   node measure.cjs <app dir> <out.json> [--lighthouse] [--pages=/en,/en/suppliers]
// It starts `next start` itself, measures, and stops it again.
//  - JS, CSS and font bytes each page downloads on first load (what "First Load JS" used to say)
//  - LCP and CLS of the load; the slowest interaction (an INP stand-in) for "Show labels"
//  - with the processor slowed 4 times: long tasks of the load, and the smooth gate for the
//    "Show labels" slide and the glow slide (no long task and no frame gap over 50 ms)
//  - Lighthouse (desktop, 1280 x 720), median of 3, through `yarn dlx` (nothing installed)
const { execSync, spawn } = require('node:child_process');
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { chromium } = require('playwright-core');

const app = resolve(process.argv[2]);
const out = resolve(process.argv[3]);
const withLighthouse = process.argv.includes('--lighthouse');
const pagesArg = process.argv.find((arg) => arg.startsWith('--pages='));
// Pages are given without the first slash (`--pages=en,en/suppliers`): Git Bash on Windows
// rewrites an argument that starts with a slash into a folder path.
const PAGES = pagesArg
  ? pagesArg
      .slice(8)
      .split(',')
      .map((page) => `/${page.replace(/^\/+/, '')}`)
  : ['/en', '/en/suppliers', '/ar', '/ar/suppliers'];
const LIGHTHOUSE_PAGES = PAGES.filter((path) => path.startsWith('/en'));
const runsArg = process.argv.find((arg) => arg.startsWith('--runs='));
const RUNS = runsArg ? Number(runsArg.slice(7)) : 7;
const PORT = 4311;
const origin = `http://localhost:${PORT}`;
const SLIDE_MS = 250;

const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
const round = (value, digits = 1) => Number(value.toFixed(digits));

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      const response = await fetch(`${origin}${PAGES[0]}`);
      if (response.ok) {
        return;
      }
    } catch {
      // Not up yet.
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error('the app did not start');
}

async function firstLoad(browser, path) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  const kinds = new Map();
  const bytes = { Script: 0, Stylesheet: 0, Font: 0, Document: 0, Other: 0 };
  const counts = { Script: 0, Stylesheet: 0, Font: 0 };
  const failed = [];
  const headers = new Map();
  client.on('Network.responseReceived', (event) => {
    kinds.set(event.requestId, event.type);
    // Bytes so far are the response headers: they are not part of the file.
    headers.set(event.requestId, event.response.encodedDataLength ?? 0);
    if (event.response.status >= 400) {
      failed.push(`${event.response.status} ${event.response.url}`);
    }
  });
  client.on('Network.loadingFinished', (event) => {
    const kind = kinds.get(event.requestId);
    const key = kind in bytes ? kind : 'Other';
    bytes[key] += Math.max(0, event.encodedDataLength - (headers.get(event.requestId) ?? 0));
    if (key in counts) {
      counts[key] += 1;
    }
  });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydrat/i.test(message.text())) {
      errors.push(message.text().slice(0, 200));
    }
  });
  page.on('pageerror', (error) => errors.push(String(error).slice(0, 200)));
  await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const vitals = await page.evaluate(
    () =>
      new Promise((done) => {
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            lcp = entry.startTime;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => done({ lcp, cls }), 300);
      })
  );
  await context.close();
  return {
    jsBytes: bytes.Script,
    jsFiles: counts.Script,
    cssBytes: bytes.Stylesheet,
    fontBytes: bytes.Font,
    fontFiles: counts.Font,
    lcpMs: round(vitals.lcp),
    cls: round(vitals.cls, 4),
    consoleErrors: errors,
    failedRequests: failed,
  };
}

/** Frames and long tasks around one action (a click), from the click to SLIDE_MS after it. */
async function watch(page, action) {
  await page.evaluate(() => {
    window.__frames = [];
    window.__long = [];
    window.__events = [];
    window.__clicked = null;
    window.__watch = true;
    window.__observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          window.__long.push({ start: entry.startTime, duration: entry.duration });
        } else if (entry.interactionId) {
          window.__events.push(entry.duration);
        }
      }
    });
    window.__observer.observe({ type: 'longtask' });
    window.__observer.observe({ type: 'event', durationThreshold: 16 });
    addEventListener(
      'pointerdown',
      () => {
        window.__clicked = performance.now();
      },
      { capture: true, once: true }
    );
    const tick = (time) => {
      window.__frames.push(time);
      if (window.__watch) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
  await page.waitForTimeout(300);
  await action();
  await page.waitForTimeout(900);
  return page.evaluate((slide) => {
    window.__watch = false;
    window.__observer.disconnect();
    const from = window.__clicked;
    if (from === null) {
      return { error: 'no click seen' };
    }
    const to = from + slide;
    const frames = window.__frames.filter((time) => time >= from && time <= to);
    const points = [from, ...frames];
    const gaps = points.slice(1).map((time, index) => time - points[index]);
    const long = window.__long.filter(
      (task) => task.start < to && task.start + task.duration > from
    );
    const sorted = [...gaps].sort((a, b) => a - b);
    return {
      frames: frames.length,
      gaps: gaps.map((gap) => Math.round(gap)),
      maxGapMs: Math.round(Math.max(0, ...gaps) * 10) / 10,
      medianGapMs: Math.round((sorted[Math.floor(sorted.length / 2)] ?? 0) * 10) / 10,
      longTasks: long.length,
      longestTaskMs: Math.round(Math.max(0, ...long.map((task) => task.duration))),
      interactionMs: Math.max(0, ...window.__events),
    };
  }, SLIDE_MS);
}

async function throttled(browser, path, rate) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate });
  await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const load = await page.evaluate(
    () =>
      new Promise((done) => {
        const tasks = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            tasks.push(entry.duration);
          }
        }).observe({ type: 'longtask', buffered: true });
        setTimeout(
          () =>
            done({
              longTasks: tasks.length,
              over200: tasks.filter((duration) => duration > 200).length,
              longestMs: Math.round(Math.max(0, ...tasks)),
            }),
          300
        );
      })
  );
  await client.send('Performance.enable');
  const work = async () =>
    Object.fromEntries(
      (await client.send('Performance.getMetrics')).metrics.map((item) => [item.name, item.value])
    );
  // What the browser did for one action, in milliseconds (already slowed by the throttle).
  const worked = async (action) => {
    const before = await work();
    const seen = await action();
    const after = await work();
    const ms = (name) => Math.round((after[name] - before[name]) * 1000);
    return {
      ...seen,
      scriptMs: ms('ScriptDuration'),
      layoutMs: ms('LayoutDuration'),
      styleMs: ms('RecalcStyleDuration'),
      layouts: after.LayoutCount - before.LayoutCount,
    };
  };
  const toggle = page.getByTestId('rail-labels');
  const open = await worked(() => watch(page, () => toggle.click()));
  const close = await worked(() => watch(page, () => toggle.click()));
  // The glow slide: a click on another rail entry (the page changes with it).
  const other = page.locator('[data-rail-item]:not([aria-current])').first();
  const glow = (await other.count()) > 0 ? await watch(page, () => other.click()) : null;
  await context.close();
  return { load, showLabelsOpen: open, showLabelsClose: close, glowSlide: glow };
}

/** The same throttled visit several times: one visit alone is too noisy to judge a 50 ms gate. */
async function repeated(browser, path, rate, times) {
  const visits = [];
  for (let visit = 0; visit < times; visit += 1) {
    visits.push(await throttled(browser, path, rate));
  }
  const of = (key) => {
    const list = visits.map((item) => item[key]).filter((item) => item && !item.error);
    const gaps = list.map((item) => item.maxGapMs);
    return {
      visits: list.length,
      passes: list.filter((item) => item.maxGapMs <= 50 && item.longTasks === 0).length,
      worstGapMs: Math.max(0, ...gaps),
      medianGapMs: median(gaps),
      longTasks: list.reduce((sum, item) => sum + item.longTasks, 0),
      longestTaskMs: Math.max(0, ...list.map((item) => item.longestTaskMs)),
      slowestInteractionMs: Math.max(0, ...list.map((item) => item.interactionMs)),
      medianScriptMs: median(list.map((item) => item.scriptMs ?? 0)),
      medianLayoutMs: median(list.map((item) => item.layoutMs ?? 0)),
      medianStyleMs: median(list.map((item) => item.styleMs ?? 0)),
      medianLayouts: median(list.map((item) => item.layouts ?? 0)),
      gapsOfOneVisit: list[0]?.gaps,
    };
  };
  return {
    load: {
      longestMs: Math.max(...visits.map((item) => item.load.longestMs)),
      medianLongestMs: median(visits.map((item) => item.load.longestMs)),
      over200: Math.max(...visits.map((item) => item.load.over200)),
    },
    showLabelsOpen: of('showLabelsOpen'),
    showLabelsClose: of('showLabelsClose'),
    glowSlide: of('glowSlide'),
  };
}

function lighthouse(path, folder) {
  const runs = [];
  for (let run = 1; run <= 3; run += 1) {
    const file = join(folder, `lh${path.replaceAll('/', '_')}_${run}.json`);
    execSync(
      `corepack yarn dlx -q lighthouse@12.8.2 ${origin}${path} --preset=desktop ` +
        '--only-categories=performance,accessibility --output=json ' +
        `--output-path="${file}" --quiet --screenEmulation.width=1280 ` +
        '--screenEmulation.height=720 --screenEmulation.deviceScaleFactor=1 ' +
        '--chrome-flags="--headless=new"',
      { cwd: folder, stdio: 'ignore', shell: true }
    );
    const report = JSON.parse(readFileSync(file, 'utf8'));
    runs.push({
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      lcpMs: Math.round(report.audits['largest-contentful-paint'].numericValue),
      cls: round(report.audits['cumulative-layout-shift'].numericValue, 4),
      tbtMs: Math.round(report.audits['total-blocking-time'].numericValue),
      failedAccessibility: Object.values(report.audits)
        .filter(
          (audit) =>
            audit.score === 0 &&
            report.categories.accessibility.auditRefs.some((ref) => ref.id === audit.id)
        )
        .map((audit) => audit.id),
    });
  }
  return {
    performance: median(runs.map((run) => run.performance)),
    accessibility: median(runs.map((run) => run.accessibility)),
    lcpMs: median(runs.map((run) => run.lcpMs)),
    cls: median(runs.map((run) => run.cls)),
    tbtMs: median(runs.map((run) => run.tbtMs)),
    failedAccessibility: [...new Set(runs.flatMap((run) => run.failedAccessibility))],
    runs,
  };
}

(async () => {
  const server = spawn(
    process.execPath,
    [join(app, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(PORT)],
    { cwd: app, stdio: 'inherit', env: { ...process.env, ...JSON.parse(process.env.APP_ENV || '{}') } }
  );
  const result = { app, pages: {}, cpu4x: {}, cpu1x: {}, lighthouse: {} };
  try {
    await waitForServer();
    const browser = await chromium.launch({ channel: 'chrome' });
    for (const path of PAGES) {
      // The first load of a page warms the server; the numbers come from the three after it.
      await firstLoad(browser, path);
      const loads = [];
      for (let run = 0; run < 3; run += 1) {
        loads.push(await firstLoad(browser, path));
      }
      result.pages[path] = {
        ...loads[0],
        lcpMs: median(loads.map((load) => load.lcpMs)),
        cls: Math.max(...loads.map((load) => load.cls)),
        consoleErrors: [...new Set(loads.flatMap((load) => load.consoleErrors))],
        failedRequests: [...new Set(loads.flatMap((load) => load.failedRequests))],
      };
      result.cpu4x[path] = await repeated(browser, path, 4, RUNS);
      result.cpu1x[path] = await repeated(browser, path, 1, 2);
      console.log(`measured ${path}`);
    }
    await browser.close();
    if (withLighthouse) {
      const folder = join(resolve(out, '..'), 'lh');
      mkdirSync(folder, { recursive: true });
      for (const path of LIGHTHOUSE_PAGES) {
        result.lighthouse[path] = lighthouse(path, folder);
        console.log(`lighthouse ${path}: ${JSON.stringify({ ...result.lighthouse[path], runs: undefined })}`);
      }
    }
  } finally {
    server.kill();
  }
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ pages: result.pages, cpu4x: result.cpu4x, cpu1x: result.cpu1x }, null, 1));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
