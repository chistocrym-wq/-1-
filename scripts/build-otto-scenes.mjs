import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'assets-src');
const outDir = path.join(root, 'public', 'otto');
const outFile = path.join(outDir, 'otto-scenes.webp');

const parts = fs.readdirSync(srcDir)
  .filter((name) => /^otto-scenes-v2\.b64\.part\d+$/.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (parts.length !== 12) {
  throw new Error(`Expected 12 Otto sprite parts, found ${parts.length}: ${parts.join(', ')}`);
}

const base64 = parts
  .map((name) => fs.readFileSync(path.join(srcDir, name), 'utf8').replace(/\s+/g, ''))
  .join('');

const buffer = Buffer.from(base64, 'base64');
const riff = buffer.subarray(0, 4).toString('ascii');
const webp = buffer.subarray(8, 12).toString('ascii');

if (riff !== 'RIFF' || webp !== 'WEBP') {
  throw new Error(`Assembled Otto sprite is not a valid WebP (RIFF=${riff}, WEBP=${webp})`);
}

// The legacy sprite in the repository was ~15 KB. The current six-pose sprite
// is much larger; fail the build instead of silently publishing the legacy asset.
if (buffer.length < 50000) {
  throw new Error(`Otto sprite is unexpectedly small (${buffer.length} bytes); refusing to publish legacy/corrupt artwork.`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, buffer);
console.log(`Built ${path.relative(root, outFile)} from ${parts.length} parts (${buffer.length} bytes)`);
