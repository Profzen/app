import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const STABLECOINS = [
  { symbol: 'USDC', image: require('../../assets/cryptos/usdc.png') },
  { symbol: 'USDT', image: require('../../assets/cryptos/usdt.png') },
  { symbol: 'EURC', image: require('../../assets/cryptos/eurc.png') },
];

// Each account receives an overview/benefits page followed by its own features.
// Visuals are native UI illustrations: no Bitcoin, DZ or unsupported crypto art.
const CONTENT = {
  diaspora: {
    label: ['diasporaLabel', 'AFRICAN DIASPORA'], title: ['diasporaTitle', 'Support your loved ones in Africa, directly'],
    benefits: [['diasporaBenefit', 'Pay for what your family needs from abroad.']],
    features: [
      ['diasporaShop', 'Buy locally, from abroad', 'Buy what your family needs from African merchants.', 'storefront-outline', 'store'],
      ['diasporaBills', 'Cover everyday needs', 'Pay Bills, gifts and services for loved ones back home.', 'receipt-outline', 'bills'],
      ['diasporaTrack', 'One DZYwallet for your support', 'Use USDC, USDT or EURC and follow your payments in one place.', 'wallet-outline', 'wallet'],
    ],
    visual: 'store',
  },
  africanPersonal: {
    label: ['africanPersonalLabel', 'USER IN AFRICA'], title: ['africanPersonalTitle', 'Your money, beyond borders'],
    benefits: [['financialFreedom', 'A DZYwallet in USDC, USDT and EURC.'], ['globalInclusion', 'Pay, shop and receive from family abroad.']],
    features: [
      ['africanShop', 'Pay and shop locally', 'Pay Bills, buy airtime and shop from local merchants.', 'bag-handle-outline', 'store'],
      ['africanWealth', 'Keep value in stablecoins', 'Manage USDC, USDT and EURC in your DZYwallet.', 'wallet-outline', 'wallet'],
      ['africanReceive', 'Receive from family abroad', 'Receive support from family abroad, with no DizzitUp fees between members.', 'people-outline', 'wallet'],
    ],
    visual: 'wallet',
  },
  africanBusiness: {
    label: ['africanBusinessLabel', 'AFRICAN BUSINESS'], title: ['africanBusinessTitle', 'Grow your business beyond borders'],
    benefits: [['expandedBusiness', 'Create your DZYstore and sell globally.'], ['globalInclusion', 'Get paid in stablecoins and track your sales.']],
    features: [
      ['businessSell', 'Open your DZYstore', 'Create your DZYstore in 5 minutes, for free, and sell globally.', 'storefront-outline', 'store'],
      ['businessPaid', 'Get paid with DZYpaylink', 'Share a payment link or invoice for USDC, USDT or EURC.', 'link-outline', 'paylink'],
      ['businessTreasury', 'Manage your treasury', 'Get paid worldwide in USDC, USDT or EURC, and follow every sale and payout in one DZYwallet.', 'wallet-outline', 'treasury'],
    ],
    visual: 'store',
  },
  globalBusiness: {
    label: ['globalBusinessLabel', 'GLOBAL BUSINESS'], title: ['globalBusinessTitle', 'Source from Africa with confidence'],
    benefits: [['vettedBusinesses', 'Connect with African merchants and businesses.'], ['secureTerms', 'Pay with stablecoins or card, securely.']],
    features: [
      ['globalSource', 'Find African partners', 'Discover merchants, freelancers and businesses on DizzitUp.', 'search-outline', 'store'],
      ['globalBuy', 'Buy with confidence', 'Source products and services across Africa securely.', 'shield-checkmark-outline', 'store'],
      ['globalPay', 'Choose how to pay', 'Use the available payment method and terms that suit your purchase.', 'card-outline', 'wallet'],
    ],
    visual: 'store',
  },
};

const VISUAL_META = {
  store: { icon: 'storefront-outline', label: 'DZYstore' },
  bills: { icon: 'receipt-outline', label: 'Pay Bills' },
  wallet: { icon: 'wallet-outline', label: 'DZYwallet' },
  paylink: { icon: 'link-outline', label: 'DZYpaylink' },
  treasury: { icon: 'analytics-outline', label: 'DZYwallet' },
  rewards: { icon: 'gift-outline', label: 'DZY Rewards' },
};

