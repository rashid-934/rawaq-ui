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
import {
  CardList,
  PageHeader,
  pageTableProps,
  SearchField,
  TableWrap,
  WorkList,
  WorkPage,
} from 'rawaq-ui';
import { Link } from '@/i18n/navigation';

// Sample rows, so the page shows something. A real app reads them from its data.
const rows = [
  { ref: 'REQ-2611-0012', item: 'chairs', department: 'it', date: '2026-11-24', quantity: 12, waiting: false },
  { ref: 'REQ-2611-0011', item: 'barrier', department: 'maintenance', date: '2026-11-23', quantity: 1, waiting: true },
  { ref: 'REQ-2611-0010', item: 'toner', department: 'office', date: '2026-11-23', quantity: 8, waiting: false },
  { ref: 'REQ-2611-0009', item: 'vests', department: 'operations', date: '2026-11-22', quantity: 40, waiting: true },
  { ref: 'REQ-2611-0008', item: 'bags', department: 'it', date: '2026-11-21', quantity: 6, waiting: false },
] as const;

/**
 * A Work page in both shapes: cards on a phone, the table from 768 px up (`WorkList`). Both are
 * drawn here on the server; the stylesheet shows the one the window needs.
 */
export default async function RequestsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('requests');
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const status = (waiting: boolean) => (
    <Badge variant={waiting ? 'outline' : 'light'}>{waiting ? t('waiting') : t('statusNew')}</Badge>
  );

  return (
    <WorkPage
      header={
        <PageHeader
          title={t('title')}
          count={rows.length}
          actions={<Button>{t('new')}</Button>}
          locale={locale}
        />
      }
      filters={<SearchField label={t('search')} />}
    >
      <WorkList
        cards={
          <CardList
            locale={locale}
            linkComponent={Link}
            items={rows.map((row) => ({
              key: row.ref,
              reference: row.ref,
              status: status(row.waiting),
              title: t(`rows.${row.item}`),
              meta: `${t(`departments.${row.department}`)} · ${day.format(new Date(row.date))}`,
              quantity: row.quantity,
              href: '/requests',
            }))}
          />
        }
        table={
          <TableWrap>
            <Table {...pageTableProps}>
              <TableThead>
                <TableTr>
                  <TableTh>{t('number')}</TableTh>
                  <TableTh>{t('item')}</TableTh>
                  <TableTh>{t('department')}</TableTh>
                  <TableTh className="num">{t('quantity')}</TableTh>
                  <TableTh>{t('status')}</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {rows.map((row) => (
                  <TableTr key={row.ref}>
                    <TableTd className="tabular">{row.ref}</TableTd>
                    <TableTd>{t(`rows.${row.item}`)}</TableTd>
                    <TableTd>{t(`departments.${row.department}`)}</TableTd>
                    <TableTd className="num">{row.quantity}</TableTd>
                    <TableTd>{status(row.waiting)}</TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </TableWrap>
        }
      />
    </WorkPage>
  );
}
