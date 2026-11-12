// Compares two folders of PNG pictures.
//   node compare.cjs <dir A> <dir B>
// Equal files are equal pictures. Files that differ are drawn on a canvas in Chrome and compared
// pixel by pixel: how many pixels differ, the largest difference of one colour channel, and the
// box that holds every changed pixel.
const { createHash } = require('node:crypto');
const { readdirSync, readFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { chromium } = require('playwright-core');

const a = resolve(process.argv[2]);
const b = resolve(process.argv[3]);
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

(async () => {
  const namesA = readdirSync(a).filter((name) => name.endsWith('.png'));
  const namesB = new Set(readdirSync(b).filter((name) => name.endsWith('.png')));
  const onlyA = namesA.filter((name) => !namesB.has(name));
  const onlyB = [...namesB].filter((name) => !namesA.includes(name));
  const both = namesA.filter((name) => namesB.has(name));
  const unequal = both.filter((name) => hash(join(a, name)) !== hash(join(b, name)));

  const results = [];
  if (unequal.length > 0) {
    const browser = await chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    for (const name of unequal) {
      const urls = [a, b].map(
        (dir) => `data:image/png;base64,${readFileSync(join(dir, name)).toString('base64')}`
      );
      const result = await page.evaluate(async ([first, second]) => {
        const load = (url) =>
          new Promise((done, fail) => {
            const image = new Image();
            image.onload = () => done(image);
            image.onerror = fail;
            image.src = url;
          });
        const [one, two] = await Promise.all([load(first), load(second)]);
        if (one.width !== two.width || one.height !== two.height) {
          return { size: `${one.width}x${one.height} against ${two.width}x${two.height}` };
        }
        const data = (image) => {
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, image.width, image.height).data;
        };
        const x = data(one);
        const y = data(two);
        let pixels = 0;
        let largest = 0;
        let left = one.width;
        let top = one.height;
        let right = -1;
        let bottom = -1;
        for (let i = 0; i < x.length; i += 4) {
          const delta = Math.max(
            Math.abs(x[i] - y[i]),
            Math.abs(x[i + 1] - y[i + 1]),
            Math.abs(x[i + 2] - y[i + 2]),
            Math.abs(x[i + 3] - y[i + 3])
          );
          if (delta > 0) {
            pixels += 1;
            largest = Math.max(largest, delta);
            const column = (i / 4) % one.width;
            const row = Math.floor(i / 4 / one.width);
            left = Math.min(left, column);
            right = Math.max(right, column);
            top = Math.min(top, row);
            bottom = Math.max(bottom, row);
          }
        }
        return { pixels, largest, box: pixels > 0 ? [left, top, right, bottom] : null };
      }, urls);
      results.push({ name, ...result });
    }
    await browser.close();
  }

  const different = results.filter((result) => result.size || result.pixels > 0);
  console.log(
    `compare: ${both.length} pairs, ${both.length - different.length} identical, ` +
      `${different.length} different, ${onlyA.length} only in A, ${onlyB.length} only in B`
  );
  for (const result of different) {
    console.log(`- ${JSON.stringify(result)}`);
  }
  for (const name of onlyA) {
    console.log(`- only in A: ${name}`);
  }
  for (const name of onlyB) {
    console.log(`- only in B: ${name}`);
  }
  process.exit(different.length + onlyA.length + onlyB.length > 0 ? 1 : 0);
})();
