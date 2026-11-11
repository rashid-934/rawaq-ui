// The starter installs Rawaq UI by the address of a release. This check fails when that address
// is not the one of the version in package.json, so the two can never drift apart.
import { readFileSync } from 'node:fs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const { name, version } = read('../package.json');
const starter = read('../examples/starter/package.json');

const expected = `https://github.com/rashid-934/${name}/releases/download/v${version}/${name}-${version}.tgz`;
const actual = starter.dependencies?.[name];

if (actual !== expected) {
  console.error('check-starter: examples/starter does not install this version of the package.');
  console.error(`- package.json says version ${version}`);
  console.error(`- expected the starter to depend on ${expected}`);
  console.error(`- it depends on ${actual ?? 'nothing'}`);
  process.exit(1);
}
console.log(`check-starter: the starter installs ${name} ${version} from its release address`);
