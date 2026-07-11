const fs = require('fs');
const path = require('path');
const dir = 'g:/zen/projets/DizzitApp/app/src/screens';

function wire(filename, stylesRegex, targetRoute) {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(`navigation.navigate('${targetRoute}')`)) return;

  const original = content;
  content = content.replace(stylesRegex, `$1 onPress={() => navigation.navigate('${targetRoute}')}$2`);
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Wired ${filename} to -> ${targetRoute}`);
  }
}

// Order/Shop
wire('ShopsScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.shopCard[^}]*\}?)(\s*>)/g, 'ShopDetailsScreen');
wire('ShopDetailsScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.categoryItem[^}]*\}?)(\s*>)/g, 'ShopProductsScreen');
wire('ShopDetailsScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.seeAllBtn[^}]*\}?)(\s*>)/g, 'ShopProductsScreen');
wire('ShopProductsScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.productCard[^}]*\}?)(\s*>)/g, 'ProductDetailsScreen');
wire('ProductDetailsScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.btnBuy[^}]*\}?)(\s*>)/g, 'OrderVerificationScreen');
wire('PaymentInProgressScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.(btnPrimary|btnContinue)[^}]*\}?)(\s*>)/g, 'PaymentSuccessScreen');

// Cash Register
wire('CashRegisterScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.btnPay[^}]*\}?)(\s*>)/g, 'CashierScanScreen');
wire('CashRegisterScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.btnSend[^}]*\}?)(\s*>)/g, 'CashierSendFundsScreen');
wire('CashierScanScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.(btnSimulate|btnPrimary|btnContinue)[^}]*\}?)(\s*>)/g, 'CashierSuccessScreen');
wire('CashierSendFundsScreen.js', /(<TouchableOpacity[^>]*style=\{\[?styles\.(btnPrimary|btnContinue)[^}]*\}?)(\s*>)/g, 'SendMoneyPinScreen');

// Home -> quick actions (QuickActionCard is a component, so we need to modify its onPress props)
// But wait, in HomeScreen.js, I created QuickActionCard. Let's wire HomeScreen.js explicitly with a string replace.
function wireHome() {
  const file = path.join(dir, 'HomeScreen.js');
  let text = fs.readFileSync(file, 'utf8');
  let original = text;
  text = text.replace(/<QuickActionCard\s+icon="add"\s+title="Recharger"\s*\/>/g, `<QuickActionCard icon="add" title="Recharger" onPress={() => navigation.navigate('TopUpScreen')} />`);
  text = text.replace(/<QuickActionCard\s+icon="arrow-up"\s+title="Retirer"\s*\/>/g, `<QuickActionCard icon="arrow-up" title="Retirer" onPress={() => navigation.navigate('WithdrawFundsScreen')} />`);
  text = text.replace(/<QuickActionCard\s+icon="paper-plane-outline"\s+title="Envoyer"\s*\/>/g, `<QuickActionCard icon="paper-plane-outline" title="Envoyer" onPress={() => navigation.navigate('SendMoneyScreen')} />`);
  text = text.replace(/<QuickActionCard\s+icon="scan"\s+title="Payer"\s*\/>/g, `<QuickActionCard icon="scan" title="Payer" onPress={() => navigation.navigate('CashierScanScreen')} />`);
  
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Wired HomeScreen quick actions');
  }
}
wireHome();

console.log('Wiring Pass 5 completed.');
