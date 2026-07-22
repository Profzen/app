import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

const localLogos = {
  USDT: require('../../assets/cryptos/usdt.png'),
  USDC: require('../../assets/cryptos/usdc.png'),
  EURC: require('../../assets/cryptos/eurc.png'),
  BTC: require('../../assets/cryptos/btc.png'),
  WBTC: require('../../assets/cryptos/wbtc.png'),
  ETH: require('../../assets/cryptos/eth.png'),
  SOL: require('../../assets/cryptos/sol.png'),
  POL: require('../../assets/cryptos/pol.png'),
  Polygon: require('../../assets/cryptos/pol.png'),
  BNB: require('../../assets/cryptos/bnb.png'),
};

export default function CryptoIcon({ symbol, size = 36, style: customStyle }) {
  const iconStyle = { width: size, height: size, borderRadius: size / 2 };
  if (symbol === 'DZY') return <Image source={require('../../dizzitup logo cercle.png')} style={[iconStyle, customStyle]} resizeMode="cover" />;
  if (localLogos[symbol]) return <Image source={localLogos[symbol]} style={[iconStyle, customStyle]} resizeMode="contain" />;
  return <View style={[styles.fallback, iconStyle, customStyle]}><Text style={styles.text}>{symbol?.slice(0, 1)}</Text></View>;
}

const styles = StyleSheet.create({ fallback: { backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center' }, text: { color: '#FFC759', fontFamily: 'Inter_700Bold' } });
