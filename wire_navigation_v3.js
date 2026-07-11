const fs = require('fs');
const path = require('path');
const dir = 'g:/zen/projets/DizzitApp/app/src/screens';

function updateFile(filename, replacements) {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipped (not found): ${filename}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(r => {
    if (r.type === 'DizzitButton' || r.type === 'QuickActionCard') {
      const tagRegex = new RegExp(`<${r.type}[^>]*>`, 'g');
      content = content.replace(tagRegex, (match) => {
        if (match.includes(`title="${r.text}"`) || match.includes(`title={'${r.text}'}`) || match.includes(`title={"${r.text}"}`)) {
          if (match.includes('onPress={')) {
            return match.replace(/onPress=\{[^}]*\}/, `onPress={() => navigation.navigate('${r.target}')}`);
          } else {
            if (match.endsWith('/>')) {
              return match.replace(/\/>$/, ` onPress={() => navigation.navigate('${r.target}')} />`);
            } else {
              return match.replace(/>$/, ` onPress={() => navigation.navigate('${r.target}')}>`);
            }
          }
        }
        return match;
      });
    } else if (r.type === 'custom') {
      content = content.replace(r.search, r.replace);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
  }
}

// 1. Auth Flow
updateFile('RegisterScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'VerificationScreen' }]);
updateFile('VerificationScreen.js', [{ type: 'DizzitButton', text: 'Vérifier', target: 'PinCodeScreen' }]);
updateFile('PinCodeScreen.js', [{ type: 'DizzitButton', text: 'Valider', target: 'SuccessScreen' }]);
updateFile('SuccessScreen.js', [{ type: 'DizzitButton', text: "Aller à l'accueil", target: 'HomeScreen' }]);
updateFile('ResetPasswordEmailScreen.js', [{ type: 'DizzitButton', text: 'Envoyer le code', target: 'ResetPasswordCodeScreen' }]);
updateFile('ResetPasswordCodeScreen.js', [{ type: 'DizzitButton', text: 'Vérifier le code', target: 'ResetPasswordFinalScreen' }]);
updateFile('ResetPasswordFinalScreen.js', [{ type: 'DizzitButton', text: 'Réinitialiser', target: 'LoginScreen' }, { type: 'DizzitButton', text: 'Réinitialiser le mot de passe', target: 'LoginScreen' }]);

// 2. Home Actions
updateFile('HomeScreen.js', [
  { type: 'QuickActionCard', text: 'Recharger', target: 'TopUpScreen' },
  { type: 'QuickActionCard', text: 'Retirer', target: 'WithdrawFundsScreen' },
  { type: 'QuickActionCard', text: 'Envoyer', target: 'SendMoneyScreen' },
  { type: 'QuickActionCard', text: 'Payer', target: 'CashierScanScreen' }
]);

// 3. Shops Flow
updateFile('ShopsScreen.js', [
  { type: 'custom', search: /(<TouchableOpacity style=\{styles\.shopCard\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ShopDetailsScreen')}$2` }
]);
updateFile('ShopDetailsScreen.js', [
  { type: 'custom', search: /(<TouchableOpacity style=\{styles\.categoryItem\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ShopProductsScreen')}$2` },
  { type: 'custom', search: /(<TouchableOpacity style=\{styles\.seeAllBtn\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ShopProductsScreen')}$2` }
]);
updateFile('ShopProductsScreen.js', [
  { type: 'custom', search: /(<TouchableOpacity style=\{styles\.productCard\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('ProductDetailsScreen')}$2` }
]);
updateFile('ProductDetailsScreen.js', [{ type: 'DizzitButton', text: 'Acheter', target: 'OrderVerificationScreen' }]);
updateFile('OrderVerificationScreen.js', [{ type: 'DizzitButton', text: 'Payer', target: 'OrderConfirmationScreen' }]);
updateFile('OrderConfirmationScreen.js', [
  { type: 'DizzitButton', text: 'Valider la transaction', target: 'PaymentInProgressScreen' },
  { type: 'DizzitButton', text: 'Valider', target: 'PaymentInProgressScreen' }
]);
updateFile('PaymentInProgressScreen.js', [{ type: 'DizzitButton', text: 'Simuler la finalisation', target: 'PaymentSuccessScreen' }, { type: 'DizzitButton', text: 'Simuler finalisation', target: 'PaymentSuccessScreen' }]);
updateFile('PaymentSuccessScreen.js', [{ type: 'DizzitButton', text: "Retour à l'accueil", target: 'HomeScreen' }, { type: 'DizzitButton', text: "Aller à l'accueil", target: 'HomeScreen' }]);

// 4. Send Money
updateFile('SendMoneyScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'SendMoneyMethodScreen' }]);
updateFile('SendMoneyMethodScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'SendMoneySummaryScreen' }]);
updateFile('SendMoneySummaryScreen.js', [{ type: 'DizzitButton', text: 'Envoyer', target: 'SendMoneyPinScreen' }, { type: 'DizzitButton', text: 'Confirmer', target: 'SendMoneyPinScreen' }]);
updateFile('SendMoneyPinScreen.js', [{ type: 'DizzitButton', text: 'Valider', target: 'SendMoneySuccessScreen' }]);
updateFile('SendMoneySuccessScreen.js', [{ type: 'DizzitButton', text: "Retour à l'accueil", target: 'HomeScreen' }]);

// 5. Withdraw
updateFile('WithdrawFundsScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'WithdrawFundsMethodScreen' }]);
updateFile('WithdrawFundsMethodScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'WithdrawFundsMobileMoneyProcessingScreen' }]);
updateFile('WithdrawFundsMobileMoneyProcessingScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'WithdrawFundsMobileMoneySummaryScreen' }]);
updateFile('WithdrawFundsMobileMoneySummaryScreen.js', [{ type: 'DizzitButton', text: 'Confirmer', target: 'WithdrawFundsMobileMoneySuccessScreen' }]);
updateFile('WithdrawFundsMobileMoneySuccessScreen.js', [{ type: 'DizzitButton', text: "Retour à l'accueil", target: 'HomeScreen' }]);

// 6. Cash Register
updateFile('CashRegisterScreen.js', [{ type: 'DizzitButton', text: 'Payer', target: 'CashierScanScreen' }, { type: 'DizzitButton', text: 'Envoyer', target: 'CashierSendFundsScreen' }]);
updateFile('CashierScanScreen.js', [{ type: 'DizzitButton', text: 'Simuler Paiement', target: 'CashierSuccessScreen' }]);
updateFile('CashierSuccessScreen.js', [{ type: 'DizzitButton', text: 'Nouvelle transaction', target: 'CashRegisterScreen' }, { type: 'DizzitButton', text: 'Retour à la caisse', target: 'CashRegisterScreen' }]);
updateFile('CashierSendFundsScreen.js', [{ type: 'DizzitButton', text: 'Envoyer', target: 'SendMoneyPinScreen' }]); // Send to pin validation

// 7. Top Up
updateFile('TopUpScreen.js', [
  // TopUpScreen has TouchableOpacity with styles.btnContinue instead of DizzitButton. Let's fix that via custom regex.
  { type: 'custom', search: /(<TouchableOpacity style=\{styles\.btnContinue\})([^>]*>)/g, replace: `$1 onPress={() => navigation.navigate('TopUpDetailsScreen')}$2` }
]);
updateFile('TopUpDetailsScreen.js', [{ type: 'DizzitButton', text: 'Continuer', target: 'TopUpSummaryScreen' }]);
updateFile('TopUpSummaryScreen.js', [{ type: 'DizzitButton', text: 'Confirmer et Payer', target: 'TopUpWalletConfirmationScreen' }, { type: 'DizzitButton', text: 'Confirmer', target: 'TopUpWalletConfirmationScreen' }]);
updateFile('TopUpWalletConfirmationScreen.js', [{ type: 'DizzitButton', text: 'Confirmer', target: 'PaymentInProgressScreen' }]);

console.log('Wiring complete.');
