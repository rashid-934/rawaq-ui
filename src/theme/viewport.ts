import { DEFAULT_PRESET, type PaletteTokens, type PresetKey } from '../tokens/presets';
import { DEFAULT_SIDEBAR, resolveSidebarColor, type SidebarChoice } from '../tokens/sidebar';

/** The look that decides the browser's bar colour: a preset (or a palette) and the sidebar. */
export interface ViewportLook {
  preset?: PresetKey;
  palette?: PaletteTokens;
  sidebar?: SidebarChoice;
}

/**
 * The page's viewport settings for phones, in the shape of Next.js's `viewport` export (no
 * Next.js import, so any stack can read it):
 *
 * - `viewportFit: 'cover'` lets the page reach under the notch and the gesture bar; the safe-area
 *   variables (`--app-safe-*`) keep the bars and sheets clear of them.
 * - `interactiveWidget: 'resizes-content'` makes the page shorter while the phone keyboard is
 *   open, so a save bar sits above the keyboard.
 * - `themeColor` is the rail colour: the browser's own bar matches the app's top strip.
 */
export function rawaqViewport(look: ViewportLook = {}) {
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    interactiveWidget: 'resizes-content',
    themeColor: themeColorFor(look),
  } as const;
}

/** The browser bar colour of a look: the rail colour. */
export function themeColorFor({ preset, palette, sidebar }: ViewportLook = {}): string {
  return resolveSidebarColor(palette ?? preset ?? DEFAULT_PRESET, sidebar ?? DEFAULT_SIDEBAR);
}
