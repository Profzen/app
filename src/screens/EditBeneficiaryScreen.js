import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, ActivityIndicator, Modal, FlatList, TextInput, Image, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import contactService from '../services/contactService';
import { smsService } from '../services/smsService';
import { supabase } from '../services/supabaseClient';
import { isValidPhoneNumber } from 'libphonenumber-js';

const AVATARS = [
  { id: 'avatar_1', emoji: '👩' },
  { id: 'avatar_2', emoji: '👨' },
  { id: 'avatar_3', emoji: '👧' },
  { id: 'avatar_4', emoji: '👦' },
  { id: 'avatar_5', emoji: '👵' },
  { id: 'avatar_6', emoji: '👴' },
];

const WEB_RELATIONSHIPS = [
  { key: 'parent', labelKey: 'beneficiary.relations.parent', default: 'Parent' },
  { key: 'sibling', labelKey: 'beneficiary.relations.sibling', default: 'Sibling' },
  { key: 'child', labelKey: 'beneficiary.relations.child', default: 'Child' },
  { key: 'spouse_husband', labelKey: 'beneficiary.relations.spouse_husband', default: 'Spouse / Husband' },
  { key: 'business_partner', labelKey: 'beneficiary.relations.business_partner', default: 'Business Partner' },
  { key: 'relative', labelKey: 'beneficiary.relations.relative', default: 'Relative' },
  { key: 'friend', labelKey: 'beneficiary.relations.friend', default: 'Friend' },
];

