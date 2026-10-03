import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Share,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import SocialShareModal from '../components/SocialShareModal';
import { useApp } from '../context/AppContext';
import { isSmallScreen } from '../utils/responsive';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import { COUNTRY_METADATA } from '../services/paymentCorridorService';
import { transactionService } from '../services/transactionService';
import { getOperatorLogo } from '../utils/operatorLogos';
import supabase from '../services/supabaseClient';

const CHAINS = [
  { id: 'Polygon', name: 'Polygon', isDefault: true, subtitleKey: 'receiveFunds.recommendedFast', defaultSub: 'Recommended • Fast & Lowest Fees' },
  { id: 'Solana', name: 'Solana', isDefault: false, subtitleKey: 'receiveFunds.crossmintSupported', defaultSub: 'Fast • Crossmint Supported' },
  { id: 'Base', name: 'Base', isDefault: false, subtitleKey: '', defaultSub: 'Coinbase L2 • Low Fees' },
  { id: 'BNB Chain', name: 'BNB Chain', isDefault: false, subtitleKey: '', defaultSub: 'Binance Smart Chain' },
  { id: 'Ethereum', name: 'Ethereum', isDefault: false, subtitleKey: '', defaultSub: 'Ethereum Mainnet' },
];

const EVM_TOKENS = ['USDC', 'USDT', 'EURC', 'DZY', 'POL', 'ETH'];
const SOLANA_TOKENS = ['USDC', 'USDT', 'SOL', 'DZY'];
const QUICK_CRYPTO_AMOUNTS = ['5', '10', '25', '50', '100'];

