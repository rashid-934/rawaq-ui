# Progress

## Status note, 11 Nov 2026 (end of the first working session)

The owner approved the plan for Rawaq UI v1 on 11 Nov 2026, with seven additions. Branch:
`feat/v1`. Nothing is released yet. The pull request for v1 is not opened yet.

### Done

- Repository created (public). `main` holds only the README stub and `.gitignore`.
- Tooling: Yarn 4, TypeScript 7, Vite 8 library build (ES modules, one file per source file, one
  `dist/styles.css`, class names `rq-<File>-<class>` with no hash), types from `tsc`, Vitest with
  jsdom, oxlint, oxfmt, stylelint (logical properties only, no hex colours), PostCSS with
  `postcss-preset-mantine` 1.18.0.
- Tokens in `src/tokens` (presets, sidebar swatches, density, palette maths, contrast, KPI tints,
  fonts, settings parser) and the Mantine theme builder in `src/theme` (`createRawaqTheme` for a
  preset, a sidebar and a density). Their tests pass: 459 (every contrast pair for every preset
  and every swatch, palette, theme).
- The app-wide stylesheet `src/styles/global.css` (haze, focus ring, tables, `.rise`, reduced
  motion) builds into `dist/styles.css`.
- CI (`ci.yml`): commit address check, install, format, lint, types, tests, build. Actions are
  pinned to commit SHAs; permissions are read only.
- Every commit uses the GitHub noreply address (the folder has its own git identity).

### Next, in this order

1. Theme builder: a custom `palette` with the contrast check and a clear error; `locale` and
   `fonts` per locale; `rtlLocales` and `directionOf`; radius, spacing and motion timing tokens;
   `tokens.css` and `tokens.json` (script), and the `./tokens.css`, `./tokens.json` exports.
2. Tidy the comments in `src/tokens` and `src/styles/global.css` that still speak of "company"
   settings or app paths; widen the `:lang(ar)` rule to the right-to-left scripts.
3. Shell: `Rail`, `Frame`, `PageHeader`, Overview and Work page layouts, table defaults. Links, the
   current address and every word come in as props (`labels`, English and Arabic defaults).
4. Motion: `IntroReveal`, `RollingNumber`, `PageSkeleton`, page fade, grow-bar utilities.
5. Component tests (one file each), the Vitest setup stubs (`matchMedia`, `ResizeObserver`).
6. Storybook (`@storybook/react-vite`): every component, toolbar for preset, sidebar, density and
   language (English, Arabic, Urdu), a gallery of the seven presets, the Urdu story.
7. `scripts/check-dist`, the axe script over every story, `examples/starter`.
8. Workflows: finish `ci.yml`, add `release.yml` (with `verify-release`) and `pages.yml`.
9. Docs: `docs/DESIGN_THEME.md` (master copy, generic), `CLAUDE.md`, `CHANGELOG.md`, the README
   guide with "Add another language (example: Urdu)" and the owner's click steps.
10. Open the pull request, CI green, report to the owner.

### Notes for whoever continues

- Yarn on the owner's laptop refuses packages published in the last few days (a safety gate).
  Ask for a range such as `^8.0.0`, not the very newest version.
- Run Yarn as `corepack yarn <script>`.
- Before every push: `git log --format='%ae %ce' origin/main..HEAD | sort -u` must show the
  noreply address only.
