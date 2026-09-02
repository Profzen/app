import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, TextInput, Image, Modal, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import Avatar from '../components/Avatar';
import { shareInviteLink, shareShopLink } from '../utils/shareHelper';
import { useApp } from '../context/AppContext';
import contactService from '../services/contactService';
import { CONTACTS_MOCK } from '../mocks/contactsMock';

const quickActions = [
  { id: '1', title: "Payer et\nacheter l'essentiel", subtitle: "Achat de crédit,\ninternet, TV, jeux,\ncrypto et plus", icon: "bag-handle-outline", color: "#8B5CF6" },
  { id: '2', title: "Recharger\nmobile", subtitle: "Achat de crédit\nmobile", icon: "phone-portrait-outline", color: "#10B981" },
  { id: '3', title: "Payer des\nfactures", subtitle: "Électricité, eau,\ninternet et plus", icon: "receipt-outline", color: "#3B82F6" },
  { id: '4', title: "Envoyer /\nDemander\ndes fonds", subtitle: "Transferts d'argent\ninstantanés", icon: "swap-horizontal-outline", color: "#F59E0B" },
  { id: '5', title: "Inviter", subtitle: "Invitez vos amis\net gagnez\n$5 en DZY", icon: "person-add-outline", color: "#8B5CF6" },
];

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

