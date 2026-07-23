const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..');
const brandDir = path.join(appDir, 'assets', 'brand');
const docsDir = path.join(appDir, 'docs');

if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

// Move root images to assets/brand/
const brandFiles = [
  { oldName: 'dizzitup logo cercle.png', newName: 'dizzitup_logo_cercle.png' },
  { oldName: 'dizzitup logo.jpeg', newName: 'dizzitup_logo.jpeg' },
  { oldName: 'ldci.png', newName: 'ldci.png' },
];

brandFiles.forEach(({ oldName, newName }) => {
  const oldPath = path.join(appDir, oldName);
  const newPath = path.join(brandDir, newName);
  if (fs.existsSync(oldPath)) {
    fs.copyFileSync(oldPath, newPath);
    console.log(`Copied ${oldName} to assets/brand/${newName}`);
  }
});

// Move doc files to docs/
const docFiles = [
  'contrat.txt',
  'DizzitUp_Design_System.txt',
  'DizzitUp_API_Reference_2.txt',
  'DizzitUp_Mobile_Project_Proposal (1).txt',
];

docFiles.forEach(fileName => {
  const oldPath = path.join(appDir, fileName);
  const newPath = path.join(docsDir, fileName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${fileName} to docs/`);
  }
});

// Move root scripts to scripts/
const rootScripts = [
  'fix_dropdowns.js',
  'fix_empty_nav.js',
  'fix_nav.js',
  'fix_ui.js',
  'generate_navigator.js',
  'inject_navigation.js',
  'wire_dash.js',
  'wire_navigation.js',
  'wire_navigation_v2.js',
  'wire_navigation_v3.js',
  'wire_navigation_v4.js',
  'wire_navigation_v5.js',
];

rootScripts.forEach(fileName => {
  const oldPath = path.join(appDir, fileName);
  const newPath = path.join(appDir, 'scripts', fileName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${fileName} to scripts/`);
  }
});

// Remove empty temp dist dir if exists
const distCheck = path.join(appDir, 'dist-ldci-check');
if (fs.existsSync(distCheck) && fs.readdirSync(distCheck).length === 0) {
  fs.rmdirSync(distCheck);
  console.log('Removed empty dist-ldci-check folder');
}

console.log('Reorganization script completed.');
