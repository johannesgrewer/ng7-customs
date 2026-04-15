import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const svgSrc = readFileSync(join(process.cwd(), 'public', 'favicon.svg'));

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  await sharp(svgSrc, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(process.cwd(), 'public', name));
  console.log(`wrote public/${name}`);
}
