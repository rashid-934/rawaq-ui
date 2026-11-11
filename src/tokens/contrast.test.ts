import { contrastRatio, onFillColor } from './contrast';
import { kpiTints } from './kpi';
import { BASE_SHADE, mix } from './palette';
import { presetKeys, presets, textColors } from './presets';
import { LIGHT_VARIANT_ALPHA, LIGHT_VARIANT_TEXT_SHADE, RAIL_ICON, resolveTokens } from './resolve';
import { DEFAULT_THEME_SETTINGS } from './settings';
import { sidebarChoices, sidebarSwatches } from './sidebar';

const AA_NORMAL_TEXT = 4.5;
/** Control borders and focus indicators (WCAG 1.4.11). */
const AA_NON_TEXT = 3;
/** Large text, such as the emphasised word in the hero banner (WCAG 1.4.3). */
const AA_LARGE_TEXT = 3;

describe('rail icons', () => {
  it('rest at 75 percent of white (docs/DESIGN_THEME.md section 4.2)', () => {
    expect(RAIL_ICON).toBe('rgba(255, 255, 255, 0.75)');
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 1);
  });

  it('blends translucent colours over the background', () => {
    expect(contrastRatio('rgba(0, 0, 0, 0)', '#ffffff')).toBeCloseTo(1, 5);
  });
});

