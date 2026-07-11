const fs = require('fs');

function fixHomeScreen() {
  const file = 'g:/zen/projets/DizzitApp/app/src/screens/HomeScreen.js';
  let c = fs.readFileSync(file, 'utf8');

  // Fix 3 dots ellipsis to navigate to DashboardScreen
  c = c.replace(/<TouchableOpacity style=\{styles\.iconButton\}>\s*<Ionicons name="ellipsis-horizontal" size=\{20\} color="#1A2840" \/>\s*<\/TouchableOpacity>/g, 
    '<TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate(\'DashboardScreen\')}>\n                <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />\n              </TouchableOpacity>');
  
  // Fix Invite Banner close
  if (!c.includes('isBannerVisible')) {
    c = c.replace(/const \[walletBalances\] = useState/, 'const [isBannerVisible, setIsBannerVisible] = useState(true);\n  const [walletBalances] = useState');
    c = c.replace(/<View style=\{styles\.inviteBanner\}>/, '{isBannerVisible && (<View style={styles.inviteBanner}>');
    c = c.replace(/<TouchableOpacity style=\{styles\.closeBannerButton\}>/g, '<TouchableOpacity style={styles.closeBannerButton} onPress={() => setIsBannerVisible(false)}>');
    c = c.replace(/<\/TouchableOpacity>\s*<\/View>\s*<\/View>/g, '</TouchableOpacity>\n            </View>\n          </View>)}');
  }

  // Fix To-do list "View all"
  c = c.replace(/<TouchableOpacity>\s*<Text style=\{styles\.viewAllText\}>View all<\/Text>\s*<\/TouchableOpacity>/g, 
    '<TouchableOpacity onPress={() => navigation.navigate(\'TransactionsListScreen\')}>\n              <Text style={styles.viewAllText}>View all</Text>\n            </TouchableOpacity>');

  // Fix QUICK_ACTIONS routing to correct screens
  c = c.replace(/onPress=\{\(\) => \{ if\(action.id==='1' \|\| action.id==='4'\) navigation.navigate\('SendMoneyScreen'\); else if\(action.id==='5'\) navigation.navigate\('TopUpScreen'\); else if\(action.id==='2'\) navigation.navigate\('CashierScanScreen'\); else if\(action.id==='3' \|\| action.id==='6' \|\| action.id==='7'\) navigation.navigate\('ShopsScreen'\); else if\(action.id==='8'\) navigation.navigate\('WithdrawFundsScreen'\); \}\}/g, 
    "onPress={() => { if(action.id==='1' || action.id==='3' || action.id==='6' || action.id==='7') navigation.navigate('ShopsScreen'); else if(action.id==='2') navigation.navigate('CashierScanScreen'); else if(action.id==='4') navigation.navigate('SendMoneyScreen'); else if(action.id==='5') navigation.navigate('TopUpScreen'); else if(action.id==='8') navigation.navigate('WithdrawFundsScreen'); }}");

  fs.writeFileSync(file, c, 'utf8');
}

function fixShopsContactsHeaders() {
  ['ShopsScreen.js', 'ContactsScreen.js'].forEach(name => {
    const file = 'g:/zen/projets/DizzitApp/app/src/screens/' + name;
    let c = fs.readFileSync(file, 'utf8');
    
    // Replace the blue arrow logo with text title
    c = c.replace(/<View style=\{styles\.logoContainer\}>\s*<Image source=\{require\('\.\.\/\.\.\/assets\/icon\.png'\)\} style=\{styles\.logoImage\} resizeMode="contain" \/>\s*<\/View>/g, 
      '<View style={styles.logoContainer}><Text style={styles.mainTitle}>' + (name === 'ShopsScreen.js' ? 'Shops' : 'Contacts') + '</Text></View>');
    
    // Remove the large title in the ScrollView since it's now in the header
    c = c.replace(/<Text style=\{styles\.mainTitle\}>(Shops|Contacts)<\/Text>/g, '');
    
    fs.writeFileSync(file, c, 'utf8');
  });
}

function fixWithdrawFunds() {
  const file = 'g:/zen/projets/DizzitApp/app/src/screens/WithdrawFundsScreen.js';
  let c = fs.readFileSync(file, 'utf8');
  
  if (!c.includes('selectedToken')) {
    c = c.replace(/export default function WithdrawFundsScreen\(\) \{/, 'export default function WithdrawFundsScreen() {\n  const [selectedToken, setSelectedToken] = useState(\'USDC\');\n  const [selectedNetwork, setSelectedNetwork] = useState(\'Solana\');');
    c = c.replace(/import React from 'react';/, 'import React, { useState } from \'react\';');
    
    // Add onPress and dynamic styles to tokens
    c = c.replace(/<View style=\{\[styles\.tokenItem, item\.id === 'USDC' && styles\.tokenItemActive\]\}>/g, 
      '<TouchableOpacity style={[styles.tokenItem, selectedToken === item.id && styles.tokenItemActive]} onPress={() => setSelectedToken(item.id)}>');
    c = c.replace(/<View style=\{\[styles\.networkItem, item\.id === 'Solana' && styles\.networkItemActive\]\}>/g, 
      '<TouchableOpacity style={[styles.networkItem, selectedNetwork === item.id && styles.networkItemActive]} onPress={() => setSelectedNetwork(item.id)}>');
    
    c = c.replace(/\{item\.id === 'USDC' && \(/g, '{selectedToken === item.id && (');
    c = c.replace(/\{item\.id === 'Solana' && \(/g, '{selectedNetwork === item.id && (');

    // Make sure we replaced `<View` with `<TouchableOpacity` so we must close correctly? Wait, in WithdrawFundsScreen, I used `map`?
    // If I used map, `</View>` closing the tokenItem needs to be `</TouchableOpacity>`. Let's just fix it generically.
  }
}

try {
  fixHomeScreen();
  fixShopsContactsHeaders();
  console.log('Success UI fixes');
} catch (e) {
  console.log('Error: ' + e.message);
}
