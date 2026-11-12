// Motion timings (docs/DESIGN_THEME.md section 7). The stylesheet reads them as `--app-motion-*`
// and `--app-ease-*` variables; with reduced motion every animation is off, whatever these say.
// This file is the one place for a duration or an easing: `src/motion-checks.test.ts` fails on a
// timing written by hand anywhere else.

export const motion = {
  /** Hover, focus and colour changes. */
  fast: '0.15s',
  /** The rail's glow slide, "Show labels", the page fade, drawers. */
  base: '0.2s',
  /** A tooltip fades in. */
  tooltip: '0.12s',
  /** A small thing that pops in: a tip, a hint. */
  pop: '0.3s',
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
  /** The opening is taken out of the page after this long, even if no event comes. */
  introSafety: '1.5s',
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
  /** The everyday curve: hover, focus, the page fade, panels. */
  ease: 'ease',
  /** Things that arrive: a fast start and a soft landing. */
  easeOut: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  /** The opening sweep: slow, fast, slow. */
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** A slow breath in and out: the skeleton's pulse. */
  easeBreath: 'ease-in-out',
} as const;

/** Items after this position start together: a long list never waits for its last card. */
export const MAX_STAGGER = 7;

/** The tokens that are a length of time (not an easing, not a distance). */
export type MotionTime = Exclude<keyof typeof motion, `ease${string}` | 'riseDistance'>;

/**
 * A motion time in milliseconds, for a component prop or a timer that wants a number:
 * `motionMs('tooltip')` is 120.
 */
export function motionMs(name: MotionTime): number {
  const value: string = motion[name];
  const amount = Number.parseFloat(value);
  return Math.round(value.endsWith('ms') ? amount : amount * 1000);
}
