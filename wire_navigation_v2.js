const fs = require('fs');
const path = require('path');
const dir = 'g:/zen/projets/DizzitApp/app/src/screens';

function updateFile(filename, replacements) {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) {
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(r => {
    // We will find lines containing r.text and replace onPress if it exists, or add it
    if (r.type === 'DizzitButton') {
      const regex = new RegExp(`(<DizzitButton[^>]*title="${r.text}"[^>]*)(?:onPress={[^{]*})?([^>]*>)`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `$1 onPress={() => navigation.navigate('${r.target}')}$2`);
        changed = true;
      }
    } else if (r.type === 'QuickActionCard') {
      const regex = new RegExp(`(<QuickActionCard[^>]*title="${r.text}"[^>]*)(?:onPress={[^{]*})?([^>]*>)`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `$1 onPress={() => navigation.navigate('${r.target}')}$2`);
        changed = true;
      }
    } else if (r.type === 'custom') {
      if (r.regexSearch.test(content)) {
        content = content.replace(r.regexSearch, r.replace);
        changed = true;
      }
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
  }
}

// Auth
updateFile('VerificationScreen.js', [{ type: 'DizzitButton', text: 'Vérifier', target: 'PinCodeScreen' }]);
updateFile('PinCodeScreen.js', [{ type: 'DizzitButton', text: 'Valider', target: 'SuccessScreen' }]);
updateFile('SuccessScreen.js', [{ type: 'DizzitButton', text: "Aller à l'accueil", target: 'HomeScreen' }]);
updateFile('ResetPasswordEmailScreen.js', [{ type: 'DizzitButton', text: 'Envoyer le code', target: 'ResetPasswordCodeScreen' }]);
updateFile('ResetPasswordCodeScreen.js', [{ type: 'DizzitButton', text: 'Vérifier le code', target: 'ResetPasswordFinalScreen' }]);
updateFile('ResetPasswordFinalScreen.js', [{ type: 'DizzitButton', text: 'Réinitialiser le mot de passe', target: 'LoginScreen' }, { type: 'DizzitButton', text: 'Réinitialiser', target: 'LoginScreen' }]);

// Home Actions
updateFile('HomeScreen.js', [
  { type: 'QuickActionCard', text: 'Recharger', target: 'TopUpScreen' },
  { type: 'QuickActionCard', text: 'Retirer', target: 'WithdrawFundsScreen' },
  { type: 'QuickActionCard', text: 'Envoyer', target: 'SendMoneyScreen' },
  { type: 'QuickActionCard', text: 'Payer', target: 'CashierScanScreen' }
]);

// Shops Flow
updateFile('ShopsScreen.js', [
  { type: 'custom', regexSearch: /(<TouchableOpacity style=\{styles\.shopCard\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ShopDetailsScreen')}$2` }
]);
updateFile('ShopDetailsScreen.js', [
  { type: 'custom', regexSearch: /(<TouchableOpacity style=\{styles\.categoryItem\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ShopProductsScreen')}$2` },
  { type: 'custom', regexSearch: /(<TouchableOpacity style=\{styles\.seeAllBtn\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ShopProductsScreen')}$2` }
]);
updateFile('ShopProductsScreen.js', [
  { type: 'custom', regexSearch: /(<TouchableOpacity style=\{styles\.productCard\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ProductDetailsScreen')}$2` }
]);
updateFile('ProductDetailsScreen.js', [{ type: 'DizzitButton', text: 'Acheter', target: 'OrderVerificationScreen' }]);
updateFile('OrderVerificationScreen.js', [{ type: 'DizzitButton', text: 'Payer', target: 'OrderConfirmationScreen' }]);
updateFile('OrderConfirmationScreen.js', [
  { type: 'DizzitButton', text: 'Valider la transaction', target: 'PaymentInProgressScreen' },
  { type: 'DizzitButton', text: 'Valider', target: 'PaymentInProgressScreen' }
]);
updateFile('PaymentInProgressScreen.js', [{ type: 'DizzitButton', text: 'Simuler la finalisation', target: 'PaymentSuccessScreen' }, { type: 'DizzitButton', text: 'Simuler finalisation', target: 'PaymentSuccessScreen' }]);
updateFile('PaymentSuccessScreen.js', [{ type: 'DizzitButton', text: "Retour à l'accueil", target: 'HomeScreen' }]);

// Send Money
updateFile('SendMoneyScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'SendMoneyMethodScreen' }]);
updateFile('SendMoneyMethodScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'SendMoneySummaryScreen' }]);
updateFile('SendMoneySummaryScreen.js', [{ type: 'DizzitButton', text: 'Envoyer', target: 'SendMoneyPinScreen' }]);
updateFile('SendMoneyPinScreen.js', [{ type: 'DizzitButton', text: 'Valider', target: 'SendMoneySuccessScreen' }]);
updateFile('SendMoneySuccessScreen.js', [{ type: 'DizzitButton', text: "Retour à l'accueil", target: 'HomeScreen' }]);

// Withdraw
updateFile('WithdrawFundsScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'WithdrawFundsMethodScreen' }]);
updateFile('WithdrawFundsMethodScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'WithdrawFundsMobileMoneyProcessingScreen' }]);
updateFile('WithdrawFundsMobileMoneyProcessingScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'WithdrawFundsMobileMoneySummaryScreen' }]);
updateFile('WithdrawFundsMobileMoneySummaryScreen.js', [{ type: 'DizzitButton', text: 'Confirmer', target: 'WithdrawFundsMobileMoneySuccessScreen' }]);
updateFile('WithdrawFundsMobileMoneySuccessScreen.js', [{ type: 'DizzitButton', text: "Retour à l'accueil", target: 'HomeScreen' }]);

// Cash Register
updateFile('CashRegisterScreen.js', [{ type: 'DizzitButton', text: 'Payer', target: 'CashierScanScreen' }, { type: 'DizzitButton', text: 'Envoyer', target: 'CashierSendFundsScreen' }]);
updateFile('CashierScanScreen.js', [{ type: 'DizzitButton', text: 'Simuler Paiement', target: 'CashierSuccessScreen' }]);
updateFile('CashierSuccessScreen.js', [{ type: 'DizzitButton', text: 'Nouvelle transaction', target: 'CashRegisterScreen' }]);
updateFile('CashierSendFundsScreen.js', [{ type: 'DizzitButton', text: 'Envoyer', target: 'SendMoneyPinScreen' }]);

// Top Up
updateFile('TopUpScreen.js', [{ type: 'DizzitButton', text: 'Recharger', target: 'TopUpDetailsScreen' }]);
updateFile('TopUpDetailsScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'TopUpSummaryScreen' }]);
updateFile('TopUpSummaryScreen.js', [{ type: 'DizzitButton', text: 'Confirmer et Payer', target: 'TopUpWalletConfirmationScreen' }]);
updateFile('TopUpWalletConfirmationScreen.js', [{ type: 'DizzitButton', text: 'Confirmer', target: 'PaymentInProgressScreen' }]);

console.log('Wiring complete.');
