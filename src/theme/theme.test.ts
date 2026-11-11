import { RawaqPaletteError } from '../tokens/check-palette';
import { densities } from '../tokens/density';
import { kpiTints } from '../tokens/kpi';
import { presetKeys, presets, textColors } from '../tokens/presets';
import { resolveTokens } from '../tokens/resolve';
import { DEFAULT_THEME_SETTINGS, parseThemeSettings } from '../tokens/settings';
import {
  MATCH_THEME,
  resolveSidebarColor,
  sidebarChoices,
  sidebarSwatches,
} from '../tokens/sidebar';
import { buildCssVariablesResolver, buildTheme, pageTableProps } from './create-theme';
import { createRawaqTheme } from './index';

describe('parseThemeSettings', () => {
  it('defaults to Sand and Forest, matching sidebar, compact', () => {
    expect(parseThemeSettings(null)).toEqual({
      preset: 'sand-forest',
      sidebar: 'match',
      density: 'compact',
    });
    expect(parseThemeSettings(undefined)).toEqual(DEFAULT_THEME_SETTINGS);
  });

  it('keeps known values', () => {
    expect(
      parseThemeSettings({ preset: 'graphite-amber', sidebar: 'plum', density: 'compact' })
    ).toEqual({ preset: 'graphite-amber', sidebar: 'plum', density: 'compact' });
  });

  it('replaces each unknown value with its default', () => {
    expect(parseThemeSettings({ preset: 'hot-pink', sidebar: '#FF0000', density: 3 })).toEqual(
      DEFAULT_THEME_SETTINGS
    );
  });
});

describe('resolveSidebarColor', () => {
  it('uses the preset sidebar for "Match theme"', () => {
    expect(resolveSidebarColor('stone-navy', MATCH_THEME)).toBe(presets['stone-navy'].sidebar);
  });

  it('uses the chosen swatch whatever the preset', () => {
    expect(resolveSidebarColor('stone-navy', 'olive')).toBe(sidebarSwatches.olive);
  });

  it('offers "Match theme" plus ten swatches', () => {
    expect(sidebarChoices).toHaveLength(11);
    expect(sidebarSwatches.slate).toBe('#3B4048');
    expect(sidebarSwatches.onyx).toBe('#121315');
    expect(sidebarChoices[0]).toBe(MATCH_THEME);
  });
});

