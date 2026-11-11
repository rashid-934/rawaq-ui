import { type PresetKey, presets } from './presets';

// Sidebar colour, a separate company choice: "Match theme" or one of ten curated swatches
// (docs/DESIGN_THEME.md section 2). No free colour picker.

export const sidebarSwatches = {
  forest: '#173B30',
  navy: '#1B2B44',
  'deep-teal': '#0F3D3E',
  burgundy: '#4A1F2A',
  graphite: '#26272B',
  olive: '#33402A',
  plum: '#3B2A45',
  espresso: '#3A2A20',
  slate: '#3B4048',
  onyx: '#121315',
} as const;

export type SidebarSwatch = keyof typeof sidebarSwatches;

export const MATCH_THEME = 'match';

export const sidebarChoices = [
  MATCH_THEME,
  ...(Object.keys(sidebarSwatches) as SidebarSwatch[]),
] as const;

export type SidebarChoice = typeof MATCH_THEME | SidebarSwatch;

export const DEFAULT_SIDEBAR: SidebarChoice = MATCH_THEME;

export function isSidebarChoice(value: unknown): value is SidebarChoice {
  return typeof value === 'string' && (sidebarChoices as readonly string[]).includes(value);
}

/** The sidebar fill for a preset and a sidebar choice. */
export function resolveSidebarColor(preset: PresetKey, choice: SidebarChoice): string {
  return choice === MATCH_THEME ? presets[preset].sidebar : sidebarSwatches[choice];
}
