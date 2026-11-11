import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  core: {
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
    enableCrashReports: false,
  },
  stories: ['../src/**/*.story.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    // Its own small Vite config: the package's config builds a library, not a site.
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
};

export default config;
