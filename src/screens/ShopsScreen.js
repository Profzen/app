import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

const quickActions = [
  { id: '1', title: "Référer\nun business", subtitle: "Participez au\ncommerce", icon: "add", color: "#F59E0B", iconBg: '#FFFBEB' },
  { id: '2', title: "Mes shops", subtitle: "Voir les shops avec\nlesquels je traite", icon: "bag-handle-outline", color: "#10B981", iconBg: '#ECFDF5' },
  { id: '3', title: "Shops à\nproximité", subtitle: "Découvrez les shops\nprès de vous", icon: "location-outline", color: "#3B82F6", iconBg: '#EFF6FF' },
  { id: '4', title: "Nouveaux\nshops", subtitle: "Nouveaux shops\nde mes COIs", icon: "storefront-outline", color: "#8B5CF6", iconBg: '#F5F3FF' },
];

const shopsList = [
  {
    id: '1',
    name: 'Jumia Sénégal',
    logoBg: '#FF7A00',
    logoText: 'JUMIA',
    type: 'Marketplace • Shopping',
    location: 'Dakar, Sénégal',
    distance: '1,5 km',
    flag: '🇸🇳',
    badges: [
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'Picking', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'On-line', color: '#8B5CF6', bg: '#F5F3FF' },
    ],
    category: 'Marketplace',
    categoryColor: '#8B5CF6',
    categoryBg: '#F5F3FF',
    rating: '4.6',
    reviews: '3,235',
  },
  {
    id: '2',
    name: 'Kiwi Cameroun',
    logoBg: '#10B981',
    logoText: 'KIWI',
    type: 'Supermarché • Épicerie',
    location: 'Douala, Cameroun',
    distance: '3,5 km',
    flag: '🇨🇲',
    badges: [
      { text: 'Picking', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'On-site', color: '#F59E0B', bg: '#FFFBEB' },
    ],
    category: 'Supermarché',
    categoryColor: '#10B981',
    categoryBg: '#ECFDF5',
    rating: '4.4',
    reviews: '1,826',
  },
  {
    id: '3',
    name: 'Mamasita Restaurant',
    logoBg: '#1A2840',
    logoText: 'm.',
    type: 'Restaurant • Cuisine africaine',
    location: "Abidjan, Côte d'Ivoire",
    distance: '2,1 km',
    flag: '🇨🇮',
    badges: [
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'On-site', color: '#F59E0B', bg: '#FFFBEB' },
    ],
    category: 'Restaurant',
    categoryColor: '#F59E0B',
    categoryBg: '#FFFBEB',
    rating: '4.8',
    reviews: '948',
  },
  {
    id: '4',
    name: 'Yello Store Ghana',
    logoBg: '#FFB800',
    logoText: 'Yello\nStore',
    type: 'Électronique • High-tech',
    location: 'Accra, Ghana',
    distance: '4,0 km',
    flag: '🇬🇭',
    badges: [
      { text: 'Picking', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
    ],
    category: 'Électronique',
    categoryColor: '#3B82F6',
    categoryBg: '#EFF6FF',
    rating: '4.5',
    reviews: '748',
  },
  {
    id: '5',
    name: 'Pharma Plus',
    logoBg: '#0A1128',
    logoText: 'Pharma\nPlus',
    logoIcon: '+', // simple representation
    type: 'Santé • Pharmacie',
    location: 'Lagos, Nigeria',
    distance: '6,3 km',
    flag: '🇳🇬',
    badges: [
      { text: 'On-line', color: '#8B5CF6', bg: '#F5F3FF' },
    ],
    category: 'Pharmacie',
    categoryColor: '#10B981',
    categoryBg: '#ECFDF5',
    rating: '4.7',
    reviews: '1,564',
  },
];

