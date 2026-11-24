import '@mantine/core/styles.css';
// The package stylesheet, by the name an app imports it. Here it is the app-wide rules from the
// source (an alias in .storybook/vite.config.ts); the styles of the components follow from their
// own files, so the order is the same as in the built `styles.css`.
import 'rawaq-ui/styles.css';

// The fonts an app would load itself. The Urdu face is here for the Urdu stories only.
import '@fontsource-variable/plus-jakarta-sans/index.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import '@fontsource/noto-nastaliq-urdu/arabic-400.css';
import '@fontsource/noto-nastaliq-urdu/arabic-700.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import {
  createRawaqTheme,
  DEFAULT_THEME_SETTINGS,
  densityKeys,
  directionOf,
  parseThemeSettings,
  presetKeys,
  sidebarChoices,
} from '../src/index';
import { StoryLocale, storyFonts } from '../src/stories/sample';

/** Every story gets what an app gives the components: the theme, the direction and the locale. */
const withTheme: Decorator = (renderStory, context) => {
  const locale = String(context.globals.locale ?? 'en');
  const dir = directionOf(locale);
  // Like an app's root layout: the haze and the frame edge read the direction from <html>.
  document.documentElement.dir = dir;
  document.documentElement.lang = locale;
  const { theme, cssVariablesResolver } = createRawaqTheme({
    ...parseThemeSettings({
      preset: context.globals.preset,
      sidebar: context.globals.sidebar,
      density: context.globals.density,
    }),
    locale,
    fonts: storyFonts,
  });
  return (
    <DirectionProvider key={dir} initialDirection={dir} detectDirection={false}>
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme="light"
      >
        <StoryLocale value={locale}>
          <div dir={dir}>{renderStory()}</div>
        </StoryLocale>
      </MantineProvider>
    </DirectionProvider>
  );
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: { order: ['Screens', 'Components', 'Tokens'] },
    },
    backgrounds: { disable: true },
    // Screen sizes (Storybook's own viewport toolbar): the three phones the layout is checked
    // at, a tablet and the desktop. With none chosen the story fills the window.
    viewport: {
      options: {
        phone360: {
          name: 'Phone 360 x 800',
          styles: { width: '360px', height: '800px' },
          type: 'mobile',
        },
        phone390: {
          name: 'Phone 390 x 844',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        phone430: {
          name: 'Phone 430 x 932',
          styles: { width: '430px', height: '932px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet 1024 x 768',
          styles: { width: '1024px', height: '768px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop 1280 x 720',
          styles: { width: '1280px', height: '720px' },
          type: 'desktop',
        },
      },
    },
  },
  globalTypes: {
    locale: {
      name: 'Language',
      description: 'English, Arabic or Urdu (the last two right-to-left)',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'ar', title: 'العربية' },
          { value: 'ur', title: 'اردو' },
        ],
      },
    },
    preset: {
      name: 'Preset',
      description: 'Colour preset',
      toolbar: { icon: 'paintbrush', items: [...presetKeys] },
    },
    sidebar: {
      name: 'Sidebar colour',
      description: 'Match theme or a swatch',
      toolbar: { icon: 'sidebar', items: [...sidebarChoices] },
    },
    density: {
      name: 'Density',
      description: 'Comfortable or compact',
      toolbar: { icon: 'component', items: [...densityKeys] },
    },
  },
  initialGlobals: { locale: 'en', ...DEFAULT_THEME_SETTINGS },
  decorators: [withTheme],
};

export default preview;
