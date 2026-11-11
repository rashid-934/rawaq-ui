import { contrastRatio, onFillColor } from './contrast';
import { BASE_SHADE, mix } from './palette';
import { paletteKeys, type PaletteTokens, textColors } from './presets';
import {
  LIGHT_VARIANT_ALPHA,
  LIGHT_VARIANT_TEXT_SHADE,
  RAIL_ICON,
  raisedSurface,
  resolveTokens,
  type ThemeTokens,
} from './resolve';
import { DEFAULT_THEME_SETTINGS } from './settings';
import { MATCH_THEME, type SidebarChoice } from './sidebar';

// An app may bring its own nine colours. They must pass the same contrast pairs as the seven
// presets (docs/DESIGN_THEME.md section 2), so a brand palette can never make a screen unreadable.

/** Normal-size text (WCAG 1.4.3). */
export const AA_TEXT = 4.5;
/** Large text, control borders, focus rings and shapes that carry meaning (WCAG 1.4.3, 1.4.11). */
export const AA_NON_TEXT = 3;

export interface ContrastPair {
  /** What the pair is, in words: "link text (accent) on card". */
  name: string;
  foreground: string;
  background: string;
  /** The ratio WCAG 2.2 AA asks for. */
  min: number;
}

export interface ContrastFailure extends ContrastPair {
  /** The ratio the two colours really have. */
  ratio: number;
}

export interface PaletteReport {
  ok: boolean;
  /** Colours that are missing or not written as six hex digits (`#1F6B4F`). */
  invalid: (keyof PaletteTokens)[];
  /** Pairs below their ratio. Empty while `invalid` has entries: fix those first. */
  failures: ContrastFailure[];
}

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

type Surface = readonly [label: string, colour: string];

function pair(name: string, foreground: string, background: string, min: number): ContrastPair {
  return { name, foreground, background, min };
}

/** Text straight on the three page surfaces. Needs nothing derived, so it never throws. */
function textPairs(palette: PaletteTokens, raised: string): ContrastPair[] {
  const surfaces: Surface[] = [
    ['the background', palette.background],
    ['the card', palette.card],
    ['a raised surface (card mixed with border)', raised],
  ];
  return surfaces.flatMap(([label, surface]) => [
    pair(`main text on ${label}`, textColors.main, surface, AA_TEXT),
    pair(`secondary text on ${label}`, textColors.secondary, surface, AA_TEXT),
    pair(`link text (accent) on ${label}`, palette.accent, surface, AA_TEXT),
    pair(`error text on ${label}`, textColors.error, surface, AA_TEXT),
  ]);
}

/** Every pair that does not depend on the sidebar choice. */
function surfacePairs(tokens: ThemeTokens): ContrastPair[] {
  const palette = tokens.preset;
  const { main, secondary, onDark } = textColors;
  const surfaces: Surface[] = [
    ['the background', palette.background],
    ['the card', palette.card],
    ['a raised surface', tokens.raised],
  ];
  const lightText = tokens.primary[LIGHT_VARIANT_TEXT_SHADE] as string;
  const onAccent = onFillColor(palette.accent, { black: main, white: onDark });
  const onHighlight = onFillColor(palette.highlight, { black: main, white: onDark });

  return [
    ...textPairs(palette, tokens.raised),
    ...surfaces.flatMap(([label, surface]) => [
      pair(`control border on ${label}`, tokens.control, surface, AA_NON_TEXT),
      pair(
        `light button text on its accent tint over ${label}`,
        lightText,
        mix(surface, palette.accent, LIGHT_VARIANT_ALPHA),
        AA_TEXT
      ),
    ]),
    pair('main text on haze from', main, palette.hazeFrom, AA_TEXT),
    pair('secondary text on haze from', secondary, palette.hazeFrom, AA_TEXT),
    pair('main text on haze to', main, palette.hazeTo, AA_TEXT),
    pair('secondary text on haze to', secondary, palette.hazeTo, AA_TEXT),
    pair('main text on the glow (selected row)', main, palette.glow, AA_TEXT),
    pair('secondary text on the glow (selected row)', secondary, palette.glow, AA_TEXT),
    pair('white text on the accent', onDark, palette.accent, AA_TEXT),
    pair('filled button text, at rest', onAccent, tokens.primary[BASE_SHADE] as string, AA_TEXT),
    pair(
      'filled button text, hovered',
      onAccent,
      tokens.primary[BASE_SHADE + 1] as string,
      AA_TEXT
    ),
    pair(
      'text on a highlight fill, at rest',
      onHighlight,
      tokens.highlight[BASE_SHADE] as string,
      AA_TEXT
    ),
    pair(
      'text on a highlight fill, hovered',
      onHighlight,
      tokens.highlight[BASE_SHADE + 1] as string,
      AA_TEXT
    ),
    pair('main text on the highlight pill button', main, palette.highlight, AA_TEXT),
    pair(
      'focus ring: the highlight against its dark inner ring',
      palette.highlight,
      main,
      AA_NON_TEXT
    ),
  ];
}

