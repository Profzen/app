import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppSelect from '../components/AppSelect';
import AppToast from '../components/AppToast';
import BottomNavBar from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';
import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const BLOCKCHAINS = [
  { value: 'Polygon', label: 'Polygon', name: 'Polygon Network', iconName: 'cube-outline', color: '#FFFFFF', bg: '#8247E5' },
  { value: 'Ethereum', label: 'Ethereum', name: 'Ethereum Mainnet', iconName: 'logo-ethereum', color: '#FFFFFF', bg: '#627EEA' },
  { value: 'Solana', label: 'Solana', name: 'Solana Network', iconName: 'flash-outline', color: '#FFFFFF', bg: '#14F195' },
  { value: 'BNB Chain', label: 'BNB Chain', name: 'BNB Smart Chain', iconName: 'layers-outline', color: '#FFFFFF', bg: '#F3BA2F' },
  { value: 'Bitcoin', label: 'Bitcoin', name: 'Bitcoin Network', iconName: 'logo-bitcoin', color: '#FFFFFF', bg: '#F7931A' },
];

const CRYPTO_TOKENS = [
  { value: 'USDC', label: 'USDC', name: 'USD Coin', iconName: 'logo-usd', color: '#FFFFFF', bg: '#2775CA', subtitle: 'USD Coin (Stablecoin)' },
  { value: 'USDT', label: 'USDT', name: 'Tether USD', iconName: 'cash-outline', color: '#FFFFFF', bg: '#26A17B', subtitle: 'Tether USD (Stablecoin)' },
  { value: 'DIZ', label: 'DIZ', name: 'DizzitUp Token', iconName: 'paper-plane-outline', color: '#0F172A', bg: '#FFC759', subtitle: 'DizzitUp Utility Token' },
  { value: 'ETH', label: 'ETH', name: 'Ethereum', iconName: 'logo-ethereum', color: '#FFFFFF', bg: '#627EEA', subtitle: 'Ethereum Native Token' },
  { value: 'BTC', label: 'BTC', name: 'Bitcoin', iconName: 'logo-bitcoin', color: '#FFFFFF', bg: '#F7931A', subtitle: 'Bitcoin Native Token' },
];



