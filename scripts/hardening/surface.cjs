// The public surface of a built Rawaq UI package, and its sizes.
//   node surface.cjs <dist dir> <out.json>          writes the surface
//   node surface.cjs --compare <a.json> <b.json>    fails when B lost anything A had
// Surface: every export of the two entries, every member of every exported interface, every
// --app-* variable of tokens.css, every test id in the built JavaScript.
const { existsSync, readdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { gzipSync } = require('node:zlib');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  );
}

function typesFile(from, spec) {
  const base = join(dirname(from), spec);
  return [`${base}.d.ts`, join(base, 'index.d.ts')].find((file) => existsSync(file));
}

function exportsOf(file, seen = new Set()) {
  if (!file || seen.has(file)) {
    return new Set();
  }
  seen.add(file);
  const text = readFileSync(file, 'utf8');
  const names = new Set();
  for (const [, spec] of text.matchAll(/export\s+\*\s+from\s+['"](.+?)['"]/g)) {
    for (const name of exportsOf(typesFile(file, spec), seen)) {
      names.add(name);
    }
  }
  for (const [, list] of text.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const part of list.split(',')) {
      const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop();
      if (name) {
        names.add(name);
      }
    }
  }
  const declared =
    /export\s+(?:declare\s+)?(?:abstract\s+)?(?:function|const|let|class|interface|type|enum)\s+([A-Za-z0-9_$]+)/g;
  for (const [, name] of text.matchAll(declared)) {
    names.add(name);
  }
  return names;
}

function surfaceOf(dist) {
  const files = walk(dist);
  const members = new Set();
  for (const file of files.filter((name) => name.endsWith('.d.ts'))) {
    const text = readFileSync(file, 'utf8');
    for (const [, name, body] of text.matchAll(
      /export\s+(?:declare\s+)?interface\s+([A-Za-z0-9_$]+)[^{]*\{([\s\S]*?)\n\}/g
    )) {
      for (const [, member] of body.matchAll(
        /^\s{4}(?:readonly\s+)?['"]?([A-Za-z0-9_$-]+)['"]?\??\s*[:(]/gm
      )) {
        members.add(`${name}.${member}`);
      }
    }
  }
  const css = readFileSync(join(dist, 'tokens.css'), 'utf8');
  const testIds = new Set();
  for (const file of files.filter((name) => name.endsWith('.js'))) {
    for (const [, id] of readFileSync(file, 'utf8').matchAll(
      /["']?data-testid["']?\s*:\s*(["'`][^"'`]*["'`])/g
    )) {
      testIds.add(id);
    }
  }
  const gzip = (list) => list.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0);
  const raw = (list) => list.reduce((sum, file) => sum + readFileSync(file).length, 0);
  const js = files.filter((name) => name.endsWith('.js'));
  const one = (name) => [join(dist, name)].filter((file) => existsSync(file));
  return {
    exports: [...exportsOf(join(dist, 'index.d.ts'))].sort(),
    tokenExports: [...exportsOf(join(dist, 'tokens', 'index.d.ts'))].sort(),
    members: [...members].sort(),
    variables: [...new Set(css.match(/--app-[a-z0-9-]+/g))].sort(),
    testIds: [...testIds].sort(),
    sizes: {
      jsFiles: js.length,
      jsBytes: raw(js),
      jsGzip: gzip(js),
      stylesBytes: raw(one('styles.css')),
      stylesGzip: gzip(one('styles.css')),
      tokensCssGzip: gzip(one('tokens.css')),
    },
  };
}

if (process.argv[2] === '--compare') {
  const a = JSON.parse(readFileSync(resolve(process.argv[3]), 'utf8'));
  const b = JSON.parse(readFileSync(resolve(process.argv[4]), 'utf8'));
  let lost = 0;
  for (const key of ['exports', 'tokenExports', 'members', 'variables', 'testIds']) {
    const now = new Set(b[key]);
    const before = new Set(a[key]);
    const removed = a[key].filter((name) => !now.has(name));
    const added = b[key].filter((name) => !before.has(name));
    lost += removed.length;
    console.log(`${key}: ${a[key].length} before, ${b[key].length} after`);
    console.log(`  removed (${removed.length}): ${removed.join(', ') || 'none'}`);
    console.log(`  added (${added.length}): ${added.join(', ') || 'none'}`);
  }
  console.log(`sizes before: ${JSON.stringify(a.sizes)}`);
  console.log(`sizes after:  ${JSON.stringify(b.sizes)}`);
  process.exit(lost > 0 ? 1 : 0);
} else {
  const surface = surfaceOf(resolve(process.argv[2]));
  writeFileSync(resolve(process.argv[3]), `${JSON.stringify(surface, null, 2)}\n`);
  console.log(
    `surface: ${surface.exports.length} exports, ${surface.tokenExports.length} token exports, ` +
      `${surface.members.length} members, ${surface.variables.length} variables, ` +
      `${surface.testIds.length} test ids; sizes ${JSON.stringify(surface.sizes)}`
  );
}
