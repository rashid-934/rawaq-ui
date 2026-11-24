// Two rules of the app-wide stylesheet that only a browser can prove: `yarn comfort` measures
// them on the built Storybook (the keyboard walk, 200 percent zoom, forced colours). This test is
// the quick guard beside it: it fails as soon as either rule is dropped or drifts.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const COMMENT = /\/\*[\s\S]*?\*\//g;
const css = readFileSync(join(import.meta.dirname, 'global.css'), 'utf8').replaceAll(COMMENT, '');

/** Every rule that holds no other rule, as its selector and its declarations. */
const rules = [...css.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map(([, selector = '', body = '']) => ({
  selector: selector.trim().replaceAll(/\s+/g, ' '),
  declarations: body
    .split(';')
    .map((line) => line.trim().replaceAll(/\s+/g, ' '))
    .filter(Boolean),
}));

describe('the focus ring', () => {
  const ring = rules.filter(({ selector }) => selector.includes('.mantine-focus-auto'));
  const password = rules.filter(({ selector }) =>
    selector.includes('.mantine-PasswordInput-input')
  );

  it('is one rule: a 3 px outline with a dark ring inside it', () => {
    expect(ring).toHaveLength(1);
    expect(ring[0]?.declarations).toEqual([
      'outline: rem(3px) solid var(--app-highlight)',
      'outline-offset: rem(2px)',
      'box-shadow: 0 0 0 rem(2px) var(--app-focus-inner)',
    ]);
  });

  it('is drawn on the box of a password field while its inner input has the keyboard focus', () => {
    expect(password).toHaveLength(1);
    expect(password[0]?.selector).toMatch(
      /^\.mantine-PasswordInput-input\S*:has\(\s*>?\s*\.mantine-PasswordInput-innerInput:focus-visible\s*\)$/
    );
  });

  it('is the same ring on a password field as on every other field', () => {
    expect(password[0]?.declarations).toEqual(ring[0]?.declarations);
  });

  it('keeps the password rule apart, so a browser without :has() keeps every other ring', () => {
    expect(password[0]?.selector).not.toContain(',');
    expect(ring[0]?.selector).not.toContain(':has(');
  });
});

describe('the sticky table header', () => {
  it('sticks right under the app header by default', () => {
    expect(css).toMatch(
      /html\s*\{[^{}]*--app-table-sticky-top:\s*calc\(var\(--app-frame-margin\) \+ var\(--app-header-height\)\);/
    );
  });

  it('stays in its own place inside a table that scrolls sideways (a narrow window only)', () => {
    const narrow =
      /\.table-wrap\s*\{\s*@mixin smaller-than \$mantine-breakpoint-sm\s*\{([^{}]*)/.exec(css);
    expect(narrow?.[1]).toMatch(/overflow-x:\s*auto;/);
    expect(narrow?.[1]).toMatch(/--app-table-sticky-top:\s*0px;/);
  });

  it('sticks under the phone header on a phone, which has no frame margin', () => {
    const phone = /html\s*\{\s*@mixin smaller-than \$mantine-breakpoint-sm\s*\{([^{}]*)/.exec(css);
    expect(phone?.[1]).toMatch(/--app-table-sticky-top:\s*var\(--app-phone-header\);/);
  });

  it('sets that offset nowhere else', () => {
    expect(css.match(/--app-table-sticky-top:/g)).toHaveLength(3);
  });
});
