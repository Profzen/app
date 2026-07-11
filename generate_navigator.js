const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const navDir = path.join(__dirname, 'src', 'navigation');

if (!fs.existsSync(navDir)) {
  fs.mkdirSync(navDir, { recursive: true });
}

const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.js'));

let imports = '';
let screens = '';

files.forEach(file => {
  const componentName = file.replace('.js', '');
  imports += `import ${componentName} from '../screens/${componentName}';\n`;
  screens += `      <Stack.Screen name="${componentName}" component={${componentName}} />\n`;
});

const navigatorCode = `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

${imports}
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="LoginScreen"
      screenOptions={{ headerShown: false }}
    >
${screens}    </Stack.Navigator>
  );
}
`;

fs.writeFileSync(path.join(navDir, 'AppNavigator.js'), navigatorCode);
console.log('AppNavigator.js generated successfully.');
