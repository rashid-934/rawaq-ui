# Rawaq UI

Rawaq UI (رواق) is one theme for React and Mantine apps: design tokens, an app shell and motion.
The layout style is called "Rail and Bento": a dark floating icon rail, a soft haze background
and the app inside one rounded frame.

- The design: [docs/DESIGN_THEME.md](docs/DESIGN_THEME.md)
- A working example: [examples/starter](examples/starter)
- What changed in each version: [CHANGELOG.md](CHANGELOG.md)

It works in any language. English and Arabic are built in; another language brings its own
words and font (see "Add another language").

## Start a new app with Rawaq UI

The fastest way: copy the folder `examples/starter`, install, run. It is a small Next.js app
with everything below already done.

To add Rawaq UI to an app step by step:

1. **Install it.** Rawaq UI is not on npm. Each version is one file on the
   [Releases page](https://github.com/rashid-934/rawaq-ui/releases). Put its address in
   `package.json`, with the version you want in both places:

   ```json
   "rawaq-ui": "https://github.com/rashid-934/rawaq-ui/releases/download/v<version>/rawaq-ui-<version>.tgz"
   ```

   Also install what it builds on: `@mantine/core`, `@mantine/hooks`, `@tabler/icons-react`,
   `react`, `react-dom`, and the two fonts `@fontsource-variable/plus-jakarta-sans` and
   `@fontsource/ibm-plex-sans-arabic`. Then run your package manager's install. No token and no
   sign-in are needed.

2. **Load the styles**, once, at the top of the app, in this order:

   ```ts
   import '@mantine/core/styles.css';
   import '@fontsource-variable/plus-jakarta-sans/index.css';
   import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
   import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
   import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
   import 'rawaq-ui/styles.css';
   ```

3. **Set the language and the direction on the page.** `directionOf` knows which languages are
   written right to left:

   ```tsx
   import { directionOf } from 'rawaq-ui/tokens';

   <html lang={locale} dir={directionOf(locale)}>
   ```

4. **Give the app its theme**, in a client component:

   ```tsx
   'use client';
   import { DirectionProvider, MantineProvider } from '@mantine/core';
   import { createRawaqTheme } from 'rawaq-ui';

   const { theme, cssVariablesResolver } = createRawaqTheme({ locale });

   <DirectionProvider initialDirection={dir} detectDirection={false}>
     <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="light">
       {children}
     </MantineProvider>
   </DirectionProvider>
   ```

5. **Put the rail and the frame around the pages.** The app gives the rail its entries, its
   link component and the current address:

   ```tsx
   <Frame
     pageKind={pathname === '/' ? 'overview' : 'work'}
     pathname={pathname}
     showLabels={showLabels}
     locale={locale}
     rail={
       <Rail
         id="app-navigation"
         appName="My app"
         items={[{ key: 'home', href: '/', label: 'Home', icon: IconHome, exact: true }]}
         pathname={pathname}
         linkComponent={Link}
         showLabels={showLabels}
         onToggleLabels={toggleLabels}
         locale={locale}
       />
     }
     header={<Search />}
   >
     {children}
   </Frame>
   ```

6. **Build pages from the parts** (next section). The starter has one page of each kind.

## The parts

| Part | What it is |
|---|---|
| `Rail` | The floating icon rail: tooltips, the sliding glow, "Show labels", groups |
| `Frame` | The rounded frame with its sticky header, the haze edge and the page fade |
| `PageHeader` | The one-line header of a Work page: title, count, description, actions |
| `OverviewPage`, `HeroBanner`, `Emphasis`, `BentoCard`, `StatGrid`, `StatCard` | An Overview page: a bento grid, a hero banner, number cards |
| `WorkPage`, `WorkCard`, `FormGrid`, `FormGridItem`, `TableWrap` | A Work page: header, filters, content; fields in two columns; a table wrapper |
| `pageTableProps` | Spread on the main `<Table>` of a Work page: its header row sticks |
| `RollingNumber` | A big number whose digits roll into place once |
| `PageSkeleton` | Soft placeholder shapes while a page loads (`overview`, `table`, `form`, `card`) |
| `IntroReveal` | The opening, once per sign-in |
| `.rise`, `.grow-x`, `.grow-y`, `.num`, `.tabular`, `.mirror-rtl` | Utility classes: entrance, growing bars, numbers, icons that flip |

Everything that moves is off when the device asks for reduced motion.

See every part, in three languages and seven presets, in the Storybook: `yarn storybook`.

## Choose the look

```ts
createRawaqTheme({ preset: 'stone-navy', sidebar: 'plum', density: 'comfortable', locale });
```

- `preset`: `sand-forest` (default), `stone-navy`, `pearl-teal`, `linen-burgundy`,
  `graphite-amber`, `slate-gray`, `onyx-black`.
- `sidebar`: `match` (default: the preset's own rail colour) or a swatch: `forest`, `navy`,
  `deep-teal`, `burgundy`, `graphite`, `olive`, `plum`, `espresso`, `slate`, `onyx`.
- `density`: `compact` (default) or `comfortable`.

To read a stored choice safely: `parseThemeSettings({ preset, sidebar, density })` replaces any
unknown value with its default.

## Add a brand palette

Instead of a preset, give your own nine colours (six digit hex values):

```ts
createRawaqTheme({
  palette: {
    background: '#F4F6FB',
    card: '#FFFFFF',
    border: '#DDE3EE',
    sidebar: '#1D2A4D',
    accent: '#3346A8',
    highlight: '#E2A93B',
    hazeFrom: '#E4E9F6',
    hazeTo: '#F6ECDD',
    glow: '#D5DDF7',
  },
});
```

The palette is checked against the same contrast pairs as the presets (WCAG 2.2 AA). A palette
that fails is refused with a `RawaqPaletteError` that names each failing pair, the ratio it has
and the ratio it needs. To show the problems in a settings screen instead, call
`checkPalette(palette)`: it returns the same report without throwing.

## Fonts

Plus Jakarta Sans (Latin) and IBM Plex Sans Arabic (Arabic) are the built-in faces. The app
loads the font files (step 2 above); Rawaq UI only names them. To use another face, pass
`fonts`:

```ts
createRawaqTheme({ locale, fonts: { default: { family: 'Inter' } } });
```

## Add another language (example: Urdu)

English and Arabic need nothing. For another language, four small things:

1. **Direction.** `ar`, `ur`, `fa` and `he` are known as right to left. For another
   right-to-left language, pass it: `directionOf(locale, ['ps'])`.
2. **Font.** Load the font files in the app, then name the face for the language. A script that
   needs taller lines also gives a line height:

   ```ts
   import '@fontsource/noto-nastaliq-urdu/arabic-400.css';

   createRawaqTheme({
     locale: 'ur',
     fonts: { ur: { family: "'Noto Nastaliq Urdu'", lineHeight: 2.2 } },
   });
   ```

   Text, headings and Rawaq UI's own parts follow that line height. Mantine controls with a fixed
   height (buttons, badges, inputs) keep their height.
3. **Words.** The few words Rawaq UI says itself are passed as `labels`, with the `locale`:

   ```tsx
   const labels = {
     skipToContent: 'مرکزی مواد پر جائیں',
     mainNavigation: 'مرکزی مینو',
     showLabels: 'نام دکھائیں',
     labelsNotSaved: 'یہ انتخاب محفوظ نہیں ہو سکا۔',
     loading: 'لوڈ ہو رہا ہے',
     itemCount: (count: number) => `${count} آئٹمز`,
   };

   <Rail locale="ur" labels={labels} ... />
   <Frame locale="ur" labels={labels} ... />
   <PageHeader locale="ur" labels={labels} ... />
   <PageSkeleton locale="ur" labels={labels} ... />
   ```

4. **The app's own words** (page names, button texts) come from the app's translations, as for
   any language.

The Storybook has two Urdu stories that do exactly this.

## Tokens without React

- `rawaq-ui/tokens`: the tokens as plain TypeScript (no React, no Mantine at run time).
- `rawaq-ui/tokens.css`: every `--app-*` variable. The default look is on `:root`; set
  `data-rawaq-preset`, `data-rawaq-sidebar` and `data-rawaq-density` on `<html>` for another.
- `rawaq-ui/tokens.json`: the same values as data, for design tools and other platforms.

## Move to a newer version

Change the version in the address in `package.json` (both places) and install again. Read that
version's section in [CHANGELOG.md](CHANGELOG.md) first. A released file is never replaced: a
fix is always a new version.

## Working on Rawaq UI

Node.js 22 or newer and Yarn 4 through Corepack (`corepack yarn <script>`).

| Command | What it does |
|---|---|
| `yarn test` | Format check, lint, type check, unit tests |
| `yarn build` | Builds the package into `dist` |
| `yarn check:dist` | Checks the built package |
| `yarn check:starter` | Checks that the starter installs the version in `package.json` |
| `yarn storybook` | Storybook on `http://localhost:6006` |
| `yarn storybook:build`, then `yarn axe` | Runs axe on every story (WCAG 2.2 AA, both languages, seven presets, both densities) |
| `yarn storybook:build`, then `yarn comfort` | Layout, target size, keyboard, 200 percent zoom, high contrast and right-to-left motion checks on every story |

The rules for changes are in [CLAUDE.md](CLAUDE.md).

### How a version is released

1. A pull request sets the new version in `package.json` and in the starter's address, and adds
   the version's section to `CHANGELOG.md`.
2. After the merge, a tag `v<version>` is pushed.
3. GitHub runs the checks, attaches `rawaq-ui-<version>.tgz` to a new Release with the notes from
   the changelog, then installs and builds the starter from the released file.

## For the owner of the repository: three settings

These are done once, by hand, in the browser. Nothing in this repository changes settings.

**1. Keep your email private** (before the first merge). GitHub > your picture > Settings >
Emails > tick "Keep my email addresses private" and "Block command line pushes that expose my
email". GitHub writes merge commits itself, with your account's email; this hides it.

**2. Protect `main`** (after the first pull request has run its checks once). Repository >
Settings > Rules > Rulesets > New ruleset > New branch ruleset. Name: `main`. Enforcement
status: Active. Target branches: Add target > Include default branch. Tick "Restrict
deletions", "Block force pushes", "Require a pull request before merging" and "Require status
checks to pass" > Add checks > choose `checks`, `storybook and accessibility` and `starter`.
Create.

**3. Put the Storybook online.** Repository > Settings > Pages > Build and deployment > Source:
"GitHub Actions". Nothing else. After the next merge to `main` (or Actions > "Storybook online"
> Run workflow) it is at `https://rashid-934.github.io/rawaq-ui/`. It is public, like the
repository. Until you switch it on, that workflow does nothing and stays green.

## Rights

All rights reserved. The code is public to read. It is not open source.
