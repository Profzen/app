const fs = require('fs');

const filesToFix = [
  {
    file: 'g:/zen/projets/DizzitApp/app/src/screens/WithdrawFundsMethodScreen.js',
    target: "navigation.navigate('WithdrawFundsMobileMoneySummaryScreen')"
  },
  {
    file: 'g:/zen/projets/DizzitApp/app/src/screens/WithdrawFundsMobileMoneySummaryScreen.js',
    target: "navigation.navigate('WithdrawFundsMobileMoneyProcessingScreen')"
  },
  {
    file: 'g:/zen/projets/DizzitApp/app/src/screens/WithdrawFundsMobileMoneySuccessScreen.js',
    target: "navigation.navigate('DashboardScreen')"
  },
  {
    file: 'g:/zen/projets/DizzitApp/app/src/screens/OrderVerificationScreen.js',
    target: "navigation.navigate('OrderConfirmationScreen')"
  }
];

filesToFix.forEach(({ file, target }) => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/navigation\.navigate\(''\)/g, target);
  fs.writeFileSync(file, c, 'utf8');
});

console.log('Fixed empty navigates');
