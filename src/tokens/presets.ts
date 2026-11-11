// The seven colour presets (docs/DESIGN_THEME.md section 2). Colours live only in src/tokens;
// components read them through the Mantine theme or the `--app-*` CSS variables.

export const presetKeys = [
  'sand-forest',
  'stone-navy',
  'pearl-teal',
  'linen-burgundy',
  'graphite-amber',
  'slate-gray',
  'onyx-black',
] as const;

export type PresetKey = (typeof presetKeys)[number];

export const DEFAULT_PRESET: PresetKey = 'sand-forest';

/** The nine colours of a look. A preset is one of these with a key; an app may bring its own. */
export interface PaletteTokens {
  /** Page background, behind the frame and under the haze. */
  background: string;
  /** Cards, inputs, tables, the frame's inner surface. */
  card: string;
  /** Card and divider hairlines (decorative, not a control border). */
  border: string;
  /** Rail and hero banner fill when the sidebar choice is "Match theme". */
  sidebar: string;
  /** Filled buttons, links, active states. */
  accent: string;
  /** Focus ring, the banner's pill button and emphasised word, highlighted rail entries. */
  highlight: string;
  /** Start of the soft background gradient (top, start side). */
  hazeFrom: string;
  /** End of the soft background gradient (bottom, end side). */
  hazeTo: string;
  /** Circle behind the active rail icon, and soft selections (selected row, count badges). */
  glow: string;
}

export const paletteKeys = [
  'background',
  'card',
  'border',
  'sidebar',
  'accent',
  'highlight',
  'hazeFrom',
  'hazeTo',
  'glow',
] as const satisfies readonly (keyof PaletteTokens)[];

export interface PresetTokens extends PaletteTokens {
  key: PresetKey;
}

/** Shared by every preset; both text colours pass WCAG AA on every background (contrast.test.ts). */
export const textColors = {
  main: '#1F2A24',
  secondary: '#5A6158',
  /** Text on the sidebar and on accent fills. */
  onDark: '#FFFFFF',
  /** Validation messages and destructive actions. */
  error: '#A61B1B',
} as const;

export const presets: Record<PresetKey, PresetTokens> = {
  'sand-forest': {
    key: 'sand-forest',
    background: '#F6F3EC',
    card: '#FFFDF8',
    border: '#E5DDCB',
    sidebar: '#173B30',
    accent: '#1F6B4F',
    highlight: '#C49A45',
    hazeFrom: '#E4EFE8',
    hazeTo: '#F5E7DA',
    glow: '#CDEBDC',
  },
  'stone-navy': {
    key: 'stone-navy',
    background: '#F3F4F6',
    card: '#FFFFFF',
    border: '#E2E5EA',
    sidebar: '#1B2B44',
    accent: '#2B5A9E',
    highlight: '#C9A24A',
    hazeFrom: '#E3E9F2',
    hazeTo: '#F3EADB',
    glow: '#D3E0F4',
  },
  'pearl-teal': {
    key: 'pearl-teal',
    background: '#F2F6F5',
    card: '#FFFFFF',
    border: '#DCE6E3',
    sidebar: '#0F3D3E',
    accent: '#11766F',
    highlight: '#D9A441',
    hazeFrom: '#DFEEEC',
    hazeTo: '#F4E9D8',
    glow: '#CBEBE6',
  },
  'linen-burgundy': {
    key: 'linen-burgundy',
    background: '#F7F2EF',
    card: '#FFFCFA',
    border: '#EADDD6',
    sidebar: '#4A1F2A',
    accent: '#8C2F45',
    highlight: '#C99A5B',
    hazeFrom: '#F1E3E5',
    hazeTo: '#F4E8DA',
    glow: '#F0D3DA',
  },
  'graphite-amber': {
    key: 'graphite-amber',
    background: '#F4F3F1',
    card: '#FFFFFF',
    border: '#E4E1DC',
    sidebar: '#26272B',
    accent: '#9A5B0B',
    highlight: '#E0A84A',
    hazeFrom: '#ECEAE6',
    hazeTo: '#F4E6D3',
    glow: '#F3DDB8',
  },
  'slate-gray': {
    key: 'slate-gray',
    background: '#F1F2F4',
    card: '#FFFFFF',
    border: '#DFE2E6',
    sidebar: '#3B4048',
    accent: '#4B5563',
    highlight: '#C9A24A',
    hazeFrom: '#E6E8EC',
    hazeTo: '#EFEFEF',
    glow: '#DADDE3',
  },
  'onyx-black': {
    key: 'onyx-black',
    background: '#F2F2F1',
    card: '#FFFFFF',
    border: '#E2E2E0',
    sidebar: '#121315',
    accent: '#1E1F23',
    highlight: '#D4A548',
    hazeFrom: '#E7E7E6',
    hazeTo: '#F1EEE8',
    glow: '#E6E6E6',
  },
};

export function isPresetKey(value: unknown): value is PresetKey {
  return typeof value === 'string' && (presetKeys as readonly string[]).includes(value);
}
