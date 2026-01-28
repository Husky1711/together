/**
 * Generate icon-512.png from icon-192.png
 * This script resizes the existing icon to create the 512x512 version
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available, if not, provide instructions
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log(`
⚠️  Sharp library not found. Installing...

Please run:
  npm install --save-dev sharp

Then run this script again:
  node scripts/generate-icon-512.js
`);
  process.exit(1);
}

async function generateIcon512() {
  const icon192Path = path.join(__dirname, '../public/icon-192.png');
  const icon512Path = path.join(__dirname, '../public/icon-512.png');

  // Check if icon-192.png exists
  if (!fs.existsSync(icon192Path)) {
    console.error('❌ Error: icon-192.png not found at:', icon192Path);
    console.log('\nPlease make sure icon-192.png exists in the public folder.');
    process.exit(1);
  }

  try {
    console.log('🔄 Generating icon-512.png from icon-192.png...');
    
    // Resize icon-192.png to 512x512
    await sharp(icon192Path)
      .resize(512, 512, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 244, g: 166, b: 193, alpha: 1 } // Soft rose background
      })
      .png()
      .toFile(icon512Path);

    console.log('✅ Successfully created icon-512.png!');
    console.log('📍 Location:', icon512Path);
    console.log('\n🎉 Your PWA is now complete!');
  } catch (error) {
    console.error('❌ Error generating icon:', error.message);
    process.exit(1);
  }
}

generateIcon512();

