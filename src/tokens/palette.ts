import type { MantineColorsTuple } from '@mantine/core';
import { contrastRatio } from './contrast';

// Turns the few colours of a preset into the scales Mantine needs, so the presets stay as short
// as the design table (docs/DESIGN_THEME.md section 2).

/** Mantine shade that holds the preset colour itself; lighter tints sit below, darker above. */
export const BASE_SHADE = 6;

const TINTS = [0.92, 0.8, 0.64, 0.46, 0.28, 0.12];
/** How much black goes into shades 7 to 9. Shade 7 is the hover fill of filled buttons. */
export const DARK_STEPS = [0.16, 0.32, 0.48] as const;
/** For light fills with dark text (the highlight): a gentler hover keeps the text readable. */
export const GENTLE_DARK_STEPS = [0.06, 0.12, 0.2] as const;

function toRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) {
    throw new Error(`Expected a #rrggbb colour, got: ${hex}`);
  }
  const n = Number.parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** `amount` of `to` mixed into `from` (0 gives `from`, 1 gives `to`). */
export function mix(from: string, to: string, amount: number): string {
  const a = toRgb(from);
  const b = toRgb(to);
  return toHex([0, 1, 2].map((i) => a[i]! + (b[i]! - a[i]!) * amount) as [number, number, number]);
}

/** A translucent version of a colour, for shadows and the tour backdrop. */
export function alpha(color: string, opacity: number): string {
  const [r, g, b] = toRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/** Ten shades for Mantine with `base` at BASE_SHADE. */
export function shadesFrom(
  base: string,
  white: string,
  black: string,
  darkSteps: readonly number[] = DARK_STEPS
): MantineColorsTuple {
  const tints = TINTS.map((amount) => mix(base, white, amount));
  const shades = darkSteps.map((amount) => mix(base, black, amount));
  return [...tints, base, ...shades] as unknown as MantineColorsTuple;
}

/**
 * The lightest mix of `from` towards `to` that reaches `minRatio` on every background, for
 * example an input border that keeps the preset's warmth but still reaches 3:1 (WCAG 1.4.11).
 */
export function firstPassing(
  from: string,
  to: string,
  backgrounds: readonly string[],
  minRatio: number
): string {
  for (let step = 0; step <= 50; step += 1) {
    const candidate = mix(from, to, step / 50);
    if (backgrounds.every((bg) => contrastRatio(candidate, bg) >= minRatio)) {
      return candidate;
    }
  }
  throw new Error(`No mix of ${from} and ${to} reaches ${minRatio}:1`);
}