export default function ShopsScreen() {
  const navigation = useNavigation();
  const [activeSubNav, setActiveSubNav] = useState('shops');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [toast, setToast] = useState(null);
  const visibleShops = shopsList.filter((shop) => shop.name.toLowerCase().includes(query.trim().toLowerCase()) && (activeFilter === 'Tout' || (activeFilter === 'Électronique' ? shop.category === 'Électronique' : activeFilter === 'Goods' ? ['Marketplace','Supermarché'].includes(shop.category) : true)));
  const runQuickAction = (id) => { if (id === '1') setToast({title: 'Référencement démarré', message: 'Le formulaire de recommandation est prêt.'}); else if (id === '2') setActiveSubNav('shops'); else if (id === '3') {setActiveFilter('Tout');setToast({title: 'À proximité', message: 'Les commerces sont classés selon votre position simulée.'});} else setActiveSubNav('new'); };
  const simulateDownload = (name) => { setToast({title: 'Téléchargement en cours', message: `${name} est en préparation…`}); setTimeout(() => setToast({title: 'Téléchargement terminé', message: `${name} a été téléchargé (simulation).`}), 900); };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.mainTitle}>Shops</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot}>
                <Text style={{color: '#FFFFFF', fontSize: 6, fontWeight: 'bold', textAlign: 'center'}}>1</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          
          <Text style={styles.subtitle}>Découvrez, payez et soutenez les entreprises africaines.</Text>
          <Text style={styles.acceptedTokensText}>
            <Text style={{color: '#10B981'}}>USDT</Text>, <Text style={{color: '#3B82F6'}}>USDC</Text>, <Text style={{color: '#3B82F6'}}>EURC</Text>, <Text style={{color: '#F59E0B'}}>DZY</Text> accepted »
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher en Afrique (shops, produits, services...)"
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Actions rapides */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard} onPress={() => runQuickAction(action.id)}>
                <View style={[styles.quickActionIconContainer, {backgroundColor: action.iconBg}]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Mes shops */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mes shops</Text>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => setActiveSubNav('shops')}>
              <Text style={styles.showAllText}>Voir tout</Text>
              <Ionicons name="arrow-forward" size={16} color="#1A2840" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity style={activeFilter === 'Tout' ? styles.filterChipActive : styles.filterChip} onPress={() => setActiveFilter('Tout')}>
              <Ionicons name="location-outline" size={16} color="#FFFFFF" style={{marginRight: 6}} />
              <Text style={activeFilter === 'Tout' ? styles.filterChipTextActive : styles.filterChipText}>À proximité</Text>
            </TouchableOpacity>
            <TouchableOpacity style={activeFilter === 'Mobile' ? styles.filterChipActive : styles.filterChip} onPress={() => setActiveFilter('Mobile')}>
              <Ionicons name="phone-portrait-outline" size={16} color="#8B5CF6" style={{marginRight: 6}} />
              <Text style={styles.filterChipText}>Mobile & Utilities</Text>
            </TouchableOpacity>
            <TouchableOpacity style={activeFilter === 'Électronique' ? styles.filterChipActive : styles.filterChip} onPress={() => setActiveFilter('Électronique')}>
              <Ionicons name="laptop-outline" size={16} color="#3B82F6" style={{marginRight: 6}} />
              <Text style={styles.filterChipText}>Digital & Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={activeFilter === 'Goods' ? styles.filterChipActive : styles.filterChip} onPress={() => setActiveFilter('Goods')}>
              <Ionicons name="bag-handle-outline" size={16} color="#10B981" style={{marginRight: 6}} />
              <Text style={styles.filterChipText}>Goods</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, {paddingHorizontal: 12}]}>
              <Ionicons name="options-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
          </ScrollView>

          {/* Shops List */}
          {activeSubNav !== 'shops' && (
            <View style={{marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: '#FFF7E6'}}>
              <Text style={{fontFamily: 'Inter_700Bold', color: '#1A2840'}}>{activeSubNav === 'new' ? 'Nouveaux shops' : 'Catégories de shops'}</Text>
              <Text style={{fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 3}}>{activeSubNav === 'new' ? 'Découvrez les commerces récemment ajoutés.' : 'Parcourez les commerces par catégorie.'}</Text>
            </View>
          )}
          <View style={styles.shopsList}>
            {visibleShops.map((shop, index) => (
              <View key={shop.id}>
            <TouchableOpacity style={styles.shopItem} onPress={() => navigation.navigate('ShopDetailsScreen')}>
                  
                  {/* Logo */}
                  <View style={[styles.shopLogo, {backgroundColor: shop.logoBg}]}>
                    {shop.logoIcon && <Text style={{color: '#FFB800', fontSize: 16, fontWeight: 'bold'}}>{shop.logoIcon}</Text>}
                    <Text style={[styles.shopLogoText, shop.id === '4' || shop.id === '5' ? {fontSize: 8} : {}]}>
                      {shop.logoText}
                    </Text>
                  </View>

                  {/* Content */}
                  <View style={styles.shopContent}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.shopType}>{shop.type}</Text>
                    <Text style={styles.shopLocation}>{shop.flag} {shop.location} • {shop.distance}</Text>
                    
                    <View style={styles.badgesContainer}>
                      {shop.badges.map((badge, bIndex) => (
                        <View key={bIndex} style={[styles.badge, {backgroundColor: badge.bg}]}>
                          <Text style={[styles.badgeText, {color: badge.color}]}>{badge.text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Right side (Category, Rating, Chevron) */}
                  <View style={styles.shopRight}>
                    <View style={[styles.categoryBadge, {backgroundColor: shop.categoryBg}]}>
                      <Text style={[styles.categoryBadgeText, {color: shop.categoryColor}]}>{shop.category}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}> {shop.rating}</Text>
                      <Text style={styles.reviewsText}> ({shop.reviews})</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#1A2840" style={{marginTop: 8}} />
                  </View>

                </TouchableOpacity>
                {index < visibleShops.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Promo Banners */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
            {/* Banner 1 */}
            <View style={styles.promoCard}>
              <View style={styles.promoLeft}>
                {/* Abstract illustration for shop */}
                <View style={styles.mockShopImg}>
                  <View style={styles.mockShopRoof} />
                  <View style={styles.mockShopDoor} />
                  <View style={styles.mockShopWindow} />
                </View>
              </View>
              <View style={styles.promoRight}>
                <Text style={styles.promoTitle}>DZY Store</Text>
                <TouchableOpacity style={styles.promoBtn} onPress={() => simulateDownload('DZY Store')}>
                  <Ionicons name="download-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Banner 2 */}
            <View style={styles.promoCard}>
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.promoTokensTitle}>
                  USDT, USDC,{'\n'}<Text style={{color: '#3B82F6'}}>EURC</Text>, <Text style={{color: '#F59E0B'}}>DZY</Text> accepted »
                </Text>
                <View style={styles.promoTokensIcons}>
                  {['USDT','USDC','EURC','DZY'].map((symbol) => <CryptoIcon key={symbol} symbol={symbol} size={20} style={{marginHorizontal: 4}} />)}
                </View>
                <View style={styles.promoTokensLabels}>
                  <Text style={styles.tokenLabel}>USDT</Text>
                  <Text style={styles.tokenLabel}>USDC</Text>
                  <Text style={styles.tokenLabel}>EURC</Text>
                  <Text style={styles.tokenLabel}>DZY</Text>
                </View>
              </View>
            </View>

            {/* Banner 3 */}
            <View style={styles.promoCard}>
              <View style={styles.promoLeft}>
                <Ionicons name="location" size={48} color="#FFB800" />
              </View>
              <View style={styles.promoRight}>
                <Text style={styles.promoTitle}>Nous sommes ici</Text>
                <TouchableOpacity style={styles.promoBtn} onPress={() => simulateDownload('Nous sommes ici')}>
                  <Ionicons name="download-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

        </ScrollView>

        {/* Shops Sub-nav */}
        <View style={styles.shopsSubNav}>
          <TouchableOpacity style={styles.subNavItem} onPress={() => setActiveSubNav('shops')}>
            <Ionicons name="storefront-outline" size={20} color={activeSubNav === 'shops' ? '#1A2840' : '#94A3B8'} />
            <Text style={activeSubNav === 'shops' ? styles.subNavItemTextActive : styles.subNavItemText}>Mes shops</Text>
            {activeSubNav === 'shops' && <View style={styles.activeLine} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.subNavItem} onPress={() => setActiveSubNav('new')}>
            <Ionicons name="business-outline" size={20} color={activeSubNav === 'new' ? '#1A2840' : '#94A3B8'} />
            <Text style={activeSubNav === 'new' ? styles.subNavItemTextActive : styles.subNavItemText}>Nouveaux shops</Text>
            {activeSubNav === 'new' && <View style={styles.activeLine} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.subNavItem} onPress={() => setActiveSubNav('categories')}>
            <Ionicons name="grid-outline" size={20} color={activeSubNav === 'categories' ? '#1A2840' : '#94A3B8'} />
            <Text style={activeSubNav === 'categories' ? styles.subNavItemTextActive : styles.subNavItemText}>Catégories</Text>
            {activeSubNav === 'categories' && <View style={styles.activeLine} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.subNavItem} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
            <Ionicons name="time-outline" size={20} color="#94A3B8" />
            <Text style={styles.subNavItemText}>Activité</Text>
          </TouchableOpacity>
        </View>

        <BottomNavBar activeTab="shops" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    paddingTop: 12,
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
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 80, // for sub nav
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#0A1128',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  acceptedTokensText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
    padding: 0,
    outlineStyle: 'none',
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
    justifyContent: 'flex-start',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    backgroundColor: '#0A1128',
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
    color: '#1A2840',
  },
  shopsList: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  shopLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopLogoText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    textAlign: 'center',
  },
  shopContent: {
    flex: 1,
  },
  shopName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  shopType: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
    marginBottom: 2,
  },
  shopLocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
  },
  shopRight: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1A2840',
  },
  reviewsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  promoScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  promoCard: {
    width: 220,
    height: 100,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A', // yellowish border
    borderRadius: 16,
    marginRight: 12,
    padding: 12,
  },
  promoLeft: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promoRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  promoTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 12,
  },
  promoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockShopImg: {
    width: 50,
    height: 60,
    backgroundColor: '#0A1128',
    position: 'relative',
  },
  mockShopRoof: {
    position: 'absolute',
    top: -10,
    left: -5,
    right: -5,
    height: 15,
    backgroundColor: '#FFB800',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  mockShopDoor: {
    position: 'absolute',
    bottom: 0,
    left: 5,
    width: 15,
    height: 30,
    backgroundColor: '#FFB800',
  },
  mockShopWindow: {
    position: 'absolute',
    top: 15,
    right: 5,
    width: 15,
    height: 15,
    backgroundColor: '#3B82F6',
  },
  promoTokensTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
  },
  promoTokensIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tokenIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  promoTokensLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tokenLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#1A2840',
    marginHorizontal: 6,
  },
  shopsSubNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
  },
  subNavItem: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  subNavItemTextActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1A2840',
    marginTop: 4,
  },
  subNavItemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  activeLine: {
    position: 'absolute',
    bottom: -12, // adjust based on padding
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#FFB800',
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
});
