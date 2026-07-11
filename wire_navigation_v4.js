const fs = require('fs');
const path = require('path');
const dir = 'g:/zen/projets/DizzitApp/app/src/screens';

function wire(filename, stylesRegex, targetRoute) {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Exclude buttons that already have onPress navigation
  if (content.includes(`navigation.navigate('${targetRoute}')`)) return;

  const original = content;
  content = content.replace(stylesRegex, `$1 onPress={() => navigation.navigate('${targetRoute}')}$2`);
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Wired ${filename} to -> ${targetRoute}`);
  }
}

// Generic continue buttons
const continueRegex = /(<TouchableOpacity[^>]*style=\{\[?styles\.(continueBtn|btnContinue|btnPrimary)[^}]*\}?)(\s*>)/g;

wire('SendMoneyScreen.js', continueRegex, 'SendMoneyMethodScreen');
wire('SendMoneyMethodScreen.js', continueRegex, 'SendMoneySummaryScreen');
wire('SendMoneySummaryScreen.js', continueRegex, 'SendMoneyPinScreen');
wire('SendMoneyPinScreen.js', continueRegex, 'SendMoneySuccessScreen');
wire('SendMoneySuccessScreen.js', continueRegex, 'HomeScreen');

wire('WithdrawFundsScreen.js', continueRegex, 'WithdrawFundsMethodScreen');
wire('WithdrawFundsMethodScreen.js', continueRegex, 'WithdrawFundsMobileMoneyProcessingScreen');
wire('WithdrawFundsMobileMoneyProcessingScreen.js', continueRegex, 'WithdrawFundsMobileMoneySummaryScreen');
wire('WithdrawFundsMobileMoneySummaryScreen.js', continueRegex, 'WithdrawFundsMobileMoneySuccessScreen');
wire('WithdrawFundsMobileMoneySuccessScreen.js', continueRegex, 'HomeScreen');

wire('TopUpScreen.js', continueRegex, 'TopUpDetailsScreen');
wire('TopUpDetailsScreen.js', continueRegex, 'TopUpSummaryScreen');
wire('TopUpSummaryScreen.js', continueRegex, 'TopUpPaymentScreen');
wire('TopUpPaymentScreen.js', continueRegex, 'PaymentInProgressScreen');

wire('RegisterScreen.js', continueRegex, 'VerificationScreen');
wire('VerificationScreen.js', continueRegex, 'PinCodeScreen');
wire('PinCodeScreen.js', continueRegex, 'SuccessScreen');
wire('SuccessScreen.js', continueRegex, 'HomeScreen');

wire('CashierScanScreen.js', continueRegex, 'CashierSuccessScreen');
wire('CashierSuccessScreen.js', continueRegex, 'CashRegisterScreen');

// Order/Shop
wire('ProductDetailsScreen.js', continueRegex, 'OrderVerificationScreen');
wire('OrderVerificationScreen.js', continueRegex, 'OrderConfirmationScreen');
wire('OrderConfirmationScreen.js', continueRegex, 'PaymentInProgressScreen');
wire('PaymentInProgressScreen.js', continueRegex, 'PaymentSuccessScreen');
wire('PaymentSuccessScreen.js', continueRegex, 'HomeScreen');

console.log('Wiring Pass 4 completed.');
