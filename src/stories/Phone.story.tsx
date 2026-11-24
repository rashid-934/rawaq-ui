import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconCash,
  IconClipboardList,
  IconFileInvoice,
  IconPlus,
  IconTruckDelivery,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  TextInput,
} from '@mantine/core';
import {
  ActivityList,
  BentoCard,
  CardList,
  Emphasis,
  FilterChips,
  FormGrid,
  FormGridItem,
  HeroBanner,
  languageOf,
  NeedsYouList,
  OverviewPage,
  PageHeader,
  pageTableProps,
  SearchField,
  StatCard,
  StatGrid,
  StickyActions,
  TableWrap,
  WorkCard,
  WorkList,
  WorkPage,
} from '../index';
import { AppShell, StoryLink, useStoryLocale, useWords } from './sample';

// The phone layout (docs/DESIGN_THEME.md, "Phone layout"). Open a story with the Phone 390
// viewport in the toolbar; on a desktop width the same story shows the desktop layout.

interface PhoneWords {
  dashboard: string;
  hello: string;
  things: string;
  helloEnd: string;
  needs: { action: string; subject: string }[];
  stats: [string, string, string, string];
  activity: string;
  requests: string;
  newRequest: string;
  searchRequests: string;
  filter: string;
  chips: [string, string, string];
  statusNew: string;
  statusWaiting: string;
  rows: { ref: string; title: string; dept: string; date: string; qty: number; waiting: boolean }[];
  columns: [string, string, string, string];
  quotes: string;
  quoteColumns: [string, string, string, string, string];
  form: string;
  fields: [string, string, string, string];
  save: string;
  cancel: string;
}

