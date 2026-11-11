import { labelsFor, rawaqLabels } from './labels';

describe('labelsFor', () => {
  it('gives English when nothing is asked', () => {
    expect(labelsFor()).toEqual(rawaqLabels.en);
    expect(labelsFor('en-GB').showLabels).toBe('Show labels');
  });

  it('gives Arabic for an Arabic locale, whatever its region', () => {
    expect(labelsFor('ar')).toEqual(rawaqLabels.ar);
    expect(labelsFor('ar-SA').loading).toBe('جارٍ التحميل');
  });

  it('starts from English for a language with no built-in words', () => {
    expect(labelsFor('ur').skipToContent).toBe('Skip to main content');
    expect(labelsFor('constructor').loading).toBe('Loading');
  });

  it('puts the words of the app on top and keeps the rest', () => {
    const words = labelsFor('ur', { loading: 'لوڈ ہو رہا ہے', showLabels: undefined });
    expect(words.loading).toBe('لوڈ ہو رہا ہے');
    expect(words.showLabels).toBe('Show labels');
    expect(words.mainNavigation).toBe('Main navigation');
  });
});

describe('itemCount', () => {
  it('counts in English', () => {
    const { itemCount } = rawaqLabels.en;
    expect([0, 1, 2, 16].map(itemCount)).toEqual(['0 items', '1 item', '2 items', '16 items']);
  });

  it('counts in Arabic, with every plural form', () => {
    const { itemCount } = rawaqLabels.ar;
    expect([0, 1, 2, 3, 11, 100].map(itemCount)).toEqual([
      'لا عناصر',
      'عنصر واحد',
      'عنصران',
      '3 عناصر',
      '11 عنصرًا',
      '100 عنصر',
    ]);
  });
});
