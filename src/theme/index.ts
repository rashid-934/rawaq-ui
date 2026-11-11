import { assertPalette } from '../tokens/check-palette';
import type { Density } from '../tokens/density';
import type { PaletteTokens, PresetKey } from '../tokens/presets';
import { DEFAULT_THEME_SETTINGS } from '../tokens/settings';
import type { SidebarChoice } from '../tokens/sidebar';
import type { FontMap } from '../tokens/typography';
import { buildCssVariablesResolver, buildTheme, type ThemeInput } from './create-theme';

export {
  buildCssVariablesResolver,
  buildTheme,
  pageTableProps,
  TABLE_CELL_PADDING,
  TABLE_FONT_SIZE,
} from './create-theme';
export type { ThemeInput } from './create-theme';

interface SharedOptions {
  /** "Match theme" (the default) or one of the ten swatches. */
  sidebar?: SidebarChoice;
  /** Compact (the default) or Comfortable. */
  density?: Density;
  /** The page's locale (`en`, `ar`, `ur-PK`). It picks the font. */
  locale?: string;
  /** Fonts for other locales: `{ ur: { family: "'Noto Nastaliq Urdu'", lineHeight: 2.2 } }`. */
  fonts?: FontMap;
}

/** One of the seven presets, or the app's own nine colours. Never both. */
export type RawaqThemeOptions = SharedOptions &
  ({ preset?: PresetKey; palette?: undefined } | { palette: PaletteTokens; preset?: undefined });

/**
 * The Mantine theme and the CSS variables for one look. Anything left out takes the default
 * (Sand and Forest, Match theme, Compact, the default fonts).
 *
 * A `palette` is checked against the contrast pairs every preset passes. A palette that fails is
 * refused with a `RawaqPaletteError` whose message names each failing pair.
 *
 * Give both results to `MantineProvider` (`theme` and `cssVariablesResolver`), in a client
 * component: the resolver is a function.
 */
export function createRawaqTheme(options: RawaqThemeOptions = {}) {
  const { preset, palette, sidebar, density, locale, fonts } = options;
  if (preset !== undefined && palette !== undefined) {
    throw new Error('Rawaq UI: give a preset or a palette, not both.');
  }
  const look: ThemeInput = {
    preset: preset ?? DEFAULT_THEME_SETTINGS.preset,
    sidebar: sidebar ?? DEFAULT_THEME_SETTINGS.sidebar,
    density: density ?? DEFAULT_THEME_SETTINGS.density,
    ...(palette === undefined ? {} : { palette }),
    ...(locale === undefined ? {} : { locale }),
    ...(fonts === undefined ? {} : { fonts }),
  };
  if (palette !== undefined) {
    assertPalette(palette, [look.sidebar]);
  }
  return {
    theme: buildTheme(look),
    cssVariablesResolver: buildCssVariablesResolver(look),
  };
}
