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

export default function SendMoneySuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useApp();

  const { amount = '1', token = 'USDC', recipient = 'My Business', hash = '91d99789-98cc-44c0-8a14-da693a72e5f1' } = route.params || {};
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
    try {
      await Clipboard.setStringAsync(hash);
      setToast({ title: t('common.copied', 'Copied!'), message: t('sendMoney.addressCopied', 'Address copied to clipboard!') });
    } catch (err) {
      setToast({ title: t('common.copied', 'Copied!'), message: t('sendMoney.addressCopied', 'Address copied to clipboard!') });
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

            {/* Hash Code Copy Box */}
            <View style={styles.hashBox}>
              <Text style={styles.hashText} numberOfLines={1} ellipsisMode="middle">
                {hash}
              </Text>

              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyHash} activeOpacity={0.7}>
                <Ionicons name="copy-outline" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* View on Polygonscan Button */}
            {hash && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4, marginBottom: 12 }}
                onPress={() => {
                  const cleanHash = hash.trim();
                  const url = cleanHash.startsWith('0x') ? `https://polygonscan.com/tx/${cleanHash}` : `https://polygonscan.com/tx/0x${cleanHash}`;
                  Linking.openURL(url).catch(() => {});
                }}
              >
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#3B82F6', marginRight: 4 }}>
                  {t('common.wallet.view_onchain', 'View on Polygonscan')}
                </Text>
                <Ionicons name="open-outline" size={14} color="#3B82F6" />
              </TouchableOpacity>
            )}

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
                    txHash: hash,
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
                  <Text style={styles.goldText}>{t('shareSuccess.rewardTitle', 'Earn 1 DZY by tagging @DizzitUp')}</Text>
                </Text>
                <Text style={styles.shareCtaSub2}>
                  {t('shareSuccess.rewardSub', 'Publish a customized DizzitUp card of this transaction')}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#FFC759" />
            </TouchableOpacity>

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
  scrollContent: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 40, alignItems: 'center' },
  mainCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1, borderColor: '#F1F5F9', padding: 20, boxShadow: '0px 6px 16px #0F172A', marginTop: 10 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerIconSquare: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#0F172A' },
  secureTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  secureTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', letterSpacing: 0.5 },
  dividerLine: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: -20, marginBottom: 32 },
  successCircleWrapper: { alignItems: 'center', marginBottom: 20 },
  successCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 6px 12px #10B981' },
  successTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  successSubtitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#15803D', textAlign: 'center', paddingHorizontal: 12, lineHeight: 20, marginBottom: 24 },
  hashBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingLeft: 16, paddingRight: 8, height: 52, marginBottom: 16 },
  hashText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#475569', marginRight: 8 },
  copyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  /* Partager mon succès CTA Card Styles */
  shareCtaCard: { backgroundColor: '#071D54', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16, boxShadow: '0px 4px 8px #071D54' },
  shareIconWrapper: { position: 'relative', marginRight: 12 },
  sparkRaysWrap: { position: 'absolute', top: -6, right: -4, flexDirection: 'row', gap: 2, zIndex: 2 },
  sparkRay: { width: 2, height: 6, backgroundColor: '#FFC759', borderRadius: 1 },
  shareWhiteSquare: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shareTextWrap: { flex: 1, paddingRight: 4 },
  shareCtaTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF', marginBottom: 2 },
  shareCtaSub1: { fontFamily: 'Inter_600SemiBold', fontSize: 11.5, color: '#FFFFFF', marginBottom: 2 },
  goldText: { color: '#FFC759', fontFamily: 'Inter_700Bold' },
  shareCtaSub2: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#94A3B8', lineHeight: 14 },

  doneButton: { backgroundColor: '#071D54', height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 8px #071D54' },
  doneButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#FFFFFF' },
  securityFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759', marginRight: 6 },
  securityFooterText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#94A3B8', letterSpacing: 0.8 },
});
