import { basename } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { tokensCss, tokensJson } from './scripts/tokens-files';

/** Writes `dist/tokens.css` and `dist/tokens.json` from the same source as the TypeScript tokens. */
function tokenFiles(): Plugin {
  return {
    name: 'rawaq-token-files',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'tokens.css', source: tokensCss() });
      this.emitFile({ type: 'asset', fileName: 'tokens.json', source: tokensJson() });
    },
  };
}

// The package build: ES modules, one file per source file (so `'use client'` stays at the top of
// the client files), and all CSS in one `dist/styles.css`. React, Mantine and the icons are not
// bundled: the app that uses the package brings them.
export default defineConfig({
  plugins: [tokenFiles()],
  css: {
    modules: {
      // Readable and the same on every machine and in every build: `rq-Rail-item`.
      generateScopedName: (local, file) =>
        `rq-${basename(file.split('?')[0] ?? file, '.module.css')}-${local}`,
    },
  },
  build: {
    lib: {
      entry: { index: 'src/index.ts', 'tokens/index': 'src/tokens/index.ts' },
      formats: ['es'],
      cssFileName: 'styles',
    },
    // The CSS is exactly what PostCSS writes, the same as in the apps before the package existed.
    minify: false,
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@mantine\//, /^@tabler\//],
      output: { preserveModules: true, preserveModulesRoot: 'src' },
    },
  },
});
