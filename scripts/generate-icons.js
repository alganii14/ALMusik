// Script untuk generate app icons
// Jalankan: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Base64 encoded 1x1 green pixel PNG sebagai placeholder
// Kamu perlu replace dengan icon asli menggunakan tool seperti:
// - https://realfavicongenerator.net/
// - https://www.pwabuilder.com/imageGenerator

const PLACEHOLDER_ICON = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#1DB954"/>
  <circle cx="256" cy="256" r="140" fill="#121212"/>
  <circle cx="256" cy="256" r="50" fill="#1DB954"/>
  <path d="M256 116C178.8 116 116 178.8 116 256s62.8 140 140 140 140-62.8 140-140S333.2 116 256 116zm0 240c-55.2 0-100-44.8-100-100s44.8-100 100-100 100 44.8 100 100-44.8 100-100 100z" fill="#1DB954"/>
  <text x="256" y="270" font-family="Arial Black" font-size="72" font-weight="bold" fill="white" text-anchor="middle">AL</text>
</svg>
`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write SVG files (browsers can use SVG as icons)
const sizes = [192, 512];

sizes.forEach(size => {
  const svgContent = PLACEHOLDER_ICON.replace(/512/g, size.toString());
  fs.writeFileSync(path.join(iconsDir, \`icon-\${size}x\${size}.svg\`), svgContent);
  fs.writeFileSync(path.join(iconsDir, \`icon-maskable-\${size}x\${size}.svg\`), svgContent);
});

console.log('Icons generated! Now convert SVG to PNG using:');
console.log('- Online: https://cloudconvert.com/svg-to-png');
console.log('- Or use: npx svg2png-many public/icons/*.svg');
console.log('');
console.log('Required files:');
console.log('- public/icons/icon-192x192.png');
console.log('- public/icons/icon-512x512.png');
console.log('- public/icons/icon-maskable-192x192.png');
console.log('- public/icons/icon-maskable-512x512.png');