const FIAT_CURRENCIES = [
  { code: 'XOF', nameKey: 'currencies.XOF', defaultName: 'CFA Franc (WAEMU)', symbol: 'FCFA', flag: '🌍' },
  { code: 'XAF', nameKey: 'currencies.XAF', defaultName: 'CFA Franc (CEMAC)', symbol: 'FCFA', flag: '🇨🇲' },
  { code: 'KES', nameKey: 'currencies.KES', defaultName: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'GHS', nameKey: 'currencies.GHS', defaultName: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'NGN', nameKey: 'currencies.NGN', defaultName: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'UGX', nameKey: 'currencies.UGX', defaultName: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  { code: 'RWF', nameKey: 'currencies.RWF', defaultName: 'Rwandan Franc', symbol: 'RF', flag: '🇷🇼' },
  { code: 'CDF', nameKey: 'currencies.CDF', defaultName: 'Congolese Franc', symbol: 'FC', flag: '🇨🇩' },
  { code: 'ZMW', nameKey: 'currencies.ZMW', defaultName: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'TZS', nameKey: 'currencies.TZS', defaultName: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  { code: 'GNF', nameKey: 'currencies.GNF', defaultName: 'Guinean Franc', symbol: 'FG', flag: '🇬🇳' },
  { code: 'ZAR', nameKey: 'currencies.ZAR', defaultName: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'EUR', nameKey: 'currencies.EUR', defaultName: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', nameKey: 'currencies.USD', defaultName: 'US Dollar', symbol: '$', flag: '🇺🇸' },
];

const FIAT_QUICK_AMOUNTS_LOCAL = ['1000', '2500', '5000', '10000', '25000'];
const FIAT_QUICK_AMOUNTS_MAJOR = ['10', '25', '50', '100', '250'];

const SUPPORTED_MOMO_COUNTRIES = [
  'BJ', 'BF', 'CM', 'CF', 'TD', 'CG', 'CI', 'CD',
  'GA', 'GH', 'GN', 'GW', 'KE', 'ML', 'NE', 'NG',
  'RW', 'SN', 'ZA', 'TZ', 'TG', 'UG', 'ZM'
];

export default function ReceiveFundsV2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { session, user, t, userCountry } = useApp();

  // Mode: 'crypto' or 'fiat'
  const [receiveMode, setReceiveMode] = useState('crypto');

  // Crypto / Stablecoins state
  const [addresses, setAddresses] = useState({ evm: '', solana: '' });
  const [selectedChain, setSelectedChain] = useState('Polygon');
  const [token, setToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  // Fiat / Mobile Money state
  const initialCountryCode = (userCountry || user?.country_code || user?.country || 'CI').toUpperCase().slice(0, 2);
  const isUserCountrySupportedForMoMo = SUPPORTED_MOMO_COUNTRIES.includes(initialCountryCode);
  const userCountryLocalized = t('countries.' + initialCountryCode, COUNTRY_METADATA[initialCountryCode]?.nameEn || COUNTRY_METADATA[initialCountryCode]?.name || initialCountryCode);

  const userResidentCountry = initialCountryCode;
  const userResidentCurrency = COUNTRY_METADATA[userResidentCountry]?.currency || 'XOF';
  const userResidentFlag = COUNTRY_METADATA[userResidentCountry]?.flag || '🌍';

  const [fiatCountryCode, setFiatCountryCode] = useState(
    isUserCountrySupportedForMoMo ? initialCountryCode : 'CI'
  );
  const [fiatCurrency, setFiatCurrency] = useState(
    COUNTRY_METADATA[fiatCountryCode]?.currency || 'XOF'
  );
  const [fiatAmount, setFiatAmount] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [dbOperators, setDbOperators] = useState([]);
  const [sendingPush, setSendingPush] = useState(false);

  // Modals
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showFiatCurrencyModal, setShowFiatCurrencyModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareConfig, setShareConfig] = useState({
    title: '',
    subtitle: '',
    shareUrl: '',
    shareMessage: '',
    recipientPhone: '',
  });

  // Modal search filters
  const [fiatSearchQuery, setFiatSearchQuery] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    if (!fiatSearchQuery.trim()) return FIAT_CURRENCIES;
    const q = fiatSearchQuery.toLowerCase().trim();
    return FIAT_CURRENCIES.filter((cur) => {
      const name = t(cur.nameKey, cur.defaultName).toLowerCase();
      const code = cur.code.toLowerCase();
      const symbol = cur.symbol.toLowerCase();
      return code.includes(q) || name.includes(q) || symbol.includes(q);
    });
  }, [fiatSearchQuery, t]);

  const allCountryList = useMemo(() => {
    const supported = [];
    const unsupported = [];
    Object.keys(COUNTRY_METADATA).forEach((code) => {
      const meta = COUNTRY_METADATA[code] || {};
      const isSupp = SUPPORTED_MOMO_COUNTRIES.includes(code);
      const item = { code, ...meta, isSupported: isSupp };
      if (isSupp) supported.push(item);
      else unsupported.push(item);
    });
    return [...supported, ...unsupported];
  }, []);

  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return allCountryList;
    const q = countrySearchQuery.toLowerCase().trim();
    return allCountryList.filter((c) => {
      const localizedName = t('countries.' + c.code, c.nameEn || c.name || c.code).toLowerCase();
      const rawName = (c.name || '').toLowerCase();
      const nameEn = (c.nameEn || '').toLowerCase();
      const code = c.code.toLowerCase();
      const currency = (c.currency || '').toLowerCase();
      const dialCode = (c.dialCode || '').toLowerCase();
      return (
        localizedName.includes(q) ||
        rawName.includes(q) ||
        nameEn.includes(q) ||
        code.includes(q) ||
        currency.includes(q) ||
        dialCode.includes(q)
      );
    });
  }, [allCountryList, countrySearchQuery, t]);

  useEffect(() => {
    let isMounted = true;
    const fetchAddress = async () => {
      try {
        const authToken = session?.access_token || '';
        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
          DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        }
        const syncRes = await fetch(`${DIZZY_URL}/wallet/sync-smart-address`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const syncData = await syncRes.json();
        if (isMounted && syncRes.ok && syncData.success) {
          setAddresses({
            evm: syncData.evmAddress || '',
            solana: syncData.solanaAddress || '',
          });
        }
      } catch (err) {
        console.error('Failed to sync smart wallet address:', err);
      }
    };
    fetchAddress();
    return () => { isMounted = false; };
  }, [session]);

  // Resolve current active address
  const evmAddress = addresses.evm || user?.evmAddress || user?.businessEvmAddress || '';
  const solanaAddress = addresses.solana || user?.solanaAddress || '';
  const activeAddress = selectedChain === 'Solana'
    ? (solanaAddress || t('common.loading', 'Loading...'))
    : (evmAddress || t('common.loading', 'Loading...'));

  // Ensure selected token matches available network tokens
  const currentTokens = selectedChain === 'Solana' ? SOLANA_TOKENS : EVM_TOKENS;
  useEffect(() => {
    if (!currentTokens.includes(token)) {
      setToken(currentTokens[0]);
    }
  }, [selectedChain]);

  // Live operator sync from Supabase with instant fallback
  useEffect(() => {
    let isMounted = true;
    const fetchOperators = async () => {
      try {
        const { data, error } = await supabase
          .from('mobile_operators')
          .select('operator_name, momo_name, provider_slug, logo_url, is_active')
          .eq('country_code', fiatCountryCode)
          .eq('is_active', true);
        if (!error && data && data.length > 0 && isMounted) {
          setDbOperators(data);
          const opNames = data.map(d => d.momo_name || d.operator_name);
          if (!selectedOperator || !opNames.some(n => n.toLowerCase() === selectedOperator.toLowerCase())) {
            setSelectedOperator(opNames[0]);
          }
        }
      } catch (err) {
        // Fallback to static COUNTRY_METADATA
      }
    };
    fetchOperators();
    return () => { isMounted = false; };
  }, [fiatCountryCode]);

  // Update country and auto-set currency and default operator
  const handleSelectCountry = (code) => {
    setFiatCountryCode(code);
    const meta = COUNTRY_METADATA[code];
    if (meta) {
      if (meta.currency) setFiatCurrency(meta.currency);
      if (meta.momoNetworks && meta.momoNetworks.length > 0) {
        setSelectedOperator(meta.momoNetworks[0]);
      }
    }
    setShowCountryModal(false);
  };

  useEffect(() => {
    const meta = COUNTRY_METADATA[fiatCountryCode];
    if (meta && meta.momoNetworks && meta.momoNetworks.length > 0 && !selectedOperator) {
      setSelectedOperator(meta.momoNetworks[0]);
    }
  }, [fiatCountryCode]);

  // QR Code Generation for Crypto
  const qrPayload = amount && parseFloat(amount) > 0
    ? (selectedChain === 'Solana'
        ? `solana:${activeAddress}?amount=${amount}&spl-token=${token}`
        : `ethereum:${activeAddress}@137?amount=${amount}&token=${token}`)
    : activeAddress;

  const qr = activeAddress && activeAddress !== t('common.loading', 'Loading...')
    ? QRCode.create(qrPayload, { errorCorrectionLevel: 'M' })
    : null;

  const copyAddress = async () => {
    if (!activeAddress || activeAddress === t('common.loading', 'Loading...')) return;
    try {
      await Clipboard.setStringAsync(activeAddress);
      setCopied(true);
      setToast({
        title: t('receiveFunds.toastTitle', 'Address copied!'),
        message: t('receiveFunds.toastDesc', 'The address has been copied to the clipboard.'),
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const copyPaymentRequest = async () => {
    if (!activeAddress || activeAddress === t('common.loading', 'Loading...')) return;
    try {
      const msg = amount && parseFloat(amount) > 0
        ? t('receiveFunds.shareRequestMessage', 'Send {{amount}} {{token}} to my DizzitUp wallet ({{chain}}): {{address}}', {
            amount,
            token,
            chain: selectedChain,
            address: activeAddress,
          })
        : activeAddress;
      await Clipboard.setStringAsync(msg);
      setCopied(true);
      setToast({
        title: t('receiveFunds.toastTitle', 'Address copied!'),
        message: amount ? t('common.copied', 'Copied!') : t('receiveFunds.toastDesc', 'The address has been copied to the clipboard.'),
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const sharePaymentRequest = () => {
    if (!activeAddress || activeAddress === t('common.loading', 'Loading...')) return;
    const message = amount && parseFloat(amount) > 0
      ? t('receiveFunds.shareRequestMessage', 'Send {{amount}} {{token}} to my DizzitUp wallet ({{chain}}): {{address}}', {
          amount,
          token,
          chain: selectedChain,
          address: activeAddress,
        })
      : t('receiveFunds.shareAddressMessage', 'My DizzitUp {{chain}} address: {{address}}', {
          chain: selectedChain,
          address: activeAddress,
        });

    setShareConfig({
      title: t('share.cryptoRequestTitle', 'Crypto Payment Request'),
      subtitle: t('share.subtitle', 'Choose an application to send your message directly'),
      shareUrl: '',
      shareMessage: message,
      recipientPhone: '',
    });
    setShowShareModal(true);
  };

  // Mobile Money: Trigger USSD Push request via KotaniPay / backend
  const handleSendMomoPush = async () => {
    if (!fiatAmount || parseFloat(fiatAmount) <= 0) {
      setToast({
        title: t('common.error', 'Error'),
        message: t('receiveFunds.enterValidAmount', 'Please enter a valid amount.'),
      });
      return;
    }

    const cleanDigits = payerPhone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 8) {
      setToast({
        title: t('common.error', 'Error'),
        message: t('receiveFunds.enterValidPhone', 'Please enter a valid Mobile Money phone number.'),
      });
      return;
    }

    const countryMeta = COUNTRY_METADATA[fiatCountryCode] || COUNTRY_METADATA.CI;
    const dialCode = countryMeta.dialCode || '+225';
    const rawDial = dialCode.replace('+', '');
    const fullPhoneNumber = cleanDigits.startsWith(rawDial)
      ? `+${cleanDigits}`
      : `${dialCode}${cleanDigits}`;

    const authToken = (user?.role === 'merchant' && user?.businessDizzyToken)
      ? user.businessDizzyToken
      : (user?.dizzyToken || session?.access_token);

    setSendingPush(true);
    try {
      const payload = {
        amount: parseFloat(fiatAmount),
        currency: fiatCurrency,
        country: fiatCountryCode,
        walletAddress: evmAddress,
        chain: 'polygon',
        paymentMethod: 'momo',
        phoneNumber: fullPhoneNumber,
        providerNetwork: selectedOperator || 'MTN',
        useCase: 'TOPUP',
      };

      const res = await transactionService.createMoMoOnrampOrder(authToken, payload);

      setToast({
        title: t('receiveFunds.pushSentTitle', 'Mobile Money request sent!'),
        message: res?.message || t('receiveFunds.pushSentDesc', `A USSD notification has been sent to ${fullPhoneNumber}. The payer must authorize with their Mobile Money PIN to transfer funds.`),
      });
      setPayerPhone('');
    } catch (err) {
      setToast({
        title: t('common.error', 'Error'),
        message: err.message || t('receiveFunds.pushFailed', 'Could not initiate Mobile Money request. Please try again.'),
      });
    } finally {
      setSendingPush(false);
    }
  };

  // Share Fiat Request via Social Apps & SMS
  const shareFiatRequest = () => {
    const myPhone = user?.phone || user?.email || '';
    const message = fiatAmount && parseFloat(fiatAmount) > 0
      ? t('receiveFunds.shareFiatRequestMsg', 'Hello, please send me {{amount}} {{currency}} to my DizzitUp account (Mobile Money: {{phone}}).', {
          amount: fiatAmount,
          currency: fiatCurrency,
          phone: myPhone,
        })
      : t('receiveFunds.shareFiatDetailsMsg', 'My DizzitUp account to pay me via Mobile Money: {{phone}}', {
          phone: myPhone,
        });

    setShareConfig({
      title: t('share.fiatRequestTitle', 'Mobile Money Payment Request'),
      subtitle: t('share.subtitle', 'Choose an application to send your message directly'),
      shareUrl: '',
      shareMessage: message,
      recipientPhone: payerPhone || '',
    });
    setShowShareModal(true);
  };

  const handlePastePayerPhone = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setPayerPhone(text.replace(/[^\d+]/g, ''));
        setToast({
          title: t('common.pasted', 'Pasted!'),
          message: text.slice(0, 20),
        });
      }
    } catch {
      // ignore
    }
  };

  const handleSelectChain = (chain) => {
    setSelectedChain(chain.id);
    setShowNetworkModal(false);
  };

  const handleSelectToken = (selectedTok) => {
    setToken(selectedTok);
    setShowTokenModal(false);
  };

  const handleBack = () => {
    const pivotScreen = route.params?.pivotScreen;
    const pivotParams = route.params?.pivotParams;
    if (pivotScreen) {
      navigation.navigate(pivotScreen, pivotParams);
    } else {
      navigation.goBack();
    }
  };

  const RealQrCode = () => {
    if (!qr) return null;
    const qrSize = isSmallScreen ? 160 : 180;
    return (
      <Svg width={qrSize} height={qrSize} viewBox={`0 0 ${qr.modules.size} ${qr.modules.size}`} accessibilityLabel="QR Code">
        <Rect width={qr.modules.size} height={qr.modules.size} fill="#FFFFFF" />
        {Array.from(qr.modules.data).map((cell, index) =>
          cell ? (
            <Rect
              key={index}
              x={index % qr.modules.size}
              y={Math.floor(index / qr.modules.size)}
              width="1"
              height="1"
              fill="#0F172A"
            />
          ) : null
        )}
      </Svg>
    );
  };

  const countryMeta = COUNTRY_METADATA[fiatCountryCode] || COUNTRY_METADATA.CI;
  const fiatQuickAmounts = (fiatCurrency === 'EUR' || fiatCurrency === 'USD')
    ? FIAT_QUICK_AMOUNTS_MAJOR
    : FIAT_QUICK_AMOUNTS_LOCAL;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Toast Alert */}
        {!!toast && (
          <View style={styles.toastWrap}>
            <AppToast
              title={toast.title}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t('receiveFunds.receive_funds_title', 'Receive funds')}
            </Text>
            <View style={styles.secureBadgeRow}>
              <View style={styles.secureDot} />
              <Text style={styles.secureBadgeText}>
                {t('receiveFunds.secureTransaction', '100% secure transaction')}
              </Text>
            </View>
          </View>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Segmented Mode Switcher: Crypto vs Mobile Money */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, receiveMode === 'crypto' && styles.segmentBtnActive]}
              onPress={() => setReceiveMode('crypto')}
              activeOpacity={0.85}
            >
              <CryptoIcon symbol="USDC" size={16} style={{ marginRight: 6 }} />
              <Text style={[styles.segmentBtnText, receiveMode === 'crypto' && styles.segmentBtnTextActive]}>
                {t('receiveFunds.tabCrypto', 'Crypto & Stablecoins')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, receiveMode === 'fiat' && styles.segmentBtnActive]}
              onPress={() => setReceiveMode('fiat')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={receiveMode === 'fiat' ? '#FFFFFF' : '#475569'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.segmentBtnText, receiveMode === 'fiat' && styles.segmentBtnTextActive]}>
                {t('receiveFunds.tabFiat', 'Mobile Money (Fiat)')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ========================================================================= */}
          {/* MODE 1: CRYPTO & STABLECOINS (CROSSMINT ON-CHAIN)                         */}
          {/* ========================================================================= */}
          {receiveMode === 'crypto' && (
            <>
              {/* Hero Section: Request Amount First */}
              <View style={styles.requestHeroCard}>
                <View style={styles.requestHeaderRow}>
                  <View>
                    <Text style={styles.requestCardTitle}>
                      {t('receiveFunds.requestAmount', 'Request Amount')}
                    </Text>
                    <Text style={styles.requestCardSubtitle}>
                      {t('receiveFunds.requestSubtitle', 'Enter an amount to generate a payment request')}
                    </Text>
                  </View>
                  {amount ? (
                    <TouchableOpacity onPress={() => setAmount('')} style={styles.clearBtn} activeOpacity={0.7}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      <Text style={styles.clearBtnText}>{t('common.clear', 'Clear')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Amount Input with Token Selector Pill */}
                <View style={styles.amountInputRow}>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                  />

                  <TouchableOpacity
                    style={styles.tokenPill}
                    onPress={() => setShowTokenModal(true)}
                    activeOpacity={0.8}
                  >
                    <CryptoIcon symbol={token} size={22} style={{ marginRight: 6 }} />
                    <Text style={styles.tokenPillText}>{token}</Text>
                    <Ionicons name="chevron-down" size={14} color="#0F172A" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                {/* Quick Amount Suggestion Chips */}
                <View style={styles.quickChipsRow}>
                  {QUICK_CRYPTO_AMOUNTS.map((val) => {
                    const isSelected = amount === val;
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[styles.quickChip, isSelected && styles.quickChipActive]}
                        onPress={() => setAmount(val)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                          +{val}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Local Resident FIAT Preview on Screen */}
                <TouchableOpacity
                  style={styles.fiatPreviewPill}
                  onPress={() => {
                    setToast({
                      title: `${userResidentCurrency} (${userResidentCountry})`,
                      message: t('receiveFunds.fiatComingNextNotice', { currency: userResidentCurrency }),
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.fiatPreviewLeft}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>{userResidentFlag}</Text>
                    <Text style={styles.fiatPreviewText}>
                      {t('receiveFunds.fiatDirectOption', { currency: userResidentCurrency, country: userResidentCountry })}
                    </Text>
                  </View>
                  <View style={styles.comingNextPillSmall}>
                    <Text style={styles.comingNextPillSmallText}>
                      {t('common.comingNext', 'Coming next')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* QR Code and Address Card */}
              <LinearGradient
                colors={['#2B4C7E', '#20365B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.qrCard}
              >
                {/* Top pill showing current chain */}
                <View style={styles.cardHeaderTop}>
                  <View style={styles.chainPill}>
                    <CryptoIcon symbol={selectedChain} size={14} />
                    <Text style={styles.chainPillText}>{selectedChain.toUpperCase()}</Text>
                  </View>

                  <View style={styles.nodeTagRow}>
                    <Ionicons name="shield-checkmark" size={13} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={styles.nodeTagText}>{t('receiveFunds.secure', 'SECURE')}</Text>
                  </View>
                </View>

                {/* QR Center Box */}
                <View style={styles.qrCenterWrapper}>
                  <View style={styles.qrWhiteBox}>
                    <RealQrCode />
                  </View>

                  {/* Dynamic Request Pill */}
                  {amount && parseFloat(amount) > 0 ? (
                    <View style={styles.requestedAmountBadge}>
                      <Text style={styles.requestedAmountLabel}>
                        {t('receiveFunds.requesting', 'Requesting')}:
                      </Text>
                      <Text style={styles.requestedAmountValue}>
                        {amount} {token}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.qrScanHint}>
                      {t('receiveFunds.scan_to_pay', 'Scan to Pay')}
                    </Text>
                  )}
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Address Row */}
                <Text style={styles.addressLabel}>
                  {t('receiveFunds.your_address', 'YOUR ADDRESS')}
                </Text>
                <View style={styles.addressBox}>
                  <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                    {activeAddress}
                  </Text>
                  <Pressable style={styles.addressCopyBtn} onPress={copyAddress}>
                    <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              </LinearGradient>

              {/* Action Buttons: Copy & Share */}
              <View style={styles.actionBtnsRow}>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={copyPaymentRequest}
                  activeOpacity={0.85}
                >
                  <Ionicons name="copy-outline" size={18} color="#0F172A" style={{ marginRight: 8 }} />
                  <Text style={styles.copyBtnText}>
                    {copied ? t('receiveFunds.copied', 'COPIED') : t('receiveFunds.copy', 'COPY')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={sharePaymentRequest}
                  activeOpacity={0.85}
                >
                  <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.shareBtnText}>
                    {t('receiveFunds.share', 'SHARE')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Discreet Multichain Switcher Chip */}
              <TouchableOpacity
                style={styles.networkChip}
                onPress={() => setShowNetworkModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.networkChipLeft}>
                  <View style={styles.networkIconWrapper}>
                    <CryptoIcon symbol={selectedChain} size={20} />
                  </View>
                  <View>
                    <Text style={styles.networkChipTitle}>
                      {t('common.network', 'Network')}:{' '}
                      <Text style={styles.networkChipBold}>{selectedChain}</Text>
                      {selectedChain === 'Polygon' ? ` (${t('common.default', 'Default')})` : ''}
                    </Text>
                    <Text style={styles.networkChipSubtitle}>
                      {selectedChain === 'Polygon'
                        ? t('receiveFunds.recommendedFast', 'Recommended • Fast & Lowest Fees')
                        : selectedChain === 'Solana'
                        ? t('receiveFunds.crossmintSupported', 'Fast • Crossmint Supported')
                        : `${selectedChain} Network Node`}
                    </Text>
                  </View>
                </View>

                <View style={styles.networkChipRight}>
                  <Text style={styles.networkChangeText}>
                    {t('receiveFunds.changeNetwork', 'Change')}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#2563EB" />
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: MOBILE MONEY & LOCAL FIAT (KOTANIPAY / RAILS)                     */}
          {/* ========================================================================= */}
          {receiveMode === 'fiat' && (
            <>
              {/* Unsupported Country Notice if user's country is not in supported MoMo corridors */}
              {!isUserCountrySupportedForMoMo && (
                <View style={styles.unsupportedCountryNoticeBox}>
                  <View style={styles.unsupportedCountryNoticeHeader}>
                    <Ionicons name="information-circle" size={18} color="#0284C7" style={{ marginRight: 6 }} />
                    <Text style={styles.unsupportedCountryNoticeTitle}>
                      {userResidentFlag} {userResidentCurrency} ({userCountryLocalized})
                    </Text>
                    <View style={styles.noticeComingNextPill}>
                      <Text style={styles.noticeComingNextPillText}>
                        {t('common.comingNext', 'Coming next')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.unsupportedCountryNoticeText}>
                    {t('receiveFunds.unsupportedCountryNotice', 'Mobile Money reception is currently not available in {{countryName}}. You can receive via Crypto & Stablecoins, or select a supported African corridor below.', { countryName: userCountryLocalized })}
                  </Text>
                </View>
              )}

              {/* Fiat Amount Input Card */}
              <View style={styles.requestHeroCard}>
                <View style={styles.requestHeaderRow}>
                  <View>
                    <Text style={styles.requestCardTitle}>
                      {t('receiveFunds.fiatRequestTitle', 'Local Currency Request')}
                    </Text>
                    <Text style={styles.requestCardSubtitle}>
                      {t('receiveFunds.fiatRequestDesc', 'Enter the amount to receive via Mobile Money')}
                    </Text>
                  </View>
                  {fiatAmount ? (
                    <TouchableOpacity onPress={() => setFiatAmount('')} style={styles.clearBtn} activeOpacity={0.7}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      <Text style={styles.clearBtnText}>{t('common.clear', 'Clear')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.amountInputRow}>
                  <TextInput
                    style={styles.amountInput}
                    value={fiatAmount}
                    onChangeText={setFiatAmount}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />

                  <TouchableOpacity
                    style={styles.tokenPill}
                    onPress={() => setShowFiatCurrencyModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.fiatCurrencyFlag}>{countryMeta.flag}</Text>
                    <Text style={styles.tokenPillText}>{fiatCurrency}</Text>
                    <Ionicons name="chevron-down" size={14} color="#0F172A" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                {/* Quick Chips for Fiat */}
                <View style={styles.quickChipsRow}>
                  {fiatQuickAmounts.map((val) => {
                    const isSelected = fiatAmount === val;
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[styles.quickChip, isSelected && styles.quickChipActive]}
                        onPress={() => setFiatAmount(val)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                          +{parseInt(val, 10).toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Direct MoMo USSD Push Trigger Card */}
              <View style={styles.momoCard}>
                <View style={styles.momoCardHeader}>
                  <View style={styles.momoIconBadge}>
                    <Ionicons name="flash" size={16} color="#0284C7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.momoCardTitle}>
                      {t('receiveFunds.directPushTitle', 'Direct Mobile Money Request (USSD Push)')}
                    </Text>
                    <Text style={styles.momoCardSubtitle}>
                      {t('receiveFunds.directPushSubtitle', 'The payer receives an instant prompt on their phone and validates with their Mobile Money PIN.')}
                    </Text>
                  </View>
                </View>

                {/* Country corridor selector button */}
                <TouchableOpacity
                  style={styles.corridorSelectorRow}
                  onPress={() => setShowCountryModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.corridorLeft}>
                    <Text style={styles.corridorFlag}>{countryMeta.flag}</Text>
                    <View>
                      <Text style={styles.corridorName}>
                        {t('countries.' + fiatCountryCode, countryMeta.nameEn || countryMeta.name || fiatCountryCode)}
                      </Text>
                      <Text style={styles.corridorDialCode}>{countryMeta.dialCode} • {countryMeta.currency}</Text>
                    </View>
                  </View>
                  <View style={styles.corridorRight}>
                    <Text style={styles.corridorChangeText}>{t('common.change', 'Change')}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#0284C7" />
                  </View>
                </TouchableOpacity>

                {/* Operator chips */}
                {(() => {
                  const activeOperators = (dbOperators && dbOperators.length > 0)
                    ? dbOperators.map((d) => d.momo_name || d.operator_name)
                    : (countryMeta.momoNetworks || []);

                  if (!activeOperators || activeOperators.length === 0) return null;

                  return (
                    <View style={styles.operatorsWrap}>
                      <Text style={styles.operatorLabel}>
                        {t('receiveFunds.selectOperator', 'Payer operator:')}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operatorScroll}>
                        {activeOperators.map((opName) => {
                          const isSelected = selectedOperator.toLowerCase().includes(opName.toLowerCase()) || selectedOperator === opName;
                          const logoSrc = getOperatorLogo(opName);
                          return (
                            <TouchableOpacity
                              key={opName}
                              style={[styles.operatorChip, isSelected && styles.operatorChipActive]}
                              onPress={() => setSelectedOperator(opName)}
                              activeOpacity={0.75}
                            >
                              {logoSrc ? (
                                <Image source={logoSrc} style={styles.operatorLogoImg} resizeMode="contain" />
                              ) : (
                                <Ionicons name="cellular" size={13} color={isSelected ? '#071D54' : '#64748B'} style={{ marginRight: 4 }} />
                              )}
                              <Text style={[styles.operatorChipText, isSelected && styles.operatorChipTextActive]}>
                                {opName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  );
                })()}

                {/* Payer Phone Input with Paste */}
                <View style={styles.phoneInputRow}>
                  <View style={styles.dialCodeBox}>
                    <Text style={styles.dialCodeText}>{countryMeta.dialCode}</Text>
                  </View>

                  <TextInput
                    style={styles.phoneTextInput}
                    value={payerPhone}
                    onChangeText={setPayerPhone}
                    placeholder={t('receiveFunds.payerPhonePlaceholder', "Payer's Mobile Money number")}
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />

                  <TouchableOpacity style={styles.pastePhoneBtn} onPress={handlePastePayerPhone}>
                    <Ionicons name="clipboard-outline" size={16} color="#0284C7" />
                  </TouchableOpacity>
                </View>

                {/* Send MoMo Push Action Button */}
                <TouchableOpacity
                  style={[styles.sendPushBtn, sendingPush && styles.sendPushBtnDisabled]}
                  onPress={handleSendMomoPush}
                  disabled={sendingPush}
                  activeOpacity={0.88}
                >
                  {sendingPush ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.sendPushBtnText}>
                        {t('receiveFunds.sendPushBtn', 'Send Mobile Money Request')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Share My Contact / Details Section */}
              <View style={styles.shareDetailsCard}>
                <View style={styles.shareDetailsHeader}>
                  <Ionicons name="share-social-outline" size={18} color="#071D54" style={{ marginRight: 8 }} />
                  <Text style={styles.shareDetailsTitle}>
                    {t('receiveFunds.myDetailsTitle', 'Or share your direct payment details')}
                  </Text>
                </View>
                <Text style={styles.shareDetailsSubtitle}>
                  {t('receiveFunds.myDetailsSubtitle', 'Send a ready-to-use message to your contact on WhatsApp, SMS, or chat apps with your DizzitUp ID.')}
                </Text>

                <View style={styles.myInfoRow}>
                  <View style={styles.myInfoPill}>
                    <Ionicons name="call-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.myInfoText} numberOfLines={1}>
                      {user?.phone || t('receiveFunds.noPhoneSet', 'No phone registered')}
                    </Text>
                  </View>

                  <View style={styles.myInfoPill}>
                    <Ionicons name="person-circle-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.myInfoText} numberOfLines={1}>
                      {user?.email || user?.name || 'DizzitUp User'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.shareWhatsappBtn}
                  onPress={shareFiatRequest}
                  activeOpacity={0.85}
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.shareWhatsappBtnText}>
                    {t('receiveFunds.shareViaWhatsapp', 'Share request (WhatsApp / SMS / Social)')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Self Top-Up Shortcut Card */}
              <TouchableOpacity
                style={styles.selfTopUpBanner}
                onPress={() => navigation.navigate('TopUpScreen')}
                activeOpacity={0.85}
              >
                <View style={styles.selfTopUpLeft}>
                  <View style={styles.selfTopUpIconBox}>
                    <Ionicons name="card-outline" size={20} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selfTopUpTitle}>
                      {t('receiveFunds.selfDepositTitle', 'Want to deposit your own funds?')}
                    </Text>
                    <Text style={styles.selfTopUpSubtitle}>
                      {t('receiveFunds.selfDepositDesc', 'Top up your balance instantly via Mobile Money or Bank card.')}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#10B981" />
              </TouchableOpacity>
            </>
          )}

          {/* Pivot Return Button if arriving from ContactProfile */}
          {route.params?.pivotScreen && (
            <TouchableOpacity
              style={styles.pivotButton}
              onPress={() => navigation.navigate(route.params.pivotScreen, route.params.pivotParams)}
              activeOpacity={0.88}
            >
              <Ionicons name="arrow-back" size={16} color="#071D54" style={{ marginRight: 6 }} />
              <Text style={styles.pivotButtonText}>
                {t('common.backToContact', 'Back to Contact')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Bottom Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconBox}>
              <Ionicons name="shield-checkmark" size={18} color="#FFC759" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityBannerTitle}>
                {t('receiveFunds.bannerTitle', 'DizzitUp Secure Transaction Node')}
              </Text>
              <Text style={styles.securityBannerDesc}>
                {t('receiveFunds.bannerDesc', 'Your transactions are protected by our infrastructure.')}
              </Text>
            </View>
          </View>
        </ScrollView>

        <BottomNavBar />

        {/* Modal 1: Blockchain Selection Sheet */}
        <Modal
          visible={showNetworkModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNetworkModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowNetworkModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {t('receiveFunds.networkModalTitle', 'Select Blockchain Network')}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {t('receiveFunds.networkModalSubtitle', 'Choose network to receive funds (Polygon is default)')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowNetworkModal(false)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.chainsList}>
                {CHAINS.map((chain) => {
                  const isSelected = selectedChain === chain.id;
                  const subtitle = chain.subtitleKey ? t(chain.subtitleKey, chain.defaultSub) : chain.defaultSub;
                  return (
                    <TouchableOpacity
                      key={chain.id}
                      style={[styles.chainRow, isSelected && styles.chainRowActive]}
                      onPress={() => handleSelectChain(chain)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.chainRowLeft}>
                        <View style={styles.chainIconSquare}>
                          <CryptoIcon symbol={chain.id} size={24} />
                        </View>
                        <View>
                          <View style={styles.chainNameRow}>
                            <Text style={styles.chainRowName}>{chain.name}</Text>
                            {chain.isDefault ? (
                              <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.chainRowSub}>{subtitle}</Text>
                        </View>
                      </View>

                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                      ) : (
                        <Ionicons name="radio-button-off" size={20} color="#CBD5E1" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal 2: Token Selector Sheet */}
        <Modal
          visible={showTokenModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTokenModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowTokenModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {t('common.currency', 'Currency')} / Token
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {t('common.select', 'Select')} token to receive
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowTokenModal(false)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.tokensGrid}>
                {currentTokens.map((tok) => {
                  const isSelected = token === tok;
                  return (
                    <TouchableOpacity
                      key={tok}
                      style={[styles.tokenGridItem, isSelected && styles.tokenGridItemActive]}
                      onPress={() => handleSelectToken(tok)}
                      activeOpacity={0.75}
                    >
                      <CryptoIcon symbol={tok} size={28} style={{ marginBottom: 6 }} />
                      <Text style={[styles.tokenGridText, isSelected && styles.tokenGridTextActive]}>
                        {tok}
                      </Text>
                      {isSelected ? (
                        <View style={styles.tokenCheckDot}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}

                {/* Solofo's specification: User Local Resident FIAT (greyed out with 'Coming next' badge) */}
                <TouchableOpacity
                  style={[styles.tokenGridItem, styles.tokenGridItemDisabled]}
                  onPress={() => {
                    setToast({
                      title: `${userResidentCurrency} (${userResidentCountry})`,
                      message: t('receiveFunds.fiatComingNextNotice', { currency: userResidentCurrency }),
                    });
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.fiatTokenIconWrapper}>
                    <Text style={styles.fiatTokenFlag}>{userResidentFlag}</Text>
                  </View>
                  <Text style={[styles.tokenGridText, styles.tokenGridTextDisabled]}>
                    {userResidentCurrency}
                  </Text>
                  <View style={styles.comingNextBadge}>
                    <Text style={styles.comingNextBadgeText} numberOfLines={1}>
                      {t('common.comingNext', 'Coming next')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal 3: Fiat Currency Selector Sheet */}
        <Modal
          visible={showFiatCurrencyModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setFiatSearchQuery('');
            setShowFiatCurrencyModal(false);
          }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setFiatSearchQuery('');
              setShowFiatCurrencyModal(false);
            }}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.modalTitle}>
                    {t('receiveFunds.selectFiatCurrency', 'Local currency')}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {t('receiveFunds.selectFiatDesc', 'Choose currency for your payment request')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setFiatSearchQuery('');
                    setShowFiatCurrencyModal(false);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.modalSearchBox}>
                <Ionicons name="search" size={17} color="#64748B" />
                <TextInput
                  style={styles.modalSearchInput}
                  value={fiatSearchQuery}
                  onChangeText={setFiatSearchQuery}
                  placeholder={t('receiveFunds.searchCurrency', 'Search currency...')}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {fiatSearchQuery ? (
                  <TouchableOpacity onPress={() => setFiatSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.chainsList}>
                  {/* User Resident FIAT with Coming next badge in Currency Selector */}
                  {!isUserCountrySupportedForMoMo && (!fiatSearchQuery || userResidentCurrency.toLowerCase().includes(fiatSearchQuery.toLowerCase()) || userCountryLocalized.toLowerCase().includes(fiatSearchQuery.toLowerCase())) && (
                    <TouchableOpacity
                      style={[styles.chainRow, styles.chainRowUnsupported]}
                      onPress={() => {
                        setToast({
                          title: `${userResidentCurrency} (${userResidentCountry})`,
                          message: t('receiveFunds.fiatComingNextNotice', { currency: userResidentCurrency }),
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.chainRowLeft}>
                        <View style={styles.fiatFlagSquare}>
                          <Text style={{ fontSize: 20 }}>{userResidentFlag}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.chainRowName}>
                            {userResidentCurrency} • {userCountryLocalized}
                          </Text>
                          <Text style={styles.chainRowSub}>
                            {t('receiveFunds.residentCurrency', 'Your resident currency')}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.unsupportedBadge}>
                        <Text style={styles.unsupportedBadgeText}>
                          {t('common.comingNext', 'Coming next')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {filteredCurrencies.map((cur) => {
                    const isSelected = fiatCurrency === cur.code;
                    return (
                      <TouchableOpacity
                        key={cur.code}
                        style={[styles.chainRow, isSelected && styles.chainRowActive]}
                        onPress={() => {
                          setFiatCurrency(cur.code);
                          setFiatSearchQuery('');
                          setShowFiatCurrencyModal(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.chainRowLeft}>
                          <View style={styles.fiatFlagSquare}>
                            <Text style={{ fontSize: 20 }}>{cur.flag}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.chainRowName}>{cur.code} • {t(cur.nameKey, cur.defaultName)}</Text>
                            <Text style={styles.chainRowSub}>{cur.symbol}</Text>
                          </View>
                        </View>

                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                        ) : (
                          <Ionicons name="radio-button-off" size={20} color="#CBD5E1" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {filteredCurrencies.length === 0 && (
                    <View style={styles.emptySearchWrap}>
                      <Ionicons name="search-outline" size={32} color="#CBD5E1" style={{ marginBottom: 6 }} />
                      <Text style={styles.emptySearchText}>{t('receiveFunds.noResultsFound', 'No results found')}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal 4: Country Corridor Selector Sheet */}
        <Modal
          visible={showCountryModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setCountrySearchQuery('');
            setShowCountryModal(false);
          }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setCountrySearchQuery('');
              setShowCountryModal(false);
            }}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.modalTitle}>
                    {t('receiveFunds.selectCountry', 'Mobile Money Country Corridor')}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {t('receiveFunds.selectCountryDesc', 'Select the issuing country')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setCountrySearchQuery('');
                    setShowCountryModal(false);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.modalSearchBox}>
                <Ionicons name="search" size={17} color="#64748B" />
                <TextInput
                  style={styles.modalSearchInput}
                  value={countrySearchQuery}
                  onChangeText={setCountrySearchQuery}
                  placeholder={t('receiveFunds.searchCountry', 'Search country or corridor...')}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {countrySearchQuery ? (
                  <TouchableOpacity onPress={() => setCountrySearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.chainsList}>
                  {filteredCountries.map((c) => {
                    const isSelected = fiatCountryCode === c.code;
                    const localizedCountry = t('countries.' + c.code, c.nameEn || c.name || c.code);

                    if (c.isSupported) {
                      return (
                        <TouchableOpacity
                          key={c.code}
                          style={[styles.chainRow, isSelected && styles.chainRowActive]}
                          onPress={() => {
                            handleSelectCountry(c.code);
                            setCountrySearchQuery('');
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.chainRowLeft}>
                            <Text style={{ fontSize: 24, marginRight: 12 }}>{c.flag}</Text>
                            <View style={{ flex: 1, paddingRight: 8 }}>
                              <Text style={styles.chainRowName}>{localizedCountry}</Text>
                              <Text style={styles.chainRowSub} numberOfLines={1}>
                                {c.dialCode} • {c.currency} {c.momoNetworks && c.momoNetworks.length > 0 ? `(${c.momoNetworks.join(', ')})` : ''}
                              </Text>
                            </View>
                          </View>

                          {isSelected ? (
                            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                          ) : (
                            <Ionicons name="radio-button-off" size={20} color="#CBD5E1" />
                          )}
                        </TouchableOpacity>
                      );
                    }

                    // Non-supported country row: grayed out with notice badge
                    return (
                      <TouchableOpacity
                        key={c.code}
                        style={[styles.chainRow, styles.chainRowUnsupported]}
                        onPress={() => {
                          setToast({
                            type: 'info',
                            message: t('receiveFunds.unsupportedTap', 'Mobile Money is not supported in {{country}}. Please receive via Crypto or select a supported African corridor.', { country: localizedCountry }),
                          });
                        }}
                        activeOpacity={0.65}
                      >
                        <View style={styles.chainRowLeft}>
                          <Text style={{ fontSize: 24, marginRight: 12, opacity: 0.6 }}>{c.flag}</Text>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={[styles.chainRowName, { color: '#64748B' }]}>{localizedCountry}</Text>
                            <Text style={styles.chainRowSub}>
                              {c.dialCode} • {c.currency}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.unsupportedBadge}>
                          <Text style={styles.unsupportedBadgeText}>
                            {t('receiveFunds.notSupportedBadge', 'Mobile Money not supported')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {filteredCountries.length === 0 && (
                    <View style={styles.emptySearchWrap}>
                      <Ionicons name="search-outline" size={32} color="#CBD5E1" style={{ marginBottom: 6 }} />
                      <Text style={styles.emptySearchText}>{t('receiveFunds.noResultsFound', 'No results found')}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Dedicated Social Share Sheet */}
        <SocialShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={shareConfig.title || t('share.title', 'Share via')}
          subtitle={shareConfig.subtitle || t('share.subtitle', 'Choose an application to send your message directly')}
          shareUrl={shareConfig.shareUrl || ''}
          shareMessage={shareConfig.shareMessage || ''}
          recipientPhone={shareConfig.recipientPhone || ''}
        />
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
    position: 'relative',
  },
  toastWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 60,
    zIndex: 99,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingBottom: 10,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: isSmallScreen ? 16 : 17,
    color: '#0F172A',
  },
  secureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  secureBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#10B981',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  /* Scroll Body */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingTop: 4,
    paddingBottom: 70,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },

  /* Top Mode Switcher */
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: '#071D54',
    boxShadow: '0px 2px 6px rgba(7, 29, 84, 0.2)',
  },
  segmentBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#475569',
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },

  /* Hero Request Amount Card */
  requestHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallScreen ? 14 : 16,
    marginBottom: 14,
    boxShadow: '0px 2px 8px #F1F5F9',
  },
  requestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  requestCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: isSmallScreen ? 14 : 15,
    color: '#0F172A',
  },
  requestCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  clearBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginLeft: 3,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 10,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 22 : 26,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tokenPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  fiatCurrencyFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  quickChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickChipActive: {
    backgroundColor: '#071D54',
  },
  quickChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: isSmallScreen ? 10 : 11,
    color: '#334155',
  },
  quickChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },

  /* QR Card */
  qrCard: {
    borderRadius: 24,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 12,
    boxShadow: '0px 8px 24px #20365B',
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  chainPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nodeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  nodeTagText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#10B981',
    letterSpacing: 0.5,
  },

  /* QR Box */
  qrCenterWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrWhiteBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    boxShadow: '0px 4px 12px #000',
  },
  requestedAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  requestedAmountLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#071D54',
  },
  requestedAmountValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#071D54',
  },
  qrScanHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 14,
  },

  /* Address Box */
  addressLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  addressText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 8,
  },
  addressCopyBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },

  /* Action Buttons */
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  copyBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  shareBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#071D54',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px #071D54',
  },
  shareBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  /* Discreet Network Switcher Chip */
  networkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  networkChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  networkIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  networkChipTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  networkChipBold: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#0F172A',
  },
  networkChipSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  networkChipRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  networkChangeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#2563EB',
  },

  /* Mobile Money USSD Push Card */
  momoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallScreen ? 14 : 16,
    marginBottom: 14,
    boxShadow: '0px 2px 8px #F1F5F9',
  },
  momoCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  momoIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  momoCardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  momoCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  corridorSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  corridorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corridorFlag: {
    fontSize: 22,
    marginRight: 10,
  },
  corridorName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#0F172A',
  },
  corridorDialCode: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  corridorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  corridorChangeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#0284C7',
  },
  operatorsWrap: {
    marginBottom: 12,
  },
  operatorLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
  },
  operatorScroll: {
    gap: 8,
  },
  operatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  operatorChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  operatorLogoImg: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  operatorChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#475569',
  },
  operatorChipTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#071D54',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dialCodeBox: {
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    marginRight: 8,
  },
  dialCodeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  phoneTextInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  pastePhoneBtn: {
    padding: 6,
  },
  sendPushBtn: {
    backgroundColor: '#0284C7',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 8px rgba(2, 132, 199, 0.3)',
  },
  sendPushBtnDisabled: {
    opacity: 0.65,
  },
  sendPushBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  /* Share Details Card */
  shareDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallScreen ? 14 : 16,
    marginBottom: 14,
  },
  shareDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shareDetailsTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  shareDetailsSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 15,
  },
  myInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  myInfoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  myInfoText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#334155',
  },
  shareWhatsappBtn: {
    backgroundColor: '#25D366',
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 8px rgba(37, 211, 102, 0.3)',
  },
  shareWhatsappBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* Self Top-Up Banner */
  selfTopUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  selfTopUpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  selfTopUpIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selfTopUpTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#065F46',
  },
  selfTopUpSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
    lineHeight: 14,
  },

  /* Pivot Button */
  pivotButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pivotButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#071D54',
  },

  /* Bottom Security Banner */
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  securityIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  securityContent: {
    flex: 1,
  },
  securityBannerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#0F172A',
  },
  securityBannerDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  /* Modal Sheets */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    maxHeight: Dimensions.get('window').height * 0.82,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 24,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSearchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
    padding: 0,
  },
  chainRowUnsupported: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.55,
  },
  unsupportedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unsupportedBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#64748B',
  },
  emptySearchWrap: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#94A3B8',
  },
  chainsList: {
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  chainRowActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  chainRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chainIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fiatFlagSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chainNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chainRowName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  defaultBadge: {
    backgroundColor: '#15803D',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  defaultBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chainRowSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  /* Tokens Grid Modal */
  tokensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 8,
  },
  tokenGridItem: {
    width: (Dimensions.get('window').width > 500 ? 480 : Dimensions.get('window').width - 56) / 3,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tokenGridItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tokenGridItemDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    opacity: 0.85,
  },
  tokenGridText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#334155',
  },
  tokenGridTextActive: {
    color: '#1D4ED8',
  },
  tokenGridTextDisabled: {
    color: '#64748B',
  },
  fiatTokenIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  fiatTokenFlag: {
    fontSize: 16,
  },
  comingNextBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0284C7',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  comingNextBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 7.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  tokenCheckDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Unsupported Country Notice */
  unsupportedCountryNoticeBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  unsupportedCountryNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  unsupportedCountryNoticeTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0369A1',
  },
  unsupportedCountryNoticeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 18,
  },
  noticeComingNextPill: {
    marginLeft: 'auto',
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  noticeComingNextPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  fiatPreviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  fiatPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fiatPreviewText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#475569',
  },
  comingNextPillSmall: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comingNextPillSmallText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
