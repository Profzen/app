import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

const SHOPS_DATA = [
  { id: '1', name: 'Jumia Sénégal', category: 'Marketplace', subCategory: 'Shopping', city: 'Dakar', country: 'Sénégal', flagCode: 'sn', distance: '1,5 km', rating: '4.6', reviews: '3,235', logo: 'https://ui-avatars.com/api/?name=Jumia&background=F59E0B&color=fff&size=100', badges: ['Delivery', 'Picking', 'On-line'], type: 'Marketplace' },
  { id: '2', name: 'Kiwi Cameroun', category: 'Supermarché', subCategory: 'Épicerie', city: 'Douala', country: 'Cameroun', flagCode: 'cm', distance: '3,5 km', rating: '4.4', reviews: '1,826', logo: 'https://ui-avatars.com/api/?name=Kiwi&background=10B981&color=fff&size=100', badges: ['Picking', 'Delivery', 'On-site'], type: 'Supermarché' },
  { id: '3', name: 'Mamasita Restaurant', category: 'Restaurant', subCategory: 'Cuisine africaine', city: 'Abidjan', country: 'Côte d\'Ivoire', flagCode: 'ci', distance: '2,1 km', rating: '4.8', reviews: '948', logo: 'https://ui-avatars.com/api/?name=Mamasita&background=0F172A&color=fff&size=100', badges: ['Delivery', 'On-site'], type: 'Restaurant' },
  { id: '4', name: 'Yello Store Ghana', category: 'Électronique', subCategory: 'High-tech', city: 'Accra', country: 'Ghana', flagCode: 'gh', distance: '4,0 km', rating: '4.5', reviews: '748', logo: 'https://ui-avatars.com/api/?name=Yello&background=FBBF24&color=fff&size=100', badges: ['Picking', 'Delivery'], type: 'Électronique' },
  { id: '5', name: 'Pharma Plus', category: 'Santé', subCategory: 'Pharmacie', city: 'Lagos', country: 'Nigeria', flagCode: 'ng', distance: '6,3 km', rating: '4.7', reviews: '1,564', logo: 'https://ui-avatars.com/api/?name=Pharma&background=1E3A8A&color=fff&size=100', badges: ['On-line'], type: 'Pharmacie' },
];

