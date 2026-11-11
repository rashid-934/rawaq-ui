import {
  assertPalette,
  checkPalette,
  describeFailure,
  palettePairs,
  RawaqPaletteError,
} from './check-palette';
import { type PaletteTokens, type PresetKey, presetKeys, presets } from './presets';
import { type SidebarChoice, sidebarChoices } from './sidebar';

function coloursOf(key: PresetKey): PaletteTokens {
  const { key: _key, ...colours } = presets[key];
  return colours;
}

function errorFrom(action: () => void): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}

const good = coloursOf('sand-forest');
const namesOf = (palette: PaletteTokens, sidebars?: readonly SidebarChoice[]) =>
  checkPalette(palette, sidebars).failures.map((failure) => failure.name);

describe('checkPalette', () => {
  it.each(presetKeys)('passes the %s preset with every sidebar choice', (key) => {
    expect(checkPalette(coloursOf(key), sidebarChoices)).toEqual({
      ok: true,
      invalid: [],
      failures: [],
    });
  });

  it('checks 40 pairs for "Match theme" and 9 more for each other sidebar', () => {
    expect(palettePairs(good)).toHaveLength(40);
    expect(palettePairs(good, [])).toHaveLength(40);
    expect(palettePairs(good, sidebarChoices)).toHaveLength(31 + 9 * sidebarChoices.length);
  });

  it('names every pair once', () => {
    const names = palettePairs(good, sidebarChoices).map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('refuses an accent too light for links and for white button text', () => {
    const names = namesOf({ ...good, accent: '#9FD3B8' });
    expect(names).toContain('link text (accent) on the card');
    expect(names).toContain('white text on the accent');
    expect(names).not.toContain('main text on the card');
  });

  it('refuses a sidebar too light for its white text', () => {
    const names = namesOf({ ...good, sidebar: '#C8D8D0' });
    expect(names).toContain('white text on the sidebar');
    expect(names).toContain('rail icons and labels on the sidebar');
  });

  it('names the swatch when the app offers other sidebars', () => {
    const palette = { ...good, glow: '#33402A' };
    expect(namesOf(palette, ['olive'])).toContain('the glow circle against the "olive" sidebar');
    // Only the sidebars the app offers are checked.
    expect(namesOf(good, ['olive'])).toEqual([]);
  });

  it('reports the surface when even the main text cannot be read, without throwing', () => {
    const report = checkPalette({
      ...good,
      background: '#1F2A24',
      card: '#222222',
      border: '#333333',
    });
    expect(report.ok).toBe(false);
    expect(report.failures.map((failure) => failure.name)).toContain('main text on the background');
  });

  it('lists colours that are not six hex digits, before any contrast maths', () => {
    const { glow: _glow, ...withoutGlow } = good;
    const report = checkPalette({ ...withoutGlow, accent: 'green', card: '#FFF' } as PaletteTokens);
    expect(report).toEqual({ ok: false, invalid: ['card', 'accent', 'glow'], failures: [] });
  });

  it('reports a palette that is not there at all instead of crashing', () => {
    expect(checkPalette(null as never).invalid).toHaveLength(9);
    expect(() => assertPalette(undefined as never)).toThrow(RawaqPaletteError);
  });
});

describe('describeFailure', () => {
  it('says what failed, with both ratios and both colours', () => {
    expect(
      describeFailure({
        name: 'link text (accent) on the card',
        foreground: '#9FD3B8',
        background: '#FFFDF8',
        min: 4.5,
        ratio: 1.6789,
      })
    ).toBe('link text (accent) on the card: 1.67:1, needs 4.5:1 (#9FD3B8 on #FFFDF8)');
  });

  it('rounds down, so a near miss never reads as a pass', () => {
    const line = describeFailure({
      name: 'x',
      foreground: '#000000',
      background: '#FFFFFF',
      min: 4.5,
      ratio: 4.4999,
    });
    expect(line).toContain('4.49:1, needs 4.5:1');
  });
});

describe('assertPalette', () => {
  it('lets a good palette through', () => {
    expect(() => assertPalette(good)).not.toThrow();
  });

  it('throws an error that names each failing pair', () => {
    const attempt = () => assertPalette({ ...good, accent: '#9FD3B8' });
    expect(attempt).toThrow(RawaqPaletteError);
    expect(attempt).toThrow(/link text \(accent\) on the card: \d\.\d\d:1, needs 4\.5:1/);
    const { report, message, name } = errorFrom(attempt) as RawaqPaletteError;
    expect(name).toBe('RawaqPaletteError');
    expect(report.failures.length).toBeGreaterThan(0);
    expect(message.split('\n')).toHaveLength(report.failures.length + 1);
    // No em dashes in any text the package writes.
    expect(message).not.toMatch(/—/);
  });

  it('throws an error that names each colour with a bad value', () => {
    expect(() => assertPalette({ ...good, hazeTo: 'rgb(1, 2, 3)' })).toThrow(
      /six digit hex colour[^]*- hazeTo/
    );
  });
});