const phoneWords: Record<string, PhoneWords> = {
  en: {
    dashboard: 'Dashboard',
    hello: 'Good afternoon, Sara.',
    things: '9 things',
    helloEnd: 'need you today.',
    needs: [
      { action: 'Approve request', subject: 'Parking barrier repair' },
      { action: 'Compare 3 quotes', subject: 'RFQ-2611-0004' },
      { action: 'Send PO to supplier', subject: 'PO-2611-0009' },
    ],
    stats: ['Open requests', 'Waiting for quotes', 'POs pending', 'Saved this month'],
    activity: 'Recent activity',
    requests: 'Requests',
    newRequest: 'New request',
    searchRequests: 'Search requests',
    filter: 'Status',
    chips: ['All', 'New', 'Waiting approval'],
    statusNew: 'New',
    statusWaiting: 'Waiting approval',
    rows: [
      {
        ref: 'REQ-2611-0012',
        title: 'Office chairs',
        dept: 'IT',
        date: '24 Nov',
        qty: 12,
        waiting: false,
      },
      {
        ref: 'REQ-2611-0011',
        title: 'Parking barrier repair',
        dept: 'Maintenance',
        date: '23 Nov',
        qty: 1,
        waiting: true,
      },
      {
        ref: 'REQ-2611-0010',
        title: 'Printer toner',
        dept: 'Office',
        date: '23 Nov',
        qty: 8,
        waiting: false,
      },
      {
        ref: 'REQ-2611-0009',
        title: 'Safety vests',
        dept: 'Operations',
        date: '22 Nov',
        qty: 40,
        waiting: true,
      },
    ],
    columns: ['No.', 'Item', 'Department', 'Status'],
    quotes: 'Quotes',
    quoteColumns: ['Supplier', 'Unit price', 'Delivery', 'Payment', 'Total'],
    form: 'New request',
    fields: ['Item', 'Quantity', 'Department', 'Needed by'],
    save: 'Save',
    cancel: 'Cancel',
  },
  ar: {
    dashboard: 'الرئيسية',
    hello: 'مساء الخير يا سارة.',
    things: '9 مهام',
    helloEnd: 'بانتظارك اليوم.',
    needs: [
      { action: 'اعتماد طلب', subject: 'إصلاح حاجز الموقف' },
      { action: 'مقارنة 3 عروض', subject: 'RFQ-2611-0004' },
      { action: 'إرسال أمر الشراء', subject: 'PO-2611-0009' },
    ],
    stats: ['طلبات مفتوحة', 'بانتظار العروض', 'أوامر شراء معلقة', 'التوفير هذا الشهر'],
    activity: 'آخر النشاطات',
    requests: 'الطلبات',
    newRequest: 'طلب جديد',
    searchRequests: 'ابحث في الطلبات',
    filter: 'الحالة',
    chips: ['الكل', 'جديدة', 'بانتظار الموافقة'],
    statusNew: 'جديدة',
    statusWaiting: 'بانتظار الموافقة',
    rows: [
      {
        ref: 'REQ-2611-0012',
        title: 'كراسي مكتب',
        dept: 'تقنية المعلومات',
        date: '24 نوفمبر',
        qty: 12,
        waiting: false,
      },
      {
        ref: 'REQ-2611-0011',
        title: 'إصلاح حاجز الموقف',
        dept: 'الصيانة',
        date: '23 نوفمبر',
        qty: 1,
        waiting: true,
      },
      {
        ref: 'REQ-2611-0010',
        title: 'حبر طابعة',
        dept: 'المكتب',
        date: '23 نوفمبر',
        qty: 8,
        waiting: false,
      },
      {
        ref: 'REQ-2611-0009',
        title: 'سترات سلامة',
        dept: 'العمليات',
        date: '22 نوفمبر',
        qty: 40,
        waiting: true,
      },
    ],
    columns: ['الرقم', 'الصنف', 'القسم', 'الحالة'],
    quotes: 'العروض',
    quoteColumns: ['المورد', 'سعر الوحدة', 'التسليم', 'الدفع', 'الإجمالي'],
    form: 'طلب جديد',
    fields: ['الصنف', 'الكمية', 'القسم', 'مطلوب قبل'],
    save: 'حفظ',
    cancel: 'إلغاء',
  },
  ur: {
    dashboard: 'ڈیش بورڈ',
    hello: 'سہ پہر بخیر، سارہ۔',
    things: '9 کام',
    helloEnd: 'آج آپ کے منتظر ہیں۔',
    needs: [
      { action: 'درخواست منظور کریں', subject: 'پارکنگ بیریئر کی مرمت' },
      { action: '3 کوٹیشنز کا موازنہ', subject: 'RFQ-2611-0004' },
      { action: 'سپلائر کو پی او بھیجیں', subject: 'PO-2611-0009' },
    ],
    stats: ['کھلی درخواستیں', 'کوٹیشنز کے منتظر', 'زیر التوا پی او', 'اس ماہ کی بچت'],
    activity: 'حالیہ سرگرمی',
    requests: 'درخواستیں',
    newRequest: 'نئی درخواست',
    searchRequests: 'درخواستیں تلاش کریں',
    filter: 'حالت',
    chips: ['سب', 'نئی', 'منظوری کی منتظر'],
    statusNew: 'نئی',
    statusWaiting: 'منظوری کی منتظر',
    rows: [
      {
        ref: 'REQ-2611-0012',
        title: 'دفتری کرسیاں',
        dept: 'آئی ٹی',
        date: '24 نومبر',
        qty: 12,
        waiting: false,
      },
      {
        ref: 'REQ-2611-0011',
        title: 'پارکنگ بیریئر کی مرمت',
        dept: 'مرمت',
        date: '23 نومبر',
        qty: 1,
        waiting: true,
      },
      {
        ref: 'REQ-2611-0010',
        title: 'پرنٹر ٹونر',
        dept: 'دفتر',
        date: '23 نومبر',
        qty: 8,
        waiting: false,
      },
      {
        ref: 'REQ-2611-0009',
        title: 'حفاظتی جیکٹس',
        dept: 'آپریشنز',
        date: '22 نومبر',
        qty: 40,
        waiting: true,
      },
    ],
    columns: ['نمبر', 'آئٹم', 'شعبہ', 'حالت'],
    quotes: 'کوٹیشنز',
    quoteColumns: ['سپلائر', 'فی یونٹ قیمت', 'ترسیل', 'ادائیگی', 'کل'],
    form: 'نئی درخواست',
    fields: ['آئٹم', 'مقدار', 'شعبہ', 'کب تک درکار'],
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
  },
};

