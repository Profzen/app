import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DizzitButton } from '../components/DizzitButton';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';
import { LinearGradient } from 'expo-linear-gradient';
import { getCountryCurrencyInfo, getFullCountryName } from '../utils/countryCurrencyUtils';

const PAY_BILLS_API = process.env.EXPO_PUBLIC_PAY_BILLS_API_URL || 'https://api.dizzitup.com';

export default function MobileRechargeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useApp();
  
  const beneficiary = route.params?.beneficiary || {};
  
  const [loading, setLoading] = useState(true);
  const [operatorData, setOperatorData] = useState(null);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [detectedOperatorId, setDetectedOperatorId] = useState(null);
  const [operatorSearchQuery, setOperatorSearchQuery] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState(beneficiary.phone || beneficiary.address || beneficiary.phone_number || '');

  // Derived currency & FX info for operators
  const senderCurrency = operatorData?.senderCurrencyCode || 'EUR';
  const destCurrency = operatorData?.destinationCurrencyCode || operatorData?.recipientCurrencyCode || senderCurrency;
  const fxRate = operatorData?.fx?.rate || 1;
  const hasFx = Boolean(fxRate && fxRate !== 1 && destCurrency !== senderCurrency);

  const minVal = operatorData?.minAmount != null ? Number(operatorData.minAmount) : 0;
  const maxVal = operatorData?.maxAmount != null ? Number(operatorData.maxAmount) : 0;

  const localMinVal = hasFx ? Math.round(minVal * fxRate) : minVal;
  const rawLocalMax = hasFx ? Math.round(maxVal * fxRate) : maxVal;
  const localMaxVal = (hasFx && rawLocalMax > 1000)
    ? Math.round(rawLocalMax / 100) * 100
    : rawLocalMax;

  const numericCustom = parseFloat(customAmount);
  const liveDeliveredVal = (!isNaN(numericCustom) && numericCustom > 0 && hasFx)
    ? Math.round(numericCustom * fxRate)
    : null;
  
  // Force sync phone number in case route params were delayed
  useEffect(() => {
    const p = beneficiary.phone || beneficiary.address || beneficiary.phone_number;
    if (p && !phoneNumber) {
      setPhoneNumber(p);
    }
  }, [beneficiary]);

  // Helper to parse transparent plans from operator data
  const parsedPlans = React.useMemo(() => {
    if (!operatorData) return [];
    if (operatorData.denominationType !== 'FIXED') return [];

    const localDesc = operatorData.localFixedAmountsDescriptions || {};
    const userDesc = operatorData.fixedAmountsDescriptionsInUserCurrency || {};
    const fixedAmounts = operatorData.fixedAmounts || [];
    const localFixedAmounts = operatorData.localFixedAmounts || [];
    const destCurrency = operatorData.destinationCurrencyCode || 'DZD';
    const fxRate = operatorData.fx?.rate || 1;

    const plans = [];

    if (Array.isArray(localFixedAmounts) && localFixedAmounts.length > 0) {
      localFixedAmounts.forEach((localKey, index) => {
        const numKey = Number(localKey);
        const desc = localDesc[`${numKey.toFixed(2)}`] || localDesc[`${localKey}`] || `${localKey} ${destCurrency}`;

        // Extract receive amount from description (e.g. "DZD500 Top Up" -> 500, or localKey)
        const digitsMatch = desc.match(/\d+(\.\d+)?/);
        const receiveAmt = digitsMatch ? parseFloat(digitsMatch[0]) : numKey;

        // Determine buyer cost
        let costAmt = null;
        for (const [userCost, uDesc] of Object.entries(userDesc)) {
          if (uDesc === desc) {
            costAmt = parseFloat(userCost);
            break;
          }
        }

        if (!costAmt && fixedAmounts[index] !== undefined) {
          const usdVal = fixedAmounts[index];
          const approxRate = (destCurrency === 'DZD' && fxRate < 110) ? 133.277 : fxRate;
          costAmt = parseFloat((usdVal * approxRate).toFixed(2));
        }

        if (!costAmt) {
          costAmt = receiveAmt;
        }

        const fee = Math.max(0, parseFloat((costAmt - receiveAmt).toFixed(2)));

        plans.push({
          id: `plan_${index}_${receiveAmt}`,
          planDescription: desc,
          receiveAmount: receiveAmt,
          costAmount: costAmt,
          feeAmount: fee,
          currency: destCurrency,
          operatorId: operatorData.operatorId || operatorData.id,
        });
      });
    }

    return plans.sort((a, b) => a.receiveAmount - b.receiveAmount);
  }, [operatorData]);

  // Auto-select first plan when plans change
  useEffect(() => {
    if (parsedPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(parsedPlans[0]);
      setSelectedAmount(parsedPlans[0].receiveAmount);
    }
  }, [parsedPlans]);
  
  useEffect(() => {
    const detectOperator = async () => {
      try {
        setLoading(true);
        
        const rawCountry = beneficiary.country_code_iso || beneficiary.country_iso || beneficiary.country || beneficiary.country_name || beneficiary.country_code || '';
        const countryIso = getCountryCurrencyInfo(rawCountry).code.toUpperCase(); // Ensure it's a 2-letter uppercase ISO code
        
        const rawPhone = String(phoneNumber || '').trim();
        const cleanDigits = rawPhone.replace(/\D/g, '');

        if (cleanDigits && cleanDigits.length >= 7) {
          // Dynamic international formatting without any hardcoded countries
          let formattedPhone = '';
          if (rawPhone.startsWith('+')) {
            formattedPhone = `+${cleanDigits}`;
          } else if (cleanDigits.startsWith('00')) {
            formattedPhone = `+${cleanDigits.slice(2)}`;
          } else {
            const dialCode = String(beneficiary.country_dial_code || beneficiary.dial_code || '').replace(/\D/g, '');
            if (dialCode && !cleanDigits.startsWith(dialCode)) {
              formattedPhone = `+${dialCode}${cleanDigits}`;
            } else {
              formattedPhone = `+${cleanDigits}`;
            }
          }

          // 1. Primary: Global carrier detection endpoint (used by the web app)
          try {
            const detectRes = await fetch(`${PAY_BILLS_API}/api/airtime/detect?phoneNumber=${encodeURIComponent(formattedPhone)}`);
            if (detectRes.ok) {
              const detectData = await detectRes.json();
              if (detectData.status === 'DETECTED' && detectData.detectedOperator) {
                const detectedOpId = detectData.detectedOperator.id || detectData.detectedOperator.operatorId;
                const fullOp = (detectData.operators || []).find(
                  (op) => String(op.id) === String(detectedOpId) || String(op.operatorId) === String(detectedOpId)
                ) || detectData.detectedOperator;

                setOperatorData(fullOp);
                setDetectedOperatorId(detectedOpId);
                if (fullOp.denominationType === 'RANGE') {
                  setCustomAmount(String(fullOp.mostPopularAmount || fullOp.suggestedAmounts?.[0] || ''));
                }
                if (Array.isArray(detectData.operators) && detectData.operators.length > 0) {
                  setAvailableOperators(detectData.operators);
                }
                setShowOperatorModal(false);
                setLoading(false);
                return;
              } else if (Array.isArray(detectData.operators) && detectData.operators.length > 0) {
                setAvailableOperators(detectData.operators);
              }
            }
          } catch (detectErr) {
            console.warn('[MobileRecharge] Primary /detect failed, trying fallback:', detectErr);
          }

          // 2. Secondary Fallback: Direct Reloadly autodetect with clean digits
          try {
            const autoRes = await fetch(`${PAY_BILLS_API}/api/airtime/operators/autodetect?phoneNumber=${cleanDigits}&countryCode=${countryIso}`);
            if (autoRes.ok) {
              const autoData = await autoRes.json();
              if (autoData.operatorId || (autoData.id && autoData.name)) {
                setOperatorData(autoData);
                setDetectedOperatorId(autoData.operatorId || autoData.id);
                if (autoData.denominationType === 'RANGE') {
                  setCustomAmount(String(autoData.mostPopularAmount || autoData.suggestedAmounts?.[0] || ''));
                }
                setShowOperatorModal(false);
                setLoading(false);
                return;
              } else if (autoData.status === 'MANUAL_SELECTION' && Array.isArray(autoData.operators)) {
                setAvailableOperators(autoData.operators);
              } else if (Array.isArray(autoData.operators) && autoData.operators.length > 0) {
                setAvailableOperators(autoData.operators);
              }
            }
          } catch (autoErr) {
            console.warn('[MobileRecharge] Direct /autodetect failed:', autoErr);
          }
        }

        // 3. Fallback: If operators not yet loaded, fetch all operators for the country
        if (countryIso && availableOperators.length === 0) {
          try {
            const res = await fetch(`${PAY_BILLS_API}/api/airtime/operators/country/${countryIso}`);
            if (res.ok) {
              const operators = await res.json();
              if (Array.isArray(operators) && operators.length > 0) {
                setAvailableOperators(operators);
              }
            }
          } catch (countryErr) {
            console.warn('[MobileRecharge] Country fetch error:', countryErr);
          }
        }
      } catch (err) {
        console.error("Detect operator error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      detectOperator();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [phoneNumber]);

  const handleOperatorSelect = (op) => {
    setOperatorData(op);
    setSelectedPlan(null);
    setSelectedAmount(null);
    setCustomAmount(op.denominationType === 'RANGE' ? String(op.mostPopularAmount || op.suggestedAmounts?.[0] || '') : '');
    setShowOperatorModal(false);
  };

  const handleContinue = () => {
    if (!operatorData) {
      AppToast.showError(t('mobileRecharge.selectOperator', 'Please select an operator first.'));
      return;
    }
    
    if (operatorData.denominationType === 'FIXED') {
      if (!selectedPlan) {
        AppToast.showError(t('mobileRecharge.selectPackageError', 'Please select a plan to continue.'));
        return;
      }

      navigation.navigate('PayBillsSummaryScreen', {
        serviceType: 'airtime',
        beneficiary: {
          ...beneficiary,
          phone: phoneNumber,
        },
        provider: {
          id: operatorData.operatorId || operatorData.id,
          name: operatorData.name,
          logo: operatorData.logoUrls?.[0] || null,
        },
        plan: {
          amount: selectedPlan.receiveAmount,
          receiveAmount: selectedPlan.receiveAmount,
          costAmount: selectedPlan.costAmount,
          currency: selectedPlan.currency || 'USD',
          planDescription: selectedPlan.planDescription,
        },
      });
    } else {
      const finalAmount = parseFloat(customAmount);
      if (!finalAmount || isNaN(finalAmount)) {
        AppToast.showError(t('mobileRecharge.invalidAmount', 'Please enter a valid amount.'));
        return;
      }
      if (minVal > 0 && finalAmount < minVal) {
        AppToast.showError(t('mobileRecharge.minAmountError', `Minimum amount is ${minVal} ${senderCurrency}`, { minAmount: minVal, currency: senderCurrency }));
        return;
      }
      if (maxVal > 0 && finalAmount > maxVal) {
        AppToast.showError(t('mobileRecharge.maxAmountError', `Maximum amount is ${maxVal} ${senderCurrency}`, { maxAmount: maxVal, currency: senderCurrency }));
        return;
      }

      const deliveredAmount = hasFx ? Math.round(finalAmount * fxRate) : finalAmount;

      navigation.navigate('PayBillsSummaryScreen', {
        serviceType: 'airtime',
        beneficiary: {
          ...beneficiary,
          phone: phoneNumber,
        },
        provider: {
          id: operatorData.operatorId || operatorData.id,
          name: operatorData.name,
          logo: operatorData.logoUrls?.[0] || null,
        },
        plan: {
          amount: finalAmount,
          receiveAmount: deliveredAmount,
          costAmount: finalAmount,
          currency: senderCurrency,
          destinationCurrency: destCurrency,
          planDescription: hasFx 
            ? `${finalAmount} ${senderCurrency} (≈ ${deliveredAmount.toLocaleString('fr-FR')} ${destCurrency}) Airtime`
            : `${finalAmount} ${senderCurrency} Airtime`,
        },
        pivotScreen: route.params?.pivotScreen,
        pivotParams: route.params?.pivotParams,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            const pivotScreen = route.params?.pivotScreen;
            const pivotParams = route.params?.pivotParams;
            if (pivotScreen) {
              navigation.navigate(pivotScreen, pivotParams);
            } else {
              navigation.goBack();
            }
          }}>
            <Ionicons name="chevron-back" size={28} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('mobileRecharge.title', 'Airtime Top-up')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Beneficiary Card - Premium Style */}
          <LinearGradient
            colors={['#20365B', '#162541']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.beneficiaryCard}
          >
            <View style={styles.beneficiaryHeader}>
              <Text style={styles.beneficiaryTitle}>{t('mobileRecharge.sendingTo', 'SENDING TO')}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeBeneficiaryBtn}>
                <Ionicons name="pencil" size={14} color="#FFC759" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.beneficiaryInfoRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(beneficiary.first_name?.[0] || beneficiary.name?.[0] || '?').toUpperCase()}
                </Text>
              </View>
              <View style={styles.beneficiaryDetails}>
                <Text style={styles.beneficiaryName}>{beneficiary.first_name || beneficiary.name || 'Beneficiary'}</Text>
                <TextInput 
                  style={styles.beneficiaryPhoneInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter Phone Number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
                {beneficiary.country && (
                   <View style={styles.locationBadge}>
                     <Ionicons name="location" size={10} color="#FFFFFF" />
                     <Text style={styles.locationText}>{beneficiary.city ? `${beneficiary.city}, ` : ''}{getFullCountryName(beneficiary.country)}</Text>
                   </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFC759" />
              <Text style={styles.loadingText}>
                {t('mobileRecharge.detecting', 'Detecting Operator...')}
              </Text>
            </View>
          ) : (
            <>
              {/* Detection Success Banner - Parity with Web */}
              {detectedOperatorId && operatorData && (
                <View style={styles.detectedBanner}>
                  <Ionicons name="flash" size={15} color="#059669" style={{ marginRight: 8 }} />
                  <Text style={styles.detectedBannerText}>
                    {t('mobileRecharge.detectedBannerPrefix', 'Operator detected: ')}
                    <Text style={styles.detectedBannerBold}>{operatorData.name}</Text>
                    {t('mobileRecharge.detectedBannerSuffix', '. You can still change it below.')}
                  </Text>
                </View>
              )}

              {/* Operator Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('mobileRecharge.operator', 'Network Operator')}</Text>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.operatorSelector, 
                  !operatorData && styles.operatorSelectorEmpty,
                  detectedOperatorId && styles.operatorSelectorDetected
                ]} 
                onPress={() => setShowOperatorModal(true)}
                disabled={availableOperators.length === 0 && !operatorData}
              >
                {operatorData ? (
                  <View style={styles.operatorRow}>
                    <View style={styles.operatorLogoContainer}>
                      {operatorData.logoUrls?.[0] ? (
                        <Image source={{ uri: operatorData.logoUrls[0] }} style={styles.operatorLogo} resizeMode="contain" />
                      ) : (
                        <Text style={styles.operatorLogoFallback}>{operatorData.name?.substring(0, 2).toUpperCase()}</Text>
                      )}
                    </View>
                    <View style={styles.operatorTextInfo}>
                      <View style={styles.operatorNameRow}>
                        <Text style={styles.operatorName}>{operatorData.name}</Text>
                        {detectedOperatorId && (operatorData.id === detectedOperatorId || operatorData.operatorId === detectedOperatorId) && (
                          <View style={styles.autoDetectedBadge}>
                            <Ionicons name="flash" size={9} color="#FFFFFF" />
                            <Text style={styles.autoDetectedBadgeText}>{t('mobileRecharge.autoDetected', 'AUTO-DETECTED')}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.operatorCountry}>
                        {getFullCountryName(operatorData.country?.name || beneficiary.country || '')} • {t('mobileRecharge.instant', 'Instant')}
                      </Text>
                    </View>
                    <View style={styles.changeOperatorBtn}>
                      <Text style={styles.changeOperatorText}>{t('mobileRecharge.changeOperator', 'Change')}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#20365B" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.operatorRow}>
                    <View style={[styles.operatorLogoContainer, { backgroundColor: '#F3F4F6' }]}>
                      <Ionicons name="cellular" size={20} color="#9CA3AF" />
                    </View>
                    <Text style={styles.noOperatorText}>{t('mobileRecharge.selectOperatorManually', 'Tap to select an operator')}</Text>
                    <Ionicons name="chevron-down-circle" size={24} color="#20365B" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Select Amount / Plan Section */}
              {operatorData && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {operatorData.denominationType === 'FIXED' 
                        ? t('mobileRecharge.selectPackage', 'Select a Top-up Plan')
                        : t('mobileRecharge.amount', 'Select Amount')}
                    </Text>
                  </View>
                  
                  {operatorData.denominationType === 'FIXED' ? (
                    <View style={styles.plansContainer}>
                      {parsedPlans.map((plan) => {
                        const isSelected = selectedPlan?.id === plan.id;
                        return (
                          <TouchableOpacity
                            key={plan.id}
                            style={[styles.planCard, isSelected && styles.planCardSelected]}
                            onPress={() => {
                              setSelectedPlan(plan);
                              setSelectedAmount(plan.receiveAmount);
                            }}
                            activeOpacity={0.75}
                          >
                            {/* Left: Recipient amount */}
                            <View style={styles.planLeftCol}>
                              <View style={styles.planBadgeRow}>
                                <View style={[styles.planBadge, isSelected && styles.planBadgeSelected]}>
                                  <Ionicons name="flash" size={10} color={isSelected ? '#B45309' : '#FFC759'} />
                                  <Text style={[styles.planBadgeText, isSelected && styles.planBadgeTextSelected]}>
                                    {t('mobileRecharge.fixedPlanBadge', 'Fixed Plan')}
                                  </Text>
                                </View>
                              </View>
                              <Text style={[styles.planReceiveAmount, isSelected && styles.planReceiveAmountSelected]}>
                                {plan.receiveAmount.toLocaleString('fr-FR')} {plan.currency}
                              </Text>
                              <Text style={styles.planReceiveLabel}>
                                {t('mobileRecharge.recipientReceives', 'Recipient receives')}
                              </Text>
                            </View>

                            {/* Right: Buyer pays */}
                            <View style={styles.planRightCol}>
                              <View style={[styles.planCostPill, isSelected && styles.planCostPillSelected]}>
                                <Text style={[styles.planCostText, isSelected && styles.planCostTextSelected]}>
                                  {plan.costAmount.toLocaleString('fr-FR')} {plan.currency}
                                </Text>
                              </View>
                              <Text style={styles.planCostLabel}>
                                {t('mobileRecharge.youPay', 'You pay')}
                              </Text>

                              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}

                      {/* Transparent Cost Breakdown Card */}
                      {selectedPlan && (
                        <View style={styles.breakdownCard}>
                          <View style={styles.breakdownHeader}>
                            <Ionicons name="receipt-outline" size={16} color="#FFC759" />
                            <Text style={styles.breakdownTitle}>
                              {t('mobileRecharge.costBreakdown', 'Payment Summary')}
                            </Text>
                          </View>

                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>
                              {t('mobileRecharge.recipientReceives', 'Recipient receives')}
                            </Text>
                            <Text style={styles.breakdownValueHighlight}>
                              {selectedPlan.receiveAmount.toLocaleString('fr-FR')} {selectedPlan.currency}
                            </Text>
                          </View>

                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>
                              {t('mobileRecharge.feesAndTaxes', 'Operator fees & taxes')}
                            </Text>
                            <Text style={styles.breakdownValue}>
                              +{selectedPlan.feeAmount.toLocaleString('fr-FR')} {selectedPlan.currency}
                            </Text>
                          </View>

                          <View style={styles.breakdownDivider} />

                          <View style={styles.breakdownRowTotal}>
                            <Text style={styles.breakdownTotalLabel}>
                              {t('mobileRecharge.totalToPay', 'Total to pay')}
                            </Text>
                            <Text style={styles.breakdownTotalValue}>
                              {selectedPlan.costAmount.toLocaleString('fr-FR')} {selectedPlan.currency}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={[styles.amountInputBox, isAmountFocused && styles.amountInputBoxFocused]}>
                      <View style={styles.amountInputHeader}>
                        <Text style={styles.amountInputSublabel}>
                          {t('mobileRecharge.enterAmountLabel', 'ENTER AMOUNT')}
                        </Text>
                        <View style={styles.currencyBadge}>
                          <Text style={styles.currencyBadgeText}>{senderCurrency}</Text>
                        </View>
                      </View>

                      <View style={styles.amountInputRow}>
                        <TextInput 
                          style={styles.customAmountInput} 
                          placeholder="0.00"
                          placeholderTextColor="#878FA4"
                          keyboardType="decimal-pad"
                          value={customAmount}
                          onChangeText={setCustomAmount}
                          onFocus={() => setIsAmountFocused(true)}
                          onBlur={() => setIsAmountFocused(false)}
                          selectionColor="#FFC759"
                        />
                        {customAmount.length > 0 && (
                          <TouchableOpacity 
                            onPress={() => setCustomAmount('')} 
                            style={styles.clearAmountBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="close-circle" size={18} color="#878FA4" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {liveDeliveredVal !== null && (
                        <View style={styles.liveConversionRow}>
                          <Ionicons name="flash" size={13} color="#FFC759" />
                          <Text style={styles.liveConversionText}>
                            {t('mobileRecharge.recipientReceives', 'Recipient receives')} <Text style={styles.liveConversionHighlight}>≈ {liveDeliveredVal.toLocaleString('fr-FR')} {destCurrency}</Text>
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {operatorData.denominationType === 'RANGE' && Array.isArray(operatorData.suggestedAmounts) && operatorData.suggestedAmounts.length > 0 && (
                    <View style={styles.suggestedAmountsContainer}>
                      <Text style={styles.suggestedAmountsLabel}>{t('mobileRecharge.popularAmounts', 'Popular amounts')}</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedAmountsScroll}>
                        {operatorData.suggestedAmounts.slice(0, 8).map((amt) => {
                          const isAmtSelected = String(customAmount) === String(amt);
                          return (
                            <TouchableOpacity
                              key={`sugg_${amt}`}
                              style={[styles.suggestedChip, isAmtSelected && styles.suggestedChipSelected]}
                              onPress={() => setCustomAmount(String(amt))}
                              activeOpacity={0.7}
                            >
                              {isAmtSelected && <View style={styles.suggestedChipActiveDot} />}
                              <Text style={[styles.suggestedChipText, isAmtSelected && styles.suggestedChipTextSelected]}>
                                {amt} {senderCurrency}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                  {operatorData.denominationType === 'RANGE' && (
                    <View style={styles.rangeCard}>
                      <View style={styles.rangeCardLeft}>
                        <View style={styles.rangeShieldWrapper}>
                          <Ionicons name="shield-checkmark" size={16} color="#FFC759" />
                        </View>
                        <View style={styles.rangeTextContainer}>
                          <Text style={styles.rangeCardLabel}>
                            {t('mobileRecharge.availableRange', 'AVAILABLE RANGE')}
                          </Text>
                          <Text style={styles.rangeCardValues}>
                            {minVal} {senderCurrency} <Text style={styles.rangeCardTo}>{t('mobileRecharge.rangeTo', 'to')}</Text> {maxVal} {senderCurrency}
                          </Text>
                          {hasFx && (
                            <View style={styles.rangeDeliveredRow}>
                              <Ionicons name="phone-portrait-outline" size={12} color="#878FA4" style={{ marginRight: 4 }} />
                              <Text style={styles.rangeDeliveredText}>
                                {t('mobileRecharge.deliversLabel', 'Delivers')}: <Text style={styles.rangeDeliveredHighlight}>{localMinVal.toLocaleString('fr-FR')} {destCurrency}</Text> {t('mobileRecharge.rangeTo', 'to')} <Text style={styles.rangeDeliveredHighlight}>{localMaxVal.toLocaleString('fr-FR')} {destCurrency}</Text>
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <DizzitButton 
            title={
              selectedPlan 
                ? `${t('mobileRecharge.continueToPay', 'Pay')} • ${selectedPlan.costAmount.toLocaleString('fr-FR')} ${selectedPlan.currency}`
                : t('btnContinue', 'Continue')
            } 
            onPress={handleContinue} 
            disabled={loading || !operatorData || (operatorData.denominationType === 'FIXED' && !selectedPlan)}
          />
        </View>

        {/* Operator Selection Modal */}
        <Modal
          visible={showOperatorModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOperatorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('mobileRecharge.chooseOperator', 'Select Network')}</Text>
                <TouchableOpacity onPress={() => setShowOperatorModal(false)} style={styles.closeModalBtn}>
                  <Ionicons name="close" size={24} color="#1A2840" />
                </TouchableOpacity>
              </View>

              {availableOperators.length > 3 && (
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t('mobileRecharge.searchOperators', 'Search operators...')}
                    placeholderTextColor="#9CA3AF"
                    value={operatorSearchQuery}
                    onChangeText={setOperatorSearchQuery}
                  />
                  {operatorSearchQuery ? (
                    <TouchableOpacity onPress={() => setOperatorSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
              
              <ScrollView style={styles.operatorList} showsVerticalScrollIndicator={false}>
                {availableOperators
                  .filter((op) => !operatorSearchQuery || op.name?.toLowerCase().includes(operatorSearchQuery.toLowerCase()))
                  .map((op) => {
                    const isDetected = detectedOperatorId && (op.id === detectedOperatorId || op.operatorId === detectedOperatorId);
                    const isSelected = operatorData?.id === op.id || operatorData?.operatorId === op.id;

                    return (
                      <TouchableOpacity 
                        key={op.id} 
                        style={[styles.operatorListItem, isSelected && styles.operatorListItemActive]}
                        onPress={() => handleOperatorSelect(op)}
                      >
                        <View style={styles.operatorLogoContainer}>
                          {op.logoUrls?.[0] ? (
                            <Image source={{ uri: op.logoUrls[0] }} style={styles.operatorLogo} resizeMode="contain" />
                          ) : (
                            <Text style={styles.operatorLogoFallback}>{op.name?.substring(0, 2).toUpperCase()}</Text>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.operatorListName}>{op.name}</Text>
                          {isDetected && (
                            <View style={[styles.autoDetectedBadge, { alignSelf: 'flex-start', marginTop: 4 }]}>
                              <Ionicons name="flash" size={8} color="#FFFFFF" />
                              <Text style={styles.autoDetectedBadgeText}>{t('mobileRecharge.autoDetected', 'AUTO-DETECTED')}</Text>
                            </View>
                          )}
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                {availableOperators.length === 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                     <Text style={{ fontFamily: 'Inter_500Medium', color: '#6B7280', textAlign: 'center' }}>
                       {t('mobileRecharge.noOperatorsFound', 'No operators found for this number.')}
                     </Text>
                  </View>
                )}
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, backgroundColor: '#F9FAFB' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  beneficiaryCard: { borderRadius: 24, padding: 20, marginBottom: 28, shadowColor: '#20365B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  beneficiaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  beneficiaryTitle: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, color: '#9CA3AF' },
  changeBeneficiaryBtn: { backgroundColor: 'rgba(255,199,89,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  beneficiaryInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  avatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#20365B' },
  beneficiaryDetails: { flex: 1 },
  beneficiaryName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#FFFFFF', marginBottom: 4 },
  beneficiaryPhoneInput: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#D1D5DB', marginBottom: 6, padding: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  locationText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#FFFFFF', marginLeft: 4 },

  loadingContainer: { padding: 40, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  loadingText: { marginTop: 16, fontFamily: 'Inter_500Medium', color: '#6B7280' },

  sectionHeader: { marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  
  operatorSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  operatorSelectorEmpty: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  operatorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  operatorLogoContainer: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginRight: 14 },
  operatorLogo: { width: '80%', height: '80%', resizeMode: 'contain' },
  operatorLogoFallback: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840' },
  operatorTextInfo: { flex: 1 },
  operatorName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840' },
  operatorCountry: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#6B7280', marginTop: 2 },
  noOperatorText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#6B7280' },

  amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amountCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: 'transparent' },
  amountCardSelected: { backgroundColor: '#FFFDF0', borderColor: '#FFC759', shadowColor: '#FFC759', shadowOpacity: 0.2, shadowRadius: 8 },
  amountText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  amountTextSelected: { color: '#B45309' },

  /* Transparent Plan Cards & Cost Breakdown */
  plansContainer: { gap: 12, marginBottom: 16 },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFDF5',
    shadowColor: '#FFC759',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  planLeftCol: { flex: 1, paddingRight: 12 },
  planBadgeRow: { flexDirection: 'row', marginBottom: 6 },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  planBadgeSelected: { backgroundColor: '#FFEDB3' },
  planBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planBadgeTextSelected: { color: '#92400E' },
  planReceiveAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 2,
  },
  planReceiveAmountSelected: { color: '#1A2840' },
  planReceiveLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  planRightCol: { alignItems: 'flex-end', justifyContent: 'center' },
  planCostPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 4,
  },
  planCostPillSelected: { backgroundColor: '#20365B' },
  planCostText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#374151',
  },
  planCostTextSelected: { color: '#FFFFFF' },
  planCostLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },

  /* Breakdown Summary Card */
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  breakdownValueHighlight: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#10B981',
  },
  breakdownValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#4B5563',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  breakdownRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  breakdownTotalLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  breakdownTotalValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#20365B',
  },
  
  /* Amount Card & Input (Official Colour Chart: #20365B, #878FA4, #B9B9B9, #0E0E0E, #FFC759, #FFFFFF) */
  amountInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(185, 185, 185, 0.35)',
    padding: 16,
    shadowColor: '#0E0E0E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  amountInputBoxFocused: {
    borderColor: '#20365B',
    shadowOpacity: 0.08,
  },
  amountInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  amountInputSublabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#878FA4',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  currencyBadge: {
    backgroundColor: 'rgba(32, 54, 91, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currencyBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#20365B',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(185, 185, 185, 0.25)',
  },
  customAmountInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#20365B',
    padding: 0,
  },
  clearAmountBtn: {
    padding: 4,
    marginLeft: 8,
  },
  liveConversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 199, 89, 0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.35)',
  },
  liveConversionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#0E0E0E',
  },
  liveConversionHighlight: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#20365B',
  },

  footer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '80%', paddingHorizontal: 24, paddingTop: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840' },
  closeModalBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  operatorList: { paddingBottom: 40 },
  operatorListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  operatorListName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840' },

  /* Detection Banner (Parity with Web) */
  detectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  detectedBannerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#065F46',
    lineHeight: 18,
  },
  detectedBannerBold: {
    fontFamily: 'Inter_700Bold',
    color: '#065F46',
  },

  /* Operator Card Enhancements */
  operatorSelectorDetected: {
    borderColor: '#10B981',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  operatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  autoDetectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  autoDetectedBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  changeOperatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  changeOperatorText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#20365B',
  },

  /* Suggested Amounts (Smart Pills adhering to brand palette) */
  suggestedAmountsContainer: {
    marginTop: 16,
  },
  suggestedAmountsLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#878FA4',
    marginBottom: 8,
  },
  suggestedAmountsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  suggestedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(185, 185, 185, 0.35)',
  },
  suggestedChipSelected: {
    backgroundColor: '#20365B',
    borderColor: '#20365B',
    shadowColor: '#20365B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestedChipActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFC759',
    marginRight: 6,
  },
  suggestedChipText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#878FA4',
  },
  suggestedChipTextSelected: {
    color: '#FFFFFF',
  },

  /* Range Card */
  rangeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(185, 185, 185, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rangeShieldWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 199, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeTextContainer: {
    flex: 1,
  },
  rangeCardLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#878FA4',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  rangeCardValues: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#20365B',
  },
  rangeCardTo: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#878FA4',
  },
  rangeDeliveredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  rangeDeliveredText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#878FA4',
  },
  rangeDeliveredHighlight: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#20365B',
    fontSize: 11,
  },

  /* Search in Modal */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
    padding: 0,
  },
  operatorListItemActive: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
});