export default function ShopsScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState('pays'); // 'pays' or 'cois'
  const [activeSubNav, setActiveSubNav] = useState('Mes shops');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLogoContainer}>
            <Image source={require('../../dizzitup logo cercle.png')} style={{ width: 36, height: 36, marginRight: 8 }} resizeMode="contain" />
            <Text style={styles.dizzitText}>Dizzit<Text style={styles.upText}>Up</Text></Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Shops</Text>
            <Text style={styles.subtitle}>Découvrez, payez et soutenez les entreprises africaines.</Text>
          </View>

          {/* Top Tabs */}
          <View style={styles.topTabsContainer}>
            <TouchableOpacity 
              style={[styles.topTab, activeTopTab === 'pays' && styles.topTabActive]}
              onPress={() => setActiveTopTab('pays')}
            >
              <Text style={[styles.topTabText, activeTopTab === 'pays' && styles.topTabTextActive]}>De mes pays préférés</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.topTab, activeTopTab === 'cois' && styles.topTabActive]}
              onPress={() => setActiveTopTab('cois')}
            >
              <Text style={[styles.topTabText, activeTopTab === 'cois' && styles.topTabTextActive]}>COIs</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#8B92A5" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Rechercher en Afrique (shops, produits, services...)</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.quickActionsContainer}>
              
              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="add" size={16} color="#F59E0B" />
                </View>
                <Text style={styles.qaTitle} numberOfLines={2}>Référer un business</Text>
                <Text style={styles.qaDesc} numberOfLines={3}>Participez au commerce</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="bag-handle-outline" size={16} color="#10B981" />
                </View>
                <Text style={styles.qaTitle} numberOfLines={2}>Mes shops</Text>
                <Text style={styles.qaDesc} numberOfLines={3}>Voir les shops avec lesquels je traite</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="location-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.qaTitle} numberOfLines={2}>Shops à proximité</Text>
                <Text style={styles.qaDesc} numberOfLines={3}>Découvrez les shops près de vous</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="storefront-outline" size={16} color="#9333EA" />
                </View>
                <Text style={styles.qaTitle} numberOfLines={2}>Nouveaux shops</Text>
                <Text style={styles.qaDesc} numberOfLines={3}>Nouveaux shops de mes COIs</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Shops Section */}
          <View style={styles.shopsSection}>
            <View style={styles.shopsHeader}>
              <Text style={styles.sectionTitle}>Mes shops</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Voir tout</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
              <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
                <Ionicons name="location-outline" size={12} color="#FFFFFF" />
                <Text style={[styles.filterChipText, styles.filterChipTextActive]} numberOfLines={1}>À proximité</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="earth-outline" size={12} color="#1A2840" />
                <Text style={styles.filterChipText} numberOfLines={1}>De mes pays préférés</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="grid-outline" size={12} color="#1A2840" />
                <Text style={styles.filterChipText} numberOfLines={1}>Catégories</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterChip, {flex: 0, paddingHorizontal: 12}]}>
                <Ionicons name="options-outline" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>

            {/* List Items */}
            <View style={styles.listContainer}>
              {SHOPS_DATA.map((item, index) => (
                <TouchableOpacity key={item.id} style={styles.shopRow}>
                  <Image source={{ uri: item.logo }} style={styles.shopLogo} />
                  
                  <View style={styles.shopDetails}>
                    <View style={styles.shopNameRow}>
                      <Text style={styles.shopName}>{item.name}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.category) + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: getTypeColor(item.category) }]}>{item.type}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.shopCategory}>{item.category} • {item.subCategory}</Text>
                    
                    <View style={styles.locationRow}>
                      <Image source={{ uri: `https://flagcdn.com/w20/${item.flagCode}.png` }} style={styles.smallFlag} />
                      <Text style={styles.locationText}>{item.city}, {item.country} • {item.distance}</Text>
                      
                      <View style={{flex: 1}} />
                      
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating} <Text style={styles.reviewsText}>({item.reviews})</Text></Text>
                      </View>
                    </View>
                    
                    <View style={styles.badgesRow}>
                      {item.badges.map((badge, idx) => (
                        <View key={idx} style={[styles.serviceBadge, { backgroundColor: getBadgeColor(badge) + '20' }]}>
                          <Text style={[styles.serviceBadgeText, { color: getBadgeColor(badge) }]}>{badge}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <Ionicons name="chevron-forward" size={20} color="#A0AABF" style={styles.shopChevron} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Promotional Banner */}
          <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Découvrez les <Text style={styles.promoTitleHighlight}>DZYStores</Text>{'\n'}de confiance autour de vous</Text>
              <Text style={styles.promoSubtitle}>Payez par cartes, stablecoins, DZY{'\n'}et Mobile Money.</Text>
              <TouchableOpacity style={styles.promoButton}>
                <Text style={styles.promoButtonText}>Explorer les shops</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoGraphic}>
              <Ionicons name="location" size={24} color="#FFC759" style={styles.promoPin} />
              <View style={styles.promoPhone}>
                <View style={styles.promoAwning}>
                  <View style={styles.awningStripeYellow} />
                  <View style={styles.awningStripeWhite} />
                  <View style={styles.awningStripeYellow} />
                  <View style={styles.awningStripeWhite} />
                  <View style={styles.awningStripeYellow} />
                </View>
                <View style={styles.promoCoin}>
                  <Text style={styles.promoCoinText}>D</Text>
                  <View style={styles.promoCoinStrike} />
                </View>
              </View>
              <TouchableOpacity style={styles.closeBannerButton}>
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sub Navigation */}
          <View style={styles.subNavigation}>
            <TouchableOpacity style={[styles.subNavTab, activeSubNav === 'Mes shops' && styles.subNavTabActive]} onPress={() => setActiveSubNav('Mes shops')}>
              <Ionicons name="storefront" size={16} color={activeSubNav === 'Mes shops' ? "#1A2840" : "#8B92A5"} />
              <Text style={[styles.subNavText, activeSubNav === 'Mes shops' && styles.subNavTextActive]}>Mes shops</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.subNavTab, activeSubNav === 'Nouveaux shops' && styles.subNavTabActive]} onPress={() => setActiveSubNav('Nouveaux shops')}>
              <Ionicons name="analytics-outline" size={16} color={activeSubNav === 'Nouveaux shops' ? "#1A2840" : "#8B92A5"} />
              <Text style={[styles.subNavText, activeSubNav === 'Nouveaux shops' && styles.subNavTextActive]}>Nouveaux shops</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.subNavTab, activeSubNav === 'Catégories' && styles.subNavTabActive]} onPress={() => setActiveSubNav('Catégories')}>
              <Ionicons name="grid-outline" size={16} color={activeSubNav === 'Catégories' ? "#1A2840" : "#8B92A5"} />
              <Text style={[styles.subNavText, activeSubNav === 'Catégories' && styles.subNavTextActive]}>Catégories</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.subNavTab, activeSubNav === 'Activité' && styles.subNavTabActive]} onPress={() => setActiveSubNav('Activité')}>
              <Ionicons name="time-outline" size={16} color={activeSubNav === 'Activité' ? "#1A2840" : "#8B92A5"} />
              <Text style={[styles.subNavText, activeSubNav === 'Activité' && styles.subNavTextActive]}>Activité</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
        
        <BottomNavBar 
          activeTab="Boutiques" 
          isMenuOpen={isMenuOpen} 
          onCenterButtonPress={() => setIsMenuOpen(!isMenuOpen)} 
        />
      </View>
    </SafeAreaView>
  );
}

