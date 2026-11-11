import type { ReactNode } from 'react';
import { render as testingLibraryRender } from '@testing-library/react';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import { createRawaqTheme } from '../theme';
import { directionOf } from '../tokens/locale';

export interface RenderOptions {
  locale?: string;
}

/** Renders with what an app gives the components: the theme and the text direction. */
export function render(ui: ReactNode, { locale = 'en' }: RenderOptions = {}) {
  const { theme, cssVariablesResolver } = createRawaqTheme({ locale });
  const dir = directionOf(locale);
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <DirectionProvider initialDirection={dir} detectDirection={false}>
        <MantineProvider
          theme={theme}
          cssVariablesResolver={cssVariablesResolver}
          forceColorScheme="light"
          env="test"
        >
          <div dir={dir}>{children}</div>
        </MantineProvider>
      </DirectionProvider>
    ),
  });
}

/** The same, in Arabic and right-to-left. */
export function renderRtl(ui: ReactNode) {
  return render(ui, { locale: 'ar' });
}
