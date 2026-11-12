// Comfort and accessibility checks on the built Storybook, in a real browser (the installed Chrome).
//
//   yarn storybook:build && yarn comfort          every check
//   yarn comfort --only=layout,targets            some checks
//   yarn comfort --quick                          the default preset only
//
// layout    every story x 7 presets x 2 densities x English and Arabic, at 1280 x 720 and
//           1920 x 1080: no sideways scroll, no cut text, no scroll area inside the scrolling page
// targets   WCAG 2.5.8: every control is at least 24 x 24 px, or has room around it
// keyboard  Tab through the screens: the focus never hides under something (WCAG 2.4.11), it is
//           always visible, it never gets stuck, and a rail entry shows its name on focus
// zoom      WCAG 1.4.4: a 1280 x 720 window zoomed to 200 percent (640 x 360): no cut text, all
//           text within reach, and the menu opens, takes the focus and closes with the keyboard
// forced    Windows high contrast: the focus ring and the active rail entry stay visible
// motion    right to left: every moving part is measured at its start, half way and its end, in
//           English and in Arabic (motion on)
//
// Pictures are not taken here (scripts/hardening/shots.cjs). It writes no files.
import { chromium } from 'playwright-core';
import {
  DENSITIES,
  LOCALES,
  openStory,
  PRESETS,
  runJobs,
  serveStorybook,
  storyUrl,
} from './lib/storybook-server.mjs';

const CHECKS = ['layout', 'targets', 'keyboard', 'zoom', 'forced', 'motion'];
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const only = onlyArg ? onlyArg.slice(7).split(',') : CHECKS;
const quick = process.argv.includes('--quick');
const presets = quick ? PRESETS.slice(0, 1) : PRESETS;

/** Screens with the rail and the frame, where the keyboard has the most to do. */
const SCREENS = [
  'screens--overview',
  'screens--work-page-with-table',
  'screens--form-page',
  'screens--with-labels',
];