// Helper functions for colors
function getTypeColor(category) {
  switch(category) {
    case 'Marketplace': return '#9333EA'; // Purple
    case 'Supermarché': return '#10B981'; // Green
    case 'Restaurant': return '#F59E0B'; // Orange
    case 'Électronique': return '#3B82F6'; // Blue
    case 'Santé': return '#10B981'; // Green
    default: return '#6B7280';
  }
}

function getBadgeColor(badge) {
  switch(badge) {
    case 'Delivery': return '#10B981'; // Green
    case 'Picking': return '#3B82F6'; // Blue
    case 'On-line': return '#9333EA'; // Purple
    case 'On-site': return '#F59E0B'; // Orange
    default: return '#6B7280';
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dizzitText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  upText: {
    color: '#F59E0B',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 20,
  },
  mainTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  topTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 20,
  },
  topTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  topTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFC759',
  },
  topTabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8B92A5',
  },
  topTabTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24, // More rounded like a pill
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8B92A5',
    flex: 1,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  quickActionCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 8,
    alignItems: 'center',
  },
  qaIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  qaTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 4,
    height: 24,
  },
  qaDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 6,
    color: '#8B92A5',
    textAlign: 'center',
    lineHeight: 8,
  },
  shopsSection: {
    marginBottom: 24,
  },
  shopsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginRight: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#1A2840',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  shopRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  shopLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  shopDetails: {
    flex: 1,
  },
  shopNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  shopName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#1A2840',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
  },
  shopCategory: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  smallFlag: {
    width: 14,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    marginLeft: 4,
  },
  reviewsText: {
    fontFamily: 'Inter_400Regular',
    color: '#8B92A5',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  shopChevron: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  promoBanner: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    zIndex: 2,
  },
  promoTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
  },
  promoTitleHighlight: {
    color: '#FFC759',
  },
  promoSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#9CA3AF',
    lineHeight: 14,
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: '#FFC759',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  promoButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  promoGraphic: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  promoPin: {
    position: 'absolute',
    right: 10,
    top: 20,
    zIndex: 3,
  },
  promoPhone: {
    width: 50,
    height: 80,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoAwning: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    flexDirection: 'row',
  },
  awningStripeYellow: {
    flex: 1,
    backgroundColor: '#FFC759',
  },
  awningStripeWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  promoCoin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoCoinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#FFC759',
  },
  promoCoinStrike: {
    position: 'absolute',
    width: 16,
    height: 1,
    backgroundColor: '#FFC759',
    transform: [{ rotate: '-45deg' }],
  },
  closeBannerButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 4,
  },
  subNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subNavTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  subNavTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFC759',
  },
  subNavText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8B92A5',
  },
  subNavTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
  }
});