describe('presets', () => {
  it('offers the seven presets, in the order of the design table', () => {
    expect(presetKeys).toEqual([
      'sand-forest',
      'stone-navy',
      'pearl-teal',
      'linen-burgundy',
      'graphite-amber',
      'slate-gray',
      'onyx-black',
    ]);
  });

  it.each(presetKeys)('%s has every token, each a six digit hex colour', (key) => {
    const { key: own, ...colours } = presets[key];
    expect(own).toBe(key);
    expect(Object.keys(colours).toSorted()).toEqual(
      [
        'accent',
        'background',
        'border',
        'card',
        'glow',
        'hazeFrom',
        'hazeTo',
        'highlight',
        'sidebar',
      ].toSorted()
    );
    for (const colour of Object.values(colours)) {
      expect(colour).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe('buildTheme', () => {
  it('uses the preset accent as the primary colour', () => {
    const tokens = resolveTokens({ ...DEFAULT_THEME_SETTINGS, preset: 'linen-burgundy' });
    expect(tokens.primary).toContain(presets['linen-burgundy'].accent);
  });

  it('follows the density', () => {
    const compact = buildTheme({ ...DEFAULT_THEME_SETTINGS, density: 'compact' });
    expect(compact.spacing).toEqual(densities.compact.spacing);
    expect(compact.components?.Button?.defaultProps).toEqual({ size: 'sm' });
  });

  it('makes `md` controls 40 px only at Comfortable density; Compact keeps Mantine 42 px', () => {
    const heightAt = (density: 'comfortable' | 'compact') =>
      buildCssVariablesResolver({ ...DEFAULT_THEME_SETTINGS, density })({} as never).variables[
        '--app-control-height-md'
      ];
    expect(heightAt('comfortable')).toBe('40px');
    expect(heightAt('compact')).toBe('42px');
  });

  it('exposes the colours of the look as CSS variables', () => {
    const resolver = buildCssVariablesResolver({
      preset: 'pearl-teal',
      sidebar: 'espresso',
      density: 'comfortable',
    });
    const result = resolver({} as never);
    expect(result.light['--mantine-color-body']).toBe(presets['pearl-teal'].background);
    expect(result.variables['--app-sidebar']).toBe(sidebarSwatches.espresso);
    expect(result.variables['--app-highlight']).toBe(presets['pearl-teal'].highlight);
    expect(result.variables['--app-kpi-green-bg']).toBe(kpiTints.green.background);
    // Design v2: haze, glow (its text is the rail colour, here the chosen swatch) and shell sizes.
    expect(result.variables['--app-haze-from']).toBe(presets['pearl-teal'].hazeFrom);
    expect(result.variables['--app-haze-to']).toBe(presets['pearl-teal'].hazeTo);
    expect(result.variables['--app-glow']).toBe(presets['pearl-teal'].glow);
    expect(result.variables['--app-glow-text']).toBe(sidebarSwatches.espresso);
    expect(result.variables['--app-rail-width']).toBe('64px');
    expect(result.variables['--app-frame-margin']).toBe(densities.comfortable.frameMargin);
    // The focus ring colours checked in contrast.test.ts are the ones the page gets.
    expect(result.variables['--app-focus-inner']).toBe(textColors.main);
    expect(result.variables['--app-control-border']).toBe(
      resolveTokens({ preset: 'pearl-teal', sidebar: 'espresso', density: 'comfortable' }).control
    );
  });

  it.each(['comfortable', 'compact'] as const)('keeps tables dense at %s density', (density) => {
    const theme = buildTheme({ ...DEFAULT_THEME_SETTINGS, density });
    expect(theme.components?.Table?.defaultProps).toMatchObject({
      verticalSpacing: '8px',
      highlightOnHover: true,
    });
  });

  it('does not make every table sticky: only a page table asks for it', () => {
    const theme = buildTheme(DEFAULT_THEME_SETTINGS);
    expect(theme.components?.Table?.defaultProps).not.toHaveProperty('stickyHeader');
    expect(theme.components?.Table?.defaultProps).not.toHaveProperty('stickyHeaderOffset');
    expect(pageTableProps).toEqual({
      stickyHeader: true,
      stickyHeaderOffset: 'var(--app-table-sticky-top, 0px)',
    });
  });

  it('uses the v2 type and radius scale: body 14 px, small text 13 px, buttons 10 px', () => {
    const theme = buildTheme(DEFAULT_THEME_SETTINGS);
    expect(theme.fontSizes).toMatchObject({ sm: '13px', md: '14px' });
    expect(theme.radius).toMatchObject({ md: '10px', lg: '12px', xl: '16px' });
  });

  it('gives the switch track the 3:1 control border', () => {
    const theme = buildTheme(DEFAULT_THEME_SETTINGS);
    expect(theme.components?.Switch?.styles).toEqual({
      track: { borderColor: resolveTokens(DEFAULT_THEME_SETTINGS).control },
    });
  });
});

const variablesOf = (result: ReturnType<typeof createRawaqTheme>) =>
  result.cssVariablesResolver({} as never).variables;

describe('createRawaqTheme', () => {
  it('uses the defaults for anything left out', () => {
    expect(createRawaqTheme().theme).toEqual(buildTheme(DEFAULT_THEME_SETTINGS));
    expect(createRawaqTheme({ density: 'comfortable' }).theme).toEqual(
      buildTheme({ ...DEFAULT_THEME_SETTINGS, density: 'comfortable' })
    );
  });

  describe('with a brand palette', () => {
    const brand = {
      background: '#F4F6FB',
      card: '#FFFFFF',
      border: '#DDE3EE',
      sidebar: '#1D2A4D',
      accent: '#3346A8',
      highlight: '#E2A93B',
      hazeFrom: '#E4E9F6',
      hazeTo: '#F6ECDD',
      glow: '#D5DDF7',
    };

    it('builds the theme from those colours', () => {
      const result = createRawaqTheme({ palette: brand, density: 'comfortable' });
      expect(result.theme.colors?.primary).toContain(brand.accent);
      expect(variablesOf(result)['--app-surface']).toBe(brand.card);
      expect(variablesOf(result)['--app-sidebar']).toBe(brand.sidebar);
      expect(result.cssVariablesResolver({} as never).light['--mantine-color-body']).toBe(
        brand.background
      );
    });

    it('keeps a chosen sidebar swatch over the sidebar of the palette', () => {
      const result = createRawaqTheme({ palette: brand, sidebar: 'plum' });
      expect(variablesOf(result)['--app-sidebar']).toBe(sidebarSwatches.plum);
    });

    it('refuses a palette that fails a contrast pair, and names the pair', () => {
      const attempt = () => createRawaqTheme({ palette: { ...brand, accent: '#9DB0FF' } });
      expect(attempt).toThrow(RawaqPaletteError);
      expect(attempt).toThrow(/link text \(accent\) on the card/);
    });

    it('checks the palette against the sidebar that will be shown', () => {
      // Its own sidebar is too light for white text; with a swatch that sidebar is never drawn.
      const palette = { ...brand, sidebar: '#C8D8D0' };
      expect(() => createRawaqTheme({ palette })).toThrow(/white text on the sidebar/);
      expect(() => createRawaqTheme({ palette, sidebar: 'slate' })).not.toThrow();
    });

    it('refuses a preset and a palette together', () => {
      const both = { preset: 'stone-navy', palette: brand } as never;
      expect(() => createRawaqTheme(both)).toThrow('give a preset or a palette, not both');
    });
  });

  describe('fonts per locale', () => {
    const fonts = { ur: { family: "'Noto Nastaliq Urdu'", lineHeight: 2.2 } };

    it('gives English and Arabic the same theme as before', () => {
      const plain = createRawaqTheme().theme;
      expect(createRawaqTheme({ locale: 'en' }).theme).toEqual(plain);
      expect(createRawaqTheme({ locale: 'ar' }).theme).toEqual(plain);
      expect(plain).not.toHaveProperty('lineHeights');
      expect(plain.headings?.sizes).toEqual({
        h1: { fontSize: 'clamp(1.75rem, 1.35rem + 1.6vw, 2.25rem)', lineHeight: '1.2' },
      });
    });

    it('uses the font an app adds for its language, in the theme and the variables', () => {
      const result = createRawaqTheme({ locale: 'ur', fonts });
      expect(result.theme.fontFamily).toMatch(
        /^'Plus Jakarta Sans Variable', 'Noto Nastaliq Urdu'/
      );
      expect(result.theme.headings?.fontFamily).toBe(result.theme.fontFamily);
      expect(variablesOf(result)['--app-font-display']).toBe(result.theme.fontFamily);
      expect(variablesOf(result)['--app-line-height']).toBe('2.2');
    });

    it('gives a script that needs room its line height, in text and in headings', () => {
      const { theme } = createRawaqTheme({ locale: 'ur-PK', fonts });
      expect(theme.lineHeights).toEqual({ xs: '2.2', sm: '2.2', md: '2.2', lg: '2.2', xl: '2.2' });
      expect(theme.headings?.sizes?.h1).toEqual({
        fontSize: 'clamp(1.75rem, 1.35rem + 1.6vw, 2.25rem)',
        lineHeight: '2.2',
      });
      expect(theme.headings?.sizes?.h4).toEqual({ lineHeight: '2.2' });
    });

    it('never makes a line tighter than Mantine has it', () => {
      const { theme } = createRawaqTheme({
        locale: 'hi',
        fonts: { hi: { family: 'Mukta', lineHeight: 1.5 } },
      });
      expect(theme.lineHeights).toMatchObject({ xs: '1.5', md: '1.55', xl: '1.65' });
      expect(theme.headings?.sizes?.h1?.lineHeight).toBe('1.5');
    });

    it('leaves the other languages of the app alone', () => {
      expect(createRawaqTheme({ locale: 'en', fonts }).theme).not.toHaveProperty('lineHeights');
    });
  });
});
