import { PageHeader, pageTableProps, TableWrap, WorkPage } from 'rawaq-ui';
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
import { readLook } from '../../look';
import { galleryWords } from '../../words';

/** A Work page with a filled table: a one-line header with a count, a sticky header row. */
export default async function GalleryWork() {
  const { locale } = await readLook();
  const words = galleryWords[locale];
  const { work } = words;
  const rows = Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    name: work.supplier(index + 1),
    category: words.overview.categories[index % words.overview.categories.length],
    city: work.cities[index % work.cities.length],
    orders: (index * 7) % 23,
    approved: index % 3 !== 0,
  }));

  return (
    <WorkPage
      header={
        <PageHeader
          title={work.title}
          count={rows.length}
          description={work.description}
          actions={<Button>{work.add}</Button>}
          locale={locale}
        />
      }
    >
      <TableWrap>
        <Table {...pageTableProps}>
          <TableThead>
            <TableTr>
              <TableTh>{work.columns.name}</TableTh>
              <TableTh>{work.columns.category}</TableTh>
              <TableTh>{work.columns.city}</TableTh>
              <TableTh className="num">{work.columns.orders}</TableTh>
              <TableTh>{work.columns.status}</TableTh>
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
                    {row.approved ? work.approved : work.underReview}
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
