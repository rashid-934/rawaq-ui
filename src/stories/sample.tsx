import {
  type ComponentPropsWithoutRef,
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
  useState,
} from 'react';
import {
  IconBuildingStore,
  IconChartBar,
  IconFileDescription,
  IconLayoutDashboard,
  IconPalette,
  IconSearch,
  IconSettings,
} from '@tabler/icons-react';
import { Avatar, TextInput } from '@mantine/core';
import {
  type FontMap,
  Frame,
  languageOf,
  type PageKind,
  Rail,
  type RailItem,
  type RawaqLabels,
} from '../index';
import classes from './sample.module.css';

// What the stories share: a small sample app in three languages. Everything here is invented for
// the stories. English and Arabic use the built-in words of the components; Urdu is the example
// of another language, so its words for the components are passed in (`labels`).

/** The font an Urdu app would add. The package itself knows nothing about it. */
export const storyFonts: FontMap = {
  ur: { family: "'Noto Nastaliq Urdu'", lineHeight: 2.2 },
};

/** The language chosen in the Storybook toolbar. */
export const StoryLocale = createContext('en');
export const useStoryLocale = () => useContext(StoryLocale);

interface Stat {
  label: string;
  value: number;
  text?: string;
  hint: string;
}

export interface Words {
  appName: string;
  nav: Record<
    'dashboard' | 'requests' | 'suppliers' | 'reports' | 'settings' | 'customize',
    string
  >;
  search: string;
  person: { name: string; initials: string; role: string };
  heroHello: string;
  heroBefore: string;
  heroEmphasis: string;
  heroAfter: string;
  heroAction: string;
  stats: [Stat, Stat, Stat, Stat];
  byCategory: string;
  categories: { name: string; share: number }[];
  thisWeek: string;
  days: { name: string; count: number }[];
  today: string;
  todayText: string;
  supplier: string;
  suppliersHelp: string;
  addSupplier: string;
  searchSuppliers: string;
  columns: Record<'name' | 'category' | 'city' | 'orders' | 'status', string>;
  cities: string[];
  approved: string;
  underReview: string;
  newSupplier: string;
  fields: Record<'company' | 'registration' | 'city' | 'notes', string>;
  save: string;
  replay: string;
  sampleButton: string;
  samplePill: string;
  sampleLink: string;
  /** Words for the components themselves, for a language that is not built in. */
  labels?: Partial<RawaqLabels>;
}

