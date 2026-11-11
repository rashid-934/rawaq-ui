// The design tokens of Rawaq UI as plain TypeScript: colours, density, layout sizes, rounding,
// fonts, motion timings and the direction of a locale. Nothing here needs React or Mantine at
// run time, so any stack can read it.

export {
  AA_NON_TEXT,
  AA_TEXT,
  assertPalette,
  checkPalette,
  describeFailure,
  palettePairs,
  RawaqPaletteError,
} from './check-palette';
export type { ContrastFailure, ContrastPair, PaletteReport } from './check-palette';
export { contrastRatio, LUMINANCE_THRESHOLD, onFillColor, relativeLuminance } from './contrast';
export { DEFAULT_DENSITY, densities, densityKeys, isDensity, layout } from './density';
export type { Density, DensityTokens } from './density';
export { kpiTintKeys, kpiTints } from './kpi';
export type { KpiTint } from './kpi';
export { directionOf, languageOf, rtlLocales } from './locale';
export type { Direction } from './locale';
export { MAX_STAGGER, motion } from './motion';
export {
  alpha,
  BASE_SHADE,
  DARK_STEPS,
  firstPassing,
  GENTLE_DARK_STEPS,
  mix,
  shadesFrom,
} from './palette';
export {
  DEFAULT_PRESET,
  isPresetKey,
  paletteKeys,
  presetKeys,
  presets,
  textColors,
} from './presets';
export type { PaletteTokens, PresetKey, PresetTokens } from './presets';
export { DEFAULT_RADIUS, PILL_RADIUS, radius } from './radius';
export {
  LIGHT_VARIANT_ALPHA,
  LIGHT_VARIANT_TEXT_SHADE,
  RAIL_ICON,
  RAIL_ICON_OPACITY,
  raisedSurface,
  resolveTokens,
} from './resolve';
export type { ThemeTokens } from './resolve';
export { DEFAULT_THEME_SETTINGS, parseThemeSettings } from './settings';
export type { ThemeLook, ThemeSettings } from './settings';
export {
  DEFAULT_SIDEBAR,
  isSidebarChoice,
  MATCH_THEME,
  resolveSidebarColor,
  sidebarChoices,
  sidebarSwatches,
} from './sidebar';
export type { SidebarChoice, SidebarSwatch } from './sidebar';
export { builtInFonts, DEFAULT_FONT, fontFor, fonts, fontSizes } from './typography';
export type { FontMap, LocaleFont, ResolvedFont } from './typography';
export {
  appVariables,
  densityVariables,
  fontVariables,
  paletteVariables,
  sidebarVariables,
  staticVariables,
} from './variables';
export type { CssVariables } from './variables';
