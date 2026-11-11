'use client';

import { type ReactNode, useMemo } from 'react';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import { createRawaqTheme } from 'rawaq-ui';

export interface ProvidersProps {
  locale: string;
  dir: 'ltr' | 'rtl';
  children: ReactNode;
}

/**
 * The look of the app, in one place. Change `preset` to one of the seven presets, `sidebar` to
 * "match" or a swatch, `density` to "compact" or "comfortable"; or pass a `palette` of your own
 * nine colours instead of a preset.
 */
export function Providers({ locale, dir, children }: ProvidersProps) {
  const { theme, cssVariablesResolver } = useMemo(
    () => createRawaqTheme({ preset: 'sand-forest', sidebar: 'match', density: 'compact', locale }),
    [locale]
  );
  return (
    <DirectionProvider initialDirection={dir} detectDirection={false}>
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme="light"
      >
        {children}
      </MantineProvider>
    </DirectionProvider>
  );
}