describe.each(presetKeys)('theme preset %s', (key) => {
  const preset = presets[key];
  const tokens = resolveTokens({ ...DEFAULT_THEME_SETTINGS, preset: key });
  const backgrounds = { background: preset.background, card: preset.card, raised: tokens.raised };

  it.each(Object.entries(backgrounds))(
    'main, secondary, link and error text pass AA on %s',
    (_, bg) => {
      expect(contrastRatio(textColors.main, bg)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(contrastRatio(textColors.secondary, bg)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(contrastRatio(preset.accent, bg)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(contrastRatio(textColors.error, bg)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  );

  it.each(Object.entries(backgrounds))('control borders reach 3:1 on %s', (_, bg) => {
    expect(contrastRatio(tokens.control, bg)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it.each(Object.entries(backgrounds))(
    'the focus ring (dark inner ring, highlight outer ring) reaches 3:1 on %s',
    (_, bg) => {
      // The inner ring stands out from the page, the highlight stands out from the inner ring.
      expect(contrastRatio(textColors.main, bg)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      expect(contrastRatio(preset.highlight, textColors.main)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  );

  it('white text passes AA on the sidebar and on accent fills', () => {
    expect(contrastRatio(textColors.onDark, preset.sidebar)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(textColors.onDark, preset.accent)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  // Mantine picks the label colour from the resting fill and keeps it on hover (one shade darker).
  it.each([BASE_SHADE, BASE_SHADE + 1])(
    'filled accent buttons pass AA at shade %i (rest and hover)',
    (shade) => {
      expect(tokens.primary[BASE_SHADE]).toBe(preset.accent);
      const text = onFillColor(preset.accent, { black: textColors.main, white: textColors.onDark });
      expect(contrastRatio(text, tokens.primary[shade] as string)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT
      );
    }
  );

  it.each([BASE_SHADE, BASE_SHADE + 1])(
    'highlight fills (pill button, highlighted entries) pass AA at shade %i (rest and hover)',
    (shade) => {
      const text = onFillColor(preset.highlight, {
        black: textColors.main,
        white: textColors.onDark,
      });
      expect(contrastRatio(text, tokens.highlight[shade] as string)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT
      );
    }
  );

  it.each(Object.entries(backgrounds))(
    'light buttons and badges (text on a faint accent tint) pass AA on %s',
    (_, bg) => {
      const tint = mix(bg, preset.accent, LIGHT_VARIANT_ALPHA);
      const text = tokens.primary[LIGHT_VARIANT_TEXT_SHADE] as string;
      expect(contrastRatio(text, tint)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  );

  it('the highlight stays visible on the sidebar (a highlighted rail entry)', () => {
    expect(contrastRatio(preset.highlight, preset.sidebar)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  // Design v2, every pair listed in docs/DESIGN_THEME.md section 2.
  it.each([
    ['background', preset.background],
    ['card', preset.card],
    ['haze from', preset.hazeFrom],
    ['haze to', preset.hazeTo],
  ])('v2: main and secondary text pass AA on %s', (_, bg) => {
    expect(contrastRatio(textColors.main, bg)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(textColors.secondary, bg)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('v2: the accent as link text passes AA on the card', () => {
    expect(contrastRatio(preset.accent, preset.card)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('v2: main text passes AA on the highlight pill button', () => {
    expect(contrastRatio(textColors.main, preset.highlight)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('v2: the highlight word reads on the sidebar banner (large text)', () => {
    expect(contrastRatio(preset.highlight, preset.sidebar)).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  it('v2: the glow circle stands out from the rail, and the rail-coloured icon from the glow', () => {
    expect(contrastRatio(preset.glow, preset.sidebar)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    expect(contrastRatio(preset.sidebar, preset.glow)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it('v2: main and secondary text pass AA on a glow tint (selected row, selected chip)', () => {
    expect(contrastRatio(textColors.main, preset.glow)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrastRatio(textColors.secondary, preset.glow)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

describe.each(Object.entries(sidebarSwatches))('sidebar swatch %s', (_, colour) => {
  it('white text passes AA', () => {
    expect(contrastRatio(textColors.onDark, colour)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it.each(presetKeys)('the %s highlight stays visible on it', (key) => {
    expect(contrastRatio(presets[key].highlight, colour)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});

describe.each(presetKeys)('sidebar text with the %s preset', (key) => {
  it.each(sidebarChoices)(
    'white and muted text pass AA on the %s sidebar, at rest and hovered',
    (choice) => {
      const tokens = resolveTokens({ ...DEFAULT_THEME_SETTINGS, preset: key, sidebar: choice });
      for (const fill of [tokens.sidebar, tokens.sidebarHover]) {
        expect(contrastRatio(textColors.onDark, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
        expect(contrastRatio(tokens.sidebarMuted, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      }
      // The active item is filled with the page background and uses the main text colour.
      expect(contrastRatio(textColors.main, tokens.preset.background)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT
      );
    }
  );
});

// Any preset may be paired with any sidebar swatch: the glow stays the preset's glow, so it
// is checked against every swatch (docs/DESIGN_THEME.md section 2, "Sidebar colour").
describe.each(presetKeys)('v2 rail with the %s preset', (key) => {
  it.each(sidebarChoices)(
    'the glow, its icon, its count text and the rail icons work on %s',
    (choice) => {
      const tokens = resolveTokens({ ...DEFAULT_THEME_SETTINGS, preset: key, sidebar: choice });
      const { glow, highlight } = tokens.preset;
      // The active circle against the rail, and the rail-coloured icon on the circle.
      expect(contrastRatio(glow, tokens.sidebar)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      expect(contrastRatio(tokens.sidebar, glow)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      // Count badges: rail-coloured text on a glow tint is normal-size text.
      expect(contrastRatio(tokens.sidebar, glow)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      // Resting icons are white at 75 percent, on the rail and on a hovered item. With "Show
      // labels" on, the page names beside them use the same colour, and they are normal-size
      // text: 4.5:1, not the 3:1 an icon needs.
      for (const fill of [tokens.sidebar, tokens.sidebarHover]) {
        expect(contrastRatio(RAIL_ICON, fill)).toBeGreaterThanOrEqual(AA_NON_TEXT);
        expect(contrastRatio(RAIL_ICON, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      }
      // The hero banner takes the rail colour: white text and the highlight word must read on it.
      expect(contrastRatio(textColors.onDark, tokens.sidebar)).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT
      );
      expect(contrastRatio(highlight, tokens.sidebar)).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
    }
  );
});

describe.each(Object.entries(kpiTints))('KPI tint %s', (_, tint) => {
  it('its text passes AA on its background', () => {
    expect(contrastRatio(tint.text, tint.background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});
