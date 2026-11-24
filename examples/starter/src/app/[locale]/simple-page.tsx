import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Text } from '@mantine/core';
import { PageHeader, WorkCard, WorkPage } from 'rawaq-ui';

/** A Work page with a title and one line of text: the pages the More sheet opens. */
export async function SimplePage({
  params,
  page,
}: {
  params: Promise<{ locale: string }>;
  page: 'reports' | 'settings' | 'customize';
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <WorkPage header={<PageHeader title={t(`nav.${page}`)} locale={locale} />}>
      <WorkCard>
        <Text>{t(`simple.${page}`)}</Text>
      </WorkCard>
    </WorkPage>
  );
}
