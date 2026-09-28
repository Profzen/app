import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function WalletIcon({ walletId, size = 28, style }) {
  const normId = (walletId || '').toLowerCase().trim();

  if (normId === 'metamask') {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Svg width={size} height={size} viewBox="0 0 142 137" fill="none">
          <Path fill="#FF5C16" d="m132.24 131.751-30.481-9.076-22.986 13.741-16.038-.007-23-13.734-30.467 9.076L0 100.465l9.268-34.723L0 36.385 9.268 0l47.607 28.443h27.757L132.24 0l9.268 36.385-9.268 29.357 9.268 34.723-9.268 31.286Z" />
          <Path fill="#FF5C16" d="m9.274 0 47.608 28.463-1.893 19.534L9.274 0Zm30.468 100.478 20.947 15.957-20.947 6.24v-22.197Zm19.273-26.381L54.989 48.01l-25.77 17.74-.014-.007v.013l.08 18.26 10.45-9.918h19.28ZM132.24 0 84.632 28.463l1.887 19.534L132.24 0Zm-30.467 100.478-20.948 15.957 20.948 6.24v-22.197Zm10.529-34.723h.007-.007v-.013l-.006.007-25.77-17.739L82.5 74.097h19.272l10.457 9.917.073-18.259Z" />
          <Path fill="#E34807" d="m39.735 122.675-30.467 9.076L0 100.478h39.735v22.197ZM59.008 74.09l5.82 37.714-8.066-20.97-27.49-6.82 10.456-9.923h19.28Zm42.764 48.585 30.468 9.076 9.268-31.273h-39.736v22.197ZM82.5 74.09l-5.82 37.714 8.065-20.97 27.491-6.82-10.463-9.923H82.5Z" />
          <Path fill="#FF8D5D" d="m0 100.465 9.268-34.723h19.93l.073 18.266 27.492 6.82 8.065 20.969-4.146 4.618-20.947-15.957H0v.007Zm141.508 0-9.268-34.723h-19.931l-.073 18.266-27.49 6.82-8.066 20.969 4.145 4.618 20.948-15.957h39.735v.007ZM84.632 28.443H56.875L54.99 47.977l9.839 63.8H76.68l9.845-63.8-1.893-19.534Z" />
          <Path fill="#661800" d="M9.268 0 0 36.385l9.268 29.357h19.93l25.784-17.745L9.268 0Zm43.98 81.665h-9.029l-4.916 4.819 17.466 4.33-3.521-9.155v.006ZM132.24 0l9.268 36.385-9.268 29.357h-19.931L86.526 47.997 132.24 0ZM88.273 81.665h9.042l4.916 4.825-17.486 4.338 3.528-9.17v.007Zm-9.507 42.305 2.06-7.542-4.146-4.618H64.82l-4.145 4.618 2.059 7.542" />
          <Path fill="#C0C4CD" d="M78.766 123.969v12.453H62.735v-12.453h16.03Z" />
          <Path fill="#E7EBF6" d="m39.742 122.662 23.006 13.754v-12.453l-2.06-7.541-20.946 6.24Zm62.031 0-23.007 13.754v-12.453l2.06-7.541 20.947 6.24Z" />
        </Svg>
      </View>
    );
  }

  if (normId === 'binance') {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Svg width={size} height={size} viewBox="0 0 50 50">
          <G>
            <Path
              fill="#F0B90B"
              d="M11.3,25l-5.6,5.6L0,25l5.7-5.7L11.3,25z M25,11.3l9.7,9.7l5.7-5.7L25,0L9.7,15.3l5.7,5.7L25,11.3z M44.3,19.3 L38.7,25l5.7,5.7L50,25L44.3,19.3z M25,38.7L15.3,29l-5.7,5.7L25,50l15.3-15.3L34.7,29L25,38.7z M25,30.6l5.7-5.7L25,19.3L19.3,25 L25,30.6L25,30.6z"
            />
          </G>
        </Svg>
      </View>
    );
  }

  if (normId === 'coinbase') {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <Path
            fill="#0052FF"
            d="M20.032 28.5c-4.705 0-8.516-3.804-8.516-8.5s3.81-8.5 8.516-8.5a8.51 8.51 0 0 1 8.388 7.083H37C36.276 9.857 28.96 3 20.032 3 10.629 3 3 10.615 3 20s7.629 17 17.032 17C28.959 37 36.276 30.143 37 21.417h-8.58a8.51 8.51 0 0 1-8.388 7.083"
          />
        </Svg>
      </View>
    );
  }

  if (normId === 'trust' || normId === 'trustwallet') {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Svg width={size} height={size} viewBox="0 95 356 405" fill="none">
          <Defs>
            <LinearGradient id="Trust_Gradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#48FF91" />
              <Stop offset="30%" stopColor="#0094FF" />
              <Stop offset="70%" stopColor="#0038FF" />
              <Stop offset="100%" stopColor="#0500FF" />
            </LinearGradient>
          </Defs>
          <G>
            <Path fill="#0500FF" d="M0,156.46l177.66-58v401.53C50.76,446.46,0,343.85,0,285.85v-129.38Z" />
            <Path fill="url(#Trust_Gradient)" d="M355.31,156.46l-177.66-58v401.53c126.9-53.54,177.66-156.15,177.66-214.15v-129.38Z" />
          </G>
        </Svg>
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#20365B' }, style]} />
  );
}
