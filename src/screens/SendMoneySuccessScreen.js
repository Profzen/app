import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppToast from '../components/AppToast';
import RatingPromptModal from '../components/RatingPromptModal';
import { useApp } from '../context/AppContext';
import { formatTxDate } from '../utils/formatTxDate';
import { isSmallScreen } from '../utils/responsive';
import { getExplorerTxUrl, isOnChainHash } from '../utils/explorer';

export default function SendMoneySuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, session, user } = useApp();

  const {
    amount = '',
    token = '',
    chain = '',
    recipient = '',
    recipientCountry = '',
    hash = '',
    explorerUrl = null,
  } = route.params || {};

  const [currentHash, setCurrentHash] = useState(hash);
  const isConfirmedOnChain = isOnChainHash(currentHash, chain);

  const effectiveExplorerUrl = isConfirmedOnChain
    ? (explorerUrl && isOnChainHash(explorerUrl.split('/').pop(), chain) ? explorerUrl : getExplorerTxUrl(chain, currentHash))
    : null;

  // If only Crossmint id is available, keep polling until the on-chain hash arrives
  useEffect(() => {
    if (isConfirmedOnChain || !currentHash) return;
    let isSubscribed = true;
    let attempts = 0;
    const maxAttempts = 30;

    const pollId = setInterval(async () => {
      attempts++;
      try {
        let baseApi = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && baseApi.includes('localhost')) {
          baseApi = baseApi.replace('localhost', '10.0.2.2');
        } else if (Platform.OS === 'ios' && baseApi.includes('10.0.2.2')) {
          baseApi = baseApi.replace('10.0.2.2', 'localhost');
        }
        const effectiveAuth = (user?.role === 'merchant' && user?.businessDizzyToken)
          ? user.businessDizzyToken
          : (user?.dizzyToken || session?.access_token);
        if (!effectiveAuth) return;

        const res = await fetch(`${baseApi}/swap/check-crossmint-status/${currentHash}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveAuth}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const foundHash = data.blockchainHash || data.onChain?.txHash || (typeof data.txHash === 'string' && isOnChainHash(data.txHash, chain) ? data.txHash : null);
        if (foundHash && isSubscribed) {
          setCurrentHash(foundHash);
          clearInterval(pollId);
        }
      } catch (e) {
        // Polling retry
      }
      if (attempts >= maxAttempts) {
        clearInterval(pollId);
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(pollId);
    };
  }, [currentHash, isConfirmedOnChain, chain, user, session]);

  const [toast, setToast] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  // Real timestamp captured when the success screen mounts
  const nowDate = formatTxDate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRatingModal(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyHash = async () => {
    if (!currentHash) return;
    try {
      await Clipboard.setStringAsync(currentHash);
      setToast({ title: t('common.copied', "Link copied"), message: t('sendMoney.addressCopied', 'Address copied to clipboard!') });
    } catch (err) {
      setToast({ title: t('common.copied', "Link copied"), message: t('sendMoney.addressCopied', 'Address copied to clipboard!') });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Confirmation Card Container */}
          <View style={styles.mainCard}>
            
            {/* Header Box inside Card */}
            <View style={styles.cardHeaderBox}>
              <View style={styles.headerIconSquare}>
                <Ionicons name="paper-plane" size={20} color="#1A2840" />
              </View>
              
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>{t('sendMoney.sendFunds', 'Send Funds')}</Text>
                <View style={styles.secureTagRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.secureTagText}>{t('sendMoney.secured', 'SECURED')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.dividerLine} />

            {/* Success Circle Checkmark */}
            <View style={styles.successCircleWrapper}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={42} color="#FFFFFF" />
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.successTitle}>{t('sendMoney.txSubmitted', 'Transaction submitted!')}</Text>
            <Text style={styles.successSubtitle}>
              {t('sendMoney.successMessage', { amount, token, recipient, defaultValue: `You successfully sent ${amount} ${token} to ${recipient}` })}
            </Text>

            {/* Hash / Reference Code Copy Box */}
            {currentHash ? (
              <View style={{ width: '100%', marginBottom: 12 }}>
                {!isConfirmedOnChain ? (
                  <View style={styles.referenceBadgeRow}>
                    <Text style={styles.referenceLabel}>
                      {t('sendMoney.reference_label', 'Reference')}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.hashBox}>
                  <Text style={styles.hashText} numberOfLines={1} ellipsisMode="middle">
                    {currentHash}
                  </Text>

                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyHash} activeOpacity={0.7}>
                    <Ionicons name="copy-outline" size={18} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* View on Explorer Button */}
            {isConfirmedOnChain && effectiveExplorerUrl ? (
              <TouchableOpacity
                style={styles.explorerButton}
                onPress={() => Linking.openURL(effectiveExplorerUrl)}
                activeOpacity={0.85}
              >
                <Ionicons name="open-outline" size={16} color="#071D54" style={{ marginRight: 8 }} />
                <Text style={styles.explorerButtonText}>
                  {t('sendMoney.view_on_explorer', 'View on explorer')}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Partager mon succès CTA Card */}
            <TouchableOpacity 
              style={styles.shareCtaCard}
              onPress={() => {
                navigation.navigate('ShareSuccessPlatformScreen', {
                  transactionData: {
                    type: 'send',
                    amount,
                    token,
                    recipientName: recipient,
                    recipientCountry: recipientCountry || (recipient.includes('(') ? recipient.match(/\((.*?)\)/)?.[1] : ''),
                    txHash: currentHash,
                    date: nowDate,
                    actionKey: 'actionSent',
                  },
                });
              }}
              activeOpacity={0.88}
            >
              <View style={styles.shareIconWrapper}>
                {/* Yellow spark rays top right */}
                <View style={styles.sparkRaysWrap}>
                  <View style={[styles.sparkRay, { transform: [{ rotate: '-30deg' }] }]} />
                  <View style={[styles.sparkRay, { transform: [{ rotate: '0deg' }] }]} />
                  <View style={[styles.sparkRay, { transform: [{ rotate: '30deg' }] }]} />
                </View>
                
                <View style={styles.shareWhiteSquare}>
                  <Ionicons name="share-outline" size={24} color="#071D54" />
                </View>
              </View>

              <View style={styles.shareTextWrap}>
                <Text style={styles.shareCtaTitle}>{t('shareSuccess.title', 'Share my success')}</Text>
                <Text style={styles.shareCtaSub1}>
                  <Text style={styles.goldText}>{t('shareSuccess.rewardTitle', "Share your success and earn 1 DZY")}</Text>
                </Text>
                <Text style={styles.shareCtaSub2}>
                  {t('shareSuccess.rewardSub', "Post your DizzitUp card and tag @DizzitUp")}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#FFC759" />
            </TouchableOpacity>

            {route.params?.pivotScreen && (
              <TouchableOpacity 
                style={styles.pivotButton} 
                onPress={() => navigation.navigate(route.params.pivotScreen, route.params.pivotParams)}
                activeOpacity={0.88}
              >
                <Ionicons name="arrow-back" size={16} color="#071D54" style={{ marginRight: 6 }} />
                <Text style={styles.pivotButtonText}>{t('common.backToContact', 'Back to Contact')}</Text>
              </TouchableOpacity>
            )}

            {/* Main Action Button */}
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={() => {
                if (route.params?.pivotScreen) {
                  navigation.navigate(route.params.pivotScreen, route.params.pivotParams);
                } else {
                  navigation.navigate('HomeScreen');
                }
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.doneButtonText}>{t('common.done', 'Done')}</Text>
            </TouchableOpacity>

          </View>

          {/* Footer Security Note */}
          <View style={styles.securityFooterRow}>
            <View style={styles.goldDot} />
            <Text style={styles.securityFooterText}>{t('sendMoney.secureNode', 'SECURE TRANSACTION NODE')}</Text>
          </View>

        </ScrollView>

        <RatingPromptModal visible={showRatingModal} onClose={() => setShowRatingModal(false)} />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, position: 'relative' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 50, zIndex: 50 },
  mainScroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingTop: Platform.OS === 'android' ? 44 : 20,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  mainCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: isSmallScreen ? 16 : 20,
    boxShadow: '0px 6px 16px #0F172A',
    marginTop: 10,
    alignSelf: 'center',
  },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerIconSquare: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: isSmallScreen ? 16 : 18, color: '#0F172A' },
  secureTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  secureTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', letterSpacing: 0.5 },
  dividerLine: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: -20, marginBottom: 28 },
  successCircleWrapper: { alignItems: 'center', marginBottom: 20 },
  successCircle: {
    width: isSmallScreen ? 72 : 84,
    height: isSmallScreen ? 72 : 84,
    borderRadius: isSmallScreen ? 36 : 42,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 6px 12px #10B981',
  },
  successTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: isSmallScreen ? 20 : 22, color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  successSubtitle: { fontFamily: 'Inter_600SemiBold', fontSize: isSmallScreen ? 12 : 13, color: '#15803D', textAlign: 'center', paddingHorizontal: 8, lineHeight: 20, marginBottom: 24 },
  referenceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  referenceLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hashBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingLeft: 14, paddingRight: 8, height: 50, marginBottom: 12 },
  hashText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: isSmallScreen ? 11 : 13, color: '#475569', marginRight: 8 },
  copyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FFC759',
    borderRadius: 14,
    height: 46,
    marginBottom: 16,
    width: '100%',
  },
  explorerButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#071D54',
    letterSpacing: 0.2,
  },
  /* Partager mon succès CTA Card Styles */
  shareCtaCard: { backgroundColor: '#071D54', borderRadius: 18, padding: isSmallScreen ? 12 : 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16, boxShadow: '0px 4px 8px #071D54' },
  shareIconWrapper: { position: 'relative', marginRight: 12 },
  sparkRaysWrap: { position: 'absolute', top: -6, right: -4, flexDirection: 'row', gap: 2, zIndex: 2 },
  sparkRay: { width: 2, height: 6, backgroundColor: '#FFC759', borderRadius: 1 },
  shareWhiteSquare: { width: isSmallScreen ? 44 : 50, height: isSmallScreen ? 44 : 50, borderRadius: 14, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shareTextWrap: { flex: 1, paddingRight: 4 },
  shareCtaTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: isSmallScreen ? 14 : 15, color: '#FFFFFF', marginBottom: 2 },
  shareCtaSub1: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#FFFFFF', marginBottom: 2 },
  goldText: { color: '#FFC759', fontFamily: 'Inter_700Bold' },
  shareCtaSub2: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8', lineHeight: 14 },

  pivotButton: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', height: 48, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  pivotButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#071D54' },
  doneButton: { backgroundColor: '#071D54', height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 8px #071D54' },
  doneButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#FFFFFF' },
  securityFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, maxWidth: 480, width: '100%', alignSelf: 'center' },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759', marginRight: 6 },
  securityFooterText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#94A3B8', letterSpacing: 0.8 },
});
