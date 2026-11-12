// The gallery's words in English and Arabic. Everything here is invented sample content.
import type { Density, PresetKey, SidebarChoice } from 'rawaq-ui/tokens';
import type { GalleryLocale } from './look-shared';

interface Stat {
  label: string;
  hint: string;
}

export interface GalleryWords {
  appName: string;
  nav: Record<'overview' | 'work' | 'loading' | 'empty' | 'error' | 'notFound' | 'form', string>;
  look: {
    title: string;
    preset: string;
    sidebar: string;
    density: string;
    language: string;
    openMenu: string;
    closeMenu: string;
  };
  presets: Record<PresetKey, string>;
  sidebars: Record<SidebarChoice, string>;
  densities: Record<Density, string>;
  languages: Record<GalleryLocale, string>;
  person: { name: string; initials: string; role: string };
  overview: {
    heroBefore: string;
    heroEmphasis: string;
    heroAfter: string;
    action: string;
    stats: [Stat, Stat, Stat, Stat];
    spendText: string;
    byCategory: string;
    categories: string[];
    today: string;
    todayText: string;
  };
  work: {
    title: string;
    description: string;
    add: string;
    supplier: (number: number) => string;
    columns: Record<'name' | 'category' | 'city' | 'orders' | 'status', string>;
    cities: string[];
    approved: string;
    underReview: string;
  };
  empty: { title: string; help: string };
  notFoundBack: string;
  form: {
    title: string;
    description: string;
    company: string;
    registration: string;
    registrationValue: string;
    registrationError: string;
    number: string;
    numberValue: string;
    city: string;
    notes: string;
    notesPlaceholder: string;
    welcome: string;
    save: string;
    saveDraft: string;
  };
}

const en: GalleryWords = {
  appName: 'Rawaq gallery',
  nav: {
    overview: 'Overview page',
    work: 'Work page',
    loading: 'Loading',
    empty: 'Empty',
    error: 'Error',
    notFound: 'Page not found',
    form: 'Form',
  },
  look: {
    title: 'Look',
    preset: 'Preset',
    sidebar: 'Sidebar',
    density: 'Density',
    language: 'Language',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
  },
  presets: {
    'sand-forest': 'Sand and Forest',
    'stone-navy': 'Stone and Navy',
    'pearl-teal': 'Pearl and Teal',
    'linen-burgundy': 'Linen and Burgundy',
    'graphite-amber': 'Graphite and Amber',
    'slate-gray': 'Slate Gray',
    'onyx-black': 'Onyx Black',
  },
  sidebars: {
    match: 'Match theme',
    forest: 'Forest',
    navy: 'Navy',
    'deep-teal': 'Deep teal',
    burgundy: 'Burgundy',
    graphite: 'Graphite',
    olive: 'Olive',
    plum: 'Plum',
    espresso: 'Espresso',
    slate: 'Slate',
    onyx: 'Onyx',
  },
  densities: { compact: 'Compact', comfortable: 'Comfortable' },
  languages: { en: 'English', ar: 'العربية' },
  person: { name: 'Sara Ahmed', initials: 'SA', role: 'Buyer' },
  overview: {
    heroBefore: 'Good morning. ',
    heroEmphasis: 'Three things',
    heroAfter: ' need you today.',
    action: 'See the table',
    stats: [
      { label: 'Open requests', hint: '2 new today' },
      { label: 'Awaiting quotes', hint: 'Deadline tomorrow' },
      { label: 'Open orders', hint: '3 arriving this week' },
      { label: 'Spend this month', hint: 'Under budget' },
    ],
    spendText: '12,480 SAR',
    byCategory: 'Spend by category',
    categories: ['IT', 'Office supplies', 'Services', 'Maintenance'],
    today: 'Today',
    todayText: 'No deliveries are due today.',
  },
  work: {
    title: 'Suppliers',
    description: 'Everyone you buy from',
    add: 'Add supplier',
    supplier: (number) => `Supplier ${number}`,
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
  },
  empty: {
    title: 'No suppliers yet',
    help: 'Add the first one, or bring them in from a file.',
  },
  notFoundBack: 'Back to the overview',
  form: {
    title: 'New supplier',
    description: 'Fields with a star are needed.',
    company: 'Company name',
    registration: 'Registration number',
    registrationValue: '12345',
    registrationError: 'Enter the 10 digits of the registration number.',
    number: 'Supplier number',
    numberValue: 'Given after saving',
    city: 'City',
    notes: 'Notes',
    notesPlaceholder: 'Anything the team should know',
    welcome: 'Send a welcome email',
    save: 'Save',
    saveDraft: 'Save as draft',
  },
};

