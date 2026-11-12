# Progress

## Status note, 12 Nov 2026 (hardening pass, branch `rawaq-hardening-2`, not finished)

The owner approved a hardening pass on 12 Nov 2026 (no change to colours, layout, spacing, fonts
or shapes; smoother motion, less weight, fewer bugs, safety, everything tested twice). It has two
stages: **A** this package (it becomes version 1.1.0), then **B** the app Hub-P-. The approved
plan with its 14 additions is on the owner's laptop:
`C:\Users\Rashid Akbar\.claude\plans\pasted-content-id-cc52-task-rawaq-compiled-nova.md`.

**Pull request 5 merged the first part into `main`** on 12 Nov 2026 at 09:30 UTC (opened and
merged from the owner's account 12 seconds apart; CI on `main` passed). It holds everything under
"Done" below up to the glow's CSS transition (`4274f2b`). No release was made: the latest release
is still 1.0.0, so Hub-P- is not affected. The branch `rawaq-hardening` is merged and takes no
more commits; the rest of stage A continues on `rawaq-hardening-2`, made from `main`.

### Done (stage A, parts A0 to A6 and a part of A8)

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
  **Open:** the 404 page's first HTML is Next.js's error document (`<html id="__next_error__">`),
  and the not-found state appears once the scripts run. Moving `not-found.tsx` below the root
  layout (the route group `(pages)`) did not change it. Find the cause in A7 with the first-frame
  test (it matters for the Hub-P- not-found pages in stage B too).

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

The owner answered on 12 Nov 2026 "Yes, continue": the rest of stage A goes on
`rawaq-hardening-2`, and its pull request carries the stage A report.

1. **A7**: `@playwright/test` as a development dependency (approved with the plan). Smoke test on
   the starter, built against the packed branch package (as the CI starter job does; never commit
   the `file:` address): every starter page and every gallery page, English and Arabic, fails on a
   console error, a hydration warning or a failed request; axe on each; at CPU 4x no long task
   over 200 ms on load, and the smooth gate for the slides (report "Show labels" as it is, see
   above); the first-frame test: a gallery cookie with Onyx Black, Comfortable, Arabic, the first
   painted frame captured (the browser's screen recording, and once with scripts off) must show
   the rail on the right in Onyx colours. Then the open 404 question above. Start Chrome with
   `--disable-partial-raster` for any picture.
2. The rest of **A8**: `yarn npm audit` (root and starter; a major upgrade = ask first), secretlint
   on the files and the whole history, a guard test against `dangerouslySetInnerHTML`, `eval` and
   `new Function`, `THIRD_PARTY_LICENSES.md` (runtime and development lists; the OFL fonts
   flagged), `scripts/scan-built.mjs` on `dist`, `storybook-static` and the starter's `.next`,
   and the report-only list of files that name Woqoof, the owner's GitHub name, addresses or keys.
3. **A9**: CI on Chromium, Firefox and WebKit on Linux runners only (`yarn comfort` and the A7
   tests join the workflow; actions pinned to SHAs), `scripts/check-size.mjs` with
   `size-budget.json` (the after numbers, +10 percent fails); the Actions minutes estimate.
4. **A10**: the 448 pictures again (`scripts/hardening/shots.cjs`, compare with a baseline made
   from `v1.0.0`), the public surface against `surface-1.0.0.json`, version 1.1.0, the starter's
   address, `CHANGELOG.md`, Run 1 and Run 2 (Run 2 from a clean install), reviews
   (`code-reviewer`, `security-reviewer`, `a11y-architect`), the pull request with the stage A
   report (sections 1 to 9 for rawaq-ui), ending "Built by Rashid Akbar".
5. Then stage B in Hub-P- (branch `rawaq-hardening` there), after 1.1.0 is released.

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
