import { languageOf } from './locale';

// Fonts are a token per locale (docs/DESIGN_THEME.md section 6). Built in: Plus Jakarta Sans for
// Latin text and IBM Plex Sans Arabic for Arabic. An app adds a font for another language without
// changing the package. The font files themselves are loaded by the app.

export interface LocaleFont {
  /** A CSS font family: one face, in quotes when its name has spaces. */
  family: string;
  /**
   * For a script that needs more room (Nastaliq, for example): no line of text is tighter than
   * this. A plain multiplier of the font size, such as 2.2.
   */
  lineHeight?: number;
}

/** Fonts by locale (`ar`, `ur`, `pt-BR`). The key `default` is the face for Latin text. */
export type FontMap = Readonly<Record<string, LocaleFont>>;

export const DEFAULT_FONT = 'default';

export const builtInFonts = {
  [DEFAULT_FONT]: { family: "'Plus Jakarta Sans Variable'" },
  ar: { family: "'IBM Plex Sans Arabic'" },
} as const satisfies FontMap;

const FALLBACK_FAMILIES = 'system-ui, sans-serif';
const MONO_FAMILIES = "ui-monospace, 'SFMono-Regular', Menlo, monospace";

export interface ResolvedFont {
  /** The whole font stack, ready for `font-family`. */
  family: string;
  lineHeight?: number;
}

/**
 * The font stack for a locale. The browser takes each letter from the first face that has it, so
 * the order is: the default face, the locale's own face, then every other known face (an English
 * page still shows an Arabic name in the Arabic face).
 */
export function fontFor(locale?: string, fonts: FontMap = {}): ResolvedFont {
  const known: Record<string, LocaleFont> = { ...builtInFonts, ...fonts };
  const base: LocaleFont = known[DEFAULT_FONT] ?? builtInFonts[DEFAULT_FONT];
  const key =
    locale === undefined
      ? undefined
      : [locale, languageOf(locale)].find(
          (name) => name !== DEFAULT_FONT && Object.hasOwn(known, name)
        );
  const own = key === undefined ? undefined : known[key];
  const others = Object.entries(known)
    .filter(([name]) => name !== DEFAULT_FONT && name !== key)
    .map(([, font]) => font.family);
  const families = new Set([base.family, ...(own ? [own.family] : []), ...others]);
  const lineHeight = own?.lineHeight ?? base.lineHeight;
  return {
    family: [...families, FALLBACK_FAMILIES].join(', '),
    ...(lineHeight === undefined ? {} : { lineHeight }),
  };
}

/** The stacks when no locale is given: Latin first, then Arabic. */
export const fonts = {
  body: fontFor().family,
  mono: MONO_FAMILIES,
} as const;

/** Sizes (section 6): body 14 px, small and table text 13 px. */
export const fontSizes = { xs: '12px', sm: '13px', md: '14px', lg: '16px', xl: '18px' } as const;
