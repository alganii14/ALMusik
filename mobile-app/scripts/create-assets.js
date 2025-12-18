const fs = require('fs');
const path = require('path');

// Create a simple SVG icon and convert to base64 PNG placeholder
const createPlaceholderPNG = (size, filename) => {
  // Simple 1x1 green pixel PNG (base64)
  // For real app, replace with actual icons
  const greenPixelPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(assetsDir, filename), greenPixelPNG);
  console.log(`Created ${filename}`);
};

createPlaceholderPNG(1024, 'icon.png');
createPlaceholderPNG(1024, 'adaptive-icon.png');
createPlaceholderPNG(1284, 'splash.png');

console.log('Assets created! Replace with real icons before publishing.');
