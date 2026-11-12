// No code in this repository writes HTML from a string or runs a string as code. Words and sample
// data reach the page only as React text, so a word with markup in it stays text. This test reads
// every source file (the package, its stories and tests, the starter, the scripts and the browser
// tests) and fails on such a call.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The repository: this file sits in `src`. */
const repo = join(import.meta.dirname, '..');
const FOLDERS = ['src', '.storybook', 'scripts', 'e2e', 'examples/starter/src'];
const SINGLE_FILES = [
  'playwright.config.ts',
  'vite.config.ts',
  'vitest.config.ts',
  'vitest.setup.ts',
];
const CODE_FILE = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
const THIS_FILE = 'src/code-safety.test.ts';

const files = [
  ...FOLDERS.flatMap((folder) =>
    readdirSync(join(repo, folder), { recursive: true, encoding: 'utf8' })
      .filter((file) => CODE_FILE.test(file) && !file.includes('node_modules'))
      .map((file) => `${folder}/${file.replaceAll('\\', '/')}`)
  ),
  ...SINGLE_FILES,
].filter((file) => file !== THIS_FILE);

const sources: Record<string, string> = Object.fromEntries(
  files.map((file) => [file, readFileSync(join(repo, file), 'utf8')])
);

const forbidden: [what: string, pattern: RegExp][] = [
  ['dangerouslySetInnerHTML', /\bdangerouslySetInnerHTML\b/],
  // `window.eval(` too; Playwright's `$eval(` is a different call.
  ['eval', /(?<![\w$])eval\s*\(/],
  ['new Function', /\bnew\s+Function\s*\(/],
  ['innerHTML or outerHTML written', /\.(?:inner|outer)HTML\s*\+?=(?!=)/],
  ['insertAdjacentHTML', /\.insertAdjacentHTML\s*\(/],
  ['document.write', /\bdocument\.write(?:ln)?\s*\(/],
  ['a timer that runs a string', /\bset(?:Timeout|Interval)\s*\(\s*['"`]/],
];

function problemsIn(text: string): string[] {
  return forbidden.filter(([, pattern]) => pattern.test(text)).map(([what]) => what);
}

describe('no HTML from strings and no strings run as code', () => {
  it.each([
    '<div dangerouslySetInnerHTML={{ __html: text }} />',
    'const value = eval(input);',
    'window.eval (input)',
    'const run = new Function("a", body);',
    'node.innerHTML = label;',
    'node.outerHTML += part;',
    "node.insertAdjacentHTML('beforeend', text);",
    'document.write(text);',
    "setTimeout('run()', 10);",
  ])('catches: %s', (line) => {
    expect(problemsIn(line)).not.toEqual([]);
  });

  it.each([
    'const evaluate = (value) => value;',
    'retrieval(input);',
    'if (node.innerHTML === before) {',
    'const html = node.innerHTML;',
    'setTimeout(() => run(), 10);',
    'const fn: Function = noop;',
  ])('lets through: %s', (line) => {
    expect(problemsIn(line)).toEqual([]);
  });

  it('reads the source files', () => {
    expect(files.length).toBeGreaterThan(50);
    expect(Object.keys(sources)).toContain('src/index.ts');
    expect(Object.keys(sources)).toContain('examples/starter/src/app/rawaq-gallery/layout.tsx');
    expect(Object.keys(sources)).toContain('e2e/support.ts');
    expect(Object.keys(sources)).not.toContain(THIS_FILE);
  });

  it.each(Object.keys(sources))('%s', (file) => {
    expect(problemsIn(sources[file] ?? '')).toEqual([]);
  });
});
