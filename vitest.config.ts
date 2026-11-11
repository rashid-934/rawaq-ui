import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    // Tests look for roles and test ids; class names stay as written in the CSS files.
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
