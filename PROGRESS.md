# Progress

## Status note, 11 Nov 2026 (end of the second working session)

The owner approved the plan for Rawaq UI v1 on 11 Nov 2026, with seven additions. Branch:
`feat/v1`. Nothing is released yet. The pull request for v1 is not opened yet.

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
  `dist/tokens.css` and `dist/tokens.json` with them (`scripts/write-token-files.mjs`), exported as
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
- CI (`ci.yml`): commit address check, install, format, lint, types, tests, build. Actions are
  pinned to commit SHAs; permissions are read only.
- Every commit uses the GitHub noreply address (the folder has its own git identity).

### Next, in this order

1. `scripts/check-dist` (client files kept `'use client'`, no stray CSS imports, the exports in
   `package.json` exist), the axe script over every story (English and Arabic, all seven presets,
   reduced motion, WCAG 2.2 AA rules; Playwright with the installed Chrome), `examples/starter`
   (Next.js, next-intl, English and Arabic, one Overview and one Work page, a loading skeleton,
   the opening; installs the package by the release address).
2. Workflows: finish `ci.yml` (Storybook build, axe, starter build from the packed file, pack dry
   run, starter version check), add `release.yml` (with `verify-release`) and `pages.yml`. Least
   permissions, every action pinned to a SHA read from GitHub.
3. Docs: `docs/DESIGN_THEME.md` (master copy, generic), `CLAUDE.md`, `CHANGELOG.md`, the README
   guide with "Add another language (example: Urdu)", "Add a brand palette" and the owner's click
   steps.
4. Open the pull request, CI green, report to the owner.

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
