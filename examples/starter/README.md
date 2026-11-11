# Rawaq UI starter

A minimal Next.js app that uses Rawaq UI. Copy this folder to start a new app.

It has:

- the rail and the frame around every page (`src/app/[locale]/shell.tsx`),
- one Overview page: a hero banner, number cards whose digits roll once, a card with bars
  (`src/app/[locale]/page.tsx`),
- one Work page: a one-line header with a count and a dense table with a sticky header
  (`src/app/[locale]/suppliers/page.tsx`), with a loading skeleton (`loading.tsx`),
- the opening, once per browser session,
- English and Arabic (right-to-left), with a language switch in the header.

## Run it

1. Install Node.js 22 or newer.
2. In this folder, run `corepack yarn install`.
3. Run `corepack yarn dev` and open `http://localhost:3000`.

`corepack yarn build` makes the production build.

## Where things are

| File | What it is for |
|---|---|
| `package.json` | Rawaq UI is installed by the address of a release. To move to a newer version, change the version in that address (in both places) and install again. |
| `src/app/[locale]/layout.tsx` | Loads the styles in the right order: Mantine, the fonts, `rawaq-ui/styles.css`, then the app's own. Sets the language and the direction on the page. |
| `src/app/[locale]/providers.tsx` | The look: preset, sidebar colour, density. Change it here. |
| `src/app/[locale]/shell.tsx` | The rail's entries and the header. Add a page to `items` to add it to the rail. |
| `src/app/starter.css` | The app's own styles. They use the `--app-*` variables, never literal colours. |
| `messages/en.json`, `messages/ar.json` | The app's words. Rawaq UI's own words in English and Arabic are built in. |

## About the lockfile

`yarn.lock` is empty until the first install, which fills it in. It is there so Yarn treats this
folder as its own project.
