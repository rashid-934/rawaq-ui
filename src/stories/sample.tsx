import {
  type ComponentPropsWithoutRef,
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
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
import { Avatar, Burger, CloseButton, em, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
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
  noSuppliers: string;
  noSuppliersHelp: string;
  cardWorks: string;
  breakCard: string;
  openMenu: string;
  closeMenu: string;
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
    noSuppliers: 'No suppliers yet',
    noSuppliersHelp: 'Add the first one to start buying from them.',
    cardWorks: 'This card works.',
    breakCard: 'Break this card',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
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
    noSuppliers: 'لا يوجد موردون بعد',
    noSuppliersHelp: 'أضف أول مورد لتبدأ الشراء منه.',
    cardWorks: 'هذه البطاقة تعمل.',
    breakCard: 'عطّل هذه البطاقة',
    openMenu: 'افتح القائمة',
    closeMenu: 'أغلق القائمة',
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
    noSuppliers: 'ابھی کوئی سپلائر نہیں',
    noSuppliersHelp: 'خریداری شروع کرنے کے لیے پہلا سپلائر شامل کریں۔',
    cardWorks: 'یہ کارڈ کام کر رہا ہے۔',
    breakCard: 'اس کارڈ کو خراب کریں',
    openMenu: 'مینو کھولیں',
    closeMenu: 'مینو بند کریں',
    labels: {
      emptyTitle: 'ابھی یہاں کچھ نہیں',
      errorTitle: 'کچھ غلط ہو گیا',
      errorHelp: 'دوبارہ کوشش کریں۔ اگر یہ مسئلہ برقرار رہے تو ہمیں حوالہ کوڈ بھیجیں۔',
      notFoundTitle: 'صفحہ نہیں ملا',
      notFoundHelp: 'یہ صفحہ موجود نہیں، یا آپ اسے نہیں کھول سکتے۔',
      tryAgain: 'دوبارہ کوشش کریں',
      reference: 'حوالہ',
      copyReference: 'حوالہ کوڈ کاپی کریں',
      referenceCopied: 'کاپی ہو گیا',
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

  // Below the `sm` width (also a desktop window zoomed to 200 percent) the rail is a drawer that
  // the menu button in the header opens, as an app does it. Wider windows never show the button.
  const narrow = useMediaQuery(`(max-width: ${em(767.98)})`) ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerOpen = narrow && menuOpen;
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const go = (href: string) => {
    setPathname(href);
    setMenuOpen(false);
  };

  // The open drawer takes the focus and Esc closes it. Closed, the focus goes back to the button.
  useEffect(() => {
    if (!drawerOpen) {
      return undefined;
    }
    const drawer = nav.current;
    drawer?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    drawer?.addEventListener('keydown', onKeyDown);
    return () => {
      drawer?.removeEventListener('keydown', onKeyDown);
      const focused = document.activeElement;
      if (!focused || focused === document.body || drawer?.contains(focused)) {
        // After the draw that lifts `inert` from the page.
        requestAnimationFrame(() => menuButton.current?.focus());
      }
    };
  }, [drawerOpen]);

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
    <Go value={go}>
      <Frame
        pageKind={pageKind}
        pathname={pathname}
        showLabels={showLabels}
        locale={locale}
        labels={words.labels}
        after={after}
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setMenuOpen(false)}
        rail={
          <Rail
            ref={nav}
            id="story-nav"
            appName={words.appName}
            items={items}
            bottomItems={bottomItems}
            user={words.person}
            pathname={pathname}
            linkComponent={StoryLink}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((shown) => !shown)}
            open={drawerOpen}
            // A closed drawer is only moved off screen; inert keeps it out of the keyboard's way.
            inert={narrow && !menuOpen}
            locale={locale}
            labels={words.labels}
          >
            <CloseButton
              size="lg"
              radius="xl"
              onClick={() => setMenuOpen(false)}
              aria-label={words.closeMenu}
            />
          </Rail>
        }
        header={
          <>
            <Burger
              ref={menuButton}
              opened={menuOpen}
              onClick={() => setMenuOpen((opened) => !opened)}
              hiddenFrom="sm"
              size="sm"
              aria-label={menuOpen ? words.closeMenu : words.openMenu}
              aria-expanded={menuOpen}
              aria-controls="story-nav"
              data-testid="menu-button"
            />
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
