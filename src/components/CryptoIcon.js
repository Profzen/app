import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

const localLogos = {
  USDT: require('../../assets/cryptos/usdt.png'),
  USDC: require('../../assets/cryptos/usdc.png'),
  EURC: require('../../assets/cryptos/eurc.png'),
  BTC: require('../../assets/cryptos/btc.png'),
  WBTC: require('../../assets/cryptos/wbtc.png'),
  ETH: require('../../assets/cryptos/eth.png'),
  WETH: require('../../assets/cryptos/weth.png'),
  Ethereum: require('../../assets/cryptos/eth.png'),
  SOL: require('../../assets/cryptos/solana.png'),
  Solana: require('../../assets/cryptos/solana.png'),
  MATIC: require('../../assets/cryptos/polygon.png'),
  POL: require('../../assets/cryptos/polygon.png'),
  Polygon: require('../../assets/cryptos/polygon.png'),
  Polygone: require('../../assets/cryptos/polygon.png'),
  BASE: require('../../assets/cryptos/base.png'),
  Base: require('../../assets/cryptos/base.png'),
  BNB: require('../../assets/cryptos/bnb-logo.png'),
  'BNB Chain': require('../../assets/cryptos/bnb-logo.png'),
  'Chaîne BNB': require('../../assets/cryptos/bnb-logo.png'),
  'Chaine BNB': require('../../assets/cryptos/bnb-logo.png'),
  DAI: require('../../assets/cryptos/dai-logo.png'),
};

export default function CryptoIcon({ symbol, size = 36, style: customStyle }) {
  const iconStyle = { width: size, height: size, borderRadius: size / 2 };
  if (!symbol) return null;
  if (symbol === 'DZY' || symbol === 'DIZZY') {
    return <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={[iconStyle, customStyle]} resizeMode="cover" />;
  }
  if (localLogos[symbol]) {
    return <Image source={localLogos[symbol]} style={[iconStyle, customStyle]} resizeMode="contain" />;
  }
  // Try case-insensitive lookup
  const matchedKey = Object.keys(localLogos).find(k => k.toLowerCase() === symbol.toLowerCase());
  if (matchedKey) {
    return <Image source={localLogos[matchedKey]} style={[iconStyle, customStyle]} resizeMode="contain" />;
  }
  return <View style={[styles.fallback, iconStyle, customStyle]}><Text style={styles.text}>{symbol?.slice(0, 1)}</Text></View>;
}

const styles = StyleSheet.create({ fallback: { backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center' }, text: { color: '#FFC759', fontFamily: 'Inter_700Bold' } });
