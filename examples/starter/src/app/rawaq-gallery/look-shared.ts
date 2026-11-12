// The gallery's look: preset, sidebar colour, density and language, kept in one cookie that the
// server reads. So the first painted frame already has the chosen look, with no flash of the
// default colours or of the wrong direction.
import { DEFAULT_THEME_SETTINGS, parseThemeSettings, type ThemeSettings } from 'rawaq-ui/tokens';

export const LOOK_COOKIE = 'rawaq-gallery-look';
export const GALLERY_BASE = '/rawaq-gallery';
export const GALLERY_LOCALES = ['en', 'ar'] as const;
export type GalleryLocale = (typeof GALLERY_LOCALES)[number];

export interface GalleryLook extends ThemeSettings {
  locale: GalleryLocale;
}

export const DEFAULT_LOOK: GalleryLook = { ...DEFAULT_THEME_SETTINGS, locale: 'en' };

const isLocale = (value: unknown): value is GalleryLocale =>
  (GALLERY_LOCALES as readonly unknown[]).includes(value);

/** Reads the cookie's value. Anything unknown falls back to the default look. */
export function parseLook(raw: string | undefined): GalleryLook {
  const values = new URLSearchParams(raw ?? '');
  const locale = values.get('locale');
  return {
    ...parseThemeSettings({
      preset: values.get('preset'),
      sidebar: values.get('sidebar'),
      density: values.get('density'),
    }),
    locale: isLocale(locale) ? locale : DEFAULT_LOOK.locale,
  };
}

/** The cookie's value for a look. */
export function lookValue(look: GalleryLook): string {
  return new URLSearchParams({
    preset: look.preset,
    sidebar: look.sidebar,
    density: look.density,
    locale: look.locale,
  }).toString();
}
