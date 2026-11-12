import { type DensityTokens, layout } from './density';
import { kpiTintKeys, kpiTints } from './kpi';
import { MAX_STAGGER, motion } from './motion';
import { alpha } from './palette';
import { textColors } from './presets';
import { PILL_RADIUS, radius } from './radius';
import { RAIL_ICON, type ThemeTokens } from './resolve';
import { fonts, fontSizes, type ResolvedFont } from './typography';

// The `--app-*` CSS variables, built in one place. The Mantine theme gives them to a React app;
// `tokens.css` gives the same names to any other stack.

export type CssVariables = Record<string, string>;

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

function kpiVariables(): CssVariables {
  return Object.fromEntries(
    kpiTintKeys.flatMap((key) => [
      [`--app-kpi-${key}-bg`, kpiTints[key].background],
      [`--app-kpi-${key}-text`, kpiTints[key].text],
    ])
  );
}

function sized(prefix: string, values: Record<(typeof SIZES)[number], string>): CssVariables {
  return Object.fromEntries(SIZES.map((size) => [`${prefix}-${size}`, values[size]]));
}

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Every motion token under its CSS name, so a new token can never be left out: `riseStagger` is
 * `--app-motion-rise-stagger`, `easeOut` is `--app-ease-out`.
 */
export function motionVariables(): CssVariables {
  return Object.fromEntries(
    Object.entries(motion).map(([name, value]) => [
      /^ease/.test(name) ? `--app-${kebab(name)}` : `--app-motion-${kebab(name)}`,
      value,
    ])
  );
}

/** The same for every look: text colours, shadows, shell sizes, rounding, type sizes, motion. */
export function staticVariables(): CssVariables {
  const { main } = textColors;
  return {
    '--app-text': main,
    '--app-text-muted': textColors.secondary,
    '--app-error': textColors.error,
    '--app-highlight-text': main,
    '--app-focus-inner': main,
    '--app-sidebar-text': textColors.onDark,
    // Resting rail icons and labels: the very colour the contrast check reads.
    '--app-rail-icon': RAIL_ICON,
    // Soft shadows tinted with the main text colour, never pure black.
    '--app-shadow-sm': `0 1px 2px ${alpha(main, 0.06)}, 0 4px 12px ${alpha(main, 0.06)}`,
    '--app-shadow-md': `0 2px 6px ${alpha(main, 0.06)}, 0 12px 28px ${alpha(main, 0.1)}`,
    '--app-shadow-lg': `0 18px 48px ${alpha(main, 0.24)}`,
    '--app-scrim': alpha(main, 0.45),
    '--app-rail-width': layout.railWidth,
    '--app-rail-panel': layout.railPanel,
    '--app-rail-inset': layout.railInset,
    '--app-frame-radius': layout.frameRadius,
    '--app-frame-pad-work': layout.framePadWork,
    '--app-frame-pad-overview': layout.framePadOverview,
    ...sized('--app-radius', radius),
    '--app-radius-pill': PILL_RADIUS,
    ...sized('--app-font-size', fontSizes),
    '--app-font-mono': fonts.mono,
    ...motionVariables(),
    '--app-motion-max-stagger': String(MAX_STAGGER),
    ...kpiVariables(),
  };
}

/** The colours that change with the preset or the app's own palette. */
export function paletteVariables(tokens: ThemeTokens): CssVariables {
  const { preset } = tokens;
  return {
    '--app-background': preset.background,
    '--app-surface': preset.card,
    '--app-raised': tokens.raised,
    '--app-hairline': preset.border,
    '--app-control-border': tokens.control,
    '--app-accent': preset.accent,
    '--app-accent-text': preset.accent,
    '--app-highlight': preset.highlight,
    // Haze behind the frame, glow behind the active rail icon and soft selections.
    '--app-haze-from': preset.hazeFrom,
    '--app-haze-to': preset.hazeTo,
    '--app-glow': preset.glow,
    '--app-row-hover': tokens.raised,
    '--app-row-selected': preset.glow,
  };
}

/** The sidebar fill and everything drawn in its colour. */
export function sidebarVariables(tokens: ThemeTokens): CssVariables {
  return {
    '--app-sidebar': tokens.sidebar,
    '--app-sidebar-hover': tokens.sidebarHover,
    '--app-sidebar-muted': tokens.sidebarMuted,
    '--app-sidebar-line': tokens.sidebarLine,
    '--app-glow-text': tokens.sidebar,
  };
}

/** The sizes that change with the density. */
export function densityVariables(density: DensityTokens): CssVariables {
  return {
    '--app-frame-margin': density.frameMargin,
    '--app-bento-gap': density.bentoGap,
    '--app-control-height-md': density.controlHeightMd,
    ...sized('--app-spacing', density.spacing),
  };
}

/**
 * The font stack of the page's locale, and its line height when the script needs one. A style
 * that sets a line height of its own takes the larger of the two, so tall letters are never
 * squeezed: `line-height: max(1.3, var(--app-line-height, 0))`.
 */
export function fontVariables(font: ResolvedFont): CssVariables {
  return {
    '--app-font-body': font.family,
    '--app-font-display': font.family,
    ...(font.lineHeight === undefined ? {} : { '--app-line-height': String(font.lineHeight) }),
  };
}

/** Every `--app-*` variable of one look. */
export function appVariables(tokens: ThemeTokens, font: ResolvedFont): CssVariables {
  return {
    ...staticVariables(),
    ...paletteVariables(tokens),
    ...sidebarVariables(tokens),
    ...densityVariables(tokens.density),
    ...fontVariables(font),
  };
}
