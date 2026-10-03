import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, TextInput, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppSelect from '../components/AppSelect';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

const paymentCurrencies = [
  { value: 'USD', label: '🇺🇸 USD' },
  { value: 'EUR', label: '🇪🇺 EUR' },
  { value: 'XOF', label: '🌍 XOF' },
  { value: 'NGN', label: '🇳🇬 NGN' }
];

export default function ReviewPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, hasUnreadNotifications } = useApp();

  // Extract dynamic params if passed, fallback to default for demo purposes
  const {
    transactionData = {
      beneficiaryName: 'Mama Kemi Adebayo',
      beneficiaryRelation: 'Mère',
      location: 'Lagos, Nigeria 🇳🇬',
      serviceTitle: 'Mobile Recharge',
      serviceSubtitle: 'MTN Nigeria',
      amount: '20',
      currency: 'USD',
      convertedAmount: '≈ 32,250 NGN',
      fee: '0.50'
    }
  } = route.params || {};

  const [selectedPayment, setSelectedPayment] = useState('card');
  const [amount, setAmount] = useState(transactionData.amount);
  const [currency, setCurrency] = useState(transactionData.currency);
  const [toast, setToast] = useState(null);

  const totalAmount = (parseFloat(amount || '0') + parseFloat(transactionData.fee || '0')).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>{t('reviewPayment.title', 'Review and Pay')}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={18} color="#1A2840" />
                {hasUnreadNotifications && <View style={styles.notificationDot} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>{t('reviewPayment.subtitle', 'Review your payment details and confirm to continue.')}</Text>
        </View>

        <ScrollView 
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Selected Beneficiary Summary Card */}
          <View style={styles.beneficiaryCard}>
            <View style={styles.beneficiaryMain}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 18, color: '#6B7280' }}>
                    {transactionData.beneficiaryName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.verifiedCheckBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.beneficiaryDetails}>
                <Text style={styles.beneficiaryName}>{transactionData.beneficiaryName}</Text>
                {transactionData.beneficiaryRelation ? (
                  <Text style={styles.beneficiaryRelation}>{transactionData.beneficiaryRelation}</Text>
                ) : null}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>{transactionData.location}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('PayBillsScreen')}>
                <Ionicons name="create-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.editButtonText}>{t('common.edit', 'Edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Service & Operator Row */}
          <View style={styles.serviceSelectorCard}>
            <View style={[styles.serviceIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="phone-portrait-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.serviceTextWrap}>
              <Text style={styles.serviceTitle}>{transactionData.serviceTitle}</Text>
              <Text style={styles.serviceSubtitle}>{transactionData.serviceSubtitle}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ChooseServiceScreen')}>
              <Ionicons name="create-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
              <Text style={styles.editButtonText}>{t('common.edit', 'Edit')}</Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input & Currency Selector Section */}
          <View style={styles.amountSection}>
            <Text style={styles.inputLabel}>{t('common.amount', 'Amount')}</Text>
            <View style={styles.amountInputRow}>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(text) => setAmount(text.replace(/[^0-9.,]/g, '').slice(0, 10))}
                  keyboardType="numeric"
                />
              </View>
              <AppSelect 
                value={currency} 
                options={paymentCurrencies} 
                onChange={setCurrency} 
                title={t('common.currency', 'Currency')} 
                style={styles.currencySelector} 
                textStyle={styles.currencyText} 
              />
            </View>
            <Text style={styles.convertedAmount}>{transactionData.convertedAmount}</Text>
          </View>

          {/* Payment Methods (Payer avec) */}
          <View style={styles.paymentMethodsSection}>
            <Text style={styles.sectionTitle}>{t('orderVerification.payWith', 'Pay with')}</Text>

            {/* Option 1: Card Payment */}
            <TouchableOpacity 
              style={[styles.paymentCard, selectedPayment === 'card' && styles.paymentCardSelected]}
              onPress={() => setSelectedPayment('card')}
              activeOpacity={0.8}
            >
              <View style={[styles.paymentIconWrapper, { backgroundColor: '#FFC759' }]}>
                <Ionicons name="card-outline" size={20} color="#1A2840" />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>{t('reviewPayment.cardPayment', 'Card Payment')}</Text>
                <Text style={styles.paymentSubtitle}>Visa, Mastercard, Amex</Text>
              </View>
              <View style={styles.selectedCheckCircle}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Option 2: DZYwallet */}
            <TouchableOpacity 
              style={[styles.paymentCard, selectedPayment === 'wallet' && styles.paymentCardSelected]}
              onPress={() => setSelectedPayment('wallet')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentIconWrapper}>
                <Ionicons name="wallet-outline" size={20} color="#1A2840" />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>{t('reviewPayment.dzyWalletOption', 'DZYwallet (Stablecoins & DZY)')}</Text>
                <Text style={styles.paymentSubtitle}>USDC, USDT, EURC, DZY</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#1A2840" />
            </TouchableOpacity>

            {/* Option 3: Mobile Money */}
            <View style={[styles.paymentCardColumn, selectedPayment === 'mobile' && styles.paymentCardSelected]}>
              <TouchableOpacity 
                style={styles.paymentCardRowHeader}
                onPress={() => setSelectedPayment('mobile')}
                activeOpacity={0.8}
              >
                <View style={styles.paymentIconWrapper}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#1A2840" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>{t('reviewPayment.mobileMoney', 'Mobile Money (operators)')}</Text>
                  <Text style={styles.paymentSubtitle}>{t('reviewPayment.payWithMobileMoney', 'Pay with Mobile Money')}</Text>
                </View>
                <View style={styles.radioOuterCircle}>
                  {selectedPayment === 'mobile' && <View style={styles.radioInnerCircle} />}
                </View>
              </TouchableOpacity>
              <Text style={styles.mobileMoneySubtext}>
                {t('reviewPayment.mobileMoneyNote', 'Available only in covered countries\nActual options may vary locally.')} <Ionicons name="information-circle-outline" size={12} color="#6B7280" />
              </Text>
            </View>
          </View>

          {/* Payment Details Breakdown Card */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsHeader}>{t('orderConfirmation.paymentDetails', 'Payment details')}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('common.amount', 'Amount')}</Text>
              <Text style={styles.detailValue}>{amount} {currency}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabelWithIcon}>
                <Text style={styles.detailLabel}>{t('paymentSuccess.serviceFee', 'Service Fee')}</Text>
                <Ionicons name="information-circle-outline" size={13} color="#9CA3AF" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.detailValue}>{transactionData.fee} {currency}</Text>
            </View>

            <View style={styles.dashedLine} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('orderConfirmation.amountToPay', 'Total to pay')}</Text>
              <Text style={styles.totalValue}>{totalAmount} {currency}</Text>
            </View>
          </View>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <View style={styles.securityIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
            </View>
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>{t('orderVerification.securePaymentTitle', '100% Secure payment')}</Text>
              <Text style={styles.securityText}>{t('reviewPayment.securityNote', 'Your funds are protected by the DZYwallet security protocol.')}</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Fixed Bottom CTA & Step Progress (4/4) */}
        <View style={styles.bottomFixedContainer}>
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => navigation.navigate('PaymentInProgressScreen')}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed" size={16} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.ctaButtonText}>{t('reviewPayment.payAndSend', 'Pay & send')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A2840" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Step Indicator 4/4 */}
          <View style={styles.stepProgressRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.stepProgressText}>{t('reviewPayment.stepProgress', 'Payment 4/4 : Review & confirmation')}</Text>
          </View>

          {/* Progress Bar (All 4 segments active) */}
          <View style={styles.progressBarRow}>
            <View style={[styles.progressSegment, styles.segmentActive]} />
            <View style={[styles.progressSegment, styles.segmentActive]} />
            <View style={[styles.progressSegment, styles.segmentActive]} />
            <View style={[styles.progressSegment, styles.segmentActive]} />
          </View>
        </View>

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backButton: { padding: 4, marginRight: 4 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 16 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingBottom: 150 },
  beneficiaryCard: { backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 16, padding: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 14 },
  beneficiaryMain: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6' },
  verifiedCheckBadge: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFFDF0' },
  beneficiaryDetails: { flex: 1 },
  beneficiaryName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  beneficiaryRelation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1A2840' },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  editButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
  serviceSelectorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, padding: 12, marginHorizontal: 16, marginBottom: 16 },
  serviceIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceTextWrap: { flex: 1 },
  serviceTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  serviceSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  amountSection: { marginHorizontal: 16, marginBottom: 18 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#6B7280', marginBottom: 6 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  inputContainer: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 44, justifyContent: 'center', backgroundColor: '#FFFFFF' },
  amountInput: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840', outlineStyle: 'none' },
  currencySelector: { height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  currencyText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  convertedAmount: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  paymentMethodsSection: { marginHorizontal: 16, marginBottom: 18 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginBottom: 10 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 12, marginBottom: 10 },
  paymentCardColumn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 12, marginBottom: 10 },
  paymentCardRowHeader: { flexDirection: 'row', alignItems: 'center' },
  paymentCardSelected: { backgroundColor: '#FFFDF5', borderColor: '#FFC759' },
  paymentIconWrapper: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  paymentSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  selectedCheckCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center' },
  radioOuterCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#FFC759', justifyContent: 'center', alignItems: 'center' },
  radioInnerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFC759' },
  mobileMoneySubtext: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', marginTop: 8, paddingLeft: 50, lineHeight: 14 },
  detailsSection: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 16 },
  detailsHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280' },
  detailLabelWithIcon: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  dashedLine: { height: 1, borderTopWidth: 1, borderTopColor: '#E5E7EB', borderStyle: 'dashed', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  totalValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840' },
  securityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 14, padding: 12, marginHorizontal: 16, marginBottom: 16 },
  securityIconWrapper: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  securityInfo: { flex: 1 },
  securityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#10B981', marginBottom: 1 },
  securityText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', lineHeight: 14 },
  bottomFixedContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  ctaButton: { backgroundColor: '#FFC759', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 12, marginBottom: 10 },
  ctaButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  stepProgressRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepProgressText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#6B7280' },
  progressBarRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingHorizontal: 40 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  segmentActive: { backgroundColor: '#FFC759' }
});
