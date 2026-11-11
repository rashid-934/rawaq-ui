// Rawaq UI works in any language. Direction comes from `directionOf` or the `dir` of the page,
// fonts from the font token, words from props. So no code and no CSS in the package may test for
// one language. This test reads every source file and fails on such a test.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The `src` folder: this file sits at its top. */
const root = import.meta.dirname;

/** What ships in the package: no tests, no stories, no test helpers. */
const isSource = (file: string) =>
  /\.(?:ts|tsx|css)$/.test(file) &&
  !/\.test\.tsx?$/.test(file) &&
  !file.startsWith('stories/') &&
  !file.startsWith('test-utils/');

const sources: Record<string, string> = Object.fromEntries(
  readdirSync(root, { recursive: true, encoding: 'utf8' })
    .map((file) => file.replaceAll('\\', '/'))
    .filter(isSource)
    .map((file) => [`./${file}`, readFileSync(join(root, file), 'utf8')])
);

const LANGUAGE = '(?:ar|en|ur|fa|he)';
const QUOTE = '[\'"`]';
const CODE = `${QUOTE}${LANGUAGE}(?:-[A-Za-z]+)?${QUOTE}`;

const forbidden: [what: string, pattern: RegExp][] = [
  ['a comparison with a language code', new RegExp(`[!=]==?\\s*${CODE}|${CODE}\\s*[!=]==?`)],
  ['a switch case for a language code', new RegExp(`\\bcase\\s+${CODE}\\s*:`)],
  ['a text test for a language code', new RegExp(`\\.(?:startsWith|includes)\\(\\s*${CODE}`)],
  ['a :lang() selector', /:lang\(/],
  ['a [lang] attribute selector', /\[lang[|~^$*]?=/],
];

function problemsIn(text: string): string[] {
  return forbidden.filter(([, pattern]) => pattern.test(text)).map(([what]) => what);
}

describe('no test for one language', () => {
  it.each([
    "if (locale === 'ar') {",
    'const rtl = "ur" == locale;',
    "return locale !== 'en-GB';",
    "case 'fa':",
    "if (locale.startsWith('ar')) {",
    ':lang(ar) { letter-spacing: normal; }',
    "html[lang='he'] .title {",
    '[lang|=ar] p {',
  ])('catches: %s', (line) => {
    expect(problemsIn(line)).not.toEqual([]);
  });

  it.each([
    "directionOf(locale) === 'rtl'",
    "export const rtlLocales = ['ar', 'ur', 'fa', 'he'] as const;",
    'ar: { family: "\'IBM Plex Sans Arabic\'" },',
    ':dir(rtl) { letter-spacing: normal; }',
    "[dir='rtl'] .mirror-rtl {",
  ])('allows: %s', (line) => {
    expect(problemsIn(line)).toEqual([]);
  });

  it('reads the source files of the package', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(30);
    expect(Object.keys(sources)).toContain('./styles/global.css');
    expect(Object.keys(sources)).toContain('./components/Rail/Rail.module.css');
    expect(Object.keys(sources)).toContain('./components/Rail/Rail.tsx');
    expect(Object.keys(sources).filter((file) => file.includes('.test.'))).toEqual([]);
  });

  it.each(Object.entries(sources))('%s has none', (_, text) => {
    expect(problemsIn(text)).toEqual([]);
  });
});