function usePhoneWords() {
  return phoneWords[languageOf(useStoryLocale())] ?? phoneWords.en!;
}

function NewRequestButton() {
  const words = usePhoneWords();
  return (
    <Button leftSection={<IconPlus size={18} aria-hidden />} radius="xl">
      {words.newRequest}
    </Button>
  );
}

function PhoneOverview({ moreOpen = false }: { moreOpen?: boolean }) {
  const words = usePhoneWords();
  const sample = useWords();
  const locale = useStoryLocale();
  return (
    <AppShell pageKind="overview" phone={{ title: words.dashboard, moreOpen }}>
      <OverviewPage
        side={
          <BentoCard title={words.activity}>
            <ActivityList
              linkComponent={StoryLink}
              items={words.rows.slice(0, 3).map((row) => ({
                key: row.ref,
                title: row.title,
                reference: row.ref,
                href: `/app/requests/${row.ref}`,
                status: (
                  <Badge variant={row.waiting ? 'outline' : 'light'} color="primary">
                    {row.waiting ? words.statusWaiting : words.statusNew}
                  </Badge>
                ),
              }))}
            />
          </BentoCard>
        }
      >
        <HeroBanner
          order={0}
          title={
            <>
              {words.hello} <Emphasis>{words.things}</Emphasis> {words.helloEnd}
            </>
          }
        >
          <NeedsYouList
            linkComponent={StoryLink}
            locale={locale}
            labels={sample.labels}
            items={words.needs.map((need, index) => ({
              key: String(index),
              action: need.action,
              subject: need.subject,
              href: `/app/requests/${index}`,
            }))}
          />
        </HeroBanner>
        <StatGrid>
          <StatCard
            order={1}
            label={words.stats[0]}
            value={128}
            icon={IconClipboardList}
            tint="green"
          />
          <StatCard
            order={2}
            label={words.stats[1]}
            value={37}
            icon={IconFileInvoice}
            tint="amber"
          />
          <StatCard
            order={3}
            label={words.stats[2]}
            value={16}
            icon={IconTruckDelivery}
            tint="slate"
          />
          <StatCard
            order={4}
            label={words.stats[3]}
            value={48250}
            text="48,250"
            icon={IconCash}
            tint="clay"
            currency="SAR"
            locale={locale}
          />
        </StatGrid>
      </OverviewPage>
    </AppShell>
  );
}

