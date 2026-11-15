// No flash on first load: with a saved look of Onyx Black, Comfortable and Arabic, the first frame
// the browser paints already has the rail on the right in Onyx colours, and the server's HTML
// alone (scripts off) already has the language, the direction, the colours and the density.
// Chromium only: the frames come from Chrome's own screen recording (DevTools protocol).
import { type Browser, expect, type Page, test } from '@playwright/test';
import { GALLERY, rgbOf, setLook, tokens } from './support';

const LOOK = { preset: 'onyx-black', density: 'comfortable', locale: 'ar' } as const;
const PAGE = `${GALLERY}/work`;
const RAIL = '#gallery-navigation';
const TOLERANCE = 3;

test.skip(({ browserName }) => browserName !== 'chromium', 'Screen recording is Chromium only.');

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Rgb = [number, number, number];

/** Points inside the rail, clear of its rounded ends and of the icons in its middle. */
const railPoints = (box: Box) =>
  [0.3, 0.5, 0.7].map((share) => ({ x: box.x + 5, y: box.y + box.height * share }));

/** The same points mirrored to the other side of the window. */
const mirrored = (box: Box, width: number) =>
  railPoints(box).map((point) => ({ x: width - point.x, y: point.y }));

/** Reads pixels of PNG pictures in a blank page (a canvas), without any library. */
async function pixels(browser: Browser, png: Buffer, points: { x: number; y: number }[]) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(
      async ({ data, at }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${data}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('no canvas');
        }
        context.drawImage(image, 0, 0);
        const all = context.getImageData(0, 0, image.width, image.height).data;
        // A frame of one colour only is not painted yet (a blank window).
        let blank = true;
        for (let index = 4; index < all.length; index += 4) {
          if (all[index] !== all[0] || all[index + 1] !== all[1] || all[index + 2] !== all[2]) {
            blank = false;
            break;
          }
        }
        return {
          blank,
          size: [image.width, image.height],
          colours: at.map(({ x, y }) => {
            return Array.from(
              context.getImageData(Math.round(x), Math.round(y), 1, 1).data.slice(0, 3)
            );
          }),
        };
      },
      { data: png.toString('base64'), at: points }
    );
  } finally {
    await page.close();
  }
}

const near = (colour: number[], expected: Rgb) =>
  colour.every((value, index) => Math.abs(value - (expected[index] ?? 0)) <= TOLERANCE);

/** The first three points are on the rail (Onyx Black), the last three mirrored (no rail). */
function expectRailOnTheRight(colours: number[][]) {
  for (const colour of colours.slice(0, 3)) {
    expect(near(colour, onyx), `rail in Onyx Black at the right: rgb(${colour})`).toBe(true);
  }
  for (const colour of colours.slice(3)) {
    expect(
      near(colour, onyx) || near(colour, sandForest),
      `no rail on the left: rgb(${colour})`
    ).toBe(false);
  }
}

/** The rail's place and colour once everything has run (scripts on). */
async function finalState(page: Page) {
  const rail = page.locator(RAIL);
  await rail.waitFor();
  const box = await rail.boundingBox();
  if (!box) {
    throw new Error('the rail has no box');
  }
  return box;
}

const onyx = rgbOf(tokens.presets[LOOK.preset]?.sidebar ?? '');
const sandForest = rgbOf(tokens.presets[tokens.defaults.preset]?.sidebar ?? '');

test('the first painted frame has the saved look (scripts on)', async ({
  browser,
  context,
  page,
  baseURL,
}) => {
  await setLook(context, baseURL ?? '', LOOK);
  const recording = await context.newCDPSession(page);
  const frames: Buffer[] = [];
  recording.on('Page.screencastFrame', ({ data, sessionId }) => {
    frames.push(Buffer.from(data, 'base64'));
    void recording.send('Page.screencastFrameAck', { sessionId }).catch(() => undefined);
  });
  await page.goto('about:blank');
  await recording.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  await page.goto(PAGE);
  const box = await finalState(page);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await recording.send('Page.stopScreencast');

  const width = page.viewportSize()?.width ?? 1280;
  // The rail sits on the right in Arabic.
  expect(box.x).toBeGreaterThan(width / 2);
  // The first frames may still be the blank page that was open before: skip frames of one colour.
  let first: Awaited<ReturnType<typeof pixels>> | undefined;
  for (const frame of frames) {
    const seen = await pixels(browser, frame, [...railPoints(box), ...mirrored(box, width)]);
    if (!seen.blank) {
      first = seen;
      break;
    }
  }
  expect(first, `a painted frame among ${frames.length}`).toBeDefined();
  if (!first) {
    return;
  }
  // The recording has the window's size, so the points need no scaling.
  expect(first.size).toEqual([width, page.viewportSize()?.height ?? 720]);
  expectRailOnTheRight(first.colours);
});

test('the server HTML alone has the saved look (scripts off)', async ({ browser, baseURL }) => {
  const viewport = { width: 1280, height: 720 };
  const withScripts = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const noScripts = await browser.newContext({
    viewport,
    reducedMotion: 'reduce',
    javaScriptEnabled: false,
  });
  try {
    await setLook(withScripts, baseURL ?? '', LOOK);
    await setLook(noScripts, baseURL ?? '', LOOK);
    const live = await withScripts.newPage();
    await live.goto(PAGE);
    const liveBox = await finalState(live);

    const page = await noScripts.newPage();
    await page.goto(PAGE);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const box = await finalState(page);
    // The same place as with scripts, on the right.
    expect(Math.round(box.x)).toBe(Math.round(liveBox.x));
    expect(box.x).toBeGreaterThan(viewport.width / 2);

    // Colours and density come from the server's CSS variables, the same as with scripts on.
    const read = (target: Page) =>
      target.evaluate((rail) => {
        const root = getComputedStyle(document.documentElement);
        const element = document.querySelector(rail);
        return {
          sidebar: root.getPropertyValue('--app-sidebar').trim().toLowerCase(),
          spacing: root.getPropertyValue('--mantine-spacing-md').trim(),
          railColour: element ? getComputedStyle(element).backgroundColor : '',
        };
      }, RAIL);
    const server = await read(page);
    expect(server).toEqual(await read(live));
    expect(server.sidebar).toBe(tokens.presets[LOOK.preset]?.sidebar.toLowerCase());
    expect(server.railColour).toBe(`rgb(${onyx.join(', ')})`);
    // Comfortable spacing (16px at md; Compact has 12px), written in rem.
    const md = tokens.density[LOOK.density]?.spacing.md ?? '';
    expect(server.spacing).toContain(String(Number.parseFloat(md) / 16));

    // And painted: the rail on the right in Onyx colours.
    const shot = await page.screenshot();
    const seen = await pixels(browser, shot, [
      ...railPoints(box),
      ...mirrored(box, viewport.width),
    ]);
    expectRailOnTheRight(seen.colours);
  } finally {
    await withScripts.close();
    await noScripts.close();
  }
});
