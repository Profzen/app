const fs = require('fs');
const path = require('path');
const dir = 'g:/zen/projets/DizzitApp/app/src/screens';
const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes("import BottomNav from '../components/BottomNav';")) {
      content = content.replace(/import BottomNav from '\.\.\/components\/BottomNav';/g, "import BottomNavBar from '../components/BottomNavBar';");
      changed = true;
    }
    if (content.includes("<BottomNav ")) {
      content = content.replace(/<BottomNav /g, "<BottomNavBar ");
      changed = true;
    }
    if (content.includes("<BottomNav/>") || content.includes("<BottomNav />")) {
      content = content.replace(/<BottomNav\s*\/>/g, "<BottomNavBar />");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed ' + file);
    }
  }
});
