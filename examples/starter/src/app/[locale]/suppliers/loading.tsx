import { getLocale } from 'next-intl/server';
import { PageSkeleton } from 'rawaq-ui';

/** Shown while the page loads: soft shapes in the theme's colours, after a short wait. */
export default async function Loading() {
  return <PageSkeleton shape="table" locale={await getLocale()} />;
}
