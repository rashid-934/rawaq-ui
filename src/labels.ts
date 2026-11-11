import { languageOf } from './tokens/locale';

// Every word a component of Rawaq UI says itself. English and Arabic are built in; an app in
// another language passes its own words (`labels`) and they are used as they are.

export interface RawaqLabels {
  /** The first link of the page, for keyboards and screen readers. */
  skipToContent: string;
  /** The name of the rail for screen readers. */
  mainNavigation: string;
  /** The toggle at the bottom of the rail. */
  showLabels: string;
  /** Said when the "Show labels" choice could not be remembered. */
  labelsNotSaved: string;
  /** Said once by a loading skeleton. */
  loading: string;
  /** What a screen reader hears for the count beside a page title: "16 items". */
  itemCount: (count: number) => string;
}

const arabicPlurals = new Intl.PluralRules('ar');
const arabicItems: Record<Intl.LDMLPluralRule, (count: number) => string> = {
  zero: () => 'لا عناصر',
  one: () => 'عنصر واحد',
  two: () => 'عنصران',
  few: (count) => `${count} عناصر`,
  many: (count) => `${count} عنصرًا`,
  other: (count) => `${count} عنصر`,
};

export const rawaqLabels = {
  en: {
    skipToContent: 'Skip to main content',
    mainNavigation: 'Main navigation',
    showLabels: 'Show labels',
    labelsNotSaved: 'This choice could not be saved. It will reset next time.',
    loading: 'Loading',
    itemCount: (count) => (count === 1 ? '1 item' : `${count} items`),
  },
  ar: {
    skipToContent: 'تخطَّ إلى المحتوى الرئيسي',
    mainNavigation: 'القائمة الرئيسية',
    showLabels: 'إظهار الأسماء',
    labelsNotSaved: 'تعذر حفظ هذا الاختيار. سيعود كما كان في المرة القادمة.',
    loading: 'جارٍ التحميل',
    itemCount: (count) => arabicItems[arabicPlurals.select(count)](count),
  },
} satisfies Record<string, RawaqLabels>;

/**
 * The words for a locale: the built-in set of its language (English when there is none), with
 * the app's own words on top. A word the app leaves out keeps its built-in text.
 */
export function labelsFor(locale = 'en', overrides: Partial<RawaqLabels> = {}): RawaqLabels {
  const builtIn: Record<string, RawaqLabels> = rawaqLabels;
  const language = languageOf(locale);
  const base = (Object.hasOwn(builtIn, language) ? builtIn[language] : undefined) ?? rawaqLabels.en;
  const given = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined)
  );
  return { ...base, ...given };
}
