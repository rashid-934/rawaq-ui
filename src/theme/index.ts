import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from '../tokens/settings';
import { buildCssVariablesResolver, buildTheme } from './create-theme';

export {
  buildCssVariablesResolver,
  buildTheme,
  LIGHT_VARIANT_ALPHA,
  LIGHT_VARIANT_TEXT_SHADE,
  pageTableProps,
  resolveTokens,
  TABLE_CELL_PADDING,
  TABLE_FONT_SIZE,
} from './create-theme';
export type { ThemeTokens } from './create-theme';

/**
 * The Mantine theme and the CSS variables for one look: a preset, a sidebar colour and a density.
 * Anything left out takes the default (Sand and Forest, Match theme, Compact).
 *
 * Give both results to `MantineProvider` (`theme` and `cssVariablesResolver`), in a client
 * component: the resolver is a function.
 */
export function createRawaqTheme(settings: Partial<ThemeSettings> = {}) {
  const look: ThemeSettings = { ...DEFAULT_THEME_SETTINGS, ...settings };
  return {
    theme: buildTheme(look),
    cssVariablesResolver: buildCssVariablesResolver(look),
  };
}