const dictionary = {
  en: {
    appName: 'Rawaq',
    nav: {
      dashboard: 'Dashboard',
      requests: 'Requests',
      suppliers: 'Suppliers',
      reports: 'Reports',
      settings: 'Settings',
      customize: 'Customize',
    },
    search: 'Search',
    person: { name: 'Sara Ahmed', initials: 'SA', role: 'Buyer' },
    heroHello: 'Good morning, Sara.',
    heroBefore: '',
    heroEmphasis: 'Three things',
    heroAfter: ' need you today.',
    heroAction: 'Start',
    stats: [
      { label: 'Open requests', value: 12, hint: '2 new today' },
      { label: 'Awaiting quotes', value: 7, hint: 'Deadline tomorrow' },
      { label: 'Open orders', value: 128, hint: '3 arriving this week' },
      { label: 'Spend this month', value: 12480, text: '12,480 SAR', hint: 'Under budget' },
    ],
    byCategory: 'Spend by category',
    categories: [
      { name: 'IT', share: 42 },
      { name: 'Office supplies', share: 27 },
      { name: 'Services', share: 19 },
      { name: 'Maintenance', share: 12 },
    ],
    thisWeek: 'Requests this week',
    days: [
      { name: 'Sun', count: 4 },
      { name: 'Mon', count: 7 },
      { name: 'Tue', count: 3 },
      { name: 'Wed', count: 9 },
      { name: 'Thu', count: 5 },
    ],
    today: 'Today',
    todayText: 'No deliveries are due today.',
    supplier: 'Supplier',
    suppliersHelp: 'Everyone you buy from',
    addSupplier: 'Add supplier',
    searchSuppliers: 'Search suppliers',
    columns: {
      name: 'Name',
      category: 'Category',
      city: 'City',
      orders: 'Orders',
      status: 'Status',
    },
    cities: ['Jeddah', 'Riyadh', 'Dammam'],
    approved: 'Approved',
    underReview: 'Under review',
    newSupplier: 'New supplier',
    fields: {
      company: 'Company name',
      registration: 'Registration number',
      city: 'City',
      notes: 'Notes',
    },
    save: 'Save',
    replay: 'Play again',
    sampleButton: 'Button',
    samplePill: 'Pill',
    sampleLink: 'Link',
  },
  ar: {
    appName: 'رواق',
    nav: {
      dashboard: 'لوحة التحكم',
      requests: 'الطلبات',
      suppliers: 'الموردون',
      reports: 'التقارير',
      settings: 'الإعدادات',
      customize: 'التخصيص',
    },
    search: 'بحث',
    person: { name: 'سارة أحمد', initials: 'سأ', role: 'مسؤولة مشتريات' },
    heroHello: 'صباح الخير يا سارة.',
    heroBefore: 'هناك ',
    heroEmphasis: 'ثلاثة أمور',
    heroAfter: ' بانتظارك اليوم.',
    heroAction: 'ابدأ',
    stats: [
      { label: 'الطلبات المفتوحة', value: 12, hint: 'طلبان جديدان اليوم' },
      { label: 'بانتظار عروض الأسعار', value: 7, hint: 'الموعد النهائي غدًا' },
      { label: 'أوامر الشراء المفتوحة', value: 128, hint: '3 تصل هذا الأسبوع' },
      { label: 'إنفاق هذا الشهر', value: 12480, text: '12,480 ر.س', hint: 'ضمن الميزانية' },
    ],
    byCategory: 'الإنفاق حسب الفئة',
    categories: [
      { name: 'تقنية المعلومات', share: 42 },
      { name: 'مستلزمات المكتب', share: 27 },
      { name: 'الخدمات', share: 19 },
      { name: 'الصيانة', share: 12 },
    ],
    thisWeek: 'طلبات هذا الأسبوع',
    days: [
      { name: 'الأحد', count: 4 },
      { name: 'الاثنين', count: 7 },
      { name: 'الثلاثاء', count: 3 },
      { name: 'الأربعاء', count: 9 },
      { name: 'الخميس', count: 5 },
    ],
    today: 'اليوم',
    todayText: 'لا توجد توريدات مستحقة اليوم.',
    supplier: 'المورد',
    suppliersHelp: 'كل من تشتري منهم',
    addSupplier: 'إضافة مورد',
    searchSuppliers: 'ابحث في الموردين',
    columns: {
      name: 'الاسم',
      category: 'الفئة',
      city: 'المدينة',
      orders: 'الطلبات',
      status: 'الحالة',
    },
    cities: ['جدة', 'الرياض', 'الدمام'],
    approved: 'معتمد',
    underReview: 'قيد المراجعة',
    newSupplier: 'مورد جديد',
    fields: {
      company: 'اسم الشركة',
      registration: 'رقم السجل التجاري',
      city: 'المدينة',
      notes: 'ملاحظات',
    },
    save: 'حفظ',
    replay: 'تشغيل مرة أخرى',
    sampleButton: 'زر',
    samplePill: 'شارة',
    sampleLink: 'رابط',
  },
  ur: {
    appName: 'رواق',
    nav: {
      dashboard: 'ڈیش بورڈ',
      requests: 'درخواستیں',
      suppliers: 'سپلائرز',
      reports: 'رپورٹس',
      settings: 'ترتیبات',
      customize: 'اپنی پسند',
    },
    search: 'تلاش',
    person: { name: 'سارہ احمد', initials: 'سا', role: 'خریدار' },
    heroHello: 'صبح بخیر، سارہ۔',
    heroBefore: 'آج ',
    heroEmphasis: 'تین کام',
    heroAfter: ' آپ کے منتظر ہیں۔',
    heroAction: 'شروع کریں',
    stats: [
      { label: 'کھلی درخواستیں', value: 12, hint: 'آج 2 نئی' },
      { label: 'کوٹیشن کا انتظار', value: 7, hint: 'آخری تاریخ کل ہے' },
      { label: 'کھلے آرڈرز', value: 128, hint: 'اس ہفتے 3 پہنچیں گے' },
      { label: 'اس ماہ کا خرچ', value: 12480, text: '12,480 ریال', hint: 'بجٹ کے اندر' },
    ],
    byCategory: 'زمرے کے لحاظ سے خرچ',
    categories: [
      { name: 'آئی ٹی', share: 42 },
      { name: 'دفتری سامان', share: 27 },
      { name: 'خدمات', share: 19 },
      { name: 'مرمت', share: 12 },
    ],
    thisWeek: 'اس ہفتے کی درخواستیں',
    days: [
      { name: 'اتوار', count: 4 },
      { name: 'پیر', count: 7 },
      { name: 'منگل', count: 3 },
      { name: 'بدھ', count: 9 },
      { name: 'جمعرات', count: 5 },
    ],
    today: 'آج',
    todayText: 'آج کوئی ترسیل متوقع نہیں۔',
    supplier: 'سپلائر',
    suppliersHelp: 'وہ سب جن سے آپ خریدتے ہیں',
    addSupplier: 'سپلائر شامل کریں',
    searchSuppliers: 'سپلائرز تلاش کریں',
    columns: { name: 'نام', category: 'زمرہ', city: 'شہر', orders: 'آرڈرز', status: 'حالت' },
    cities: ['جدہ', 'ریاض', 'دمام'],
    approved: 'منظور شدہ',
    underReview: 'زیرِ جائزہ',
    newSupplier: 'نیا سپلائر',
    fields: {
      company: 'کمپنی کا نام',
      registration: 'رجسٹریشن نمبر',
      city: 'شہر',
      notes: 'نوٹس',
    },
    save: 'محفوظ کریں',
    replay: 'دوبارہ چلائیں',
    sampleButton: 'بٹن',
    samplePill: 'ٹیگ',
    sampleLink: 'لنک',
    labels: {
      skipToContent: 'مرکزی مواد پر جائیں',
      mainNavigation: 'مرکزی مینو',
      showLabels: 'نام دکھائیں',
      labelsNotSaved: 'یہ انتخاب محفوظ نہیں ہو سکا۔ اگلی بار یہ پہلے جیسا ہوگا۔',
      loading: 'لوڈ ہو رہا ہے',
      itemCount: (count) => `${count} آئٹمز`,
    },
  },
} satisfies Record<string, Words>;

