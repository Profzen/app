import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

// Each account receives an overview/benefits page followed by its own features.
const CONTENT = {
  diaspora: {
    label: ['diasporaLabel', 'AFRICAN DIASPORA'], title: ['diasporaTitle', 'Support your loved ones in Africa with peace of mind'],
    benefits: [['diasporaBenefit', 'Stay in control of how your support is used.']],
    features: [
      ['diasporaShop', 'Buy what they need', 'Shop for goods and essentials for loved ones in Africa.', 'bag-handle-outline', require('../../assets/promo_shop.png')],
      ['diasporaBills', 'Cover everyday needs', 'Pay their bills and mobile top-ups directly.', 'receipt-outline', require('../../assets/promo_wallet.png')],
      ['diasporaTrack', 'Follow your support', 'See your payments and purchases in one place.', 'time-outline', require('../../assets/promo_blue_wallet.png')],
    ],
    image: require('../../assets/promo_shop.png'),
  },
  africanPersonal: {
    label: ['africanPersonalLabel', 'AFRICAN ACCOUNT'], title: ['africanPersonalTitle', 'Your money, beyond borders'],
    benefits: [['financialFreedom', 'More financial freedom.'], ['globalInclusion', 'Access to global finance.'], ['yourBank', 'Be your own banker.']],
    features: [
      ['africanShop', 'Shop across Africa', 'Discover and buy from African shops and businesses.', 'bag-handle-outline', require('../../assets/promo_shop.png')],
      ['africanWealth', 'Build digital wealth', 'Manage USD and EUR stablecoins in a borderless wallet.', 'wallet-outline', require('../../assets/promo_blue_wallet.png')],
    ],
    image: require('../../assets/promo_blue_wallet.png'),
  },
  africanBusiness: {
    label: ['africanBusinessLabel', 'AFRICAN BUSINESS'], title: ['africanBusinessTitle', 'Grow your business beyond borders'],
    benefits: [['expandedBusiness', 'Reach more customers worldwide.'], ['globalInclusion', 'Access to global finance.'], ['yourBank', 'Be your own banker.']],
    features: [
      ['businessSell', 'Sell worldwide', 'Showcase your products and services to global customers.', 'storefront-outline', require('../../assets/promo_shop.png')],
      ['businessPaid', 'Get paid across borders', 'Accept USD and EUR stablecoins or supported local mobile money.', 'link-outline', require('../../assets/wallet_banner.png')],
      ['businessSuppliers', 'Pay global suppliers', 'Send stablecoin payments to suppliers across borders.', 'send-outline', require('../../assets/promo_wallet.png')],
      ['businessTreasury', 'Manage your treasury', 'Keep your business funds in a borderless digital wallet.', 'wallet-outline', require('../../assets/promo_blue_wallet.png')],
    ],
    image: require('../../assets/promo_shop.png'),
  },
  globalBusiness: {
    label: ['globalBusinessLabel', 'GLOBAL BUSINESS'], title: ['globalBusinessTitle', 'Source from Africa with confidence'],
    benefits: [['vettedBusinesses', 'Connect with vetted African businesses.'], ['secureTerms', 'Pay securely on terms that work for you.']],
    features: [
      ['globalSource', 'Find African partners', 'Discover vetted merchants, freelancers and businesses.', 'search-outline', require('../../assets/promo_shop.png')],
      ['globalBuy', 'Buy with confidence', 'Source products and services across Africa securely.', 'shield-checkmark-outline', require('../../assets/promo_wallet.png')],
      ['globalPay', 'Choose how to pay', 'Use the available payment method and terms that suit your purchase.', 'card-outline', require('../../assets/wallet_banner.png')],
    ],
    image: require('../../assets/promo_shop.png'),
  },
};

export default function PreHomeSlidesScreen({ profile = 'africanPersonal', onComplete }) {
  const { t } = useApp();
  const { width } = useWindowDimensions();
  const pager = useRef(null);
  const [page, setPage] = useState(0);
  const content = CONTENT[profile] || CONTENT.africanPersonal;
  const slides = [
    { id: 'overview', title: content.title, image: content.image, icon: 'sparkles-outline', benefits: content.benefits },
    ...content.features.map(([key, title, body, icon, image]) => ({ id: key, title: [`${key}Title`, title], body: [`${key}Body`, body], icon, image })),
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
              <Image source={slide.image} style={styles.image} resizeMode="contain" />
              <View style={styles.iconBadge}><Ionicons name={slide.icon} size={21} color="#1A2840" /></View>
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
          <Text style={styles.buttonText}>{page === slides.length - 1 ? t('preHome.getStarted', 'Get started') : t('preHome.next', 'Next')}</Text>
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
  imageFrame: { width: '100%', height: '48%', maxHeight: 330, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 3, position: 'relative' },
  image: { width: '100%', height: '100%' },
  iconBadge: { position: 'absolute', bottom: 14, right: 14, width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center' },
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
