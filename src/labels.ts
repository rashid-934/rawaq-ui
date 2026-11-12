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
  /** The title of an empty state when the app gives none. */
  emptyTitle: string;
  /** The title of the error state. */
  errorTitle: string;
  /** One line of help under it. Never the error itself. */
  errorHelp: string;
  /** The title of the "page not found" state. */
  notFoundTitle: string;
  /** One line of help under it. */
  notFoundHelp: string;
  /** The button of the error state. */
  tryAgain: string;
  /** The word before the reference code of an error. */
  reference: string;
  /** The name of the button that copies the reference code. */
  copyReference: string;
  /** Said once the reference code is copied. */
  referenceCopied: string;
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
    emptyTitle: 'Nothing here yet',
    errorTitle: 'Something went wrong',
    errorHelp: 'Please try again. If it keeps happening, send us the reference code.',
    notFoundTitle: 'Page not found',
    notFoundHelp: 'This page does not exist, or you cannot open it.',
    tryAgain: 'Try again',
    reference: 'Reference',
    copyReference: 'Copy the reference code',
    referenceCopied: 'Copied',
  },
  ar: {
    skipToContent: 'تخطَّ إلى المحتوى الرئيسي',
    mainNavigation: 'القائمة الرئيسية',
    showLabels: 'إظهار الأسماء',
    labelsNotSaved: 'تعذر حفظ هذا الاختيار. سيعود كما كان في المرة القادمة.',
    loading: 'جارٍ التحميل',
    itemCount: (count) => arabicItems[arabicPlurals.select(count)](count),
    emptyTitle: 'لا يوجد شيء هنا بعد',
    errorTitle: 'حدث خطأ ما',
    errorHelp: 'حاول مرة أخرى. إذا تكرر الخطأ، أرسل لنا الرمز المرجعي.',
    notFoundTitle: 'الصفحة غير موجودة',
    notFoundHelp: 'هذه الصفحة غير موجودة، أو لا يمكنك فتحها.',
    tryAgain: 'حاول مرة أخرى',
    reference: 'الرمز المرجعي',
    copyReference: 'نسخ الرمز المرجعي',
    referenceCopied: 'تم النسخ',
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
