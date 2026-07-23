const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/require\(['"](\.\.\/)+dizzitup logo cercle\.png['"]\)/g, "require('../../assets/brand/dizzitup_logo_cercle.png')");
  content = content.replace(/require\(['"](\.\.\/)+assets\/dizzitup logo cercle\.png['"]\)/g, "require('../../assets/brand/dizzitup_logo_cercle.png')");
  content = content.replace(/require\(['"](\.\.\/)+dizzitup logo\.jpeg['"]\)/g, "require('../../assets/brand/dizzitup_logo.jpeg')");
  content = content.replace(/require\(['"](\.\.\/)+ldci\.png['"]\)/g, "require('../../assets/brand/ldci.png')");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated image paths in ${path.relative(srcDir, filePath)}`);
  }
});

console.log('Path update completed.');