// Helpers that run inside the page. Kept in one string so every page gets the same ones.
const HELPERS = `
window.__rq = (() => {
  const describe = (el) => {
    if (!el || !el.tagName) return String(el);
    const test = el.dataset && el.dataset.testid ? '[data-testid=' + el.dataset.testid + ']' : '';
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\\s+/)[0] : '';
    const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30);
    return el.tagName.toLowerCase() + test + cls + (text ? ' "' + text + '"' : '');
  };
  const hidden = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return true;
      if (n.hasAttribute('inert') || n.getAttribute('aria-hidden') === 'true') return true;
    }
    return false;
  };
  const texts = () => {
    const out = [];
    const root = document.getElementById('storybook-root');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      const el = node.parentElement;
      if (!el || hidden(el)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width > 0.5 && r.height > 0.5) out.push({ el, r });
      }
    }
    return out;
  };
  const clipsOnPurpose = (box) => box.width <= 1 || box.height <= 1;
  return {
    describe,
    sideways() {
      const d = document.scrollingElement;
      return d.scrollWidth > d.clientWidth + 1
        ? ['sideways scroll: the page is ' + d.scrollWidth + ' px wide in a ' + d.clientWidth + ' px window']
        : [];
    },
    cutText() {
      const found = new Set();
      for (const { el, r } of texts()) {
        for (let a = el; a && a !== document.body; a = a.parentElement) {
          const s = getComputedStyle(a);
          const clipX = /hidden|clip/.test(s.overflowX);
          const clipY = /hidden|clip/.test(s.overflowY);
          if (!clipX && !clipY) continue;
          const box = a.getBoundingClientRect();
          // A 1 px box (screen reader text) or a designed ellipsis is not cut text.
          if (clipsOnPurpose(box) || s.textOverflow === 'ellipsis') break;
          const outX = clipX && (r.left < box.left - 1 || r.right > box.right + 1);
          const outY = clipY && (r.top < box.top - 1 || r.bottom > box.bottom + 1);
          if (outX || outY) {
            found.add('cut text: ' + describe(el) + ' in ' + describe(a));
            break;
          }
        }
      }
      return [...found];
    },
    doubleScroll() {
      const d = document.scrollingElement;
      if (d.scrollHeight <= d.clientHeight + 1) return [];
      const found = [];
      for (const el of document.querySelectorAll('#storybook-root *')) {
        const s = getComputedStyle(el);
        if (!/auto|scroll/.test(s.overflowY) || el.scrollHeight <= el.clientHeight + 1) continue;
        if (el.clientHeight < innerHeight / 2 || hidden(el)) continue;
        // A fixed part (the rail) does not move with the page: its own list may scroll.
        let fixed = false;
        for (let n = el; n; n = n.parentElement) {
          if (getComputedStyle(n).position === 'fixed') fixed = true;
        }
        if (!fixed) found.push('a scroll area inside the scrolling page: ' + describe(el));
      }
      return found;
    },
    targets() {
      const selector = 'a[href], button, input:not([type=hidden]), select, textarea, summary, ' +
        '[role=button], [role=link], [role=tab], [role=checkbox], [role=radio], [role=switch], ' +
        '[role=menuitem], [tabindex]:not([tabindex="-1"])';
      const items = [...document.querySelectorAll(selector)]
        .filter((el) => !el.disabled && !hidden(el))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 1 && r.height > 1);
      // A link inside a sentence is the "inline" exception of WCAG 2.5.8.
      const inline = (el) => el.tagName === 'A' && getComputedStyle(el).display === 'inline' &&
        [...el.parentElement.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim());
      const small = items.filter(({ el, r }) => (r.width < 23.99 || r.height < 23.99) && !inline(el));
      const centre = (r) => [r.left + r.width / 2, r.top + r.height / 2];
      const touches = ([x, y], r) => {
        const nx = Math.max(r.left, Math.min(x, r.right));
        const ny = Math.max(r.top, Math.min(y, r.bottom));
        return (nx - x) ** 2 + (ny - y) ** 2 < 144;
      };
      const found = [];
      for (const t of small) {
        const c = centre(t.r);
        // The spacing exception: a 24 px circle on the target touches no other target and no
        // other small target's circle.
        const clash = items.find((o) => o.el !== t.el && !o.el.contains(t.el) && !t.el.contains(o.el) &&
          (touches(c, o.r) || (small.includes(o) && Math.hypot(c[0] - centre(o.r)[0], c[1] - centre(o.r)[1]) < 24)));
        if (clash) {
          found.push('target ' + Math.round(t.r.width) + ' x ' + Math.round(t.r.height) + ' px: ' +
            describe(t.el) + ' is too close to ' + describe(clash.el));
        }
      }
      return found;
    },
    reachable() {
      const d = document.scrollingElement;
      const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      const minX = rtl ? d.clientWidth - d.scrollWidth : 0;
      const maxX = rtl ? d.clientWidth : d.scrollWidth;
      const found = new Set();
      for (const { el, r } of texts()) {
        // A link or button that waits off screen until it has the focus (the skip link) is
        // checked by the keyboard walk instead.
        if (el.closest('a[href], button')) continue;
        let fixed = false;
        for (let n = el; n; n = n.parentElement) {
          if (getComputedStyle(n).position === 'fixed') fixed = true;
        }
        const out = fixed
          ? r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight
          : r.right + scrollX < minX - 1 || r.left + scrollX > maxX + 1 || r.bottom + scrollY < -1;
        if (out) found.add('out of reach: ' + describe(el));
      }
      return [...found];
    },
    focus() {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      if (!el.dataset.rqFocus) el.dataset.rqFocus = String(Math.random()).slice(2);
      // What the focus starts (the skip link sliding in) is measured where it ends.
      for (const animation of document.getAnimations()) {
        try { animation.finish(); } catch {}
      }
      const found = [];
      const s = getComputedStyle(el);
      const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1) ||
        (s.boxShadow && s.boxShadow !== 'none');
      if (!ring) found.push('no visible focus ring on ' + describe(el));
      const r = el.getBoundingClientRect();
      const x0 = Math.max(r.left + 2, 0);
      const x1 = Math.min(r.right - 2, innerWidth - 1);
      const y0 = Math.max(r.top + 2, 0);
      const y1 = Math.min(r.bottom - 2, innerHeight - 1);
      if (x1 < x0 || y1 < y0) {
        found.push('the focus is off screen: ' + describe(el));
      } else {
        const points = [];
        for (const fx of [0, 0.5, 1]) for (const fy of [0, 0.5, 1]) {
          points.push([x0 + (x1 - x0) * fx, y0 + (y1 - y0) * fy]);
        }
        const free = points.some(([x, y]) => {
          const top = document.elementFromPoint(x, y);
          return top && (top === el || el.contains(top) || top.contains(el));
        });
        if (!free) {
          found.push('the focused ' + describe(el) + ' is hidden under ' +
            describe(document.elementFromPoint(points[4][0], points[4][1])));
        }
      }
      return {
        key: el.dataset.rqFocus,
        name: describe(el),
        railItem: el.matches('[data-rail-item]') && !el.closest('[data-labels]'),
        // The entry's name only, without its count.
        label: ((el.querySelector('[class*="Rail-label"]') || el).textContent || '').trim(),
        outline: s.outlineStyle + ' ' + s.outlineWidth,
        found,
      };
    },
  };
})();
`;

