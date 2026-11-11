import { fontFor, fonts } from './typography';

const DEFAULT_STACK = "'Plus Jakarta Sans Variable', 'IBM Plex Sans Arabic', system-ui, sans-serif";
const urdu = { ur: { family: "'Noto Nastaliq Urdu'", lineHeight: 2.2 } };

describe('fontFor', () => {
  it('keeps the stack English and Arabic apps had before fonts were a token', () => {
    expect(fonts.body).toBe(DEFAULT_STACK);
    expect(fontFor()).toEqual({ family: DEFAULT_STACK });
    expect(fontFor('en')).toEqual({ family: DEFAULT_STACK });
    expect(fontFor('ar')).toEqual({ family: DEFAULT_STACK });
    expect(fontFor('ar-SA')).toEqual({ family: DEFAULT_STACK });
  });

  it('puts the font an app adds for its locale right after the Latin face', () => {
    expect(fontFor('ur', urdu)).toEqual({
      family:
        "'Plus Jakarta Sans Variable', 'Noto Nastaliq Urdu', 'IBM Plex Sans Arabic', system-ui, sans-serif",
      lineHeight: 2.2,
    });
    expect(fontFor('ur-PK', urdu)).toEqual(fontFor('ur', urdu));
  });

  it('keeps a locale line height to that locale', () => {
    expect(fontFor('en', urdu).lineHeight).toBeUndefined();
    expect(fontFor('en', urdu).family).toContain("'Noto Nastaliq Urdu'");
  });

  it('prefers the exact locale over its language', () => {
    const map = { pt: { family: 'Lusitana' }, 'pt-BR': { family: 'Brasilia' } };
    expect(fontFor('pt-BR', map).family).toMatch(/^'Plus Jakarta Sans Variable', Brasilia, /);
    expect(fontFor('pt-PT', map).family).toMatch(/^'Plus Jakarta Sans Variable', Lusitana, /);
  });

  it('lets an app replace the built-in faces', () => {
    const map = { default: { family: 'Inter', lineHeight: 1.7 }, ar: { family: 'Cairo' } };
    expect(fontFor('ar', map)).toEqual({
      family: 'Inter, Cairo, system-ui, sans-serif',
      lineHeight: 1.7,
    });
  });

  it('never repeats a face', () => {
    expect(fontFor('fa', { fa: { family: "'IBM Plex Sans Arabic'" } }).family).toBe(DEFAULT_STACK);
  });

  it('treats a locale it has no font for as the default, whatever it is called', () => {
    expect(fontFor('constructor')).toEqual({ family: DEFAULT_STACK });
    expect(fontFor('toString-x')).toEqual({ family: DEFAULT_STACK });
  });
});
