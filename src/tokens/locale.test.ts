import { directionOf, languageOf, rtlLocales } from './locale';

describe('directionOf', () => {
  it('knows Arabic, Urdu, Persian and Hebrew as right to left', () => {
    expect(rtlLocales).toEqual(['ar', 'ur', 'fa', 'he']);
  });

  it.each(rtlLocales)('%s is right to left', (locale) => {
    expect(directionOf(locale)).toBe('rtl');
  });

  it.each(['en', 'fr', 'tr', 'id', ''])('"%s" is left to right', (locale) => {
    expect(directionOf(locale)).toBe('ltr');
  });

  it.each(['ar-SA', 'ur_PK', 'FA-ir', ' he '])(
    'reads the region and the case of "%s"',
    (locale) => {
      expect(directionOf(locale)).toBe('rtl');
    }
  );

  it('does not take another language that only starts with the same letters', () => {
    // `arn` is Mapudungun, written left to right.
    expect(directionOf('arn')).toBe('ltr');
    expect(directionOf('hello')).toBe('ltr');
  });

  it('lets an app add its own right-to-left locales', () => {
    expect(directionOf('ps')).toBe('ltr');
    expect(directionOf('ps', ['ps'])).toBe('rtl');
    expect(directionOf('ps-AF', ['ps'])).toBe('rtl');
    // An entry with a script covers only that script.
    expect(directionOf('ku-Arab-IQ', ['ku-Arab'])).toBe('rtl');
    expect(directionOf('ku-Latn', ['ku-Arab'])).toBe('ltr');
    expect(directionOf('en', [''])).toBe('ltr');
  });
});

describe('languageOf', () => {
  it('gives the language part in lower case', () => {
    expect(languageOf('ar-SA')).toBe('ar');
    expect(languageOf('ur_PK')).toBe('ur');
    expect(languageOf('EN')).toBe('en');
  });
});
