'use client';

import { type ReactNode, useEffect, useState } from 'react';
import {
  IconAdjustments,
  IconBuildingStore,
  IconChartBar,
  IconFileDescription,
  IconLayoutDashboard,
  IconPalette,
  IconPlus,
  IconScale,
  IconSearch,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { Avatar, Button, TextInput } from '@mantine/core';
import {
  BottomBar,
  Frame,
  IntroReveal,
  isRailItemActive,
  MoreSheet,
  PhoneBar,
  Rail,
  type RailItem,
} from 'rawaq-ui';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const INTRO_SEEN = 'starter-intro-seen';
const languageNames: Record<string, string> = { en: 'English', ar: 'العربية' };

/** The rail and the frame around every page; on a phone the bottom bar and the More sheet. */
export function Shell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  // The address without the language prefix: "/" or "/suppliers".
  const pathname = usePathname();
  // A real app saves this choice for the person; here it lasts until the page is reloaded.
  const [showLabels, setShowLabels] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // The opening plays once per browser session. A real app with sign-in plays it once per
  // sign-in instead: set a marker when the person signs in and clear it in `onShown`.
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    if (!window.sessionStorage.getItem(INTRO_SEEN)) {
      setIntro(true);
    }
  }, []);

  // The four pages people open most: the rail's first four and the phone's bottom bar.
  const items: RailItem[] = [
    { key: 'overview', href: '/', label: t('nav.overview'), icon: IconLayoutDashboard, exact: true },
    { key: 'requests', href: '/requests', label: t('nav.requests'), icon: IconFileDescription },
    { key: 'suppliers', href: '/suppliers', label: t('nav.suppliers'), icon: IconBuildingStore },
    { key: 'quotes', href: '/quotes', label: t('nav.quotes'), icon: IconScale },
  ];
  // The rest: under the divider of the rail, and the tiles of the More sheet.
  const moreItems: RailItem[] = [
    { key: 'reports', href: '/reports', label: t('nav.reports'), icon: IconChartBar },
    { key: 'settings', href: '/settings', label: t('nav.settings'), icon: IconAdjustments },
    {
      key: 'customize',
      href: '/customize',
      label: t('nav.customize'),
      icon: IconPalette,
      highlight: true,
    },
  ];
  const current = [...items, ...moreItems].find((item) => isRailItemActive(item, pathname));
  const user = { name: 'Sara Ahmed', initials: 'SA', role: t('app.role') };

  return (
    <Frame
      // The first page is an Overview (a bento page on the haze); every other page is a Work page.
      pageKind={pathname === '/' ? 'overview' : 'work'}
      pathname={pathname}
      showLabels={showLabels}
      locale={locale}
      rail={
        <Rail
          id="app-navigation"
          appName={t('app.name')}
          items={items}
          bottomItems={moreItems}
          user={user}
          pathname={pathname}
          linkComponent={Link}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((shown) => !shown)}
          locale={locale}
        />
      }
      header={
        <>
          <TextInput
            className="starter-search"
            aria-label={t('app.search')}
            placeholder={t('app.search')}
            leftSection={<IconSearch size={16} aria-hidden />}
          />
          <nav className="starter-languages" aria-label={t('app.language')}>
            {routing.locales.map((language) => (
              <Link
                key={language}
                href={pathname}
                locale={language}
                lang={language}
                aria-current={language === locale ? 'true' : undefined}
              >
                {languageNames[language]}
              </Link>
            ))}
            <Avatar color="primary" radius="xl" name="Sara Ahmed">
              SA
            </Avatar>
          </nav>
        </>
      }
      phoneHeader={
        <PhoneBar
          appName={t('app.name')}
          title={current?.label ?? t('app.name')}
          // The Overview keeps its hero as the page's one h1 on phones too.
          titleOrder={pathname === '/' ? 'none' : 1}
          action={
            pathname === '/requests' ? (
              <Button radius="xl" leftSection={<IconPlus size={18} aria-hidden />}>
                {t('requests.new')}
              </Button>
            ) : undefined
          }
        />
      }
      bottomBar={
        <BottomBar
          items={items}
          pathname={pathname}
          linkComponent={Link}
          onMore={() => setMoreOpen(true)}
          moreOpen={moreOpen}
          moreControls="more-sheet"
          moreActive={moreItems.some((item) => isRailItemActive(item, pathname))}
          locale={locale}
        />
      }
      after={
        <>
          <MoreSheet
            id="more-sheet"
            opened={moreOpen}
            onClose={() => setMoreOpen(false)}
            user={user}
            company={t('app.company')}
            items={moreItems}
            pathname={pathname}
            linkComponent={Link}
            languages={routing.locales.map((language) => ({
              value: language,
              label: languageNames[language] ?? language,
              lang: language,
            }))}
            language={locale}
            // The sheet has closed (and left the history) before this runs.
            onLanguage={(language) => router.replace(pathname, { locale: language })}
            onSignOut={() => setMoreOpen(false)}
            locale={locale}
          />
          {intro ? (
            <IntroReveal
              appName={t('app.name')}
              onShown={() => window.sessionStorage.setItem(INTRO_SEEN, '1')}
            />
          ) : null}
        </>
      }
    >
      {children}
    </Frame>
  );
}
