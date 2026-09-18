import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  StatusBar, 
  ActivityIndicator, 
  Modal, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SelectableContactItem from '../components/SelectableContactItem';
import AppToast from '../components/AppToast';
import { shareInviteLink, shareShopLink } from '../utils/shareHelper';
import { useApp } from '../context/AppContext';
import contactService from '../services/contactService';
import { getFullCountryName } from '../utils/countryCurrencyUtils';
import { ALL_COUNTRIES } from '../utils/countriesData';

const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

const formatRelation = (rel, t) => {
  if (!rel) return t('beneficiary_management.relations.friend', 'Friend');
  const cleanKey = String(rel).toLowerCase().trim().replace(/[\s-]+/g, '_');
  const formattedFallback = rel.charAt(0).toUpperCase() + rel.slice(1).replace(/_/g, ' ');
  return t(`beneficiary_management.relations.${cleanKey}`, formattedFallback);
};

export default function PayBillsScreen() {
  const navigation = useNavigation();
  const { t, session } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromo, setShowPromo] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [toast, setToast] = useState(null);

  // Direct Phone Number Entry & One-Time Payment State (Global 250+ Countries)
  const [showDirectPayModal, setShowDirectPayModal] = useState(false);
  const [directName, setDirectName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    ALL_COUNTRIES.find(c => c.code === 'TG') || ALL_COUNTRIES.find(c => c.code === 'NG') || ALL_COUNTRIES[0]
  );
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [savingDirect, setSavingDirect] = useState(false);

  // Filter 250+ countries in real time
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return ALL_COUNTRIES;
    const q = countrySearchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) || 
      c.dial.includes(q)
    );
  }, [countrySearchQuery]);

  // Fetch real beneficiaries from Supabase (production data)
  useEffect(() => {
    let isMounted = true;
    const fetchBeneficiaries = async () => {
      setLoading(true);
      try {
        if (session?.user?.id) {
          const { success, data } = await contactService.getBeneficiaries(session.user.id);
          if (isMounted) {
            if (success && Array.isArray(data) && data.length > 0) {
              const formatted = data.map(b => {
                const cCode = (b.country_code || b.country || '').trim().toUpperCase();
                const cName = getFullCountryName(b.country_name || b.country || cCode);

                return {
                  id: String(b.id),
                  name: b.full_name || `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Beneficiary',
                  first_name: b.first_name || '',
                  last_name: b.last_name || '',
                  relation: formatRelation(b.relationship, t),
                  country: cName,
                  country_code: cCode || 'NG',
                  phone: b.phone || b.phone_number || '',
                  email: b.email || '',
                  flag: getFlagEmoji(cCode),
                  avatar: b.avatar_url || b.avatar || null,
                  statusColor: '#10B981',
                  raw: b,
                };
              });
              setBeneficiaries(formatted);
              setSelectedContactId(formatted[0].id);
            } else {
              setBeneficiaries([]);
            }
          }
        } else if (isMounted) {
          setBeneficiaries([]);
        }
      } catch (err) {
        console.warn('Error loading beneficiaries in PayBillsScreen:', err?.message);
        if (isMounted) setBeneficiaries([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBeneficiaries();
    return () => { isMounted = false; };
  }, [session?.user?.id]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return beneficiaries.filter(contact => {
      if (!q) return true;
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.relation.toLowerCase().includes(q) ||
        contact.country.toLowerCase().includes(q) ||
        contact.phone.toLowerCase().includes(q)
      );
    });
  }, [beneficiaries, searchQuery]);

  const handleDirectPaySubmit = async () => {
    const cleanDigits = directPhone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 5) {
      setToast({
        title: t('common.error', 'Error'),
        message: t('payBills.phoneRequired', 'Please enter a valid phone number.'),
      });
      return;
    }

    const fullPhone = `${selectedCountry.dial} ${cleanDigits}`;
    const contactName = directName.trim() || fullPhone;

    const directBeneficiary = {
      id: `direct_${Date.now()}`,
      name: contactName,
      first_name: directName.trim() ? directName.trim().split(' ')[0] : '',
      last_name: directName.trim() ? directName.trim().split(' ').slice(1).join(' ') : '',
      relation: t('beneficiary_management.relations.friend', 'Friend'),
      country: selectedCountry.name,
      country_code: selectedCountry.code,
      phone: fullPhone,
      flag: selectedCountry.flag,
      avatar: null,
      isDirectOneTime: true,
    };

    // If user chose to save to beneficiaries
    if (saveBeneficiary && session?.user?.id) {
      try {
        setSavingDirect(true);
        await contactService.addBeneficiary(session.user.id, {
          first_name: directBeneficiary.first_name || contactName,
          last_name: directBeneficiary.last_name || '',
          relationship: 'friend',
          country_code: selectedCountry.code,
          phone: fullPhone,
        });
        setBeneficiaries(prev => [directBeneficiary, ...prev]);
      } catch (saveErr) {
        console.warn('Failed to auto-save direct beneficiary:', saveErr);
      } finally {
        setSavingDirect(false);
      }
    }

    setShowDirectPayModal(false);
    setSearchQuery('');

    navigation.navigate('ChooseServiceScreen', {
      beneficiary: directBeneficiary,
    });
  };

  const handleContinue = () => {
    if (!selectedContactId || beneficiaries.length === 0) return;
    const selectedContact = beneficiaries.find(c => c.id === selectedContactId) || beneficiaries[0];

    navigation.navigate('ChooseServiceScreen', {
      beneficiary: {
        id: selectedContact.id,
        name: selectedContact.name,
        country: selectedContact.country,
        country_code: selectedContact.country_code,
        flag: selectedContact.flag,
        avatar: selectedContact.avatar,
        phone: selectedContact.phone,
        first_name: selectedContact.first_name || selectedContact.name.split(' ')[0],
        last_name: selectedContact.last_name || selectedContact.name.split(' ').slice(1).join(' '),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Top Bar */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>{t('payBills.title', 'Pay Bills & Essentials')}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            {t('payBills.subtitle', 'Send essential products and pay bills for your loved ones.')}
          </Text>
        </View>

        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('payBills.searchOrTypePhone', 'Search contact or enter phone number...')}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Pay Banner (If digits typed in search) */}
          {searchQuery.trim().length >= 3 && /\d/.test(searchQuery) && (
            <TouchableOpacity
              style={styles.searchNumberBanner}
              onPress={() => {
                setDirectPhone(searchQuery.trim());
                setShowDirectPayModal(true);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.searchNumberIconCircle}>
                <Ionicons name="flash" size={16} color="#071D54" />
              </View>
              <Text style={styles.searchNumberText}>
                {t('payBills.payDirectTo', 'Pay directly to')} <Text style={{ fontFamily: 'Inter_700Bold' }}>{searchQuery.trim()}</Text>
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#071D54" />
            </TouchableOpacity>
          )}

          {/* Inline Direct Phone Payment Box - Always Visible & Interactive */}
          <View style={styles.inlinePhoneCard}>
            <View style={styles.inlinePhoneHeader}>
              <View style={styles.directPayIconCircle}>
                <Ionicons name="keypad" size={18} color="#071D54" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.inlinePhoneTitle}>
                    {t('payBills.directNumberTitle', 'Direct Phone Number Payment')}
                  </Text>
                  <View style={styles.directPayBadge}>
                    <Text style={styles.directPayBadgeText}>
                      {t('payBills.badgeOneTap', '1-TAP')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.inlinePhoneSubtitle}>
                  {t('payBills.directNumberSubtitle', 'Pay directly to any number without pre-saving')}
                </Text>
              </View>
            </View>

            <View style={styles.inlinePhoneInputRow}>
              <TouchableOpacity
                style={styles.inlineCountrySelector}
                onPress={() => setShowCountryPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 16 }}>{selectedCountry.flag}</Text>
                <Text style={styles.inlineCountryDial}>{selectedCountry.dial}</Text>
                <Ionicons name="chevron-down" size={13} color="#64748B" />
              </TouchableOpacity>

              <TextInput
                style={styles.inlinePhoneInput}
                placeholder={t('payBills.phonePlaceholder', 'Phone number (e.g. 80 1234 5678)')}
                placeholderTextColor="#94A3B8"
                value={directPhone}
                onChangeText={setDirectPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={[
                  styles.inlinePayBtn,
                  !directPhone.trim() && { opacity: 0.5 }
                ]}
                onPress={handleDirectPaySubmit}
                disabled={savingDirect || !directPhone.trim()}
                activeOpacity={0.85}
              >
                {savingDirect ? (
                  <ActivityIndicator size="small" color="#071D54" />
                ) : (
                  <Ionicons name="arrow-forward" size={18} color="#071D54" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions (4-column Grid) */}
          <Text style={styles.sectionTitle}>{t('payBills.quickActionsTitle', 'Quick Actions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ContactsManageScreen')}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#FFF7E6' }]}>
                <Ionicons name="person-add-outline" size={18} color="#D97706" />
              </View>
              <Text style={styles.quickActionTitle}>{t('contacts.add_beneficiary', 'Add beneficiary')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ContactsScreen')}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="people-outline" size={18} color="#10B981" />
              </View>
              <Text style={styles.quickActionTitle}>{t('payBills.myBeneficiaries', 'My beneficiaries')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => shareInviteLink()}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="paper-plane-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionTitle}>{t('home.btnInviteNow', 'Invite now')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ShopsScreen')}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="storefront-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionTitle}>{t('home.btnReferNow', 'Refer a store')}</Text>
            </TouchableOpacity>
          </View>

          {/* Beneficiaries Section */}
          <View style={styles.beneficiariesSectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('payBills.myBeneficiaries', 'My Beneficiaries')}
              {beneficiaries.length > 0 ? ` (${beneficiaries.length})` : ''}
            </Text>
          </View>

          {/* Sub-tabs / Filters Row */}
          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
              onPress={() => setActiveFilter('all')}
            >
              <Ionicons name="globe-outline" size={13} color={activeFilter === 'all' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
                {t('payBills.allContacts', 'All Contacts')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contacts List */}
          <View style={styles.contactsList}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFC759" style={{ marginVertical: 30 }} />
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>{t('payBills.no_beneficiaries', 'No beneficiaries yet')}</Text>
                <Text style={styles.emptySubtitle}>{t('payBills.add_first_beneficiary_sub', 'Add your first beneficiary to pay their bills.')}</Text>
                <TouchableOpacity style={styles.addFirstBtn} onPress={() => navigation.navigate('ContactsManageScreen')}>
                  <Ionicons name="person-add" size={16} color="#071D54" style={{ marginRight: 6 }} />
                  <Text style={styles.addFirstBtnText}>{t('payBills.add_beneficiary', 'Add a Beneficiary')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredContacts.map((contact) => (
                <SelectableContactItem
                  key={contact.id}
                  avatarUrl={contact.avatar}
                  name={contact.name}
                  relation={contact.relation}
                  countryName={contact.country}
                  countryFlag={contact.flag}
                  statusColor={contact.statusColor}
                  isSelected={selectedContactId === contact.id}
                  onSelect={() => setSelectedContactId(contact.id)}
                />
              ))
            )}
          </View>

          {/* Promo Floating Banner with Real DizzitUp Brand Logo from Assets */}
          {showPromo && (
            <View style={styles.promoBanner}>
              <TouchableOpacity style={styles.promoClose} onPress={() => setShowPromo(false)} accessibilityLabel="Close">
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.promoContent}>
                <View style={styles.promoLogoBox}>
                  <Image 
                    source={require('../../assets/brand/finalLogo.png')} 
                    style={{ width: 40, height: 40 }} 
                    resizeMode="contain" 
                  />
                </View>
                <View style={styles.promoTextContainer}>
                  <Text style={styles.promoTitle}>
                    {t('home.inviteBannerTitle_1', 'Invite friends and earn')} $5 DZY
                  </Text>
                  <Text style={styles.promoSubtitle}>
                    {t('home.inviteBannerDesc', 'Share your link and earn rewards on their transactions.')}
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>

        {/* Bottom Fixed CTA Button */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity 
            style={[styles.ctaButton, (!selectedContactId || beneficiaries.length === 0) && { opacity: 0.6 }]} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>{t('btnContinue', 'Continue')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.ctaHint}>
            {t('payBills.cta_hint', 'Select a beneficiary or pay directly by number')}
          </Text>
        </View>

        {/* Modal: Direct Phone Number Entry */}
        <Modal
          visible={showDirectPayModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDirectPayModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismissArea} onPress={() => setShowDirectPayModal(false)} />
            <View style={styles.directModalCard}>
              <View style={styles.directModalHeader}>
                <View style={styles.directModalHeaderLeft}>
                  <View style={styles.flashIconCircle}>
                    <Ionicons name="flash" size={18} color="#071D54" />
                  </View>
                  <Text style={styles.directModalTitle}>{t('payBills.quickPayTitle', 'Direct Phone Payment')}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowDirectPayModal(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {/* Country selector */}
                <Text style={styles.modalFieldLabel}>{t('payBills.destCountry', 'RECIPIENT COUNTRY')}</Text>
                <TouchableOpacity
                  style={styles.countrySelectInput}
                  onPress={() => setShowCountryPicker(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.countrySelectLeft}>
                    <Text style={styles.countrySelectFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countrySelectName}>{selectedCountry.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.countrySelectDial}>{selectedCountry.dial}</Text>
                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                  </View>
                </TouchableOpacity>

                {/* Recipient Phone */}
                <Text style={styles.modalFieldLabel}>{t('payBills.recipientPhone', 'RECIPIENT PHONE NUMBER')}</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.dialPrefixBox}>
                    <Text style={styles.dialPrefixText}>{selectedCountry.dial}</Text>
                  </View>
                  <TextInput
                    style={styles.phoneTextInput}
                    placeholder={t('payBills.phonePlaceholder', 'Ex: 90 12 34 56')}
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={directPhone}
                    onChangeText={setDirectPhone}
                  />
                </View>

                {/* Recipient Name (Optional) */}
                <Text style={styles.modalFieldLabel}>{t('payBills.recipientNameOptional', 'RECIPIENT NAME (OPTIONAL)')}</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder={t('payBills.recipientNamePlaceholder', 'Ex: Mama Kemi')}
                  placeholderTextColor="#94A3B8"
                  value={directName}
                  onChangeText={setDirectName}
                />

                {/* Direct Payment Notice Card */}
                <View style={styles.graceNoticeCard}>
                  <Ionicons name="shield-checkmark" size={20} color="#D97706" style={{ marginRight: 10, marginTop: 1 }} />
                  <Text style={styles.graceNoticeText}>
                    {t('payBills.graceNotice', '⚡ Direct Payment: 1 quick payment allowed without saving. For recurring transfers, saving as a beneficiary is recommended.')}
                  </Text>
                </View>

                {/* Save to Beneficiaries Toggle */}
                <TouchableOpacity
                  style={styles.saveToggleRow}
                  onPress={() => setSaveBeneficiary(!saveBeneficiary)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={saveBeneficiary ? "checkbox" : "square-outline"}
                    size={22}
                    color={saveBeneficiary ? "#071D54" : "#94A3B8"}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.saveToggleText}>
                    {t('payBills.saveToggle', 'Save to my beneficiaries for future payments')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleDirectPaySubmit}
                disabled={savingDirect}
                activeOpacity={0.85}
              >
                {savingDirect ? (
                  <ActivityIndicator size="small" color="#071D54" />
                ) : (
                  <>
                    <Text style={styles.modalSubmitBtnText}>{t('payBills.continueToServices', 'Continue to Services')}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#071D54" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal: Country Picker */}
        <Modal
          visible={showCountryPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismissArea} onPress={() => setShowCountryPicker(false)} />
            <View style={styles.countryPickerCard}>
              <View style={styles.directModalHeader}>
                <Text style={styles.directModalTitle}>{t('payBills.selectCountry', 'Select Country (250+)')}</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Real-time Country Search */}
              <View style={styles.countrySearchWrap}>
                <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.countrySearchInput}
                  placeholder={t('payBills.searchCountryPlaceholder', 'Search country or calling code (+228, Togo, etc.)...')}
                  placeholderTextColor="#94A3B8"
                  value={countrySearchQuery}
                  onChangeText={setCountrySearchQuery}
                  autoCapitalize="none"
                />
                {countrySearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setCountrySearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {filteredCountries.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.countryPickRow, selectedCountry.code === c.code && styles.countryPickRowActive]}
                    onPress={() => {
                      setSelectedCountry(c);
                      setShowCountryPicker(false);
                      setCountrySearchQuery('');
                    }}
                  >
                    <Text style={styles.countrySelectFlag}>{c.flag}</Text>
                    <Text style={[styles.countryPickName, selectedCountry.code === c.code && { fontFamily: 'Inter_700Bold' }]}>{c.name}</Text>
                    <Text style={styles.countryPickDial}>{c.dial}</Text>
                    {selectedCountry.code === c.code && (
                      <Ionicons name="checkmark-circle" size={18} color="#071D54" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 10, paddingBottom: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backButton: { padding: 4, marginRight: 4 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 16, marginLeft: 30 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative', backgroundColor: '#FFFFFF' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 8, marginBottom: 12, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#1A2840' },
  searchNumberBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, padding: 12, backgroundColor: '#FFFDF5', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 12 },
  searchNumberIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  searchNumberText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, color: '#071D54' },
  directPayActionCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 18, padding: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16 },
  directPayIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  directPayTextWrap: { flex: 1 },
  directPayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  directPayTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  directPayBadge: { backgroundColor: '#071D54', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  directPayBadgeText: { color: '#FFC759', fontSize: 9, fontFamily: 'Inter_700Bold' },
  directPaySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
  // Inline direct phone card styles
  inlinePhoneCard: { marginHorizontal: 16, marginBottom: 16, padding: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16 },
  inlinePhoneHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  inlinePhoneTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  inlinePhoneSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10.5, color: '#64748B', marginTop: 1 },
  inlinePhoneInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineCountrySelector: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 8, height: 44 },
  inlineCountryDial: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#1A2840' },
  inlinePhoneInput: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, height: 44, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  inlinePayBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', paddingHorizontal: 16, marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, gap: 8 },
  quickActionCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' },
  quickActionIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', textAlign: 'center', lineHeight: 13 },
  beneficiariesSectionHeader: { marginBottom: 2 },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 14, alignItems: 'center', gap: 6 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  filterChipActive: { backgroundColor: '#071D54', borderColor: '#071D54' },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#6B7280' },
  filterTextActive: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  contactsList: { paddingHorizontal: 16, marginBottom: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 20 },
  emptyTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginTop: 10, marginBottom: 4 },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B', textAlign: 'center', marginBottom: 16 },
  addFirstBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC759', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addFirstBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#071D54' },
  promoBanner: { marginHorizontal: 16, backgroundColor: '#F4F8FF', borderWidth: 1, borderColor: '#E5EDFF', borderRadius: 16, padding: 14, position: 'relative', marginTop: 4 },
  promoClose: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
  promoContent: { flexDirection: 'row', alignItems: 'center' },
  promoLogoBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  promoTextContainer: { flex: 1, paddingRight: 20 },
  promoTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  promoSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 14 },
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  ctaButton: { backgroundColor: '#FFC759', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 12, marginBottom: 6 },
  ctaButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginRight: 8 },
  ctaHint: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalDismissArea: { flex: 1 },
  directModalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  directModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  directModalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flashIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center' },
  directModalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  modalCloseBtn: { padding: 4 },
  modalFieldLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#475569', letterSpacing: 0.5, marginBottom: 6, marginTop: 10 },
  countrySelectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, height: 46 },
  countrySelectLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countrySelectFlag: { fontSize: 18 },
  countrySelectName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  countrySelectDial: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B' },
  modalTextInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, height: 46, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A2840' },
  phoneInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dialPrefixBox: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, height: 46, justifyContent: 'center', alignItems: 'center' },
  dialPrefixText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1A2840' },
  phoneTextInput: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, height: 46, fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  graceNoticeCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFDF5', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 12, padding: 12, marginTop: 14 },
  graceNoticeText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 11, color: '#92400E', lineHeight: 16 },
  saveToggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  saveToggleText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, color: '#334155', lineHeight: 17 },
  modalSubmitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 12, marginTop: 12 },
  modalSubmitBtnText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#071D54' },
  countryPickerCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 30 },
  countrySearchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, height: 42, marginBottom: 12 },
  countrySearchInput: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A2840' },
  countryPickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, gap: 10 },
  countryPickRowActive: { backgroundColor: '#FFFDF5' },
  countryPickName: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A2840', flex: 1 },
  countryPickDial: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#64748B' },
});
