# Progress

## Status note, 12 Nov 2026 (hardening pass, stage A done: pull request 7, version 1.1.0)

The owner approved a hardening pass on 12 Nov 2026 (no change to colours, layout, spacing, fonts
or shapes; smoother motion, less weight, fewer bugs, safety, everything tested twice). It has two
stages: **A** this package (it becomes version 1.1.0), then **B** the app Hub-P-. The approved
plan with its 14 additions is on the owner's laptop:
`C:\Users\Rashid Akbar\.claude\plans\pasted-content-id-cc52-task-rawaq-compiled-nova.md`.

**Pull request 5 merged the first part into `main`** on 12 Nov 2026 at 09:30 UTC (opened and
merged from the owner's account 12 seconds apart; CI on `main` passed). It holds everything under
"Done" below up to the glow's CSS transition (`4274f2b`). No release was made: the latest release
is still 1.0.0, so Hub-P- is not affected. The branch `rawaq-hardening` is merged and takes no
more commits.

**Pull request 6 merged the second part into `main`** on 12 Nov 2026 at 11:32 UTC (opened at
11:31 and merged from the owner's account; head `0813018`: A3, A4, A6 and the status note). Its
branch `rawaq-hardening-2` is merged and deleted, and takes no more commits. The rest of stage A
(A7 to A10) continues on `rawaq-hardening-3`, made from `main` (`45763d8`). Before every push the
state of the branch's pull request is read with `gh`: a push goes out only while there is no pull
request yet or its state is exactly OPEN.

### Done (stage A, parts A0 to A10)

- **Baseline (A0)**, taken from `main` before any change:
  - 448 pictures of the built Storybook (15 stories x 7 presets x 2 densities x English and
    Arabic at 1280 x 720, plus the Overview at 1920 x 1080), taken twice: both runs identical.
  - Public surface: 140 exports, 85 token exports, 148 interface members, 82 `--app-*` variables,
    16 test ids. Package size: 80.5 kB of JavaScript (30.4 kB gzip, 37 files), `styles.css`
    41.9 kB (9.5 kB gzip).
  - Starter with 1.0.0: Lighthouse desktop 1280 x 720, Performance 100 and Accessibility 100 on
    the Overview and on the Work page, LCP 0.67 s, CLS 0.0002, blocking time 0. No console error,
    no failed request. Next.js 16 no longer prints "First Load JS", so it is measured in the
    browser (see "Next", point 2).
- **Motion (A2)**: `src/tokens/motion.ts` is now the one place for every duration and easing.
  New tokens `tooltip`, `pop`, `introSafety`, `ease`, `easeBreath` and the helper `motionMs()`;
  every stylesheet and component reads them (the keyword `ease`, the tooltip's 120 and the
  opening's 1500 were written by hand before). `motionVariables()` gives every token its CSS
  variable. The rail's glow shape now slides by `transform` only (it animated `top` and `left`):
  it sits at the rail's top left corner, `Rail.tsx` moves it with `transform`, and a CSS
  transition slides it. The place is measured, so the slide mirrors by itself in right-to-left
  pages. The owner chose this on 12 Nov 2026 ("CSS transition only") over a version that used
  the browser's animation call; that version is in the branch history (`eaafae0`) and gave the
  same pictures. The glow is a part of its own (following the entry no longer draws the whole
  rail again), and an entry of the rail is drawn again only when something it shows has changed.
  New tests: `src/tokens/motion.test.ts`, `src/motion-checks.test.ts` (fails on any timing
  written by hand in a stylesheet or a component), and more cases in `Rail.test.tsx`.
- **State parts (A5)**: `EmptyState` with the variants `empty`, `error` and `not-found` (one
  shape), the reference code of an error with a copy button (`ReferenceCode`), `isReferenceCode`
  and `makeReference`, and `ErrorBoundary`. An error screen has no way to show a message or a
  stack: only a short code. Words in English and Arabic in `src/labels.ts`; one story
  ("Empty, error and not found"); tests in `EmptyState.test.tsx` and `ErrorBoundary.test.tsx`.
- **Safety (a part of A8)**: `package.json` says `"license": "UNLICENSED"` and stays private
  (`src/package.test.ts` fails if either goes); the starter sends the security headers (a content
  security policy, no framing, no type sniffing, referrer and permissions policies) and keeps
  browser source maps off.
- Checks on the branch: `yarn test` passes (879 unit tests, 697 before), `yarn build` and
  `yarn check:dist` pass. Compared with the baseline, nothing of the public surface was removed
  or renamed: 11 exports, 5 variables and 3 test ids were added.
- `scripts/hardening/` holds the measuring tools of this pass as they are (pictures, picture
  compare, public surface, starter measurements). They become proper scripts in A7 and A9.
- **The after pictures are identical to the baseline** (12 Nov 2026, branch
  `rawaq-hardening-2`): 448 of 448, in two runs, and each set is identical to its own second run
  (the 28 pictures of the new story are new). The 120 differences found first were not a change
  of the look. Chrome repaints only the changed rectangles of a screen tile while a page loads
  ("partial raster"), and soft shadows and smooth edges keep traces of the order of those
  repaints: up to 1 level of 255 in the rail's shadow, up to about 20 in one smooth edge pixel of
  the glow's notch. That order depends on timing: the same build of the branch gave different
  pictures from one run to the next (25 of 84), while 1.0.0 happened to stay steady. Proof:
  - The page is fully still before each picture (no change to the page, no paint, no running
    animation in the 2 seconds before it), in 1.0.0 and on the branch.
  - With the Chrome switch `--disable-partial-raster`, 1.0.0 and the branch give the same pixels,
    and each gives the same pixels run after run.
  - Taking the files of 1.0.0 back one by one: the stylesheet is not the cause; no single change
    in `Rail.tsx` is (`transform`, `data-glow` from an effect, the `memo` on entries); only the
    timing of the first draws moved, inside the wave of 0.01 ms transitions that the reduced
    motion rule gives every element while Storybook applies the look.
  - `scripts/hardening/shots.cjs` now always starts Chrome with `--disable-partial-raster` (and
    `ONLY_STORIES=a,b` takes a few stories for a quick round). The browser tests of A7 and the
    Hub-P- pictures of stage B use the same switch.
- **First-load bytes of the starter**, 1.0.0 against this branch (the package packed and
  installed in the starter for the measurement, then put back), counted with the browser's own
  size of each file without headers (`encodedBodySize`; the earlier way subtracted a header count
  that can already hold a part of a small file):

  | Page | JS 1.0.0 | JS now | CSS 1.0.0 | CSS now | Fonts |
  |---|---|---|---|---|---|
  | `/en`, `/ar` | 219,876 | 220,731 (+855, +0.4%) | 40,277 | 40,576 (+299, +0.7%) | same |
  | `/en/suppliers`, `/ar/suppliers` | 220,537 | 221,392 (+855) | 40,277 | 40,576 | same |

  Fonts: 70,196 bytes (2 files) in English, 205,460 (5 files) in Arabic, both unchanged. No
  console error and no failed request on any page. The package itself: JavaScript 80.5 kB to
  91.8 kB (gzip per file 30.8 to 35.7 kB, 37 to 42 files), `styles.css` 41.9 to 45.3 kB (gzip
  9.5 to 10.2 kB); the growth is the new parts (`EmptyState`, `ErrorBoundary`) and the rail's
  parts. A page pays only for what it uses: `EmptyState` adds no JavaScript to the starter.
- A1 read again with gh on 12 Nov 2026: still no ruleset on `main`, no branch protection, Pages
  not switched on (the owner's clicks, README). The stale line in the 1.0.0 note was already put
  right in `0436b7c`.
- **A3 (light)**, commit `5ac67b6`: knip 5.66.0 (through `yarn dlx`, with its own TypeScript
  5.9.3; TypeScript 7 has no JavaScript interface it can read) finds no unused dependency and no
  unused file in the package. Two names were exported but used only in their own file, and are
  not public: `PURE_BLACK`, `ReferenceCodeProps` (now file-private). Kept: `MATCH_THEME` and
  `DEFAULT_SIDEBAR` are the same value but both public in 1.0.0; three exported types in story and
  test helpers do not ship. Every CSS module class is used; every icon is a named import.
  Fonts need no change: a page fetches only the Latin set of Plus Jakarta Sans (one variable file
  for every weight) and the Arabic set of IBM Plex Sans Arabic in the weights used (400 to 700;
  the theme's 800 falls back to 700, the font has no heavier weight), all `font-display: swap`.
  An English page also fetches Arabic 400 for one word, the language link "العربية". The package
  ships no font files; the starter takes them from the `@fontsource` packages, which carry their
  licence (SIL OFL 1.1; for the licence list in A8).
- **A4 (comfort and accessibility)**, commit `f5d0d30`: `yarn comfort`
  (`scripts/comfort-stories.mjs`, shared server in `scripts/lib/storybook-server.mjs`), on the
  built Storybook. All green on 12 Nov 2026:
  - layout: 896 pages (every story x 7 presets x 2 densities x en/ar x 1280 and 1920): no
    sideways scroll, no cut text, no scroll area inside the scrolling page;
  - WCAG 2.5.8 target size (64 pages), the keyboard walk (20 pages: WCAG 2.4.11 focus never
    hidden, a visible ring on every stop, no trap, every rail entry shows its name on focus),
    WCAG 1.4.4 at 200 percent zoom (10 pages: no cut text, all text in reach, the menu opens with
    the keyboard, takes the focus, Esc closes it and the focus comes back), Windows high contrast
    (the active rail entry and every focus ring are outlines);
  - right-to-left motion, measured at start, half way and end, English and Arabic: the glow slides
    straight along the rail and ends on the clicked entry; the tooltip opens toward the page; "Show
    labels" widens the rail from its inner side and pushes the frame step by step; the drawer
    comes in from the start side; the entrance rise is vertical only. The pill tab slide is not a
    part of the package (no tabs part), so there is nothing to measure.
  - Each check was proven to catch a planted problem first (cut text, sideways scroll, small
    targets, a focus under a sticky bar, no ring).
  - `yarn axe` now covers both densities: 448 checks, no violations.
  - The contrast tests already cover every preset with every sidebar swatch (text, controls,
    focus ring, glow, rail icons); nothing was missing.
  - The story app (`src/stories/sample.tsx`) opens the drawer from a menu button below the `sm`
    width, as an app does it (Hub-P- has the same). Desktop pictures unchanged: 252 of 252.
- **A6 (gallery)**, commit `db6f9c3`: `examples/starter/src/app/rawaq-gallery/`, its own root
  layout at `/rawaq-gallery` (no language in the address, so the starter's own pages stay static
  and nothing of theirs moved). Pages: Overview, Work with a filled table, loading, empty, error
  (reference code only), a real 404 (`/rawaq-gallery/no-such-page`), a form with an invalid and a
  disabled field. A bar in the header switches preset, sidebar colour, density and language; the
  choice is the cookie `rawaq-gallery-look`, read by the server. Checked against the packed
  branch package: every page 200 (the missing one 404), no console error, no hydration warning,
  and with Onyx Black, Comfortable, Arabic the server's HTML already has `dir="rtl"` and the Onyx
  rail colour. In production it answers 404 unless `RAWAQ_GALLERY=1` (checked both ways).
  The 404 page's first HTML is Next.js's error document (`<html id="__next_error__">`), and the
  not-found state appears once the scripts run: explained in A7 below.
- **A7 (browser tests)**: `@playwright/test` 1.65.0 (the same version as the `playwright-core`
  already there), `playwright.config.ts` and `e2e/`. The tests start `next start` on the starter,
  which is built against this branch's packed package first (steps at the top of the config; the
  `file:` address is never committed). On this laptop they use the installed Chrome, started with
  `--disable-partial-raster`; in CI `E2E_BROWSERS` picks Chromium, Firefox and WebKit (A9).
  - `yarn e2e` (20 tests, all green on 12 Nov 2026): `e2e/smoke.spec.ts` opens the 4 starter pages
    and the 6 gallery pages plus the missing one in English and Arabic; each fails on a console
    error, a hydration warning, a script error, an answer of 400 or more (only the missing page's
    own 404 is expected) or a failed request, checks `lang` and `dir`, and runs axe (WCAG 2.2 AA).
    The error page shows a reference code and no message or stack. `e2e/first-frame.spec.ts`
    (Chromium) saves Onyx Black, Comfortable, Arabic in the gallery's cookie and opens the Work
    page: the first painted frame of Chrome's own screen recording already has the rail on the
    right in Onyx colours (pixels read on a canvas, the rail's colour taken from the installed
    package's `tokens.json`); with scripts off, the server's HTML alone has `lang="ar"`,
    `dir="rtl"`, the same rail place, the Onyx variables and the Comfortable spacing, and is
    painted the same way.
  - Each check was proven to catch a planted problem first (pages made for it and deleted again):
    a console error, a failed request, a hydration mismatch (React error 418), an image without a
    name (axe `image-alt`), and a theme that waits for the scripts (the first frame showed the
    default rail colour `rgb(23, 59, 48)`, and the server's HTML had the default variables).
  - `yarn e2e:perf` (Chromium, processor slowed 4 times, run alone; 8 tests, all green):
    - Load, longest task: `/en` 160 ms, `/ar` 104 ms, `/en/suppliers` 60 ms, `/ar/suppliers`
      68 ms. Limit 200 ms.
    - "Show labels" (reported only, the owner kept it): open passes 3 of 7 (English) and 1 of 7
      (Arabic), close 1 of 7 and 1 of 7; worst gap 117 ms, longest task 86 ms. The same picture
      as before the changes.
    - The glow: its window starts at the glow's own `transitionstart`, because the glow moves
      only once the click's new page is in place (Rail.tsx follows the address): 0.2 to 0.4 s after
      the press at 4x, after the page change's own work (51 to 74 ms for the click, 99 to 160 ms
      for the new page). From the table page to the Overview it passes 6 of 7 in both languages
      (worst gap 33 ms); the misses are a task of 54 to 73 ms that starts 48 to 59 ms before the
      slide and ends about 14 ms into it: the Overview's first layout, in the frame that starts
      the slide. To a light page (gallery Work to Empty) it passes 7 of 7 in both languages. The
      test needs most visits to pass on both. Each test writes its numbers to
      `e2e-results-perf/<test>/numbers.json`.
  - **Why the gallery's 404 HTML is `__next_error__`** (found with two throwaway routes, then
    deleted): React does not run error boundaries while it draws a page on the server, and a
    `not-found.tsx` is an error boundary. So when a page calls `notFound()` during a dynamic
    render, the error leaves the server's first draw, and Next.js 16 answers 404 with its empty
    error document plus the page data; the browser then draws the nearest `not-found.tsx`. A probe
    with a plain server-only not-found file did the same (404, `__next_error__`). With a
    `<Suspense>` around the page, the shell was drawn by the server, but the answer became 200 and
    the not-found text was still drawn by the browser. Only addresses that match no route are drawn
    by the server (Next.js's own `_not-found`; one in the gallery's layout would need
    `global-not-found`, still experimental in Next.js 16, so not used). The gallery keeps its real
    404 status; the test waits for the not-found state. For stage B: Hub-P-'s `notFound()` pages
    behave the same (a white first frame, then the not-found state), and the first-frame test
    there applies to normal pages.
  - Starter on Next.js 16.3.8: `yarn npm audit` lists two critical and one high advisory (fixed
    after 16.4.0); the starter's upgrade is in A8. Hub-P- has the same version: proposed to the
    owner as its own task on 12 Nov 2026, not part of this pass.
- **A8 (security), the rest**:
  - `yarn npm audit --all --recursive`. Starter: `next` 16.3.8 had two critical advisories
    (GHSA-2464-fhr4-w9xw, remote code execution in image resizing with SVG files;
    GHSA-673q-mjm6-r5xr, remote code execution in `use cache` functions) and one high
    (GHSA-p3m5-59mp-jv5r, Server Actions denial of service), all for 16.0.0 to 16.4.0. The starter
    now pins `next` 16.4.6 (a minor upgrade; its lockfile made by a real install from the 1.0.0
    address): no audit finding left. The starter uses none of the three features, but it is the
    example apps copy. Package (development tools only, nothing ships): `tldts-core` 7.4.20 (a
    partial release) is now 7.4.22 inside its range. Left, reported: `glob` 13.0.7 and `minimatch`
    10.2.6 (moderate, inside Storybook's docgen plugin, which asks for `glob` ^13). They are fixed
    only in new majors (`glob` after 14.0.1, `minimatch` 11.0.1 and up) that the plugin does not
    accept: forcing them is a major upgrade (ask first). Only our own fixed patterns reach them, at build
    time on this laptop and in CI.
  - secretlint 11.7.1 with the recommended rules (through `yarn dlx`, nothing installed): every
    tracked file and the whole history (`git log -p --all`, 1.08 MB, every commit) are clean. It
    was seen to catch a planted GitHub token first.
  - `src/code-safety.test.ts` reads every code file of `src`, `.storybook`, `scripts`, `e2e`, the
    starter's `src` and the config files, and fails on `dangerouslySetInnerHTML`, `eval`,
    `new Function`, writing `innerHTML` or `outerHTML`, `insertAdjacentHTML`, `document.write` and
    a timer that runs a string (with cases that it catches and cases it lets through). None is
    used today.
  - `THIRD_PARTY_LICENSES.md`: the package ships no third-party code and no font; peers are MIT;
    the fonts are SIL OFL 1.1 (flagged, with what that allows); the starter's and the
    development lists, with `axe-core` (MPL-2.0), sharp's `libvips` (LGPL-3.0-or-later, not used)
    and `caniuse-lite` (CC-BY-4.0, build data) named.
  - `yarn scan:built` (`scripts/scan-built.mjs`) searches `dist`, `storybook-static` and the
    starter's `.next` for private keys, Supabase keys and project addresses, signed tokens,
    GitHub tokens, cloud and Stripe keys, the values of secret environment variables, and in what
    a browser can get also email addresses, the client's name, folder paths of a computer, private
    network addresses and browser source maps. It prints file, kind and count, never the text.
    469 files, clean. Proven on planted problems (5 of 5 caught). One address in the Storybook is
    a library's own maintainer data (bundled `package.json` of a parser), public and not ours: such
    package data is let through, any other address fails. The Pages workflow now runs it on the
    Storybook before anything is uploaded; CI runs it in A9.
  - What a public Storybook would show (Pages stays off, the owner's call): the built code of
    every part (the package's own JavaScript and CSS, minified but readable with some effort), the
    tokens, the words in English and Arabic, the invented sample content, and the stories' code.
    Nothing of an app, no client data, no key. The package is `UNLICENSED`: a public Storybook
    lets anyone read the theme's code, but grants no right to use it.
  - Report only, files that name the owner or the repository (no file names Woqoof, no email
    address, no key): `README.md` and `scripts/check-starter.mjs` (the release address on GitHub,
    `rashid-934`, needed), the starter's `package.json` and `yarn.lock` (the same release
    address), `PROGRESS.md` (the plan's path on the owner's laptop, which holds his name, and
    "Built by Rashid Akbar").
- **A9 (CI guard rails)**, `.github/workflows/ci.yml`, Linux runners only, every action pinned to
  a full commit SHA (one new: `actions/upload-artifact` v7.0.2), permissions still read-only:
  - `checks`: `yarn check:size` and `yarn scan:built dist` after the build.
  - `storybook and accessibility`: `yarn comfort` after `yarn axe`, then
    `yarn scan:built storybook-static`.
  - `starter and browser tests`: after the starter is built against the packed package,
    `yarn scan:built examples/starter/.next`, Playwright's Chromium, Firefox and WebKit, `yarn e2e`
    on all three (the first-frame and CPU 4x tests are Chromium only), `yarn e2e:perf` alone, the
    numbers printed in the log, and the results kept 14 days as the run's file `browser-tests`.
  - `scripts/check-size.mjs` with `size-budget.json`, the sizes of this branch's build: JavaScript
    42 files, 91,796 bytes (35,174 gzip, each file on its own); `styles.css` 45,342 (10,089
    gzip); `tokens.css` 9,568 (2,136); `tokens.json` 11,368 (2,690). More than 10 percent above
    any of them fails (seen failing at +13.4 percent on a lowered budget). `--write` sets a new
    budget, only in a pull request that says why. A10 wrote it again from the final build (below)
    and added a floor: more than 30 percent under a budget fails too (a part missing).
- **A10 (pictures, surface, reviews, version 1.1.0, two runs)**:
  - Pictures: 1.0.0's Storybook built from the tag `v1.0.0` in a scratch folder, 448 pictures;
    this branch with every change of stage A, the review fixes included: **448 of 448 identical**
    (pixel for pixel; the 28 pictures of the new story are new). Also identical to the pictures
    taken before the review fixes (476 of 476).
  - Public surface against `scripts/hardening/surface-1.0.0.json`: nothing removed or renamed;
    added 11 exports, 35 interface members, 5 `--app-*` variables, 3 test ids. One thing to
    know (in `CHANGELOG.md` and the README): `RawaqLabels` has 9 new words, so code that typed a
    complete object as `RawaqLabels` is asked by TypeScript for them; `labels` passed as the README
    shows needs no change.
  - Version 1.1.0 in `package.json`, the starter's address `v1.1.0` (its lockfile follows after
    the release, as for 1.0.0), `CHANGELOG.md` section 1.1.0.
  - Reviews (`code-reviewer`, `security-reviewer`, `a11y-architect`): nothing critical or high.
    Fixed: the glow also measures again when a block inside the rail changes size or a late font
    arrives (`Rail.test.tsx`); `ErrorBoundary` gives the focus to the error's heading when the
    broken part had it (never otherwise), takes `titleOrder` and tells the app `onReset`
    (`ErrorBoundary.test.tsx`); the focused active rail entry keeps its focus ring in Windows high
    contrast; a long reference code wraps; the gallery's look bar changes nothing until "Apply"
    (WCAG 3.2.2, e2e test); the timing guard finds a time inside a style text, `${n}ms` and long
    timers; the code guard finds `Function(`, `window['eval']`, `(0, eval)`, `setHTMLUnsafe`,
    `createContextualFragment`, `srcdoc`, `javascript:` and `import('data:...')`, and reads the
    starter's `next.config.mjs`; the scan flags any source map, an empty build and two more secret
    names, and its patterns (`scripts/lib/private-patterns.mjs`) also check the HTML of every page
    the starter serves, also pages drawn per request; the size check has its floor; the release
    workflow refuses a tag whose commit is not on `main`; the test server is never reused.
    Checked and not changed: the copy status is a `span` already (the reviewer's "div in p" was
    wrong); CSP keeps `'unsafe-inline'` (nonces make every page dynamic: ask first); the `alert`
    covers the whole error card (moving it needs an extra element in the card, a layout risk, for
    a minor gain), the rail's count has no unit word (a change to a part released in 1.0.0), the
    reference code has no `lang` (a code is in no language; a screen reader spells it); Mantine
    closes tooltips on Esc.
  - Found while testing: the comfort motion checks sampled once, 90 ms after the click, and failed
    when a busy laptop started a slide late. They now follow each slide on every frame: some
    frame must be on the way and the way must go one direction (glow, "Show labels" push,
    drawer). The glow's own code was then measured during its slide at 4x: one resize callback per
    visit, 230 to 313 ms before the slide, 0.2 to 0.6 ms long, and no font event; the misses on
    the starter are the Overview's first layout (a 50 to 57 ms task that starts 38 to 49 ms before
    the slide). So the CPU 4x glow gate is the glow to a light page; the table-to-Overview slide
    is reported.
  - Speed after (laptop, starter built against the branch, Next.js 16.4.6): Lighthouse desktop
    `/en` Performance 100, Accessibility 100, LCP 0.67 s, CLS 0, blocking 0 ms; `/en/suppliers`
    Performance 95 (runs 95, 100, 95), Accessibility 100, LCP 0.65 s, CLS 0.0001, blocking 165 ms
    in two of three runs (1.0.0 baseline: 100, 100, 0.67 s, 0.0002, 0). First-load bytes: JS
    221,818 (`/en`) and 222,456 (`/en/suppliers`), CSS 40,583, fonts unchanged; no console error,
    no failed request.
  - The owner's "no long task over 200 ms on load" at CPU 4x: **met in CI** (Linux runner) for the
    first load with an empty cache (longest task 118 to 129 ms) and for a load with the scripts
    cached (0 to 100 ms). **On this laptop** it is met with the scripts cached (53 to 184 ms) and
    **missed for the first load, before and after**: 1.0.0 against now, 5 cold visits each,
    alternating: median longest task 360 to 308 ms (`/en`), 239 to 257 (`/en/suppliers`), 317 to
    253 (`/ar`), 378 to 365 (`/ar/suppliers`); median blocking 661 to 396, 437 to 430, 572 to
    384, 738 to 719. "4 times slower" is relative to the machine, and this laptop is slower than
    the runner. The task is Next.js starting and React taking over the whole page, not the theme.
    What it would take on a slow machine: less JavaScript on the first visit of the app (more
    server-drawn parts, smaller client parts), which is app work (stage B and later).
  - Size budget from the final build: JavaScript 42 files, 93,453 bytes (35,832 gzip);
    `styles.css` 45,590 (10,194); `tokens.css` 9,568 (2,136); `tokens.json` 11,368 (2,690).
  - **Run 1** (12 Nov 2026, this laptop): `yarn test` (format, lint, types, 1,038 unit tests),
    build, `check:dist`, `check:size`, `check:starter`, pack, `scan:built`, Storybook, axe (448
    checks, no violations), comfort (the motion part flaky as above, then reworked, then 3 runs
    with 2 clean and one honest skip report), starter built against the packed package, `yarn e2e`
    21 of 21, `yarn e2e:perf` 8 of 8 (after the gate changes above), pictures 448 of 448.
  - **Run 2** (12 Nov 2026, after deleting both `node_modules`, `dist`, `storybook-static`, the
    starter's `.next`, `tsconfig.tsbuildinfo` and the test results; `yarn install --immutable`):
    all of the above again, all green: 1,038 unit tests, axe 448 with no violations, comfort with
    no problems, every scan clean, `yarn e2e` 21 of 21, `yarn e2e:perf` 8 of 8. After Run 2 the
    load part of `e2e:perf` became "first load reported, cached load gated on the middle of
    three" (above) and ran again: 4 of 4. CI runs everything once more on the final commit.
  - CI on Linux, final commit `67c569b` (run 43230884160): every job green; 63 browser tests (21
    on each of Chromium, Firefox and WebKit; 59 passed, 4 skipped: the first-frame tests are
    Chromium only); CPU 4x 8 of 8: the glow 7 of 7 everywhere (worst gap 16.8 to 33.4 ms), "Show
    labels" 7 of 7 open and close in English and Arabic (worst gap 33.4 ms), loads as above. The
    laptop's 4x numbers swing from run to run (the last full laptop run gave the glow to a light
    page 6 and 4 of 7); CI's runner is steadier. Actions time: before A9 about 5 runner minutes a
    run (3.8 minutes end to end), now about 15.8 (7.6 minutes). The repository is public, so
    standard Linux runners cost nothing.

### Decided by the owner on 12 Nov 2026: "Show labels" keeps its slide

He chose "Keep the slide" after seeing the numbers below. It is the one accepted exception to
"animate transform and opacity only", written into `docs/DESIGN_THEME.md` section 7. Do not
change it, and do not treat the 4x gate as failed because of it; report the numbers as they are.

His gate: during the 0.2 s slide, no long task over 50 ms and no gap between two frames over
50 ms, on the table page, English and Arabic. Measured over 7 visits per page:

- At normal speed every frame is on time (16.7 ms), before and after.
- At 4x slower it misses the gate, **before and after** the changes above (it passes 1 to 6 of
  7 visits; worst gap about 100 ms). The frames of the slide itself are mostly on time. What
  misses is the click: drawing the rail's state again and the first layout take 60 to 110 ms at
  4x, and one or two frames drop while the page is laid out again on every frame of the push.
- Moving the tooltip work out of the click was tried and taken out again: it moved the work into
  the slide and was no better.
- The choice was his: keep the slide as designed, or open and close the panel with no slide. He
  kept the slide.

### Next, in this order

Stage A (A0 to A10) is done on `rawaq-hardening-3`; pull request 7 carries the stage A report.

1. The owner reviews and merges pull request 7 (his click; nothing is merged by me).
2. After the merge: push the tag `v1.1.0` on the merge commit (the release workflow now refuses a
   tag that is not on `main`), check the Release (file `rawaq-ui-1.1.0.tgz`, notes from the
   changelog, the job "verify the release"), then the small pull request with the starter's
   lockfile made by a real install from the 1.1.0 address (as for 1.0.0). 1.0.0 is never touched.
3. Then stage B in Hub-P- (branch `rawaq-hardening` there, from `master`), as in the plan: B0
   measuring tools first, rollback steps in Hub-P-'s `PROGRESS.md` before the address changes.
   From A7: Hub-P-'s pages that call `notFound()` answer with Next.js's empty error document
   first, like the gallery; the first-frame test there applies to normal pages.
4. The owner's own clicks (unchanged): a ruleset on `main` and one for tags `v*` (only he may
   create them), GitHub Pages stays off until he decides.
5. Separate from this pass: Hub-P- runs Next.js 16.3.8 with two critical advisories; its own
   session (started by the owner on 12 Nov 2026) has a plan waiting for his approval.

## Status note, 11 Nov 2026 (version 1.0.0 is released)

The owner approved the plan for Rawaq UI v1 on 11 Nov 2026, with seven additions. Everything of
v1 was merged into `main` with pull request 1 on 11 Nov 2026. The test release `v1.0.0-rc.1` is
out: its file is on the Releases page, the notes come from the changelog, and the job
`verify the release` installed and built the starter from the released file. Pull request 2 (the
starter's real lockfile) was merged on 11 Nov 2026.

**Version 1.0.0 is released** (11 Nov 2026). Pull request 3 set the version, the starter's
address and the changelog section; the package code is the same as 1.0.0-rc.1. The tag `v1.0.0`
is on the merge commit of that pull request. The Release holds `rawaq-ui-1.0.0.tgz` (53 kB) with
the notes from the changelog, the file downloads without sign-in, and the job
`verify the release` installed and built the starter from it. The starter's lockfile was then
made again by a real install from the 1.0.0 address (`yarn install --immutable` and `next build`
pass on the laptop).

### Done

- Repository created (public). `main` holds only the README stub and `.gitignore`.
- Tooling: Yarn 4, TypeScript 7, Vite 8 library build (ES modules, one file per source file, one
  `dist/styles.css`, class names `rq-<File>-<class>` with no hash), types from `tsc`, Vitest with
  jsdom, oxlint, oxfmt, stylelint (logical properties only, no hex colours), PostCSS with
  `postcss-preset-mantine` 1.18.0.
- Tokens in `src/tokens`: presets, sidebar swatches, density, palette maths, contrast, KPI tints,
  settings parser, rounding (`radius.ts`), motion timings (`motion.ts`), fonts per locale
  (`typography.ts`), direction of a locale (`locale.ts`), every derived colour (`resolve.ts`) and
  every `--app-*` CSS variable (`variables.ts`).
- Theme builder in `src/theme`: `createRawaqTheme({ preset | palette, sidebar, density, locale,
  fonts })`.
  - A brand `palette` (nine colours) is checked against the same contrast pairs as the presets
    (`check-palette.ts`: 40 pairs, 9 more for each extra sidebar). A palette that fails is refused
    with a `RawaqPaletteError` that names each failing pair with both ratios and both colours.
    `checkPalette` gives the same report without throwing, for a settings screen.
  - `fonts` maps a locale to a font family and, when the script needs it, a line height (no line
    of text or heading is tighter; component styles use `max(own, var(--app-line-height, 0))`).
    English and Arabic get exactly the theme they had before.
  - `rtlLocales` (`ar`, `ur`, `fa`, `he`) and `directionOf(locale, extraRtlLocales?)`.
- `tokensCss()` and `tokensJson()` (`src/tokens/files.ts`) are exported, and `yarn build` writes
  `dist/tokens.css` and `dist/tokens.json` with them (`scripts/finish-build.mjs`), exported as
  `rawaq-ui/tokens.css` and `rawaq-ui/tokens.json`. In `tokens.css` the default look is on `:root`;
  `data-rawaq-preset`, `data-rawaq-sidebar` and `data-rawaq-density` choose another.
- Words: `src/labels.ts`. English and Arabic are built in (`rawaqLabels`, `labelsFor`); every
  component takes `locale` and `labels`, so another language passes its own words.
- Shell in `src/components`: `Rail` (tooltips, Show labels, glow slide, groups, bottom entries,
  any link component, the current address as a prop), `Frame` (rounded frame, haze edge, sticky
  header slot, page fade keyed by the address, focus to the top after a page change),
  `PageHeader`, Overview parts (`OverviewPage`, `HeroBanner`, `Emphasis`, `BentoCard`, `StatGrid`,
  `StatCard`) and Work parts (`WorkPage`, `WorkCard`, `FormGrid`, `FormGridItem`, `TableWrap`,
  with `pageTableProps`).
- Motion: `IntroReveal` (the app clears its sign-in marker in `onShown`), `RollingNumber`,
  `PageSkeleton`, the page fade, and the bar utilities `.grow-x` and `.grow-y`. Every timing is a
  motion token. All of it is off with reduced motion.
- The app-wide stylesheet `src/styles/global.css` builds into `dist/styles.css` (41 kB with the
  components). The letter-spacing rule that said `:lang(ar)` is now `:dir(rtl)`.
- No test for one language: `src/language-checks.test.ts` reads every source file and fails on a
  comparison with a language code, a `:lang()` selector or a `[lang]` selector. The plan also asked
  for a lint rule; oxlint has no `no-restricted-syntax` rule and its custom plugins are still
  experimental, so the test (same `yarn test` step as lint) is the guard.
- Tests: 697 pass (`yarn test`: format, lint, types, unit tests), one test file per component,
  with the `matchMedia`, `ResizeObserver` and `AnimationEvent` stubs in `vitest.setup.ts`.
  `yarn build` is clean and keeps the `'use client'` line on Rail, Frame and IntroReveal.
- Storybook 10 (`@storybook/react-vite`, `yarn storybook`, `yarn storybook:build`): 15 stories in
  `src/stories` (Screens, Components, Tokens) with a toolbar for language (English, Arabic, Urdu),
  preset, sidebar colour and density; two Urdu stories (right-to-left, Noto Nastaliq Urdu, Urdu
  words kept in the story) and a gallery of the seven presets. The Urdu font is a development
  dependency only.
- Checked in a real browser on the built Storybook, at 1280 x 720 and 1920 x 1080, in English,
  Arabic and Urdu: sizes of the rail, frame, header, cards and table rows match the design, the
  glow sits on the active entry, the table header sticks under the app header while the page
  scrolls, right-to-left mirrors everything, no sideways scrolling, no console errors.
- `yarn check:dist` (`scripts/check-dist.mjs`): every export in `package.json` exists, client
  components keep `'use client'`, nothing in `dist` imports a stylesheet, the CSS is plain, class
  names are `rq-<File>-<class>`, no tests or stories ship, the tokens need no React. The build's
  last step (`scripts/finish-build.mjs`) writes the token files and takes the stylesheet import
  out of `dist/index.d.ts`.
- `yarn axe` (`scripts/axe-stories.mjs`, after `yarn storybook:build`): axe with the WCAG 2.2 AA
  rules on every story, in English and Arabic, in all seven presets, with reduced motion, using
  the installed Chrome (`playwright-core`, no browser download). 210 checks, no violations, about
  two and a half minutes. `yarn axe --quick` checks the default preset only.
- `examples/starter`: a Next.js 16 app with next-intl (English and Arabic): the rail and frame,
  an Overview page (hero banner, rolling numbers, bars), a Work page (page header, dense table,
  loading skeleton), the opening once per browser session, a language switch. It installs the
  package by the release address; `yarn check:starter` fails when that address is not the version
  in `package.json`. Tested on this laptop with the packed package (`yarn pack`): `next build`
  passes, the four pages load in both languages with no console errors, axe finds no violations,
  the skeleton shows while the Work page loads.
- Workflows, all with `permissions: contents: read` at the top, every action pinned to a commit
  SHA read from GitHub, no secrets:
  - `ci.yml`, three jobs: `checks` (commit address check, format, lint, types, tests, build,
    `check:dist`, `check:starter`, pack dry run), `storybook and accessibility` (Storybook build,
    `axe`), `starter` (the starter built from the packed file).
  - `release.yml`, on a `v*` tag: runs CI, fails when the tag is not the version in
    `package.json`, takes the notes from `CHANGELOG.md` (`scripts/release-notes.mjs`), attaches
    `rawaq-ui-<version>.tgz` to a GitHub Release (only this job has `contents: write`), then
    `verify the release` installs and builds the starter from the released file.
  - `pages.yml`: publishes the Storybook to GitHub Pages after a merge to `main`. It first asks
    GitHub whether Pages is on with the source "GitHub Actions"; if not, the rest is skipped and
    the run stays green. Only the deploy job has `pages: write` and `id-token: write`.
- Docs: `docs/DESIGN_THEME.md` (the master copy, generic), `CLAUDE.md`, `CHANGELOG.md`
  (section `1.0.0-rc.1`), the README guide (start a new app, the parts, the look, a brand
  palette, fonts, another language with Urdu as the example, tokens without React, releases, and
  the owner's three settings).
- Every commit uses the GitHub noreply address (the folder has its own git identity).

### Next, in this order

1. The owner, by hand (the README has the clicks): the ruleset on `main` with the checks
   `checks`, `storybook and accessibility` and `starter`; Pages with the source "GitHub Actions".
   Read again with gh on 11 Nov 2026 after pull request 2: neither was set yet. The merge commits
   of pull requests 1 and 2 show hidden addresses only, so his email setting works.
2. Done. Hub-P- pull request 15 (branch `feat/rawaq-ui`) was merged on 11 Nov 2026, on the
   `v1.0.0-rc.1` address: `src/theme` re-exports the package; the rail, frame, page header,
   skeleton, rolling numbers, opening and the stylesheet come from the package; the design file
   there points to the master copy here. The theme is equal for all 154 looks (7 presets, 11
   sidebar colours, 2 densities), the 28 before and after screenshots are pixel-identical, and the
   Vercel preview built with no token. **No fix for the package was needed.**
3. Done. Version 1.0.0 is released (see the status note above); the starter's lockfile for 1.0.0
   is in the pull request of the branch `chore/starter-lockfile-1.0.0`.
4. Done. Hub-P- pull request 16 (branch `chore/rawaq-ui-1.0.0`) was merged on 11 Nov 2026: the
   app installs the package from the 1.0.0 address, the 28 screenshots were identical, and the
   report "Rawaq UI is fully ready" was sent.

### Notes for whoever continues

- Yarn on the owner's laptop refuses packages published in the last few days (a safety gate).
  Ask for a range such as `^8.0.0`, not the very newest version.
- Run Yarn as `corepack yarn <script>`.
- Git on the owner's laptop writes Windows line endings when it checks files out
  (`core.autocrlf` is on for the whole machine), and the format check then fails on every file.
  The repository itself holds the correct endings, so CI is not affected. With nothing
  uncommitted, write the work folder again:
  `git -c core.autocrlf=false rm --cached -r -q . && git -c core.autocrlf=false reset --hard`.
- Before every push: `git log --format='%ae %ce' origin/main..HEAD | sort -u` must show the
  noreply address only.
- The owner's account now refuses any push that carries a private address (GitHub error GH007),
  in every repository, Hub-P- too. Commit there with the noreply address as well.
- The Hub-P- screenshots: build its Storybook to a folder, open the Dashboard and Responses
  stories with `playwright-core` and the installed Chrome (1280 x 720, reduced motion, animations
  finished), and compare the PNG files pixel by pixel on a canvas in the browser. Nothing heavy
  may run at the same time: under load a few pixels differ by 1/255. (Found on 12 Nov 2026: that
  is Chrome's partial raster; start Chrome with `--disable-partial-raster` and the pixels no
  longer depend on timing. See the status note of 12 Nov 2026.)
- A hook on the owner's laptop refuses any change to `oxlint.config.mjs`. Make the code satisfy
  the rules as they are (sample words in files under `src/stories` go through variables, not
  literal JSX text), or ask the owner.
- Storybook loads the app-wide rules through the alias `rawaq-ui/styles.css` (see
  `.storybook/vite.config.ts`): the package entry's own stylesheet import is dropped by the
  bundler there, because `package.json` marks only CSS files as having side effects.
- Screenshots: the app's browser pane stops drawing while its window is hidden. Headless Chrome
  works: `chrome --headless=new --window-size=1280,720 --virtual-time-budget=6000 --screenshot=...`
  on `storybook-static` served locally.
- Building the starter from the packed package (what CI must do, and how it was tested here):
  `yarn build`, `yarn pack -o rawaq-ui-local.tgz`, then in `examples/starter` point the
  `rawaq-ui` dependency at `file:../../rawaq-ui-local.tgz` (in the work folder only, never
  committed), `yarn install --no-immutable`, `yarn build`. The starter has its own `yarn.lock`
  (made by a real install from the release address), so Yarn treats the folder as its own
  project. When the version changes, install again in the starter and commit the new lockfile
  after that version is released.
- The axe script finishes every running transition before it scans. Pages checked side by side
  are not in front, their clock stands still, and a button would be read at the see-through start
  of its colour transition (a false contrast finding).
- For the move of Hub-P- to the package:
  - `Rail` takes `showLabels` (Hub-P- called it `labels`), `items`, `groups`, `bottomItems` with
    translated labels and icons, `pathname` and `linkComponent`. Pass `data-tour="nav"` as a
    prop. Words come from the app's translations through `labels`.
  - `RollingNumber` has one more wrapper inside (the number group) so a unit sits on the correct
    side in Arabic; test ids and the text are unchanged.
  - `IntroReveal` no longer clears a cookie itself: pass `onShown`.
  - The theme's variable set only grew: every name the app used before is still there
    (`src/tokens/variables.test.ts` locks the list). `resolveTokens` lives in
    `src/tokens/resolve.ts`.
  - Compare the Arabic screens closely where a `dir="ltr"` element has letter spacing:
    `:dir(rtl)` no longer resets it there (`:lang(ar)` did).
- Nastaliq (Urdu) needs tall lines. Text, headings and the package's own parts follow the font
  token's line height; Mantine controls with a fixed height (buttons, badges, inputs) keep their
  height, which looked fine in the stories. Say so in the README's Urdu section.
