import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  Badge,
  Button,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from '@mantine/core';
import { PageHeader, pageTableProps, TableWrap, WorkPage } from 'rawaq-ui';

// Rendered for each request, so the loading skeleton next to this file can be seen.
export const dynamic = 'force-dynamic';

const categories = ['it', 'office', 'services', 'maintenance'] as const;
const cities = ['jeddah', 'riyadh', 'dammam'] as const;

/** A Work page: a one-line header with a count, and a dense table whose header row sticks. */
export default async function SuppliersRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // Stands in for reading real data: long enough to see the skeleton once.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const rows = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    name: t('suppliers.supplier', { number: index + 1 }),
    category: t(`overview.categories.${categories[index % categories.length]!}`),
    city: t(`suppliers.cities.${cities[index % cities.length]!}`),
    orders: (index * 7) % 23,
    approved: index % 3 !== 0,
  }));

  return (
    <WorkPage
      header={
        <PageHeader
          title={t('suppliers.title')}
          count={rows.length}
          description={t('suppliers.description')}
          actions={<Button>{t('suppliers.add')}</Button>}
          locale={locale}
        />
      }
    >
      <TableWrap>
        {/* Flat parts (TableThead, not Table.Thead): they work in server components. */}
        <Table {...pageTableProps}>
          <TableThead>
            <TableTr>
              <TableTh>{t('suppliers.name')}</TableTh>
              <TableTh>{t('suppliers.category')}</TableTh>
              <TableTh>{t('suppliers.city')}</TableTh>
              <TableTh className="num">{t('suppliers.orders')}</TableTh>
              <TableTh>{t('suppliers.status')}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {rows.map((row) => (
              <TableTr key={row.id}>
                <TableTd>{row.name}</TableTd>
                <TableTd>{row.category}</TableTd>
                <TableTd>{row.city}</TableTd>
                <TableTd className="num">{row.orders}</TableTd>
                <TableTd>
                  <Badge variant={row.approved ? 'light' : 'default'}>
                    {row.approved ? t('suppliers.approved') : t('suppliers.underReview')}
                  </Badge>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableWrap>
    </WorkPage>
  );
}
