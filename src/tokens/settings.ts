import { DEFAULT_DENSITY, type Density, isDensity } from './density';
import { DEFAULT_PRESET, isPresetKey, type PresetKey } from './presets';
import { DEFAULT_SIDEBAR, isSidebarChoice, type SidebarChoice } from './sidebar';

/** A company's look, stored in company_settings (theme_preset, sidebar_color, density). */
export interface ThemeSettings {
  preset: PresetKey;
  sidebar: SidebarChoice;
  density: Density;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  preset: DEFAULT_PRESET,
  sidebar: DEFAULT_SIDEBAR,
  density: DEFAULT_DENSITY,
};

/**
 * Reads stored values. The database only accepts known keys; an unknown one (for example a
 * preset removed in a later release) falls back to the default instead of breaking the page.
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
