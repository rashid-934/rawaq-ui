// Plus Jakarta Sans for Latin text, IBM Plex Sans Arabic for Arabic (docs/DESIGN_THEME.md
// section 1). The browser takes each letter from the first face that has it. Both faces are
// self-hosted in src/app/fonts.ts.
export const fonts = {
  body: "'Plus Jakarta Sans Variable', 'IBM Plex Sans Arabic', system-ui, sans-serif",
  mono: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
} as const;
