import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modern app icon - rounded square with gradient and music wave
const SVG_ICON = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1DB954"/>
      <stop offset="100%" style="stop-color:#169c46"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#e0e0e0"/>
    </linearGradient>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)"/>
  
  <!-- Subtle inner shadow/glow -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  
  <!-- Music wave bars -->
  <g fill="rgba(255,255,255,0.15)">
    <rect x="80" y="200" width="30" height="112" rx="15"/>
    <rect x="130" y="160" width="30" height="192" rx="15"/>
    <rect x="180" y="180" width="30" height="152" rx="15"/>
  </g>
  
  <!-- AL Text - Bold and prominent -->
  <text x="320" y="340" font-family="Arial Black, Helvetica, sans-serif" font-size="180" font-weight="900" fill="white" text-anchor="middle">AL</text>
  
  <!-- Small music note accent -->
  <g fill="rgba(255,255,255,0.9)" transform="translate(400, 120)">
    <ellipse cx="20" cy="50" rx="18" ry="14"/>
    <rect x="34" y="0" width="6" height="50"/>
    <path d="M40,0 Q60,-10 70,15 Q60,5 40,10 Z"/>
  </g>
</svg>
`;

// Maskable icon - more padding for safe area
const SVG_MASKABLE = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1DB954"/>
      <stop offset="100%" style="stop-color:#169c46"/>
    </linearGradient>
  </defs>
  
  <!-- Full background for maskable -->
  <rect width="512" height="512" fill="url(#bgGrad2)"/>
  
  <!-- Music wave bars - smaller for safe area -->
  <g fill="rgba(255,255,255,0.15)">
    <rect x="100" y="210" width="24" height="92" rx="12"/>
    <rect x="140" y="180" width="24" height="152" rx="12"/>
    <rect x="180" y="195" width="24" height="122" rx="12"/>
  </g>
  
  <!-- AL Text - centered with padding -->
  <text x="310" y="320" font-family="Arial Black, Helvetica, sans-serif" font-size="150" font-weight="900" fill="white" text-anchor="middle">AL</text>
  
  <!-- Small music note -->
  <g fill="rgba(255,255,255,0.85)" transform="translate(380, 140) scale(0.8)">
    <ellipse cx="20" cy="50" rx="18" ry="14"/>
    <rect x="34" y="0" width="6" height="50"/>
    <path d="M40,0 Q60,-10 70,15 Q60,5 40,10 Z"/>
  </g>
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
