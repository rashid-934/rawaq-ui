'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { IconBuildingStore, IconLayoutDashboard, IconSearch } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { Avatar, TextInput } from '@mantine/core';
import { Frame, IntroReveal, Rail, type RailItem } from 'rawaq-ui';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const INTRO_SEEN = 'starter-intro-seen';
const languageNames: Record<string, string> = { en: 'English', ar: 'العربية' };

/** The rail and the frame around every page. */
export function Shell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  // The address without the language prefix: "/" or "/suppliers".
  const pathname = usePathname();
  // A real app saves this choice for the person; here it lasts until the page is reloaded.
  const [showLabels, setShowLabels] = useState(false);

  // The opening plays once per browser session. A real app with sign-in plays it once per
  // sign-in instead: set a marker when the person signs in and clear it in `onShown`.
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    if (!window.sessionStorage.getItem(INTRO_SEEN)) {
      setIntro(true);
    }
  }, []);

  const items: RailItem[] = [
    { key: 'overview', href: '/', label: t('nav.overview'), icon: IconLayoutDashboard, exact: true },
    { key: 'suppliers', href: '/suppliers', label: t('nav.suppliers'), icon: IconBuildingStore },
  ];

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
          user={{ name: 'Sara Ahmed', initials: 'SA', role: t('app.role') }}
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
          <nav className="starter-languages" aria-label="Language">
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
      after={
        intro ? (
          <IntroReveal
            appName={t('app.name')}
            onShown={() => window.sessionStorage.setItem(INTRO_SEEN, '1')}
          />
        ) : null
      }
    >
      {children}
    </Frame>
  );
}
