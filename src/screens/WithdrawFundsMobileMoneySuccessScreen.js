import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar, Clipboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { getOperatorLogo } from '../utils/operatorLogos';

export default function WithdrawFundsMobileMoneySuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, language, user } = useApp();
  const [toast, setToast] = useState(null);

  const {
    amount = '0',
    selectedToken = 'USDC',
    selectedMethod = 'momo',
    providerName = 'Mobile Money',
    countryName = 'Togo',
    quote = {},
    orderId = 'N/A',
    txHash = 'Pending',
    selectedNetwork = 'Polygon',
    timestamp = new Date().toISOString()
  } = route.params || {};

  const { COUNTRY_METADATA } = require('../services/paymentCorridorService');
  const countryParam = (user?.country || 'TG').toUpperCase().trim();
  const meta = COUNTRY_METADATA[countryParam] || COUNTRY_METADATA['TG'];
  const effectiveCurrency = ['XOF', 'XAF'].includes(meta.currency || 'XOF') ? 'FCFA' : (meta.currency || 'XOF');

  const formattedAmount = parseFloat(amount).toLocaleString(language);
  const finalFiatAmount = quote.finalFiatAmountReceived
    ? quote.finalFiatAmountReceived.toLocaleString(language)
    : formattedAmount;
  const tokenAmount = quote.totalTokenDebit ? quote.totalTokenDebit.toFixed(2) : '0.00';
  const recipientContact = user?.phone || 'N/A';

  const displayDate = new Date(timestamp).toLocaleDateString(language, {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const operatorLogo = getOperatorLogo(providerName);

  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    setToast({ title: t('copied_title', '{{label}} copied!', { label }), message: text.length > 20 ? `${text.slice(0, 10)}...` : text });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle} numberOfLines={1}>{t('withdrawFunds.titleToMobileMoney', 'Withdraw to Mobile Money')}</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={22} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Stepper — all active (step 5/5) */}
          <View style={styles.stepperContainer}>
            {[1,2,3,4,5].map((n, i) => (
              <React.Fragment key={n}>
                <View style={styles.stepCircleActive}>
                  <Text style={styles.stepNumberActive}>{n}</Text>
                </View>
                {i < 4 && <View style={styles.stepLineActive} />}
              </React.Fragment>
            ))}
          </View>

          {/* Titles */}
          <Text style={styles.stepOverTitleSuccess}>{t('withdrawFunds.step5Of5', 'Step 5/5')}</Text>
          <Text style={styles.mainTitle}>{t('withdrawFunds.successTitle', 'Withdrawal successful!')}</Text>
          <Text style={styles.mainSubtitle}>{t('withdrawFunds.successSubtitle', 'Your withdrawal has been completed successfully.')}</Text>

          {/* Main Success Card */}
          <View style={styles.successCardContainer}>
            <View style={styles.successCardTopBg} />

            {/* Confetti & Checkmark */}
            <View style={styles.successIconContainer}>
              <View style={[styles.confetti, {backgroundColor: '#10B981', top: 18, left: 36, width: 7, height: 7, transform: [{rotate: '15deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#FFB800', top: 12, left: 80, width: 5, height: 9, transform: [{rotate: '-20deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#10B981', bottom: 18, left: 26, width: 5, height: 5, transform: [{rotate: '45deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#FFB800', top: 36, right: 80, width: 7, height: 7, transform: [{rotate: '10deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#10B981', top: 18, right: 36, width: 5, height: 9, transform: [{rotate: '-30deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#FFB800', bottom: 26, right: 26, width: 5, height: 5, transform: [{rotate: '25deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#10B981', bottom: 8, right: 62, width: 5, height: 5, transform: [{rotate: '60deg'}]}]} />
              <View style={styles.checkCircleLarge}>
                <Ionicons name="checkmark" size={44} color="#FFFFFF" />
              </View>
              <View style={styles.checkCircleShadow} />
            </View>

            {/* Inner White Card */}
            <View style={styles.innerWhiteCard}>

              {/* Amounts Header */}
              <View style={styles.amountsHeader}>
                <View style={styles.amountCol}>
                  <Text style={styles.amountLabel}>{t('withdrawFunds.youWithdraw', 'You withdraw')}</Text>
                  <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit>{formattedAmount} {effectiveCurrency}</Text>
                  <Text style={styles.amountSub}>≈ {tokenAmount} {selectedToken}</Text>
                </View>

                <View style={styles.amountArrowContainer}>
                  <Ionicons name="arrow-forward" size={14} color="#10B981" />
                </View>

                <View style={styles.amountColRight}>
                  <Text style={styles.amountLabel}>{t('withdrawFunds.youReceive', 'You receive')}</Text>
                  <Text style={styles.amountValueGreen} numberOfLines={1} adjustsFontSizeToFit>{finalFiatAmount} {effectiveCurrency}</Text>
                  <Text style={styles.amountSub}>via {providerName}</Text>
                </View>
              </View>

              <View style={styles.innerDivider} />

              {/* Withdrawal Method Row — with real operator logo */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#ECFDF5'}]}>
                    <Ionicons name="business" size={13} color="#10B981" />
                  </View>
                  <Text style={styles.detailLabel}>{t('withdrawFunds.withdrawalMethod', 'Withdrawal method')}</Text>
                </View>
                <View style={styles.detailRight}>
                  {operatorLogo ? (
                    <Image source={operatorLogo} style={styles.operatorLogo} resizeMode="contain" />
                  ) : (
                    <Text style={styles.detailValueRegular}>{providerName}</Text>
                  )}
                </View>
              </View>

              {/* Wallet debited */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#EFF6FF'}]}>
                    <Text style={{color: '#3B82F6', fontSize: 10, fontWeight: 'bold'}}>$</Text>
                  </View>
                  <Text style={styles.detailLabel}>{t('withdrawFunds.walletWasDebited', 'Wallet debited by')}</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>{tokenAmount} {selectedToken}</Text>
                </View>
              </View>

              {/* Network */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#ECFDF5'}]}>
                    <Ionicons name="git-network-outline" size={13} color="#10B981" />
                  </View>
                  <Text style={styles.detailLabel}>{t('common.network', 'Network')}</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>Polygon</Text>
                  <View style={styles.polygonSmallLogo}>
                    <Text style={{color: '#FFF', fontSize: 7, fontWeight: 'bold'}}>∞</Text>
                  </View>
                </View>
              </View>

              {/* Sell transaction */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#F5F3FF'}]}>
                    <Ionicons name="document-text-outline" size={13} color="#8B5CF6" />
                  </View>
                  <Text style={styles.detailLabel}>{t('withdrawFunds.sellTransaction', 'Sell transaction')}</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>Sell {tokenAmount} {selectedToken}</Text>
                  <View style={styles.successBadge}>
                    <Text style={styles.successBadgeText}>{t('common.success', 'Success')}</Text>
                  </View>
                </View>
              </View>

              {/* Blockchain hash */}
              <TouchableOpacity style={styles.detailRow} onPress={() => copyToClipboard(txHash, 'TX Hash')} activeOpacity={0.7}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#F5F3FF'}]}>
                    <Ionicons name="open-outline" size={13} color="#8B5CF6" />
                  </View>
                  <Text style={styles.detailLabel}>{t('withdrawFunds.viewOnBlockchain', 'View on blockchain')}</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueBlue} numberOfLines={1}>
                    {txHash.length > 16 ? `${txHash.slice(0, 6)}...${txHash.slice(-5)}` : txHash}
                  </Text>
                  <Ionicons name="copy-outline" size={13} color="#64748B" style={{marginLeft: 5}} />
                </View>
              </TouchableOpacity>

              {/* Date */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#EFF6FF'}]}>
                    <Ionicons name="calendar-outline" size={13} color="#3B82F6" />
                  </View>
                  <Text style={styles.detailLabel}>{t('orderVerification.dateTime', 'Date and time')}</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular} numberOfLines={1}>{displayDate}</Text>
                </View>
              </View>

              {/* Order ID */}
              <TouchableOpacity style={styles.detailRow} onPress={() => copyToClipboard(orderId, 'Order ID')} activeOpacity={0.7}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#FFFBEB'}]}>
                    <Ionicons name="id-card-outline" size={13} color="#F59E0B" />
                  </View>
                  <Text style={styles.detailLabel}>{t('withdrawFunds.withdrawalId', 'Withdrawal ID')}</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular} numberOfLines={1}>
                    {orderId.length > 16 ? `${orderId.slice(0, 8)}...${orderId.slice(-5)}` : orderId}
                  </Text>
                  <Ionicons name="copy-outline" size={13} color="#64748B" style={{marginLeft: 5}} />
                </View>
              </TouchableOpacity>

              {/* Recipient */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#ECFDF5'}]}>
                    <Ionicons name="person-outline" size={13} color="#10B981" />
                  </View>
                  <Text style={styles.detailLabel}>{t('orderVerification.recipient', 'Recipient')}</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>{recipientContact}</Text>
                </View>
              </View>

            </View>
          </View>

          {/* Success Banner */}
          <View style={styles.successBannerBottom}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" style={{marginRight: 10}} />
            <Text style={styles.successBannerText}>
              {t('withdrawFunds.fundsAvailableNotice', 'You will receive a notification as soon as the funds are available on your account.')}
            </Text>
          </View>

          {/* Share CTA Card */}
          <TouchableOpacity
            style={styles.shareCtaCardWrapper}
            onPress={() => {
              navigation.navigate('ShareSuccessPlatformScreen', {
                transactionData: {
                  type: 'withdraw',
                  amount: `${formattedAmount} ${effectiveCurrency}`,
                  token: selectedToken,
                  actionKey: 'actionWithdrawn',
                  recipientName: `${providerName} (${recipientContact})`,
                  recipientCountry: countryName,
                  recipientFlag: meta.flag || '🌍',
                  senderName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Utilisateur',
                  senderCountry: countryName,
                  senderFlag: meta.flag || '🌍',
                  senderAvatar: user?.avatar?.uri || null,
                  network: selectedNetwork,
                  date: displayDate,
                  txHash: orderId,
                },
              });
            }}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#20365B', '#111D33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareCtaCard}
            >
              <View style={styles.shareWhiteSquare}>
                <Ionicons name="share-social-outline" size={22} color="#FFC759" />
              </View>

              <View style={styles.shareTextWrap}>
                <Text style={styles.shareCtaTitle}>{t('shareSuccess.title', 'Share my success')}</Text>
                <View style={styles.rewardBadge}>
                  <Ionicons name="gift-outline" size={11} color="#071D54" style={{marginRight: 3}} />
                  <Text style={styles.rewardBadgeText}>{t('shareSuccess.rewardTitle', 'Earn 1 DZY by tagging @DizzitUp')}</Text>
                </View>
                <Text style={styles.shareCtaSub2}>
                  {t('shareSuccess.rewardSub', 'Publish a customized DizzitUp card of this transaction')}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#FFC759" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('TransactionHistoryScreen')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnOutlineText}>{t('withdrawFunds.viewHistory', 'View history')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('WithdrawFundsScreen')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>{t('withdrawFunds.withdrawAnother', 'New withdrawal')}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },

  /* Stepper */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  stepLineActive: {
    flex: 1,
    height: 2,
    backgroundColor: '#FFB800',
    marginHorizontal: 6,
  },

  /* Titles */
  stepOverTitleSuccess: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#10B981',
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 6,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },

  /* Success Card */
  successCardContainer: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  successCardTopBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 170,
    backgroundColor: '#F0FDF4',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
  checkCircleLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  checkCircleShadow: {
    position: 'absolute',
    width: 56,
    height: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    bottom: 12,
    zIndex: 1,
  },

  /* Inner White Card */
  innerWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  amountsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  amountCol: { flex: 1, alignItems: 'flex-start' },
  amountColRight: { flex: 1, alignItems: 'flex-end' },
  amountLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#64748B',
    marginBottom: 3,
  },
  amountValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
    maxWidth: '100%',
  },
  amountValueGreen: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#10B981',
    maxWidth: '100%',
  },
  amountSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },

  /* Detail Rows */
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
    flexShrink: 1,
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: '45%',
    marginLeft: 8,
  },
  detailValueRegular: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
    textAlign: 'right',
    flexShrink: 1,
  },
  detailValueBlue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#3B82F6',
    flexShrink: 1,
  },
  operatorLogo: {
    width: 72,
    height: 28,
  },
  polygonSmallLogo: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  successBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 6,
  },
  successBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#059669',
  },

  /* Banner */
  successBannerBottom: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  successBannerText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    lineHeight: 17,
  },

  toastWrap: { position: 'absolute', left: 14, right: 14, top: 60, zIndex: 50 },

  /* Share CTA */
  shareCtaCardWrapper: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#111D33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  shareCtaCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareWhiteSquare: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 199, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  shareTextWrap: {
    flex: 1,
  },
  shareCtaTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 5,
  },
  rewardBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#071D54',
  },
  shareCtaSub2: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },

  /* Action Buttons */
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  btnOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFC759',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  btnOutlineText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
  },
  btnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
  },
});
