import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Modal, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';
import { useEffect } from 'react';
import contactService from '../services/contactService';
import { shareInviteLink, shareShopLink } from '../utils/shareHelper';

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

export default function ContactsManageScreen() {
  const navigation = useNavigation();
  const { session, t } = useApp();
  const [contactItems, setContactItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    { id: '1', title: t('contacts.add', "Ajouter\nun bénéficiaire"), subtitle: t('contacts.add_desc', "Ajouter un nouveau\nbénéficiaire"), icon: "person-add-outline", color: "#8B5CF6" },
    { id: '2', title: t('contacts.edit', "Modifier\nun bénéficiaire"), subtitle: t('contacts.edit_desc', "Mettre à jour les\ninformations"), icon: "pencil-outline", color: "#10B981" },
    { id: '3', title: t('contacts.my_beneficiaries', "Mes\nbénéficiaires"), subtitle: t('contacts.quick_action_view_sub', "Voir et gérer tous\nmes contacts"), icon: "people-outline", color: "#3B82F6" },
    { id: '4', title: t('contacts.quick_action_5.title', "Inviter\nmes amis"), subtitle: t('contacts.quick_action_5.subtitle', "Invitez vos amis et\ngagnez $5 en DZY"), icon: "paper-plane-outline", color: "#F59E0B", subtitleColor: "#64748B", highlightColor: "#F59E0B", highlightText: "$5 en DZY" },
  ];

  useEffect(() => {
    fetchBeneficiaries();
  }, [session]);

  const fetchBeneficiaries = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const data = await contactService.getBeneficiaries(session.user.id);
      const mapped = data.data.map(b => ({
        id: b.id,
        name: b.full_name || `${b.first_name} ${b.last_name}`.trim(),
        relation: b.relationship || t('contacts.relation.friend', 'Ami'),
        location: `${b.city || ''}, ${b.country_code || ''}`.trim().replace(/^,|,$/g, ''),
        country: b.country || b.country_name || (b.country_code ? (() => { try { return new Intl.DisplayNames(['en'], {type: 'region'}).of(b.country_code) } catch(e) { return b.country_code } })() : ''),
        country_code: b.country_code,
        city: b.city,
        flag: getFlagEmoji(b.country_code),
        isBeneficiary: true,
        isSponsor: false,
        image: b.avatar_url || null,
        raw_data: b
      }));
      setContactItems(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedContact, setSelectedContact] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [toast, setToast] = useState(null);

  const quickAction = (id) => {
    if (id === '1') navigation.navigate('EditBeneficiaryScreen'); else if (id === '2') setToast({ title: 'Action requise', message: 'Veuillez sélectionner un bénéficiaire dans la liste pour le modifier.' });
    else if (id === '3') setToast({ title: 'Liste actualisée', message: 'Tous vos bénéficiaires sont affichés.' });
    else shareInviteLink();
  };
  const removeContact = async (id) => {
    try {
      await contactService.deleteBeneficiary(id);
      setContactItems(items => items.filter(item => item.id !== id));
      setToast({ title: t('contacts.deleted', 'Contact supprimé'), message: t('contacts.deleted_desc', 'Contact supprimé avec succès.') });
    } catch (err) {
      setToast({ title: 'Erreur', message: t('contacts.delete_error', 'Impossible de supprimer ce contact.') });
    }
    setSelectedContact(null);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Text style={styles.mainTitle}>{t('contacts.manage_contacts', 'Contacts')}</Text>
          <Text style={styles.subtitle}>{t('contacts.subtitle', "Envoyez de l'argent à vos bénéficiaires à travers l'Afrique.")}</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#20365B" style={styles.searchIcon} />
            <View style={styles.searchContent}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('common.wallet.search_beneficiary', 'Rechercher un contact')}
                placeholderTextColor="#64748B"
              />
              <Text style={styles.searchSubText}>{t('contacts.search_hint', 'Nom, téléphone, email, ville ou pays')}</Text>
            </View>
          </View>

          {/* Actions rapides */}
          <Text style={styles.sectionTitle}>{t('contacts.quick_actions', 'Actions rapides')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard} onPress={() => quickAction(action.id)}>
                <View style={styles.quickActionIconContainer}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                {action.highlightText ? (
                  <Text style={styles.quickActionSubtitle}>
                    Invitez vos amis et{'\n'}gagnez <Text style={{ color: action.highlightColor, fontWeight: '700' }}>{action.highlightText}</Text>
                  </Text>
                ) : (
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Mes bénéficiaires */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('contacts.my_beneficiaries', 'Mes bénéficiaires')}</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.showAllText}>Voir tout</Text>
              <Ionicons name="arrow-forward" size={16} color="#1A2840" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity style={styles.filterChipActive}>
              <Ionicons name="location-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipTextActive}>{t('contacts.filter_nearby', 'À proximité')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="globe-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>{t('contacts.filter_favorites', 'De mes pays préférés')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="earth-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>{t('contacts.filter_africa', 'De toute l\'Afrique')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="globe-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>{t('contacts.filter_world', 'Du reste du monde')}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Contacts List Header */}
          <View style={styles.listHeaderRow}>
            <Text style={[styles.listHeaderText, { flex: 2 }]}>{t('contacts.col_contact', 'Contact')}</Text>
            <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>{t('contacts.col_beneficiary', 'Bénéficiaire')}</Text>
            <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>{t('contacts.col_sponsor', 'Parrain')}</Text>
            <View style={{ width: 20 }} />
          </View>

          {/* Contacts List */}
          <View style={styles.contactsList}>
            {contactItems.map((contact) => (
              <ContactRow 
                key={contact.id} 
                contact={contact} 
                onPress={() => setSelectedContact(contact)}
              />
            ))}
          </View>

        </ScrollView>

        <ContactActionSheet 
          contact={selectedContact}
          visible={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          onNavigate={(route, extraParams = {}) => {
            setSelectedContact(null);
            navigation.navigate(route, { contact: selectedContact, ...extraParams });
          }}
          onDelete={(id) => {
            setSelectedContact(null);
            removeContact(id);
          }}
          onFavorite={(contact) => {
            setSelectedContact(null);
            setToast({ title: 'Ajouté aux favoris', message: `${contact.name} est maintenant dans vos favoris.` });
          }}
        />

        {/* Invite Banner (Floating) */}
        {bannerVisible && <View style={styles.inviteBannerWrapper}>
          <View style={styles.inviteBanner}>
            <TouchableOpacity style={styles.closeBannerBtn} onPress={() => setBannerVisible(false)} accessibilityLabel="Fermer la bannière d'invitation">
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.inviteBannerLeft}>
              <Text style={styles.inviteBannerTitle}>
                {t('home.inviteBannerTitle_1', "Invitez vos amis\net gagnez ")}<Text style={{ color: '#FFB800' }}>{t('home.inviteBannerTitle_2', "$5 en DZY")}</Text>
              </Text>
              <Text style={styles.inviteBannerText}>
                {t('home.inviteBannerDesc', "Envoyez de l'argent, achetez, payez des factures et gagnez des récompenses ensemble.")}
              </Text>
              <TouchableOpacity style={styles.inviteBtn} onPress={() => navigation.navigate('RewardsScreen')}>
                <Text style={styles.inviteBtnText}>{t('home.btnInviteNow', "Inviter maintenant")}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inviteBannerRight}>
              {/* Abstract illustration representation */}
              <View style={styles.mockPhoneIllustration}>
                <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
            </View>
          </View>
        </View>}

        <BottomNavBar activeTab="contacts" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

