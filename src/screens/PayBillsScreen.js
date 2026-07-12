import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import QuickActionCard from '../components/QuickActionCard';
import SelectableContactItem from '../components/SelectableContactItem';

const MOCK_CONTACTS = [
  { id: '1', name: 'Mama Kemi Adebayo', relation: 'Mère', country: 'Lagos, Nigeria', flag: '🇳🇬', avatar: 'https://i.pravatar.cc/150?u=kemi', statusColor: '#FFC759' },
  { id: '2', name: 'Uncle Joseph Mwangi', relation: 'Oncle', country: 'Nairobi, Kenya', flag: '🇰🇪', avatar: 'https://i.pravatar.cc/150?u=joseph', statusColor: '#10B981' },
  { id: '3', name: 'Sister Grace Mensah', relation: 'Sœur', country: 'Accra, Ghana', flag: '🇬🇭', avatar: 'https://i.pravatar.cc/150?u=grace', statusColor: null },
  { id: '4', name: 'David Kouassi', relation: 'Frère', country: 'Abidjan, Côte d\'Ivoire', flag: '🇨🇮', avatar: 'https://i.pravatar.cc/150?u=david', statusColor: null },
  { id: '5', name: 'Aïssatou Diallo', relation: 'Cousine', country: 'Dakar, Sénégal', flag: '🇸🇳', avatar: 'https://i.pravatar.cc/150?u=aissatou', statusColor: null },
];

export default function PayBillsScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('À proximité');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromo, setShowPromo] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState('1'); // Select Mama Kemi by default

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Pay Bills & Send Essentials</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={18} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8B92A5" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un bénéficiaire, pays ou relation..."
            placeholderTextColor="#8B92A5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActionsRow}>
          <QuickActionCard
            iconName="person-add-outline"
            iconColor="#1A2840"
            iconBgColor="#F3F4F6"
            title="Ajouter bénéficiaire"
            onPress={() => alert('Ajouter')}
            style={styles.flexCard}
          />
          <QuickActionCard
            iconName="people-outline"
            iconColor="#10B981"
            iconBgColor="#ECFDF5"
            title="Mes bénéficiaires"
            onPress={() => alert('Mes bénéficiaires')}
            style={styles.flexCard}
          />
          <QuickActionCard
            iconName="paper-plane-outline"
            iconColor="#3B82F6"
            iconBgColor="#EFF6FF"
            title="Inviter un ami"
            onPress={() => alert('Inviter')}
            style={styles.flexCard}
          />
          <QuickActionCard
            iconName="storefront-outline"
            iconColor="#8B5CF6"
            iconBgColor="#EDE9FE"
            title="Référer un marchand"
            onPress={() => alert('Référer')}
            style={[styles.flexCard, { marginRight: 0 }]}
          />
        </View>

        {/* Beneficiaries Section */}
        <Text style={styles.sectionTitle}>Mes bénéficiaires</Text>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'À proximité' && styles.filterChipActive]}
            onPress={() => setActiveFilter('À proximité')}
          >
            <Ionicons name="location-outline" size={14} color={activeFilter === 'À proximité' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'À proximité' && styles.filterTextActive]} numberOfLines={1}>À proximité</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'De mes pays préférés' && styles.filterChipActive]}
            onPress={() => setActiveFilter('De mes pays préférés')}
          >
            <Ionicons name="globe-outline" size={14} color={activeFilter === 'De mes pays préférés' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'De mes pays préférés' && styles.filterTextActive]} numberOfLines={1}>De mes pays préférés</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'Récents' && styles.filterChipActive]}
            onPress={() => setActiveFilter('Récents')}
          >
            <Ionicons name="time-outline" size={14} color={activeFilter === 'Récents' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'Récents' && styles.filterTextActive]} numberOfLines={1}>Récents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterIconButton}>
            <Ionicons name="filter-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        {/* Contact List */}
        <View style={styles.contactsList}>
          {MOCK_CONTACTS.map((contact) => (
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

        {/* Promo Banner */}
        {showPromo && (
          <View style={styles.promoBanner}>
            <TouchableOpacity style={styles.promoClose} onPress={() => setShowPromo(false)}>
              <Ionicons name="close" size={20} color="#8B92A5" />
            </TouchableOpacity>

            <View style={styles.promoContent}>
              <Image source={require('../../assets/promo_blue_wallet.png')} style={styles.promoImage} resizeMode="contain" />
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>Payez facilement les factures, recharges et produits essentiels en Afrique.</Text>
                <Text style={styles.promoSubtitle}>Rapide, sécurisé et sans frontières.</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom Sticky CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('ChooseServiceScreen')}>
          <Text style={styles.ctaButtonText}>Continuer</Text>
          <Ionicons name="arrow-forward" size={20} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.ctaHint}>Sélectionnez un bénéficiaire pour continuer</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  headerSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginLeft: 32,
    paddingRight: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Leave space for bottom CTA
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  flexCard: {
    flex: 1,
    width: 'auto',
    marginRight: 8,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginRight: 2,
    backgroundColor: '#FFFFFF',
    flexShrink: 1,
  },
  filterChipActive: {
    backgroundColor: '#1A2840',
    borderColor: '#1A2840',
  },
  filterIcon: {
    marginRight: 2,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#1A2840',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  contactsList: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  promoBanner: {
    marginHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  promoClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTextContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  promoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 4,
    lineHeight: 16,
  },
  promoSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
  },
  promoImage: {
    width: 64,
    height: 64,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ctaButton: {
    backgroundColor: '#FFC759',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ctaButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginRight: 8,
  },
  ctaHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8B92A5',
    textAlign: 'center',
  }
});