const getUniversalFlag = (emoji, code) => {
  if (emoji && typeof emoji === 'string' && emoji.trim() !== '' && emoji !== 'null' && emoji !== 'NULL') {
    return emoji;
  }
  if (code && typeof code === 'string' && code.length === 2) {
    try {
      const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (e) {
      return '🌍';
    }
  }
  return '🌍';
};

export default function EditBeneficiaryScreen({ route }) {
  const navigation = useNavigation();
  const { session, user, t } = useApp();
  
  const isEditing = route.params?.isEditing || false;
  const beneficiary = route.params?.beneficiary || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [walletsSynced, setWalletsSynced] = useState(
    Boolean(beneficiary.evm_address || beneficiary.solana_address)
  );
  const [userNotRegistered, setUserNotRegistered] = useState(false);

  const [formData, setFormData] = useState({
    first_name: beneficiary.first_name || '',
    last_name: beneficiary.last_name || '',
    relationship: beneficiary.relationship || beneficiary.relation || 'friend',
    phone: beneficiary.phone || beneficiary.phone_number || '',
    email: beneficiary.email || '',
    country: beneficiary.country_name || beneficiary.country || '',
    country_code: beneficiary.country_code || '',
    city: beneficiary.city || '',
    bank_name: beneficiary.bank_name || '',
    bank_account: beneficiary.bank_account || '',
    evm_address: beneficiary.evm_address || '',
    solana_address: beneficiary.solana_address || '',
    avatar_url: beneficiary.avatar_url || beneficiary.image || '',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [duplicateAccounts, setDuplicateAccounts] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showNoWalletModal, setShowNoWalletModal] = useState(false);

  const [countries, setCountries] = useState([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('name, code, flag_emoji')
        .eq('is_active', true)
        .order('name');
      if (!error && data) {
        setCountries(data);
        if (!formData.country && formData.country_code) {
          const match = data.find(c => c.code === formData.country_code);
          if (match) {
            setFormData(prev => ({ ...prev, country: match.name }));
          }
        }
      }
    } catch (e) {
      console.log('Error fetching countries:', e);
    }
  };

  const fetchCities = async (countryName) => {
    if (!countryName) return;
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('name')
        .eq('country_name', countryName)
        .order('name');
      if (!error && data) {
        setCities(data.map(c => c.name));
      } else {
        setCities([]);
      }
    } catch (e) {
      console.log('Error fetching cities:', e);
    }
  };

  useEffect(() => {
    if (formData.country) {
      fetchCities(formData.country);
    } else {
      setCities([]);
    }
  }, [formData.country]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const performLookup = async (phone, email = '') => {
    setIsSyncing(true);
    try {
      const token = session?.access_token;
      const phoneToSend = phone.startsWith('+') ? phone : `+${phone.replace(/^0+/, '')}`;
      const rawWalletApi = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'https://wallet.dizzitup.com/api';
      const walletBase = rawWalletApi.replace(/\/wallet\/?$/, '').replace(/\/api\/?$/, '') + '/api/wallet';

      let queryParams = `phone=${encodeURIComponent(phoneToSend)}`;
      if (email && typeof email === 'string' && email.trim()) {
        queryParams += `&email=${encodeURIComponent(email.trim())}`;
      }

      const res = await fetch(`${walletBase}/lookup-by-phone?${queryParams}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      if (res.ok) {
        const result = await res.json();
        const accounts = result.success ? result.matches : [];
        if (accounts.length > 1) {
          setDuplicateAccounts(accounts);
          setShowDuplicateModal(true);
          setUserNotRegistered(false);
          return { found: true, duplicate: true };
        } else if (accounts.length === 1) {
          const account = accounts[0];
          setFormData(prev => ({
            ...prev,
            first_name: prev.first_name || account.first_name || (account.name ? account.name.split(' ')[0] : ''),
            last_name: prev.last_name || account.last_name || (account.name ? account.name.split(' ').slice(1).join(' ') : ''),
            email: prev.email || account.email,
            country: prev.country || account.country || '',
            city: prev.city || account.city || '',
            evm_address: account.evm_address || prev.evm_address,
            solana_address: account.solana_address || prev.solana_address,
            avatar_url: account.avatar_url || account.avatar || prev.avatar_url,
          }));
          setWalletsSynced(true);
          setUserNotRegistered(false);
          return { found: true, duplicate: false };
        }
      }

      // Fallback to supabase RPC
      const { data: rpcData, error } = await supabase.rpc('get_beneficiary_wallet_info', { p_contact: phoneToSend });
      if (!error && rpcData && rpcData.found) {
        setFormData(prev => ({
          ...prev,
          evm_address: rpcData.evm_address || prev.evm_address,
          solana_address: rpcData.solana_address || prev.solana_address,
        }));
        setWalletsSynced(true);
        setUserNotRegistered(false);
        return { found: true, duplicate: false };
      } else {
        // User not registered on DizzitUp yet
        setUserNotRegistered(true);
        setWalletsSynced(false);
        return { found: false, duplicate: false };
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setUserNotRegistered(true);
      setWalletsSynced(false);
      return { found: false, duplicate: false };
    } finally {
      setIsSyncing(false);
    }
  };

  const lookupWalletByPhone = async () => {
    if (!formData.phone) {
      AppToast.showError(t('beneficiary.edit.sync_req_phone', "Please enter a phone number first"));
      return;
    }
    const cleanPhone = formData.phone.trim();
    const result = await performLookup(cleanPhone, formData.email);
    if (result.found && !result.duplicate) {
      AppToast.showSuccess(t('beneficiary.form.wallet_synced_success', "DizzitUp User found! Wallets auto-synced. ✨"));
    } else if (!result.found) {
      AppToast.showInfo(t('beneficiary.edit.sync_not_found_info', "No DizzitUp account found yet. You can continue saving; wallets are optional."));
    }
  };

  const handleSelectDuplicate = (account) => {
    setFormData(prev => ({
      ...prev,
      first_name: prev.first_name || account.first_name || (account.name ? account.name.split(' ')[0] : ''),
      last_name: prev.last_name || account.last_name || (account.name ? account.name.split(' ').slice(1).join(' ') : ''),
      email: prev.email || account.email,
      country: prev.country || account.country || '',
      city: prev.city || account.city || '',
      evm_address: account.evm_address || prev.evm_address,
      solana_address: account.solana_address || prev.solana_address,
      avatar_url: account.avatar_url || account.avatar || prev.avatar_url,
    }));
    setWalletsSynced(true);
    setUserNotRegistered(false);
    setShowDuplicateModal(false);
    setCurrentStep(2);
    AppToast.showSuccess(t('beneficiary.edit.sync_success', "Wallets successfully synced"));
  };

  const handleProceedToStep2 = async () => {
    if (!formData.first_name && !formData.last_name) {
      AppToast.showError(t('beneficiary.edit.save_req_name', "Name is required"));
      return;
    }
    
    if (!formData.phone) {
      AppToast.showError(t('beneficiary.form.phoneNumberRequired', "Phone number is required"));
      return;
    }

    const selectedCountry = countries.find(c => c.name === formData.country || c.code === formData.country_code);
    const countryCode = selectedCountry ? selectedCountry.code : (formData.country_code || (formData.country && formData.country.length === 2 ? formData.country.toUpperCase() : 'US'));
    
    const cleanPhone = formData.phone.trim();
    
    let phoneValid = isValidPhoneNumber(cleanPhone, countryCode);
    if (!phoneValid && cleanPhone.startsWith('+')) {
      phoneValid = isValidPhoneNumber(cleanPhone);
    }
    if (!phoneValid) {
      AppToast.showError(t('beneficiary.form.errors.invalidPhone', "Invalid phone number"));
      return;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      AppToast.showError(t('beneficiary.form.errors.invalidEmail', "Invalid email address"));
      return;
    }

    // Automatically check user in background if not synced yet
    if (!walletsSynced && !isEditing) {
      const result = await performLookup(cleanPhone, formData.email);
      if (!result.found && !result.duplicate) {
        setShowNoWalletModal(true);
        return;
      }
    }

    setCurrentStep(2);
  };

  const handleSave = async () => {
    if (!formData.first_name && !formData.last_name) {
      AppToast.showError(t('beneficiary.edit.save_req_name', "Name is required"));
      return;
    }
    
    if (!formData.phone) {
      AppToast.showError(t('beneficiary.form.phoneNumberRequired', "Phone number is required"));
      return;
    }

    const selectedCountry = countries.find(c => c.name === formData.country || c.code === formData.country_code);
    const countryCode = selectedCountry ? selectedCountry.code : (formData.country_code || (formData.country && formData.country.length === 2 ? formData.country.toUpperCase() : 'US'));
    
    const cleanPhone = formData.phone.trim();
    
    let phoneValid = isValidPhoneNumber(cleanPhone, countryCode);
    if (!phoneValid && cleanPhone.startsWith('+')) {
      phoneValid = isValidPhoneNumber(cleanPhone);
    }
    if (!phoneValid) {
      AppToast.showError(t('beneficiary.form.errors.invalidPhone', "Invalid phone number"));
      return;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      AppToast.showError(t('beneficiary.form.errors.invalidEmail', "Invalid email address"));
      return;
    }

    setIsSaving(true);
    try {
      const fName = formData.first_name ? formData.first_name.trim() : '';
      const lName = formData.last_name ? formData.last_name.trim() : '';

      // 🛡️ CRITICAL: Never include `full_name` in insert/update payload!
      // In Supabase PostgreSQL, `full_name` is a GENERATED ALWAYS column.
      const payload = {
        first_name: fName,
        last_name: lName,
        relationship: formData.relationship || 'friend',
        phone: cleanPhone,
        email: formData.email ? formData.email.trim() : '',
        country_code: countryCode,
        city: formData.city || '',
        bank_name: formData.bank_name || '',
        bank_account: formData.bank_account || '',
        evm_address: formData.evm_address || '',
        solana_address: formData.solana_address || '',
        avatar_url: formData.avatar_url || '',
      };

      const userId = user?.id || session?.user?.id;
      if (isEditing && beneficiary?.id) {
        const updateRes = await contactService.updateBeneficiary(beneficiary.id, payload);
        if (!updateRes.success) throw new Error(updateRes.error);
        AppToast.showSuccess(t('beneficiary.edit.save_success_edit', "Beneficiary updated"));
      } else {
        const addRes = await contactService.addBeneficiary(userId, payload);
        if (!addRes.success) throw new Error(addRes.error);
        AppToast.showSuccess(t('beneficiary.edit.save_success_add', "Beneficiary added"));
      }
      if (route.params?.pivotScreen) {
        navigation.navigate(route.params.pivotScreen, route.params.pivotParams);
      } else {
        navigation.goBack();
      }
    } catch (err) {
      console.error("Save error:", err);
      AppToast.showError(err?.message || t('beneficiary.edit.save_error', "Error saving beneficiary"));
    } finally {
      setIsSaving(false);
    }
  };

  const getCountryFlag = (countryName) => {
    const c = countries.find(x => x.name === countryName || x.code === formData.country_code);
    if (!c) return '🌍';
    return getUniversalFlag(c.flag_emoji, c.code);
  };

  const filteredCountries = countrySearch 
    ? countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())) 
    : countries;

  const filteredCities = citySearch 
    ? cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())) 
    : cities;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            if (currentStep === 2 && !isEditing) {
              setCurrentStep(1);
            } else if (route.params?.pivotScreen) {
              navigation.navigate(route.params.pivotScreen, route.params.pivotParams);
            } else {
              navigation.goBack();
            }
          }}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? t('beneficiary.edit.edit_title_update', 'Edit') : t('beneficiary.edit.edit_title_new', 'New Beneficiary')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Multi-step indicator bar */}
        <View style={styles.stepIndicatorContainer}>
          <TouchableOpacity
            style={[styles.stepTab, currentStep === 1 && styles.stepTabActive]}
            onPress={() => setCurrentStep(1)}
            activeOpacity={0.7}
          >
            <View style={[styles.stepCircle, currentStep === 1 && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, currentStep === 1 && styles.stepCircleTextActive]}>1</Text>
            </View>
            <Text style={[styles.stepTabText, currentStep === 1 && styles.stepTabTextActive]} numberOfLines={1}>
              {t('beneficiary.edit.personal_info', 'Contact Info')}
            </Text>
          </TouchableOpacity>

          <View style={[styles.stepConnector, currentStep === 2 && styles.stepConnectorActive]} />

          <TouchableOpacity
            style={[styles.stepTab, currentStep === 2 && styles.stepTabActive]}
            onPress={() => {
              if (isEditing) {
                setCurrentStep(2);
              } else {
                handleProceedToStep2();
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.stepCircle, currentStep === 2 && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, currentStep === 2 && styles.stepCircleTextActive]}>2</Text>
            </View>
            <Text style={[styles.stepTabText, currentStep === 2 && styles.stepTabTextActive]} numberOfLines={1}>
              {t('beneficiary.edit.banks_wallets', 'Wallets & Banks')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {currentStep === 1 ? (
            <React.Fragment>
              {/* Personal Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('beneficiary.edit.personal_info', 'Personal Information')}</Text>

                <Text style={styles.label}>{t('beneficiary.edit.avatar', 'Avatar')}</Text>
                {formData.avatar_url && (formData.avatar_url.startsWith('http') || formData.avatar_url.startsWith('data:')) ? (
                  <View style={styles.syncedAvatarPreview}>
                    <Image source={{ uri: formData.avatar_url }} style={styles.syncedAvatarImage} />
                    <View style={styles.syncedAvatarInfo}>
                      <Text style={styles.syncedAvatarBadge}>
                        {t('beneficiary.edit.real_avatar', '✨ DizzitUp Account Photo')}
                      </Text>
                      <TouchableOpacity onPress={() => handleInputChange('avatar_url', '')} style={{ marginTop: 4 }}>
                        <Text style={styles.resetAvatarText}>{t('common.remove', 'Use default emoji')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
                <View style={styles.avatarGrid}>
                  {AVATARS.map((av) => (
                    <TouchableOpacity
                      key={av.id}
                      style={[styles.avatarChoice, formData.avatar_url === av.id && styles.avatarChoiceSelected]}
                      onPress={() => handleInputChange('avatar_url', av.id)}
                    >
                      <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <DizzitInput
                  label={t('beneficiary.edit.first_name', 'First Name') + ' *'}
                  placeholder={t('beneficiary.edit.first_name_placeholder', 'Ex: John')}
                  value={formData.first_name}
                  onChangeText={(text) => handleInputChange('first_name', text)}
                />

                <DizzitInput
                  label={t('beneficiary.edit.last_name', 'Last Name')}
                  placeholder={t('beneficiary.edit.last_name_placeholder', 'Ex: Doe')}
                  value={formData.last_name}
                  onChangeText={(text) => handleInputChange('last_name', text)}
                />

                <Text style={styles.label}>{t('beneficiary.edit.relation', 'Relationship')}</Text>
                <View style={styles.relationGrid}>
                  {WEB_RELATIONSHIPS.map((rel) => {
                    const isSelected = formData.relationship === rel.key;
                    return (
                      <TouchableOpacity
                        key={rel.key}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => handleInputChange('relationship', rel.key)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                          {t(rel.labelKey, rel.default)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Contact Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('beneficiary.edit.contact_details', 'Contact Details')}</Text>

                <View style={styles.flexRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.label}>{t('beneficiary.edit.country', 'Country')}</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCountryPicker(true)}>
                      <Text style={formData.country ? styles.pickerButtonText : styles.pickerButtonPlaceholder} numberOfLines={1}>
                        {formData.country ? `${getCountryFlag(formData.country)} ${formData.country}` : 'Ex: Togo'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={styles.label}>{t('beneficiary.edit.city', 'City')}</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => { setCitySearch(''); setShowCityPicker(true); }}>
                      <Text style={formData.city ? styles.pickerButtonText : styles.pickerButtonPlaceholder} numberOfLines={1}>
                        {formData.city || 'Ex: Lomé'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <DizzitInput
                      label={t('beneficiary.edit.phone', 'Phone') + ' *'}
                      placeholder={t('beneficiary.edit.phone_placeholder', '+228...')}
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(text) => handleInputChange('phone', text)}
                    />
                  </View>
                  <TouchableOpacity style={styles.syncButton} onPress={lookupWalletByPhone} disabled={isSyncing}>
                    {isSyncing ? <ActivityIndicator color="#0052FF" /> : <Ionicons name="sync-outline" size={24} color="#0052FF" />}
                  </TouchableOpacity>
                </View>

                <DizzitInput
                  label={`${t('beneficiary.edit.email', 'Email')} (${t('common.optional', 'Optional')})`}
                  placeholder={t('beneficiary.edit.email_placeholder', 'Ex: email@example.com')}
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                />
              </View>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {/* Step 2: Notice Card & Wallets */}

              {/* DizzitUp Invitation Card if user not registered in DB */}
              {userNotRegistered && (
                <View style={styles.inviteCard}>
                  <View style={styles.inviteIconCircle}>
                    <Ionicons name="paper-plane-outline" size={20} color="#20365B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.inviteHeaderRow}>
                      <Text style={styles.inviteTitle}>
                        {t('beneficiary.form.invite_notice_title', 'Invitation to DizzitUp')}
                      </Text>
                      <View style={styles.optionalBadge}>
                        <Text style={styles.optionalBadgeText}>
                          {t('beneficiary.form.optional_badge', 'Optional')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.inviteDesc}>
                      {t('beneficiary.form.invite_notice_desc', 'This contact is not yet on DizzitUp. An SMS & email invitation will be sent to them. Once they join, their wallet addresses will link automatically.')}
                    </Text>
                    <View style={styles.inviteFooterRow}>
                      <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                      <Text style={styles.inviteFooterText}>
                        {t('beneficiary.form.optional_notice_footer', 'Bank & wallet details below are optional for mobile recharge, electricity bills, and store goods.')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Success Badge if user was found & auto-synced */}
              {walletsSynced && !userNotRegistered && (
                <View style={styles.syncedCard}>
                  <Ionicons name="sparkles" size={18} color="#10B981" style={{ marginRight: 8 }} />
                  <Text style={styles.syncedCardText}>
                    {t('beneficiary.form.wallet_synced_success', 'DizzitUp User found! Wallets auto-synced. ✨')}
                  </Text>
                </View>
              )}

              {/* Banks & Wallets */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{t('beneficiary.edit.banks_wallets', 'Banks & Wallets')}</Text>
                  <Text style={styles.sectionOptionalTag}>({t('beneficiary.form.optional_badge', 'Optional')})</Text>
                </View>

                <DizzitInput
                  label={`${t('beneficiary.edit.bank_name', 'Bank Name')} (${t('common.optional', 'Optional')})`}
                  placeholder={t('beneficiary.edit.bank_name_placeholder', 'Ex: Ecobank')}
                  value={formData.bank_name}
                  onChangeText={(text) => handleInputChange('bank_name', text)}
                />

                <DizzitInput
                  label={`${t('beneficiary.edit.bank_account', 'Account Number / IBAN')} (${t('common.optional', 'Optional')})`}
                  placeholder=""
                  value={formData.bank_account}
                  onChangeText={(text) => handleInputChange('bank_account', text)}
                />

                <DizzitInput
                  label={`${t('beneficiary.edit.evm_wallet', 'EVM Wallet (Polygon/BSC)')} (${t('common.optional', 'Optional')})`}
                  placeholder={t('beneficiary.edit.evm_wallet_placeholder', '0x...')}
                  value={formData.evm_address}
                  onChangeText={(text) => handleInputChange('evm_address', text)}
                />

                <DizzitInput
                  label={`${t('beneficiary.edit.solana_wallet', 'Solana Wallet')} (${t('common.optional', 'Optional')})`}
                  placeholder=""
                  value={formData.solana_address}
                  onChangeText={(text) => handleInputChange('solana_address', text)}
                />
              </View>
            </React.Fragment>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          {currentStep === 1 ? (
            <View style={styles.stepFooterSingle}>
              <DizzitButton
                title={isSyncing ? t('common.loading', 'Checking...') : `${t('beneficiary.buttons.continue', 'Continue')} →`}
                onPress={handleProceedToStep2}
                isLoading={isSyncing}
              />
            </View>
          ) : (
            <View style={styles.stepFooterRow}>
              <TouchableOpacity
                style={styles.backStepButton}
                onPress={() => setCurrentStep(1)}
              >
                <Ionicons name="arrow-back" size={18} color="#20365B" />
                <Text style={styles.backStepText}>{t('beneficiary.buttons.back', 'Back')}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <DizzitButton
                  title={t('beneficiary.edit.btn_save', 'Save')}
                  onPress={handleSave}
                  isLoading={isSaving}
                />
              </View>
            </View>
          )}
        </View>

        {/* Modals */}
        
        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('beneficiary.edit.country', 'Country')}</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Ionicons name="close" size={24} color="#1A2840" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.citySearchInput}
                placeholder={t('common.search', 'Search...')}
                placeholderTextColor="#94A3B8"
                value={countrySearch}
                onChangeText={setCountrySearch}
              />

              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        country: item.name,
                        country_code: item.code,
                        city: ''
                      }));
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{getUniversalFlag(item.flag_emoji, item.code)} {item.name}</Text>
                    {formData.country === item.name && <Ionicons name="checkmark" size={20} color="#0052FF" />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* City Picker Modal */}
        <Modal visible={showCityPicker} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('beneficiary.edit.city', 'City')}</Text>
                <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                  <Ionicons name="close" size={24} color="#1A2840" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.citySearchInput}
                placeholder={t('common.search', 'Search...')}
                placeholderTextColor="#94A3B8"
                value={citySearch}
                onChangeText={setCitySearch}
              />

              <FlatList
                data={filteredCities}
                keyExtractor={(item, index) => `${item}_${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, city: item }));
                      setShowCityPicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                    {formData.city === item && <Ionicons name="checkmark" size={20} color="#0052FF" />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#94A3B8', fontFamily: 'Inter_500Medium' }}>
                      {t('common.no_results', 'No cities found')}
                    </Text>
                  </View>
                )}
              />

              {/* Custom City option */}
              {citySearch.trim() !== '' && !filteredCities.includes(citySearch.trim()) && (
                <TouchableOpacity
                  style={styles.modalItemCustom}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, city: citySearch.trim() }));
                    setShowCityPicker(false);
                  }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#0052FF" style={{ marginRight: 8 }} />
                  <Text style={styles.modalItemTextCustom}>
                    {t('common.use_custom_city', 'Use')} "{citySearch.trim()}"
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* No Crypto Wallet Linked Modal */}
        <Modal
          visible={showNoWalletModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowNoWalletModal(false);
            setCurrentStep(2);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingHorizontal: 20 }]}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ionicons name="wallet-outline" size={26} color="#D97706" />
                </View>
                <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1A2840', textAlign: 'center', marginBottom: 8 }}>
                  {t('wallet.no_crypto_wallet_title', 'No Crypto Wallet Linked')}
                </Text>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center' }}>
                  {t('wallet.no_crypto_wallet_desc', { name: formData.first_name || 'This beneficiary' })}
                </Text>
              </View>

              <View style={{ marginTop: 8 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#0052FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}
                  onPress={async () => {
                    const inviteUrl = user?.referralCode ? `https://dizzitup.com/invite?ref=${user.referralCode}` : 'https://dizzitup.com/invite';
                    const inviteMsg = t('wallet.invite_msg', `Join me on DizzitUp to easily receive funds and manage your payments: ${inviteUrl}`);
                    try {
                      await Share.share({ message: inviteMsg });
                      setShowNoWalletModal(false);
                      setCurrentStep(2);
                    } catch (e) {
                      console.warn(e);
                      AppToast.showError(e.message || t('common.error', 'An error occurred'));
                    }
                  }}
                >
                  <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                    {t('wallet.action_send_invite', 'Send Invite (SMS / WhatsApp)')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}
                  onPress={() => {
                    setShowNoWalletModal(false);
                    setCurrentStep(2);
                  }}
                >
                  <Ionicons name="create-outline" size={16} color="#1A2840" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#1A2840', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                    {t('wallet.action_enter_manual', 'Enter Address Manually')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}
                  onPress={() => {
                    setShowNoWalletModal(false);
                    handleSave();
                  }}
                >
                  <Ionicons name="save-outline" size={16} color="#1A2840" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#1A2840', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                    {t('beneficiary.edit.btn_save_now', 'Save Beneficiary Now')}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: 4, paddingVertical: 12 }}
                onPress={() => {
                  setShowNoWalletModal(false);
                  setCurrentStep(2);
                }}
              >
                <Text style={{ color: '#64748B', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>{t('common.cancel', 'Cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Duplicate / Multiple Accounts Modal */}
        <Modal visible={showDuplicateModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('beneficiary.form.multipleAccountsFound', 'Select an account')}</Text>
                <TouchableOpacity onPress={() => setShowDuplicateModal(false)}>
                  <Ionicons name="close" size={24} color="#1A2840" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={duplicateAccounts}
                keyExtractor={(item, idx) => item.id || `account_${idx}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectDuplicate(item)}
                  >
                    <View>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#1A2840' }}>{item.email || t('beneficiary.form.userWithoutEmail', 'User without email')}</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>EVM: {item.evm_address ? `${item.evm_address.substring(0,6)}...${item.evm_address.slice(-4)}` : 'N/A'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1A2840' },

  /* Step Indicator */
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  stepTabActive: {
    opacity: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepCircleActive: {
    backgroundColor: '#FFC759',
  },
  stepCircleText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#64748B',
  },
  stepCircleTextActive: {
    color: '#20365B',
  },
  stepTabText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#94A3B8',
    flexShrink: 1,
  },
  stepTabTextActive: {
    color: '#20365B',
    fontFamily: 'Inter_700Bold',
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepConnectorActive: {
    backgroundColor: '#FFC759',
  },

  scrollContent: { padding: 20, paddingBottom: 60 },
  section: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  sectionOptionalTag: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
    marginBottom: 8,
    marginTop: 6,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  avatarChoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarChoiceSelected: {
    borderColor: '#0052FF',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  syncedAvatarPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  syncedAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  syncedAvatarInfo: {
    marginLeft: 12,
    flex: 1,
  },
  syncedAvatarBadge: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#1D4ED8',
  },
  resetAvatarText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  syncButton: {
    width: 50,
    height: 56,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 15,
  },

  /* Step 2: Cards */
  inviteCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F7FF',
    borderColor: 'rgba(32, 54, 91, 0.12)',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    shadowColor: '#20365B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inviteIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 54, 91, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  inviteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inviteTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#20365B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 199, 89, 0.3)',
  },
  optionalBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#20365B',
    textTransform: 'uppercase',
  },
  inviteDesc: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  inviteFooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(32, 54, 91, 0.06)',
  },
  inviteFooterText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#059669',
    flex: 1,
    lineHeight: 15,
  },

  syncedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  syncedCardText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#065F46',
    flex: 1,
  },

  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stepFooterSingle: {
    width: '100%',
  },
  stepFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  backStepText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#20365B',
  },

  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
    marginBottom: 15,
  },
  pickerButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
    flex: 1,
  },
  pickerButtonPlaceholder: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 17, 40, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalItemText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#1A2840',
  },
  citySearchInput: {
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
  },
  modalItemCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginTop: 10,
  },
  modalItemTextCustom: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#0052FF',
  }
});
