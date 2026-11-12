import { tokensCss, tokensJson } from './files';
import { MAX_STAGGER, motion, motionMs, type MotionTime } from './motion';
import { motionVariables, staticVariables } from './variables';

const names = Object.keys(motion) as (keyof typeof motion)[];
const easings = names.filter((name) => name.startsWith('ease'));
const times = names.filter(
  (name): name is MotionTime => !name.startsWith('ease') && name !== 'riseDistance'
);

// The motion variables apps already use in their own CSS. Removing or renaming one is a breaking
// change, like every other `--app-*` name.
const NAMES_SINCE_V1 = [
  '--app-motion-fast',
  '--app-motion-base',
  '--app-motion-rise',
  '--app-motion-rise-stagger',
  '--app-motion-rise-distance',
  '--app-motion-roll',
  '--app-motion-roll-stagger',
  '--app-motion-intro',
  '--app-motion-intro-mark',
  '--app-motion-drawer',
  '--app-motion-grow',
  '--app-motion-grow-stagger',
  '--app-motion-skeleton-delay',
  '--app-motion-skeleton-pulse',
  '--app-motion-max-stagger',
  '--app-ease-out',
  '--app-ease-in-out',
];

describe('motion tokens', () => {
  it.each(times)('%s is a time a stylesheet can read', (name) => {
    expect(motion[name]).toMatch(/^(?:0|[1-9]\d*)(?:\.\d+)?(?:ms|s)$/);
  });

  it.each(easings)('%s is an easing a stylesheet can read', (name) => {
    expect(motion[name]).toMatch(
      /^(?:ease|ease-in|ease-out|ease-in-out|linear|cubic-bezier\((?:-?\d*\.?\d+,\s*){3}-?\d*\.?\d+\))$/
    );
  });

  it('keeps the timings of docs/DESIGN_THEME.md section 7', () => {
    expect(motion.fast).toBe('0.15s');
    expect(motion.base).toBe('0.2s');
    expect(motion.tooltip).toBe('0.12s');
    expect(motion.rise).toBe('0.35s');
    expect(motion.riseStagger).toBe('40ms');
    expect(motion.riseDistance).toBe('8px');
    expect(motion.roll).toBe('0.8s');
    expect(motion.grow).toBe('0.6s');
    expect(motion.skeletonDelay).toBe('0.15s');
    // "At most 8 steps": positions 0 to 7.
    expect(MAX_STAGGER).toBe(7);
  });

  it('ends the opening in under one second, and removes it a little later whatever happens', () => {
    expect(motionMs('intro')).toBeLessThan(1000);
    expect(motionMs('introMark')).toBeLessThan(motionMs('intro'));
    expect(motionMs('introSafety')).toBeGreaterThan(motionMs('intro'));
  });
});

describe('motionMs', () => {
  it('reads seconds and milliseconds as whole milliseconds', () => {
    expect(motionMs('tooltip')).toBe(120);
    expect(motionMs('fast')).toBe(150);
    expect(motionMs('base')).toBe(200);
    expect(motionMs('riseStagger')).toBe(40);
    expect(motionMs('intro')).toBe(900);
    expect(motionMs('introSafety')).toBe(1500);
    expect(motionMs('skeletonPulse')).toBe(1100);
  });

  it.each(times)('gives a whole positive number for %s', (name) => {
    const value = motionMs(name);
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThan(0);
  });
});

describe('motionVariables', () => {
  const variables = motionVariables();

  it('gives every token one CSS variable with the same value', () => {
    expect(Object.keys(variables)).toHaveLength(names.length);
    expect(variables['--app-motion-rise-stagger']).toBe(motion.riseStagger);
    expect(variables['--app-motion-skeleton-pulse']).toBe(motion.skeletonPulse);
    expect(variables['--app-motion-tooltip']).toBe(motion.tooltip);
    expect(variables['--app-motion-pop']).toBe(motion.pop);
    expect(variables['--app-ease']).toBe(motion.ease);
    expect(variables['--app-ease-out']).toBe(motion.easeOut);
    expect(variables['--app-ease-in-out']).toBe(motion.easeInOut);
    expect(variables['--app-ease-breath']).toBe(motion.easeBreath);
  });

  it('names a time --app-motion-* and an easing --app-ease*', () => {
    for (const name of Object.keys(variables)) {
      expect(name).toMatch(/^--app-(?:motion-[a-z]+(?:-[a-z]+)*|ease(?:-[a-z]+)*)$/);
    }
  });

  it.each(NAMES_SINCE_V1)('still gives %s to the theme', (name) => {
    expect(staticVariables()[name]).toBeTruthy();
  });

  it('reaches the theme, tokens.css and tokens.json complete', () => {
    const fromTheme = staticVariables();
    const css = tokensCss();
    for (const [name, value] of Object.entries(variables)) {
      expect(fromTheme[name]).toBe(value);
      expect(css).toContain(`  ${name}: ${value};`);
    }
    const data = JSON.parse(tokensJson()) as { motion: Record<string, unknown> };
    expect(data.motion).toEqual({ ...motion, maxStagger: MAX_STAGGER });
  });
});
