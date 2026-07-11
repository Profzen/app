const fs = require('fs');
const path = require('path');
const dir = 'g:/zen/projets/DizzitApp/app/src/screens';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Add import if not exists
    if (!content.includes("import { useNavigation }") && !content.includes("import {useNavigation}")) {
      content = content.replace(/import React[^;]*;/, "$&\nimport { useNavigation } from '@react-navigation/native';");
      changed = true;
    }

    // 2. Add useNavigation hook inside the default export function
    // Regex matches "export default function ComponentName(props) {" or similar
    const funcRegex = /(export default function [a-zA-Z0-9_]+\s*\([^)]*\)\s*\{)/;
    if (funcRegex.test(content) && !content.includes("const navigation = useNavigation();")) {
      content = content.replace(funcRegex, "$1\n  const navigation = useNavigation();");
      changed = true;
    }

    // 3. Add onPress to back buttons
    // The typical structure is:
    // <TouchableOpacity style={styles.iconBtn}>
    //   <Ionicons name="chevron-back" ... />
    // </TouchableOpacity>
    // We will look for <TouchableOpacity ...> and check if the next line has chevron-back or arrow-back
    // Since regex for this is tricky across lines, let's use a simpler approach.
    
    // Replace <TouchableOpacity style={styles.iconBtn}> if it precedes a chevron-back/arrow-back
    // Wait, some might already have onPress.
    content = content.replace(/(<TouchableOpacity[^>]*)(>)\s*(<Ionicons name="(?:chevron-back|arrow-back)"[^>]*>)/g, (match, p1, p2, p3) => {
      if (p1.includes("onPress")) return match;
      return p1 + " onPress={() => navigation.goBack()}" + p2 + "\n          " + p3;
    });

    // Write back if changed
    if (changed || content.includes('onPress={() => navigation.goBack()}')) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Injected navigation into ' + file);
    }
  }
});
