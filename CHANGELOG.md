# Changelog

Every release has a section here. Its text becomes the notes of the GitHub Release.

## 1.1.1

Two fixes for the keyboard and for narrow windows. The look does not change: 476 of 476 pictures
of 1.1.0 are drawn the same. Nothing was renamed or removed: an app moves to it by changing the
address only.

- **Password field**: with the keyboard on it, a password field now shows the same focus ring as
  every other field (a 3 px outline, so it also shows in Windows high contrast). Before, only its
  border got darker: Mantine keeps the focus on an input inside the field's box, and no rule drew
  a ring for it (WCAG 2.4.7).
- **Table header in a narrow window**: below 768 px wide, which is also a 1280 px window zoomed
  to 200 percent, a table inside `TableWrap` (`.table-wrap`) scrolls sideways on its own. Its
  sticky header then sat 68 px down inside it, over the first rows. It now stays above its rows.
  At 768 px and wider nothing changes: the header sticks under the app header as before
  (WCAG 1.4.4 and 2.4.11).
- **Checks**: two new stories ("Password field" and "Work page, short table"). The comfort checks
  walk them with the keyboard, at 200 percent zoom and in forced colours, and now fail when a
  focus ring is missing or cut off by the box around it, when a table header lies over its rows,
  or when it no longer sticks under the app header in a wide window.

## 1.1.0

A hardening release: the same look (448 of 448 pictures of 1.0.0 drawn the same), smoother
motion, three new parts for empty, error and not-found screens, and more checks. Nothing was
renamed or removed: an app moves to it by changing the address only.

- **New parts**: `EmptyState` with the variants `empty`, `error` and `not-found` (one shape); an
  error screen shows only a short reference code with a copy button, never a message or a stack
  (`isReferenceCode`, `makeReference`). `ErrorBoundary` catches a broken part, shows the error
  screen with "Try again" and hands the error to `onError` for the app's log; when the broken
  part had the keyboard focus, the error's heading takes it, and `onReset` tells the app when the
  part is back. Their words are in English and Arabic.
- **Motion**: every duration and easing is a token in one place (new: `tooltip`, `pop`,
  `introSafety`, `ease`, `easeBreath`, the helper `motionMs()`, and their `--app-*` variables).
  The rail's glow slides by `transform` only, mirrors by itself in right-to-left pages, and an
  entry of the rail is drawn again only when what it shows changes. "Show labels" keeps its
  0.2 s slide (the one accepted exception, `docs/DESIGN_THEME.md` section 7).
- **Words**: `RawaqLabels` has nine new words for the new parts (`emptyTitle`, `errorTitle`,
  `errorHelp`, `notFoundTitle`, `notFoundHelp`, `tryAgain`, `reference`, `copyReference`,
  `referenceCopied`). A word that is not given falls back to English. Only code that declared a
  complete object with the type `RawaqLabels` will be asked by TypeScript for the nine words;
  `labels` passed as in the README needs no change.
- **Package**: `"license": "UNLICENSED"` and `"private": true`, locked by a test. Size: JavaScript
  93.5 kB (35.8 kB gzip, 42 files), `styles.css` 45.6 kB (10.2 kB gzip); a page pays only for the
  parts it uses.
- **Checks**: browser tests on the starter in Chromium, Firefox and WebKit (every page and every
  gallery page in English and Arabic, axe, the first painted frame in the saved look, CPU 4x),
  comfort checks on every story (layout, target size, keyboard, zoom, high contrast,
  right-to-left motion), a size budget, a scan of everything built for secrets and private data,
  and guards against hardcoded timings and HTML from strings.
- **Starter**: Next.js 16.4.6 (16.0.0 to 16.4.0 have two critical security advisories), security
  headers, browser source maps off, and the gallery `/rawaq-gallery` (full pages in every look;
  in production only with `RAWAQ_GALLERY=1`).

## 1.0.0

The first release. The package is the same as the test release 1.0.0-rc.1: the first app moved to
it with no visible change, and no fix was needed.

- **Tokens**: seven colour presets, ten sidebar swatches, two densities, rounding, font sizes,
  motion timings, number card tints. As TypeScript (`rawaq-ui/tokens`), as CSS variables
  (`rawaq-ui/tokens.css`) and as data (`rawaq-ui/tokens.json`).
- **Theme**: `createRawaqTheme` builds the Mantine theme and the `--app-*` CSS variables for a
  preset or a brand palette, a sidebar colour, a density and a language. A brand palette is
  checked against the contrast pairs every preset passes and refused with the failing pairs.
- **Any language**: `directionOf` and the right-to-left list, fonts per language with an optional
  line height, every word of the components as a prop. English and Arabic are built in.
- **Shell**: `Rail`, `Frame`, `PageHeader`, the Overview parts (`OverviewPage`, `HeroBanner`,
  `Emphasis`, `BentoCard`, `StatGrid`, `StatCard`) and the Work parts (`WorkPage`, `WorkCard`,
  `FormGrid`, `FormGridItem`, `TableWrap`, `pageTableProps`).
- **Motion**: `IntroReveal`, `RollingNumber`, `PageSkeleton`, the page fade, and the `grow-x` and
  `grow-y` bar utilities. All of it is off with reduced motion.
- **Stylesheet**: `rawaq-ui/styles.css` with the haze, the focus ring, table rules and the
  styles of the components.

## 1.0.0-rc.1

A test release of version 1.0.0, to prove that the release file installs in an app.

- **Tokens**: seven colour presets, ten sidebar swatches, two densities, rounding, font sizes,
  motion timings, number card tints. As TypeScript (`rawaq-ui/tokens`), as CSS variables
  (`rawaq-ui/tokens.css`) and as data (`rawaq-ui/tokens.json`).
- **Theme**: `createRawaqTheme` builds the Mantine theme and the `--app-*` CSS variables for a
  preset or a brand palette, a sidebar colour, a density and a language. A brand palette is
  checked against the contrast pairs every preset passes and refused with the failing pairs.
- **Any language**: `directionOf` and the right-to-left list, fonts per language with an optional
  line height, every word of the components as a prop. English and Arabic are built in.
- **Shell**: `Rail`, `Frame`, `PageHeader`, the Overview parts (`OverviewPage`, `HeroBanner`,
  `Emphasis`, `BentoCard`, `StatGrid`, `StatCard`) and the Work parts (`WorkPage`, `WorkCard`,
  `FormGrid`, `FormGridItem`, `TableWrap`, `pageTableProps`).
- **Motion**: `IntroReveal`, `RollingNumber`, `PageSkeleton`, the page fade, and the `grow-x` and
  `grow-y` bar utilities. All of it is off with reduced motion.
- **Stylesheet**: `rawaq-ui/styles.css` with the haze, the focus ring, table rules and the
  styles of the components.
