// Searches what gets built for things that must never be in it: secret values of the environment,
// key-like strings (Supabase, GitHub, cloud keys, private keys), email addresses, a client's name,
// folder paths of a computer, private network addresses, and source maps (scripts/lib/
// private-patterns.mjs holds the patterns; the browser tests run them on every served page too).
//
//   yarn scan:built                    every folder below that exists (at least one must)
//   yarn scan:built dist               one folder
//
// Folders: `dist` (the package), `storybook-static` (what a public Storybook would serve) and
// `examples/starter/.next` (the starter's build). In `.next` the files a browser can get are
// `static` and the prerendered pages; the server's own files are searched for secrets only.
// It prints the file, what was found and how often; never the text that was found.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { privateFindings } from './lib/private-patterns.mjs';

const repo = join(import.meta.dirname, '..');
const FOLDERS = ['dist', 'storybook-static', 'examples/starter/.next'];
const TEXT = /\.(?:js|mjs|cjs|css|html|json|map|txt|rsc|body|meta|md|svg|d\.ts)$/;
// Bigger files are not code or pages (pictures, fonts); they are skipped and listed.
const MAX_BYTES = 8 * 1024 * 1024;

/** Values of the environment whose names say they are secret: none may be in a built file. */
const SECRET_NAME = /TOKEN|SECRET|PASSWORD|PRIVATE|CREDENTIAL|AUTH|_KEY$|^KEY_|API_KEY/i;
const envValues = Object.entries(process.env).filter(
  ([name, value]) => SECRET_NAME.test(name) && typeof value === 'string' && value.length >= 12
);

function* walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'cache') {
        yield* walk(path);
      }
    } else {
      yield path;
    }
  }
}

/** True for a file of `.next` that a browser can get. */
const servedByNext = (file) =>
  file.includes('/static/') || /\/server\/(?:app|pages)\/.*\.(?:html|rsc|body)$/.test(file);

const asked = process.argv.slice(2);
const folders = (asked.length > 0 ? asked : FOLDERS).filter((folder) =>
  existsSync(join(repo, folder))
);
if (folders.length === 0) {
  console.error('Nothing to scan: build the package, the Storybook or the starter first.');
  process.exit(1);
}

const findings = [];
const skipped = [];
let scanned = 0;
for (const folder of folders) {
  const isNext = folder.endsWith('.next');
  let inFolder = 0;
  for (const path of walk(join(repo, folder))) {
    const file = relative(repo, path).replaceAll('\\', '/');
    const isPublic = !isNext || servedByNext(file);
    // A source map hands the original code to whoever opens the page or the package.
    if (isPublic && file.endsWith('.map')) {
      findings.push([file, 'a source map', 1]);
    }
    if (!TEXT.test(file)) {
      continue;
    }
    if (statSync(path).size > MAX_BYTES) {
      skipped.push(file);
      continue;
    }
    const text = readFileSync(path, 'utf8');
    scanned += 1;
    inFolder += 1;
    for (const [what, count] of privateFindings(text, isPublic)) {
      findings.push([file, what, count]);
    }
    for (const [name, value] of envValues) {
      if (text.includes(value)) {
        findings.push([file, `the value of the environment variable ${name}`, 1]);
      }
    }
  }
  if (inFolder === 0) {
    findings.push([folder, 'no file to scan (an empty or broken build)', 1]);
  }
}

console.log(`Scanned ${scanned} files in ${folders.join(', ')}.`);
for (const file of skipped) {
  console.log(`  skipped (over 8 MB): ${file}`);
}
if (findings.length > 0) {
  for (const [file, what, count] of findings) {
    console.log(`  ${file}: ${what} (${count})`);
  }
  console.error(`${findings.length} finding(s). Nothing secret or private may be in a build.`);
  process.exit(1);
}
console.log('No secret, key, email address, client name, folder path or source map found.');
