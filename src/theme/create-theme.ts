import {
  type CSSVariablesResolver,
  createTheme,
  type MantineColorsTuple,
  type MantineThemeOverride,
} from '@mantine/core';
import { LUMINANCE_THRESHOLD } from '../tokens/contrast';
import { densities, type DensityTokens, layout } from '../tokens/density';
import { kpiTintKeys, kpiTints } from '../tokens/kpi';
import {
  alpha,
  BASE_SHADE,
  firstPassing,
  GENTLE_DARK_STEPS,
  mix,
  shadesFrom,
} from '../tokens/palette';
import { presets, type PresetTokens, textColors } from '../tokens/presets';
import type { ThemeSettings } from '../tokens/settings';
import { resolveSidebarColor } from '../tokens/sidebar';
import { fonts } from '../tokens/typography';

// Turns a company's theme settings into a Mantine theme plus CSS variables. App CSS modules use
// the `--app-*` variables; Mantine components use the overridden `--mantine-color-*` ones.
// Light only for now (owner decision, 22 Oct 2026).

const PURE_WHITE = '#FFFFFF';
const PURE_BLACK = '#000000';
export const LIGHT_VARIANT_TEXT_SHADE = 7;
/** Mantine's "light" variant background: the accent at this opacity over the page or card. */
export const LIGHT_VARIANT_ALPHA = 0.1;
/** Work page tables: 8 px cell padding and 13 px text give rows of about 36 px. */
export const TABLE_CELL_PADDING = '8px';
export const TABLE_FONT_SIZE = '13px';
/**
 * For the main table of a Work page (section 4.4): its header row sticks right under the app
 * header while the page scrolls. Spread onto `<Table>`; never on a table in a modal or drawer.
 */
export const pageTableProps = {
  stickyHeader: true,
  stickyHeaderOffset: 'var(--app-table-sticky-top, 0px)',
} as const;

/** Every colour one company's screens use, derived from its preset and choices. */
export interface ThemeTokens {
  preset: PresetTokens;
  density: DensityTokens;
  sidebar: string;
  /** Hovered sidebar item. */
  sidebarHover: string;
  /** Secondary text on the sidebar (role under the name, group labels). */
  sidebarMuted: string;
  /** Dividers on the sidebar. */
  sidebarLine: string;
  /** Hover rows and raised panels. */
  raised: string;
  /** Input and checkbox borders: at least 3:1 on background, card and raised (WCAG 1.4.11). */
  control: string;
  primary: MantineColorsTuple;
  highlight: MantineColorsTuple;
  gray: MantineColorsTuple;
}

export function resolveTokens(settings: ThemeSettings): ThemeTokens {
  const preset = presets[settings.preset];
  const raised = mix(preset.card, preset.border, 0.45);
  const control = firstPassing(
    preset.border,
    textColors.main,
    [preset.background, preset.card, raised],
    3
  );
  const gray = [
    preset.background,
    mix(preset.background, preset.border, 0.5),
    preset.border,
    mix(preset.border, textColors.main, 0.15),
    control,
    mix(preset.border, textColors.main, 0.6),
    textColors.secondary,
    mix(textColors.secondary, textColors.main, 0.5),
    textColors.main,
    mix(textColors.main, PURE_BLACK, 0.4),
  ] as unknown as MantineColorsTuple;

  const sidebar = resolveSidebarColor(settings.preset, settings.sidebar);
  return {
    preset,
    density: densities[settings.density],
    sidebar,
    sidebarHover: mix(sidebar, PURE_WHITE, 0.1),
    sidebarMuted: mix(textColors.onDark, sidebar, 0.28),
    sidebarLine: mix(sidebar, PURE_WHITE, 0.16),
    raised,
    control,
    primary: shadesFrom(preset.accent, PURE_WHITE, PURE_BLACK),
    highlight: shadesFrom(preset.highlight, PURE_WHITE, PURE_BLACK, GENTLE_DARK_STEPS),
    gray,
  };
}

