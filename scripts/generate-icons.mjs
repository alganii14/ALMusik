import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_ICON = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#1DB954"/>
  <circle cx="256" cy="256" r="140" fill="#121212"/>
  <circle cx="256" cy="256" r="50" fill="#1DB954"/>
  <path d="M256 116C178.8 116 116 178.8 116 256s62.8 140 140 140 140-62.8 140-140S333.2 116 256 116zm0 240c-55.2 0-100-44.8-100-100s44.8-100 100-100 100 44.8 100 100-44.8 100-100 100z" fill="#1DB954"/>
  <text x="256" y="280" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="900" fill="white" text-anchor="middle">AL</text>
</svg>
`;

const SVG_MASKABLE = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1DB954"/>
  <circle cx="256" cy="256" r="120" fill="#121212"/>
  <circle cx="256" cy="256" r="40" fill="#1DB954"/>
  <path d="M256 136C189.7 136 136 189.7 136 256s53.7 120 120 120 120-53.7 120-120S322.3 136 256 136zm0 200c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z" fill="#1DB954"/>
  <text x="256" y="275" font-family="Arial Black, Arial, sans-serif" font-size="70" font-weight="900" fill="white" text-anchor="middle">AL</text>
</svg>
`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
  // Ensure directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [192, 512];

  for (const size of sizes) {
    // Regular icon
    await sharp(Buffer.from(SVG_ICON))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    
    console.log(`Created icon-${size}x${size}.png`);

    // Maskable icon
    await sharp(Buffer.from(SVG_MASKABLE))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-maskable-${size}x${size}.png`));
    
    console.log(`Created icon-maskable-${size}x${size}.png`);
  }

  console.log('\\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
