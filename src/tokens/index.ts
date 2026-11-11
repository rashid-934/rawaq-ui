// The design tokens of Rawaq UI as plain TypeScript: colours, density, layout sizes and fonts.
// Nothing here needs React or Mantine at run time, so any stack can read it.

export { contrastRatio, LUMINANCE_THRESHOLD, onFillColor, relativeLuminance } from './contrast';
export { DEFAULT_DENSITY, densities, densityKeys, isDensity, layout } from './density';
export type { Density, DensityTokens } from './density';
export { kpiTintKeys, kpiTints } from './kpi';
export type { KpiTint } from './kpi';
export {
  alpha,
  BASE_SHADE,
  DARK_STEPS,
  firstPassing,
  GENTLE_DARK_STEPS,
  mix,
  shadesFrom,
} from './palette';
export { DEFAULT_PRESET, isPresetKey, presetKeys, presets, textColors } from './presets';
export type { PresetKey, PresetTokens } from './presets';
export { DEFAULT_THEME_SETTINGS, parseThemeSettings } from './settings';
export type { ThemeSettings } from './settings';
export {
  DEFAULT_SIDEBAR,
  isSidebarChoice,
  MATCH_THEME,
  resolveSidebarColor,
  sidebarChoices,
  sidebarSwatches,
} from './sidebar';
export type { SidebarChoice, SidebarSwatch } from './sidebar';
export { fonts } from './typography';