function ContactRow({ contact, onPress, onNavigate }) {
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
        <Ionicons name="heart-outline" size={18} color={contact.isSponsor ? '#10B981' : '#94A3B8'} />
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
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 32,
    width: 120,
  },
  headerRightIcons: {
    flexDirection: 'row',
  },
  iconBtnRight: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginLeft: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB800',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 160, // extra padding for floating banner
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#0A1128',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 24,
    boxShadow: '0px 2px 6px rgba(15, 23, 42, 0.04)',
  },
  searchContent: {
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
    outlineStyle: 'none',
    marginBottom: 1,
    padding: 0,
  },
  searchSubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  quickActionCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 12,
  },
  showAllText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  filtersScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20365B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipTextActive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  listHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  listHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  contactsList: {
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
    touchAction: 'pan-y',
  },
  contactInfoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  contactAvatarLarge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  contactRelation: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  contactLocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  moreActionBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  sheetNameLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 4,
  },
  sheetLocationLg: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  sheetActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridActionBtn: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridActionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
  },
  sheetListGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listActionLabel: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 70, zIndex: 50 },
  statusCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  inviteBannerWrapper: {
    position: 'absolute',
    bottom: 90, // above bottom nav
    left: 16,
    right: 16,
  },
  inviteBanner: {
    backgroundColor: '#20365B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  closeBannerBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  inviteBannerLeft: {
    flex: 1,
    zIndex: 2,
  },
  inviteBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  inviteBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#E2E8F0',
    marginBottom: 16,
    lineHeight: 16,
  },
  inviteBtn: {
    backgroundColor: '#FFB800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  inviteBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  inviteBannerRight: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mockPhoneIllustration: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
