// Icon generation script — generates all required icon sizes from resources/icon.png
// Usage: node scripts/make-icons.js
// Requires: sharp (npm install sharp)

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'resources', 'icon.png');

if (!fs.existsSync(source)) {
  console.error('Missing resources/icon.png — place a 1024x1024 PNG there first.');
  process.exit(1);
}

try {
  const sharp = require('sharp');

  async function generate() {
    // build/icon.png (512x512)
    await sharp(source).resize(512, 512).png().toFile(path.join(__dirname, '..', 'build', 'icon.png'));

    // build/icon.ico (256x256)
    await sharp(source).resize(256, 256).toFile(path.join(__dirname, '..', 'build', 'icon.ico'));

    // build/icon.icns (for macOS — PNG fallback)
    await sharp(source).resize(512, 512).png().toFile(path.join(__dirname, '..', 'build', 'icon.icns'));

    // resources/icon.ico (256x256 for tray)
    await sharp(source).resize(256, 256).toFile(path.join(__dirname, '..', 'resources', 'icon.ico'));

    console.log('Icons generated successfully.');
  }

  generate().catch((err) => {
    console.error('Icon generation failed:', err.message);
    console.error('Install sharp: npm install sharp --save-dev');
    process.exit(1);
  });
} catch {
  console.error('sharp is not installed. Run: npm install sharp --save-dev');
  process.exit(1);
}
