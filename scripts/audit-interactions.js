const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'src');

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full) : full.endsWith('.js') ? [full] : [];
  });
}

const files = [...filesUnder(sourceRoot), path.join(root, 'App.js')];
const declaredRoutes = new Set();
const navigations = [];
const inertControls = [];
const handledControls = [];
const interactiveNames = new Set([
  'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback',
  'Pressable', 'Button', 'DizzitButton', 'QuickActionCard', 'ServiceGridCard',
  'ServiceMenuItem', 'ShopListItem', 'ContactListItem', 'AssetItem',
]);

function jsxName(node) {
  if (!node) return '';
  if (node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'JSXMemberExpression') return `${jsxName(node.object)}.${jsxName(node.property)}`;
  return '';
}

function attr(node, name) {
  return node.attributes.find((item) => item.type === 'JSXAttribute' && item.name.name === name);
}

for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const code = fs.readFileSync(file, 'utf8');
  const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });

  traverse(ast, {
    JSXOpeningElement(p) {
      const name = jsxName(p.node.name);
      if (!interactiveNames.has(name)) return;
      const onPress = attr(p.node, 'onPress') || attr(p.node, 'onSelect') || attr(p.node, 'onBuy') || attr(p.node, 'onClick');
      const item = `${relative}:${p.node.loc.start.line} <${name}>`;
      (onPress ? handledControls : inertControls).push(item);
    },
    CallExpression(p) {
      const callee = p.node.callee;
      if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier' || callee.object.name !== 'navigation') return;
      if (!['navigate', 'replace', 'push'].includes(callee.property.name)) return;
      const target = p.node.arguments[0];
      navigations.push({
        file: relative,
        line: p.node.loc.start.line,
        method: callee.property.name,
        target: target && (target.type === 'StringLiteral' || target.type === 'Literal') ? target.value : '<dynamic>',
      });
    },
  });
}

const navigator = fs.readFileSync(path.join(sourceRoot, 'navigation', 'AppNavigator.js'), 'utf8');
const navAst = parser.parse(navigator, { sourceType: 'module', plugins: ['jsx'] });
traverse(navAst, {
  JSXOpeningElement(p) {
    if (jsxName(p.node.name) !== 'Stack.Screen') return;
    const name = attr(p.node, 'name');
    if (name && name.value && name.value.type === 'StringLiteral') declaredRoutes.add(name.value.value);
  },
});

const invalid = navigations.filter(({ target }) => target !== '<dynamic>' && !declaredRoutes.has(target));

console.log(`Routes declared: ${declaredRoutes.size}`);
console.log(`Navigation calls: ${navigations.length}`);
console.log(`Controls with handlers: ${handledControls.length}`);
console.log(`Controls without direct handlers (review candidates, not confirmed defects): ${inertControls.length}`);
console.log('\nINVALID NAVIGATION TARGETS');
invalid.forEach((item) => console.log(`${item.file}:${item.line} ${item.method}('${item.target}')`));
console.log('\nCONTROLS WITHOUT DIRECT HANDLERS (MANUAL REVIEW REQUIRED)');
inertControls.forEach((item) => console.log(item));
console.log('\nALL NAVIGATION CALLS');
navigations.forEach((item) => console.log(`${item.file}:${item.line} ${item.method}('${item.target}')`));

