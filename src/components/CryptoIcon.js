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
  const iconStyle = { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' };
  if (!symbol) return null;
  const upper = String(symbol).trim().toUpperCase();
  if (upper === 'DZY' || upper === 'DIZZY') {
    return <Image source={require('../../assets/brand/finalLogo_512x512.png')} style={[iconStyle, customStyle]} resizeMode="contain" />;
  }
  if (localLogos[symbol]) {
    return <Image source={localLogos[symbol]} style={[iconStyle, customStyle]} resizeMode="contain" />;
  }
  // Try case-insensitive lookup
  const matchedKey = Object.keys(localLogos).find((k) => k.toLowerCase() === symbol.toLowerCase());
  if (matchedKey) {
    return <Image source={localLogos[matchedKey]} style={[iconStyle, customStyle]} resizeMode="contain" />;
  }
  return (
    <View style={[styles.fallback, iconStyle, customStyle]}>
      <Text style={styles.text}>{symbol?.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFC759', fontFamily: 'Inter_700Bold' },
});

