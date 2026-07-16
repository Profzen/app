import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

const logos = { USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png', USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', EURC: 'https://cryptologos.cc/logos/euro-coin-eurc-logo.png', BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', WBTC: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png', ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', SOL: 'https://cryptologos.cc/logos/solana-sol-logo.png', POL: 'https://cryptologos.cc/logos/polygon-matic-logo.png', Polygon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' };

export default function CryptoIcon({ symbol, size = 36, style: customStyle }) {
  const iconStyle = { width: size, height: size, borderRadius: size / 2 };
  if (symbol === 'DZY') return <Image source={require('../../dizzitup logo cercle.png')} style={[iconStyle, customStyle]} resizeMode="cover" />;
  if (logos[symbol]) return <Image source={{ uri: logos[symbol] }} style={[iconStyle, customStyle]} resizeMode="contain" />;
  return <View style={[styles.fallback, iconStyle, customStyle]}><Text style={styles.text}>{symbol?.slice(0, 1)}</Text></View>;
}

const styles = StyleSheet.create({ fallback: { backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center' }, text: { color: '#FFC759', fontFamily: 'Inter_700Bold' } });
