// Rounding (docs/DESIGN_THEME.md section 5): buttons and inputs 10 px (md), Work cards 12 px
// (lg), Overview cards 16 px (xl). The frame's own radius is in `layout` (density.ts).

export const radius = { xs: '6px', sm: '8px', md: '10px', lg: '12px', xl: '16px' } as const;

/** The radius a component gets when it asks for none. */
export const DEFAULT_RADIUS = 'md';

/** Fully rounded: the rail, pill buttons and pill tabs. */
export const PILL_RADIUS = '999px';
