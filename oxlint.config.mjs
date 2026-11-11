import { defineConfig } from 'oxlint';
import { oxlint } from 'oxc-config-mantine';

// The package works in any React and Mantine app: no framework and no translation library.
const frameworkFree = {
  paths: [
    { name: 'next-intl', message: 'Rawaq UI takes every word as a prop (labels).' },
    { name: 'next', message: 'Rawaq UI does not depend on Next.js.' },
  ],
  patterns: [
    { group: ['next/*', 'next-intl/*'], message: 'Rawaq UI does not depend on Next.js.' },
  ],
};

export default defineConfig({
  ...oxlint,
  rules: {
    ...oxlint.rules,
    'no-restricted-imports': ['error', frameworkFree],
  },
  overrides: [
    ...oxlint.overrides,
    {
      // Every word a person reads comes in as a prop, so any language works.
      files: ['src/**/*.tsx'],
      rules: {
        'react/jsx-no-literals': [
          'error',
          { noStrings: true, ignoreProps: true, allowedStrings: [' ', ': ', '·', '/', '–'] },
        ],
      },
    },
    {
      files: ['src/**/*.test.tsx', 'src/**/*.story.tsx', 'src/test-utils/**'],
      rules: { 'react/jsx-no-literals': 'off' },
    },
  ],
  ignorePatterns: ['**/*.{mjs,cjs,js,d.ts,d.mts}', 'dist', 'storybook-static', 'examples'],
});
