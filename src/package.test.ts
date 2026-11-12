// Until the owner chooses a licence, the package is private and says UNLICENSED, and it is never
// published to the public npm registry: a release is one file on the GitHub Release. This test
// fails when one of those guards is taken out of package.json.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Manifest {
  private?: unknown;
  license?: unknown;
  files?: unknown;
  publishConfig?: unknown;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const manifest = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8')
) as Manifest;

describe('package.json', () => {
  it('stays private, so it cannot be published to a registry by mistake', () => {
    expect(manifest.private).toBe(true);
  });

  it('says UNLICENSED until the owner chooses a licence', () => {
    expect(manifest.license).toBe('UNLICENSED');
  });

  it('has no publish script and no publish settings', () => {
    const scripts = Object.entries(manifest.scripts ?? {});
    expect(scripts.filter(([name]) => /publish/i.test(name))).toEqual([]);
    expect(
      scripts.filter(([, command]) => /\b(?:npm|yarn)\s+(?:npm\s+)?publish\b/.test(command))
    ).toEqual([]);
    expect(manifest.publishConfig).toBeUndefined();
  });

  it('ships the built files only', () => {
    expect(manifest.files).toEqual(['dist']);
  });

  it('brings no dependency of its own: the app gives React, Mantine and the icons', () => {
    expect(manifest.dependencies).toBeUndefined();
    expect(Object.keys(manifest.peerDependencies ?? {}).sort()).toEqual([
      '@mantine/core',
      '@mantine/hooks',
      '@tabler/icons-react',
      'react',
      'react-dom',
    ]);
  });
});
