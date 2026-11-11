import { contrastRatio } from './contrast';
import { BASE_SHADE, firstPassing, mix, shadesFrom } from './palette';

describe('mix', () => {
  it('gives the start colour, the end colour and the halfway point', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });

  it('rejects anything but #rrggbb', () => {
    expect(() => mix('red', '#FFFFFF', 0.5)).toThrow('Expected a #rrggbb colour');
  });
});

describe('shadesFrom', () => {
  const shades = shadesFrom('#1F6B4F', '#FFFFFF', '#000000');

  it('makes ten shades with the base colour at the base shade', () => {
    expect(shades).toHaveLength(10);
    expect(shades[BASE_SHADE]).toBe('#1F6B4F');
  });

  it('goes from light to dark', () => {
    const lightness = shades.map((shade) => contrastRatio(shade, '#000000'));
    expect([...lightness].sort((a, b) => b - a)).toEqual(lightness);
  });
});

describe('firstPassing', () => {
  it('keeps the start colour when it already passes', () => {
    expect(firstPassing('#5A6158', '#000000', ['#FFFFFF'], 3)).toBe('#5A6158');
  });

  it('darkens just enough to reach the ratio on every background', () => {
    const result = firstPassing('#E5DDCB', '#1F2A24', ['#F6F3EC', '#FFFDF8'], 3);
    expect(contrastRatio(result, '#F6F3EC')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(result, '#FFFDF8')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(result, '#F6F3EC')).toBeLessThan(3.5);
  });

  it('fails loudly when no mix can pass', () => {
    expect(() => firstPassing('#FFFFFF', '#FEFEFE', ['#FFFFFF'], 3)).toThrow('No mix');
  });
});
