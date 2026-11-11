import type { MantineSize } from '@mantine/core';

// Density, a choice of its own: Compact (the default) or Comfortable
// (docs/DESIGN_THEME.md section 3).

export const densityKeys = ['comfortable', 'compact'] as const;

export type Density = (typeof densityKeys)[number];

export const DEFAULT_DENSITY: Density = 'compact';

export interface DensityTokens {
  spacing: Record<MantineSize, string>;
  /** Default size of buttons and inputs (Mantine `md` is 42 px high, `sm` is 36 px). */
  controlSize: MantineSize;
  /**
   * Height of an `md` button or input. Comfortable: 40 px (docs/DESIGN_THEME.md section 5).
   * Compact: 42 px, Mantine's own `md` height, so a control that asks for `md` is left alone.
   */
  controlHeightMd: string;
  /** Row padding for roomy lists. Work page tables always use the compact 8 px (create-theme.ts). */
  tableSpacing: MantineSize;
  /** Gap between the window edge and the app frame (docs/DESIGN_THEME.md section 4.1). */
  frameMargin: string;
  /** Gap between Overview cards, and their inner padding (section 4.3). */
  bentoGap: string;
}

/** Sizes of the v2 shell that do not change with density (docs/DESIGN_THEME.md section 4). */
export const layout = {
  railWidth: '64px',
  /** Width of the rail when "Show labels" is on. */
  railPanel: '220px',
  /** Gap between the window edge and the rail. */
  railInset: '12px',
  frameRadius: '24px',
  framePadWork: '12px',
  framePadOverview: '16px',
} as const;

export const densities: Record<Density, DensityTokens> = {
  comfortable: {
    spacing: { xs: '10px', sm: '12px', md: '16px', lg: '24px', xl: '32px' },
    controlSize: 'md',
    controlHeightMd: '40px',
    tableSpacing: 'sm',
    frameMargin: '16px',
    bentoGap: '16px',
  },
  compact: {
    spacing: { xs: '6px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
    controlSize: 'sm',
    controlHeightMd: '42px',
    tableSpacing: 'xs',
    frameMargin: '12px',
    bentoGap: '12px',
  },
};

export function isDensity(value: unknown): value is Density {
  return typeof value === 'string' && (densityKeys as readonly string[]).includes(value);
}
