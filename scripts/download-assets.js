const fs = require('fs');
const path = require('path');
const https = require('https');

const baseDir = path.join(__dirname, '..', 'assets');

const directories = ['cryptos', 'flags', 'avatars', 'shops', 'products'];
directories.forEach(d => {
  const dirPath = path.join(baseDir, d);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, filepath).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

const assetsToDownload = [
  // Cryptos
  { url: 'https://cryptologos.cc/logos/tether-usdt-logo.png', dest: 'cryptos/usdt.png' },
  { url: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', dest: 'cryptos/usdc.png' },
  { url: 'https://cryptologos.cc/logos/euro-coin-eurc-logo.png', dest: 'cryptos/eurc.png' },
  { url: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', dest: 'cryptos/btc.png' },
  { url: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png', dest: 'cryptos/wbtc.png' },
  { url: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', dest: 'cryptos/eth.png' },
  { url: 'https://cryptologos.cc/logos/solana-sol-logo.png', dest: 'cryptos/sol.png' },
  { url: 'https://cryptologos.cc/logos/polygon-matic-logo.png', dest: 'cryptos/pol.png' },
  { url: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', dest: 'cryptos/bnb.png' },

  // Flags
  { url: 'https://flagcdn.com/w80/gh.png', dest: 'flags/gh.png' },
  { url: 'https://flagcdn.com/w80/tg.png', dest: 'flags/tg.png' },
  { url: 'https://flagcdn.com/w80/ng.png', dest: 'flags/ng.png' },
  { url: 'https://flagcdn.com/w80/sn.png', dest: 'flags/sn.png' },
  { url: 'https://flagcdn.com/w80/ci.png', dest: 'flags/ci.png' },
  { url: 'https://flagcdn.com/w80/ke.png', dest: 'flags/ke.png' },
  { url: 'https://flagcdn.com/w80/ml.png', dest: 'flags/ml.png' },
  { url: 'https://flagcdn.com/w80/bf.png', dest: 'flags/bf.png' },
  { url: 'https://flagcdn.com/w80/fr.png', dest: 'flags/fr.png' },

  // Avatars
  { url: 'https://i.pravatar.cc/150?img=11', dest: 'avatars/avatar1.jpg' },
  { url: 'https://i.pravatar.cc/150?img=5', dest: 'avatars/avatar2.jpg' },
  { url: 'https://i.pravatar.cc/150?img=12', dest: 'avatars/avatar3.jpg' },
  { url: 'https://i.pravatar.cc/150?img=9', dest: 'avatars/avatar4.jpg' },
  { url: 'https://i.pravatar.cc/150?img=14', dest: 'avatars/avatar5.jpg' },
  { url: 'https://randomuser.me/api/portraits/men/32.jpg', dest: 'avatars/david.jpg' },
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80', dest: 'avatars/kemi.jpg' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', dest: 'avatars/joseph.jpg' },
];

async function run() {
  console.log('Downloading offline assets...');
  for (const item of assetsToDownload) {
    const destPath = path.join(baseDir, item.dest);
    try {
      await download(item.url, destPath);
      console.log(`Downloaded ${item.dest}`);
    } catch (err) {
      console.error(`Failed to download ${item.url}: ${err.message}`);
    }
  }
  console.log('Finished downloading offline assets.');
}

run();
