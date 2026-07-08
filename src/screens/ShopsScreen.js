import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import QuickActionCard from '../components/QuickActionCard';
import ShopListItem from '../components/ShopListItem';
import BottomNavBar from '../components/BottomNavBar';

const MOCK_SHOPS = [
  { id: '1', name: 'Jumia Sénégal', category: 'Marketplace', location: 'Dakar, Sénégal', distance: '1,2 km', rating: '4.6', reviews: '230', icon: { name: 'cart' }, bgColor: '#F59E0B', iconColor: '#FFFFFF' },
  { id: '2', name: 'Kiwi Cameroun', category: 'Supermarché', location: 'Douala, Cameroun', distance: '3,5 km', rating: '4.4', reviews: '120', icon: 'K', bgColor: '#10B981', iconColor: '#FFFFFF' },
  { id: '3', name: 'Mamasita Restaurant', category: 'Restaurant', location: 'Abidjan, Côte d\'Ivoire', distance: '2,1 km', rating: '4.8', reviews: '98', icon: 'm', bgColor: '#000000', iconColor: '#FFFFFF' },
  { id: '4', name: 'Yello Store Ghana', category: 'Électronique', location: 'Accra, Ghana', distance: '4,0 km', rating: '4.5', reviews: '76', icon: 'Y', bgColor: '#FBBF24', iconColor: '#000000' },
  { id: '5', name: 'Pharma Plus', category: 'Santé', location: 'Lagos, Nigeria', distance: '5,3 km', rating: '4.7', reviews: '150', icon: 'P', bgColor: '#1E3A8A', iconColor: '#FFFFFF' },
];

export default function ShopsScreen() {
  const [activeTopTab, setActiveTopTab] = useState('Shops');
  const [activeFilter, setActiveFilter] = useState('À proximité');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromo, setShowPromo] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Shops</Text>
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
        <Text style={styles.headerSubtitle}>Découvrez, payez et soutenez les entreprises africaines.</Text>
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
            placeholder="Rechercher en Afrique (shops, produits, services...)"
            placeholderTextColor="#8B92A5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <QuickActionCard 
            iconName="add-outline" 
            iconColor="#F59E0B" 
            iconBgColor="#FEF3C7" 
            title="Référer un business" 
            subtitle="Parrainez un commerçant"
            onPress={() => alert('Référer')}
          />
          <QuickActionCard 
            iconName="bag-outline" 
            iconColor="#10B981" 
            iconBgColor="#D1FAE5" 
            title="Mes shops" 
            subtitle="Voir les shops avec lesquels je traite"
            onPress={() => alert('Mes shops')}
          />
          <QuickActionCard 
            iconName="location-outline" 
            iconColor="#3B82F6" 
            iconBgColor="#DBEAFE" 
            title="Shops à proximité" 
            subtitle="Découvrez les shops près de vous"
            onPress={() => alert('Shops proximité')}
          />
          <QuickActionCard 
            iconName="storefront-outline" 
            iconColor="#8B5CF6" 
            iconBgColor="#EDE9FE" 
            title="Nouveaux shops" 
            subtitle="Nouveaux shops de mes COIs"
            onPress={() => alert('Nouveaux')}
          />
        </ScrollView>

        {/* Shops Section */}
        <View style={styles.shopsHeaderRow}>
          <Text style={styles.sectionTitle}>Mes shops</Text>
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
            style={[styles.filterChip, activeFilter === 'COIs' && styles.filterChipActive]}
            onPress={() => setActiveFilter('COIs')}
          >
            <Ionicons name="people-outline" size={16} color={activeFilter === 'COIs' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'COIs' && styles.filterTextActive]}>COIs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'Catégories' && styles.filterChipActive]}
            onPress={() => setActiveFilter('Catégories')}
          >
            <Ionicons name="grid-outline" size={16} color={activeFilter === 'Catégories' ? '#FFFFFF' : '#1A2840'} style={styles.filterIcon} />
            <Text style={[styles.filterText, activeFilter === 'Catégories' && styles.filterTextActive]}>Catégories</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterIconButton}>
            <Ionicons name="options-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </ScrollView>

        {/* Shop List */}
        <View style={styles.shopsList}>
          {MOCK_SHOPS.map((shop) => (
            <ShopListItem 
              key={shop.id}
              icon={shop.icon}
              bgColor={shop.bgColor}
              iconColor={shop.iconColor}
              name={shop.name}
              category={shop.category}
              location={shop.location}
              distance={shop.distance}
              rating={shop.rating}
              reviews={shop.reviews}
              onPress={() => alert('View Shop')}
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
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>Découvrez des shops de confiance autour de vous</Text>
                <Text style={styles.promoSubtitle}>Payez en DZY en toute sécurité.</Text>
                
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Explorer les shops</Text>
                </TouchableOpacity>
              </View>
              <Image source={require('../../assets/promo_shop.png')} style={styles.promoImage} resizeMode="contain" />
            </View>
          </View>
        )}

      </ScrollView>

      {/* Sub Navigation (Sticky above BottomNavBar) */}
      <View style={styles.subNavBar}>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="storefront" size={20} color="#1A2840" />
          <Text style={[styles.subNavText, styles.subNavTextActive]}>Mes shops</Text>
          <View style={styles.subNavIndicator} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="pricetag-outline" size={20} color="#8B92A5" />
          <Text style={styles.subNavText}>Nouveaux shops</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="grid-outline" size={20} color="#8B92A5" />
          <Text style={styles.subNavText}>Catégories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subNavItem}>
          <Ionicons name="time-outline" size={20} color="#8B92A5" />
          <Text style={styles.subNavText}>Activité</Text>
        </TouchableOpacity>
      </View>

      {/* Main Bottom Nav */}
      <BottomNavBar activeTab="Shops" />

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
    backgroundColor: theme.colors.accent,
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
  shopsHeaderRow: {
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginRight: 6,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#1A2840',
    borderColor: '#1A2840',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
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
  shopsList: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  promoBanner: {
    marginHorizontal: 20,
    backgroundColor: '#0F172A', // Dark blue as per mockup M20
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
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
    paddingRight: 8,
  },
  promoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  promoSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: '#FFC759',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  promoButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  promoImage: {
    width: 100,
    height: 100,
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
