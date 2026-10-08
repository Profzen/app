import React, { useState, useEffect, useMemo } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';
import CryptoIcon from '../components/CryptoIcon';
import WalletIcon from '../components/WalletIcon';
import { currencyRateService } from '../services/currencyRateService';
import { getIsoCountryCode, resolveBeneficiaryCountry, getCountryFromPhone } from '../utils/countryCurrencyUtils';
import { ALL_COUNTRIES } from '../utils/countriesData';
import { isSmallScreen } from '../utils/responsive';
import { PinConfirmationModal } from '../components/PinConfirmationModal';
import { useRef } from 'react';
import QRCode from 'qrcode';
import Svg, { Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const isSmallDevice = isSmallScreen || width <= 380;

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

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const pinResolveRef = useRef(null);
  
  const [cryptoQrModalVisible, setCryptoQrModalVisible] = useState(false);
  const [cryptoQrPayload, setCryptoQrPayload] = useState(null);
  const [cryptoInvoiceUrl, setCryptoInvoiceUrl] = useState('');

  const requestPinAuth = () => {
    return new Promise((resolve) => {
      pinResolveRef.current = resolve;
      setPinModalVisible(true);
    });
  };

  const handlePinSuccess = () => {
    setPinModalVisible(false);
    if (pinResolveRef.current) {
      pinResolveRef.current(true);
      pinResolveRef.current = null;
    }
  };

  const handlePinCancel = () => {
    setPinModalVisible(false);
    if (pinResolveRef.current) {
      pinResolveRef.current(false);
      pinResolveRef.current = null;
    }
  };

  const {
    serviceType = 'airtime',
    beneficiary = {},
    provider = {},
    plan = {},
    meterNumber,
    accountNumber,
  } = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState('card'); // Default to 'card' (Ecobank) | 'wallet' | 'crypto' | 'momo'
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cyberSourceData, setCyberSourceData] = useState(null);
  const [showCyberSourceModal, setShowCyberSourceModal] = useState(false);

  // DZY Wallet Tokens & Live Balances (Mirroring web OrderSummary)
  const [selectedDzyToken, setSelectedDzyToken] = useState('usdt');
  const [walletBalances, setWalletBalances] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  const dzyTokens = [
    { id: 'usdt', name: 'USDT', symbol: 'USDT', description: 'Tether USD Stablecoin' },
    { id: 'usdc', name: 'USDC', symbol: 'USDC', description: 'USD Coin Stablecoin' },
    { id: 'eurc', name: 'EURC', symbol: 'EURC', description: 'Euro Coin Stablecoin' },
    { id: 'dzy',  name: 'DZY',  symbol: 'DZY',  description: 'DizzitUp Reward Tokens' },
  ];

  // Popular External Web3 Wallets (MetaMask, Coinbase, Trust, Binance)
  const [selectedExternalWallet, setSelectedExternalWallet] = useState('metamask');
  const popularWallets = [
    { id: 'metamask', name: 'MetaMask', symbol: 'ETH', desc: 'App & Browser Extension', tag: 'Popular', color: '#F6851B', bg: '#FFF7ED' },
    { id: 'binance', name: 'Binance Web3', symbol: 'BNB', desc: 'Binance App & DeFi', tag: 'Fast', color: '#F3BA2F', bg: '#FEF9C3' },
    { id: 'coinbase', name: 'Coinbase Wallet', symbol: 'BASE', desc: 'Self-custody Web3', tag: 'Easy', color: '#0052FF', bg: '#EFF6FF' },
    { id: 'trust', name: 'Trust Wallet', symbol: 'POL', desc: 'Multi-chain Mobile', tag: 'Multi-chain', color: '#0500FF', bg: '#EEF2FF' },
  ];

  // Fetch DZYwallet balances when wallet method is selected
  useEffect(() => {
    if (selectedMethod !== 'wallet' || !session?.access_token) return;
    let cancelled = false;
    const fetchWalletBalances = async () => {
      setWalletLoading(true);
      try {
        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
          DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        }
        const res = await fetch(`${DIZZY_URL}/wallet/balance`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (!cancelled && data) {
          const list = Array.isArray(data) ? data : data.balances || [];
          setWalletBalances(list);

          // Auto-select token: prioritize a token with sufficient balance, then any positive balance
          const positiveTokens = dzyTokens.filter((tItem) => {
            const b = list.find((item) => (item.token || item.symbol)?.toLowerCase() === tItem.id);
            return parseFloat(b?.balance || 0) > 0;
          });
          if (positiveTokens.length > 0) {
            const sufficient = positiveTokens.find((tItem) => {
              const b = list.find((item) => (item.token || item.symbol)?.toLowerCase() === tItem.id);
              const bal = parseFloat(b?.balance || 0);
              const needed = tItem.id === 'dzy' ? numTotalCost * 10 : numTotalCost;
              return bal >= needed;
            });
            setSelectedDzyToken(sufficient ? sufficient.id : positiveTokens[0].id);
          }
        }
      } catch (err) {
        console.warn('[PayBillsSummary] Error fetching wallet balances:', err);
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    };
    fetchWalletBalances();
    return () => { cancelled = true; };
  }, [selectedMethod, session?.access_token, numTotalCost]);



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

  // DZY Wallet Cost & Balance Check
  const numTotalCost = parseFloat(totalCost || 0);
  const requiredDzyAmount = selectedDzyToken === 'dzy' ? numTotalCost * 10 : numTotalCost;

  // Filter dzyTokens to only show tokens with positive balance (> 0)
  const availableDzyTokens = useMemo(() => {
    return dzyTokens.filter((tItem) => {
      const balItem = walletBalances.find(
        (b) => (b.token || b.symbol)?.toLowerCase() === tItem.id
      );
      return parseFloat(balItem?.balance || 0) > 0;
    });
  }, [walletBalances]);

  const currentCoinBalance = walletBalances.find(
    (b) => (b.token || b.symbol)?.toLowerCase() === selectedDzyToken
  )?.balance || 0;
  const parsedCoinBalance = parseFloat(currentCoinBalance || 0);
  const hasInsufficientBalance = selectedMethod === 'wallet' && !walletLoading && (availableDzyTokens.length === 0 || parsedCoinBalance < requiredDzyAmount);

  // Ecobank FX & Multi-Currency Breakdown
  // Official BCEAO/BEAC fixed parity (1 EUR = 655.957 FCFA) with live currencyRateService support
  const liveEurToXof = currencyRateService.convert(1, 'EUR', 'XOF');
  const EUR_TO_XOF = (liveEurToXof && liveEurToXof > 500) ? liveEurToXof : 655.957;
  const upperCur = (currency || 'USD').toUpperCase();
  let estimatedEurAmount = 0;
  let estimatedFcfaAmount = 0;

  if (upperCur === 'EUR') {
    estimatedEurAmount = numTotalCost;
    estimatedFcfaAmount = Math.round(numTotalCost * EUR_TO_XOF);
  } else if (upperCur === 'XOF' || upperCur === 'FCFA') {
    estimatedFcfaAmount = Math.round(numTotalCost);
    estimatedEurAmount = parseFloat((numTotalCost / EUR_TO_XOF).toFixed(2));
  } else {
    // Multi-currency conversion via currencyRateService (handles DZD, NGN, KES, USD, etc.)
    const convertedToEur = currencyRateService.convert(numTotalCost, upperCur, 'EUR');
    if (convertedToEur && convertedToEur > 0) {
      estimatedEurAmount = parseFloat(convertedToEur.toFixed(2));
      estimatedFcfaAmount = Math.round(estimatedEurAmount * EUR_TO_XOF);
    } else {
      estimatedEurAmount = parseFloat((numTotalCost / 1.08).toFixed(2));
      estimatedFcfaAmount = Math.round(estimatedEurAmount * EUR_TO_XOF);
    }
  }

  const formattedFcfa = estimatedFcfaAmount.toLocaleString('fr-FR');
  const formattedEur = estimatedEurAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedDelivered = typeof deliveredVal === 'number'
    ? deliveredVal.toLocaleString('fr-FR')
    : deliveredVal;

  // Minimum Order Check ($1.00 USD required by Reloadly processing gateway)
  const usdEquivalent = upperCur === 'USD'
    ? numTotalCost
    : (currencyRateService.convert(numTotalCost, upperCur, 'USD') || (numTotalCost / 1.08));
  const isBelowMinimumAmount = numTotalCost > 0 && usdEquivalent < 0.99;
  const minAmountInCurrency = currencyRateService.convert(1, 'USD', upperCur) || 1;
  const formattedMinAmount = minAmountInCurrency ? minAmountInCurrency.toFixed(2) : '1.00';

  // Format recipient display
  const recipientName = `${beneficiary.first_name || ''} ${beneficiary.last_name || ''}`.trim() || beneficiary.name || t('paybillsSummary.beneficiary', 'Beneficiary');
  const recipientPhone = beneficiary.phone || beneficiary.phoneNumber || '';
  const providerName = provider.name || provider.operatorName || t('paybillsSummary.operator', 'Provider');

  const { countryCode: countryIso } = resolveBeneficiaryCountry(beneficiary, {
    phone: recipientPhone,
    user,
    fallback: 'TG',
  });
  
  const senderCountryIso = getIsoCountryCode(user?.country || user?.country_code || user?.country_name) 
    || (user?.phone ? getCountryFromPhone(user.phone) : null) || 'FR';

  const momoSupportedCountries = ['TG', 'BJ', 'CI', 'SN', 'ML', 'BF', 'NE', 'GW'];
  const isMomoSupported = momoSupportedCountries.includes(senderCountryIso);
  const countryObj = ALL_COUNTRIES.find(c => c.code === senderCountryIso);
  const senderCountryName = countryObj ? (countryObj.translations?.[language] || countryObj.name) : senderCountryIso;

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
            ${formFields?.amount ? `<div style="margin-top: 12px; font-size: 13px; color: #FFC759; font-weight: 700;">Billed in FCFA (XOF): ${formFields.amount} XOF</div>` : ''}
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
        pivotScreen: route.params?.pivotScreen,
        pivotParams: route.params?.pivotParams,
        transaction: {
          title: getServiceTitle(),
          amount: totalCost,
          currency: currency,
          recipient: recipientName,
          phone: recipientPhone,
          date: new Date().toISOString(),
          orderId: cyberSourceData?.orderId,
          pivotScreen: route.params?.pivotScreen,
          pivotParams: route.params?.pivotParams,
        }
      });
    } else if (navUrl.includes('/payments/failure') || navUrl.includes('decision=DECLINE') || navUrl.includes('decision=CANCEL')) {
      setShowCyberSourceModal(false);
      AppToast.showError(t('paybillsSummary.paymentFailed', 'Payment was declined or cancelled. Please try again.'));
    }
  };

  const handleConfirmAndPay = async () => {
    // Prompt for PIN/Biometrics first
    const isAuthenticated = await requestPinAuth();
    if (!isAuthenticated) return;

    setPaymentError(null);
    if (isBelowMinimumAmount) {
      const msg = t('paybillsSummary.minAmountNotice', 'Minimum transaction amount is $1.00 USD (approx. {{minAmount}} {{currency}}).', {
        minAmount: formattedMinAmount,
        currency: upperCur,
      });
      setPaymentError(msg);
      AppToast.showError(msg);
      return;
    }
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

        if (hasInsufficientBalance) {
          throw new Error(
            t('paybillsSummary.insufficientBalanceDesc', 'Insufficient {{coin}} balance. Required: {{needed}}, Available: {{bal}}', {
              coin: selectedDzyToken.toUpperCase(),
              needed: requiredDzyAmount.toFixed(2),
              bal: parsedCoinBalance.toFixed(2),
            })
          );
        }

        const payload = {
          toAddress: process.env.EXPO_PUBLIC_TREASURY_ADDRESS || '0xTreasuryAddress',
          amount: requiredDzyAmount,
          token: selectedDzyToken.toUpperCase(),
          chain: 'polygon', // FIXED: Lowercase 'polygon' prevents contract lookup failure
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
          pivotScreen: route.params?.pivotScreen,
          pivotParams: route.params?.pivotParams,
          transaction: {
            title: getServiceTitle(),
            amount: `${requiredDzyAmount.toFixed(2)} ${selectedDzyToken.toUpperCase()}`,
            currency: selectedDzyToken.toUpperCase(),
            recipient: recipientName,
            phone: recipientPhone,
            date: new Date().toISOString(),
            orderId: data.txHash || data.transaction?.id || `PB-${Date.now()}`,
            pivotScreen: route.params?.pivotScreen,
            pivotParams: route.params?.pivotParams,
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
          productId: provider.id || plan.productId || plan.operatorId,
          benName: beneficiary.name || `${fName} ${lName}`.trim(),
          recipientPhone: recipientPhone,
          recipientcountryCode: countryIso,
          paymentMethod: 'CARD',
          firstName: fName,
          surname: lName,
          email: userEmail,
          senderPhoneNumber: user?.phone || recipientPhone || '',
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
          productId: provider.id || plan.productId || plan.operatorId,
          benName: beneficiary.name || `${user?.first_name || 'Customer'} ${user?.last_name || 'DizzitUp'}`.trim(),
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
            pivotScreen: route.params?.pivotScreen,
            pivotParams: route.params?.pivotParams,
            transaction: {
              title: getServiceTitle(),
              amount: totalCost,
              currency: currency,
              recipient: recipientName,
              phone: recipientPhone,
              date: new Date().toISOString(),
              pivotScreen: route.params?.pivotScreen,
              pivotParams: route.params?.pivotParams,
            }
          });
        }
      } else if (selectedMethod === 'crypto') {
        // External Web3 Wallet payment (MetaMask, Coinbase, Binance, Trust via NOWPayments crypto invoice)
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
          productId: provider.id || plan.productId || plan.operatorId,
          benName: beneficiary.name || `${fName} ${lName}`.trim(),
          recipientPhone: recipientPhone,
          recipientcountryCode: countryIso,
          paymentMethod: 'CRYPTO',
          preferredWallet: selectedExternalWallet,
          firstName: fName,
          surname: lName,
          email: userEmail,
          senderPhoneNumber: user?.phone || recipientPhone || '',
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
          throw new Error(data.error || data.message || 'Crypto invoice initiation failed');
        }

        if (data.url) {
          const qrData = QRCode.create(data.url, { errorCorrectionLevel: 'H' });
          setCryptoQrPayload(qrData);
          setCryptoInvoiceUrl(data.url);
          setCryptoQrModalVisible(true);
        } else {
          throw new Error(data.error || 'Payment gateway returned invalid response');
        }
      }
    } catch (err) {
      console.warn('Payment execution warning:', err?.message || err);
      const errMsg = err?.message || t('paybillsSummary.orderFailed', 'Failed to process order. Please try again.');
      setPaymentError(errMsg);
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
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              const pivotScreen = route.params?.pivotScreen;
              const pivotParams = route.params?.pivotParams;
              if (pivotScreen) {
                navigation.navigate(pivotScreen, pivotParams);
              } else {
                navigation.goBack();
              }
            }} 
            activeOpacity={0.7}
          >
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
              <View style={[styles.methodIconBadge, { backgroundColor: '#FFF8E7' }]}>
                <Ionicons name="wallet" size={18} color="#D97706" />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle} numberOfLines={1} ellipsizeMode="tail">
                    {t('paybillsSummary.dizzyWallet', 'DZYwallet')}
                  </Text>
                  <View style={styles.stablecoinTag}>
                    <Text style={styles.stablecoinTagText}>{t('paybillsSummary.instantBadge', 'Instant')}</Text>
                  </View>
                </View>
                <Text style={styles.methodSubtitle} numberOfLines={1} ellipsizeMode="tail">
                  {t('paybillsSummary.dizzyWalletSub', 'Pay directly with your USDT, USDC, EURC or DZY')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Sub-tokens selection when DZYwallet is selected */}
            {selectedMethod === 'wallet' && (
              <View style={styles.subTokensContainer}>
                <View style={styles.subTokensHeader}>
                  <Text style={styles.subTokensHeaderTitle}>{t('paybillsSummary.payWith', 'PAY WITH')}</Text>
                  {walletLoading && <ActivityIndicator size="small" color="#FFC759" />}
                </View>

                {availableDzyTokens.length > 0 ? (
                  availableDzyTokens.map((tItem) => {
                    const balItem = walletBalances.find(
                      (b) => (b.token || b.symbol)?.toLowerCase() === tItem.id
                    );
                    const bal = parseFloat(balItem?.balance || 0);
                    const needed = tItem.id === 'dzy' ? numTotalCost * 10 : numTotalCost;
                    const isInsufficient = bal < needed;
                    const isSelected = selectedDzyToken === tItem.id;

                    return (
                      <TouchableOpacity
                        key={tItem.id}
                        style={[styles.subTokenRow, isSelected && styles.subTokenRowActive]}
                        onPress={() => setSelectedDzyToken(tItem.id)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.subTokenLeft}>
                          <View style={styles.subTokenIconWrapper}>
                            <CryptoIcon symbol={tItem.symbol} size={22} />
                          </View>
                          <View>
                            <Text style={styles.subTokenName}>{tItem.name}</Text>
                            <Text style={styles.subTokenDesc}>{tItem.description}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.subTokenRight}>
                          <Text style={[styles.subTokenBalance, isInsufficient ? styles.balanceInsufficient : styles.balanceSufficient]}>
                            {bal.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tItem.name}
                          </Text>
                          {isSelected && (
                            <View style={styles.subTokenSelectedDot}>
                              <Ionicons name="checkmark" size={10} color="#20365B" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : !walletLoading ? (
                  <View style={styles.emptyWalletBox}>
                    <View style={styles.emptyWalletIconCircle}>
                      <Ionicons name="wallet-outline" size={24} color="#D97706" />
                    </View>
                    <Text style={styles.emptyWalletTitle}>
                      {t('paybillsSummary.noActiveTokens', 'No active balance in DZYwallet')}
                    </Text>
                    <Text style={styles.emptyWalletDesc}>
                      {t('paybillsSummary.noActiveTokensDesc', 'Top up USDT, USDC or EURC to pay your bills instantly with zero network fees.')}
                    </Text>
                    <TouchableOpacity
                      style={styles.topUpCtaBtn}
                      onPress={() => navigation.navigate('TopUpWalletScreen', {
                        pivotScreen: 'PayBillsSummaryScreen',
                        pivotParams: route.params,
                      })}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.topUpCtaText}>{t('paybillsSummary.topUpWallet', 'Top-Up DZYwallet')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Insufficient Balance Box + Top Up Button */}
                {availableDzyTokens.length > 0 && hasInsufficientBalance && (
                  <View style={styles.insufficientBox}>
                    <View style={styles.insufficientTextRow}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                      <Text style={styles.insufficientTitle}>
                        {t('paybillsSummary.insufficientBalance', 'Insufficient {{coin}} balance.', { coin: selectedDzyToken.toUpperCase() })}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.topUpCtaBtn}
                      onPress={() => navigation.navigate('TopUpWalletScreen', {
                        pivotScreen: 'PayBillsSummaryScreen',
                        pivotParams: route.params,
                      })}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.topUpCtaText}>{t('paybillsSummary.topUpWallet', 'Top-Up DZYwallet')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* External Web3 Wallets Option */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'crypto' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('crypto')}
              activeOpacity={0.7}
            >
              <View style={styles.methodRadioOuter}>
                {selectedMethod === 'crypto' && <View style={styles.methodRadioInner} />}
              </View>
              <View style={[styles.methodIconBadge, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="wallet-outline" size={18} color="#4F46E5" />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle} numberOfLines={1} ellipsizeMode="tail">
                    {t('paybillsSummary.externalWallets', 'External Web3 Wallet')}
                  </Text>
                  <View style={styles.web3Tag}>
                    <Text style={styles.web3TagText}>{t('paybillsSummary.popularBadge', 'Popular')}</Text>
                  </View>
                </View>
                <Text style={styles.methodSubtitle} numberOfLines={1} ellipsizeMode="tail">
                  {t('paybillsSummary.externalWalletsSub', 'MetaMask, Coinbase, Trust Wallet, Binance')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* External Wallets Sub-Selector when 'crypto' is selected */}
            {selectedMethod === 'crypto' && (
              <View style={styles.walletsContainer}>
                <View style={styles.subTokensHeader}>
                  <Text style={styles.subTokensHeaderTitle}>
                    {t('paybillsSummary.selectWallet', 'POPULAR WALLETS')}
                  </Text>
                </View>

                <View style={styles.walletsGrid}>
                  {popularWallets.map((w) => {
                    const isSelected = selectedExternalWallet === w.id;
                    return (
                      <TouchableOpacity
                        key={w.id}
                        style={[styles.walletItemCard, isSelected && styles.walletItemCardActive]}
                        onPress={() => setSelectedExternalWallet(w.id)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.walletIconWrap, { backgroundColor: w.bg }]}>
                          <WalletIcon walletId={w.id} size={24} />
                        </View>
                        <View style={styles.walletItemInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.walletItemName}>{w.name}</Text>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={14} color="#FFC759" />
                            )}
                          </View>
                          <Text style={styles.walletItemDesc}>{w.desc}</Text>
                        </View>
                        <View style={[styles.walletTagBadge, { backgroundColor: w.bg }]}>
                          <Text style={[styles.walletTagText, { color: w.color }]}>{w.tag}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Instant crypto invoice info notice */}
                <View style={styles.cryptoInfoNotice}>
                  <Ionicons name="information-circle" size={16} color="#4F46E5" style={{ marginRight: 6 }} />
                  <Text style={styles.cryptoInfoNoticeText}>
                    {t('paybillsSummary.cryptoInvoiceNotice', 'Instant invoice with QR code and address for USDT, USDC, BTC, and ETH. Compatible with any Web3 wallet.')}
                  </Text>
                </View>
              </View>
            )}

            {/* Credit Card Option */}
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
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle} numberOfLines={1} ellipsizeMode="tail">
                    {t('paybillsSummary.cardPayment', 'Credit / Debit Card')}
                  </Text>
                  <View style={styles.ecobankTag}>
                    <Text style={styles.ecobankTagText}>Ecobank</Text>
                  </View>
                </View>
                <Text style={styles.methodSubtitle} numberOfLines={1} ellipsizeMode="tail">
                  {t('paybillsSummary.cardPaymentSub', 'Visa, Mastercard via CyberSource')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Ecobank Intermediary FX Section when Card is selected */}
            {selectedMethod === 'card' && (
              <View style={styles.ecobankFxContainer}>
                {/* Header */}
                <View style={styles.ecobankFxHeader}>
                  <View style={styles.ecobankFxHeaderTitleRow}>
                    <View style={styles.ecobankIconCircle}>
                      <Ionicons name="card" size={13} color="#1E3A8A" />
                    </View>
                    <Text style={styles.ecobankFxHeaderTitle}>
                      {t('paybillsSummary.ecobankFxTitle', 'Ecobank Payment Breakdown')}
                    </Text>
                  </View>
                  <View style={styles.cybersourceBadge}>
                    <Ionicons name="shield-checkmark" size={10} color="#10B981" />
                    <Text style={styles.cybersourceBadgeText}>CyberSource</Text>
                  </View>
                </View>

                <Text style={styles.ecobankFxMessage}>
                  {t(
                    'paybillsSummary.ecobankFxMessage',
                    'You will pay this service with your Visa or Mastercard card on Ecobank secure payment gateway:'
                  )}
                </Text>

                {/* Main Card with Amounts & Currency Peg */}
                <View style={styles.ecobankFxBox}>
                  {/* Row 1: FCFA Billed Amount */}
                  <View style={styles.ecobankFxRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ecobankFxPrimaryAmount}>{formattedFcfa} FCFA</Text>
                      <Text style={styles.ecobankFxRowSub}>{t('paybillsSummary.ecobankBilled', 'Billed amount by Ecobank (XOF)')}</Text>
                    </View>
                    <View style={styles.ecobankOfficialTag}>
                      <Text style={styles.ecobankOfficialTagText}>{t('paybillsSummary.billedCurrency', 'Billed Currency')}</Text>
                    </View>
                  </View>

                  {/* Fixed Exchange Rate Peg Chip */}
                  <View style={styles.ecobankFxPegBanner}>
                    <Ionicons name="swap-horizontal" size={13} color="#64748B" />
                    <Text style={styles.ecobankFxPegText}>
                      1 EUR ≈ 655.957 FCFA ({t('paybillsSummary.rateNote', 'Fixed Peg Rate')})
                    </Text>
                  </View>

                  {/* Row 2: EUR Card Equivalent */}
                  <View style={styles.ecobankFxRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ecobankFxSecondaryAmount}>
                        {formattedEur} EUR {upperCur !== 'EUR' && (
                          <Text style={styles.ecobankFxSecondarySubAmount}>
                            (≈ {totalCost} {currency})
                          </Text>
                        )}
                      </Text>
                      <Text style={styles.ecobankFxRowSub}>{t('paybillsSummary.cardEquivalent', 'Card charge equivalent')}</Text>
                    </View>
                  </View>

                  {/* Row 3: Recipient Delivered Amount (if different currency) */}
                  {isDifferentCurrency && (
                    <>
                      <View style={styles.ecobankFxDivider} />
                      <View style={styles.ecobankFxRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ecobankFxDeliveredAmount}>
                            {formattedDelivered} {deliveredCurrency}
                          </Text>
                          <Text style={styles.ecobankFxRowSub}>{t('paybillsSummary.recipientReceives', 'Delivered to recipient account')}</Text>
                        </View>
                        <Ionicons name="checkmark-done-circle" size={18} color="#10B981" />
                      </View>
                    </>
                  )}
                </View>

                {/* Trust & Guarantee Micro-Pills */}
                <View style={styles.ecobankFxPillRow}>
                  <View style={styles.allFeesPill}>
                    <Ionicons name="checkmark-circle" size={13} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={styles.allFeesPillText}>
                      {t('paybillsSummary.allFeesTaxesIncluded', 'All fees & Taxes included')}
                    </Text>
                  </View>
                  <View style={styles.noHiddenFeesPill}>
                    <Ionicons name="shield-checkmark" size={12} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.noHiddenFeesText}>
                      {t('paybillsSummary.noHiddenFees', 'No hidden conversion charges')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Mobile Money Option */}
            <TouchableOpacity
              style={[
                styles.methodCard, 
                selectedMethod === 'momo' && styles.methodCardActive,
                !isMomoSupported && { opacity: 0.5 }
              ]}
              onPress={() => isMomoSupported && setSelectedMethod('momo')}
              activeOpacity={isMomoSupported ? 0.7 : 1}
              disabled={!isMomoSupported}
            >
              <View style={styles.methodRadioOuter}>
                {selectedMethod === 'momo' && <View style={styles.methodRadioInner} />}
              </View>
              <View style={[styles.methodIconBadge, { backgroundColor: isMomoSupported ? '#F0FDF4' : '#F1F5F9' }]}>
                <Ionicons name="phone-portrait" size={18} color={isMomoSupported ? "#16A34A" : "#94A3B8"} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, !isMomoSupported && { color: '#94A3B8' }]}>{t('paybillsSummary.mobileMoney', 'Mobile Money')}</Text>
                <Text style={styles.methodSubtitle} numberOfLines={1}>
                  {isMomoSupported 
                    ? t('paybillsSummary.mobileMoneySub', 'Orange, MTN, Moov, Wave')
                    : t('paybillsSummary.momoNotAvailable', 'Not available in {{country}}', { country: senderCountryName })
                  }
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Informative UI Error Banner (for server/runtime errors) */}
          {paymentError && (
            <View style={styles.errorAlertCard}>
              <View style={styles.errorAlertHeader}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorAlertTitle}>
                  {t('paybillsSummary.errorNotice', 'Unable to Proceed')}
                </Text>
                <TouchableOpacity onPress={() => setPaymentError(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.errorAlertDesc}>{paymentError}</Text>
            </View>
          )}

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
          {isBelowMinimumAmount && (
            <View style={styles.minAmountStickyNote}>
              <Ionicons name="alert-circle" size={13} color="#B45309" style={{ marginRight: 5 }} />
              <Text style={styles.minAmountStickyText} numberOfLines={1}>
                {t('paybillsSummary.minOrderShort', 'Min. order: $1.00 USD (~{{min}} {{cur}})', { min: formattedMinAmount, cur: upperCur })}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.payButton, 
              (loading || isBelowMinimumAmount || (selectedMethod === 'wallet' && walletLoading)) && styles.payButtonDisabled
            ]}
            onPress={() => {
              if (selectedMethod === 'wallet' && hasInsufficientBalance) {
                navigation.navigate('TopUpWalletScreen', {
                  pivotScreen: 'PayBillsSummaryScreen',
                  pivotParams: route.params,
                });
                return;
              }
              handleConfirmAndPay();
            }}
            disabled={loading || isBelowMinimumAmount || (selectedMethod === 'wallet' && walletLoading)}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#20365B" size="small" />
            ) : isBelowMinimumAmount ? (
              <View style={styles.payButtonContent}>
                <Ionicons name="lock-closed" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={[styles.payButtonText, { color: '#64748B', fontSize: 13 }]}>
                  {t('paybillsSummary.belowMinBtn', 'Below $1.00 min.')}
                </Text>
              </View>
            ) : selectedMethod === 'wallet' && hasInsufficientBalance ? (
              <View style={styles.payButtonContent}>
                <Ionicons name="add-circle" size={16} color="#20365B" style={{ marginRight: 6 }} />
                <Text style={styles.payButtonText}>
                  {t('paybillsSummary.topUpToPay', 'Top-Up to Pay')}
                </Text>
              </View>
            ) : (
              <View style={styles.payButtonContent}>
                <Text style={styles.payButtonText}>
                  {selectedMethod === 'wallet'
                    ? `${t('paybillsSummary.confirmAndPay', 'Confirm')} • ${requiredDzyAmount.toFixed(2)} ${selectedDzyToken.toUpperCase()}`
                    : selectedMethod === 'crypto'
                      ? `${t('paybillsSummary.payWithCrypto', 'Pay')} • ${totalCost} ${currency}`
                      : selectedMethod === 'card'
                        ? `${t('paybillsSummary.payWithCard', 'Pay')} • ${formattedFcfa} FCFA`
                        : `${t('paybillsSummary.payWithMomo', 'Pay')} • ${totalCost} ${currency}`}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#20365B" style={{ marginLeft: 6 }} />
              </View>
            )}
          </TouchableOpacity>
        </SafeAreaView>

        {/* Crypto QR Code Modal */}
        <Modal
          visible={cryptoQrModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCryptoQrModalVisible(false)}
        >
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalContainer}>
              <View style={styles.qrModalHeader}>
                <Text style={styles.qrModalTitle}>{t('paybillsSummary.scanToPay', 'Scan to Pay')}</Text>
                <TouchableOpacity onPress={() => setCryptoQrModalVisible(false)} style={styles.qrModalCloseBtn}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.qrModalSub}>
                {t('paybillsSummary.scanInstructions', 'Scan this QR code with your external wallet to complete the payment.')}
              </Text>
              
              <View style={styles.cryptoQrCodeWrapper}>
                {cryptoQrPayload && (
                  <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                    <Svg width={220} height={220} viewBox={`0 0 ${cryptoQrPayload.modules.size} ${cryptoQrPayload.modules.size}`}>
                      <Rect width={cryptoQrPayload.modules.size} height={cryptoQrPayload.modules.size} fill="#FFFFFF" />
                      {Array.from(cryptoQrPayload.modules.data).map((cell, index) =>
                        cell ? (
                          <Rect
                            key={index}
                            x={index % cryptoQrPayload.modules.size}
                            y={Math.floor(index / cryptoQrPayload.modules.size)}
                            width="1"
                            height="1"
                            fill="#20365B"
                            rx="0.25"
                            ry="0.25"
                          />
                        ) : null
                      )}
                    </Svg>
                    <View style={{
                      position: 'absolute',
                      backgroundColor: '#FFFFFF',
                      padding: 4,
                      borderRadius: 12,
                      elevation: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                    }}>
                      <Image 
                        source={require('../../assets/brand/finalLogo_512x512.png')} 
                        style={{ width: 44, height: 44, borderRadius: 8 }}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.qrPayManuallyBtn}
                onPress={() => {
                  setCryptoQrModalVisible(false);
                  WebBrowser.openBrowserAsync(cryptoInvoiceUrl);
                }}
              >
                <Ionicons name="open-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.qrPayManuallyText}>{t('paybillsSummary.payManually', 'Pay manually')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <PinConfirmationModal
          visible={pinModalVisible}
          onSuccess={handlePinSuccess}
          onCancel={handlePinCancel}
          amount={selectedMethod === 'wallet' ? requiredDzyAmount : totalCost}
          tokenName={selectedMethod === 'wallet' ? selectedDzyToken.toUpperCase() : currency}
        />

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

            {/* Intermediary FX Recap Strip in Modal */}
            <View style={styles.modalFxStrip}>
              <Ionicons name="card-outline" size={14} color="#FFC759" style={{ marginRight: 6 }} />
              <Text style={styles.modalFxStripText}>
                {t('paybillsSummary.ecobankModalNote', 'Billed in FCFA by Ecobank:')}{' '}
                <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>
                  {cyberSourceData?.formFields?.amount ? `${cyberSourceData.formFields.amount} XOF` : `${formattedFcfa} FCFA`}
                </Text>{' '}
                ({formattedEur} EUR equivalent) • {t('paybillsSummary.allFeesTaxesIncluded', 'All fees & Taxes included')}
              </Text>
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
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
    overflow: 'hidden',
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
    marginRight: isSmallDevice ? 8 : 10,
    flexShrink: 0,
  },
  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFC759',
  },
  methodIconBadge: {
    width: isSmallDevice ? 34 : 36,
    height: isSmallDevice ? 34 : 36,
    borderRadius: 10,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 8 : 10,
    flexShrink: 0,
  },
  methodInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 2,
  },
  methodTitle: {
    fontSize: isSmallDevice ? 12 : 13.5,
    fontWeight: '700',
    color: '#20365B',
    flexShrink: 1,
  },
  methodSubtitle: {
    fontSize: isSmallDevice ? 10 : 11,
    color: '#9CA3AF',
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
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    alignItems: 'center',
  },
  minAmountStickyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
    maxWidth: 290,
  },
  minAmountStickyText: {
    fontSize: 10.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#92400E',
  },
  payButton: {
    backgroundColor: '#FFC759',
    height: 46,
    width: '90%',
    maxWidth: 360,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    alignSelf: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    flex: 1,
  },
  payButtonText: {
    fontSize: isSmallDevice ? 12 : 13.5,
    fontWeight: '800',
    color: '#20365B',
    flexShrink: 1,
    textAlign: 'center',
  },
  ecobankTag: {
    backgroundColor: '#EBF3FF',
    paddingHorizontal: isSmallDevice ? 6 : 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexShrink: 0,
  },
  ecobankTagText: {
    fontSize: isSmallDevice ? 9.5 : 10,
    fontWeight: '700',
    color: '#20365B',
  },
  stablecoinTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: isSmallDevice ? 6 : 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexShrink: 0,
  },
  stablecoinTagText: {
    fontSize: isSmallDevice ? 9.5 : 10,
    fontWeight: '800',
    color: '#D97706',
  },
  subTokensContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  subTokensHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  subTokensHeaderTitle: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  subTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  subTokenRowActive: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFDF5',
  },
  subTokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subTokenIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTokenName: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#20365B',
  },
  subTokenDesc: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
  },
  subTokenRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subTokenBalance: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  balanceSufficient: {
    color: '#10B981',
  },
  balanceInsufficient: {
    color: '#EF4444',
  },
  subTokenSelectedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insufficientBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    gap: 8,
  },
  emptyWalletBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  emptyWalletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  emptyWalletTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    fontFamily: 'Inter_700Bold',
    color: '#92400E',
    textAlign: 'center',
  },
  emptyWalletDesc: {
    fontSize: isSmallDevice ? 10.5 : 11.5,
    fontFamily: 'Inter_400Regular',
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  insufficientTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insufficientTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#DC2626',
    flex: 1,
  },
  topUpCtaBtn: {
    backgroundColor: '#20365B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 4,
  },
  topUpCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
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
  web3Tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: isSmallDevice ? 6 : 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    flexShrink: 0,
  },
  web3TagText: {
    fontSize: isSmallDevice ? 9.5 : 10,
    fontWeight: '800',
    color: '#4F46E5',
  },
  walletsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  walletsGrid: {
    gap: 8,
  },
  walletItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  walletItemCardActive: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFDF5',
  },
  walletIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  walletItemInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  walletItemName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#20365B',
  },
  walletItemDesc: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
  walletTagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  walletTagText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  cryptoInfoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  cryptoInfoNoticeText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#3730A3',
    lineHeight: 15,
  },
  errorAlertCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  warningAlertCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  errorAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  errorAlertTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    fontFamily: 'Inter_700Bold',
    color: '#DC2626',
    flex: 1,
  },
  errorAlertDesc: {
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: 'Inter_400Regular',
    color: '#7F1D1D',
    lineHeight: 16,
  },
  ecobankFxContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  ecobankFxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  ecobankFxHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  ecobankIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ecobankFxHeaderTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
    flexShrink: 1,
  },
  cybersourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    gap: 4,
    flexShrink: 0,
  },
  cybersourceBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  ecobankFxMessage: {
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 12,
  },
  ecobankFxBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallDevice ? 10 : 12,
    marginBottom: 10,
  },
  ecobankFxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  ecobankFxPrimaryAmount: {
    fontSize: isSmallDevice ? 18 : 22,
    fontFamily: 'Inter_900Black',
    color: '#0F172A',
  },
  ecobankFxSecondaryAmount: {
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
  },
  ecobankFxSecondarySubAmount: {
    fontSize: isSmallDevice ? 12 : 13,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  ecobankFxDeliveredAmount: {
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
  },
  ecobankFxRowSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 1,
  },
  ecobankOfficialTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  ecobankOfficialTagText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#1D4ED8',
  },
  ecobankFxPegBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 8,
    gap: 6,
  },
  ecobankFxPegText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
  },
  ecobankFxDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  ecobankFxPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  allFeesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  allFeesPillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
  },
  noHiddenFeesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noHiddenFeesText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
  },
  modalFxStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalFxStripText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  qrModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  qrModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  qrModalCloseBtn: {
    padding: 4,
  },
  qrModalSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
  },
  cryptoQrCodeWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPayManuallyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  qrPayManuallyText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});
