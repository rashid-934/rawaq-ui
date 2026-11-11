# Progress

## Status note, 11 Nov 2026 (after the test release 1.0.0-rc.1)

The owner approved the plan for Rawaq UI v1 on 11 Nov 2026, with seven additions. Everything of
v1 was merged into `main` with pull request 1 on 11 Nov 2026. The test release `v1.0.0-rc.1` is
out: its file is on the Releases page, the notes come from the changelog, and the job
`verify the release` installed and built the starter from the released file. Version 1.0.0
itself is not released yet.

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
   On 11 Nov 2026 neither was set yet. The merge commit of pull request 1 shows hidden addresses
   only, so his email setting works.
2. Hub-P-, branch `feat/rawaq-ui` (the plan's step 2): before screenshots from `master`, add the
   dependency (the `v1.0.0-rc.1` address), `src/theme` re-exports the package, replace the
   components, the docs pointer, after screenshots with the pixel comparison.
3. rawaq-ui pull request for version 1.0.0 (`package.json`, the starter's address and lockfile,
   a changelog section), plus any fix found in step 2. Tag `v1.0.0` after the merge.
4. Hub-P- moves to v1.0.0; then the report that starts with "Rawaq UI is fully ready".

### Notes for whoever continues

- Yarn on the owner's laptop refuses packages published in the last few days (a safety gate).
  Ask for a range such as `^8.0.0`, not the very newest version.
- Run Yarn as `corepack yarn <script>`.
- Before every push: `git log --format='%ae %ce' origin/main..HEAD | sort -u` must show the
  noreply address only.
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
