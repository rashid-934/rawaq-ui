# CLAUDE.md: Rawaq UI

Rawaq UI is one theme (design tokens, an app shell and motion) for React and Mantine apps. Read
this file before every task in this repository. The design itself is in `docs/DESIGN_THEME.md`;
where things stand is in `PROGRESS.md`.

## What belongs here

- Tokens (`src/tokens`), the Mantine theme builder (`src/theme`), the shell and the motion parts
  (`src/components`), their words (`src/labels.ts`), the app-wide stylesheet (`src/styles`).
- Stories (`src/stories`, `.storybook`) and a starter app (`examples/starter`). Neither ships in
  the package.

## What never belongs here

- Business code or business data of any app. No company names, no real people, no real numbers.
  Sample content in stories and in the starter is invented.
- Next.js, next-intl or any other framework or translation library in `src` (lint blocks the
  imports). The package depends on React, Mantine and the Tabler icons only, as peers.
- Secrets, tokens or keys. The workflows use only the token GitHub gives each run.

## Rules

1. **Tokens only.** No hardcoded colour and no hardcoded timing in a component or a stylesheet.
   Colours, rounding, spacing, fonts and motion timings come from `src/tokens` through the
   `--app-*` and `--mantine-*` variables. Stylelint refuses hex colours.
2. **Contrast.** Every preset, every sidebar swatch and every brand palette must pass the pairs
   of `docs/DESIGN_THEME.md` section 2 (`src/tokens/contrast.test.ts`,
   `src/tokens/check-palette.ts`). A new colour comes with its pairs.
3. **Any language.** Direction comes from `directionOf` or the page's `dir`, fonts from the font
   token, words from props (`labels`), with English and Arabic built in. Never test for one
   language in code or in CSS (`src/language-checks.test.ts` fails on it). Use logical CSS
   properties, `:dir(rtl)` and `[dir='rtl']`.
4. **Reduced motion.** Everything that moves is off with `prefers-reduced-motion: reduce`.
5. **Server components.** A part with no state and no effect has no `'use client'` line, so
   server-rendering apps can use it. Use flat Mantine parts (`TableThead`), never `Table.Thead`.
   A client component keeps `'use client'` as its first line (`yarn check:dist` checks the build).
6. **Sticky, fixed and floating things** are checked while the page scrolls, in both directions.
7. **Table defaults** are checked on a table that holds inputs as well as on a plain one.
8. **Tests never wait for an animation.** The axe run and the unit tests work with reduced
   motion or finish the animations first.
9. **No experimental features** of any tool without asking the owner.
10. **Versions.** Semantic versions, bumped by hand in a pull request: `package.json`, the
    starter's address (`yarn check:starter`) and a section in `CHANGELOG.md`. A released file is
    never replaced: a fix is a new version.
11. **Names in CSS.** The `--app-*` variable names and the test ids are a public promise to the
    apps. Removing or renaming one is a breaking change (`src/tokens/variables.test.ts`).

## Working in this repository

- One step, one branch, one pull request. Never push to `main`. Never merge a pull request,
  never change repository settings, secrets, rulesets or Actions settings: the owner does that.
  Before pushing, check that the branch's pull request is still open.
- **Commits use the GitHub noreply address only**, as author and as committer. This folder has
  its own git identity. Before every push:
  `git log --format='%ae %ce' origin/main..HEAD | sort -u` must show the noreply address only.
  CI repeats the check. Never write a personal email address in any file or log.
- **Workflows**: every workflow starts with `permissions: contents: read`; a job gets more only
  when it must (the release job, the Pages deploy job). Every action is pinned to a full commit
  SHA, read from GitHub, with the version in a comment.
- Before saying done: `yarn test` (format, lint, types, unit tests), `yarn build`,
  `yarn check:dist`, `yarn check:starter`, `yarn storybook:build`, `yarn axe`,
  `yarn comfort`. Look at the
  stories in English, Arabic and Urdu at 1280 x 720 and 1920 x 1080. Then read the CI result.
- The linter and formatter configs are not edited to make a finding go away: fix the code.
- Text the package writes (errors, labels) has no em dashes. Plain words.

## Commands

| Command | What it does |
|---|---|
| `yarn test` | Format check, lint, type check, unit tests |
| `yarn build` | Builds `dist` (JavaScript, types, `styles.css`, `tokens.css`, `tokens.json`) |
| `yarn check:dist` | Checks the built package |
| `yarn check:starter` | The starter installs the version in `package.json` |
| `yarn storybook` | Storybook on port 6006 |
| `yarn storybook:build` then `yarn axe` | axe on every story (WCAG 2.2 AA) |
| `yarn storybook:build` then `yarn comfort` | Layout, target size, keyboard, zoom, high contrast and right-to-left motion checks |
