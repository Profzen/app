import React, { useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Pressable, ScrollView, TextInput, Image, PanResponder, Animated, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { shareInviteLink, shareShopLink } from '../utils/shareHelper';
import { useApp } from '../context/AppContext';

const quickActions = [
  { id: '1', title: "Payer et\nacheter l'essentiel", subtitle: "Achat de crédit,\ninternet, TV, jeux,\ncrypto et plus", icon: "bag-handle-outline", color: "#8B5CF6" },
  { id: '2', title: "Recharger\nmobile", subtitle: "Achat de crédit\nmobile", icon: "phone-portrait-outline", color: "#10B981" },
  { id: '3', title: "Payer des\nfactures", subtitle: "Électricité, eau,\ninternet et plus", icon: "receipt-outline", color: "#3B82F6" },
  { id: '4', title: "Envoyer /\nDemander\ndes fonds", subtitle: "Transferts d'argent\ninstantanés", icon: "swap-horizontal-outline", color: "#F59E0B" },
  { id: '5', title: "Inviter", subtitle: "Invitez vos amis\net gagnez\n$5 en DZY", icon: "person-add-outline", color: "#8B5CF6" },
];

const contactsData = [
  { id: '1', name: "John Doe", relation: "Frère", location: "Lomé, Togo", flag: "🇹🇬", isBeneficiary: true, isSponsor: true, image: "https://i.pravatar.cc/150?img=11" },
  { id: '2', name: "Marie K.", relation: "Sœur", location: "Dakar, Sénégal", flag: "🇸🇳", isBeneficiary: true, isSponsor: true, image: "https://i.pravatar.cc/150?img=5" },
  { id: '3', name: "Ousmane T.", relation: "Ami", location: "Bamako, Mali", flag: "🇲🇱", isBeneficiary: true, isSponsor: false, image: "https://i.pravatar.cc/150?img=12" },
  { id: '4', name: "Aïssatou B.", relation: "Famille", location: "Ouagadougou, Burkina Faso", flag: "🇧🇫", isBeneficiary: true, isSponsor: false, image: "https://i.pravatar.cc/150?img=9" },
  { id: '5', name: "Kwame A.", relation: "Ami", location: "Accra, Ghana", flag: "🇬🇭", isBeneficiary: false, isSponsor: true, image: "https://i.pravatar.cc/150?img=14" },
];

export default function ContactsScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [showInvite, setShowInvite] = useState(true);
  const [contactItems, setContactItems] = useState(contactsData);
  const [openSwipe, setOpenSwipe] = useState(null);
  const [toast, setToast] = useState(null);

  const actionRoutes = { '1': 'ChooseServiceScreen', '2': 'MobileRechargeScreen', '3': 'ChooseServiceScreen', '4': 'SendMoneyScreen', '5': 'RewardsScreen' };

  const removeContact = (id) => {
    setContactItems((items) => items.filter((item) => item.id !== id));
    setOpenSwipe(null);
    setToast({ title: language === 'fr' ? 'Contact supprimé' : 'Contact removed', message: language === 'fr' ? 'Le contact a été retiré avec succès.' : 'Contact has been successfully removed.' });
  };

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

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.syncBtn} onPress={() => setToast({ title: language === 'fr' ? 'Synchronisation' : 'Sync Completed', message: language === 'fr' ? 'Vos contacts du téléphone ont été synchronisés !' : 'Your phone contacts have been synced!' })}>
            <Ionicons name="sync-outline" size={16} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={styles.syncBtnText}>{t('syncContactsBtn', 'Synchroniser vos contacts')}</Text>
          </TouchableOpacity>
          
          <Text style={styles.subtitle}>{t('contactsSubtitle', 'Envoyez de l\'argent à vos bénéficiaires à travers l\'Afrique.')}</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('contactsSearchPlaceholder', 'Rechercher un contact')}
                placeholderTextColor="#64748B"
              />
              <Text style={styles.searchSubText}>{language === 'fr' ? 'Nom, téléphone, email, ville ou pays' : 'Name, phone, email, city or country'}</Text>
            </View>
          </View>

          {/* Actions rapides */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            {quickActions.map(action => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.quickActionCard} 
                onPress={() => {
                  if (action.id === '5') {
                    shareInviteLink();
                  } else {
                    navigation.navigate(actionRoutes[action.id]);
                  }
                }}
              >
                <View style={styles.quickActionIconContainer}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Mes bénéficiaires */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mes bénéficiaires</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('ContactsManageScreen')}>
              <Text style={styles.showLessText}>Gérer contacts</Text>
              <Ionicons name="arrow-forward" size={14} color="#64748B" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity style={styles.filterChipActive}>
              <Ionicons name="location-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipTextActive}>À proximité</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="heart-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>De mes pays préférés</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="earth-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>De toute l'Afrique</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="globe-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.filterChipText}>Du reste du monde</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Contacts List Header */}
          <View style={styles.listHeaderRow}>
            <Text style={[styles.listHeaderText, { flex: 2 }]}>Contact</Text>
            <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>Bénéficiaire</Text>
            <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>Parrain</Text>
            <View style={{ width: 34 }} />
          </View>

          {/* Contacts List with Interactive Swipe Left & Right */}
          <View style={styles.contactsList}>
            {contactItems.map((contact) => (
              <SwipeContactRow
                key={contact.id}
                contact={contact}
                direction={openSwipe?.id === contact.id ? openSwipe.direction : null}
                onDirection={(direction) => setOpenSwipe(direction ? { id: contact.id, direction } : null)}
                onNavigate={(route) => navigation.navigate(route)}
                onDelete={() => removeContact(contact.id)}
                onFavorite={() => {
                  setOpenSwipe(null);
                  setToast({ title: 'Ajouté aux favoris', message: `${contact.name} a été ajouté à vos favoris.` });
                }}
              />
            ))}
          </View>

        </ScrollView>

        {/* Invite Banner (Floating) */}
        {showInvite && (
          <View style={styles.inviteBannerWrapper}>
            <View style={styles.inviteBanner}>
              <TouchableOpacity style={styles.closeBannerBtn} onPress={() => setShowInvite(false)}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.inviteBannerLeft}>
                <Text style={styles.inviteBannerTitle}>
                  Invitez vos amis{'\n'}et gagnez <Text style={{ color: '#FFB800' }}>$5 en DZY</Text>
                </Text>
                <Text style={styles.inviteBannerText}>
                  Envoyez de l'argent, achetez, payez des factures et gagnez des récompenses ensemble.
                </Text>
                <TouchableOpacity style={styles.inviteBtn} onPress={() => shareInviteLink()}>
                  <Text style={styles.inviteBtnText}>Inviter maintenant</Text>
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

function SwipeContactRow({ contact, direction, onDirection, onNavigate, onDelete, onFavorite }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastSwipeDx = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dx) > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          lastSwipeDx.current = 0;
        },
        onPanResponderMove: (_, gesture) => {
          lastSwipeDx.current = gesture.dx;
          translateX.setValue(Math.max(-120, Math.min(120, gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          const dx = Math.abs(gesture.dx) >= Math.abs(lastSwipeDx.current) ? gesture.dx : lastSwipeDx.current;
          if (dx < -25) {
            onDirection('left');
          } else if (dx > 25) {
            onDirection('right');
          } else {
            onDirection(null);
          }
          lastSwipeDx.current = 0;
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, speed: 20 }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [onDirection, translateX]
  );

  const personInfo = (
    <View style={styles.contactInfoCol}>
      <Image source={typeof contact.avatar === 'number' ? contact.avatar : (contact.image ? { uri: contact.image } : require('../../assets/avatars/david.jpg'))} style={styles.contactAvatar} />
      <View style={styles.contactDetails}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactRelation}>{contact.relation}</Text>
        <Text style={styles.contactLocation}>{contact.flag} {contact.location}</Text>
      </View>
    </View>
  );

  if (direction) {
    return (
      <View style={styles.swipeRow}>
        <TouchableOpacity style={styles.swipePerson} onPress={() => onDirection(null)}>
          {personInfo}
        </TouchableOpacity>
        <View style={styles.swipeReveal}>
          {direction === 'left' ? (
            <>
              <SwipeAction icon="star-outline" label="Favoris" onPress={onFavorite} />
              <SwipeAction icon="pencil-outline" label="Modifier" onPress={() => onNavigate('ContactProfileScreen')} />
              <SwipeAction icon="trash-outline" label="Supprimer" danger onPress={onDelete} />
            </>
          ) : (
            <>
              <SwipeAction icon="arrow-up-outline" label={'Envoyer\nde l’argent'} tint="#ECFDF5" onPress={() => onNavigate('SendMoneyScreen')} />
              <SwipeAction icon="cash-outline" label={'Demander\nde l’argent'} tint="#FFF7E6" onPress={() => onNavigate('ReceiveFundsV2Screen')} />
              <SwipeAction icon="bag-handle-outline" label={'Payer &\nessentiels'} tint="#EFF6FF" onPress={() => onNavigate('ChooseServiceScreen')} />
              <SwipeAction icon="person-add-outline" label="Inviter" tint="#F5F3FF" onPress={() => onNavigate('RewardsScreen')} />
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.contactItem, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      <TouchableOpacity style={styles.contactInfoCol} onPress={() => onNavigate('ContactProfileScreen')}>
        <Image source={typeof contact.avatar === 'number' ? contact.avatar : (contact.image ? { uri: contact.image } : require('../../assets/avatars/david.jpg'))} style={styles.contactAvatar} />
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelation}>{contact.relation}</Text>
          <Text style={styles.contactLocation}>{contact.flag} {contact.location}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.statusCol}>
        <Ionicons name="person-outline" size={20} color={contact.isBeneficiary ? '#10B981' : '#94A3B8'} />
        <Text style={[styles.statusText, { color: contact.isBeneficiary ? '#10B981' : '#94A3B8' }]}>
          {contact.isBeneficiary ? 'Oui' : 'Non'}
        </Text>
      </View>

      <View style={styles.statusCol}>
        <Ionicons name="person-add-outline" size={20} color={contact.isSponsor ? '#10B981' : '#94A3B8'} />
        <Text style={[styles.statusText, { color: contact.isSponsor ? '#10B981' : '#94A3B8' }]}>
          {contact.isSponsor ? 'Oui' : 'Non'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.swipeTriggerBtn}
        onPress={() => onDirection('right')}
        onLongPress={() => onDirection('left')}
        activeOpacity={0.7}
      >
        <Ionicons name="swap-horizontal" size={18} color="#0F172A" />
      </TouchableOpacity>
    </Animated.View>
  );
}

function SwipeAction({ icon, label, onPress, danger, tint }) {
  return (
    <TouchableOpacity
      style={[styles.swipeAction, tint && { backgroundColor: tint }, danger && styles.swipeActionDanger]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={20} color={danger ? '#FFF' : '#1A2840'} />
      <Text style={[styles.swipeActionLabel, danger && { color: '#FFF' }]}>{label}</Text>
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
  scrollContent: { paddingTop: 8, paddingBottom: 160 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  syncBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#3B82F6' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', paddingHorizontal: 16, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 12, marginHorizontal: 16, marginBottom: 24 },
  searchIcon: { marginRight: 12 },
  searchInput: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1A2840', marginBottom: 2, padding: 0, outlineStyle: 'none' },
  searchSubText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840', paddingHorizontal: 16, marginBottom: 12 },
  quickActionsScroll: { paddingHorizontal: 16, paddingBottom: 24 },
  quickActionCard: { width: 140, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 16, marginRight: 12, alignItems: 'center' },
  quickActionIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickActionTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#1A2840', textAlign: 'center', marginBottom: 8 },
  quickActionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#64748B', textAlign: 'center', lineHeight: 14 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginBottom: 12 },
  showLessText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#3B82F6' },
  filtersScroll: { paddingHorizontal: 16, marginBottom: 16 },
  filterChipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1128', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  filterChipTextActive: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  filterChipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748B' },
  listHeaderRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, alignItems: 'center' },
  listHeaderText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#94A3B8' },
  contactsList: { paddingHorizontal: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 12 },
  contactInfoCol: { flexDirection: 'row', alignItems: 'center', flex: 2 },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  contactDetails: { flex: 1 },
  contactName: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  contactRelation: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B', marginBottom: 2 },
  contactLocation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
  statusCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  swipeRow: { minHeight: 74, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  swipePerson: { width: '35%', paddingHorizontal: 8, justifyContent: 'center', backgroundColor: '#FFF' },
  swipeReveal: { flex: 1, flexDirection: 'row' },
  swipeAction: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2, backgroundColor: '#F8FAFC' },
  swipeActionDanger: { backgroundColor: '#EF4444' },
  swipeActionLabel: { marginTop: 4, fontFamily: 'Inter_600SemiBold', fontSize: 9, lineHeight: 11, textAlign: 'center', color: '#1A2840' },
  swipeTriggerBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 70, zIndex: 50 },
  inviteBannerWrapper: { position: 'absolute', bottom: 90, left: 16, right: 16 },
  inviteBanner: { backgroundColor: '#0A1128', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  closeBannerBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  inviteBannerLeft: { flex: 1, zIndex: 2 },
  inviteBannerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF', marginBottom: 8, lineHeight: 22 },
  inviteBannerText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#E2E8F0', marginBottom: 16, lineHeight: 16 },
  inviteBtn: { backgroundColor: '#FFB800', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  inviteBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#1A2840' },
  inviteBannerRight: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  mockPhoneIllustration: { width: 56, height: 80, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
