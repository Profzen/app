const fs = require('fs');

function fixCashierSendFunds() {
  const file = 'g:/zen/projets/DizzitApp/app/src/screens/CashierSendFundsScreen.js';
  let c = fs.readFileSync(file, 'utf8');

  // Add states
  if (!c.includes('const [selectedNetwork, setSelectedNetwork]')) {
    c = c.replace(/export default function CashierSendFundsScreen\(\) \{/, 
      "export default function CashierSendFundsScreen() {\n  const [selectedNetwork, setSelectedNetwork] = useState('Polygon');\n  const [selectedToken, setSelectedToken] = useState('USDC');\n  \n  const toggleNetwork = () => setSelectedNetwork(prev => prev === 'Polygon' ? 'Solana' : 'Polygon');\n  const toggleToken = () => setSelectedToken(prev => prev === 'USDC' ? 'USDT' : 'USDC');");
    
    // Replace React import
    c = c.replace(/import React from 'react';/, "import React, { useState } from 'react';");

    // Replace static text
    c = c.replace(/<Text style=\{styles\.dropdownText\}>Polygon<\/Text>/g, "<Text style={styles.dropdownText}>{selectedNetwork}</Text>");
    c = c.replace(/<Text style=\{styles\.dropdownText\}>USDC<\/Text>/g, "<Text style={styles.dropdownText}>{selectedToken}</Text>");

    // Add onPress
    c = c.replace(/<TouchableOpacity style=\{styles\.dropdownInput\}>/g, function(match, offset, string) {
      if (string.substring(offset - 100, offset).includes('RÉSEAU')) {
        return "<TouchableOpacity style={styles.dropdownInput} onPress={toggleNetwork}>";
      }
      if (string.substring(offset - 100, offset).includes('JETON')) {
        return "<TouchableOpacity style={styles.dropdownInput} onPress={toggleToken}>";
      }
      return match;
    });

    fs.writeFileSync(file, c, 'utf8');
  }
}

function fixSwapTokens() {
  const file = 'g:/zen/projets/DizzitApp/app/src/screens/SwapTokensScreen.js';
  let c = fs.readFileSync(file, 'utf8');

  if (!c.includes('const [fromChain, setFromChain]')) {
    c = c.replace(/export default function SwapTokensScreen\(\) \{/, 
      "export default function SwapTokensScreen() {\n  const [fromChain, setFromChain] = useState('Polygon');\n  const [toChain, setToChain] = useState('Solana');\n  const toggleFromChain = () => setFromChain(prev => prev === 'Polygon' ? 'Ethereum' : 'Polygon');\n  const toggleToChain = () => setToChain(prev => prev === 'Solana' ? 'Base' : 'Solana');");
    
    c = c.replace(/import React from 'react';/, "import React, { useState } from 'react';");

    // We have two chainSelector instances
    let count = 0;
    c = c.replace(/<TouchableOpacity style=\{styles\.chainSelector\}>/g, () => {
      count++;
      return count === 1 
        ? "<TouchableOpacity style={styles.chainSelector} onPress={toggleFromChain}>" 
        : "<TouchableOpacity style={styles.chainSelector} onPress={toggleToChain}>";
    });

    count = 0;
    c = c.replace(/<Text style=\{styles\.chainName\}>Polygon<\/Text>/g, () => {
      count++;
      return count === 1 
        ? "<Text style={styles.chainName}>{fromChain}</Text>" 
        : "<Text style={styles.chainName}>{toChain}</Text>";
    });

    fs.writeFileSync(file, c, 'utf8');
  }
}

try {
  fixCashierSendFunds();
  fixSwapTokens();
  console.log('Fixed dropdowns');
} catch (e) {
  console.log('Error:', e.message);
}
