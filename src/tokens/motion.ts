// Motion timings (docs/DESIGN_THEME.md section 7). The stylesheet reads them as `--app-motion-*`
// and `--app-ease-*` variables; with reduced motion every animation is off, whatever these say.

export const motion = {
  /** Hover, focus and colour changes. */
  fast: '0.15s',
  /** The rail's glow slide, "Show labels", the page fade, drawers. */
  base: '0.2s',
  /** Overview entrance: each card fades and rises. */
  rise: '0.35s',
  /** Delay between one card and the next. */
  riseStagger: '40ms',
  /** How far a card rises. */
  riseDistance: '8px',
  /** Big numbers roll into place. */
  roll: '0.8s',
  /** Delay between one digit and the next. */
  rollStagger: '50ms',
  /** The opening, once per sign-in. */
  intro: '0.9s',
  /** The logo and the name arrive at the start of the opening. */
  introMark: '0.3s',
  /** The rail's drawer on a narrow window, and its backdrop. */
  drawer: '0.24s',
  /** A bar of a chart grows once. */
  grow: '0.6s',
  /** Delay between one bar and the next. */
  growStagger: '60ms',
  /** A loading skeleton waits this long, so a fast page never flashes it. */
  skeletonDelay: '0.15s',
  /** One breath of the skeleton's pulse. */
  skeletonPulse: '1.1s',
  /** Things that arrive: a fast start and a soft landing. */
  easeOut: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  /** The opening sweep: slow, fast, slow. */
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

/** Items after this position start together: a long list never waits for its last card. */
export const MAX_STAGGER = 7;