function SlideVisual({ kind, icon, t }) {
  const visual = VISUAL_META[kind] || VISUAL_META.wallet;
  const label = kind === 'bills' ? t('preHome.payBillsLabel', visual.label)
    : kind === 'rewards' ? t('preHome.rewardsLabel', visual.label)
      : visual.label;
  return (
    <LinearGradient colors={['#172D51', '#234677']} style={styles.visual}>
      <View style={styles.visualHeader}>
        <Text style={styles.visualBrand}>DizzitUp</Text>
        <Ionicons name="sparkles-outline" size={18} color="#FFC759" />
      </View>
      <View style={styles.visualCard}>
        <View style={styles.visualIcon}><Ionicons name={icon || visual.icon} size={42} color="#172D51" /></View>
        <Text style={styles.visualLabel}>{label}</Text>
        <View style={styles.visualDivider} />
        <View style={styles.coinRow}>
          {STABLECOINS.map(coin => (
            <View key={coin.symbol} style={styles.coinChip}>
              <Image source={coin.image} style={styles.coinIcon} resizeMode="contain" />
              <Text style={styles.coinText}>{coin.symbol}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.visualBottom}><View style={styles.visualBottomLine} /><View style={styles.visualBottomLineShort} /></View>
    </LinearGradient>
  );
}

export default function PreHomeSlidesScreen({ profile = 'africanPersonal', onComplete }) {
  const { t } = useApp();
  const { width } = useWindowDimensions();
  const pager = useRef(null);
  const [page, setPage] = useState(0);
  const content = CONTENT[profile] || CONTENT.africanPersonal;
  const slides = [
    { id: 'overview', title: content.title, visual: content.visual, benefits: content.benefits },
    ...content.features.map(([key, title, body, icon, visual]) => ({ id: key, title: [`${key}Title`, title], body: [`${key}Body`, body], icon, visual })),
    { id: 'rewards', title: ['rewardsTitle', 'Earn DZY rewards'], body: ['rewardsBody', 'Earn DZY rewards as you use DizzitUp (pre-TGE).'], visual: 'rewards' },
  ];
  const translate = ([key, fallback]) => t(`preHome.${key}`, fallback);
  const next = () => {
    if (page === slides.length - 1) return onComplete?.();
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
      <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => setPage(Math.max(0, Math.min(Math.round(event.nativeEvent.contentOffset.x / width), slides.length - 1)))}>
        {slides.map(slide => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <View style={styles.imageFrame}>
              <SlideVisual kind={slide.visual} icon={slide.icon} t={t} />
            </View>
            <Text style={styles.audience}>{translate(content.label)}</Text>
            <Text style={styles.title}>{translate(slide.title)}</Text>
            {slide.body && <Text style={styles.body}>{translate(slide.body)}</Text>}
            {slide.benefits && <View style={styles.benefits}>{slide.benefits.map(benefit => (
              <View key={benefit[0]} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color="#19A97C" />
                <Text style={styles.benefitText}>{translate(benefit)}</Text>
              </View>
            ))}</View>}
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>{slides.map((slide, index) => <View key={slide.id} style={[styles.dot, page === index && styles.activeDot]} />)}</View>
        <TouchableOpacity onPress={next} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>{page === slides.length - 1 ? t('preHome.explore', 'Explore DizzitUp') : t('preHome.next', 'Next')}</Text>
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
  imageFrame: { width: '100%', height: '48%', maxHeight: 330, borderRadius: 24, overflow: 'hidden', backgroundColor: '#172D51', justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 3 },
  visual: { width: '100%', height: '100%', padding: 18, justifyContent: 'space-between' },
  visualHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  visualBrand: { color: '#FFFFFF', fontSize: 15, fontFamily: 'SpaceGrotesk_700Bold' },
  visualCard: { backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 20, paddingHorizontal: 14, alignItems: 'center', marginHorizontal: 12 },
  visualIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: '#FFF3CF', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  visualLabel: { color: '#172D51', fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold', textAlign: 'center' },
  visualDivider: { height: 1, backgroundColor: '#E7EBF2', alignSelf: 'stretch', marginVertical: 16 },
  coinRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  coinChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F4F7FA', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 6 },
  coinIcon: { width: 17, height: 17 },
  coinText: { color: '#243956', fontSize: 10, fontFamily: 'Inter_700Bold' },
  visualBottom: { flexDirection: 'row', gap: 6, alignSelf: 'center' },
  visualBottomLine: { height: 4, width: 44, borderRadius: 2, backgroundColor: '#FFC759' },
  visualBottomLineShort: { height: 4, width: 18, borderRadius: 2, backgroundColor: '#6786AD' },
  audience: { color: '#AE7813', fontSize: 11, letterSpacing: 1.2, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  title: { color: '#1A2840', fontSize: 25, lineHeight: 31, textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 11 },
  body: { color: '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center', fontFamily: 'Inter_400Regular', maxWidth: 340 },
  benefits: { alignSelf: 'stretch', marginTop: 6, gap: 8 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  benefitText: { color: '#475569', fontSize: 13, fontFamily: 'Inter_500Medium', flexShrink: 1 },
  footer: { paddingHorizontal: 24, paddingBottom: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CBD5E1' },
  activeDot: { width: 22, backgroundColor: '#FFC759' },
  button: { height: 54, borderRadius: 16, backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { color: '#FFC759', fontSize: 15, fontFamily: 'SpaceGrotesk_700Bold' },
});