export default function SendMoneyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { session, user, t } = useApp();
  const [apiRecipients, setApiRecipients] = useState([]);
  const [savedBeneficiaries, setSavedBeneficiaries] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const [blockchain, setBlockchain] = useState('Polygon');
  const [token, setToken] = useState('USDC');
  
  // Recipient selection states
  const initialRecipientName = route.params?.recipient || '';
  
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isSearchingRecipient, setIsSearchingRecipient] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [amount, setAmount] = useState('1');
  const [toast, setToast] = useState(null);

  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setSearchQuery(text);
        setToast({ title: 'Presse-papier collé', message: `Texte collé : ${text.substring(0, 20)}...` });
      } else {
        setToast({ title: 'Presse-papier vide', message: 'Aucun texte copié dans le presse-papier.' });
      }
    } catch (e) {
      setToast({ title: 'Presse-papier', message: 'Impossible de lire le presse-papier.' });
    }
  };

  // Fetch saved beneficiaries from Supabase
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase.from('beneficiaries').select('*').eq('user_id', session.user.id);
        if (data) {
          const formatted = data.map(b => ({
            id: b.id,
            name: `${b.first_name || ''} ${b.last_name || ''}`.trim(),
            tag: b.relation || 'BENEFICIARY',
            address: b.evm_address || b.solana_address || b.phone || b.email,
            evm_address: b.evm_address,
            solana_address: b.solana_address,
            avatar_url: b.avatar_url
          }));
          
          const combined = [];
          if (user?.role === 'merchant') {
            combined.push({ id: 'self', name: 'My Account', tag: 'SELF', address: user?.walletAddress || 'My Account' });
          }
          setSavedBeneficiaries([...combined, ...formatted]);
          
          if (initialRecipientName) {
            const initialMatch = [...combined, ...formatted].find(r => r.name.toLowerCase() === initialRecipientName.toLowerCase());
            if (initialMatch) setSelectedRecipient(initialMatch);
          }
        }
      } catch (err) {
        console.error('Error fetching beneficiaries:', err);
      }
    };
    fetchBeneficiaries();
  }, [session, user?.role, user?.walletAddress, initialRecipientName]);

  useEffect(() => {
    const fetchApiRecipients = async () => {
      if (searchQuery.length > 5 && !isNaN(searchQuery.replace(/[^0-9]/g, ''))) {
        setIsSearchingApi(true);
        try {
          let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
          if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
          
          const res = await fetch(`${DIZZY_URL}/wallet/lookup-by-phone?phone=${encodeURIComponent(searchQuery)}`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          });
          const data = await res.json();
          if (res.ok && data.matches) {
            setApiRecipients(data.matches.map(m => ({
              id: m.id,
              name: m.name,
              tag: 'DizzitUp',
              address: m.phone || m.evm_address || 'Utilisateur',
              evm_address: m.evm_address,
              solana_address: m.solana_address
            })));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearchingApi(false);
        }
      } else {
        setApiRecipients([]);
      }
    };
    const timeout = setTimeout(fetchApiRecipients, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, session]);

  const filteredRecipients = [...apiRecipients, ...savedBeneficiaries].filter(r => {
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.address && r.address.toLowerCase().includes(q)) || (r.tag && r.tag.toLowerCase().includes(q));
  });

  const handleSelectRecipient = (item) => {
    setSelectedRecipient(item);
    setIsSearchingRecipient(false);
    setIsDropdownVisible(false);
    setSearchQuery('');
  };

  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setToast({ title: t('wallet.invalid_amount', 'Montant invalide'), message: t('common.wallet.amount_greater_zero', 'Veuillez saisir un montant supérieur à 0.') });
      return;
    }
    
    let toAddress = selectedRecipient ? (selectedRecipient.evm_address || selectedRecipient.solana_address || selectedRecipient.address) : searchQuery;
    if (toAddress === 'My Account') {
      toAddress = user?.walletAddress;
      if (!toAddress) {
        setToast({ title: 'Erreur', message: 'Adresse du compte introuvable.' });
        return;
      }
    }
    if (!toAddress || toAddress.includes('...')) {
      setToast({ title: t('wallet.invalid_address', 'Adresse invalide'), message: t('wallet.invalid_address_message', 'Veuillez sélectionner un destinataire valide.') });
      return;
    }

    setIsSending(true);
    try {
      let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
      if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
      
      const payload = {
        toAddress,
        amount: parseFloat(amount),
        token,
        chain: blockchain,
        metadata: { recipientName: selectedRecipient ? selectedRecipient.name : searchQuery }
      };

      const res = await fetch(`${DIZZY_URL}/wallet/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      navigation.navigate('SendMoneySuccessScreen', {
        amount,
        token,
        recipient: selectedRecipient ? selectedRecipient.name : searchQuery,
        hash: data.txHash || data.transaction?.id || 'Transaction validée',
      });
    } catch (e) {
      setToast({ title: 'Erreur', message: e.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t('pos.send_funds_title', 'Envoyer des fonds')}</Text>
            <View style={styles.secureTagRow}>
              <View style={styles.greenDot} />
              <Text style={styles.secureTagText}>{t('pos.secure_caps', 'SÉCURISÉ')}</Text>
            </View>
          </View>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={18} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Main White Form Card */}
          <View style={styles.formCard}>
            
            <View style={styles.alertBanner}>
              <Ionicons name="information-circle-outline" size={18} color="#15803D" style={{ marginRight: 8 }} />
              <Text style={styles.alertBannerText}>
                Destinataire défini : {selectedRecipient ? selectedRecipient.name : (searchQuery || 'Aucun')}
              </Text>
            </View>

            {/* Section 1: CHOISIR LA BLOCKCHAIN */}
            <Text style={styles.fieldLabel}>{t('pos.select_blockchain', 'CHOISIR LA BLOCKCHAIN')}</Text>
            <View style={styles.selectBoxRow}>
              <View style={[styles.tokenIconBadge, { backgroundColor: '#8247E5' }]}>
                <Ionicons name="cube-outline" size={16} color="#FFFFFF" />
              </View>
              <AppSelect
                value={blockchain}
                options={BLOCKCHAINS}
                onChange={(val) => setBlockchain(val)}
                title={t('common.wallet.select_chain', 'Sélectionner la Blockchain')}
                style={styles.appSelectFlex}
                textStyle={styles.selectTextBold}
              />
            </View>

            {/* Section 2: Jeton */}
            <Text style={styles.fieldLabel}>{t('pos.token_caps', 'JETON')}</Text>
            <View style={styles.selectBoxRow}>
              <View style={[styles.tokenIconBadge, { backgroundColor: '#2775CA' }]}>
                <Ionicons name="logo-usd" size={16} color="#FFFFFF" />
              </View>
              <AppSelect
                value={token}
                options={CRYPTO_TOKENS}
                onChange={(val) => setToken(val)}
                title={t('pos.choose_currency', 'Sélectionner un jeton crypto')}
                style={styles.appSelectFlex}
                textStyle={styles.selectTextBold}
              />
            </View>

            {/* Section 3: Adresse du destinataire (Search & Dropdown vs Picked Card) */}
            <Text style={styles.fieldLabel}>{t('pos.recipient_address_caps', 'ADRESSE DU DESTINATAIRE')}</Text>

            {(!selectedRecipient || isSearchingRecipient) ? (
              <View style={styles.searchSectionWrapper}>
                {/* Search Input Box with PASTE and QR Code buttons */}
                <View style={styles.searchInputBox}>
                  <Ionicons name="search-outline" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInputField}
                    placeholder={t('common.wallet.search_beneficiary', 'Rechercher par nom ou téléphone...')}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsDropdownVisible(true)}
                    onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                  />

                  {/* PASTE Button */}
                  <TouchableOpacity style={styles.pasteButton} onPress={handlePasteClipboard} activeOpacity={0.8}>
                    <Text style={styles.pasteButtonText}>PASTE</Text>
                  </TouchableOpacity>

                  {/* QR Code Icon Button */}
                  <TouchableOpacity style={styles.qrCodeButton} onPress={() => setToast({ title: t('common.wallet.scan_to_pay', 'Scanner QR Code'), message: 'Ouverture de l\'appareil photo...' })} activeOpacity={0.8}>
                    <Ionicons name="qr-code-outline" size={18} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                {/* Recipient Dropdown List Box */}
                {isDropdownVisible && (
                  <View style={styles.dropdownListBox}>
                    <View style={{ paddingVertical: 8 }}>
                      {isSearchingApi && <ActivityIndicator color="#0F172A" style={{ marginVertical: 10 }} />}
                    
                    {/* Item 0: Ajouter un bénéficiaire permanent */}
                    <TouchableOpacity 
                      style={styles.addPermanentItem}
                      onPress={() => navigation.navigate('ContactsManageScreen')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.addPermanentIconBox}>
                        <Ionicons name="person-add-outline" size={18} color="#D97706" />
                      </View>
                      <View style={styles.recipientTextWrap}>
                        <Text style={styles.addPermanentTitle}>{t('common.wallet.add_new_beneficiary', 'Ajouter un bénéficiaire permanent')}</Text>
                        <Text style={styles.addPermanentSubtitle}>Add to permanent records</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Recipient List Items */}
                    {filteredRecipients.map((item) => (
                      <TouchableOpacity 
                        key={item.id}
                        style={styles.dropdownItemRow}
                        onPress={() => handleSelectRecipient(item)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.dropdownAvatarCircle}>
                          <Ionicons name="person-outline" size={18} color="#94A3B8" />
                        </View>
                        <View style={styles.recipientTextWrap}>
                          <Text style={styles.dropdownRecipientName}>{item.name}</Text>
                          <View style={styles.tagAddressRow}>
                            <View style={styles.tagBadge}>
                              <Text style={styles.tagBadgeText}>{item.tag}</Text>
                            </View>
                            <Text style={styles.dropdownAddressText} numberOfLines={1} ellipsizeMode="middle">
                              {item.address}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                )}
              </View>
            ) : (
              /* Selected Recipient Card with Clear (x) Button */
              <View style={styles.recipientCard}>
                <View style={styles.userAvatarCircle}>
                  <Ionicons name="person-outline" size={18} color="#2563EB" />
                </View>
                
                <View style={styles.recipientInfoWrap}>
                  <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
                  <Text style={styles.recipientAddress} numberOfLines={1} ellipsizeMode="middle">
                    {selectedRecipient.address}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.clearRecipientBtn}
                  onPress={() => {
                    setIsSearchingRecipient(true);
                    setIsDropdownVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}

            {/* Section 4: Montant & Solde disponible */}
            <View style={styles.amountHeaderRow}>
              <Text style={styles.fieldLabelNoMargin}>{t('common.wallet.amount', 'Montant')}</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>{t('common.wallet.available', 'Disponible')}: 1.0000 {token}</Text>
              </View>
            </View>

            <View style={styles.amountInputRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.amountTokenSuffix}>{token}</Text>
            </View>

            {/* Main CTA Button */}
            <TouchableOpacity style={styles.sendCtaBtn} onPress={handleSend} activeOpacity={0.88} disabled={isSending}>
              {isSending ? <ActivityIndicator color="#FFFFFF" /> : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.sendCtaText}>{t('pos.send_token', 'Envoyer')} {token}</Text>
                </>
              )}
            </TouchableOpacity>

          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, position: 'relative' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 70, zIndex: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#0F172A' },
  secureTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  secureTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', letterSpacing: 0.5 },
  headerRightIcons: { flexDirection: 'row' },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', padding: 18, boxShadow: '0px 4px 10px #0F172A' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7', borderRadius: 14, padding: 12, marginBottom: 20 },
  alertBannerText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#15803D' },
  fieldLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#64748B', letterSpacing: 0.5, marginBottom: 8, marginTop: 12, textTransform: 'uppercase' },
  fieldLabelNoMargin: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#64748B' },
  selectBoxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  tokenIconBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  appSelectFlex: { flex: 1, borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' },
  selectTextBold: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#0F172A' },
  
  /* Recipient Search Section (Exact Mockup Match) */
  searchSectionWrapper: { marginBottom: 20 },
  searchInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#0F172A', borderRadius: 16, paddingHorizontal: 12, height: 50, marginBottom: 10 },
  searchInputField: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#0F172A' },
  pasteButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  pasteButtonText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#475569', letterSpacing: 0.5 },
  qrCodeButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  dropdownListBox: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, overflow: 'hidden', boxShadow: '0px 2px 6px #000' },
  addPermanentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF5', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  addPermanentIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addPermanentTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#0F172A', marginBottom: 2 },
  addPermanentSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8' },
  dropdownItemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dropdownAvatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recipientTextWrap: { flex: 1 },
  dropdownRecipientName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#0F172A', marginBottom: 2 },
  tagAddressRow: { flexDirection: 'row', alignItems: 'center' },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  tagBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#475569' },
  dropdownAddressText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8' },

  /* Selected Recipient Card */
  recipientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 12, marginBottom: 20 },
  userAvatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recipientInfoWrap: { flex: 1 },
  recipientName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#0F172A', marginBottom: 2 },
  recipientAddress: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748B' },
  clearRecipientBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  
  /* Amount Section */
  amountHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  availableBadge: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  availableBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#D97706' },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 54, marginBottom: 24 },
  amountInput: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#0F172A', outlineStyle: 'none' },
  amountTokenSuffix: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#64748B' },
  sendCtaBtn: { backgroundColor: '#071D54', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 14, boxShadow: '0px 4px 8px #071D54' },
  sendCtaText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF' },
});
