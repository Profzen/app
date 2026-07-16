const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const root = path.resolve(__dirname, '..');
const navigatorPath = path.join(root, 'src', 'navigation', 'AppNavigator.js');
const navigatorCode = fs.readFileSync(navigatorPath, 'utf8');
const ast = parser.parse(navigatorCode, {sourceType: 'module', plugins: ['jsx']});
const routes = new Map();
const imports = new Map();

traverse(ast, {
  ImportDeclaration(p) {
    const local = p.node.specifiers[0]?.local?.name;
    if (local) imports.set(local, p.node.source.value);
  },
  JSXOpeningElement(p) {
    if (p.node.name.type !== 'JSXMemberExpression' || p.node.name.object.name !== 'Stack' || p.node.name.property.name !== 'Screen') return;
    const nameAttr = p.node.attributes.find((item) => item.type === 'JSXAttribute' && item.name.name === 'name');
    const componentAttr = p.node.attributes.find((item) => item.type === 'JSXAttribute' && item.name.name === 'component');
    const name = nameAttr?.value?.value;
    const component = componentAttr?.value?.expression?.name;
    if (name) routes.set(name, {component, source: imports.get(component)});
  },
});

const incoming = new Map([...routes.keys()].map((route) => [route, []]));
function stringTargets(node) {
  if (!node) return [];
  if (node.type === 'StringLiteral') return [node.value];
  if (node.type === 'ConditionalExpression') return [...stringTargets(node.consequent), ...stringTargets(node.alternate)];
  if (node.type === 'LogicalExpression') return [...stringTargets(node.left), ...stringTargets(node.right)];
  return [];
}
function filesUnder(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full) : full.endsWith('.js') ? [full] : [];
  });
}

for (const file of filesUnder(path.join(root, 'src'))) {
  const code = fs.readFileSync(file, 'utf8');
  const fileAst = parser.parse(code, {sourceType: 'module', plugins: ['jsx']});
  traverse(fileAst, {
    CallExpression(p) {
      const callee = p.node.callee;
      if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier' || callee.object.name !== 'navigation' || !['navigate','replace','push'].includes(callee.property.name)) return;
      const targets = stringTargets(p.node.arguments[0]);
      for (const target of targets) if (incoming.has(target)) incoming.get(target).push(`${path.relative(root, file).replaceAll('\\','/')}:${p.node.loc.start.line}`);
    },
  });
}

const allowedRoots = new Set(['LoginScreen', 'ReceiveFundsScreen']); // Legacy Receive Funds V1 stays registered only for backward compatibility.
const orphaned = [...routes.entries()].filter(([name]) => !allowedRoots.has(name) && incoming.get(name).length === 0);
console.log(`Routes: ${routes.size}`);
console.log(`Routes without an explicit incoming navigation: ${orphaned.length}`);
orphaned.forEach(([name, meta]) => console.log(`${name} -> ${meta.source || meta.component}`));
if (orphaned.length) process.exitCode = 1;
