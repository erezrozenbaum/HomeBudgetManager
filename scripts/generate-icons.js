const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  win32: [16, 24, 32, 48, 64, 128, 256],
  darwin: [16, 32, 64, 128, 256, 512, 1024],
  linux: [16, 32, 48, 64, 128, 256, 512]
};

async function generateIcons() {
  console.log('Generating icons for all platforms...');

  const outputDir = path.join(__dirname, '../build/icons');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Generate icons for each platform
    for (const [platform, platformSizes] of Object.entries(sizes)) {
      console.log(`Generating icons for ${platform}...`);
      
      for (const size of platformSizes) {
        const outputFile = path.join(outputDir, `${size}x${size}.png`);
        
        // Create a simple icon with a gradient background and text
        await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite([
          {
            input: Buffer.from(`
              <svg width="${size}" height="${size}">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <rect width="${size}" height="${size}" fill="url(#grad)" />
                <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" fill="white" text-anchor="middle" dominant-baseline="middle">BM</text>
              </svg>
            `),
            top: 0,
            left: 0
          }
        ])
        .png()
        .toFile(outputFile);
        
        console.log(`Generated ${size}x${size} icon for ${platform}`);
      }

      // Generate .ico file for Windows
      if (platform === 'win32') {
        const icoFile = path.join(outputDir, 'icon.ico');
        // Use the largest size for .ico
        await sharp({
          create: {
            width: 256,
            height: 256,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite([
          {
            input: Buffer.from(`
              <svg width="256" height="256">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <rect width="256" height="256" fill="url(#grad)" />
                <text x="50%" y="50%" font-family="Arial" font-size="64" fill="white" text-anchor="middle" dominant-baseline="middle">BM</text>
              </svg>
            `),
            top: 0,
            left: 0
          }
        ])
        .png()
        .toFile(icoFile);
        console.log('Generated .ico file for Windows');
      }

      // Generate .icns file for macOS
      if (platform === 'darwin') {
        const icnsFile = path.join(outputDir, 'icon.icns');
        // Use the largest size for .icns
        await sharp({
          create: {
            width: 1024,
            height: 1024,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite([
          {
            input: Buffer.from(`
              <svg width="1024" height="1024">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <rect width="1024" height="1024" fill="url(#grad)" />
                <text x="50%" y="50%" font-family="Arial" font-size="256" fill="white" text-anchor="middle" dominant-baseline="middle">BM</text>
              </svg>
            `),
            top: 0,
            left: 0
          }
        ])
        .png()
        .toFile(icnsFile);
        console.log('Generated .icns file for macOS');
      }
    }

    console.log('Icon generation completed successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 