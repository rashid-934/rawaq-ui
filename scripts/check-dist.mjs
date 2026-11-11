// Checks the built package in `dist` before it is packed or released. Run after `yarn build`:
// `yarn check:dist`. It reads files only; it exits with 1 and a list when something is wrong.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const src = join(root, 'src');
const problems = [];
const fail = (message) => problems.push(message);
const read = (file) => readFileSync(file, 'utf8');
const slash = (file) => file.replaceAll('\\', '/');

function filesIn(folder) {
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

if (!existsSync(dist)) {
  console.error('check-dist: there is no dist folder. Run `yarn build` first.');
  process.exit(1);
}

const built = filesIn(dist);
const names = built.map((file) => slash(relative(dist, file)));

// 1. Everything the package says it exports is there.
const manifest = JSON.parse(read(join(root, 'package.json')));
const targets = new Set([manifest.main, manifest.types]);
for (const target of Object.values(manifest.exports)) {
  for (const path of typeof target === 'string' ? [target] : Object.values(target)) {
    targets.add(path);
  }
}
for (const target of targets) {
  if (!existsSync(join(root, target))) {
    fail(`package.json points at ${target}, which does not exist`);
  }
}

// 2. A client component keeps its 'use client' line, or a server-rendering app cannot use it.
const isShipped = (file) =>
  /\.tsx?$/.test(file) &&
  !/\.(?:test|story)\.tsx?$/.test(file) &&
  !/[\\/](?:stories|test-utils)[\\/]/.test(file);
const clientSources = filesIn(src).filter(
  (file) => isShipped(file) && /^\s*['"]use client['"]/.test(read(file))
);
if (clientSources.length === 0) {
  fail("no source file starts with 'use client': the check itself is broken");
}
for (const file of clientSources) {
  const output = join(dist, relative(src, file).replace(/\.tsx?$/, '.js'));
  if (!existsSync(output)) {
    fail(`${slash(relative(root, output))} is missing (a client component)`);
  } else if (!/^\s*['"]use client['"]/.test(read(output))) {
    fail(`${slash(relative(root, output))} lost its 'use client' line`);
  }
}

// 3. No file imports a stylesheet: apps load `rawaq-ui/styles.css` themselves. (An import of
//    `X.module.css.js` is fine: that is the small file with the class names.)
const cssImport = /(?:from|import)\s*['"][^'"]+\.css['"]/;
for (const [index, file] of built.entries()) {
  if (/\.(?:js|d\.ts)$/.test(file) && cssImport.test(read(file))) {
    fail(`${names[index]} imports a .css file`);
  }
}

// 4. The stylesheets are plain CSS: nothing of the source syntax is left in them.
for (const sheet of ['styles.css', 'tokens.css']) {
  const file = join(dist, sheet);
  if (!existsSync(file)) {
    continue;
  }
  const css = read(file);
  for (const [what, pattern] of [
    ['a rem() call', /\brem\(/],
    ['a @mixin', /@mixin\b/],
    ['a $variable', /\$mantine-/],
    ['the word undefined', /\bundefined\b/],
  ]) {
    if (pattern.test(css)) {
      fail(`dist/${sheet} still has ${what}`);
    }
  }
  if (css.trim() === '') {
    fail(`dist/${sheet} is empty`);
  }
}

// 5. Class names are readable and the same in every build: `rq-Rail-item`, never a hash.
const classMap = names.find((name) => name.endsWith('Rail/Rail.module.css.js'));
if (!classMap || !read(join(dist, classMap)).includes('"rq-Rail-rail"')) {
  fail('the class names are not in the `rq-<File>-<class>` form');
}

// 6. Tests, stories and test helpers stay out of the package.
for (const name of names) {
  if (/\.(?:test|story)\./.test(name) || /(?:^|\/)(?:stories|test-utils)\//.test(name)) {
    fail(`dist/${name} is a test or a story and must not ship`);
  }
}

// 7. The tokens run anywhere: no React, no Mantine and no icons at run time.
for (const name of names.filter((file) => file.startsWith('tokens/') && file.endsWith('.js'))) {
  if (/from\s*['"](?:react|@mantine|@tabler)/.test(read(join(dist, name)))) {
    fail(`dist/${name} imports React, Mantine or the icons`);
  }
}

// 8. The token file is real JSON with the seven presets.
try {
  const tokens = JSON.parse(read(join(dist, 'tokens.json')));
  if (Object.keys(tokens.presets ?? {}).length !== 7) {
    fail('dist/tokens.json does not hold seven presets');
  }
} catch {
  fail('dist/tokens.json is missing or is not JSON');
}

if (problems.length > 0) {
  console.error(`check-dist: ${problems.length} problem(s)`);
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}
console.log(
  `check-dist: ${built.length} files, ${clientSources.length} client components, all good`
);
