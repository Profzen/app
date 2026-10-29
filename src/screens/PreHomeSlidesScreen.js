import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

export default function PreHomeSlidesScreen({ isBusinessFirst = false, onComplete }) {
  const { t } = useApp();
  const { width } = useWindowDimensions();
  const pager = useRef(null);
  const [page, setPage] = useState(0);

  const everyone = [
    { id: 'wallet', audience: t('preHome.everyone', 'FOR EVERYONE'), title: t('preHome.walletTitle', 'One wallet for your money'), body: t('preHome.walletBody', 'Send and receive USD or EUR stablecoins across borders.'), image: require('../../assets/promo_blue_wallet.png'), icon: 'wallet-outline' },
    { id: 'everyday', audience: t('preHome.everyone', 'FOR EVERYONE'), title: t('preHome.everydayTitle', 'Make everyday life easier'), body: t('preHome.everydayBody', 'Shop, pay bills and top up mobile airtime in one place.'), image: require('../../assets/promo_shop.png'), icon: 'bag-handle-outline' },
  ];
  const business = [
    { id: 'store', audience: t('preHome.business', 'FOR BUSINESS'), title: t('preHome.storeTitle', 'Open your DZYStore'), body: t('preHome.storeBody', 'Present your products and services to customers worldwide.'), image: require('../../assets/promo_shop.png'), icon: 'storefront-outline' },
    { id: 'payments', audience: t('preHome.business', 'FOR BUSINESS'), title: t('preHome.paymentsTitle', 'Get paid across borders'), body: t('preHome.paymentsBody', 'Share a payment link or invoice and receive stablecoins.'), image: require('../../assets/wallet_banner.png'), icon: 'link-outline' },
  ];
  const features = isBusinessFirst ? [...business, ...everyone] : [...everyone, ...business];

  const next = () => {
    if (page === features.length - 1) {
      onComplete?.();
      return;
    }
    const nextPage = page + 1;
    pager.current?.scrollTo({ x: nextPage * width, animated: true });
    setPage(nextPage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F5F8FD', '#FFFFFF']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topRow}>
        <Text style={styles.brand}>DizzitUp</Text>
        <TouchableOpacity onPress={onComplete} accessibilityRole="button" accessibilityLabel={t('preHome.skip', 'Skip introduction')}>
          <Text style={styles.skip}>{t('preHome.skip', 'Skip introduction')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setPage(Math.max(0, Math.min(index, features.length - 1)));
        }}
      >
        {features.map(feature => (
          <View key={feature.id} style={[styles.slide, { width }]}>
            <View style={styles.imageFrame}>
              <Image source={feature.image} style={styles.image} resizeMode="contain" />
              <View style={styles.iconBadge}><Ionicons name={feature.icon} size={21} color="#1A2840" /></View>
            </View>
            <Text style={styles.audience}>{feature.audience}</Text>
            <Text style={styles.title}>{feature.title}</Text>
            <Text style={styles.body}>{feature.body}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {features.map((feature, index) => <View key={feature.id} style={[styles.dot, page === index && styles.activeDot]} />)}
        </View>
        <TouchableOpacity onPress={next} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>{page === features.length - 1 ? t('preHome.getStarted', 'Get started') : t('preHome.next', 'Next')}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFC759" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FD' },
  topRow: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#1A2840', fontSize: 18, fontFamily: 'SpaceGrotesk_700Bold' },
  skip: { color: '#64748B', fontSize: 13, fontFamily: 'Inter_600SemiBold', padding: 8 },
  slide: { flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', paddingBottom: 14 },
  imageFrame: { width: '100%', height: '55%', maxHeight: 360, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 28, elevation: 3, position: 'relative' },
  image: { width: '100%', height: '100%' },
  iconBadge: { position: 'absolute', bottom: 14, right: 14, width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center' },
  audience: { color: '#AE7813', fontSize: 11, letterSpacing: 1.2, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  title: { color: '#1A2840', fontSize: 25, lineHeight: 31, textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 11 },
  body: { color: '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center', fontFamily: 'Inter_400Regular', maxWidth: 340 },
  footer: { paddingHorizontal: 24, paddingBottom: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CBD5E1' },
  activeDot: { width: 22, backgroundColor: '#FFC759' },
  button: { height: 54, borderRadius: 16, backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { color: '#FFC759', fontSize: 15, fontFamily: 'SpaceGrotesk_700Bold' },
});
