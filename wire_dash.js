const fs = require('fs');
const path = 'g:/zen/projets/DizzitApp/app/src/screens/DashboardScreen.js';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/<TouchableOpacity style=\{styles\.rechargerBtn\}>/g, '<TouchableOpacity style={styles.rechargerBtn} onPress={() => navigation.navigate(\'TopUpScreen\')}>');

c = c.replace(/<TouchableOpacity style=\{styles\.actionItem\}>([^]+?)Envoyer/g, '<TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate(\'SendMoneyScreen\')}>$1Envoyer');
c = c.replace(/<TouchableOpacity style=\{styles\.actionItem\}>([^]+?)Recevoir/g, '<TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate(\'ReceiveFundsScreen\')}>$1Recevoir');
c = c.replace(/<TouchableOpacity style=\{styles\.actionItem\}>([^]+?)Convertir/g, '<TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate(\'SwapTokensScreen\')}>$1Convertir');
c = c.replace(/<TouchableOpacity style=\{styles\.actionItemDisabled\}>/g, '<TouchableOpacity style={styles.actionItemDisabled} onPress={() => navigation.navigate(\'WithdrawFundsScreen\')}>');
c = c.replace(/<TouchableOpacity>\s*<Text style=\{styles\.voirTout\}>/g, '<TouchableOpacity onPress={() => navigation.navigate(\'AssetListScreen\')}><Text style={styles.voirTout}>');

fs.writeFileSync(path, c, 'utf8');
console.log('DashboardScreen.js updated');