export default function ContactsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { language, t, session } = useApp();
  const [showInvite, setShowInvite] = useState(true);
  const [contactItems, setContactItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'nearby', 'favorites', 'africa', 'world'
  const [searchQuery, setSearchQuery] = useState('');

  const nextScreen = route.params?.nextScreen;
  const actionRoutes = { '1': 'ChooseServiceScreen', '2': 'MobileRechargeScreen', '3': 'ChooseServiceScreen', '4': 'SendMoneyScreen', '5': 'RewardsScreen' };

  const fetchBeneficiaries = async () => {
    if (!session?.user?.id) {
      setContactItems(CONTACTS_MOCK);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { success, data } = await contactService.getBeneficiaries(session.user.id);
    if (success && data && data.length > 0) {
      const formatted = data.map(b => ({
        id: b.id,
        name: b.full_name || `${b.first_name} ${b.last_name || ''}`.trim(),
        relation: b.relationship || t('contacts.relation.friend', 'Ami'),
        location: `${b.city ? b.city + ', ' : ''}${b.country_code || ''}`,
        country: b.country || b.country_name || (b.country_code ? (() => { try { return new Intl.DisplayNames(['en'], {type: 'region'}).of(b.country_code) } catch(e) { return b.country_code } })() : ''),
        country_code: b.country_code,
        city: b.city,
        flag: getFlagEmoji(b.country_code),
        isBeneficiary: true,
        isSponsor: false,
        image: b.avatar_url || null,
        raw_data: b
      }));
      setContactItems(formatted);
    } else {
      setContactItems(CONTACTS_MOCK);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [session?.user?.id]);

  const removeContact = async (id) => {
    const { success, error } = await contactService.deleteBeneficiary(id);
    if (success) {
      setContactItems((items) => items.filter((item) => item.id !== id));
      setToast({ title: t('contacts.deleted', 'Contact supprimé'), message: t('contacts.deleted_desc', 'Le contact a été retiré avec succès.') });
    } else {
      setToast({ title: t('common.error', 'Erreur'), message: error || t('contacts.delete_error', 'Impossible de supprimer ce contact.') });
    }
    setSelectedContact(null);
  };

  const filteredContacts = useMemo(() => {
    return contactItems.filter(contact => {
      const name = (contact.name || '').toLowerCase();
      const loc = (contact.location || '').toLowerCase();
      const country = (contact.country || '').toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || name.includes(q) || loc.includes(q) || country.includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === 'nearby') {
        return contact.isBeneficiary;
      } else if (activeFilter === 'favorites') {
        return contact.isSponsor;
      } else if (activeFilter === 'africa') {
        return ['TG', 'NG', 'KE', 'SN', 'ML', 'BF', 'GH', 'CI', 'BJ', 'CM'].some(code => (contact.country_code || '').toUpperCase() === code);
      }
      return true;
    });
  }, [contactItems, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.mainTitle}>{t('contactsTitle', 'Contacts')}</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
        >
          
          {/* Index 0: Top Non-Sticky Elements */}
          <View>
            <Text style={styles.subtitle}>
              {nextScreen 
                ? t('contacts.select_beneficiary_action', 'Sélectionnez un bénéficiaire pour continuer.')
                : t('contacts.subtitle', "Soutenez vos bénéficiaires : envoyez de l'argent, payez des factures et achetez l'essentiel en Afrique.")}
            </Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('contacts.search', 'Rechercher un contact')}
                  placeholderTextColor="#64748B"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <Text style={styles.searchSubText}>{language === 'fr' ? 'Nom, téléphone, email, ville ou pays' : 'Name, phone, email, city or country'}</Text>
              </View>
            </View>

            {nextScreen ? (
              <View style={styles.activeActionBanner}>
                <View style={styles.activeActionBannerLeft}>
                  <Ionicons name="information-circle" size={24} color="#3B82F6" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.activeActionTitle}>{t('contacts.action_selected_title', 'Sélectionnez un bénéficiaire')}</Text>
                    <Text style={styles.activeActionSub}>{t('contacts.action_selected_sub', 'Appuyez sur un contact ci-dessous pour continuer')}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.cancelActionBtn} onPress={() => navigation.setParams({ nextScreen: undefined })}>
                  <Text style={styles.cancelActionText}>{t('common.cancel', 'Annuler')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>{t('contacts.quick_actions', 'Actions rapides')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
                  {quickActions.map(action => (
                    <TouchableOpacity 
                      key={action.id} 
                      style={styles.quickActionCard} 
                      onPress={() => {
                        if (action.id === '5') {
                          shareInviteLink();
                        } else {
                          navigation.setParams({ nextScreen: actionRoutes[action.id] });
                        }
                      }}
                    >
                      <View style={styles.quickActionIconContainer}>
                        <Ionicons name={action.icon} size={28} color={action.color} />
                      </View>
                      <Text style={styles.quickActionTitle}>{t(`contacts.quick_action_${action.id}.title`, action.title)}</Text>
                      <Text style={styles.quickActionSubtitle}>{t(`contacts.quick_action_${action.id}.subtitle`, action.subtitle)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>

          {/* Index 1: Pinned / Sticky Header (Beneficiaries header, Filters & Column titles) */}
          <View style={styles.stickyHeaderContainer}>
            {/* Mes bénéficiaires */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleSticky}>{t('contacts.my_beneficiaries', 'Mes bénéficiaires')}</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('ContactsManageScreen')}>
                <Text style={styles.showLessText}>{t('contacts.manage_contacts', 'Gérer contacts')}</Text>
                <Ionicons name="arrow-forward" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              <TouchableOpacity 
                style={activeFilter === 'all' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('all')}
              >
                <Ionicons name="apps-outline" size={15} color={activeFilter === 'all' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'all' ? styles.filterChipTextActive : styles.filterChipText}>{t('common.all', 'Tous')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'nearby' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('nearby')}
              >
                <Ionicons name="location-outline" size={15} color={activeFilter === 'nearby' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'nearby' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_nearby', 'À proximité')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'favorites' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('favorites')}
              >
                <Ionicons name="heart-outline" size={15} color={activeFilter === 'favorites' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'favorites' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_favorites', 'De mes pays préférés')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'africa' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('africa')}
              >
                <Ionicons name="earth-outline" size={15} color={activeFilter === 'africa' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'africa' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_africa', "De toute l'Afrique")}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={activeFilter === 'world' ? styles.filterChipActive : styles.filterChip}
                onPress={() => setActiveFilter('world')}
              >
                <Ionicons name="globe-outline" size={15} color={activeFilter === 'world' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={activeFilter === 'world' ? styles.filterChipTextActive : styles.filterChipText}>{t('contacts.filter_world', 'Du reste du monde')}</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Contacts List Header */}
            <View style={styles.listHeaderRow}>
              <Text style={[styles.listHeaderText, { flex: 2 }]}>{t('contacts.col_contact', 'Contact')}</Text>
              <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>{t('contacts.col_beneficiary', 'Bénéficiaire')}</Text>
              <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>{t('contacts.col_sponsor', 'Parrain')}</Text>
              <View style={{ width: 34 }} />
            </View>
          </View>

          {/* Index 2: Contacts List */}
          <View style={styles.contactsList}>
            {filteredContacts.map((contact) => (
              <ContactRow 
                key={contact.id} 
                contact={contact} 
                onPress={() => {
                  if (nextScreen) {
                    navigation.navigate(nextScreen, { beneficiary: contact, contact });
                  } else {
                    setSelectedContact(contact);
                  }
                }}
              />
            ))}
          </View>

        </ScrollView>

        <ContactActionSheet 
          contact={selectedContact}
          visible={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          onNavigate={(routeStr, extraParams = {}) => {
            setSelectedContact(null);
            navigation.navigate(routeStr, { beneficiary: selectedContact, contact: selectedContact, ...extraParams });
          }}
          onDelete={(id) => {
            setSelectedContact(null);
            removeContact(id);
          }}
          onFavorite={(contact) => {
            setSelectedContact(null);
            setToast({ title: t('contacts.added_favorite', 'Ajouté aux favoris'), message: `${contact.name} ${t('contacts.added_favorite_desc', 'a été ajouté à vos favoris.')}` });
          }}
        />

        {/* Invite Banner (Floating) */}
        {showInvite && (
          <View style={styles.inviteBannerWrapper}>
            <View style={styles.inviteBanner}>
              <TouchableOpacity style={styles.closeBannerBtn} onPress={() => setShowInvite(false)}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.inviteBannerLeft}>
                <Text style={styles.inviteBannerTitle}>
                  {t('home.inviteBannerTitle_1', "Invitez vos amis\net gagnez ")}<Text style={{color: '#FFB800'}}>{t('home.inviteBannerTitle_2', "$5 en DZY")}</Text>
                </Text>
                <Text style={styles.inviteBannerText}>
                  {t('home.inviteBannerDesc', "Envoyez de l'argent, achetez, payez des factures et gagnez des récompenses ensemble.")}
                </Text>
                <TouchableOpacity style={styles.inviteBtn} onPress={() => shareInviteLink()}>
                  <Text style={styles.inviteBtnText}>{t('home.btnInviteNow', "Inviter maintenant")}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inviteBannerRight}>
                <View style={styles.mockPhoneIllustration}>
                  <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
                </View>
              </View>
            </View>
          </View>
        )}

        <BottomNavBar activeTab="contacts" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

function ContactRow({ contact, onPress }) {
  const { t } = useApp();

  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.contactInfoCol}>
        <Avatar image={contact.image} name={contact.name} size={46} style={styles.contactAvatarLarge} />
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelation}>{contact.relation}</Text>
          <Text style={styles.contactLocation}>{contact.flag} {contact.location}</Text>
        </View>
      </View>

      <View style={styles.statusCol}>
        <Ionicons name="person-outline" size={18} color={contact.isBeneficiary ? '#10B981' : '#94A3B8'} />
        <Text style={[styles.statusText, { color: contact.isBeneficiary ? '#10B981' : '#94A3B8' }]}>
          {contact.isBeneficiary ? t('beneficiary_management.profile.yes', 'Oui') : t('beneficiary_management.profile.no', 'Non')}
        </Text>
      </View>

      <View style={styles.statusCol}>
        <Ionicons name="person-add-outline" size={18} color={contact.isSponsor ? '#10B981' : '#94A3B8'} />
        <Text style={[styles.statusText, { color: contact.isSponsor ? '#10B981' : '#94A3B8' }]}>
          {contact.isSponsor ? t('beneficiary_management.profile.yes', 'Oui') : t('beneficiary_management.profile.no', 'Non')}
        </Text>
      </View>

      <View style={styles.moreActionBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color="#3B82F6" />
      </View>
    </TouchableOpacity>
  );
}

function ContactActionSheet({ contact, visible, onClose, onNavigate, onDelete, onFavorite }) {
  const { t } = useApp();
  if (!contact) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.sheetDismissArea} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetHeader}>
             <Avatar image={contact.image} name={contact.name} size={64} style={styles.sheetAvatar} />
             <Text style={styles.sheetNameLg}>{contact.name}</Text>
             <Text style={styles.sheetLocationLg}>{contact.flag} {contact.location}</Text>
          </View>

          <View style={styles.sheetActionsGrid}>
            <SheetGridAction icon="arrow-up-outline" label={t('contacts.action_send', 'Envoyer')} color="#10B981" bgColor="#ECFDF5" onPress={() => onNavigate('SendMoneyScreen')} />
            <SheetGridAction icon="cash-outline" label={t('contacts.action_request', 'Demander')} color="#F59E0B" bgColor="#FFF7E6" onPress={() => onNavigate('ReceiveFundsV2Screen')} />
            <SheetGridAction icon="bag-handle-outline" label={t('contacts.action_pay', 'Payer')} color="#3B82F6" bgColor="#EFF6FF" onPress={() => onNavigate('ChooseServiceScreen')} />
            <SheetGridAction icon="person-add-outline" label={t('contacts.action_invite', 'Inviter')} color="#8B5CF6" bgColor="#F5F3FF" onPress={() => onNavigate('RewardsScreen')} />
          </View>

          <View style={styles.sheetListGroup}>
             <SheetListAction icon="star" label={t('contacts.action_add_favorite', 'Ajouter aux favoris')} color="#F59E0B" bgColor="#FEF3C7" onPress={() => onFavorite(contact)} />
             <SheetListAction icon="pencil" label={t('contacts.action_edit', 'Modifier le contact')} color="#3B82F6" bgColor="#EFF6FF" onPress={() => onNavigate('EditBeneficiaryScreen', { isEditing: true, beneficiary: contact })} />
             <SheetListAction icon="trash" label={t('contacts.action_delete', 'Supprimer le contact')} color="#EF4444" bgColor="#FEF2F2" onPress={() => onDelete(contact.id)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SheetGridAction({ icon, label, color, bgColor, onPress }) {
  return (
    <TouchableOpacity style={styles.gridActionBtn} onPress={onPress}>
      <View style={[styles.gridActionIconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.gridActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SheetListAction({ icon, label, onPress, color = '#64748B', bgColor = '#F1F5F9' }) {
  return (
    <TouchableOpacity style={styles.listActionBtn} onPress={onPress}>
      <View style={[styles.listActionIconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.listActionLabel, color === '#EF4444' && { color: '#EF4444' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1, position: 'relative' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 10, paddingBottom: 12 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  backBtnHeader: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: '#DBEAFE' },
  mainTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#0A1128' },
  headerRightIcons: { flexDirection: 'row' },
  iconBtnRight: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#F1F5F9', marginLeft: 8, position: 'relative' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFB800', borderWidth: 1, borderColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 200 },
  todoCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F6', backgroundColor: '#FFFFFF', boxShadow: '0px 4px 12px #0A1737', overflow: 'hidden' },
  todoItem: { flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingHorizontal: 12, paddingVertical: 10 },
  todoIconWrapper: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  todoTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', lineHeight: 16, paddingRight: 10 },
  todoButton: { minWidth: 60, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  todoButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', paddingHorizontal: 16, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 12, marginHorizontal: 16, marginBottom: 24 },
  searchIcon: { marginRight: 12 },
  searchInput: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1A2840', marginBottom: 2, padding: 0, outlineStyle: 'none' },
  searchSubText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8' },
  activeActionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: '#BFDBFE', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  activeActionBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  activeActionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1E3A8A', marginBottom: 2 },
  activeActionSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#3B82F6' },
  cancelActionBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  cancelActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#EF4444' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840', paddingHorizontal: 16, marginBottom: 12 },
  quickActionsScroll: { paddingHorizontal: 16, paddingBottom: 24 },
  quickActionCard: { width: 140, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 16, marginRight: 12, alignItems: 'center' },
  quickActionIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickActionTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#1A2840', textAlign: 'center', marginBottom: 8 },
  quickActionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#64748B', textAlign: 'center', lineHeight: 14 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginBottom: 12 },
  sectionTitleSticky: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840', paddingHorizontal: 16 },
  stickyHeaderContainer: { backgroundColor: '#FAFAFA', paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', zIndex: 10 },
  showLessText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#3B82F6' },
  filtersScroll: { paddingHorizontal: 16, marginBottom: 12 },
  filterChipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1128', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipTextActive: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B' },
  listHeaderRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, alignItems: 'center', backgroundColor: '#FAFAFA' },
  listHeaderText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#94A3B8' },
  contactsList: { paddingHorizontal: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 12 },
  contactInfoCol: { flexDirection: 'row', alignItems: 'center', flex: 2 },
  contactAvatarLarge: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  contactDetails: { flex: 1 },
  contactName: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  contactRelation: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B', marginBottom: 2 },
  contactLocation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
  statusCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  moreActionBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E7FF', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  sheetDismissArea: { flex: 1 },
  sheetContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' },
  sheetHandleWrap: { alignItems: 'center', paddingVertical: 12 },
  sheetHandle: { width: 48, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3 },
  sheetHeader: { alignItems: 'center', marginBottom: 24 },
  sheetAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12 },
  sheetNameLg: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#0F172A', marginBottom: 4 },
  sheetLocationLg: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748B' },
  sheetActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  gridActionBtn: { width: '23%', alignItems: 'center', marginBottom: 16 },
  gridActionIconWrap: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridActionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#334155', textAlign: 'center' },
  sheetListGroup: { backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  listActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listActionIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  listActionLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1E293B' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 70, zIndex: 50 },
  inviteBannerWrapper: { position: 'absolute', bottom: 90, left: 16, right: 16 },
  inviteBanner: { backgroundColor: '#20365B', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  closeBannerBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  inviteBannerLeft: { flex: 1, zIndex: 2 },
  inviteBannerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF', marginBottom: 8, lineHeight: 22 },
  inviteBannerText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#E2E8F0', marginBottom: 16, lineHeight: 16 },
  inviteBtn: { backgroundColor: '#FFB800', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  inviteBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#1A2840' },
  inviteBannerRight: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  mockPhoneIllustration: { width: 64, height: 64, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
});
