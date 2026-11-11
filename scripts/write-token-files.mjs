// Writes `dist/tokens.css` and `dist/tokens.json` after the package is built. The text comes from
// the built package itself (`tokensCss` and `tokensJson` in src/tokens/files.ts), so the files
// always match the TypeScript tokens. Run by `yarn build`; never edit the two files by hand.
import { writeFileSync } from 'node:fs';
import { tokensCss, tokensJson } from '../dist/tokens/index.js';

const dist = new URL('../dist/', import.meta.url);

writeFileSync(new URL('tokens.css', dist), tokensCss());
writeFileSync(new URL('tokens.json', dist), tokensJson());

console.log('Wrote dist/tokens.css and dist/tokens.json');
