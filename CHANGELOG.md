# Changelog

Every release has a section here. Its text becomes the notes of the GitHub Release.

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
