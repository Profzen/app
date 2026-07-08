import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import QuickActionCard from '../components/QuickActionCard';
import ContactListItem from '../components/ContactListItem';
import BottomNavBar from '../components/BottomNavBar';

const MOCK_CONTACTS = [
  { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john', country: "Côte d'Ivoire", flag: '🇨🇮', isFavorite: false },
  { id: '2', name: 'Marie K.', avatar: 'https://i.pravatar.cc/150?u=marie', country: "Sénégal", flag: '🇸🇳', isFavorite: true },
  { id: '3', name: 'Ousmane T.', avatar: 'https://i.pravatar.cc/150?u=ousmane', country: "Mali", flag: '🇲🇱', isFavorite: true },
  { id: '4', name: 'Aïssatou B.', avatar: 'https://i.pravatar.cc/150?u=aissa', country: "Burkina Faso", flag: '🇧🇫', isFavorite: true },
  { id: '5', name: 'Kwame A.', avatar: 'https://i.pravatar.cc/150?u=kwame', country: "Ghana", flag: '🇬🇭', isFavorite: true },
];

export default function ContactsScreen() {
  const [activeTopTab, setActiveTopTab] = useState('Contacts');
  const [activeFilter, setActiveFilter] = useState('À proximité');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromo, setShowPromo] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={24} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Envoyez, recevez et gérez vos contacts.</Text>
      </View>

      {/* Top Tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity 
          style={[styles.topTab, activeTopTab === 'Contacts' && styles.topTabActive]}
          onPress={() => setActiveTopTab('Contacts')}
        >
          <Text style={[styles.topTabText, activeTopTab === 'Contacts' && styles.topTabTextActive]}>Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.topTab, activeTopTab === 'Shops' && styles.topTabActive]}
          onPress={() => setActiveTopTab('Shops')}
        >
          <Text style={[styles.topTabText, activeTopTab === 'Shops' && styles.topTabTextActive]}>Shops</Text>
        </TouchableOpacity>
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
            placeholder="Rechercher en Afrique (contacts, shops, services...)"
            placeholderTextColor="#8B92A5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <QuickActionCard 
            iconName="person-add-outline" 
            iconColor="#7C3AED" 
            iconBgColor="#F5F3FF" 
            title="Ajouter bénéficiaire" 
            subtitle="Ajoutez un nouveau contact"
            onPress={() => alert('Ajouter')}
          />
          <QuickActionCard 
            iconName="people-outline" 
            iconColor="#059669" 
            iconBgColor="#ECFDF5" 
            title="Mes bénéficiaires" 
            subtitle="Gérez vos contacts et comptes"
            onPress={() => alert('Mes bénéficiaires')}
          />
          <QuickActionCard 
            iconName="paper-plane-outline" 
            iconColor="#3B82F6" 
            iconBgColor="#EFF6FF" 
            title="Inviter des amis" 
            subtitle="Invitez vos amis à rejoindre DZYwallet"
            onPress={() => alert('Inviter')}
          />
          <QuickActionCard 
            iconName="heart-outline" 
            iconColor="#D97706" 
            iconBgColor="#FFFBEB" 
            title="Parrainer un ami" 
            subtitle="Parrainez et gagnez des DZY"
            onPress={() => alert('Parrainer')}
          />
        </ScrollView>

        {/* Contacts Section */}
        <View style={styles.contactsHeaderRow}>
          <Text style={styles.sectionTitle}>Mes bénéficiaires</Text>
          <TouchableOpacity style={styles.voirToutRow}>
            <Text style={styles.voirToutText}>Voir tout</Text>
            <Ionicons name="arrow-forward" size={16} color="#1A2840" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}>
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'À proximité' && styles.filterChipActive]}
            onPress={() => setActiveFilter('À proximité')}
          >
            <Ionicons name="location-outline" size={16} color={activeFilter === 'À proximité' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'À proximité' && styles.filterTextActive]}>À proximité</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'Pays d\'intérêt' && styles.filterChipActive]}
            onPress={() => setActiveFilter('Pays d\'intérêt')}
          >
            <Ionicons name="globe-outline" size={16} color={activeFilter === 'Pays d\'intérêt' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'Pays d\'intérêt' && styles.filterTextActive]}>Pays d'intérêt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'Tous les pays' && styles.filterChipActive]}
            onPress={() => setActiveFilter('Tous les pays')}
          >
            <Ionicons name="flag-outline" size={16} color={activeFilter === 'Tous les pays' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'Tous les pays' && styles.filterTextActive]}>Tous les pays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterIconButton}>
            <Ionicons name="options-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </ScrollView>

        {/* Contact List */}
        <View style={styles.contactsList}>
          {MOCK_CONTACTS.map((contact) => (
            <ContactListItem 
              key={contact.id}
              avatarUrl={contact.avatar}
              name={contact.name}
              countryFlag={contact.flag}
              countryName={contact.country}
              isFavorite={contact.isFavorite}
              onFavoritePress={() => alert('Toggle Favorite')}
              onPress={() => alert('View Contact')}
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
              <Image source={require('../../assets/promo_wallet.png')} style={styles.promoImage} resizeMode="contain" />
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>Invitez vos amis à rejoindre DZYwallet</Text>
                <Text style={styles.promoSubtitle}>Ils gagnent des DZY, vous aussi !</Text>
                
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Inviter maintenant</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Sub Navigation (Sticky above BottomNavBar) */}
      <View style={styles.subNavBar}>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="person" size={20} color="#1A2840" />
          <Text style={[styles.subNavText, styles.subNavTextActive]}>Bénéficiaires</Text>
          <View style={styles.subNavIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="paper-plane-outline" size={20} color="#8B92A5" />
          <Text style={styles.subNavText}>Invitations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="qr-code-outline" size={20} color="#8B92A5" />
          <Text style={styles.subNavText}>QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="time-outline" size={20} color="#8B92A5" />
          <Text style={styles.subNavText}>Activité</Text>
        </TouchableOpacity>
      </View>

      {/* Main Bottom Nav */}
      <BottomNavBar activeTab="Contacts" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#1A2840',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8B92A5',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  topTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 20,
  },
  topTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  topTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
  },
  topTabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8B92A5',
  },
  topTabTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
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
  quickActionsScroll: {
    marginBottom: 32,
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  voirToutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  voirToutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginRight: 4,
  },
  filtersScroll: {
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#1A2840',
    borderColor: '#1A2840',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    paddingRight: 16,
  },
  promoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8B92A5',
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: '#1A2840',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  promoButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  promoImage: {
    width: 64,
    height: 64,
    marginRight: 16,
  },
  subNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  subNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },
  subNavText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8B92A5',
    marginLeft: 4,
  },
  subNavTextActive: {
    color: '#1A2840',
    fontFamily: 'Inter_700Bold',
  },
  subNavIndicator: {
    position: 'absolute',
    bottom: 0, 
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1A2840',
    borderRadius: 1,
  }
});
