import { expect, test } from '@playwright/test';
// @ts-expect-error: a plain JavaScript helper of the scripts, without types.
import { openStory, serveStorybook, storyUrl } from '../../scripts/lib/storybook-server.mjs';
import { axeFindings } from '../support';
import { sidewaysScroll, smallTargets } from './checks';

// Every story of the built Storybook at the phone size of the project, in English and Arabic:
// nothing sideways, 48 px tap targets, axe clean (WCAG 2.2 AA). Run `yarn storybook:build` first.

interface Story {
  id: string;
}

let server: { origin: string; stories: Story[]; close: () => void };

test.beforeAll(async () => {
  server = await serveStorybook('phone stories');
});

test.afterAll(() => server?.close());

test('every story fits the phone, with 48 px targets and no axe finding', async ({ page }) => {
  test.setTimeout(10 * 60_000);
  const problems: string[] = [];
  for (const story of server.stories) {
    for (const locale of ['en', 'ar']) {
      const where = `${story.id} (${locale})`;
      await openStory(page, storyUrl(server.origin, story.id, { locale }));
      const sideways = await sidewaysScroll(page);
      if (sideways > 0) {
        problems.push(`${where}: scrolls sideways by ${sideways} px`);
      }
      for (const small of await smallTargets(page)) {
        problems.push(`${where}: small target ${small}`);
      }
      for (const finding of await axeFindings(page)) {
        problems.push(`${where}: axe ${finding}`);
      }
    }
  }
  expect(problems).toEqual([]);
});
