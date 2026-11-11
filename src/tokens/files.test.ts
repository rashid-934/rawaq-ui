import { densityKeys } from './density';
import { tokensCss, tokensJson } from './files';
import { presetKeys, presets, textColors } from './presets';
import { sidebarSwatches } from './sidebar';

describe('tokens.css', () => {
  const css = tokensCss();
  const blocks = [...css.matchAll(/^(\S[^{\n]*) \{\n([^}]*)\}/gm)].map(
    ([, selector, body]) => [selector as string, body as string] as const
  );
  const bodyOf = (selector: string) => blocks.find(([name]) => name === selector)?.[1] ?? '';

  it('has the default look on :root, then every preset, sidebar and density', () => {
    expect(blocks.map(([selector]) => selector)).toEqual([
      ':root',
      ...presetKeys.map((key) => `[data-rawaq-preset='${key}']`),
      ...Object.keys(sidebarSwatches).map((key) => `[data-rawaq-sidebar='${key}']`),
      ...densityKeys.map((key) => `[data-rawaq-density='${key}']`),
    ]);
  });

  it('writes only whole --app- declarations', () => {
    for (const [, body] of blocks) {
      for (const line of body.trimEnd().split('\n')) {
        expect(line).toMatch(/^ {2}--app-[a-z0-9-]+: [^;]+;$/);
      }
    }
    expect(css).not.toContain('undefined');
    expect(css.endsWith('}\n')).toBe(true);
  });

  it('gives the colours of the look', () => {
    expect(bodyOf(':root')).toContain(`--app-surface: ${presets['sand-forest'].card};`);
    expect(bodyOf(':root')).toContain(`--app-text: ${textColors.main};`);
    expect(bodyOf(':root')).toContain('--app-motion-rise: 0.35s;');
    expect(bodyOf("[data-rawaq-preset='onyx-black']")).toContain(
      `--app-sidebar: ${presets['onyx-black'].sidebar};`
    );
    expect(bodyOf("[data-rawaq-sidebar='olive']")).toContain(
      `--app-sidebar: ${sidebarSwatches.olive};`
    );
    expect(bodyOf("[data-rawaq-density='comfortable']")).toContain('--app-frame-margin: 16px;');
  });

  it('lets a chosen sidebar win: its block comes after the presets', () => {
    expect(css.indexOf("[data-rawaq-sidebar='forest']")).toBeGreaterThan(
      css.lastIndexOf('[data-rawaq-preset=')
    );
  });
});

describe('tokens.json', () => {
  const data = JSON.parse(tokensJson()) as {
    defaults: Record<string, string>;
    text: Record<string, string>;
    presets: Record<string, Record<string, unknown> & { derived: { accentShades: string[] } }>;
    motion: Record<string, unknown>;
    rtlLocales: string[];
  };

  it('holds the seven presets with their nine colours and what is derived from them', () => {
    expect(Object.keys(data.presets)).toEqual([...presetKeys]);
    expect(data.presets['stone-navy']?.accent).toBe(presets['stone-navy'].accent);
    expect(data.presets['stone-navy']).not.toHaveProperty('key');
    expect(data.presets['stone-navy']?.derived.accentShades).toHaveLength(10);
  });

  it('holds the defaults, the text colours, the motion timings and the direction list', () => {
    expect(data.defaults).toEqual({ preset: 'sand-forest', sidebar: 'match', density: 'compact' });
    expect(data.text.main).toBe(textColors.main);
    expect(data.motion).toMatchObject({ rise: '0.35s', maxStagger: 7 });
    expect(data.rtlLocales).toEqual(['ar', 'ur', 'fa', 'he']);
  });
});