/** The sample words in the language of the toolbar (English when there are none). */
export function useWords(): Words {
  const words: Record<string, Words> = dictionary;
  return words[languageOf(useStoryLocale())] ?? dictionary.en;
}

const Go = createContext<(href: string) => void>(() => {});

/** A link that only moves the sample app's "address", so the rail's glow slides in a story. */
export function StoryLink({ href = '', onClick, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const go = useContext(Go);
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        go(href);
      }}
      {...rest}
    />
  );
}

const BASE = '/app';

export interface AppShellProps {
  pageKind: PageKind;
  /** The address the story opens on. */
  path?: string;
  /** Start with "Show labels" on. */
  labelsOpen?: boolean;
  after?: ReactNode;
  children: ReactNode;
}

/** The rail and the frame around a sample page, as an app would put them together. */
export function AppShell({
  pageKind,
  path = BASE,
  labelsOpen = false,
  after,
  children,
}: AppShellProps) {
  const words = useWords();
  const locale = useStoryLocale();
  const [pathname, setPathname] = useState(path);
  const [showLabels, setShowLabels] = useState(labelsOpen);

  const items: RailItem[] = [
    {
      key: 'dashboard',
      href: BASE,
      label: words.nav.dashboard,
      icon: IconLayoutDashboard,
      exact: true,
    },
    {
      key: 'requests',
      href: `${BASE}/requests`,
      label: words.nav.requests,
      icon: IconFileDescription,
      count: 12,
    },
    {
      key: 'suppliers',
      href: `${BASE}/suppliers`,
      label: words.nav.suppliers,
      icon: IconBuildingStore,
    },
    { key: 'reports', href: `${BASE}/reports`, label: words.nav.reports, icon: IconChartBar },
    { key: 'settings', href: `${BASE}/settings`, label: words.nav.settings, icon: IconSettings },
  ];
  const bottomItems: RailItem[] = [
    {
      key: 'customize',
      href: `${BASE}/customize`,
      label: words.nav.customize,
      icon: IconPalette,
      highlight: true,
    },
  ];

  return (
    <Go value={setPathname}>
      <Frame
        pageKind={pageKind}
        pathname={pathname}
        showLabels={showLabels}
        locale={locale}
        labels={words.labels}
        after={after}
        rail={
          <Rail
            id="story-nav"
            appName={words.appName}
            items={items}
            bottomItems={bottomItems}
            user={words.person}
            pathname={pathname}
            linkComponent={StoryLink}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((shown) => !shown)}
            locale={locale}
            labels={words.labels}
          />
        }
        header={
          <>
            <TextInput
              className={classes.search}
              aria-label={words.search}
              placeholder={words.search}
              leftSection={<IconSearch size={16} aria-hidden />}
            />
            <Avatar color="primary" radius="xl" name={words.person.name}>
              {words.person.initials}
            </Avatar>
          </>
        }
      >
        {children}
      </Frame>
    </Go>
  );
}

const value = (name: string, amount: string) => ({ [name]: amount }) as CSSProperties;

/** Horizontal bars that grow once from the start side (`.grow-x`). Each has its name and value. */
export function CategoryBars() {
  const { categories } = useWords();
  return (
    <ul className={classes.bars}>
      {categories.map(({ name, share }, index) => {
        const percent = `${share}%`;
        return (
          <li key={name} className={classes.bar}>
            <span>{name}</span>
            <span className={classes.track} aria-hidden>
              <span
                className={`${classes.fill} grow-x`}
                style={{ ...value('--value', percent), ...value('--order', String(index)) }}
              />
            </span>
            <span className="num">{percent}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Vertical bars that grow once from the bottom (`.grow-y`). Each has its day and its count. */
export function WeekBars() {
  const { days } = useWords();
  return (
    <ul className={classes.columns}>
      {days.map(({ name, count }, index) => (
        <li key={name} className={classes.column}>
          <span className="tabular">{count}</span>
          <span
            className={`${classes.columnFill} grow-y`}
            aria-hidden
            style={{ ...value('--value', `${count * 10}px`), ...value('--order', String(index)) }}
          />
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );
}
