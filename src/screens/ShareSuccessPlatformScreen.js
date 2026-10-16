import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ResponsiveGrid from '../components/ResponsiveGrid';
import ScreenFooter from '../components/ScreenFooter';
import { useIsSmallScreen } from '../utils/responsive';

export default function ShareSuccessPlatformScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useApp();
  const isSmallScreen = useIsSmallScreen();

  const transactionData = route.params?.transactionData || {
    type: 'send',
    amount: '1',
    token: 'USDC',
    recipient: 'My Business',
    date: '30 Mai 2025',
  };

  const [selectedPlatform, setSelectedPlatform] = useState('whatsapp');

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
    { id: 'twitter', name: 'X / Twitter', icon: 'logo-twitter', color: '#000000' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: 'instagram', name: 'Instagram Story', icon: 'logo-instagram', color: '#E4405F' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2' },
    { id: 'telegram', name: 'Telegram', icon: 'paper-plane', color: '#229ED9' },
  ];

  const handleContinue = () => {
    navigation.navigate('ShareSuccessVisualScreen', {
      platform: selectedPlatform,
      transactionData,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('HomeScreen');
            }
          }}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t('shareSuccess.headerTitle', "Share my success")}</Text>
            <Text style={styles.headerSubtitle}>{t('shareSuccess.headerSubtitle', "Choose where to publish your DizzitUp card")}</Text>
          </View>

          <TouchableOpacity style={styles.helpBtn} onPress={() => navigation.navigate('AskAminataScreen')}>
            <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Stepper 3 Steps */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumberActive}>1</Text>
              </View>
              <Text style={[styles.stepText, styles.stepTextActive]}>{t('shareSuccess.stepSocial', "Social network")}</Text>
            </View>

            <View style={[styles.stepLine, styles.stepLineActive]} />

            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>{t('shareSuccess.stepVisual', "Visual")}</Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>{t('shareSuccess.stepCaption', "Caption")}</Text>
            </View>
          </View>

          {/* Top Reward Card */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardIconWrapper}>
              <View style={styles.sparkRaysWrap}>
                <View style={[styles.sparkRay, { transform: [{ rotate: '-30deg' }] }]} />
                <View style={[styles.sparkRay, { transform: [{ rotate: '0deg' }] }]} />
                <View style={[styles.sparkRay, { transform: [{ rotate: '30deg' }] }]} />
              </View>
              <View style={styles.shareWhiteSquare}>
                <Ionicons name="share-social-outline" size={22} color="#071D54" />
              </View>
            </View>

            <View style={styles.rewardTextWrap}>
              <Text style={styles.rewardTitle}>
                {t('shareSuccess.rewardTitlePre', "Share your success and earn")} <Text style={styles.goldText}>1 DZY</Text>
              </Text>
              <Text style={styles.rewardSub}>
                {t('shareSuccess.rewardSub', "Post your DizzitUp card and tag @DizzitUp")}
              </Text>
            </View>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>{t('shareSuccess.selectPlatform', "Select a platform")}</Text>

          {/* Platform Grid */}
          <ResponsiveGrid
            minItemWidth={140}
            maxColumns={3}
            padding={32}
            gap={12}
            style={styles.gridContainer}
          >
            {platforms.map((plat) => {
              const isSelected = selectedPlatform === plat.id;
              return (
                <TouchableOpacity
                  key={plat.id}
                  style={[
                    styles.platformCard,
                    isSmallScreen && styles.platformCardSmall,
                    isSelected && styles.platformCardSelected,
                  ]}
                  onPress={() => setSelectedPlatform(plat.id)}
                  activeOpacity={0.85}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.iconCircle,
                      isSmallScreen && styles.iconCircleSmall,
                      { backgroundColor: isSelected ? '#F0FDF4' : '#F8FAFC' },
                    ]}
                  >
                    <Ionicons
                      name={plat.icon}
                      size={isSmallScreen ? 22 : 28}
                      color={plat.color}
                    />
                  </View>

                  <Text
                    style={[
                      styles.platformName,
                      isSmallScreen && styles.platformNameSmall,
                      isSelected && styles.platformNameSelected,
                    ]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    {plat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ResponsiveGrid>

          {/* Info Banner 1: Security Privacy */}
          <View style={styles.infoBannerPrivacy}>
            <View style={styles.infoIconCirclePrivacy}>
              <Ionicons name="shield-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.infoTextPrivacy} maxFontSizeMultiplier={1.3}>
              {t('shareSuccess.privacyInfo', "The generated visual will hide sensitive recipient details. Country and flag will remain visible.")}
            </Text>
          </View>

          {/* Info Banner 2: Referral Link */}
          <View style={styles.infoBannerReferral}>
            <View style={styles.infoIconCircleReferral}>
              <Ionicons name="link-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.infoTextReferral} maxFontSizeMultiplier={1.3}>
              {t('shareSuccess.referralInfo', "Trackable referral link included for your rewards.")}
            </Text>
          </View>

          <View style={{ height: 12 }} />
        </ScrollView>

        {/* Sticky Bottom Actions above Android navigation bar */}
        <ScreenFooter borderTop={true} backgroundColor="#FFFFFF" paddingTop={10}>
          <View style={styles.footerButtonsRow}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => navigation.navigate('HomeScreen')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText} maxFontSizeMultiplier={1.3}>
                {t('shareSuccess.later', "Later")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleContinue}
              activeOpacity={0.88}
            >
              <Text style={styles.btnPrimaryText} maxFontSizeMultiplier={1.3}>
                {t('shareSuccess.continue', "Continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScreenFooter>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  helpBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  
  /* Stepper */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stepItem: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    borderColor: '#FFC759',
    backgroundColor: '#FFC759',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  stepTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#FFC759',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#FFC759',
  },

  /* Top Reward Card */
  rewardCard: {
    backgroundColor: '#071D54',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 8px rgba(7,29,84,0.2)',
    elevation: 3,
  },
  rewardIconWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  sparkRaysWrap: {
    position: 'absolute',
    top: -6,
    right: -4,
    flexDirection: 'row',
    gap: 2,
    zIndex: 2,
  },
  sparkRay: {
    width: 2,
    height: 6,
    backgroundColor: '#FFC759',
    borderRadius: 1,
  },
  shareWhiteSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardTextWrap: {
    flex: 1,
  },
  rewardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  goldText: {
    color: '#FFC759',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  rewardSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#CBD5E1',
  },

  /* Grid */
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
    marginBottom: 14,
  },
  gridContainer: {
    marginBottom: 16,
  },
  platformCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0px 2px 6px rgba(15,23,42,0.03)',
    elevation: 1,
  },
  platformCardSmall: {
    paddingVertical: 10,
    minHeight: 80,
    borderRadius: 14,
  },
  platformCardSelected: {
    borderColor: '#FFC759',
    borderWidth: 1.5,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 4,
  },
  platformName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
  },
  platformNameSmall: {
    fontSize: 11.5,
  },
  platformNameSelected: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },

  /* Info Banners */
  infoBannerPrivacy: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  infoIconCirclePrivacy: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextPrivacy: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },

  infoBannerReferral: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
    borderWidth: 1,
    borderColor: '#FEF08A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  infoIconCircleReferral: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextReferral: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },

  /* Footer Buttons */
  footerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  btnSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 46,
    marginBottom: 0,
  },
  btnSecondaryText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  btnPrimary: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    height: 46,
    boxShadow: '0px 4px 8px rgba(255,199,89,0.3)',
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14.5,
    color: '#1A2840',
  },
});
