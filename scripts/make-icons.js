// Icon generation script — generates all required icon formats from resources/icon.png
// Usage: npm run make:icons
// Requires: sharp, png-to-ico (installed as devDependencies)

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'resources', 'icon.png');

if (!fs.existsSync(source)) {
  console.error('Missing resources/icon.png — place a 1024x1024 PNG there first.');
  process.exit(1);
}

async function generate() {
  const sharp = require('sharp');
  const pngToIco = require('png-to-ico').default || require('png-to-ico');

  // resources/icon.png — keep original (already there)

  // build/icon.png (512x512)
  await sharp(source).resize(512, 512).png().toFile(path.join(__dirname, '..', 'build', 'icon.png'));

  // build/icon.ico — generate from multiple PNG sizes into a proper ICO
  const tmpDir = path.join(__dirname, '..', 'build', '.tmp-icons');
  fs.mkdirSync(tmpDir, { recursive: true });
  const sizes = [16, 32, 64, 128, 256];
  const pngPaths = [];
  for (const size of sizes) {
    const p = path.join(tmpDir, `icon-${size}.png`);
    await sharp(source).resize(size, size).png().toFile(p);
    pngPaths.push(p);
  }
  const icoBuffer = await pngToIco(pngPaths);
  fs.writeFileSync(path.join(__dirname, '..', 'build', 'icon.ico'), icoBuffer);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  // resources/icon.ico — same ICO for tray
  fs.writeFileSync(path.join(__dirname, '..', 'resources', 'icon.ico'), icoBuffer);

  // build/icon.icns — 512x512 PNG (macOS uses this)
  await sharp(source).resize(512, 512).png().toFile(path.join(__dirname, '..', 'build', 'icon.icns'));

  console.log('Icons generated successfully from resources/icon.png.');
  console.log('  build/icon.ico  (256/128/64/32/16)');
  console.log('  build/icon.png  (512x512)');
  console.log('  build/icon.icns (512x512)');
  console.log('  resources/icon.ico (256/128/64/32/16)');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err.message);
  process.exit(1);
});
