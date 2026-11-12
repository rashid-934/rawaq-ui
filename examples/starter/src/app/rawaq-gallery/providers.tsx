'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { createRawaqTheme } from 'rawaq-ui';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import { DEFAULT_LOOK, type GalleryLook } from './look-shared';

const LookContext = createContext<GalleryLook>(DEFAULT_LOOK);

/** The look of the page, for client parts that are drawn outside a page (the 404 page). */
export const useLook = () => useContext(LookContext);

export interface GalleryProvidersProps {
  look: GalleryLook;
  dir: 'ltr' | 'rtl';
  children: ReactNode;
}

/** The theme of the look the server read from the cookie: in the HTML from the first frame. */
export function GalleryProviders({ look, dir, children }: GalleryProvidersProps) {
  const { preset, sidebar, density, locale } = look;
  const { theme, cssVariablesResolver } = useMemo(
    () => createRawaqTheme({ preset, sidebar, density, locale }),
    [preset, sidebar, density, locale]
  );
  return (
    <DirectionProvider initialDirection={dir} detectDirection={false}>
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme="light"
      >
        <LookContext value={look}>{children}</LookContext>
      </MantineProvider>
    </DirectionProvider>
  );
}
