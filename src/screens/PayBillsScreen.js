import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SelectableContactItem from '../components/SelectableContactItem';
import AppToast from '../components/AppToast';
import { shareInviteLink, shareShopLink } from '../utils/shareHelper';

const MOCK_CONTACTS = [
  { id: '1', name: 'Mama Kemi Adebayo', relation: 'Mère', country: 'Lagos, Nigeria', flag: '🇳🇬', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', statusColor: '#10B981' },
  { id: '2', name: 'Uncle Joseph Mwangi', relation: 'Oncle', country: 'Nairobi, Kenya', flag: '🇰🇪', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', statusColor: '#10B981' },
  { id: '3', name: 'Sister Grace Mensah', relation: 'Sœur', country: 'Accra, Ghana', flag: '🇬🇭', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', statusColor: null },
  { id: '4', name: 'David Kouassi', relation: 'Frère', country: 'Abidjan, Côte d\'Ivoire', flag: '🇨🇮', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', statusColor: null },
  { id: '5', name: 'Aïssatou Diallo', relation: 'Cousine', country: 'Dakar, Sénégal', flag: '🇸🇳', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80', statusColor: null },
];

export default function PayBillsScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('À proximité');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromo, setShowPromo] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState('1'); // Mama Kemi selected by default
  const [toast, setToast] = useState(null);

  const filteredContacts = MOCK_CONTACTS.filter(contact => {
    const query = searchQuery.toLowerCase();
    return contact.name.toLowerCase().includes(query) || contact.relation.toLowerCase().includes(query) || contact.country.toLowerCase().includes(query);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Top Bar */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Pay Bills & Send Essentials</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={18} color="#1A2840" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Envoyez des produits essentiels et payez les factures de vos proches.</Text>
        </View>

        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Input Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un bénéficiaire, pays ou relation..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Quick Actions (4-column Grid) */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ContactsManageScreen')}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#FFF7E6' }]}>
                <Ionicons name="person-add-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionTitle}>Ajouter{'\n'}bénéficiaire</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ContactsScreen')}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="people-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.quickActionTitle}>Mes{'\n'}bénéficiaires</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => shareInviteLink()}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="paper-plane-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionTitle}>Inviter{'\n'}un ami</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => shareShopLink()}>
              <View style={[styles.quickActionIconBg, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="storefront-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionTitle}>Référer un{'\n'}marchand</Text>
            </TouchableOpacity>
          </View>

          {/* Mes bénéficiaires Section */}
          <Text style={styles.sectionTitle}>Mes bénéficiaires</Text>

          {/* Sub-tabs / Filters Row */}
          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'À proximité' && styles.filterChipActive]}
              onPress={() => setActiveFilter('À proximité')}
            >
              <Ionicons name="location-outline" size={13} color={activeFilter === 'À proximité' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterText, activeFilter === 'À proximité' && styles.filterTextActive]}>À proximité</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterChip, activeFilter === 'COI' && styles.filterChipActive]}
              onPress={() => setActiveFilter('COI')}
            >
              <Ionicons name="globe-outline" size={13} color={activeFilter === 'COI' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterText, activeFilter === 'COI' && styles.filterTextActive]}>COI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Récents' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Récents')}
            >
              <Ionicons name="time-outline" size={13} color={activeFilter === 'Récents' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterText, activeFilter === 'Récents' && styles.filterTextActive]}>Récents</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterIconButton} onPress={() => setToast({ title: 'Filtre avancé', message: 'Trier par pays ou nom.' })}>
              <Ionicons name="options-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Contacts List */}
          <View style={styles.contactsList}>
            {filteredContacts.map((contact) => (
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
            ))}
          </View>

          {/* Info Promo Banner Card */}
          {showPromo && (
            <View style={styles.promoBanner}>
              <TouchableOpacity style={styles.promoClose} onPress={() => setShowPromo(false)}>
                <Ionicons name="close" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.promoContent}>
                {/* Left Graphic Wallet */}
                <View style={styles.promoGraphicBox}>
                  <View style={styles.miniCoinsGroup}>
                    <View style={[styles.miniCoinDot, { top: 0, left: 4 }]} />
                    <View style={[styles.miniCoinDot, { top: 2, right: 2 }]} />
                    <View style={[styles.miniCoinDot, { top: 12, left: 14 }]} />
                  </View>
                  <View style={styles.miniWalletCard}>
                    <Text style={styles.miniWalletBrand}>DZY</Text>
                    <View style={styles.miniWalletButton} />
                  </View>
                </View>

                {/* Promo Content Text */}
                <View style={styles.promoTextContainer}>
                  <Text style={styles.promoTitle}>Payez facilement les factures, recharges et produits essentiels en Afrique.</Text>
                  <Text style={styles.promoSubtitle}>Rapide, sécurisé et sans frontières.</Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Bottom Fixed CTA Button */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => navigation.navigate('ChooseServiceScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.ctaHint}>Sélectionnez un bénéficiaire pour continuer</Text>
        </View>

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0 },
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
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 8, marginBottom: 18, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#1A2840', outlineStyle: 'none' },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', paddingHorizontal: 16, marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, gap: 8 },
  quickActionCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' },
  quickActionIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', textAlign: 'center', lineHeight: 13 },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 14, alignItems: 'center', gap: 6 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  filterChipActive: { backgroundColor: '#071D54', borderColor: '#071D54' },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#6B7280' },
  filterTextActive: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  filterIconButton: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
  contactsList: { paddingHorizontal: 16, marginBottom: 16 },
  promoBanner: { marginHorizontal: 16, backgroundColor: '#F4F8FF', borderWidth: 1, borderColor: '#E5EDFF', borderRadius: 16, padding: 14, position: 'relative', marginTop: 4 },
  promoClose: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
  promoContent: { flexDirection: 'row', alignItems: 'center' },
  promoGraphicBox: { width: 64, height: 50, position: 'relative', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  miniCoinsGroup: { position: 'absolute', top: 0, left: 0, right: 0, height: 16 },
  miniCoinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFC759', position: 'absolute', borderWidth: 1, borderColor: '#FFFFFF' },
  miniWalletCard: { width: 56, height: 36, backgroundColor: '#071D54', borderRadius: 8, justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, borderColor: '#1E293B' },
  miniWalletBrand: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#FFC759' },
  miniWalletButton: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', position: 'absolute', right: 6, top: 15 },
  promoTextContainer: { flex: 1 },
  promoTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', marginBottom: 2, lineHeight: 15 },
  promoSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280' },
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  ctaButton: { backgroundColor: '#FFC759', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 12, marginBottom: 6 },
  ctaButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginRight: 8 },
  ctaHint: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', textAlign: 'center' }
});