const ar: GalleryWords = {
  appName: 'معرض رواق',
  nav: {
    overview: 'صفحة نظرة عامة',
    work: 'صفحة عمل',
    loading: 'جارٍ التحميل',
    empty: 'فارغة',
    error: 'خطأ',
    notFound: 'صفحة غير موجودة',
    form: 'نموذج',
  },
  look: {
    title: 'المظهر',
    preset: 'النمط',
    sidebar: 'الشريط الجانبي',
    density: 'الكثافة',
    language: 'اللغة',
    openMenu: 'افتح القائمة',
    closeMenu: 'أغلق القائمة',
  },
  presets: {
    'sand-forest': 'رمل وغابة',
    'stone-navy': 'حجر وكحلي',
    'pearl-teal': 'لؤلؤ وفيروزي',
    'linen-burgundy': 'كتان وعنابي',
    'graphite-amber': 'جرافيت وكهرماني',
    'slate-gray': 'رمادي أردوازي',
    'onyx-black': 'أسود جزعي',
  },
  sidebars: {
    match: 'مثل النمط',
    forest: 'غابة',
    navy: 'كحلي',
    'deep-teal': 'فيروزي داكن',
    burgundy: 'عنابي',
    graphite: 'جرافيت',
    olive: 'زيتوني',
    plum: 'برقوقي',
    espresso: 'إسبريسو',
    slate: 'أردوازي',
    onyx: 'جزعي',
  },
  densities: { compact: 'مضغوطة', comfortable: 'مريحة' },
  languages: { en: 'English', ar: 'العربية' },
  person: { name: 'سارة أحمد', initials: 'س أ', role: 'مشترية' },
  overview: {
    heroBefore: 'صباح الخير. ',
    heroEmphasis: 'ثلاثة أمور',
    heroAfter: ' تنتظرك اليوم.',
    action: 'اعرض الجدول',
    stats: [
      { label: 'طلبات مفتوحة', hint: 'اثنان جديدان اليوم' },
      { label: 'بانتظار العروض', hint: 'الموعد النهائي غدًا' },
      { label: 'أوامر شراء مفتوحة', hint: 'ثلاثة تصل هذا الأسبوع' },
      { label: 'الإنفاق هذا الشهر', hint: 'ضمن الميزانية' },
    ],
    spendText: '12,480 ريال',
    byCategory: 'الإنفاق حسب الفئة',
    categories: ['تقنية المعلومات', 'لوازم مكتبية', 'خدمات', 'صيانة'],
    today: 'اليوم',
    todayText: 'لا توجد توريدات مستحقة اليوم.',
  },
  work: {
    title: 'الموردون',
    description: 'كل من تشتري منهم',
    add: 'أضف موردًا',
    supplier: (number) => `المورد ${number}`,
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
  },
  empty: {
    title: 'لا يوجد موردون بعد',
    help: 'أضف أول مورد، أو استوردهم من ملف.',
  },
  notFoundBack: 'العودة إلى النظرة العامة',
  form: {
    title: 'مورد جديد',
    description: 'الحقول التي عليها نجمة مطلوبة.',
    company: 'اسم الشركة',
    registration: 'رقم السجل التجاري',
    registrationValue: '12345',
    registrationError: 'أدخل أرقام السجل التجاري العشرة.',
    number: 'رقم المورد',
    numberValue: 'يُعطى بعد الحفظ',
    city: 'المدينة',
    notes: 'ملاحظات',
    notesPlaceholder: 'ما يحتاج الفريق إلى معرفته',
    welcome: 'أرسل رسالة ترحيب',
    save: 'حفظ',
    saveDraft: 'حفظ كمسودة',
  },
};

export const galleryWords: Record<GalleryLocale, GalleryWords> = { en, ar };
