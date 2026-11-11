// WCAG 2.2 contrast maths, used by contrast.test.ts to keep every design direction at AA.

type Rgba = [number, number, number, number];

function parseColor(color: string): Rgba {
  const value = color.trim().toLowerCase();
  const hex = /^#([0-9a-f]{6})$/.exec(value);
  if (hex?.[1]) {
    const n = Number.parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(
    value
  );
  if (rgb) {
    return [
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
      rgb[4] === undefined ? 1 : Number(rgb[4]),
    ];
  }
  throw new Error(`Unsupported colour: ${color}`);
}

function blend(foreground: Rgba, background: Rgba): Rgba {
  const alpha = foreground[3];
  return [
    foreground[0] * alpha + background[0] * (1 - alpha),
    foreground[1] * alpha + background[1] * (1 - alpha),
    foreground[2] * alpha + background[2] * (1 - alpha),
    1,
  ];
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: string): number {
  const [r, g, b] = parseColor(color);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast of `foreground` drawn on `background` (translucent foregrounds are blended). */
export function contrastRatio(foreground: string, background: string): number {
  const bg = parseColor(background);
  const fg = blend(parseColor(foreground), bg);
  const toHex = (c: Rgba) =>
    `#${c
      .slice(0, 3)
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')}`;
  const l1 = relativeLuminance(toHex(fg));
  const l2 = relativeLuminance(toHex(bg));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Mantine's `autoContrast` rule: dark text on light fills, light text on dark fills. */
export const LUMINANCE_THRESHOLD = 0.3;

export function onFillColor(
  fill: string,
  { black, white }: { black: string; white: string }
): string {
  return relativeLuminance(fill) > LUMINANCE_THRESHOLD ? black : white;
}
