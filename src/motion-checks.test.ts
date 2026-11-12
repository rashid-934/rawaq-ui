// A duration or an easing lives in `src/tokens/motion.ts` and nowhere else (CLAUDE.md rule 1,
// docs/DESIGN_THEME.md section 7). This test reads every source file of the package and fails on
// a timing written by hand, in a stylesheet or in a component.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The `src` folder: this file sits at its top. */
const root = import.meta.dirname;

/** The one file that may hold a timing. */
const TOKENS = 'tokens/motion.ts';

/** What ships in the package: no tests, no stories, no test helpers. */
const isSource = (file: string) =>
  /\.(?:ts|tsx|css)$/.test(file) &&
  !/\.test\.tsx?$/.test(file) &&
  !file.startsWith('stories/') &&
  !file.startsWith('test-utils/') &&
  file !== TOKENS;

const sources: Record<string, string> = Object.fromEntries(
  readdirSync(root, { recursive: true, encoding: 'utf8' })
    .map((file) => file.replaceAll('\\', '/'))
    .filter(isSource)
    .map((file) => [`./${file}`, readFileSync(join(root, file), 'utf8')])
);

const COMMENT = /\/\*[\s\S]*?\*\//g;
/** `var(--app-motion-rise)`, also with a fallback: a token, never a problem. */
const VARIABLE = /var\(--[a-z0-9-]+(?:\s*,[^()]*)?\)/g;
/** The reduced-motion switch sets every time to (almost) nothing, for every element. */
const SWITCH_OFF = /(?<![\w.])0(?:\.01)?ms\s+!important/g;
/** Every `transition` and `animation` declaration, long or short form. */
const DECLARATION = /(?:^|[\s;{])(?:transition|animation)(?:-[a-z-]+)?\s*:([^;{}]+)/g;
const TIME = /(?<![\w.-])\d*\.?\d+m?s\b/;
const EASING =
  /(?<![\w-])(?:ease(?:-in|-out|-in-out)?|linear|step-start|step-end)(?![\w-])|(?:cubic-bezier|steps|linear)\(/;

/** A stylesheet: what is left of a declaration once its tokens are taken out must hold no timing. */
function cssProblems(text: string): string[] {
  const problems = new Set<string>();
  for (const [, value = ''] of text.replaceAll(COMMENT, '').matchAll(DECLARATION)) {
    const rest = value.replaceAll(VARIABLE, '').replaceAll(SWITCH_OFF, '');
    if (TIME.test(rest)) {
      problems.add('a duration written by hand');
    }
    if (EASING.test(rest)) {
      problems.add('an easing written by hand');
    }
  }
  return [...problems];
}

const forbiddenInCode: [what: string, pattern: RegExp][] = [
  ['a duration or delay given as a number', /\b\w*(?:duration|delay)\w*\s*[:=]\s*\{?\s*\d/i],
  ['a timer with a number', /\bset(?:Timeout|Interval)\([^;]*,\s*\d[\d_]*\s*\)/],
  ['a time constant given as a number', /_MS\s*=\s*\d/],
  ['a time written as text', /['"`]\d*\.?\d+m?s['"`]/],
  [
    'an easing written as text',
    /['"`](?:ease(?:-in|-out|-in-out)?|linear|cubic-bezier\([^'"`]*\))['"`]/,
  ],
];

function codeProblems(text: string): string[] {
  return forbiddenInCode.filter(([, pattern]) => pattern.test(text)).map(([what]) => what);
}

const problemsIn = (file: string, text: string) =>
  file.endsWith('.css') ? cssProblems(text) : codeProblems(text);

describe('no timing written by hand', () => {
  it.each([
    '.a { transition: transform 0.2s ease; }',
    '.a { transition: opacity var(--app-motion-fast) ease-in-out; }',
    '.a { transition:\n    transform var(--app-motion-fast) var(--app-ease),\n    opacity 150ms var(--app-ease); }',
    '.a { animation: rise 0.35s var(--app-ease-out) both; }',
    '.a { animation: rise var(--app-motion-rise) cubic-bezier(0.2, 0.7, 0.2, 1); }',
    '.a { animation-duration: 1s; }',
    '.a { transition-delay: 40ms; }',
    '.a { transition-timing-function: linear; }',
    '.a { animation: step var(--app-motion-rise) steps(4); }',
  ])('catches in a stylesheet: %s', (line) => {
    expect(cssProblems(line)).not.toEqual([]);
  });

  it.each([
    '.a { transition: transform var(--app-motion-base) var(--app-ease); }',
    '.a { animation: rise var(--app-motion-rise) var(--app-ease-out) both; }',
    '.a { animation: pulse var(--app-motion-skeleton-pulse) var(--app-ease-breath) infinite alternate; }',
    '.a { animation-delay: calc(min(var(--stagger, 0), var(--app-motion-max-stagger)) * var(--app-motion-rise-stagger)); }',
    '.a { transition: none; }',
    '.a { animation: none; }',
    '.a { animation-name: grow-y; }',
    '* { animation-duration: 0.01ms !important; animation-delay: 0ms !important; }',
    '* { animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }',
    '/* fade and rise 8px in 0.35s; transition: all 1s ease; */ .a { color: red; }',
    '.a { inline-size: rem(220px); block-size: 100%; }',
  ])('allows in a stylesheet: %s', (line) => {
    expect(cssProblems(line)).toEqual([]);
  });

  it.each([
    "transitionProps={{ transition: 'fade', duration: 120 }}",
    '<Tooltip openDelay={300} label="x">',
    'window.setTimeout(() => setDone(true), 1500);',
    'export const INTRO_SAFETY_MS = 1500;',
    "const style = { transitionDuration: '0.2s' };",
    "element.animate(frames, { easing: 'ease-out' });",
    "const curve = 'cubic-bezier(0.2, 0.7, 0.2, 1)';",
  ])('catches in a component: %s', (line) => {
    expect(codeProblems(line)).not.toEqual([]);
  });

  it.each([
    "transitionProps={{ transition: 'fade', duration: motionMs('tooltip') }}",
    'const timer = window.setTimeout(() => setDone(true), INTRO_SAFETY_MS);',
    "export const INTRO_SAFETY_MS = motionMs('introSafety');",
    "style={{ '--digit': Number(part.text), '--order': order[index] } as CSSProperties}",
    "frameRadius: '24px',",
    "const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];",
  ])('allows in a component: %s', (line) => {
    expect(codeProblems(line)).toEqual([]);
  });

  it('reads the source files of the package, but not the token file', () => {
    const files = Object.keys(sources);
    expect(files.length).toBeGreaterThan(30);
    expect(files).toContain('./styles/global.css');
    expect(files).toContain('./components/Rail/Rail.module.css');
    expect(files).toContain('./components/Rail/Rail.tsx');
    expect(files).toContain('./components/IntroReveal/IntroReveal.tsx');
    expect(files).not.toContain(`./${TOKENS}`);
    expect(files.filter((file) => file.includes('.test.'))).toEqual([]);
  });

  it.each(Object.entries(sources))('%s has none', (file, text) => {
    expect(problemsIn(file, text)).toEqual([]);
  });
});
