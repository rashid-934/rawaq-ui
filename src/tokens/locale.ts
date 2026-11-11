// Direction comes from a list of locales, never from a test for one language. An app with another
// right-to-left language adds it to the list; nothing in the package changes.

/** Locales written from right to left that Rawaq UI knows out of the box. */
export const rtlLocales = ['ar', 'ur', 'fa', 'he'] as const;

export type Direction = 'ltr' | 'rtl';

function normalise(locale: string): string {
  return locale.trim().toLowerCase().replaceAll('_', '-');
}

/** The language part of a locale: `ar` for `ar-SA`, `ur` for `ur_PK`. */
export function languageOf(locale: string): string {
  return normalise(locale).split('-')[0] ?? '';
}

/** True when `locale` is `entry` or a more specific form of it (`ar-SA` for `ar`). */
function isWithin(locale: string, entry: string): boolean {
  const wanted = normalise(entry);
  const given = normalise(locale);
  return wanted !== '' && (given === wanted || given.startsWith(`${wanted}-`));
}

/**
 * The writing direction of a locale. Pass the app's own right-to-left locales as the second
 * value when they are not in `rtlLocales`, for example `directionOf(locale, ['ps', 'ku-Arab'])`.
 */
export function directionOf(locale: string, extraRtlLocales: readonly string[] = []): Direction {
  return [...rtlLocales, ...extraRtlLocales].some((entry) => isWithin(locale, entry))
    ? 'rtl'
    : 'ltr';
}
