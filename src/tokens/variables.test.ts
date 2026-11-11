import { MAX_STAGGER, motion } from './motion';
import { resolveTokens } from './resolve';
import { DEFAULT_THEME_SETTINGS } from './settings';
import { fontFor } from './typography';
import { appVariables, fontVariables, staticVariables } from './variables';

// The names apps already use in their own CSS. Removing or renaming one is a breaking change.
const NAMES_SINCE_V1 = [
  '--app-font-display',
  '--app-surface',
  '--app-raised',
  '--app-hairline',
  '--app-control-border',
  '--app-accent-text',
  '--app-highlight',
  '--app-highlight-text',
  '--app-focus-inner',
  '--app-sidebar',
  '--app-sidebar-text',
  '--app-sidebar-hover',
  '--app-sidebar-muted',
  '--app-sidebar-line',
  '--app-accent',
  '--app-haze-from',
  '--app-haze-to',
  '--app-glow',
  '--app-glow-text',
  '--app-row-hover',
  '--app-row-selected',
  '--app-rail-width',
  '--app-rail-panel',
  '--app-rail-inset',
  '--app-frame-radius',
  '--app-frame-pad-work',
  '--app-frame-pad-overview',
  '--app-frame-margin',
  '--app-bento-gap',
  '--app-control-height-md',
  '--app-shadow-sm',
  '--app-shadow-md',
  '--app-shadow-lg',
  '--app-scrim',
  '--app-kpi-green-bg',
  '--app-kpi-green-text',
  '--app-kpi-amber-bg',
  '--app-kpi-amber-text',
  '--app-kpi-slate-bg',
  '--app-kpi-slate-text',
  '--app-kpi-clay-bg',
  '--app-kpi-clay-text',
];

describe('appVariables', () => {
  const variables = appVariables(resolveTokens(DEFAULT_THEME_SETTINGS), fontFor());

  it.each(NAMES_SINCE_V1)('still gives %s', (name) => {
    expect(variables[name]).toBeTruthy();
  });

  it('uses the --app- prefix for every name and leaves no value empty', () => {
    for (const [name, value] of Object.entries(variables)) {
      expect(name).toMatch(/^--app-[a-z0-9-]+$/);
      expect(value).not.toBe('');
      expect(value).not.toContain('undefined');
    }
  });

  it('gives the motion timings, the rounding and the spacing of the density', () => {
    expect(variables['--app-motion-rise']).toBe(motion.rise);
    expect(variables['--app-motion-fast']).toBe('0.15s');
    expect(variables['--app-motion-max-stagger']).toBe(String(MAX_STAGGER));
    expect(variables['--app-ease-out']).toBe('cubic-bezier(0.2, 0.7, 0.2, 1)');
    expect(variables['--app-radius-md']).toBe('10px');
    expect(variables['--app-radius-pill']).toBe('999px');
    expect(variables['--app-font-size-md']).toBe('14px');
    expect(variables['--app-spacing-md']).toBe('12px');
  });

  it('changes the look variables with the look, and nothing else', () => {
    const other = appVariables(
      resolveTokens({ preset: 'onyx-black', sidebar: 'plum', density: 'comfortable' }),
      fontFor()
    );
    expect(other['--app-surface']).not.toBe(variables['--app-surface']);
    expect(other['--app-sidebar']).not.toBe(variables['--app-sidebar']);
    expect(other['--app-spacing-md']).toBe('16px');
    for (const name of Object.keys(staticVariables())) {
      expect(other[name]).toBe(variables[name]);
    }
  });
});

describe('fontVariables', () => {
  it('gives a line height only for a script that asks for one', () => {
    expect(fontVariables({ family: 'A, B' })).toEqual({
      '--app-font-body': 'A, B',
      '--app-font-display': 'A, B',
    });
    expect(fontVariables({ family: 'A', lineHeight: 2.2 })['--app-line-height']).toBe('2.2');
  });
});
