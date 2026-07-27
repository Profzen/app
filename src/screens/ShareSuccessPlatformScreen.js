import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShareSuccessPlatformScreen() {
  const navigation = useNavigation();
  const route = useRoute();

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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Partager mon succès</Text>
            <Text style={styles.headerSubtitle}>Choisissez où publier votre carte DizzitUp</Text>
          </View>

          <TouchableOpacity style={styles.helpBtn}>
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
              <Text style={[styles.stepText, styles.stepTextActive]}>Réseau social</Text>
            </View>

            <View style={[styles.stepLine, styles.stepLineActive]} />

            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Visuel</Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Légende</Text>
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
                Partagez votre succès et gagnez <Text style={styles.goldText}>1 DZY</Text>
              </Text>
              <Text style={styles.rewardSub}>
                Publiez votre carte DizzitUp et taguez @DizzitUp
              </Text>
            </View>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Sélectionnez une plateforme</Text>

          {/* Platform Grid */}
          <View style={styles.gridContainer}>
            {platforms.map((plat) => {
              const isSelected = selectedPlatform === plat.id;
              return (
                <TouchableOpacity
                  key={plat.id}
                  style={[styles.platformCard, isSelected && styles.platformCardSelected]}
                  onPress={() => setSelectedPlatform(plat.id)}
                  activeOpacity={0.85}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}

                  <View style={[styles.iconCircle, { backgroundColor: isSelected ? '#F0FDF4' : '#F8FAFC' }]}>
                    <Ionicons name={plat.icon} size={28} color={plat.color} />
                  </View>
                  
                  <Text style={[styles.platformName, isSelected && styles.platformNameSelected]}>
                    {plat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Banner 1: Security Privacy */}
          <View style={styles.infoBannerPrivacy}>
            <View style={styles.infoIconCirclePrivacy}>
              <Ionicons name="shield-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.infoTextPrivacy}>
              Le visuel généré masquera les informations sensibles du bénéficiaire. Son pays et son drapeau resteront visibles.
            </Text>
          </View>

          {/* Info Banner 2: Referral Link */}
          <View style={styles.infoBannerReferral}>
            <View style={styles.infoIconCircleReferral}>
              <Ionicons name="link-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.infoTextReferral}>
              Lien d'invitation traçable inclus pour vos récompenses.
            </Text>
          </View>

          {/* Bottom Action Buttons */}
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.navigate('HomeScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>Plus tard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleContinue}
            activeOpacity={0.88}
          >
            <Text style={styles.btnPrimaryText}>Continuer</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
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
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  platformCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  platformCardSelected: {
    borderColor: '#FFC759',
    borderWidth: 1.5,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  platformName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
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
    padding: 14,
    marginBottom: 12,
  },
  infoIconCirclePrivacy: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextPrivacy: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  infoBannerReferral: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
    borderWidth: 1,
    borderColor: '#FEF08A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  infoIconCircleReferral: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextReferral: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },

  /* Buttons */
  btnSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    marginBottom: 10,
  },
  btnSecondaryText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  btnPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    height: 50,
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
});
