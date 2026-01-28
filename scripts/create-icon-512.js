/**
 * Create icon-512.png from scratch
 * Generates a beautiful icon with the app's theme colors
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp library not found. Please run: npm install --save-dev sharp');
  process.exit(1);
}

async function createIcon512() {
  const icon512Path = path.join(__dirname, '../public/icon-512.png');
  
  try {
    console.log('🎨 Creating icon-512.png with app theme...');
    
    // Create SVG with gradient background and heart
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F4A6C1;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#E8979D;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#D4A574;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="80" fill="url(#grad)"/>
        <text x="256" y="320" font-size="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif">💕</text>
      </svg>
    `;
    
    // Convert SVG to PNG
    await sharp(Buffer.from(svg))
      .resize(512, 512)
      .png()
      .toFile(icon512Path);

    console.log('✅ Successfully created icon-512.png!');
    console.log('📍 Location:', icon512Path);
    console.log('\n🎉 Your PWA is now complete!');
    console.log('\n📱 Next steps:');
    console.log('   1. Deploy your app to Vercel/Netlify');
    console.log('   2. Use PWABuilder to create Android package');
    console.log('   3. Upload to Google Play Store');
  } catch (error) {
    console.error('❌ Error creating icon:', error.message);
    process.exit(1);
  }
}

createIcon512();

