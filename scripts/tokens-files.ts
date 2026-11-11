import { DEFAULT_DENSITY, densities, densityKeys, layout } from '../src/tokens/density';
import { kpiTints } from '../src/tokens/kpi';
import { rtlLocales } from '../src/tokens/locale';
import { MAX_STAGGER, motion } from '../src/tokens/motion';
import {
  DEFAULT_PRESET,
  paletteKeys,
  presetKeys,
  presets,
  textColors,
} from '../src/tokens/presets';
import { PILL_RADIUS, radius } from '../src/tokens/radius';
import { resolveTokens } from '../src/tokens/resolve';
import { DEFAULT_THEME_SETTINGS } from '../src/tokens/settings';
import { DEFAULT_SIDEBAR, type SidebarSwatch, sidebarSwatches } from '../src/tokens/sidebar';
import { builtInFonts, fontFor, fonts, fontSizes } from '../src/tokens/typography';
import {
  appVariables,
  type CssVariables,
  densityVariables,
  paletteVariables,
  sidebarVariables,
} from '../src/tokens/variables';

// Builds the text of `tokens.css` and `tokens.json` from the tokens in `src/tokens`, so a stack
// without React or Mantine gets the same names and values. The package build writes both files
// into `dist` (see vite.config.ts). Never edit the generated files.

const swatchKeys = Object.keys(sidebarSwatches) as SidebarSwatch[];

function block(selector: string, variables: CssVariables): string {
  const lines = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

/**
 * `tokens.css`: every `--app-*` variable. `:root` holds the default look; put
 * `data-rawaq-preset`, `data-rawaq-sidebar` and `data-rawaq-density` on the same element
 * (normally `<html>`) to choose another.
 */
export function tokensCss(): string {
  const header = [
    '/*',
    ' * Rawaq UI design tokens. Generated from src/tokens: do not edit.',
    ' * The default look is on :root. To choose another, set these on <html>:',
    ` *   data-rawaq-preset="${presetKeys.join(' | ')}"`,
    ` *   data-rawaq-sidebar="${swatchKeys.join(' | ')}" (leave it out to match the preset)`,
    ` *   data-rawaq-density="${densityKeys.join(' | ')}"`,
    ' */',
  ].join('\n');

  const root = block(':root', appVariables(resolveTokens(DEFAULT_THEME_SETTINGS), fontFor()));
  const presetBlocks = presetKeys.map((preset) => {
    const tokens = resolveTokens({ ...DEFAULT_THEME_SETTINGS, preset });
    return block(`[data-rawaq-preset='${preset}']`, {
      ...paletteVariables(tokens),
      ...sidebarVariables(tokens),
    });
  });
  // After the presets, so a chosen sidebar wins over the preset's own.
  const sidebarBlocks = swatchKeys.map((sidebar) =>
    block(
      `[data-rawaq-sidebar='${sidebar}']`,
      sidebarVariables(resolveTokens({ ...DEFAULT_THEME_SETTINGS, sidebar }))
    )
  );
  const densityBlocks = densityKeys.map((density) =>
    block(`[data-rawaq-density='${density}']`, densityVariables(densities[density]))
  );

  return `${[header, root, ...presetBlocks, ...sidebarBlocks, ...densityBlocks].join('\n\n')}\n`;
}

/** `tokens.json`: the same tokens as data, for design tools and other platforms. */
export function tokensJson(): string {
  const presetEntries = presetKeys.map((key) => {
    const tokens = resolveTokens({ ...DEFAULT_THEME_SETTINGS, preset: key });
    const colours = Object.fromEntries(paletteKeys.map((name) => [name, presets[key][name]]));
    const derived = {
      raised: tokens.raised,
      controlBorder: tokens.control,
      sidebarHover: tokens.sidebarHover,
      sidebarMuted: tokens.sidebarMuted,
      sidebarLine: tokens.sidebarLine,
      accentShades: [...tokens.primary],
      highlightShades: [...tokens.highlight],
      grayShades: [...tokens.gray],
    };
    return [key, { ...colours, derived }] as const;
  });

  const data = {
    defaults: { preset: DEFAULT_PRESET, sidebar: DEFAULT_SIDEBAR, density: DEFAULT_DENSITY },
    text: textColors,
    presets: Object.fromEntries(presetEntries),
    sidebarSwatches,
    kpiTints,
    density: densities,
    layout,
    radius: { ...radius, pill: PILL_RADIUS },
    fontSizes,
    fonts: { body: fonts.body, mono: fonts.mono, byLocale: builtInFonts },
    motion: { ...motion, maxStagger: MAX_STAGGER },
    rtlLocales,
  };
  return `${JSON.stringify(data, null, 2)}\n`;
}
