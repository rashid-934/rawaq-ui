# Third-party licences

Made on 12 Nov 2026 from the installed packages (`node_modules` of this repository and of
`examples/starter`), reading the `license` field of each `package.json`. Rawaq UI itself is
`UNLICENSED` (private, no licence granted) until the owner chooses one.

## What the package ships

The package file holds only `dist`: Rawaq UI's own code, styles and token files. Vite builds it
with React, React DOM, Mantine and the Tabler icons left out (`vite.config.ts`, `external`), and
the package has no `dependencies`. So **no third-party code and no font file is inside the
package**. An app that uses it installs these peers itself, under their own licences:

| Peer | Version range | Licence |
|---|---|---|
| `@mantine/core`, `@mantine/hooks` | `^9.6.0` | MIT |
| `@tabler/icons-react` | `^3.35.0` | MIT |
| `react`, `react-dom` | `^19.0.0` | MIT |

## Fonts (flagged: SIL Open Font License 1.1, not MIT, Apache, BSD or ISC)

The theme names the fonts; it does not ship them. The starter and the Storybook load them from
the `@fontsource` packages, which carry the font files and their `LICENSE` file (OFL 1.1).

| Package | Font | Licence | Used by |
|---|---|---|---|
| `@fontsource-variable/plus-jakarta-sans` 5.3.0 | Plus Jakarta Sans | OFL-1.1 | starter, Storybook |
| `@fontsource/ibm-plex-sans-arabic` 5.3.0 | IBM Plex Sans Arabic | OFL-1.1 | starter, Storybook |
| `@fontsource/noto-nastaliq-urdu` 5.3.0 | Noto Nastaliq Urdu | OFL-1.1 | Storybook (Urdu example) |

What OFL 1.1 means here: the fonts may be used, embedded in pages and bundled with an app,
including a paid one. They may not be sold by themselves, a changed font may not keep the
reserved name, and the licence text travels with the font files. Rawaq UI never offers a font
as a separate item. If a font file is ever copied into this repository or an app's own folders,
its `OFL.txt` goes next to it.

## The starter app (`examples/starter`, not shipped)

| Package | Licence | Note |
|---|---|---|
| `next` | MIT | |
| `next-intl` | MIT | |
| `@mantine/core`, `@mantine/hooks`, `@tabler/icons-react`, `react`, `react-dom` | MIT | |
| `typescript` | Apache-2.0 | build only |
| `@img/sharp-*` (installed by `next` for image resizing) | Apache-2.0, with a prebuilt `libvips` under LGPL-3.0-or-later | the starter does not use Next.js image resizing; nothing of it reaches a page |
| `caniuse-lite` | CC-BY-4.0 | browser data for build tools; nothing of it reaches a page |
| `type-fest` | MIT OR CC0-1.0 | types only |

All 98 installed packages of the starter: 65 MIT, 10 Apache-2.0, 8 ISC, 5 BlueOak-1.0.0,
2 BSD-3-Clause, 1 0BSD, 1 Apache-2.0 AND MIT, 1 MIT OR CC0-1.0, the 2 fonts (OFL-1.1), sharp's
binary, `caniuse-lite`, and Rawaq UI itself.

## Development tools (this repository, not shipped)

| Package | Licence |
|---|---|
| `@axe-core/playwright` 4.14.0 (and `axe-core`) | **MPL-2.0** |
| `@playwright/test` 1.65.0, `playwright-core` 1.65.0 | Apache-2.0 |
| `typescript` 7.0.2 | Apache-2.0 |
| `storybook`, `@storybook/react-vite` 10.6.6 | MIT |
| `vite` 8.3.7, `vitest` 5.1.0, `jsdom` 31.0.0 | MIT |
| `oxlint` 1.93.0, `oxfmt` 0.71.0, `oxc-config-mantine` 1.0.3 | MIT |
| `stylelint` 17.16.0, `stylelint-config-standard-scss` 17.0.0 | MIT |
| `postcss` 8.5.32, `postcss-preset-mantine` 1.18.0, `postcss-simple-vars` 7.0.1 | MIT |
| `@testing-library/*` | MIT |
| `@types/node`, `@types/react`, `@types/react-dom` | MIT |
| the peers above, in the versions the tests use | MIT |
| the three `@fontsource` font packages | OFL-1.1 (see above) |

MPL-2.0 (`axe-core`, and `lightningcss` inside Vite) asks that changes to those files are shared
when the files are handed on. They are tools that run on this laptop and in CI; they are not
changed and not handed on in the package.

All 365 installed packages of this repository: 309 MIT, 15 ISC, 12 Apache-2.0, 5 BSD-3-Clause,
5 BlueOak-1.0.0, 4 BSD-2-Clause, 4 MPL-2.0, 3 MIT-0, 3 OFL-1.1, 1 0BSD, 1 CC0-1.0,
1 MIT OR CC0-1.0, 1 Python-2.0, 1 CC-BY-4.0 (`caniuse-lite`).
