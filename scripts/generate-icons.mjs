// Generates the PWA icon set from a single minimalist "sparkle" mark.
// Run with:  npm run icons
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

// Sparkle mark on a 24×24 grid, centred near (12, 11).
const SPARKLE =
  'M12 4l1.7 4.6a1 1 0 00.7.7L19 11l-4.6 1.7a1 1 0 00-.7.7L12 18l-1.7-4.6a1 1 0 00-.7-.7L5 11l4.6-1.7a1 1 0 00.7-.7z';

function iconSvg({ size, rounded = false, glyphScale = 1.05 }) {
  const rx = rounded ? 5.4 : 0; // 22.5% of the 24-unit grid
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c2c2e"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="24" height="24" rx="${rx}" fill="url(#bg)"/>
  <g transform="translate(12 11) scale(${glyphScale}) translate(-12 -11)">
    <path d="${SPARKLE}" fill="#ffffff"/>
  </g>
</svg>`;
}

async function renderPng(svg, size, file) {
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  await writeFile(join(outDir, file), buf);
  console.log('✓', file);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Full-bleed app icons (iOS/Android apply their own corner mask).
  await renderPng(iconSvg({ size: 180 }), 180, 'apple-touch-icon.png');
  await renderPng(iconSvg({ size: 192 }), 192, 'icon-192.png');
  await renderPng(iconSvg({ size: 512 }), 512, 'icon-512.png');

  // Maskable: keep the glyph inside the safe zone.
  await renderPng(iconSvg({ size: 512, glyphScale: 0.62 }), 512, 'icon-maskable-512.png');

  // Rounded vector favicon for the browser tab.
  await writeFile(join(outDir, 'favicon.svg'), iconSvg({ size: 32, rounded: true }));
  console.log('✓', 'favicon.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