const failures = [];
const notes = [];
const started = Date.now();
const { origin, stories, close } = await serveStorybook('comfort');
const browser = await chromium.launch({
  channel: process.env.AXE_BROWSER_CHANNEL ?? 'chrome',
  args: ['--disable-partial-raster'],
});

async function contextWith(options) {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 720 },
    ...options,
  });
  await context.addInitScript({ content: HELPERS });
  return context;
}

async function run(check, jobs, fn, options = {}) {
  if (!only.includes(check)) {
    return;
  }
  const context = await contextWith(options);
  const begun = Date.now();
  const found = await runJobs(context, jobs, fn);
  await context.close();
  failures.push(...found.map((line) => `[${check}] ${line}`));
  notes.push(
    `${check}: ${jobs.length} pages, ${found.length} problem(s), ${Math.round((Date.now() - begun) / 1000)} s`
  );
}

const SIZES = [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
];

// layout
await run(
  'layout',
  stories.flatMap((story) =>
    presets.flatMap((preset) =>
      DENSITIES.flatMap((density) =>
        LOCALES.flatMap((locale) =>
          SIZES.map((size) => ({
            name: `${story.id} ${preset} ${density} ${locale} ${size.width}`,
            url: storyUrl(origin, story.id, { locale, preset, density }),
            size,
          }))
        )
      )
    )
  ),
  async (page, job) => {
    await page.setViewportSize(job.size);
    await openStory(page, job.url);
    return page.evaluate(() => [
      ...window.__rq.sideways(),
      ...window.__rq.cutText(),
      ...window.__rq.doubleScroll(),
    ]);
  }
);

// targets
await run(
  'targets',
  stories.flatMap((story) =>
    DENSITIES.flatMap((density) =>
      LOCALES.map((locale) => ({
        name: `${story.id} ${density} ${locale}`,
        url: storyUrl(origin, story.id, { locale, density }),
      }))
    )
  ),
  async (page, job) => {
    await openStory(page, job.url);
    return page.evaluate(() => window.__rq.targets());
  }
);

/** Tabs from the top of the page until the focus comes round again; returns what it found. */
async function walk(page, { tooltips = false, max = 120 } = {}) {
  const found = [];
  const seen = new Set();
  let first = null;
  let last = null;
  let same = 0;
  let steps = 0;
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  for (; steps < max; steps += 1) {
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => window.__rq.focus());
    if (!focus) {
      // Past the last element the focus leaves the page: the walk is complete.
      if (first) break;
      continue;
    }
    if (focus.key === first) break;
    first ??= focus.key;
    same = focus.key === last ? same + 1 : 0;
    if (same >= 2) {
      found.push(`the focus is stuck on ${focus.name}`);
      break;
    }
    last = focus.key;
    seen.add(focus.key);
    found.push(...focus.found);
    if (tooltips && focus.railItem) {
      const label = focus.label;
      const shown = await page
        .waitForFunction(
          (text) =>
            [...document.querySelectorAll('[role=tooltip]')].some(
              (tip) => tip.textContent.trim() === text && tip.getBoundingClientRect().width > 0
            ),
          label,
          { timeout: 1500 }
        )
        .then(() => true)
        .catch(() => false);
      if (!shown) found.push(`no tooltip on focus for the rail entry "${label}"`);
    }
  }
  if (steps >= max) found.push(`the walk did not come round after ${max} steps`);
  return { found, count: seen.size };
}

// keyboard
await run(
  'keyboard',
  [...SCREENS, 'components--empty-states'].flatMap((id) =>
    DENSITIES.flatMap((density) =>
      LOCALES.map((locale) => ({
        name: `${id} ${density} ${locale}`,
        url: storyUrl(origin, id, { locale, density }),
      }))
    )
  ),
  async (page, job) => {
    await openStory(page, job.url);
    const { found, count } = await walk(page, { tooltips: true });
    if (count < 3) found.push(`only ${count} focusable element(s) reached`);
    return found;
  },
  {}
);