export function buildTheme(settings: ThemeSettings): MantineThemeOverride {
  const tokens = resolveTokens(settings);
  const size = tokens.density.controlSize;
  const control = { defaultProps: { size } };

  return createTheme({
    primaryColor: 'primary',
    primaryShade: { light: BASE_SHADE, dark: BASE_SHADE },
    autoContrast: true,
    luminanceThreshold: LUMINANCE_THRESHOLD,
    respectReducedMotion: true,
    colors: {
      primary: tokens.primary,
      highlight: tokens.highlight,
      gray: tokens.gray,
    },
    black: textColors.main,
    white: PURE_WHITE,
    fontFamily: fonts.body,
    fontFamilyMonospace: fonts.mono,
    headings: {
      fontFamily: fonts.body,
      fontWeight: '700',
      sizes: {
        h1: { fontSize: 'clamp(1.75rem, 1.35rem + 1.6vw, 2.25rem)', lineHeight: '1.2' },
      },
    },
    spacing: tokens.density.spacing,
    // Design v2 sizes (docs/DESIGN_THEME.md section 6): body 14 px, small and table text 13 px.
    fontSizes: { xs: '12px', sm: '13px', md: '14px', lg: '16px', xl: '18px' },
    // Rounding (section 5): buttons and inputs 10 px (md), Work cards 12 px (lg), Overview
    // cards 16 px (xl).
    radius: { xs: '6px', sm: '8px', md: '10px', lg: '12px', xl: '16px' },
    defaultRadius: 'md',
    cursorType: 'pointer',
    focusRing: 'auto',
    other: { density: settings.density },
    components: {
      Button: control,
      TextInput: control,
      PasswordInput: control,
      NumberInput: {
        ...control,
        styles: { input: { fontVariantNumeric: 'tabular-nums' } },
      },
      Select: control,
      Textarea: control,
      // Mantine draws the off track with light greys; the control colour keeps it at 3:1.
      Switch: { styles: { track: { borderColor: tokens.control } } },
      // Sentence case reads friendlier than capitals and keeps Arabic badges natural.
      Badge: { styles: { root: { textTransform: 'none', fontWeight: 600 } } },
      Card: { defaultProps: { radius: 'lg' } },
      Paper: { defaultProps: { radius: 'lg' } },
      // Tables (section 3 and 4.4): always at least as tight as Compact, whatever the company
      // density (rows about 36 px, cells 8 px), and a hover tint. The sticky header is not a
      // default: only a page's own table gets it (`pageTableProps`), a table inside a modal or a
      // drawer must not stick 68 px down. Line items in forms are not Mantine tables and keep
      // their own spacing.
      Table: {
        defaultProps: {
          verticalSpacing: TABLE_CELL_PADDING,
          horizontalSpacing: 'sm',
          highlightOnHover: true,
          highlightOnHoverColor: 'var(--app-row-hover)',
        },
        styles: { table: { fontVariantNumeric: 'tabular-nums', fontSize: TABLE_FONT_SIZE } },
      },
    },
  });
}

function kpiVariables(): Record<string, string> {
  return Object.fromEntries(
    kpiTintKeys.flatMap((key) => [
      [`--app-kpi-${key}-bg`, kpiTints[key].background],
      [`--app-kpi-${key}-text`, kpiTints[key].text],
    ])
  );
}

export function buildCssVariablesResolver(settings: ThemeSettings): CSSVariablesResolver {
  const tokens = resolveTokens(settings);
  const { preset } = tokens;
  const mantine: Record<string, string> = {
    '--mantine-color-body': preset.background,
    '--mantine-color-text': textColors.main,
    '--mantine-color-dimmed': textColors.secondary,
    '--mantine-color-default': preset.card,
    '--mantine-color-default-hover': tokens.raised,
    '--mantine-color-default-border': preset.border,
    '--mantine-color-anchor': preset.accent,
    '--mantine-color-error': textColors.error,
    '--mantine-color-placeholder': textColors.secondary,
    // Text of "light" buttons and badges sits on a 10% accent tint: one shade darker passes AA.
    '--mantine-color-primary-light-color': tokens.primary[LIGHT_VARIANT_TEXT_SHADE] as string,
    '--mantine-primary-color-light-color': tokens.primary[LIGHT_VARIANT_TEXT_SHADE] as string,
  };
  return () => ({
    variables: {
      '--app-font-display': fonts.body,
      '--app-surface': preset.card,
      '--app-raised': tokens.raised,
      '--app-hairline': preset.border,
      '--app-control-border': tokens.control,
      '--app-accent-text': preset.accent,
      '--app-highlight': preset.highlight,
      '--app-highlight-text': textColors.main,
      '--app-focus-inner': textColors.main,
      '--app-sidebar': tokens.sidebar,
      '--app-sidebar-text': textColors.onDark,
      '--app-sidebar-hover': tokens.sidebarHover,
      '--app-sidebar-muted': tokens.sidebarMuted,
      '--app-sidebar-line': tokens.sidebarLine,
      '--app-accent': preset.accent,
      // Design v2: haze behind the frame, glow behind the active rail icon and soft selections.
      '--app-haze-from': preset.hazeFrom,
      '--app-haze-to': preset.hazeTo,
      '--app-glow': preset.glow,
      '--app-glow-text': tokens.sidebar,
      '--app-row-hover': tokens.raised,
      '--app-row-selected': preset.glow,
      '--app-rail-width': layout.railWidth,
      '--app-rail-panel': layout.railPanel,
      '--app-rail-inset': layout.railInset,
      '--app-frame-radius': layout.frameRadius,
      '--app-frame-pad-work': layout.framePadWork,
      '--app-frame-pad-overview': layout.framePadOverview,
      '--app-frame-margin': tokens.density.frameMargin,
      '--app-bento-gap': tokens.density.bentoGap,
      '--app-control-height-md': tokens.density.controlHeightMd,
      // Soft shadows tinted with the main text colour, never pure black.
      '--app-shadow-sm': `0 1px 2px ${alpha(textColors.main, 0.06)}, 0 4px 12px ${alpha(textColors.main, 0.06)}`,
      '--app-shadow-md': `0 2px 6px ${alpha(textColors.main, 0.06)}, 0 12px 28px ${alpha(textColors.main, 0.1)}`,
      '--app-shadow-lg': `0 18px 48px ${alpha(textColors.main, 0.24)}`,
      '--app-scrim': alpha(textColors.main, 0.45),
      ...kpiVariables(),
    },
    // The app is forced to light; the dark block repeats it so nothing falls back to Mantine's
    // own dark palette if a browser asks for dark mode.
    light: mantine,
    dark: mantine,
  });
}
