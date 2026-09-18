import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function WithdrawFundsMobileMoneySummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useApp();
  const { amount, currency, selectedToken, selectedNetwork, selectedMethod } = route.params || {};
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('withdrawFunds.titleToMobileMoney', 'Withdraw funds to Mobile Money')}</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Simple Stepper (1 to 5) */}
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>1</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>2</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>3</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>5</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.stepOverTitle}>{t('withdrawFunds.step3Of5', 'Step 3/5')}</Text>
          <Text style={styles.mainTitle}>{t('withdrawFunds.summaryTitle', 'Transaction summary')}</Text>
          <Text style={styles.mainSubtitle}>{t('withdrawFunds.summarySubtitle', 'Review the details below before confirming your withdrawal.')}</Text>

          {/* Main Summary Card */}
          <View style={styles.summaryCard}>
            
            {/* Withdraw Amount */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <View style={[styles.iconCircle, {backgroundColor: '#FEF3C7'}]}>
                  <Ionicons name="arrow-up" size={16} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>{t('withdrawFunds.youWithdraw', 'You withdraw')}</Text>
                  <Text style={styles.summaryValueBig}>250 000 FCFA</Text>
                </View>
              </View>
              <View style={styles.countryBadge}>
                <Text style={styles.flagText}>🇹🇬</Text>
                <Text style={styles.countryText}>Togo</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Debit Amount */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <View style={[styles.iconCircle, {backgroundColor: '#EFF6FF'}]}>
                  <Ionicons name="wallet" size={16} color="#1E3A8A" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>{t('withdrawFunds.walletDebited', 'Your DZYwallet is debited by')}</Text>
                  <Text style={styles.summaryValueBig}>251,40 USDC</Text>
                  <Text style={styles.summaryRate}>{t('withdrawFunds.exchangeRate', { token: 'USDC', rate: '995,62', curr: 'FCFA', defaultValue: 'Rate: 1 USDC = 995,62 FCFA' })}</Text>
                </View>
              </View>
              <View style={styles.tokenBadge}>
                <View style={styles.usdcLogo}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>$</Text>
                </View>
                <Text style={styles.countryText}>USDC</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Receive Amount */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <View style={[styles.iconCircle, {backgroundColor: '#DCFCE7'}]}>
                  <Ionicons name="arrow-down" size={16} color="#059669" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>{t('withdrawFunds.youReceive', 'You receive')}</Text>
                  <Text style={styles.summaryValueBig}>247 000 FCFA</Text>
                  <Text style={styles.summaryLabel}>{t('withdrawFunds.onWallet', { name: 'Mixx', defaultValue: 'on your Mixx wallet' })}</Text>
                </View>
              </View>
              <View style={styles.providerBadgeContainer}>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerLogoText}>mixx</Text>
                  <Text style={styles.providerSubLogo}>by yas</Text>
                </View>
                <Text style={styles.providerNameText}>Mixx (Togo)</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Fees */}
            <View style={styles.feeRow}>
              <View style={styles.feeLabelRow}>
                <Text style={styles.feeLabel}>{t('withdrawFunds.dizzitupFee', 'DizzitUp Fee')}</Text>
                <Ionicons name="information-circle-outline" size={14} color="#94A3B8" style={{marginLeft: 4}} />
              </View>
              <Text style={styles.feeValue}>7 500 FCFA (3,00%)</Text>
            </View>

            <View style={styles.feeRow}>
              <View style={styles.feeLabelRow}>
                <Text style={styles.feeLabel}>{t('withdrawFunds.networkFee', 'Network Fee')} (Mixin Network)</Text>
                <Ionicons name="information-circle-outline" size={14} color="#94A3B8" style={{marginLeft: 4}} />
              </View>
              <Text style={styles.feeValue}>0 FCFA (0%)</Text>
            </View>

            {/* Total */}
            <View style={styles.totalBanner}>
              <Text style={styles.totalLabel}>{t('withdrawFunds.youReceiveTotal', 'You will receive in total')}</Text>
              <Text style={styles.totalValue}>247 000 FCFA</Text>
            </View>

          </View>

          {/* Sell Transaction Card */}
          <View style={styles.sellCard}>
            <Text style={styles.feeLabel}>{t('withdrawFunds.sellTransaction', 'Sell transaction')}</Text>
            <View style={styles.sellRow}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.sellTitle}>Sell 251,40 USDC</Text>
                <View style={styles.successBadge}>
                  <Text style={styles.successBadgeText}>{t('common.success', 'Success')}</Text>
                </View>
              </View>
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.linkText}>{t('withdrawFunds.viewOnBlockchain', 'View on blockchain')}</Text>
                <Ionicons name="open-outline" size={14} color="#3B82F6" style={{marginLeft: 4}} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.infoBannerText}>
              {t('withdrawFunds.rateVariationNotice', 'The final amount may vary slightly depending on the exchange rate at the time of processing.')}
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('WithdrawFundsMobileMoneyProcessingScreen', { amount, currency, selectedToken, selectedNetwork, selectedMethod })}>
            <Ionicons name="lock-closed" size={18} color="#1A2840" style={{marginRight: 8}} />
            <Text style={styles.btnContinueText}>{t('withdrawFunds.confirmWithdrawal', 'Confirm withdrawal')}</Text>
          </TouchableOpacity>

        </ScrollView>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14, // Slightly smaller to fit "Retirer des fonds vers Mobile Money"
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFB800',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  stepOverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFB800',
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  summaryLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValueBig: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  summaryRate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flagText: {
    fontSize: 14,
    marginRight: 6,
  },
  countryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  usdcLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2775CA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  providerBadgeContainer: {
    alignItems: 'center',
  },
  providerBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  providerLogoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#8B5CF6',
  },
  providerSubLogo: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8,
    color: '#1A2840',
    marginTop: -4,
  },
  providerNameText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#475569',
  },
  feeValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4', // very light green
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#059669', // dark green
  },
  sellCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 16,
  },
  sellRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sellTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  successBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  successBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#059669',
  },
  linkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#3B82F6',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  btnContinue: {
    flexDirection: 'row',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
});
