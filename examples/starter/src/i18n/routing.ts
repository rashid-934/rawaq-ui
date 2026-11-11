import { defineRouting } from 'next-intl/routing';

// The languages of the app. To add one (Urdu, for example): add it here, add its messages file,
// and give Rawaq UI its font and its words (see "Add another language" in the package README).
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
