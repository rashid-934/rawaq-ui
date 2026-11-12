// Checks the size of the built package against `size-budget.json`: a size more than 10 percent
// above its budget fails, and so does one more than 30 percent below it (a part left out of the
// build). The budget holds the sizes of version 1.1.0 (the hardening pass).
//
//   yarn build && yarn check:size            check
//   yarn build && yarn check:size --write    write the current sizes as the new budget (only in
//                                            a pull request that says why the package grew)
//
// JavaScript is counted per file, as an app's bundler reads them: the bytes of every `.js` file
// in `dist`, and the sum of each file gzipped on its own.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const repo = join(import.meta.dirname, '..');
const dist = join(repo, 'dist');
const budgetFile = join(repo, 'size-budget.json');
const ALLOWANCE = 1.1;
const FLOOR = 0.7;

const gzip = (bytes) => gzipSync(bytes, { level: 9 }).length;

function measure() {
  const scripts = readdirSync(dist, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(join(dist, file)));
  const file = (name) => {
    const bytes = readFileSync(join(dist, name));
    return { bytes: bytes.length, gzip: gzip(bytes) };
  };
  return {
    javascript: {
      files: scripts.length,
      bytes: scripts.reduce((sum, bytes) => sum + bytes.length, 0),
      gzip: scripts.reduce((sum, bytes) => sum + gzip(bytes), 0),
    },
    'styles.css': file('styles.css'),
    'tokens.css': file('tokens.css'),
    'tokens.json': file('tokens.json'),
  };
}

const now = measure();

if (process.argv.includes('--write')) {
  const budget = {
    note: 'Sizes of the built package. +10 percent fails (scripts/check-size.mjs).',
    ...now,
  };
  writeFileSync(budgetFile, `${JSON.stringify(budget, null, 2)}\n`);
  console.log(`Wrote ${relative(repo, budgetFile)}.`);
  process.exit(0);
}

const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
const problems = [];
for (const [part, sizes] of Object.entries(now)) {
  for (const [kind, value] of Object.entries(sizes)) {
    const allowed = budget[part]?.[kind];
    if (typeof allowed !== 'number') {
      problems.push(`${part} ${kind}: no budget (run with --write in a pull request)`);
      continue;
    }
    const change = allowed === 0 ? 0 : ((value - allowed) / allowed) * 100;
    const line = `${part} ${kind}: ${value} (budget ${allowed}, ${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`;
    console.log(`  ${line}`);
    if (value > allowed * ALLOWANCE) {
      problems.push(`${line}: more than 10 percent over`);
    } else if (value < allowed * FLOOR) {
      problems.push(`${line}: more than 30 percent under (is a part missing from the build?)`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Outside the size budget:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('The built package is within its size budget.');
