'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconForms,
  IconInbox,
  IconLayoutDashboard,
  IconLoader,
  IconMapQuestion,
} from '@tabler/icons-react';
import { Frame, Rail, type RailItem } from 'rawaq-ui';
import { Avatar, Burger, CloseButton, em } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { LookBar } from './look-bar';
import { GALLERY_BASE, type GalleryLook } from './look-shared';
import { galleryWords } from './words';

const NAV_ID = 'gallery-navigation';

/** The rail and the frame around every gallery page, with the look switches in the header. */
export function GalleryShell({ look, children }: { look: GalleryLook; children: ReactNode }) {
  const words = galleryWords[look.locale];
  const pathname = usePathname();
  const [showLabels, setShowLabels] = useState(false);

  // Below the `sm` width (also a desktop window zoomed to 200 percent) the rail is a drawer.
  const narrow = useMediaQuery(`(max-width: ${em(767.98)})`) ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerOpen = narrow && menuOpen;
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  // A new page closes the drawer.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
        requestAnimationFrame(() => menuButton.current?.focus());
      }
    };
  }, [drawerOpen]);

  const items: RailItem[] = [
    {
      key: 'overview',
      href: GALLERY_BASE,
      label: words.nav.overview,
      icon: IconLayoutDashboard,
      exact: true,
    },
    { key: 'work', href: `${GALLERY_BASE}/work`, label: words.nav.work, icon: IconBuildingStore },
    { key: 'loading', href: `${GALLERY_BASE}/loading`, label: words.nav.loading, icon: IconLoader },
    { key: 'empty', href: `${GALLERY_BASE}/empty`, label: words.nav.empty, icon: IconInbox },
    {
      key: 'error',
      href: `${GALLERY_BASE}/error`,
      label: words.nav.error,
      icon: IconAlertTriangle,
    },
    // A real missing page: the server answers 404 with the gallery's not-found page.
    {
      key: 'not-found',
      href: `${GALLERY_BASE}/no-such-page`,
      label: words.nav.notFound,
      icon: IconMapQuestion,
    },
    { key: 'form', href: `${GALLERY_BASE}/form`, label: words.nav.form, icon: IconForms },
  ];

  return (
    <Frame
      pageKind={pathname === GALLERY_BASE ? 'overview' : 'work'}
      pathname={pathname}
      showLabels={showLabels}
      locale={look.locale}
      drawerOpen={drawerOpen}
      onCloseDrawer={() => setMenuOpen(false)}
      rail={
        <Rail
          ref={nav}
          id={NAV_ID}
          appName={words.appName}
          items={items}
          user={words.person}
          pathname={pathname}
          linkComponent={Link}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((shown) => !shown)}
          open={drawerOpen}
          // A closed drawer is only moved off screen; inert keeps it out of the keyboard's way.
          inert={narrow && !menuOpen}
          locale={look.locale}
        >
          <CloseButton
            size="lg"
            radius="xl"
            onClick={() => setMenuOpen(false)}
            aria-label={words.look.closeMenu}
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
            aria-label={menuOpen ? words.look.closeMenu : words.look.openMenu}
            aria-expanded={menuOpen}
            aria-controls={NAV_ID}
            data-testid="menu-button"
          />
          <LookBar look={look} words={words} />
          <Avatar color="primary" radius="xl" name={words.person.name}>
            {words.person.initials}
          </Avatar>
        </>
      }
    >
      {children}
    </Frame>
  );
}