/** Every pair that changes with the sidebar choice. `label` names the sidebar in the report. */
function sidebarPairs(tokens: ThemeTokens, label: string): ContrastPair[] {
  const { glow, highlight } = tokens.preset;
  const fills: Surface[] = [
    [label, tokens.sidebar],
    [`a hovered item of ${label}`, tokens.sidebarHover],
  ];
  return [
    ...fills.flatMap(([name, fill]) => [
      pair(`white text on ${name}`, textColors.onDark, fill, AA_TEXT),
      pair(`muted text on ${name}`, tokens.sidebarMuted, fill, AA_TEXT),
      pair(`rail icons and labels on ${name}`, RAIL_ICON, fill, AA_TEXT),
    ]),
    pair(`the highlight on ${label}`, highlight, tokens.sidebar, AA_NON_TEXT),
    pair(`the glow circle against ${label}`, glow, tokens.sidebar, AA_NON_TEXT),
    pair(`count text in the colour of ${label}, on the glow`, tokens.sidebar, glow, AA_TEXT),
  ];
}

function sidebarLabel(choice: SidebarChoice): string {
  return choice === MATCH_THEME ? 'the sidebar' : `the "${choice}" sidebar`;
}

/**
 * Every contrast pair a palette must pass, for the sidebar choices the app offers. By default
 * only "Match theme" (the palette's own sidebar); pass `sidebarChoices` when people may pick any
 * swatch. The colours must already be valid hex values.
 */
export function palettePairs(
  palette: PaletteTokens,
  sidebars: readonly SidebarChoice[] = [MATCH_THEME]
): ContrastPair[] {
  const choices: readonly SidebarChoice[] = sidebars.length > 0 ? sidebars : [MATCH_THEME];
  let perSidebar: ThemeTokens[];
  try {
    perSidebar = choices.map((sidebar) =>
      resolveTokens({ ...DEFAULT_THEME_SETTINGS, palette, sidebar })
    );
  } catch {
    // No border colour reaches 3:1 because the main text itself does not read on a surface: the
    // text pairs say which one.
    return textPairs(palette, raisedSurface(palette));
  }
  const [first] = perSidebar;
  return [
    ...(first ? surfacePairs(first) : []),
    ...perSidebar.flatMap((tokens, index) =>
      sidebarPairs(tokens, sidebarLabel(choices[index] ?? MATCH_THEME))
    ),
  ];
}

/** Checks a palette without throwing, for a settings screen that shows what to change. */
export function checkPalette(
  palette: PaletteTokens,
  sidebars: readonly SidebarChoice[] = [MATCH_THEME]
): PaletteReport {
  // The palette may come from a settings screen or a file: nothing about it is taken on trust.
  const colours: Partial<Record<keyof PaletteTokens, unknown>> = palette ?? {};
  const invalid = paletteKeys.filter((key) => {
    const value = colours[key];
    return typeof value !== 'string' || !HEX_COLOUR.test(value);
  });
  if (invalid.length > 0) {
    return { ok: false, invalid, failures: [] };
  }
  const failures = palettePairs(palette, sidebars)
    .map((entry) => ({ ...entry, ratio: contrastRatio(entry.foreground, entry.background) }))
    .filter((entry) => entry.ratio < entry.min);
  return { ok: failures.length === 0, invalid: [], failures };
}

/** One failure as a line of text: what, the ratio it has, the ratio it needs, the two colours. */
export function describeFailure(failure: ContrastFailure): string {
  // Rounded down, so a pair just under its ratio never reads as if it had passed.
  const ratio = (Math.floor(failure.ratio * 100) / 100).toFixed(2);
  return `${failure.name}: ${ratio}:1, needs ${failure.min}:1 (${failure.foreground} on ${failure.background})`;
}

/** Thrown for a palette that cannot be used. `report` holds the same facts as the message. */
export class RawaqPaletteError extends Error {
  readonly report: PaletteReport;

  constructor(report: PaletteReport) {
    const lines =
      report.invalid.length > 0
        ? [
            'Rawaq UI: the palette needs a six digit hex colour (like #1F6B4F) for:',
            ...report.invalid.map((key) => `- ${key}`),
          ]
        : [
            `Rawaq UI: the palette fails ${report.failures.length} contrast check(s) of WCAG 2.2 AA. Change these colours:`,
            ...report.failures.map((failure) => `- ${describeFailure(failure)}`),
          ];
    super(lines.join('\n'));
    this.name = 'RawaqPaletteError';
    this.report = report;
  }
}

/** Throws a `RawaqPaletteError` that names every problem; returns quietly for a good palette. */
export function assertPalette(
  palette: PaletteTokens,
  sidebars: readonly SidebarChoice[] = [MATCH_THEME]
): void {
  const report = checkPalette(palette, sidebars);
  if (!report.ok) {
    throw new RawaqPaletteError(report);
  }
}
