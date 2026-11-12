// node diffview.cjs <a.png> <b.png> <out.png> x0 y0 x1 y1
// Draws the region of A, enlarged 6 times, with every pixel that differs in B painted red.
const { readFileSync, writeFileSync } = require('node:fs');
const { chromium } = require('playwright-core');

const [a, b, out, x0, y0, x1, y1] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  const urls = [a, b].map((file) => `data:image/png;base64,${readFileSync(file).toString('base64')}`);
  const result = await page.evaluate(
    async ([first, second, left, top, right, bottom]) => {
      const load = (url) =>
        new Promise((done) => {
          const image = new Image();
          image.onload = () => done(image);
          image.src = url;
        });
      const [one, two] = await Promise.all([load(first), load(second)]);
      const width = right - left + 1;
      const height = bottom - top + 1;
      const data = (image) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(image, -left, -top);
        return context.getImageData(0, 0, width, height);
      };
      const x = data(one);
      const y = data(two);
      const scale = 6;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext('2d');
      const samples = [];
      for (let row = 0; row < height; row += 1) {
        for (let column = 0; column < width; column += 1) {
          const i = (row * width + column) * 4;
          const differs = [0, 1, 2, 3].some((k) => x.data[i + k] !== y.data[i + k]);
          context.fillStyle = differs
            ? 'rgb(255,0,0)'
            : `rgb(${x.data[i]},${x.data[i + 1]},${x.data[i + 2]})`;
          context.fillRect(column * scale, row * scale, scale, scale);
          if (differs && samples.length < 6) {
            samples.push({
              at: [column + left, row + top],
              a: [...x.data.slice(i, i + 4)],
              b: [...y.data.slice(i, i + 4)],
            });
          }
        }
      }
      return { url: canvas.toDataURL('image/png'), samples };
    },
    [...urls, Number(x0), Number(y0), Number(x1), Number(y1)]
  );
  writeFileSync(out, Buffer.from(result.url.split(',')[1], 'base64'));
  console.log(JSON.stringify(result.samples));
  await browser.close();
})();
