// Prints the section of CHANGELOG.md for one version: the notes of its GitHub Release.
//   node scripts/release-notes.mjs 1.0.0
// It fails when the changelog has no section for that version, so nothing is released without
// notes.
import { readFileSync } from 'node:fs';

const version = process.argv[2];
if (!version) {
  console.error('release-notes: give the version, for example 1.0.0');
  process.exit(1);
}

const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const lines = changelog.split(/\r?\n/);
// A section starts with "## 1.0.0" (a date may follow) and ends at the next "## ".
const start = lines.findIndex(
  (line) => line === `## ${version}` || line.startsWith(`## ${version} `)
);
if (start === -1) {
  console.error(`release-notes: CHANGELOG.md has no section "## ${version}"`);
  process.exit(1);
}
const rest = lines.slice(start + 1);
const end = rest.findIndex((line) => line.startsWith('## '));
const notes = (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();

if (notes === '') {
  console.error(`release-notes: the section "## ${version}" of CHANGELOG.md is empty`);
  process.exit(1);
}
console.log(notes);
