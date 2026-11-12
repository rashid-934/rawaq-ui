// Browser tests on the starter app (examples/starter), built against this branch's package.
//
//   yarn build && yarn pack -o rawaq-ui-local.tgz      the package as a file
//   (examples/starter) point "rawaq-ui" at file:../../rawaq-ui-local.tgz, yarn install, yarn build
//   yarn e2e                                            the tests (they start `next start`)
//
// The CI job does the same in its own work folder; the starter in the repository keeps the
// release address. On this laptop the tests use the Chrome that is installed (no download). In CI
// (Linux runners only) they run on Chromium, Firefox and WebKit: E2E_BROWSERS=chromium,firefox,webkit.
import { defineConfig, devices, type Project } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4320);
const ci = Boolean(process.env.CI);
const wanted = (process.env.E2E_BROWSERS ?? 'chromium').split(',').map((name) => name.trim());

const browsers: Record<string, Project> = {
  chromium: {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      // In CI the Chromium that Playwright installs; here the installed Chrome.
      channel: ci ? undefined : 'chrome',
      // Chrome repaints only the changed parts of a tile while a page loads ("partial raster"),
      // which makes pictures depend on timing. Pictures are taken with whole tiles.
      launchOptions: { args: ['--disable-partial-raster'] },
    },
  },
  firefox: { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  webkit: { name: 'webkit', use: { ...devices['Desktop Safari'] } },
};

// The perf tests (tagged @perf) measure frames: `yarn e2e:perf` runs them alone, one at a time,
// with nothing else next to them. `yarn e2e` runs everything else.
const perf = process.env.E2E_PERF === '1';

export default defineConfig({
  testDir: 'e2e',
  grep: perf ? /@perf/ : undefined,
  grepInvert: perf ? undefined : /@perf/,
  fullyParallel: !perf,
  workers: perf ? 1 : ci ? 2 : 3,
  retries: 0,
  forbidOnly: ci,
  timeout: 60_000,
  reporter: ci ? [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]] : 'list',
  outputDir: 'e2e-results',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The desktop minimum of the design (docs/DESIGN_THEME.md); motion is off unless a test that
    // measures motion turns it on for itself.
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: wanted.map((name) => {
    const project = browsers[name];
    if (!project) {
      throw new Error(`Unknown browser "${name}" in E2E_BROWSERS (chromium, firefox, webkit).`);
    }
    return project;
  }),
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    cwd: 'examples/starter',
    url: `http://localhost:${PORT}/en`,
    // The gallery answers 404 in production unless the server is started with RAWAQ_GALLERY=1.
    env: { RAWAQ_GALLERY: '1' },
    reuseExistingServer: !ci,
    timeout: 120_000,
  },
});
