import { DEFAULT_DENSITY, type Density, isDensity } from './density';
import { DEFAULT_PRESET, isPresetKey, type PaletteTokens, type PresetKey } from './presets';
import { DEFAULT_SIDEBAR, isSidebarChoice, type SidebarChoice } from './sidebar';

/** One look: a preset, a sidebar colour and a density. Three plain values an app can store. */
export interface ThemeSettings {
  preset: PresetKey;
  sidebar: SidebarChoice;
  density: Density;
}

/** A look whose nine colours may come from the app's own palette instead of the preset. */
export interface ThemeLook extends ThemeSettings {
  /** When given, it replaces the preset's colours. Check it first with `checkPalette`. */
  palette?: PaletteTokens;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  preset: DEFAULT_PRESET,
  sidebar: DEFAULT_SIDEBAR,
  density: DEFAULT_DENSITY,
};

/**
 * Reads stored values. An unknown one (for example a preset removed in a later release) falls
 * back to the default instead of breaking the page.
 */
export function parseThemeSettings(
  value: { preset?: unknown; sidebar?: unknown; density?: unknown } | null | undefined
): ThemeSettings {
  return {
    preset: isPresetKey(value?.preset) ? value.preset : DEFAULT_THEME_SETTINGS.preset,
    sidebar: isSidebarChoice(value?.sidebar) ? value.sidebar : DEFAULT_THEME_SETTINGS.sidebar,
    density: isDensity(value?.density) ? value.density : DEFAULT_THEME_SETTINGS.density,
  };
}
