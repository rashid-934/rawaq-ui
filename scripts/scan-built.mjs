// Searches what gets built for things that must never be in it: secret values of the environment,
// key-like strings (Supabase, GitHub, cloud keys, private keys), email addresses, a client's name,
// folder paths of a computer, private network addresses, and source maps handed to the browser.
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

const repo = join(import.meta.dirname, '..');
const FOLDERS = ['dist', 'storybook-static', 'examples/starter/.next'];
const TEXT = /\.(?:js|mjs|cjs|css|html|json|map|txt|rsc|body|meta|md|svg|d\.ts)$/;
// Bigger files are not code or pages (pictures, fonts); they are skipped.
const MAX_BYTES = 8 * 1024 * 1024;

/** Everything, everywhere. */
const SECRETS = [
  ['a private key', /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/g],
  ['a Supabase secret or publishable key', /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{16,}/g],
  ['a Supabase service role key', /service_role/g],
  ['a signed token (JWT)', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  ['a GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}/g],
  ['a cloud access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['a Stripe live key', /\b[rs]k_live_[A-Za-z0-9]{16,}/g],
  ['a Supabase project address', /\b[a-z0-9]{20}\.supabase\.co\b/g],
];

/** Only in what a browser can get (and in the package). */
const PUBLIC = [
  // Any address with a dot after the @, except GitHub's noreply addresses and example domains.
  // Sample files have none. A library's own package data (its author or maintainers) that a
  // bundle carries is public and not ours: `isPackageData` lets it through.
  [
    'an email address',
    /\b[A-Za-z0-9._%+-]+@(?!users\.noreply\.github\.com|example\.(?:com|org|net)\b)[A-Za-z0-9-]+\.[A-Za-z0-9.-]*[A-Za-z]\b/g,
    (text, index) => isPackageData(text.slice(Math.max(0, index - 200), index)),
  ],
  ['a client name (Woqoof)', /woqoof/gi],
  [
    'a folder path of a computer',
    /[A-Za-z]:\\\\?Users\\\\?|\/Users\/[^/\s"']+\/|\/home\/(?!runner\b)[^/\s"']+\//g,
  ],
  [
    'a private network address',
    /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/g,
  ],
];

/** True when the text before an address is a library's package data: `maintainers:[{..., email:`. */
function isPackageData(before) {
  return /\b(?:maintainers|author|contributors)\b/.test(before) && /\bemail\W{0,4}$/.test(before);
}

/** Values of the environment whose names say they are secret: none may be in a built file. */
const SECRET_NAME = /TOKEN|SECRET|PASSWORD|PRIVATE|_KEY$|^KEY_|API_KEY/i;
const envValues = Object.entries(process.env)
  .filter(
    ([name, value]) => SECRET_NAME.test(name) && typeof value === 'string' && value.length >= 12
  )
  .map(([name, value]) => [name, value]);

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
let scanned = 0;
for (const folder of folders) {
  const isNext = folder.endsWith('.next');
  for (const path of walk(join(repo, folder))) {
    const file = relative(repo, path).replaceAll('\\', '/');
    const isPublic = !isNext || servedByNext(file);
    if (isNext && isPublic && file.endsWith('.map') && file.includes('/static/')) {
      findings.push([file, 'a source map handed to the browser', 1]);
    }
    if (!TEXT.test(file) || statSync(path).size > MAX_BYTES) {
      continue;
    }
    const text = readFileSync(path, 'utf8');
    scanned += 1;
    for (const [what, pattern, allowed] of isPublic ? [...SECRETS, ...PUBLIC] : SECRETS) {
      const count = [...text.matchAll(pattern)].filter(
        (match) => !allowed?.(text, match.index)
      ).length;
      if (count > 0) {
        findings.push([file, what, count]);
      }
    }
    for (const [name, value] of envValues) {
      if (text.includes(value)) {
        findings.push([file, `the value of the environment variable ${name}`, 1]);
      }
    }
  }
}

console.log(`Scanned ${scanned} files in ${folders.join(', ')}.`);
if (findings.length > 0) {
  for (const [file, what, count] of findings) {
    console.log(`  ${file}: ${what} (${count})`);
  }
  console.error(`${findings.length} finding(s). Nothing secret or private may be in a build.`);
  process.exit(1);
}
console.log('No secret, key, email address, client name, folder path or source map found.');
