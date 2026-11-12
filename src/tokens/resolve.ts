import type { MantineColorsTuple } from '@mantine/core';
import { densities, type DensityTokens } from './density';
import { alpha, firstPassing, GENTLE_DARK_STEPS, mix, shadesFrom } from './palette';
import { type PaletteTokens, presets, textColors } from './presets';
import type { ThemeLook } from './settings';
import { resolveSidebarColor } from './sidebar';

// From the nine colours of a look to every colour a screen uses. Pure maths: no React and no
// Mantine at run time, so the theme builder, the palette check and the token files share it.

export const PURE_WHITE = '#FFFFFF';
const PURE_BLACK = '#000000';
/** Text of Mantine's "light" buttons and badges: one shade darker than the accent passes AA. */
export const LIGHT_VARIANT_TEXT_SHADE = 7;
/** Mantine's "light" variant background: the accent at this opacity over the page or card. */
export const LIGHT_VARIANT_ALPHA = 0.1;
/** Rail icons, and the labels beside them, rest at this opacity of white (section 4.2). */
export const RAIL_ICON_OPACITY = 0.75;
export const RAIL_ICON = alpha(textColors.onDark, RAIL_ICON_OPACITY);

/** Every colour the screens of one look use, derived from its nine colours and its choices. */
export interface ThemeTokens {
  /** The nine colours: the preset's, or the app's own palette. */
  preset: PaletteTokens;
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

/** Hover rows and raised panels: the card moved a little towards the hairline colour. */
export function raisedSurface(palette: PaletteTokens): string {
  return mix(palette.card, palette.border, 0.45);
}

export function resolveTokens(look: ThemeLook): ThemeTokens {
  const preset: PaletteTokens = look.palette ?? presets[look.preset];
  const raised = raisedSurface(preset);
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

  const sidebar = resolveSidebarColor(preset, look.sidebar);
  return {
    preset,
    density: densities[look.density],
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
