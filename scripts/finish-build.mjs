// The last step of `yarn build`, after Vite and the type build.
//
// 1. Writes `dist/tokens.css` and `dist/tokens.json`. The text comes from the built package
//    itself (`tokensCss` and `tokensJson` in src/tokens/files.ts), so the files always match the
//    TypeScript tokens. Never edit the two files by hand.
// 2. Takes the stylesheet import out of the type files. The source entry imports its CSS so the
//    build collects it into `dist/styles.css`; the built JavaScript no longer has that line, and
//    the types must not have it either (the path does not exist in the package).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tokensCss, tokensJson } from '../dist/tokens/index.js';

const dist = new URL('../dist/', import.meta.url);

writeFileSync(new URL('tokens.css', dist), tokensCss());
writeFileSync(new URL('tokens.json', dist), tokensJson());

const cssImport = /^import\s+['"][^'"]+\.css['"];?\r?\n/gm;
let cleaned = 0;
for (const name of readdirSync(fileURLToPath(dist), { recursive: true })) {
  if (!name.endsWith('.d.ts')) {
    continue;
  }
  const file = new URL(name.replaceAll('\\', '/'), dist);
  const text = readFileSync(file, 'utf8');
  const without = text.replace(cssImport, '');
  if (without !== text) {
    writeFileSync(file, without);
    cleaned += 1;
  }
}

console.log(
  `Wrote dist/tokens.css and dist/tokens.json; removed stylesheet imports from ${cleaned} type file(s)`
);
