import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DEFAULT_THEME_SETTINGS,
  paletteVariables,
  type PresetKey,
  presetKeys,
  resolveTokens,
  sidebarVariables,
} from '../index';
import { useWords } from './sample';
import classes from './Presets.module.css';

// All seven presets side by side. Each tile sets the `--app-*` variables of its preset on itself,
// the same way `tokens.css` does for a page.

const meta: Meta = { title: 'Tokens' };
export default meta;

const names: Record<PresetKey, string> = {
  'sand-forest': 'Sand and Forest',
  'stone-navy': 'Stone and Navy',
  'pearl-teal': 'Pearl and Teal',
  'linen-burgundy': 'Linen and Burgundy',
  'graphite-amber': 'Graphite and Amber',
  'slate-gray': 'Slate Gray',
  'onyx-black': 'Onyx Black',
};

function Tile({ preset }: { preset: PresetKey }) {
  const words = useWords();
  const tokens = resolveTokens({ ...DEFAULT_THEME_SETTINGS, preset });
  const look = { ...paletteVariables(tokens), ...sidebarVariables(tokens) } as CSSProperties;
  return (
    <li className={classes.tile} style={look} data-testid={`preset-${preset}`}>
      <span className={classes.rail} aria-hidden>
        <span className={classes.glow} />
        <span className={classes.dot} />
        <span className={classes.dot} />
        <span className={classes.dot} />
      </span>
      <div className={classes.sheet}>
        <p className={classes.name}>{names[preset]}</p>
        <p className={classes.key}>{preset}</p>
        <div className={classes.row}>
          <span className={classes.accent}>{words.sampleButton}</span>
          <span className={classes.highlight}>{words.samplePill}</span>
          <span className={classes.count}>12</span>
        </div>
        <span className={classes.link}>{words.sampleLink}</span>
      </div>
    </li>
  );
}

/** The seven presets at once: haze, rail, glow, card, accent, highlight and count colours. */
export const AllPresets: StoryObj = {
  name: 'The seven presets',
  render: () => (
    <ul className={classes.grid}>
      {presetKeys.map((preset) => (
        <Tile key={preset} preset={preset} />
      ))}
    </ul>
  ),
};
