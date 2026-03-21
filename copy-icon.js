const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'public', 'VERITUS_web_logo.png');
const dest = path.join(__dirname, 'src', 'app', 'favicon.ico');
const destPng = path.join(__dirname, 'src', 'app', 'icon.png');

try {
  console.log('Exists src?', fs.existsSync(src));
  const buffer = fs.readFileSync(src);
  fs.writeFileSync(dest, buffer);
  console.log('Successfully OVERWROTE favicon.ico');

  fs.writeFileSync(destPng, buffer);
  console.log('Successfully wrote to icon.png');
  
  // also update layout.tsx just to be completely certain
  const layoutPath = path.join(__dirname, 'src', 'app', 'layout.tsx');
  let layout = fs.readFileSync(layoutPath, 'utf8');
  if (!layout.includes('icons:')) {
    layout = layout.replace('description: "AI-powered car evaluation and comparison assistant",', 'description: "AI-powered car evaluation and comparison assistant",\n  icons: { icon: "/VERITUS_web_logo.png", apple: "/VERITUS_web_logo.png" },');
    fs.writeFileSync(layoutPath, layout);
    console.log('Added metadata to layout');
  } else {
    console.log('Layout already has icons');
  }
} catch (error) {
  console.error('Error during file operations:', error);
}
