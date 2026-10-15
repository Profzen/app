import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Share,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Linking,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
  Modal,
  Pressable,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import AppSelect from '../components/AppSelect';
import AppToast from '../components/AppToast';
import { ALL_COUNTRIES } from '../utils/countriesData';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

let rawApi = (process.env.EXPO_PUBLIC_BUY_GOODS_API_URL || 'https://buygoods-api.dizzitup.com/api').replace(/\/+$/, '');
if (Platform.OS === 'android' && rawApi.includes('localhost')) {
  rawApi = rawApi.replace('localhost', '10.0.2.2');
}
const BUY_GOODS_API_URL = rawApi.endsWith('/api') ? rawApi : `${rawApi}/api`;

const INVOICE_DASHBOARD_URL = 'https://dizzitup.com/merchant-dashboard?tab=invoices';

export default function InvoicePayLinkScreen() {
  const navigation = useNavigation();
  const { user, session, accountMode, language, t } = useApp();

  const merchantCountry =
    user?.merchantProfile?.country ||
    user?.merchantProfile?.country_code ||
    user?.merchantProfile?.business_country ||
    '';

  const localInfo = useMemo(() => {
    return getCountryCurrencyInfo(merchantCountry);
  }, [merchantCountry]);

  const localCurrency = (localInfo?.currency || 'USD').toUpperCase();

  const currencyOptions = useMemo(() => {
    const list = [localCurrency, 'USDC', 'USDT', 'EURC'];
    if (localCurrency !== 'USD') list.push('USD');
    if (localCurrency !== 'EUR') list.push('EUR');
    const unique = list.filter((c, i, arr) => arr.indexOf(c) === i);

    return unique.map((code) => {
      if (code === 'USDC') {
        return {
          value: 'USDC',
          label: 'USDC',
          subtitle: t('invoicePayLink.stablecoin', 'Stablecoin'),
          isCrypto: true,
          cryptoSymbol: 'USDC'
        };
      }
      if (code === 'USDT') {
        return {
          value: 'USDT',
          label: 'USDT',
          subtitle: t('invoicePayLink.stablecoin', 'Stablecoin'),
          isCrypto: true,
          cryptoSymbol: 'USDT'
        };
      }
      if (code === 'EURC') {
        return {
          value: 'EURC',
          label: 'EURC',
          subtitle: t('invoicePayLink.stablecoin', 'Stablecoin'),
          isCrypto: true,
          cryptoSymbol: 'EURC'
        };
      }
      if (code === localCurrency) {
        return {
          value: localCurrency,
          label: localCurrency,
          subtitle: localInfo?.label || t('invoicePayLink.localCurrency', 'Local Currency'),
          flagUrl: localInfo?.code ? `https://flagcdn.com/w40/${localInfo.code.toLowerCase()}.png` : undefined
        };
      }
      if (code === 'USD') {
        return {
          value: 'USD',
          label: 'USD',
          subtitle: 'US Dollar',
          flagUrl: 'https://flagcdn.com/w40/us.png'
        };
      }
      if (code === 'EUR') {
        return {
          value: 'EUR',
          label: 'EUR',
          subtitle: 'Euro',
          flagUrl: 'https://flagcdn.com/w40/eu.png'
        };
      }
      return { value: code, label: code };
    });
  }, [localCurrency, localInfo, t]);

  // Form states
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(localCurrency || 'USDC');
  const [description, setDescription] = useState('');

  // Send to states
  const [sendMode, setSendMode] = useState('phone'); // 'phone' | 'email'
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const defaultPhoneCountryCode = useMemo(() => {
    if (merchantCountry) {
      const match = ALL_COUNTRIES.find(
        (c) =>
          c.name.toLowerCase() === merchantCountry.toLowerCase() ||
          c.code.toLowerCase() === merchantCountry.toLowerCase()
      );
      if (match) return match.code;
    }
    return localInfo?.code ? localInfo.code.toUpperCase() : 'US';
  }, [merchantCountry, localInfo]);

  const [phoneCountryCode, setPhoneCountryCode] = useState(defaultPhoneCountryCode);

  useEffect(() => {
    if (defaultPhoneCountryCode) {
      setPhoneCountryCode(defaultPhoneCountryCode);
    }
  }, [defaultPhoneCountryCode]);

  useEffect(() => {
    if (localCurrency && currency === 'USDC' && localCurrency !== 'USDC') {
      setCurrency(localCurrency);
    }
  }, [localCurrency]);

  const selectedDialCode = useMemo(() => {
    const found = ALL_COUNTRIES.find((c) => c.code === phoneCountryCode);
    return found?.dial || '+1';
  }, [phoneCountryCode]);

  const countryPickerOptions = useMemo(() => {
    return ALL_COUNTRIES.map((c) => ({
      value: c.code,
      label: `${c.name} (${c.dial})`,
      name: c.name,
      subtitle: c.dial,
      dial: c.dial,
      code: c.code,
      flagUrl: `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`
    }));
  }, []);

  const clientCountryOptions = useMemo(() => {
    return ALL_COUNTRIES.map((c) => ({
      value: c.name,
      label: c.name,
      name: c.name,
      flagUrl: `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`
    }));
  }, []);

  const languageOptions = useMemo(() => [
    { value: 'en', label: 'English (EN)' },
    { value: 'fr', label: 'Français (FR)' },
    { value: 'pt', label: 'Português (PT)' },
    { value: 'ar', label: 'العربية (AR)' },
    { value: 'am', label: 'አማርኛ (AM)' }
  ], []);

  const [invoiceLanguage, setInvoiceLanguage] = useState(language || 'en');

  useEffect(() => {
    if (language) {
      setInvoiceLanguage(language);
    }
  }, [language]);

  // Due date chips: None, 7 days, 30 days
  const [dueChip, setDueChip] = useState('none'); // 'none' | '7' | '30'

  // Segmented mode: 'quick' | 'full' (Quick link default)
  const [formMode, setFormMode] = useState('quick');
  const [focusedField, setFocusedField] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientBusinessName, setClientBusinessName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCountry, setClientCountry] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientRegistrationNumber, setClientRegistrationNumber] = useState('');

  // Creation and Result states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [toast, setToast] = useState(null);

  // Part B states
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRecentInvoice, setSelectedRecentInvoice] = useState(null);
  const [isRecentExpanded, setIsRecentExpanded] = useState(true);

  const fetchRecentInvoices = useCallback(async (isRefresh = false) => {
    const isBusiness = user?.role === 'merchant' || accountMode === 'business';
    const merchant = user?.merchantProfile;
    if (!isBusiness || !merchant?.id) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingRecent(true);
    }

    try {
      let token = session?.access_token;
      if (!token) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token;
      }
      if (!token) return;

      const res = await fetch(`${BUY_GOODS_API_URL}/merchant/invoices?merchant_id=${merchant.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.invoices && Array.isArray(data.invoices)) {
          setRecentInvoices(data.invoices.slice(0, 10));
        }
      }
    } catch (e) {
      console.warn('[InvoicePayLink] Error fetching recent invoices:', e);
    } finally {
      setIsLoadingRecent(false);
      setIsRefreshing(false);
    }
  }, [user, accountMode, session]);

  useEffect(() => {
    fetchRecentInvoices();
  }, [fetchRecentInvoices]);

  const onRefresh = () => {
    fetchRecentInvoices(true);
  };

  const createPayLink = async () => {
    if (isGenerating) return;

    const numeric = Number(String(amount).replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return setToast({
        title: t('common.error', 'Error'),
        message: t('invoicePayLink.invalidAmount', 'Enter a valid amount.'),
        type: 'error'
      });
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      return setToast({
        title: t('common.error', 'Error'),
        message: t('invoicePayLink.descriptionRequired', 'Please enter a description.'),
        type: 'error'
      });
    }

    const isBusiness = user?.role === 'merchant' || accountMode === 'business';
    const merchant = user?.merchantProfile;
    if (!isBusiness || !merchant?.id) {
      return setToast({
        title: t('common.error', 'Error'),
        message: t('invoicePayLink.switchBusinessAccount', 'Switch to your business account'),
        type: 'error'
      });
    }

    // Phone / Email validation and formatting
    let finalPhone = '';
    let finalEmail = '';

    if (sendMode === 'phone' && phoneInput.trim()) {
      const raw = phoneInput.trim();
      if (raw.startsWith('+')) {
        const parsed = parsePhoneNumberFromString(raw);
        finalPhone = parsed?.isValid() ? parsed.format('E.164') : raw;
      } else {
        const cleanDigits = raw.replace(/^0+/, '');
        const combined = `${selectedDialCode}${cleanDigits}`;
        const parsed = parsePhoneNumberFromString(combined, phoneCountryCode);
        finalPhone = parsed?.isValid() ? parsed.format('E.164') : combined;
      }
    } else if (sendMode === 'email' && emailInput.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.trim())) {
        return setToast({
          title: t('common.error', 'Error'),
          message: t('invoicePayLink.invalidEmail', 'Please enter a valid email address.'),
          type: 'error'
        });
      }
      finalEmail = emailInput.trim().toLowerCase();
    }

    // Due date calculation
    let calculatedDueDate = '';
    if (dueChip === '7') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      calculatedDueDate = d.toISOString().split('T')[0];
    } else if (dueChip === '30') {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      calculatedDueDate = d.toISOString().split('T')[0];
    }

    setIsGenerating(true);
    try {
      let token = session?.access_token;
      if (!token) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token;
      }

      if (!token) {
        setIsGenerating(false);
        return setToast({
          title: t('common.error', 'Error'),
          message: t('invoicePayLink.switchBusinessAccount', 'Switch to your business account'),
          type: 'error'
        });
      }

      const payload = {
        merchant_id: merchant.id,
        amount: numeric,
        currency: currency || 'USDC',
        description: trimmedDesc,
        buyer_name: clientName.trim() || '',
        buyer_email: finalEmail || '',
        buyer_phone: finalPhone || '',
        client_business_name: clientBusinessName.trim() || '',
        client_address: clientAddress.trim() || '',
        client_city: clientCity.trim() || '',
        client_country: clientCountry || '',
        client_registration_number: clientRegistrationNumber.trim() || '',
        buyer_user_id: null,
        due_date: calculatedDueDate || null,
        language: invoiceLanguage,
        notes: '',
        settlement_preferences: {
          crypto_manual: true,
          stablecoins: true,
          momo: true,
          dzy: true,
          fiat: false,
          cards: true
        }
      };

      const res = await fetch(`${BUY_GOODS_API_URL}/merchant/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401 || res.status === 403) {
        setIsGenerating(false);
        return setToast({
          title: t('common.error', 'Error'),
          message: t('invoicePayLink.switchBusinessAccount', 'Switch to your business account'),
          type: 'error'
        });
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.invoice?.payment_link_id) {
        setIsGenerating(false);
        return setToast({
          title: t('common.error', 'Error'),
          message: data?.error || data?.details || t('invoicePayLink.generationFailed', 'Failed to generate payment link. Please try again.'),
          type: 'error'
        });
      }

      const payUrl = `https://dizzitup.com/pay/${data.invoice.payment_link_id}${invoiceLanguage ? `?lng=${invoiceLanguage}` : ''}`;

      let confirmation = '';
      if (finalPhone && finalEmail) {
        confirmation = t('invoicePayLink.sentBySmsAndEmail', 'Sent by SMS and email to {{recipient}}', { recipient: `${finalPhone} / ${finalEmail}` });
      } else if (finalPhone) {
        confirmation = t('invoicePayLink.sentBySms', 'Sent by SMS to {{phone}}', { phone: finalPhone });
      } else if (finalEmail) {
        confirmation = t('invoicePayLink.sentByEmail', 'Sent by email to {{email}}', { email: finalEmail });
      }

      setGenerated({
        amount: numeric.toFixed(2),
        currency: currency || 'USDC',
        description: trimmedDesc,
        url: payUrl,
        confirmation
      });

      // Refresh recent invoices list
      fetchRecentInvoices();
    } catch (err) {
      console.error('[InvoicePayLink] Error creating invoice:', err);
      setToast({
        title: t('common.error', 'Error'),
        message: t('invoicePayLink.generationFailed', 'Failed to generate payment link. Please try again.'),
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareMessage = generated
    ? t('invoicePayLink.shareMessage', 'Payment request: {{amount}} {{currency}} — {{description}} {{url}}', {
        amount: generated.amount,
        currency: generated.currency,
        description: generated.description,
        url: generated.url
      })
    : '';

  const copyLink = async (targetUrl) => {
    const toCopy = targetUrl || generated?.url;
    if (!toCopy) return;
    await Clipboard.setStringAsync(toCopy);
    setToast({
      title: t('common.copied', 'Link copied'),
      message: t('invoicePayLink.copied', 'Payment link copied.'),
      type: 'success'
    });
  };

  const getInvoicePayUrl = (inv) => {
    if (!inv?.payment_link_id) return '';
    const lang = inv.metadata?.language;
    return `https://dizzitup.com/pay/${inv.payment_link_id}${lang ? `?lng=${lang}` : ''}`;
  };

  const shareInvoice = async (inv) => {
    const payUrl = getInvoicePayUrl(inv);
    const amountVal = inv.amount_original || inv.amount;
    const currVal = inv.currency_original || inv.currency;
    const msg = t('invoicePayLink.shareMessage', 'Payment request: {{amount}} {{currency}} — {{description}} {{url}}', {
      amount: amountVal,
      currency: currVal,
      description: inv.description || t('invoicePayLink.defaultDescription', 'Invoice'),
      url: payUrl
    });
    try {
      await Share.share({ title: t('invoicePayLink.title', 'Invoice & DZYpaylink'), message: msg });
    } catch (e) {}
  };

  const getStatusBadge = (inv) => {
    const status = inv.status;
    const dueDate = inv.due_date;
    const isPastDue =
      (status === 'sent' || status === 'viewed' || status === 'draft') &&
      dueDate &&
      new Date(dueDate) < new Date();

    if (status === 'paid') {
      return {
        label: t('invoicePayLink.statusPaid', 'Paid'),
        bg: '#ECFDF5',
        text: '#047857',
        border: '#A7F3D0',
        color: '#10B981'
      };
    }
    if (status === 'overdue' || isPastDue) {
      return {
        label: t('invoicePayLink.statusOverdue', 'Overdue'),
        bg: '#FEF2F2',
        text: '#B91C1C',
        border: '#FECACA',
        color: '#EF4444'
      };
    }
    return {
      label: t('invoicePayLink.statusPending', 'Pending'),
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#FDE68A',
      color: '#FFC759'
    };
  };

  const toggleRecentExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRecentExpanded((prev) => !prev);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#071D54" />
      <LinearGradient
        colors={['#071D54', '#0B2A6F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>{t('invoicePayLink.title', 'Invoice & DZYpaylink')}</Text>
              <Text style={styles.subtitle}>{t('invoicePayLink.subtitle', 'Create and share a simple payment request.')}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#FFC759', '#071D54']} />
          }
        >
          {/* Segmented Switch: Quick link | Full invoice */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentBtn, formMode === 'quick' && styles.segmentBtnActive]}
              onPress={() => setFormMode('quick')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, formMode === 'quick' && styles.segmentTextActive]}>
                {t('invoicePayLink.tabQuickLink', 'Quick link')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, formMode === 'full' && styles.segmentBtnActive]}
              onPress={() => setFormMode('full')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, formMode === 'full' && styles.segmentTextActive]}>
                {t('invoicePayLink.tabFullInvoice', 'Full invoice')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Amount */}
            <Text style={[styles.label, { marginTop: 0 }]}>{t('invoicePayLink.amount', 'Amount')} *</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              onFocus={() => setFocusedField('amount')}
              onBlur={() => setFocusedField(null)}
              keyboardType="decimal-pad"
              placeholder={t('invoicePayLink.placeholderAmount', 'e.g. 5000')}
              style={[styles.input, focusedField === 'amount' && styles.inputFocused]}
              placeholderTextColor="#94A3B8"
            />

            {/* Currency */}
            <Text style={styles.label}>{t('invoicePayLink.currency', 'Currency')}</Text>
            <AppSelect
              value={currency}
              options={currencyOptions}
              onChange={setCurrency}
              title={t('invoicePayLink.currency', 'Currency')}
              style={styles.selectTrigger}
            />

            {/* What is it for (Description - Required) */}
            <Text style={styles.label}>{t('invoicePayLink.description', 'What is it for')} *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              placeholder={t('invoicePayLink.placeholderDescription', 'e.g. Logo design, 2 bags of rice, March rent')}
              style={[
                styles.input,
                styles.description,
                focusedField === 'description' && styles.inputFocused
              ]}
              multiline
              placeholderTextColor="#94A3B8"
            />

            {/* Send to (Optional) */}
            <Text style={styles.label}>{t('invoicePayLink.sendToOptional', 'Send to (optional)')}</Text>
            <View style={styles.sendModeRow}>
              <TouchableOpacity
                style={[styles.sendModeTab, sendMode === 'phone' && styles.sendModeTabActive]}
                onPress={() => setSendMode('phone')}
                activeOpacity={0.8}
              >
                <Ionicons name="call-outline" size={16} color={sendMode === 'phone' ? '#1A2840' : '#64748B'} />
                <Text style={[styles.sendModeText, sendMode === 'phone' && styles.sendModeTextActive]}>
                  {t('invoicePayLink.phoneTab', 'Phone')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendModeTab, sendMode === 'email' && styles.sendModeTabActive]}
                onPress={() => setSendMode('email')}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={16} color={sendMode === 'email' ? '#1A2840' : '#64748B'} />
                <Text style={[styles.sendModeText, sendMode === 'email' && styles.sendModeTextActive]}>
                  {t('invoicePayLink.emailTab', 'Email')}
                </Text>
              </TouchableOpacity>
            </View>

            {sendMode === 'phone' ? (
              <View style={styles.phoneInputRow}>
                <View style={styles.dialPickerWrap}>
                  <AppSelect
                    value={phoneCountryCode}
                    options={countryPickerOptions}
                    onChange={(val) => setPhoneCountryCode(val)}
                    title={t('invoicePayLink.country', 'Country')}
                    searchable={true}
                    renderCustomTrigger={({ setOpen }) => (
                      <TouchableOpacity
                        style={styles.dialTrigger}
                        onPress={() => setOpen(true)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: `https://flagcdn.com/w40/${phoneCountryCode.toLowerCase()}.png` }}
                          style={styles.dialFlag}
                        />
                        <Text style={styles.dialText}>{selectedDialCode}</Text>
                        <Ionicons name="chevron-down" size={14} color="#64748B" />
                      </TouchableOpacity>
                    )}
                  />
                </View>
                <TextInput
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="phone-pad"
                  placeholder={t('invoicePayLink.placeholderPhone', 'e.g. 555 12 34 56')}
                  style={[
                    styles.input,
                    styles.phoneInput,
                    focusedField === 'phone' && styles.inputFocused
                  ]}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            ) : (
              <TextInput
                value={emailInput}
                onChangeText={setEmailInput}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t('invoicePayLink.placeholderEmail', 'e.g. client@email.com')}
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused
                ]}
                placeholderTextColor="#94A3B8"
              />
            )}

            {/* Due date chips */}
            <Text style={styles.label}>{t('invoicePayLink.dueDate', 'Due date')}</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, dueChip === 'none' && styles.chipActive]}
                onPress={() => setDueChip('none')}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, dueChip === 'none' && styles.chipTextActive]}>
                  {t('invoicePayLink.dueNone', 'None')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, dueChip === '7' && styles.chipActive]}
                onPress={() => setDueChip('7')}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, dueChip === '7' && styles.chipTextActive]}>
                  {t('invoicePayLink.due7Days', '7 days')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, dueChip === '30' && styles.chipActive]}
                onPress={() => setDueChip('30')}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, dueChip === '30' && styles.chipTextActive]}>
                  {t('invoicePayLink.due30Days', '30 days')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Client Details Card (Full invoice mode) */}
            {formMode === 'full' && (
              <View style={styles.clientDetailsCard}>
                <View style={styles.clientDetailsHeader}>
                  <Ionicons name="person-outline" size={16} color="#071D54" />
                  <Text style={styles.clientDetailsTitle}>
                    {t('invoicePayLink.clientDetailsTitle', 'Client details')}
                  </Text>
                </View>

                <Text style={styles.subLabel}>{t('invoicePayLink.clientName', 'Client name')}</Text>
                <TextInput
                  value={clientName}
                  onChangeText={setClientName}
                  onFocus={() => setFocusedField('clientName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('invoicePayLink.placeholderClientName', 'e.g. Karim Benali')}
                  style={[styles.input, focusedField === 'clientName' && styles.inputFocused]}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.subLabel}>{t('invoicePayLink.clientBusinessName', 'Client business name')}</Text>
                <TextInput
                  value={clientBusinessName}
                  onChangeText={setClientBusinessName}
                  onFocus={() => setFocusedField('clientBusinessName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('invoicePayLink.placeholderBusiness', 'e.g. Atlas SARL')}
                  style={[styles.input, focusedField === 'clientBusinessName' && styles.inputFocused]}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.subLabel}>{t('invoicePayLink.address', 'Address')}</Text>
                <TextInput
                  value={clientAddress}
                  onChangeText={setClientAddress}
                  onFocus={() => setFocusedField('clientAddress')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('invoicePayLink.placeholderAddress', 'e.g. 12 Rue Didouche Mourad')}
                  style={[styles.input, focusedField === 'clientAddress' && styles.inputFocused]}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.subLabel}>{t('invoicePayLink.country', 'Country')}</Text>
                <AppSelect
                  value={clientCountry}
                  options={clientCountryOptions}
                  onChange={setClientCountry}
                  title={t('invoicePayLink.country', 'Country')}
                  placeholder={t('invoicePayLink.selectCountry', 'Select country (optional)')}
                  searchable={true}
                  style={styles.selectTrigger}
                  renderLeading={(sel) =>
                    sel?.flagUrl ? (
                      <Image source={{ uri: sel.flagUrl }} style={{ width: 22, height: 14, borderRadius: 2, marginRight: 8 }} />
                    ) : null
                  }
                />

                <Text style={styles.subLabel}>{t('invoicePayLink.city', 'City')}</Text>
                <TextInput
                  value={clientCity}
                  onChangeText={setClientCity}
                  onFocus={() => setFocusedField('clientCity')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('invoicePayLink.placeholderCity', 'e.g. Algiers')}
                  style={[styles.input, focusedField === 'clientCity' && styles.inputFocused]}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.subLabel}>{t('invoicePayLink.registrationNumber', 'Registration number')}</Text>
                <TextInput
                  value={clientRegistrationNumber}
                  onChangeText={setClientRegistrationNumber}
                  onFocus={() => setFocusedField('clientRegistrationNumber')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t('invoicePayLink.placeholderRegistration', 'e.g. RC 16/00-1234567')}
                  style={[styles.input, focusedField === 'clientRegistrationNumber' && styles.inputFocused]}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.subLabel}>{t('invoicePayLink.invoiceLanguage', 'Invoice language')}</Text>
                <AppSelect
                  value={invoiceLanguage}
                  options={languageOptions}
                  onChange={setInvoiceLanguage}
                  title={t('invoicePayLink.invoiceLanguage', 'Invoice language')}
                  placeholder={t('invoicePayLink.selectLanguage', 'Select language')}
                  style={styles.selectTrigger}
                />
              </View>
            )}

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.generateBtn, isGenerating && { opacity: 0.7 }]}
              onPress={createPayLink}
              disabled={isGenerating}
              activeOpacity={0.85}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#1A2840" />
              ) : (
                <>
                  <Ionicons name="link-outline" size={20} color="#1A2840" />
                  <Text style={styles.generateText}>{t('invoicePayLink.generate', 'Generate payment link')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Generated Result Card */}
          {generated && (
            <View style={styles.resultCard}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={22} color="#047857" />
              </View>
              <Text style={styles.resultTitle}>
                {generated.amount} {generated.currency}
              </Text>
              <Text style={styles.url} numberOfLines={2}>
                {generated.url}
              </Text>

              {!!generated.confirmation && (
                <View style={styles.confirmationBadge}>
                  <Ionicons name="paper-plane-outline" size={14} color="#047857" />
                  <Text style={styles.confirmationText}>{generated.confirmation}</Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyLink(generated.url)} activeOpacity={0.8}>
                  <Ionicons name="copy-outline" size={18} color="#1A2840" />
                  <Text style={styles.copyText}>{t('common.copy', 'Copy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shareBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    Share.share({
                      title: t('invoicePayLink.title', 'Invoice & DZYpaylink'),
                      message: shareMessage
                    })
                  }
                >
                  <Ionicons name="share-social-outline" size={18} color="#FFF" />
                  <Text style={styles.shareText}>{t('common.share', 'Share')}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => Linking.openURL(INVOICE_DASHBOARD_URL)} activeOpacity={0.7}>
                <Text style={styles.dashboardLink}>{t('invoicePayLink.fullDashboard', 'Open full invoice dashboard')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Part B: Recent Payment Requests */}
          <View style={styles.recentSection}>
            <TouchableOpacity
              style={styles.recentHeader}
              onPress={toggleRecentExpanded}
              activeOpacity={0.7}
            >
              <View style={styles.recentHeaderLeft}>
                <Text style={styles.recentTitle}>
                  {t('invoicePayLink.recentRequestsHeader', 'Recent requests')}
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{recentInvoices.length}</Text>
                </View>
              </View>
              <View style={styles.recentHeaderRight}>
                {isLoadingRecent && <ActivityIndicator size="small" color="#071D54" style={{ marginRight: 8 }} />}
                <Ionicons
                  name={isRecentExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </View>
            </TouchableOpacity>

            {isRecentExpanded && (
              <>
                {recentInvoices.length === 0 && !isLoadingRecent ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
                    <Text style={styles.emptyText}>
                      {t('invoicePayLink.noRecentRequests', 'No recent payment requests')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.recentList}>
                    {recentInvoices.map((inv) => {
                      const statusInfo = getStatusBadge(inv);
                      const amountDisplay = `${inv.amount_original || inv.amount} ${inv.currency_original || inv.currency}`;
                      const clientDisplay =
                        inv.buyer_name ||
                        inv.buyer_email ||
                        inv.buyer_phone ||
                        t('invoicePayLink.noClient', 'No client');
                      const dateDisplay = inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '';

                      return (
                        <TouchableOpacity
                          key={inv.id}
                          style={[
                            styles.recentCard,
                            { borderLeftColor: statusInfo.color }
                          ]}
                          onPress={() => setSelectedRecentInvoice(inv)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.recentItemLeft}>
                            <View style={styles.recentItemTopRow}>
                              <Text style={styles.recentAmount}>{amountDisplay}</Text>
                              <View
                                style={[
                                  styles.statusBadge,
                                  { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }
                                ]}
                              >
                                <Text style={[styles.statusText, { color: statusInfo.text }]}>
                                  {statusInfo.label}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.recentClient} numberOfLines={1}>
                              {clientDisplay}
                            </Text>
                            <View style={styles.recentItemBottomRow}>
                              <Text style={styles.recentDate}>{dateDisplay}</Text>
                              {!!inv.description && (
                                <Text style={styles.recentDesc} numberOfLines={1}>
                                  {inv.description}
                                </Text>
                              )}
                            </View>
                          </View>
                          <View style={styles.recentItemArrow}>
                            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Quick Action Modal for Recent Invoices */}
      {selectedRecentInvoice && (
        <Modal
          visible={!!selectedRecentInvoice}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedRecentInvoice(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedRecentInvoice(null)} />
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalInvoiceNum}>
                    {selectedRecentInvoice.invoice_number || 'INV'}
                  </Text>
                  <Text style={styles.modalAmount}>
                    {selectedRecentInvoice.amount_original || selectedRecentInvoice.amount}{' '}
                    {selectedRecentInvoice.currency_original || selectedRecentInvoice.currency}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedRecentInvoice(null)}
                >
                  <Ionicons name="close" size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalUrl} numberOfLines={1}>
                {getInvoicePayUrl(selectedRecentInvoice)}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCopyBtn}
                  onPress={() => {
                    const url = getInvoicePayUrl(selectedRecentInvoice);
                    copyLink(url);
                    setSelectedRecentInvoice(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="copy-outline" size={18} color="#1A2840" />
                  <Text style={styles.modalCopyText}>
                    {t('invoicePayLink.copyPayLink', 'Copy payment link')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalShareBtn}
                  onPress={() => {
                    shareInvoice(selectedRecentInvoice);
                    setSelectedRecentInvoice(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social-outline" size={18} color="#FFF" />
                  <Text style={styles.modalShareText}>
                    {t('invoicePayLink.sharePayLink', 'Share payment link')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <AppToast
        visible={!!toast}
        title={toast?.title}
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F4F9'
  },
  headerGradient: {
    paddingBottom: 16
  },
  headerSafeArea: {
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 12) : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  headerTitles: {
    flex: 1
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#FFFFFF'
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#E2E8F0',
    marginTop: 2
  },
  container: {
    flex: 1,
    backgroundColor: '#F1F4F9'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  segmentText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B'
  },
  segmentTextActive: {
    color: '#071D54'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 6,
    marginTop: 14
  },
  subLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 6,
    marginTop: 12
  },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: '#D6DCE8',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
    backgroundColor: '#FFFFFF'
  },
  inputFocused: {
    borderColor: '#FFC759'
  },
  description: {
    minHeight: 76,
    paddingTop: 12,
    textAlignVertical: 'top'
  },
  selectTrigger: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D6DCE8',
    borderRadius: 14,
    minHeight: 48
  },
  sendModeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10
  },
  sendModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6
  },
  sendModeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  sendModeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B'
  },
  sendModeTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840'
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dialPickerWrap: {
    width: 105,
    marginRight: 8
  },
  dialTrigger: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D6DCE8',
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dialFlag: {
    width: 20,
    height: 14,
    borderRadius: 2
  },
  dialText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840'
  },
  phoneInput: {
    flex: 1
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipActive: {
    backgroundColor: '#20365B',
    borderColor: '#20365B'
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B'
  },
  chipTextActive: {
    color: '#FFFFFF'
  },
  clientDetailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 16
  },
  clientDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  clientDetailsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#071D54'
  },
  generateBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFC759',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  generateText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840'
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 4,
    borderTopColor: '#071D54',
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  successIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resultTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginTop: 8
  },
  url: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 8
  },
  confirmationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10
  },
  confirmationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#047857'
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  copyBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE4EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF'
  },
  copyText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840'
  },
  shareBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#071D54',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7
  },
  shareText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF'
  },
  dashboardLink: {
    fontFamily: 'Inter_600SemiBold',
    color: '#2563EB',
    marginTop: 15,
    textDecorationLine: 'underline'
  },
  recentSection: {
    marginTop: 20
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8
  },
  recentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recentTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#1A2840'
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8
  },
  countBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#071D54'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#94A3B8'
  },
  recentList: {
    gap: 10
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  recentItemLeft: {
    flex: 1
  },
  recentItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  recentAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11
  },
  recentClient: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#334155',
    marginBottom: 4
  },
  recentItemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  recentDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8'
  },
  recentDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    flex: 1
  },
  recentItemArrow: {
    marginLeft: 10
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8EDF4'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  modalInvoiceNum: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B'
  },
  modalAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginTop: 2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalUrl: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  modalActions: {
    gap: 10
  },
  modalCopyBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE4EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF'
  },
  modalCopyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840'
  },
  modalShareBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#071D54',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  modalShareText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF'
  }
});
