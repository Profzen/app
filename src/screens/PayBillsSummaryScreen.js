import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';
import { getIsoCountryCode, resolveBeneficiaryCountry } from '../utils/countryCurrencyUtils';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const getPayBillsApiUrl = () => {
  let url = process.env.EXPO_PUBLIC_PAY_BILLS_API_URL || 'https://api.dizzitup.com';

  //   if (Platform.OS === 'web') {
  //   url = url.replace('10.0.2.2', typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : 'localhost');
  // } else if (Platform.OS === 'android') {
  //   url = url.replace('localhost', '10.0.2.2');
  // }
  return url.replace(/\/api\/?$/, '');
};
// const PAY_BILLS_URL = process.env.EXPO_PUBLIC_PAY_BILLS_URL || 'https://paybills.dizzitup.com';

export default function PayBillsSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, session, language, t } = useApp();

  const {
    serviceType = 'airtime',
    beneficiary = {},
    provider = {},
    plan = {},
    meterNumber,
    accountNumber,
  } = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState('card'); // Default to 'card' (Ecobank) | 'wallet' | 'momo'
  const [loading, setLoading] = useState(false);
  const [cyberSourceData, setCyberSourceData] = useState(null);
  const [showCyberSourceModal, setShowCyberSourceModal] = useState(false);

  // Delivered vs Total calculation
  const currency = plan.currency || 'USD';
  const deliveredCurrency = plan.destinationCurrency || plan.receiveCurrency || currency;
  const deliveredVal = plan.receiveAmount || plan.amount || '0';
  const totalCost = plan.costAmount || plan.price || deliveredVal;
  const isDifferentCurrency = deliveredCurrency !== currency;
  const feeAmount = isDifferentCurrency
    ? (parseFloat(plan.feeAmount || 0)).toFixed(2)
    : Math.max(0, parseFloat(totalCost) - parseFloat(deliveredVal)).toFixed(2);
  const displayFee = parseFloat(feeAmount) > 0 ? `${feeAmount} ${currency}` : '0.00';

  // Format recipient display
  const recipientName = `${beneficiary.first_name || ''} ${beneficiary.last_name || ''}`.trim() || beneficiary.name || t('paybillsSummary.beneficiary', 'Beneficiary');
  const recipientPhone = beneficiary.phone || beneficiary.phoneNumber || '';
  const providerName = provider.name || provider.operatorName || t('paybillsSummary.operator', 'Provider');

  const getServiceTitle = () => {
    if (serviceType === 'utilities' || serviceType === 'utility') {
      return t('paybillsSummary.utilityTitle', 'Utility Bill Payment');
    }
    if (serviceType === 'gift_cards' || serviceType === 'gift_card') {
      return t('paybillsSummary.giftCardTitle', 'Digital Gift Card');
    }
    return t('paybillsSummary.airtimeTitle', 'Airtime & Data Top-up');
  };

  const getServiceIcon = () => {
    if (serviceType === 'utilities' || serviceType === 'utility') return 'flash-outline';
    if (serviceType === 'gift_cards' || serviceType === 'gift_card') return 'gift-outline';
    return 'phone-portrait-outline';
  };

  const generateCyberSourceHtml = (url, formFields) => {
    const inputs = Object.entries(formFields || {})
      .map(([key, val]) => `<input type="hidden" name="${key}" value="${String(val).replace(/"/g, '&quot;')}" />`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Ecobank CyberSource Checkout</title>
          <style>
            * { box-sizing: border-box; }
            body {
              background-color: #20365B;
              color: #FFFFFF;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 24px;
              text-align: center;
            }
            .card {
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.15);
              border-radius: 20px;
              padding: 32px 24px;
              width: 100%;
              max-width: 340px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.2);
              border-top: 4px solid #FFC759;
              border-radius: 50%;
              width: 44px;
              height: 44px;
              animation: spin 0.8s linear infinite;
              margin-bottom: 18px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .title {
              font-size: 16px;
              font-weight: 700;
              color: #FFFFFF;
              margin-bottom: 6px;
            }
            .subtitle {
              font-size: 12px;
              color: #878FA4;
              line-height: 1.4;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              margin-top: 16px;
              padding: 6px 12px;
              background: rgba(16, 185, 129, 0.15);
              border: 1px solid rgba(16, 185, 129, 0.3);
              border-radius: 20px;
              color: #10B981;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <div class="title">Ecobank Secure Payment</div>
            <div class="subtitle">Connecting securely to CyberSource...</div>
            <div class="badge">🔒 256-BIT SSL ENCRYPTED</div>
          </div>
          <form id="csForm" action="${url}" method="post">
            ${inputs}
          </form>
          <script>
            setTimeout(function() {
              document.getElementById('csForm').submit();
            }, 100);
          </script>
        </body>
      </html>
    `;
  };

  const handleWebViewNavigation = (navState) => {
    const navUrl = navState.url || '';
    if (navUrl.includes('/payments/success') || navUrl.includes('decision=ACCEPT') || navUrl.includes('order-success')) {
      setShowCyberSourceModal(false);
      AppToast.showSuccess(t('paybillsSummary.paymentSuccess', 'Payment completed successfully!'));
      navigation.navigate('PaymentSuccessScreen', {
        transaction: {
          title: getServiceTitle(),
          amount: totalCost,
          currency: currency,
          recipient: recipientName,
          phone: recipientPhone,
          date: new Date().toISOString(),
          orderId: cyberSourceData?.orderId,
        }
      });
    } else if (navUrl.includes('/payments/failure') || navUrl.includes('decision=DECLINE') || navUrl.includes('decision=CANCEL')) {
      setShowCyberSourceModal(false);
      AppToast.showError(t('paybillsSummary.paymentFailed', 'Payment was declined or cancelled. Please try again.'));
    }
  };

  const handleConfirmAndPay = async () => {
    setLoading(true);
    try {
      if (selectedMethod === 'wallet') {
        // DizzitUp Wallet (Crypto/USDC) payment flow
        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        
        // Ensure user is authenticated to use wallet
        if (!session?.access_token) {
          throw new Error(t('paybillsSummary.walletAuthError', 'You must be logged in to use DizzitUp Wallet.'));
        }

        const payload = {
          toAddress: '0xTreasuryAddress', // TODO: Fetch dynamic treasury/merchant address if needed
          amount: parseFloat(totalCost),
          token: currency === 'DZY' ? 'DZY' : 'USDC', // Defaulting to USDC if not DZY
          chain: 'Polygon',
          metadata: { 
            serviceType,
            recipientName,
            recipientPhone,
            orderId: `PB-${Date.now()}`
          }
        };

        const res = await fetch(`${DIZZY_URL}/wallet/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || t('paybillsSummary.walletError', 'Error during wallet payment'));
        }

        AppToast.showSuccess(t('paybillsSummary.orderCreatedSuccess', 'Payment completed successfully!'));
        navigation.navigate('PaymentSuccessScreen', {
          transaction: {
            title: getServiceTitle(),
            amount: totalCost,
            currency: currency,
            recipient: recipientName,
            phone: recipientPhone,
            date: new Date().toISOString(),
            orderId: data.txHash || data.transaction?.id || `PB-${Date.now()}`
          }
        });
        setLoading(false);
        return;
      } else if (selectedMethod === 'card') {
        // Ecobank Card Payment (Visa / Mastercard via CyberSource Secure Acceptance)
        const baseUrl = getPayBillsApiUrl();
        const isAuthUser = Boolean(user?.id);
        const actionRoute = isAuthUser ? 'pay' : 'payAsGuest';
        const endpoint = (serviceType === 'utilities' || serviceType === 'utility')
          ? `${baseUrl}/payments/utility/${actionRoute}`
          : (serviceType === 'gift_cards' || serviceType === 'gift_card')
            ? `${baseUrl}/payments/giftCard/${actionRoute}`
            : `${baseUrl}/payments/airtime/${actionRoute}`;

        const fName = user?.first_name || (recipientName ? recipientName.split(' ')[0] : 'Customer');
        const lName = user?.last_name || (recipientName ? recipientName.split(' ').slice(1).join(' ') : 'DizzitUp');
        const userEmail = user?.email || beneficiary.email || 'customer@dizzitup.com';
        const { countryCode: countryIso } = resolveBeneficiaryCountry(beneficiary, {
          phone: recipientPhone || beneficiary.phone,
          user,
          fallback: 'TG',
        });

        const payload = {
          ...(isAuthUser ? { userID: user.id } : {}),
          amount: parseFloat(totalCost),
          currency: currency,
          operatorId: provider.id || plan.operatorId,
          recipientPhone: recipientPhone,
          recipientcountryCode: countryIso,
          paymentMethod: 'CARD',
          firstName: fName,
          surname: lName,
          email: userEmail,
          senderPhoneNumber: userPhone,
          productType: serviceType,
          senderCity: beneficiary.city || 'Lome',
          benPhoneNumber: recipientPhone,
          benFirstname: beneficiary.first_name || fName,
          benSurname: beneficiary.last_name || lName,
          benEmail: beneficiary.email || userEmail,
          benCity: beneficiary.city || 'Lome',
          benCountry: countryIso,
        };

        let res;
        try {
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (netErr) {
          if (baseUrl !== 'https://api.dizzitup.com') {
            const fallbackEndpoint = endpoint.replace(baseUrl, 'https://api.dizzitup.com');
            res = await fetch(fallbackEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } else {
            throw netErr;
          }
        }

        let data = await res.json();

        // If authenticated user was not found on this backend instance, retry once via payAsGuest
        if (!res.ok && (data.errorCode === 'USER_NOT_FOUND' || res.status === 404) && isAuthUser) {
          const guestEndpoint = endpoint.replace('/pay', '/payAsGuest');
          const guestPayload = { ...payload };
          delete guestPayload.userID;
          const retryRes = await fetch(guestEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestPayload),
          });
          if (retryRes.ok) {
            res = retryRes;
            data = await retryRes.json();
          }
        }

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Payment initiation failed');
        }

        if (data.redirect && data.url && data.formFields) {
          // If running on web, submit the form directly to CyberSource
          if (Platform.OS === 'web' && typeof document !== 'undefined') {
            const form = document.createElement('form');
            form.action = data.url;
            form.method = 'post';
            form.target = '_self';
            document.body.appendChild(form);
            for (const key in data.formFields) {
              if (Object.prototype.hasOwnProperty.call(data.formFields, key)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = data.formFields[key];
                form.appendChild(input);
              }
            }
            form.submit();
            return;
          }

          // On mobile app, open the in-app CyberSource WebView modal
          setCyberSourceData({
            url: data.url,
            formFields: data.formFields,
            orderId: data.orderId || data.orderID,
          });
          setShowCyberSourceModal(true);
        } else if (data.url) {
          await WebBrowser.openBrowserAsync(data.url);
        } else {
          throw new Error(data.error || 'Payment gateway returned invalid response');
        }
      } else if (selectedMethod === 'momo') {
        // Mobile Money Payment (Kkiapay / PawaPay)
        const baseUrl = getPayBillsApiUrl();
        const isAuthUser = Boolean(user?.id);
        const actionRoute = isAuthUser ? 'pay' : 'payAsGuest';
        const endpoint = (serviceType === 'utilities' || serviceType === 'utility')
          ? `${baseUrl}/payments/utility/${actionRoute}`
          : (serviceType === 'gift_cards' || serviceType === 'gift_card')
            ? `${baseUrl}/payments/giftCard/${actionRoute}`
            : `${baseUrl}/payments/airtime/${actionRoute}`;
        const { countryCode: countryIso } = resolveBeneficiaryCountry(beneficiary, {
          phone: recipientPhone || beneficiary.phone,
          user,
          fallback: 'TG',
        });

        const payload = {
          ...(isAuthUser ? { userID: user.id } : {}),
          amount: parseFloat(totalCost),
          currency: currency,
          operatorId: provider.id || plan.operatorId,
          recipientPhone: recipientPhone,
          recipientcountryCode: countryIso,
          paymentMethod: 'MOBILE_MONEY',
          firstName: user?.first_name || (recipientName ? recipientName.split(' ')[0] : 'Customer'),
          surname: user?.last_name || (recipientName ? recipientName.split(' ').slice(1).join(' ') : 'DizzitUp'),
          email: user?.email || beneficiary.email || 'customer@dizzitup.com',
          senderPhoneNumber: user?.phone || recipientPhone,
          benPhoneNumber: recipientPhone,
          benCountry: countryIso,
        };

        let res;
        try {
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (netErr) {
          if (baseUrl !== 'https://api.dizzitup.com') {
            const fallbackEndpoint = endpoint.replace(baseUrl, 'https://api.dizzitup.com');
            res = await fetch(fallbackEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } else {
            throw netErr;
          }
        }

        let data = await res.json();

        // If authenticated user was not found on this backend instance, retry once via payAsGuest
        if (!res.ok && (data.errorCode === 'USER_NOT_FOUND' || res.status === 404) && isAuthUser) {
          const guestEndpoint = endpoint.replace('/pay', '/payAsGuest');
          const guestPayload = { ...payload };
          delete guestPayload.userID;
          const retryRes = await fetch(guestEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestPayload),
          });
          if (retryRes.ok) {
            res = retryRes;
            data = await retryRes.json();
          }
        }

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Payment initiation failed');
        }
        if (data.url) {
          await WebBrowser.openBrowserAsync(data.url);
        } else {
          AppToast.showSuccess(t('paybillsSummary.momoInitiated', 'Mobile Money payment prompt sent to your phone.'));
          navigation.navigate('PaymentSuccessScreen', {
            transaction: {
              title: getServiceTitle(),
              amount: totalCost,
              currency: currency,
              recipient: recipientName,
              phone: recipientPhone,
              date: new Date().toISOString(),
            }
          });
        }
      }
    } catch (err) {
      console.error('Payment execution error:', err);
      const errMsg = err.message || t('paybillsSummary.orderFailed', 'Failed to process order. Please try again.');
      AppToast.showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t('paybillsSummary.title', 'Order Summary')}
          </Text>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconWrapper}>
              <Ionicons name={getServiceIcon()} size={24} color="#20365B" />
            </View>
            <View style={styles.bannerTextWrapper}>
              <Text style={styles.bannerServiceType}>{getServiceTitle()}</Text>
              <Text style={styles.bannerProvider}>{providerName}</Text>
              {plan.planDescription ? (
                <Text style={styles.bannerPlanDesc} numberOfLines={2}>
                  {plan.planDescription}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Recipient Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={16} color="#FFC759" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>{t('paybillsSummary.recipient', 'Recipient')}</Text>
            </View>
            <View style={styles.recipientRow}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientAvatarText}>{recipientName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.recipientDetails}>
                <Text style={styles.recipientNameText} numberOfLines={1}>{recipientName}</Text>
                {recipientPhone ? (
                  <Text style={styles.recipientSubText}>{recipientPhone}</Text>
                ) : null}
                {meterNumber || accountNumber ? (
                  <Text style={styles.recipientSubText}>
                    {meterNumber ? `Meter: ${meterNumber}` : `Acc: ${accountNumber}`}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Payment Breakdown Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={16} color="#FFC759" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>{t('paybillsSummary.paymentSummary', 'Payment Summary')}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('paybillsSummary.deliveredAmount', 'Value Delivered')}</Text>
              <Text style={styles.breakdownValue}>{typeof deliveredVal === 'number' ? deliveredVal.toLocaleString('fr-FR') : deliveredVal} {deliveredCurrency}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('paybillsSummary.serviceFee', 'Service & Processing Fee')}</Text>
              <Text style={styles.breakdownValue}>{displayFee}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('paybillsSummary.totalToPay', 'Total to Pay')}</Text>
              <Text style={styles.totalValue}>{typeof totalCost === 'number' ? totalCost.toLocaleString('fr-FR') : totalCost} {currency}</Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="wallet-outline" size={16} color="#FFC759" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>{t('paybillsSummary.selectPaymentMethod', 'Payment Method')}</Text>
            </View>

            {/* DizzitUp Wallet Option */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'wallet' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('wallet')}
              activeOpacity={0.7}
            >
              <View style={styles.methodRadioOuter}>
                {selectedMethod === 'wallet' && <View style={styles.methodRadioInner} />}
              </View>
              <View style={styles.methodIconBadge}>
                <Ionicons name="flash" size={18} color="#20365B" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{t('paybillsSummary.dizzyWallet', 'DizzitUp Wallet')}</Text>
                <Text style={styles.methodSubtitle} numberOfLines={1}>
                  {t('paybillsSummary.dizzyWalletSub', 'Pay instantly with your crypto balance')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Mobile Money Option */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'momo' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('momo')}
              activeOpacity={0.7}
            >
              <View style={styles.methodRadioOuter}>
                {selectedMethod === 'momo' && <View style={styles.methodRadioInner} />}
              </View>
              <View style={[styles.methodIconBadge, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="phone-portrait" size={18} color="#16A34A" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{t('paybillsSummary.mobileMoney', 'Mobile Money')}</Text>
                <Text style={styles.methodSubtitle} numberOfLines={1}>
                  {t('paybillsSummary.mobileMoneySub', 'Orange, MTN, Moov, Wave')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Card Payment Option */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('card')}
              activeOpacity={0.7}
            >
              <View style={styles.methodRadioOuter}>
                {selectedMethod === 'card' && <View style={styles.methodRadioInner} />}
              </View>
              <View style={[styles.methodIconBadge, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="card" size={18} color="#20365B" />
              </View>
              <View style={styles.methodInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.methodTitle}>{t('paybillsSummary.cardPayment', 'Credit / Debit Card')}</Text>
                  <View style={styles.ecobankTag}>
                    <Text style={styles.ecobankTagText}>Ecobank</Text>
                  </View>
                </View>
                <Text style={styles.methodSubtitle} numberOfLines={1}>
                  {t('paybillsSummary.cardPaymentSub', 'Visa, Mastercard via CyberSource')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Security Guarantee Badge */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.securityText}>
              {t('paybillsSummary.securityNote', '256-Bit SSL Encrypted. Direct & secure payment.')}
            </Text>
          </View>
        </ScrollView>

        {/* Sticky Bottom Action */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handleConfirmAndPay}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#20365B" size="small" />
            ) : (
              <View style={styles.payButtonContent}>
                <Text style={styles.payButtonText}>
                  {t('paybillsSummary.confirmAndPay', 'Confirm & Pay')} • {totalCost} {currency}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#20365B" style={{ marginLeft: 6 }} />
              </View>
            )}
          </TouchableOpacity>
        </SafeAreaView>

        {/* CyberSource / Ecobank Secure Checkout In-App Sheet */}
        <Modal
          visible={showCyberSourceModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowCyberSourceModal(false);
            setCyberSourceData(null);
          }}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowCyberSourceModal(false);
                  setCyberSourceData(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitleText}>Ecobank Secure Checkout</Text>
                <View style={styles.modalSecureBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                  <Text style={styles.modalSecureText}>CyberSource • 256-Bit SSL</Text>
                </View>
              </View>
              <View style={{ width: 36 }} />
            </View>

            {cyberSourceData && (
              <WebView
                source={{
                  html: generateCyberSourceHtml(cyberSourceData.url, cyberSourceData.formFields),
                  baseUrl: 'https://paybills.dizzitup.com',
                }}
                originWhitelist={['*']}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
                onNavigationStateChange={handleWebViewNavigation}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webViewLoader}>
                    <ActivityIndicator size="large" color="#FFC759" />
                    <Text style={styles.webViewLoaderText}>Connecting to Ecobank / CyberSource...</Text>
                  </View>
                )}
              />
            )}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: '#20365B',
  },
  placeholderButton: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerServiceType: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerProvider: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '800',
    color: '#20365B',
    marginTop: 2,
  },
  bannerPlanDesc: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#20365B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#20365B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFC759',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientNameText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: '#20365B',
  },
  recipientSubText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#20365B',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '800',
    color: '#20365B',
  },
  totalValue: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '900',
    color: '#20365B',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  methodCardActive: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFDF7',
  },
  methodRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFC759',
  },
  methodIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '700',
    color: '#20365B',
  },
  methodSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  payButton: {
    backgroundColor: '#FFC759',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '800',
    color: '#20365B',
  },
  ecobankTag: {
    backgroundColor: '#EBF3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  ecobankTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#20365B',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#20365B',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#20365B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleWrap: {
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSecureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  modalSecureText: {
    fontSize: 11,
    color: '#878FA4',
    fontWeight: '600',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#20365B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webViewLoaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
  },
});
