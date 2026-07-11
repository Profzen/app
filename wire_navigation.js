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
  let changed = false;

  replacements.forEach(r => {
    if (content.includes(r.search)) {
      content = content.replace(r.search, r.replace);
      changed = true;
    } else if (r.regexSearch && r.regexSearch.test(content)) {
      content = content.replace(r.regexSearch, r.replace);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
  }
}

// 1. Auth Flow
updateFile('LoginScreen.js', [
  { search: `<TouchableOpacity>`, replace: `<TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>` }, // for SignupLink
  { search: `<TouchableOpacity style={styles.forgotPasswordContainer}>`, replace: `<TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ResetPasswordEmailScreen')}>` }
]);

updateFile('RegisterScreen.js', [
  { search: `title="Continuer"`, replace: `title="Continuer" onPress={() => navigation.navigate('VerificationScreen')}` }
]);

updateFile('VerificationScreen.js', [
  { search: `title="Vérifier"`, replace: `title="Vérifier" onPress={() => navigation.navigate('PinCodeScreen')}` }
]);

updateFile('PinCodeScreen.js', [
  { search: `title="Valider"`, replace: `title="Valider" onPress={() => navigation.navigate('SuccessScreen')}` }
]);

updateFile('SuccessScreen.js', [
  { search: `title="Aller à l'accueil"`, replace: `title="Aller à l'accueil" onPress={() => navigation.navigate('HomeScreen')}` }
]);

updateFile('ResetPasswordEmailScreen.js', [
  { search: `title="Envoyer le code"`, replace: `title="Envoyer le code" onPress={() => navigation.navigate('ResetPasswordCodeScreen')}` }
]);

updateFile('ResetPasswordCodeScreen.js', [
  { search: `title="Vérifier le code"`, replace: `title="Vérifier le code" onPress={() => navigation.navigate('ResetPasswordFinalScreen')}` }
]);

updateFile('ResetPasswordFinalScreen.js', [
  { search: `title="Réinitialiser"`, replace: `title="Réinitialiser" onPress={() => navigation.navigate('LoginScreen')}` }
]);

// 2. Home Actions
updateFile('HomeScreen.js', [
  { search: `title="Recharger" icon="add"`, replace: `title="Recharger" icon="add" onPress={() => navigation.navigate('TopUpScreen')}` },
  { search: `title="Retirer" icon="arrow-up"`, replace: `title="Retirer" icon="arrow-up" onPress={() => navigation.navigate('WithdrawFundsScreen')}` },
  { search: `title="Envoyer" icon="paper-plane-outline"`, replace: `title="Envoyer" icon="paper-plane-outline" onPress={() => navigation.navigate('SendMoneyScreen')}` },
  { search: `title="Payer" icon="scan"`, replace: `title="Payer" icon="scan" onPress={() => navigation.navigate('CashierScanScreen')}` }
]);

// 3. Shops Flow
updateFile('ShopsScreen.js', [
  { search: `<TouchableOpacity style={styles.shopCard}>`, replace: `<TouchableOpacity style={styles.shopCard} onPress={() => navigation.navigate('ShopDetailsScreen')}>` }
]);

updateFile('ShopDetailsScreen.js', [
  { search: `<TouchableOpacity style={styles.categoryItem}>`, replace: `<TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('ShopProductsScreen')}>` },
  { search: `<TouchableOpacity style={styles.seeAllBtn}>`, replace: `<TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('ShopProductsScreen')}>` }
]);

updateFile('ShopProductsScreen.js', [
  { search: `<TouchableOpacity style={styles.productCard}>`, replace: `<TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate('ProductDetailsScreen')}>` }
]);

updateFile('ProductDetailsScreen.js', [
  { search: `title="Acheter"`, replace: `title="Acheter" onPress={() => navigation.navigate('OrderVerificationScreen')}` }
]);

updateFile('OrderVerificationScreen.js', [
  { search: `title="Payer"`, replace: `title="Payer" onPress={() => navigation.navigate('OrderConfirmationScreen')}` }
]);

updateFile('OrderConfirmationScreen.js', [
  { search: `title="Valider la transaction"`, replace: `title="Valider la transaction" onPress={() => navigation.navigate('PaymentInProgressScreen')}` },
  { search: `title="Valider"`, replace: `title="Valider" onPress={() => navigation.navigate('PaymentInProgressScreen')}` }
]);

updateFile('PaymentInProgressScreen.js', [
  { search: `alert("Redirection")`, replace: `navigation.navigate('PaymentSuccessScreen')` },
  { search: `title="Simuler finalisation"`, replace: `title="Simuler finalisation" onPress={() => navigation.navigate('PaymentSuccessScreen')}` }
]);

updateFile('PaymentSuccessScreen.js', [
  { search: `title="Retour à l'accueil"`, replace: `title="Retour à l'accueil" onPress={() => navigation.navigate('HomeScreen')}` },
  { search: `title="Aller à l'accueil"`, replace: `title="Aller à l'accueil" onPress={() => navigation.navigate('HomeScreen')}` }
]);

// 4. Send Money
updateFile('SendMoneyScreen.js', [
  { search: `title="Continuer"`, replace: `title="Continuer" onPress={() => navigation.navigate('SendMoneyMethodScreen')}` }
]);

updateFile('SendMoneyMethodScreen.js', [
  { search: `title="Continuer"`, replace: `title="Continuer" onPress={() => navigation.navigate('SendMoneySummaryScreen')}` }
]);

updateFile('SendMoneySummaryScreen.js', [
  { search: `title="Envoyer"`, replace: `title="Envoyer" onPress={() => navigation.navigate('SendMoneyPinScreen')}` },
  { search: `title="Confirmer"`, replace: `title="Confirmer" onPress={() => navigation.navigate('SendMoneyPinScreen')}` }
]);

updateFile('SendMoneyPinScreen.js', [
  { search: `title="Valider"`, replace: `title="Valider" onPress={() => navigation.navigate('SendMoneySuccessScreen')}` }
]);

updateFile('SendMoneySuccessScreen.js', [
  { search: `title="Retour à l'accueil"`, replace: `title="Retour à l'accueil" onPress={() => navigation.navigate('HomeScreen')}` }
]);

// 5. Withdraw
updateFile('WithdrawFundsScreen.js', [
  { search: `title="Continuer"`, replace: `title="Continuer" onPress={() => navigation.navigate('WithdrawFundsMethodScreen')}` }
]);

updateFile('WithdrawFundsMethodScreen.js', [
  { search: `title="Continuer"`, replace: `title="Continuer" onPress={() => navigation.navigate('WithdrawFundsMobileMoneyProcessingScreen')}` }
]);

updateFile('WithdrawFundsMobileMoneyProcessingScreen.js', [
  { search: `title="Continuer"`, replace: `title="Continuer" onPress={() => navigation.navigate('WithdrawFundsMobileMoneySummaryScreen')}` }
]);

updateFile('WithdrawFundsMobileMoneySummaryScreen.js', [
  { search: `title="Confirmer"`, replace: `title="Confirmer" onPress={() => navigation.navigate('WithdrawFundsMobileMoneySuccessScreen')}` }
]);

updateFile('WithdrawFundsMobileMoneySuccessScreen.js', [
  { search: `title="Retour à l'accueil"`, replace: `title="Retour à l'accueil" onPress={() => navigation.navigate('HomeScreen')}` }
]);

// 6. Cash Register
updateFile('CashRegisterScreen.js', [
  { search: `title="Payer"`, replace: `title="Payer" onPress={() => navigation.navigate('CashierScanScreen')}` },
  { search: `title="Envoyer"`, replace: `title="Envoyer" onPress={() => navigation.navigate('CashierSendFundsScreen')}` }
]);

updateFile('CashierScanScreen.js', [
  { search: `title="Simuler Paiement"`, replace: `title="Simuler Paiement" onPress={() => navigation.navigate('CashierSuccessScreen')}` }
]);

updateFile('CashierSuccessScreen.js', [
  { search: `title="Nouvelle transaction"`, replace: `title="Nouvelle transaction" onPress={() => navigation.navigate('CashRegisterScreen')}` },
  { search: `title="Retour à la caisse"`, replace: `title="Retour à la caisse" onPress={() => navigation.navigate('CashRegisterScreen')}` }
]);

// 7. Top Up
updateFile('TopUpScreen.js', [
  { search: `title="Recharger"`, replace: `title="Recharger" onPress={() => navigation.navigate('TopUpDetailsScreen')}` }
]);

updateFile('TopUpDetailsScreen.js', [
  { search: `title="Continuer"`, replace: `title="Continuer" onPress={() => navigation.navigate('TopUpSummaryScreen')}` }
]);

updateFile('TopUpSummaryScreen.js', [
  { search: `title="Confirmer et Payer"`, replace: `title="Confirmer et Payer" onPress={() => navigation.navigate('TopUpPaymentScreen')}` },
  { search: `title="Confirmer"`, replace: `title="Confirmer" onPress={() => navigation.navigate('TopUpPaymentScreen')}` } // Wait, there's a screen TopUpPaymentScreen or TopUpWalletConfirmationScreen ?
]);

console.log('Wiring complete.');
