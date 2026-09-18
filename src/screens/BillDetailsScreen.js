import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';
import { resolveBeneficiaryCountry } from '../utils/countryCurrencyUtils';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const getPayBillsApiUrl = () => {
  let url = process.env.EXPO_PUBLIC_PAY_BILLS_API_URL || 'https://api.dizzitup.com';
  return url.replace(/\/api\/?$/, '');
};

const CATEGORIES = [
  { id: 'ALL', labelKey: 'billDetails.catAll', fallback: 'All', icon: 'apps-outline' },
  { id: 'ELECTRICITY', labelKey: 'billDetails.catElectricity', fallback: 'Electricity', icon: 'flash-outline' },
  { id: 'WATER', labelKey: 'billDetails.catWater', fallback: 'Water', icon: 'water-outline' },
  { id: 'TV', labelKey: 'billDetails.catTv', fallback: 'TV & Cable', icon: 'tv-outline' },
  { id: 'INTERNET', labelKey: 'billDetails.catInternet', fallback: 'Internet', icon: 'globe-outline' },
];

export default function BillDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, user } = useApp();

  const {
    beneficiary = {},
    preselectedType = 'ALL',
    provider_id,
    operatorName,
  } = route.params || {};

  const { countryCode, countryName } = resolveBeneficiaryCountry(beneficiary, {
    phone: beneficiary.phone || route.params?.phone,
    user,
    fallback: 'NG',
  });

  const [loading, setLoading] = useState(true);
  const [billers, setBillers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(preselectedType || 'ALL');
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [showBillerPicker, setShowBillerPicker] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [accountNumber, setAccountNumber] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [amount, setAmount] = useState('');
  const [toast, setToast] = useState(null);

  // Auto-return countdown timer when country has no utility services
  useEffect(() => {
    let timer;
    if (!loading && billers.length === 0) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading, billers.length]);

  // Safely trigger navigation back when countdown expires
  useEffect(() => {
    if (!loading && billers.length === 0 && countdown === 0) {
      navigation.goBack();
    }
  }, [countdown, loading, billers.length, navigation]);

  // Fetch real billers directly from live Reloadly utility payments API
  useEffect(() => {
    let isMounted = true;
    const fetchBillers = async () => {
      setLoading(true);
      try {
        const baseUrl = getPayBillsApiUrl();
        const res = await fetch(`${baseUrl}/payments/utility/billers/country/${countryCode}`, {
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.content) ? json.content : (Array.isArray(json) ? json : []);
          if (items.length > 0 && isMounted) {
            const formatted = items.map(b => ({
              id: String(b.id || b.billerId || b.operatorId),
              name: b.name || b.operatorName,
              rawType: b.type || '',
              type: (b.type || '').toUpperCase().includes('WATER')
                ? 'WATER'
                : (b.type || '').toUpperCase().includes('TV')
                ? 'TV'
                : (b.type || '').toUpperCase().includes('INTERNET')
                ? 'INTERNET'
                : 'ELECTRICITY',
              serviceType: b.serviceType || 'PREPAID',
              minAmount: parseFloat(b.minLocalTransactionAmount || b.minAmount || 100),
              maxAmount: parseFloat(b.maxLocalTransactionAmount || b.maxAmount || 500000),
              currency: b.localTransactionCurrencyCode || b.currency || 'NGN',
              requiresInvoice: Boolean(b.requiresInvoice),
            }));
            setBillers(formatted);

            // Preselect specific provider if passed by id or operatorName
            let defaultBiller = null;
            if (provider_id) {
              defaultBiller = formatted.find(b => String(b.id) === String(provider_id));
            }
            if (!defaultBiller && operatorName) {
              const opLower = operatorName.toLowerCase();
              defaultBiller = formatted.find(b => b.name.toLowerCase().includes(opLower));
            }
            if (!defaultBiller) {
              defaultBiller = (selectedCategory !== 'ALL' ? formatted.find(b => b.type === selectedCategory) : null) || formatted[0];
            }
            setSelectedBiller(defaultBiller);
            if (defaultBiller && defaultBiller.type && selectedCategory === 'ALL') {
              setSelectedCategory(defaultBiller.type);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Error loading billers from backend:', err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBillers();
    return () => { isMounted = false; };
  }, [countryCode, provider_id, operatorName]);

  // Filter billers by selected category
  const filteredBillers = useMemo(() => {
    if (selectedCategory === 'ALL') return billers;
    return billers.filter(b => b.type === selectedCategory);
  }, [billers, selectedCategory]);

  // Handle category change
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'ALL') {
      if (!selectedBiller && billers.length > 0) setSelectedBiller(billers[0]);
    } else {
      const match = billers.find(b => b.type === catId);
      if (match) setSelectedBiller(match);
    }
  };

  const currency = selectedBiller?.currency || 'NGN';
  const minLimit = selectedBiller?.minAmount || 1000;
  const maxLimit = selectedBiller?.maxAmount || 300000;

  const handleQuickAmount = (val) => {
    setAmount(String(val));
  };

  const handleCheckout = () => {
    if (!selectedBiller) {
      setToast({ title: t('common.error', 'Error'), message: t('billDetails.errorSelectBiller', 'Please select a service provider.') });
      return;
    }
    if (!accountNumber.trim()) {
      setToast({ title: t('common.error', 'Error'), message: t('billDetails.errorEnterAccount', 'Please enter your account or meter number.') });
      return;
    }
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (!numAmount || isNaN(numAmount) || numAmount < minLimit) {
      setToast({
        title: t('common.error', 'Error'),
        message: `${t('billDetails.errorMinAmount', 'Minimum amount is')} ${minLimit.toLocaleString()} ${currency}.`,
      });
      return;
    }
    if (numAmount > maxLimit) {
      setToast({
        title: t('common.error', 'Error'),
        message: `${t('billDetails.errorMaxAmount', 'Maximum amount is')} ${maxLimit.toLocaleString()} ${currency}.`,
      });
      return;
    }

    // Direct handoff into native PayBillsSummaryScreen
    navigation.navigate('PayBillsSummaryScreen', {
      serviceType: 'utilities',
      beneficiary,
      provider: {
        id: selectedBiller.id,
        name: selectedBiller.name,
        operatorName: selectedBiller.name,
        type: selectedBiller.type,
      },
      meterNumber: accountNumber.trim(),
      accountNumber: accountNumber.trim(),
      referenceId: referenceId.trim() || undefined,
      plan: {
        amount: numAmount,
        costAmount: numAmount,
        price: numAmount,
        currency: currency,
        destinationCurrency: currency,
        receiveAmount: numAmount,
        receiveCurrency: currency,
        feeAmount: (numAmount * 0.015).toFixed(2),
      },
    });
  };

  const availableCategories = useMemo(() => {
    const typesFound = new Set(billers.map(b => b.type));
    const cats = [{ id: 'ALL', labelKey: 'billDetails.catAll', fallback: 'All', icon: 'apps-outline' }];
    if (typesFound.has('ELECTRICITY')) cats.push({ id: 'ELECTRICITY', labelKey: 'billDetails.catElectricity', fallback: 'Electricity', icon: 'flash-outline' });
    if (typesFound.has('WATER')) cats.push({ id: 'WATER', labelKey: 'billDetails.catWater', fallback: 'Water', icon: 'water-outline' });
    if (typesFound.has('TV')) cats.push({ id: 'TV', labelKey: 'billDetails.catTv', fallback: 'TV & Cable', icon: 'tv-outline' });
    if (typesFound.has('INTERNET')) cats.push({ id: 'INTERNET', labelKey: 'billDetails.catInternet', fallback: 'Internet', icon: 'globe-outline' });
    return cats;
  }, [billers]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>

        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.screenHeaderTitle}>{t('billDetails.screenTitle', 'Pay Utility Bill')}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.centerLoadingState}>
            <ActivityIndicator size="large" color="#FFC759" />
            <Text style={styles.loadingStateText}>
              {t('selectUtilityTypePage.connecting', 'Connecting to utility network...')}
            </Text>
          </View>
        ) : billers.length === 0 ? (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Web-matching Header */}
              <View style={styles.webHeaderArea}>
                <Text style={styles.webHeaderTitle}>
                  {t('selectUtilityTypePage.beneficiaryDestination', 'Your beneficiary is in')}{' '}
                  <Text style={styles.webHeaderCountry}>{countryName}</Text>
                </Text>
                <Text style={styles.webHeaderSubtitle}>
                  {t('selectUtilityTypePage.whichType', 'Which type of bill would you like to pay?')}
                </Text>
              </View>

              {/* Main Glowing Card */}
              <View style={styles.soonCardWrapper}>
                {/* Ambient Gold Glow Aura */}
                <View style={styles.soonGoldAura} />

                <View style={styles.soonCard}>
                  {/* Icon with SOON badge */}
                  <View style={styles.soonIconCenterWrapper}>
                    <View style={styles.soonIconBox}>
                      <Ionicons name="time-outline" size={40} color="#FFC759" />
                    </View>
                    <View style={styles.soonPillBadge}>
                      <Text style={styles.soonPillText}>{t('selectUtilityTypePage.soon', 'SOON')}</Text>
                    </View>
                  </View>

                  {/* Title: Utilities in Algeria */}
                  <Text style={styles.soonTitleText}>
                    {t('selectUtilityTypePage.utilitiesIn', 'Utilities in')}{' '}
                    <Text style={styles.soonTitleGoldText}>{countryName}</Text>
                  </Text>

                  {/* Expansion message */}
                  <Text style={styles.soonDescText}>
                    {t('selectUtilityTypePage.expansion', 'Expansion in progress! We are integrating local utility providers for this region to bring you seamless bill payments soon.')}
                  </Text>

                  {/* Countdown returning button */}
                  <TouchableOpacity
                    style={styles.returningPillBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.85}
                  >
                    <View style={styles.returningDot} />
                    <Text style={styles.returningBtnText}>
                      {t('selectUtilityTypePage.returning', 'RETURNING TO SERVICES IN')} {countdown}S
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Alternative Services Callout */}
              <View style={styles.altServicesCard}>
                <Text style={styles.altServicesTitle}>{t('billDetails.tryAlt', 'You can send digital gift cards or mobile top-up instead.')}</Text>
                <View style={styles.altServiceBtnRow}>
                  <TouchableOpacity
                    style={styles.altServiceBtn}
                    onPress={() => navigation.navigate('ExploreGiftCardsScreen', { beneficiary })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="gift-outline" size={16} color="#071D54" style={{ marginRight: 6 }} />
                    <Text style={styles.altServiceBtnText}>{t('selectService.giftCards', 'Gift Cards')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.altServiceBtn}
                    onPress={() => navigation.navigate('MobileRechargeScreen', { beneficiary })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="phone-portrait-outline" size={16} color="#071D54" style={{ marginRight: 6 }} />
                    <Text style={styles.altServiceBtnText}>{t('selectService.topupMobile', 'Top-up Mobile')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Help Note Shield Card */}
              <View style={styles.helpShieldCard}>
                <View style={styles.helpShieldIconCircle}>
                  <Ionicons name="shield-outline" size={20} color="#FFC759" />
                </View>
                <Text style={styles.helpShieldCardText}>
                  {t('selectUtilityTypePage.helpNote', "If your beneficiary's provider or utility type is not supported, it may mean we currently do not work with them. Our team is constantly expanding coverage to provide you with the best connectivity services.")}
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Back Button Bar */}
            <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.btnBack, { flex: 1, height: 48 }]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={styles.btnBackText}>{t('common.back', 'Back to Services')}</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

              {/* Secure Payment Tag */}
              <View style={styles.badgeWrapper}>
                <View style={styles.secureBadge}>
                  <View style={styles.goldDot} />
                  <Text style={styles.secureBadgeText}>{t('billDetails.secureTag', 'SECURE PAYMENT')}</Text>
                </View>
              </View>

              {/* Dual-Color Screen Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>
                  {t('billDetails.titleMain', 'Bill')} <Text style={styles.mainTitleGold}>{t('billDetails.titleGold', 'Details')}</Text>
                </Text>
                <Text style={styles.subTitle}>
                  {t('billDetails.payingFor', 'Paying for a beneficiary in')} <Text style={styles.countryHighlight}>{countryName}</Text>.
                  {'\n'}{t('billDetails.provideInfo', 'Please provide the account information below.')}
                </Text>
              </View>

              {/* Dynamic Category Filter Chips */}
              {availableCategories.length > 1 && (
                <View style={styles.categoriesRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    {availableCategories.map(cat => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                          onPress={() => handleSelectCategory(cat.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name={cat.icon} size={15} color={isActive ? '#1A2840' : '#64748B'} style={{ marginRight: 6 }} />
                          <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                            {t(cat.labelKey, cat.fallback)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Form Card */}
              <View style={styles.formCard}>

                {/* Field 1: Service Provider */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('billDetails.serviceProvider', 'SERVICE PROVIDER')}</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowBillerPicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.providerLeft}>
                      <View style={styles.providerIconCircle}>
                        <Ionicons name="flash" size={16} color="#071D54" />
                      </View>
                      <Text style={styles.providerNameText} numberOfLines={1}>
                        {selectedBiller ? selectedBiller.name : t('billDetails.selectProvider', 'Select a provider...')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Field 2: Account / Meter Number */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    {selectedBiller?.serviceType === 'PREPAID'
                      ? t('billDetails.meterNumber', 'METER NUMBER')
                      : t('billDetails.accountNumber', 'ACCOUNT NUMBER')}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('billDetails.enterMeterPlaceholder', 'e.g. 14235890123')}
                    placeholderTextColor="#CBD5E1"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                  />
                </View>

                {/* Field 3: Optional Reference / Invoice ID if required */}
                {selectedBiller?.requiresInvoice && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>{t('billDetails.invoiceNumber', 'INVOICE / BILL ID')}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('billDetails.enterInvoicePlaceholder', 'e.g. INV-99201')}
                      placeholderTextColor="#CBD5E1"
                      value={referenceId}
                      onChangeText={setReferenceId}
                      autoCapitalize="characters"
                    />
                  </View>
                )}

                {/* Field 4: Amount with Quick Amounts */}
                <View style={styles.fieldGroup}>
                  <View style={styles.amountLabelRow}>
                    <Text style={styles.fieldLabel}>{t('billDetails.amountToPay', 'AMOUNT TO PAY')}</Text>
                    <View style={styles.limitBadge}>
                      <Text style={styles.limitBadgeText}>
                        {minLimit.toLocaleString()} - {maxLimit.toLocaleString()} {currency}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.amountInputWrap}>
                    <View style={styles.currencyPrefixBox}>
                      <Text style={styles.currencyPrefixText}>{currency}</Text>
                    </View>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor="#CBD5E1"
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {/* Quick Amount Chips */}
                  <View style={styles.quickAmountsRow}>
                    {[2000, 5000, 10000, 20000].map(val => (
                      <TouchableOpacity
                        key={val}
                        style={styles.quickAmountChip}
                        onPress={() => handleQuickAmount(val)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickAmountChipText}>+{val.toLocaleString()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Field 5: Informational Note Callout */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#0284C7" style={{ marginRight: 10, marginTop: 1 }} />
                  <Text style={styles.infoBoxText}>
                    {t('billDetails.conversionNote', `Please enter the amount in ${currency}. This will be dynamically converted during the final checkout step.`)}
                  </Text>
                </View>

              </View>
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
              <View style={styles.bottomButtonsRow}>
                <TouchableOpacity
                  style={styles.btnBack}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={16} color="#1A2840" style={{ marginRight: 6 }} />
                  <Text style={styles.btnBackText}>{t('common.back', 'Back')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnCheckout}
                  onPress={handleCheckout}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnCheckoutText}>{t('billDetails.checkout', 'CHECKOUT')}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </>
        )}

        {/* Modal: Biller Picker Sheet */}
        <Modal
          visible={showBillerPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBillerPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismissArea} onPress={() => setShowBillerPicker(false)} />
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('billDetails.selectProviderTitle', 'Choose Service Provider')}</Text>
                <TouchableOpacity onPress={() => setShowBillerPicker(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                {filteredBillers.map((biller) => {
                  const isSelected = selectedBiller?.id === biller.id;
                  return (
                    <TouchableOpacity
                      key={biller.id}
                      style={[styles.billerOption, isSelected && styles.billerOptionSelected]}
                      onPress={() => {
                        setSelectedBiller(biller);
                        setShowBillerPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.billerOptionIcon, isSelected && { backgroundColor: '#FFC759' }]}>
                        <Ionicons name="flash-outline" size={18} color="#071D54" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.billerOptionName, isSelected && { color: '#071D54', fontFamily: 'Inter_700Bold' }]}>
                          {biller.name}
                        </Text>
                        <Text style={styles.billerOptionLimits}>
                          {t('billDetails.limit', 'Limit')}: {biller.minAmount.toLocaleString()} - {biller.maxAmount.toLocaleString()} {biller.currency}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#071D54" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Toast Feedback */}
        {!!toast && (
          <View style={styles.toastContainer}>
            <AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} />
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 60,
    zIndex: 999,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  screenHeaderTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  scrollContent: {
    paddingHorizontal: isSmallDevice ? 12 : 18,
    paddingTop: 16,
    paddingBottom: 110,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  secureBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#B45309',
    letterSpacing: 0.6,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  mainTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallDevice ? 24 : 28,
    color: '#1A2840',
    marginBottom: 6,
  },
  mainTitleGold: {
    color: '#FFB800',
  },
  subTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  countryHighlight: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  categoriesRow: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingRight: 10,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    backgroundColor: '#FFC759',
    borderColor: '#FFC759',
  },
  categoryChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  categoryChipTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: isSmallDevice ? 14 : 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  providerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFC759',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  providerNameText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  amountLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  limitBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  limitBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#D97706',
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  currencyPrefix: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  quickAmountsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickAmountChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#475569',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  infoBoxText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnBack: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBackText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  btnCheckout: {
    flex: 1.8,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#20365B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#20365B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnCheckoutText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  modalCloseBtn: {
    padding: 4,
  },
  billerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  billerOptionSelected: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FFC759',
  },
  billerOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billerOptionName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#334155',
  },
  billerOptionLimits: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  centerLoadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingStateText: {
    marginTop: 16,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#20365B',
    letterSpacing: 1,
  },
  webHeaderArea: {
    marginBottom: 20,
    marginTop: 4,
  },
  webHeaderTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallDevice ? 20 : 24,
    color: '#20365B',
    marginBottom: 4,
  },
  webHeaderCountry: {
    color: '#20365B',
  },
  webHeaderSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  soonCardWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  soonGoldAura: {
    position: 'absolute',
    top: 20,
    left: '10%',
    right: '10%',
    height: 140,
    backgroundColor: '#FFC759',
    opacity: 0.18,
    borderRadius: 80,
  },
  soonCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  soonIconCenterWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonIconBox: {
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFC759',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  soonPillBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#20365B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  soonPillText: {
    color: '#FFC759',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
  soonTitleText: {
    fontSize: isSmallDevice ? 20 : 22,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#20365B',
    textAlign: 'center',
    marginBottom: 10,
  },
  soonTitleGoldText: {
    color: '#FFB800',
  },
  soonDescText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#878FA4',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: 24,
  },
  returningPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20365B',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#20365B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  returningDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    marginRight: 10,
  },
  returningBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 1.1,
  },
  altServicesCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  altServicesTitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  altServiceBtnRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  altServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  altServiceBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#071D54',
  },
  helpShieldCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  helpShieldIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpShieldCardText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    lineHeight: 17,
  },
});
