import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Storybook's Vite setup. PostCSS comes from postcss.config.cjs, as in the package build.
export default defineConfig({
  resolve: {
    alias: {
      // The stories load the stylesheet by its package name, from the source.
      'rawaq-ui/styles.css': fileURLToPath(new URL('../src/styles/global.css', import.meta.url)),
    },
  },
  css: {
    modules: {
      // The same class names as the package build (vite.config.ts): `rq-Rail-item`.
      generateScopedName: (local, file) =>
        `rq-${basename(file.split('?')[0] ?? file, '.module.css')}-${local}`,
    },
  },
});