// zoom: 200 percent of a 1280 x 720 window
await run(
  'zoom',
  [...SCREENS, 'components--empty-states'].flatMap((id) =>
    LOCALES.map((locale) => ({
      name: `${id} ${locale} 200%`,
      url: storyUrl(origin, id, { locale }),
      menu: SCREENS.includes(id),
    }))
  ),
  async (page, job) => {
    await openStory(page, job.url);
    const found = await page.evaluate(() => [...window.__rq.cutText(), ...window.__rq.reachable()]);
    // Every control the keyboard reaches comes into view and stays visible.
    found.push(...(await walk(page)).found);
    if (!job.menu) {
      return found;
    }
    const button = page.getByTestId('menu-button');
    if ((await button.count()) === 0 || !(await button.isVisible())) {
      return [...found, 'no menu button: the navigation is out of reach'];
    }
    await button.focus();
    await page.keyboard.press('Enter');
    const opened = await page
      .waitForFunction(() => {
        const nav = document.querySelector('nav[data-open]');
        return nav && nav.contains(document.activeElement);
      })
      .then(() => true)
      .catch(() => false);
    if (!opened) {
      return [...found, 'the menu did not open with the keyboard or did not take the focus'];
    }
    // The page behind an open drawer is out of reach (inert); Esc closes it.
    await page.keyboard.press('Escape');
    const closed = await page
      .waitForFunction(
        () =>
          !document.querySelector('nav[data-open]') &&
          document.activeElement?.dataset?.testid === 'menu-button'
      )
      .then(() => true)
      .catch(() => false);
    if (!closed) found.push('Esc did not close the menu or the focus did not come back');
    return found;
  },
  { viewport: { width: 640, height: 360 }, deviceScaleFactor: 2 }
);

// forced colours
await run(
  'forced',
  ['screens--work-page-with-table', 'screens--with-labels'].flatMap((id) =>
    LOCALES.map((locale) => ({
      name: `${id} ${locale} forced colours`,
      url: storyUrl(origin, id, { locale }),
    }))
  ),
  async (page, job) => {
    await openStory(page, job.url);
    const found = await page.evaluate(() => {
      const active = document.querySelector('[data-rail-item][aria-current="page"]');
      if (!active) return ['no active rail entry'];
      const s = getComputedStyle(active);
      return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1
        ? []
        : [`the active rail entry has no outline (${s.outlineStyle} ${s.outlineWidth})`];
    });
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => window.__rq.focus());
      // Box shadows are not drawn in forced colours: the ring must be an outline.
      if (focus && !/^(solid|auto|dotted|dashed|double)/.test(focus.outline)) {
        found.push(`no outline focus ring on ${focus.name} (${focus.outline})`);
      }
    }
    return found;
  },
  { forcedColors: 'active' }
);

