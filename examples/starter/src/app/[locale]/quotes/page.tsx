import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { PageHeader, pageTableProps, TableWrap, WorkPage } from 'rawaq-ui';

// Sample quotes for 12 office chairs. Supplier names are invented.
const quotes = [
  { supplier: 'Al Noor Supplies', unit: 410, delivery: 7, payment: 30 },
  { supplier: 'Gulf Office Co.', unit: 395, delivery: 14, payment: 45 },
  { supplier: 'Delta Trading', unit: 430, delivery: 5, payment: 30 },
];

/** Money in the page's language. Next.js may first draw the page with a stand-in locale. */
function moneyFormat(locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR' });
  } catch {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'SAR' });
  }
}

/**
 * A table that must stay a table, also on a phone: a quotation comparison. The supplier column
 * stays in place while the rest scrolls sideways, and a hint says that it scrolls.
 */
export default async function QuotesRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('quotes');
  const money = moneyFormat(locale);

  return (
    <WorkPage
      header={<PageHeader title={t('title')} description={t('description')} locale={locale} />}
    >
      <TableWrap stickyFirstColumn locale={locale}>
        <Table {...pageTableProps}>
          <TableThead>
            <TableTr>
              <TableTh>{t('supplier')}</TableTh>
              <TableTh className="num">{t('unitPrice')}</TableTh>
              <TableTh className="num">{t('delivery')}</TableTh>
              <TableTh className="num">{t('payment')}</TableTh>
              <TableTh className="num">{t('total')}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {quotes.map((quote) => (
              <TableTr key={quote.supplier}>
                <TableTd>
                  <bdi>{quote.supplier}</bdi>
                </TableTd>
                <TableTd className="num">{money.format(quote.unit)}</TableTd>
                <TableTd className="num">{quote.delivery}</TableTd>
                <TableTd className="num">{quote.payment}</TableTd>
                <TableTd className="num">{money.format(quote.unit * 12)}</TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableWrap>
    </WorkPage>
  );
}
