import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, ActivityIndicator, Modal, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DizzitInput } from '../components/DizzitInput';
import { DizzitButton } from '../components/DizzitButton';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import contactService from '../services/contactService';
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
  const { session, t } = useApp();
  
  const isEditing = route.params?.isEditing || false;
  const beneficiary = route.params?.beneficiary || {};

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

  const [countries, setCountries] = useState([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
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

  const lookupWalletByPhone = async () => {
    if (!formData.phone) {
      AppToast.showError(t('beneficiary.edit.sync_req_phone', "Please enter a phone number first"));
      return;
    }

    setIsSyncing(true);
    try {
      const token = session?.access_token;
      const phoneToSend = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone.replace(/^0+/, '')}`;
      const rawWalletApi = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'https://wallet.dizzitup.com/api';
      const walletBase = rawWalletApi.replace(/\/wallet\/?$/, '').replace(/\/api\/?$/, '') + '/api/wallet';

      const res = await fetch(`${walletBase}/lookup-by-phone?phone=${encodeURIComponent(phoneToSend)}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      if (res.ok) {
        const result = await res.json();
        const accounts = result.success ? result.matches : [];
        if (accounts.length > 1) {
          setDuplicateAccounts(accounts);
          setShowDuplicateModal(true);
          setIsSyncing(false);
          return;
        } else if (accounts.length === 1) {
          const account = accounts[0];
          setFormData(prev => ({
            ...prev,
            email: account.email || prev.email,
            evm_address: account.evm_address || prev.evm_address,
            solana_address: account.solana_address || prev.solana_address,
          }));
          AppToast.showSuccess(t('beneficiary.edit.sync_success', "Wallets successfully synced"));
          setIsSyncing(false);
          return;
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
        AppToast.showSuccess(t('beneficiary.edit.sync_success', "Wallets successfully synced"));
      } else {
        AppToast.showInfo(t('beneficiary.edit.sync_not_found_info', "No DizzitUp account found yet. You can continue saving; wallets are optional."));
      }
    } catch (err) {
      console.error(err);
      AppToast.showError(t('beneficiary.edit.sync_error', "Sync error"));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectDuplicate = (account) => {
    setFormData(prev => ({
      ...prev,
      email: account.email || prev.email,
      evm_address: account.evm_address || prev.evm_address,
      solana_address: account.solana_address || prev.solana_address,
    }));
    setShowDuplicateModal(false);
    AppToast.showSuccess(t('beneficiary.edit.sync_success', "Wallets successfully synced"));
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
    
    // Clean up spaces before validation
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
      const payload = {
        first_name: fName,
        last_name: lName,
        full_name: `${fName} ${lName}`.trim(),
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

      const userId = session?.user?.id;
      if (isEditing && beneficiary?.id) {
        const updateRes = await contactService.updateBeneficiary(beneficiary.id, payload);
        if (!updateRes.success) throw new Error(updateRes.error);
        AppToast.showSuccess(t('beneficiary.edit.save_success_edit', "Beneficiary updated"));
      } else {
        const addRes = await contactService.addBeneficiary(userId, payload);
        if (!addRes.success) throw new Error(addRes.error);
        AppToast.showSuccess(t('beneficiary.edit.save_success_add', "Beneficiary added"));
      }
      navigation.goBack();
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

  const filteredCities = citySearch 
    ? cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())) 
    : cities;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? t('beneficiary.edit.edit_title_update', 'Edit') : t('beneficiary.edit.edit_title_new', 'New Beneficiary')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('beneficiary.edit.personal_info', 'Personal Information')}</Text>

            <Text style={styles.label}>{t('beneficiary.edit.avatar', 'Avatar')}</Text>
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
              label={t('beneficiary.edit.first_name', 'First Name')}
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
              label={t('beneficiary.edit.email', 'Email')}
              placeholder={t('beneficiary.edit.email_placeholder', 'Ex: email@example.com')}
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
            />

            <View style={styles.flexRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.label}>{t('beneficiary.edit.country', 'Country')}</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCountryPicker(true)}>
                  <Text style={formData.country ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.country ? `${getCountryFlag(formData.country)} ${formData.country}` : 'Ex: Togo'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, paddingLeft: 8 }}>
                <Text style={styles.label}>{t('beneficiary.edit.city', 'City')}</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => { setCitySearch(''); setShowCityPicker(true); }}>
                  <Text style={formData.city ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.city || 'Ex: Lomé'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Finances */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('beneficiary.edit.banks_wallets', 'Banks & Wallets')}</Text>

            <DizzitInput
              label={t('beneficiary.edit.bank_name', 'Bank Name')}
              placeholder={t('beneficiary.edit.bank_name_placeholder', 'Ex: Ecobank')}
              value={formData.bank_name}
              onChangeText={(text) => handleInputChange('bank_name', text)}
            />
            <DizzitInput
              label={t('beneficiary.edit.bank_account', 'Account Number / IBAN')}
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

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <DizzitButton
            title={t('beneficiary.edit.btn_save', 'Save')}
            onPress={handleSave}
            loading={isSaving}
          />
        </View>

        {/* Modals */}
        
        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('beneficiary.edit.country', 'Country')}</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Ionicons name="close" size={24} color="#1A2840" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={countries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.modalItem}
                    onPress={() => {
                      handleInputChange('country', item.name);
                      handleInputChange('country_code', item.code);
                      handleInputChange('city', ''); // Reset city
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{getUniversalFlag(item.flag_emoji, item.code)} {item.name}</Text>
                    {(formData.country === item.name || formData.country_code === item.code) && <Ionicons name="checkmark" size={20} color="#0052FF" />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* City Picker Modal */}
        <Modal visible={showCityPicker} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('beneficiary.edit.city', 'City')}</Text>
                <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                  <Ionicons name="close" size={24} color="#1A2840" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.citySearchInput}
                placeholder={t('beneficiary.form.searchCity', "Search or add a city...")}
                value={citySearch}
                onChangeText={setCitySearch}
                autoFocus
              />

              <FlatList
                data={filteredCities}
                keyExtractor={(item, index) => `${item}_${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.modalItem}
                    onPress={() => {
                      handleInputChange('city', item);
                      setShowCityPicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                    {formData.city === item && <Ionicons name="checkmark" size={20} color="#0052FF" />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <TouchableOpacity 
                    style={styles.modalItemCustom}
                    onPress={() => {
                      handleInputChange('city', citySearch);
                      setShowCityPicker(false);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#0052FF" style={{marginRight: 8}} />
                    <Text style={styles.modalItemTextCustom}>{t('beneficiary.form.addCity', 'Add')} "{citySearch}"</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Duplicate Sync Modal */}
        <Modal visible={showDuplicateModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('beneficiary.form.multipleWallets', 'Multiple Wallets Found')}</Text>
                <TouchableOpacity onPress={() => setShowDuplicateModal(false)}>
                  <Ionicons name="close" size={24} color="#1A2840" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>
                {t('beneficiary.form.chooseWallet', 'Multiple accounts match this number. Please choose which one to sync:')}
              </Text>
              <FlatList
                data={duplicateAccounts}
                keyExtractor={(item, index) => item.evm_address || String(index)}
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1A2840' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  section: {
    marginBottom: 30,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
    marginBottom: 10,
    marginTop: 10,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  avatarChoice: {
    width: 45,
    height: 45,
    borderRadius: 25,
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
    fontSize: 24,
  },
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  chip: {
    paddingHorizontal: 16,
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
  },
  chipTextSelected: {
    color: '#FFF',
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
    marginBottom: 15, // matches DizzitInput's margin
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
    marginBottom: 15,
  },
  pickerButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
  },
  pickerButtonPlaceholder: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#94A3B8',
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
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#0052FF',
  }
});