// motion: right to left, measured
if (only.includes('motion')) {
  const context = await contextWith({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const rect = (selector) =>
    page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width };
    }, selector);
  const round = (r) =>
    r ? `${Math.round(r.left)}..${Math.round(r.right)} x ${Math.round(r.top)}` : 'none';
  const measured = [];
  const settle = () => page.waitForTimeout(600);
  const half = () => page.waitForTimeout(90);

  for (const locale of LOCALES) {
    const rtl = locale !== 'en';
    const tag = (what) => `motion ${locale}: ${what}`;

    // The glow slides along the rail to the entry that was clicked.
    await openStory(page, storyUrl(origin, 'screens--work-page-with-table', { locale }));
    await settle();
    const rail = await rect('nav[id]');
    const start = await rect('[data-testid=rail-glow]');
    const target = await rect('[data-testid=nav-reports]');
    await page.getByTestId('nav-reports').click();
    await half();
    const mid = await rect('[data-testid=rail-glow]');
    await settle();
    const end = await rect('[data-testid=rail-glow]');
    measured.push(tag(`glow ${round(start)} -> ${round(mid)} -> ${round(end)}`));
    if (!start || !mid || !end || !target || !rail) {
      failures.push(`[motion] ${tag('the glow or the rail is missing')}`);
    } else {
      if (Math.abs(mid.left - start.left) > 1) {
        failures.push(`[motion] ${tag('the glow moves sideways while it slides')}`);
      }
      if (!(mid.top > Math.min(start.top, end.top) && mid.top < Math.max(start.top, end.top))) {
        failures.push(`[motion] ${tag('the glow is not between its start and its end half way')}`);
      }
      if (Math.abs((end.top + end.bottom) / 2 - (target.top + target.bottom) / 2) > 1) {
        failures.push(`[motion] ${tag('the glow does not end on the entry that was clicked')}`);
      }
      if (end.left < rail.left - 1 || end.right > rail.right + 13) {
        failures.push(`[motion] ${tag('the glow leaves the rail')}`);
      }
    }

    // The tooltip opens toward the page.
    await page.getByTestId('nav-requests').hover();
    await page.waitForSelector('[role=tooltip]', { state: 'visible' });
    await settle();
    const item = await rect('[data-testid=nav-requests]');
    const tip = await rect('[role=tooltip]');
    measured.push(tag(`tooltip ${round(tip)} beside entry ${round(item)}`));
    if (!tip || !item || (rtl ? tip.right > item.left : tip.left < item.right)) {
      failures.push(`[motion] ${tag('the tooltip does not open toward the page')}`);
    }
    await page.mouse.move(640, 400);

    // "Show labels" widens the rail from its outer side and pushes the frame toward the end.
    const railBefore = await rect('nav[id]');
    const frameBefore = await rect('[data-testid=frame-ring]');
    await page.getByTestId('rail-labels').click();
    await half();
    const frameMid = await rect('[data-testid=frame-ring]');
    await settle();
    const railAfter = await rect('nav[id]');
    const frameAfter = await rect('[data-testid=frame-ring]');
    measured.push(
      tag(
        `show labels: rail ${round(railBefore)} -> ${round(railAfter)}, frame ${round(frameBefore)} -> ${round(frameMid)} -> ${round(frameAfter)}`
      )
    );
    const outer = rtl ? 'right' : 'left';
    const inner = rtl ? 'left' : 'right';
    const grows = rtl ? railAfter.left < railBefore.left : railAfter.right > railBefore.right;
    const pushed = rtl
      ? frameAfter.right < frameBefore.right &&
        frameMid.right < frameBefore.right &&
        frameMid.right > frameAfter.right
      : frameAfter.left > frameBefore.left &&
        frameMid.left > frameBefore.left &&
        frameMid.left < frameAfter.left;
    if (Math.abs(railAfter[outer] - railBefore[outer]) > 1 || !grows) {
      failures.push(`[motion] ${tag(`the rail does not widen from its ${inner} side`)}`);
    }
    if (!pushed) {
      failures.push(`[motion] ${tag('the frame is not pushed toward the end, step by step')}`);
    }

    // The entrance rise of the Overview cards is vertical only, the same in both directions.
    await page.goto('about:blank');
    await page.goto(storyUrl(origin, 'screens--overview', { locale }), { waitUntil: 'commit' });
    const rise = await page
      .waitForFunction(
        () => {
          const moving = document
            .getAnimations()
            .find((a) => a.effect?.target && /rise/i.test(a.animationName ?? ''));
          if (!moving) return null;
          const m = new DOMMatrix(getComputedStyle(moving.effect.target).transform);
          return { x: m.m41, y: m.m42, name: moving.animationName };
        },
        null,
        { timeout: 5000, polling: 'raf' }
      )
      .then((handle) => handle.jsonValue())
      .catch(() => null);
    measured.push(
      tag(`entrance rise ${rise ? `${rise.name} at x ${rise.x}, y ${rise.y}` : 'not seen'}`)
    );
    if (rise && Math.abs(rise.x) > 0.01) {
      failures.push(`[motion] ${tag('the entrance rise moves sideways')}`);
    }
  }

  // The drawer slides in from the start side (a narrow window).
  await page.setViewportSize({ width: 700, height: 720 });
  for (const locale of LOCALES) {
    const rtl = locale !== 'en';
    const tag = (what) => `motion ${locale}: ${what}`;
    await openStory(page, storyUrl(origin, 'screens--work-page-with-table', { locale }));
    await settle();
    const closed = await rect('nav[id]');
    await page.getByTestId('menu-button').click();
    await half();
    const mid = await rect('nav[id]');
    await settle();
    const open = await rect('nav[id]');
    measured.push(tag(`drawer ${round(closed)} -> ${round(mid)} -> ${round(open)}`));
    const ok = rtl
      ? closed.left >= 699 &&
        open.right <= 701 &&
        open.right >= 690 &&
        mid.left < closed.left &&
        mid.left > open.left
      : closed.right <= 1 &&
        open.left >= -1 &&
        open.left <= 10 &&
        mid.right > closed.right &&
        mid.right < open.right;
    if (!ok) failures.push(`[motion] ${tag('the drawer does not slide in from the start side')}`);
  }
  await context.close();
  notes.push(...measured.map((line) => `  ${line}`));
  notes.push(
    'motion: the pill tab slide is not a part of the package (no tabs part yet), so not measured'
  );
}

await browser.close();
close();

for (const note of notes) {
  console.log(note);
}
const seconds = Math.round((Date.now() - started) / 1000);
if (failures.length > 0) {
  console.error(`comfort: ${failures.length} problem(s) (${seconds} s)`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}
console.log(`comfort: no problems (${seconds} s)`);
