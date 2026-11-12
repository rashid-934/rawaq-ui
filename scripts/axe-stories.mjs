// Runs axe on every story of the built Storybook: in English and Arabic, in all seven presets and
// both densities, with reduced motion, against the WCAG 2.2 AA rules. Any violation fails the run.
//
//   yarn storybook:build && yarn axe            every story, both languages, seven presets, both
//                                               densities
//   yarn axe --quick                            the default preset and density only (a fast
//                                               local check)
//
// It uses the Chrome that is already installed (no browser download) and writes no files.
import { AxeBuilder } from '@axe-core/playwright';
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

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const quick = process.argv.includes('--quick');
const presets = quick ? PRESETS.slice(0, 1) : PRESETS;
const densities = quick ? DENSITIES.slice(0, 1) : DENSITIES;

const { origin, stories, close } = await serveStorybook('axe');
const jobs = stories.flatMap((story) =>
  LOCALES.flatMap((locale) =>
    presets.flatMap((preset) =>
      densities.map((density) => ({
        name: `${story.title} / ${story.name} (${locale}, ${preset}, ${density})`,
        url: storyUrl(origin, story.id, { locale, preset, density }),
      }))
    )
  )
);

const browser = await chromium.launch({ channel: process.env.AXE_BROWSER_CHANNEL ?? 'chrome' });
const context = await browser.newContext({
  reducedMotion: 'reduce',
  viewport: { width: 1280, height: 720 },
});

const started = Date.now();
const failures = await runJobs(context, jobs, async (page, job) => {
  await openStory(page, job.url);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
  return violations.map(
    (violation) =>
      `${violation.id} (${violation.help}) at ${violation.nodes
        .map((node) => node.target.join(' '))
        .join(', ')}`
  );
});
await browser.close();
close();

const seconds = Math.round((Date.now() - started) / 1000);
if (failures.length > 0) {
  console.error(`axe: ${failures.length} problem(s) in ${jobs.length} checks (${seconds} s)`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}
const densityWord = densities.length === 1 ? 'density' : 'densities';
console.log(
  `axe: ${jobs.length} checks (${stories.length} stories, ${LOCALES.length} languages, ` +
    `${presets.length} preset(s), ${densities.length} ${densityWord}), no violations (${seconds} s)`
);
