const fs = require('fs');
const path = require('path');

const distDir = path.join(process.cwd(), 'dist');
const src = path.join(distDir, '404.html');
const destDir = path.join(distDir, '404');
const dest = path.join(destDir, 'index.html');

try {
  if (!fs.existsSync(distDir)) {
    console.warn('dist directory does not exist, nothing to copy');
    process.exit(0);
  }

  if (!fs.existsSync(src)) {
    console.warn('No 404.html found in dist; skipping copy.');
    process.exit(0);
  }

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('Copied 404.html to dist/404/index.html');
} catch (err) {
  console.error('Failed to copy 404:', err);
  process.exit(1);
}
