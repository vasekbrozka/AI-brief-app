// Generates the PWA icon set from the AIspresso source artwork.
// Run with:  npm run icons
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'assets', 'icon-source.png');
const outDir = join(root, 'public', 'icons');

// The artwork is an off-white rounded tile that reaches the edges at the
// mid-points but has small pure-white corners. Crop a small inset so the tile
// fills the square edge-to-edge (no white corners once iOS/Android round it).
const INSET = 88;
// The tile's warm off-white — used to pad the maskable icon.
const TILE_BG = { r: 251, g: 248, b: 246 };

async function croppedBase() {
  const meta = await sharp(SOURCE).metadata();
  const size = Math.min(meta.width, meta.height) - INSET * 2;
  return sharp(SOURCE)
    .extract({ left: INSET, top: INSET, width: size, height: size })
    .toBuffer();
}

async function renderPng(buf, size, file) {
  const out = await sharp(buf).resize(size, size, { fit: 'cover' }).png().toBuffer();
  await writeFile(join(outDir, file), out);
  console.log('✓', file);
}

// Maskable icons must keep their content inside the central "safe zone", so we
// scale the artwork down and pad it with the tile colour.
async function renderMaskable(buf, size, file) {
  const inner = Math.round(size * 0.84);
  const resized = await sharp(buf).resize(inner, inner, { fit: 'cover' }).toBuffer();
  const out = await sharp({
    create: { width: size, height: size, channels: 3, background: TILE_BG },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toBuffer();
  await writeFile(join(outDir, file), out);
  console.log('✓', file);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const base = await croppedBase();

  // Full-bleed icons (iOS/Android apply their own corner mask).
  await renderPng(base, 180, 'apple-touch-icon.png');
  await renderPng(base, 192, 'icon-192.png');
  await renderPng(base, 512, 'icon-512.png');
  await renderPng(base, 48, 'favicon.png');

  // Maskable with a safe-zone margin.
  await renderMaskable(base, 512, 'icon-maskable-512.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