function RequestsTable() {
  const words = usePhoneWords();
  return (
    <TableWrap>
      <Table {...pageTableProps}>
        <TableThead>
          <TableTr>
            {words.columns.map((column) => (
              <TableTh key={column}>{column}</TableTh>
            ))}
          </TableTr>
        </TableThead>
        <TableTbody>
          {words.rows.map((row) => (
            <TableTr key={row.ref}>
              <TableTd className="tabular">{row.ref}</TableTd>
              <TableTd>{row.title}</TableTd>
              <TableTd>{row.dept}</TableTd>
              <TableTd>{row.waiting ? words.statusWaiting : words.statusNew}</TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableWrap>
  );
}

function PhoneRequests() {
  const words = usePhoneWords();
  const sample = useWords();
  const locale = useStoryLocale();
  const [chip, setChip] = useState('all');
  return (
    <AppShell
      pageKind="work"
      path="/app/requests"
      phone={{ title: words.requests, action: <NewRequestButton /> }}
    >
      <WorkPage
        header={
          <PageHeader
            title={words.requests}
            count={words.rows.length}
            actions={<NewRequestButton />}
            locale={locale}
            labels={sample.labels}
          />
        }
        filters={
          <>
            <SearchField label={words.searchRequests} />
            <FilterChips
              label={words.filter}
              value={chip}
              onChange={setChip}
              options={words.chips.map((label, index) => ({
                value: ['all', 'new', 'waiting'][index]!,
                label,
              }))}
            />
          </>
        }
      >
        <WorkList
          cards={
            <CardList
              linkComponent={StoryLink}
              locale={locale}
              labels={sample.labels}
              items={words.rows.map((row) => ({
                key: row.ref,
                reference: row.ref,
                title: row.title,
                meta: `${row.dept} · ${row.date}`,
                quantity: row.qty,
                href: `/app/requests/${row.ref}`,
                status: (
                  <Badge variant={row.waiting ? 'outline' : 'light'} color="primary">
                    {row.waiting ? words.statusWaiting : words.statusNew}
                  </Badge>
                ),
              }))}
            />
          }
          table={<RequestsTable />}
        />
      </WorkPage>
    </AppShell>
  );
}

function PhoneQuotes({ withInputs = false }: { withInputs?: boolean }) {
  const words = usePhoneWords();
  const sample = useWords();
  const locale = useStoryLocale();
  const suppliers = ['Al Noor Supplies', 'Gulf Office Co.', 'Delta Trading'];
  return (
    <AppShell pageKind="work" path="/app/requests" phone={{ title: words.quotes }}>
      <WorkPage header={<PageHeader title={words.quotes} locale={locale} labels={sample.labels} />}>
        <WorkList
          phoneView="table"
          cards={null}
          table={
            <TableWrap stickyFirstColumn locale={locale} labels={sample.labels}>
              <Table {...pageTableProps}>
                <TableThead>
                  <TableTr>
                    {words.quoteColumns.map((column) => (
                      <TableTh key={column}>{column}</TableTh>
                    ))}
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {suppliers.map((supplier, index) => (
                    <TableTr key={supplier}>
                      <TableTd>{supplier}</TableTd>
                      <TableTd className="num">
                        {withInputs ? (
                          <TextInput
                            aria-label={`${words.quoteColumns[1]}, ${supplier}`}
                            defaultValue={String(120 + index * 15)}
                          />
                        ) : (
                          120 + index * 15
                        )}
                      </TableTd>
                      <TableTd>{7 + index * 3}</TableTd>
                      <TableTd>30</TableTd>
                      <TableTd className="num">{(120 + index * 15) * 40}</TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </TableWrap>
          }
        />
      </WorkPage>
    </AppShell>
  );
}

function PhoneForm() {
  const words = usePhoneWords();
  return (
    <AppShell pageKind="work" path="/app/requests" phone={{ title: words.form }}>
      <WorkPage width="form">
        <WorkCard>
          <FormGrid>
            {words.fields.map((field) => (
              <FormGridItem key={field}>
                <TextInput label={field} />
              </FormGridItem>
            ))}
          </FormGrid>
        </WorkCard>
        <StickyActions>
          <Button variant="default">{words.cancel}</Button>
          <Button>{words.save}</Button>
        </StickyActions>
      </WorkPage>
    </AppShell>
  );
}

const meta = {
  title: 'Phone',
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone390', isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = { render: () => <PhoneOverview /> };
export const RequestsAsCards: Story = {
  name: 'Requests as cards',
  render: () => <PhoneRequests />,
};
export const QuotesAsTable: Story = { name: 'Quotes as table', render: () => <PhoneQuotes /> };
export const TableWithInputs: Story = {
  name: 'Table with inputs',
  render: () => <PhoneQuotes withInputs />,
};
export const MoreSheet: Story = { name: 'More sheet', render: () => <PhoneOverview moreOpen /> };
export const FormWithSaveBar: Story = { name: 'Form with save bar', render: () => <PhoneForm /> };
export const UrduOverview: Story = {
  name: 'Overview in Urdu',
  globals: { locale: 'ur' },
  render: () => <PhoneOverview />,
};
export const UrduRequests: Story = {
  name: 'Requests in Urdu',
  globals: { locale: 'ur' },
  render: () => <PhoneRequests />,
};
