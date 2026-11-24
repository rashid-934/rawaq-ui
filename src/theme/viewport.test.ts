import { presetKeys, presets } from '../tokens/presets';
import { sidebarSwatches } from '../tokens/sidebar';
import { rawaqViewport, themeColorFor } from './viewport';

describe('rawaqViewport', () => {
  it('asks for the whole screen, a page that makes room for the keyboard, and the rail colour', () => {
    expect(rawaqViewport()).toEqual({
      width: 'device-width',
      initialScale: 1,
      viewportFit: 'cover',
      interactiveWidget: 'resizes-content',
      themeColor: presets['sand-forest'].sidebar,
    });
  });

  it.each(presetKeys)('gives %s its own rail colour', (preset) => {
    expect(rawaqViewport({ preset }).themeColor).toBe(presets[preset].sidebar);
  });

  it('follows a sidebar swatch and an app palette', () => {
    expect(themeColorFor({ preset: 'stone-navy', sidebar: 'plum' })).toBe(sidebarSwatches.plum);
    const palette = { ...presets['pearl-teal'], sidebar: '#102030' };
    expect(themeColorFor({ palette })).toBe('#102030');
  });
});
