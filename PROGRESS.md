# Progress

## Status note, 11 Nov 2026 (second working session)

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
    of text or heading is tighter). English and Arabic get exactly the theme they had before.
  - `rtlLocales` (`ar`, `ur`, `fa`, `he`) and `directionOf(locale, extraRtlLocales?)`.
- `dist/tokens.css` and `dist/tokens.json` are written by the package build from the same source
  (`scripts/tokens-files.ts`, called from `vite.config.ts`), and exported as `rawaq-ui/tokens.css`
  and `rawaq-ui/tokens.json`. In `tokens.css` the default look is on `:root`; the attributes
  `data-rawaq-preset`, `data-rawaq-sidebar` and `data-rawaq-density` choose another.
- The app-wide stylesheet `src/styles/global.css` (haze, focus ring, tables, `.rise`, reduced
  motion) builds into `dist/styles.css`. Its timings now come from the motion variables. The
  letter-spacing rule that said `:lang(ar)` is now `:dir(rtl)`: it follows the direction of the
  text, so every right-to-left locale is covered. Comments no longer speak of a company or of
  another app's files.
- No test for one language: `src/language-checks.test.ts` reads every source file and fails on a
  comparison with a language code, a `:lang()` selector or a `[lang]` selector. The plan also asked
  for a lint rule; oxlint has no `no-restricted-syntax` rule, and its custom plugins are still
  experimental, so the test (it runs in the same `yarn test` step as lint) is the guard.
- Tests: 600 pass (`yarn test`: format, lint, types, unit tests). `yarn build` is clean.
- Checked in a real browser with the built files: `.rise` runs 0.35 s with a 40 ms stagger capped
  at 7 steps, the right-to-left rule resets letter spacing (a left-to-right island keeps its
  own), and the three `data-rawaq-*` attributes switch the variables in `tokens.css`.
- CI (`ci.yml`): commit address check, install, format, lint, types, tests, build. Actions are
  pinned to commit SHAs; permissions are read only.
- Every commit uses the GitHub noreply address (the folder has its own git identity).

### Next, in this order

1. Shell: `Rail`, `Frame`, `PageHeader`, Overview and Work page layouts, table defaults. Links, the
   current address and every word come in as props (`labels`, English and Arabic defaults).
2. Motion: `IntroReveal`, `RollingNumber`, `PageSkeleton`, page fade, grow-bar utilities. Use the
   `--app-motion-*` variables; add a timing to `motion.ts` when a component needs a new one (the
   0.24 s and 0.3 s values in the app's rail and opening are not tokens yet).
3. Component tests (one file each), the Vitest setup stubs (`matchMedia`, `ResizeObserver`).
4. Storybook (`@storybook/react-vite`): every component, toolbar for preset, sidebar, density and
   language (English, Arabic, Urdu), a gallery of the seven presets, the Urdu story.
5. `scripts/check-dist`, the axe script over every story, `examples/starter`.
6. Workflows: finish `ci.yml`, add `release.yml` (with `verify-release`) and `pages.yml`.
7. Docs: `docs/DESIGN_THEME.md` (master copy, generic), `CLAUDE.md`, `CHANGELOG.md`, the README
   guide with "Add another language (example: Urdu)", "Add a brand palette" and the owner's click
   steps.
8. Open the pull request, CI green, report to the owner.

### Notes for whoever continues

- Yarn on the owner's laptop refuses packages published in the last few days (a safety gate).
  Ask for a range such as `^8.0.0`, not the very newest version.
- Run Yarn as `corepack yarn <script>`.
- Before every push: `git log --format='%ae %ce' origin/main..HEAD | sort -u` must show the
  noreply address only.
- `resolveTokens` and the light-variant constants now live in `src/tokens/resolve.ts` (exported
  from `rawaq-ui/tokens` and from the main entry). The theme's variable set only grew: every
  name the app used before is still there (`src/tokens/variables.test.ts` locks the list).
- When Hub-P- moves to the package, compare the Arabic screens closely where a `dir="ltr"`
  element has letter spacing: `:dir(rtl)` no longer resets it there (`:lang(ar)` did).
