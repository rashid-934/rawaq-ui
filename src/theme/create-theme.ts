import {
  type CSSVariablesResolver,
  createTheme,
  DEFAULT_THEME,
  type MantineThemeOverride,
} from '@mantine/core';
import { LUMINANCE_THRESHOLD } from '../tokens/contrast';
import { BASE_SHADE } from '../tokens/palette';
import { textColors } from '../tokens/presets';
import { DEFAULT_RADIUS, radius } from '../tokens/radius';
import { LIGHT_VARIANT_TEXT_SHADE, PURE_WHITE, resolveTokens } from '../tokens/resolve';
import type { ThemeLook } from '../tokens/settings';
import { type FontMap, fontFor, fonts, fontSizes } from '../tokens/typography';
import { appVariables } from '../tokens/variables';

// Turns a look (a preset or a palette, a sidebar colour, a density, a locale) into a Mantine
// theme plus CSS variables. CSS modules use the `--app-*` variables; Mantine components use the
// overridden `--mantine-color-*` ones. Light only for now.

/** Work page tables: 8 px cell padding and 13 px text give rows of about 36 px. */
export const TABLE_CELL_PADDING = '8px';
export const TABLE_FONT_SIZE = fontSizes.sm;
/**
 * For the main table of a Work page (section 4.4): its header row sticks right under the app
 * header while the page scrolls. Spread onto `<Table>`; never on a table in a modal or drawer.
 */
export const pageTableProps = {
  stickyHeader: true,
  stickyHeaderOffset: 'var(--app-table-sticky-top, 0px)',
} as const;

/** A look plus the language of the page, which picks the font. */
export interface ThemeInput extends ThemeLook {
  /** The page's locale (`en`, `ar`, `ur-PK`). Picks the font; without it, the default stack. */
  locale?: string;
  /** Fonts for locales the package does not know, or replacements for the built-in ones. */
  fonts?: FontMap;
}

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
const H1 = { fontSize: 'clamp(1.75rem, 1.35rem + 1.6vw, 2.25rem)', lineHeight: '1.2' };

/** A script that needs room: no body line and no heading is tighter than `min`. */
function roomyLines(min: number) {
  const atLeast = (value: string | undefined) => {
    const own = Number(value);
    return String(Number.isFinite(own) ? Math.max(own, min) : min);
  };
  const body = Object.entries(DEFAULT_THEME.lineHeights).map(
    ([size, value]) => [size, atLeast(value)] as const
  );
  const headings = HEADINGS.map(
    (level) =>
      [level, { lineHeight: atLeast(DEFAULT_THEME.headings.sizes[level].lineHeight) }] as const
  );
  return {
    lineHeights: Object.fromEntries(body),
    headingSizes: {
      ...Object.fromEntries(headings),
      h1: { ...H1, lineHeight: atLeast(H1.lineHeight) },
    },
  };
}

export function buildTheme(settings: ThemeInput): MantineThemeOverride {
  const tokens = resolveTokens(settings);
  const font = fontFor(settings.locale, settings.fonts);
  const roomy = font.lineHeight === undefined ? undefined : roomyLines(font.lineHeight);
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
    fontFamily: font.family,
    fontFamilyMonospace: fonts.mono,
    headings: {
      fontFamily: font.family,
      fontWeight: '700',
      sizes: roomy ? roomy.headingSizes : { h1: H1 },
    },
    ...(roomy ? { lineHeights: roomy.lineHeights } : {}),
    spacing: tokens.density.spacing,
    fontSizes: { ...fontSizes },
    radius: { ...radius },
    defaultRadius: DEFAULT_RADIUS,
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
      // Tables (section 3 and 4.4): always at least as tight as Compact, whatever the density
      // (rows about 36 px, cells 8 px), and a hover tint. The sticky header is not a default:
      // only a page's own table gets it (`pageTableProps`), a table inside a modal or a drawer
      // must not stick 68 px down.
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

export function buildCssVariablesResolver(settings: ThemeInput): CSSVariablesResolver {
  const tokens = resolveTokens(settings);
  const { preset } = tokens;
  const variables = appVariables(tokens, fontFor(settings.locale, settings.fonts));
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
    variables,
    // The app is forced to light; the dark block repeats it so nothing falls back to Mantine's
    // own dark palette if a browser asks for dark mode.
    light: mantine,
    dark: mantine,
  });
}
