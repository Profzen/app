import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

const localLogos = {
  USDT: require('../../assets/cryptos/usdt.png'),
  usdt: require('../../assets/cryptos/usdt.png'),
  USDC: require('../../assets/cryptos/usdc.png'),
  usdc: require('../../assets/cryptos/usdc.png'),
  'USDC.e': require('../../assets/cryptos/usdc.png'),
  'USDC.E': require('../../assets/cryptos/usdc.png'),
  EURC: require('../../assets/cryptos/EURC-icon.png'),
  eurc: require('../../assets/cryptos/EURC-icon.png'),
  BTC: require('../../assets/cryptos/btc.png'),
  WBTC: require('../../assets/cryptos/wrapped-bitcoin.png'),
  'wrapped-bitcoin': require('../../assets/cryptos/wrapped-bitcoin.png'),
  ETH: require('../../assets/cryptos/eth.png'),
  WETH: require('../../assets/cryptos/wrapped-ether-weth-seeklogo.png'),
  'wrapped-ether': require('../../assets/cryptos/wrapped-ether-weth-seeklogo.png'),
  Ethereum: require('../../assets/cryptos/ethereum.png'),
  ethereum: require('../../assets/cryptos/ethereum.png'),
  SOL: require('../../assets/cryptos/solana.png'),
  Solana: require('../../assets/cryptos/solana.png'),
  solana: require('../../assets/cryptos/solana.png'),
  MATIC: require('../../assets/cryptos/pol.png'),
  POL: require('../../assets/cryptos/pol.png'),
  WPOL: require('../../assets/cryptos/wrapped-matic.png'),
  'wrapped-matic': require('../../assets/cryptos/wrapped-matic.png'),
  Polygon: require('../../assets/cryptos/pol.png'),
  polygon: require('../../assets/cryptos/pol.png'),
  Polygone: require('../../assets/cryptos/pol.png'),
  BASE: require('../../assets/cryptos/base.png'),
  Base: require('../../assets/cryptos/base.png'),
  base: require('../../assets/cryptos/base.png'),
  BNB: require('../../assets/cryptos/bnb-logo.png'),
  bnb: require('../../assets/cryptos/bnb-logo.png'),
  'BNB Chain': require('../../assets/cryptos/bnb-logo.png'),
  'Chaîne BNB': require('../../assets/cryptos/bnb-logo.png'),
  'Chaine BNB': require('../../assets/cryptos/bnb-logo.png'),
  DAI: require('../../assets/cryptos/dai-logo.png'),
  DZY: require('../../assets/brand/finalLogo_512x512.png'),
  dzy: require('../../assets/brand/finalLogo_512x512.png'),
};

export default function CryptoIcon({ symbol, size = 36, style: customStyle }) {
  if (!symbol) return null;
  const upper = String(symbol).trim().toUpperCase();
  const lower = String(symbol).trim().toLowerCase();

  let logoSource = null;
  if (upper === 'DZY' || upper === 'DIZZY') {
    logoSource = require('../../assets/brand/finalLogo_512x512.png');
  } else if (localLogos[symbol]) {
    logoSource = localLogos[symbol];
  } else if (localLogos[upper]) {
    logoSource = localLogos[upper];
  } else if (localLogos[lower]) {
    logoSource = localLogos[lower];
  } else {
    const matchedKey = Object.keys(localLogos).find((k) => k.toLowerCase() === lower);
    if (matchedKey) {
      logoSource = localLogos[matchedKey];
    }
  }

  if (logoSource) {
    return (
      <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, customStyle]}>
        <Image source={logoSource} style={{ width: size, height: size }} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, customStyle]}>
      <Text style={styles.text}>{symbol?.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFC759', fontFamily: 'Inter_700Bold' },
});

