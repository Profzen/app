import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

const quickActions = [
  { id: '1', title: "Réfer a\nbusiness/Shop", subtitle: "Partagez et\nsoutenez le\ncommerce", icon: "add-outline", color: "#F59E0B", iconBg: '#FFFBEB' },
  { id: '2', title: "Mes shops", subtitle: "Voir les shops avec\nlesquels je traite", icon: "bag-handle-outline", color: "#10B981", iconBg: '#ECFDF5' },
  { id: '3', title: "Shops à\nproximité", subtitle: "Découvrez les shops\nprès de vous", icon: "location-outline", color: "#3B82F6", iconBg: '#EFF6FF' },
  { id: '4', title: "Nouveaux\nshops", subtitle: "Nouveaux shops\nde nos CEOs", icon: "storefront-outline", color: "#8B5CF6", iconBg: '#F5F3FF' },
];

const FILTER_ITEMS = [
  { id: 'Tout', label: 'À proximité', icon: 'location-outline', iconColor: '#1A2840' },
  { id: 'Mobile', label: 'Mobile & Utilities', icon: 'phone-portrait-outline', iconColor: '#8B5CF6' },
  { id: 'Électronique', label: 'Digital & Services', icon: 'laptop-outline', iconColor: '#3B82F6' },
  { id: 'Goods', label: 'Goods', icon: 'bag-handle-outline', iconColor: '#10B981' },
];

const shopsList = [
  {
    id: '1',
    name: 'Jumia Sénégal',
    logoBg: '#FF5500',
    logoText: 'JUMIA',
    type: 'Marketplace  •  Shopping',
    location: 'Dakar, Sénégal',
    distance: '1.2 km',
    flag: '🇸🇳',
    badges: [
      { text: 'Pickup', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'On-site', color: '#8B5CF6', bg: '#F5F3FF' },
    ],
    category: 'Marketplace',
    categoryColor: '#8B5CF6',
    categoryBg: '#F5F3FF',
    rating: '4.6',
    reviews: '2,219',
  },
  {
    id: '2',
    name: 'Kiwi Cameroun',
    logoBg: '#10B981',
    logoText: 'kiwi',
    type: 'Supermarché  •  Épicerie',
    location: 'Douala, Cameroun',
    distance: '3.5 km',
    flag: '🇨🇲',
    badges: [
      { text: 'Pickup', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'On-site', color: '#F59E0B', bg: '#FFFBEB' },
    ],
    category: 'Supermarché',
    categoryColor: '#10B981',
    categoryBg: '#ECFDF5',
    rating: '4.4',
    reviews: '3,182',
  },
  {
    id: '3',
    name: 'Mamasita Restaurante',
    logoBg: '#000000',
    logoText: 'm.',
    type: 'Restaurant  •  Cuisine africaine',
    location: "Abidjan, Côte d'Ivoire",
    distance: '2.1 km',
    flag: '🇨🇮',
    badges: [
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'On-site', color: '#F59E0B', bg: '#FFFBEB' },
    ],
    category: 'Restaurant',
    categoryColor: '#F59E0B',
    categoryBg: '#FFFBEB',
    rating: '4.8',
    reviews: '645',
  },
  {
    id: '4',
    name: 'Yello Store Ghana',
    logoBg: '#FFC759',
    logoText: 'Yello\nStore',
    type: 'Electronique  •  High tech',
    location: 'Accra, Ghana',
    distance: '4.0 km',
    flag: '🇬🇭',
    badges: [
      { text: 'Pickup', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
    ],
    category: 'Électronique',
    categoryColor: '#3B82F6',
    categoryBg: '#EFF6FF',
    rating: '4.5',
    reviews: '965',
  },
  {
    id: '5',
    name: 'Pharma Plus',
    logoBg: '#071D54',
    logoText: '+ Pharma\nPlus',
    type: 'Santé  •  Pharmacie',
    location: 'Lagos, Nigeria',
    distance: '6.3 km',
    flag: '🇳🇬',
    badges: [
      { text: 'On-site', color: '#8B5CF6', bg: '#F5F3FF' },
    ],
    category: 'Pharmacie',
    categoryColor: '#10B981',
    categoryBg: '#ECFDF5',
    rating: '4.7',
    reviews: '1,504',
  },
  {
    id: '6',
    name: 'Kemi African Fashion',
    logoBg: '#EC4899',
    logoText: 'KEMI',
    type: 'Mode & Créateur  •  Artisanat',
    location: "Abidjan, Côte d'Ivoire",
    distance: '1.8 km',
    flag: '🇨🇮',
    badges: [
      { text: 'Pickup', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
    ],
    category: 'Goods',
    categoryColor: '#EC4899',
    categoryBg: '#FCE7F3',
    rating: '4.9',
    reviews: '540',
  },
  {
    id: '7',
    name: 'Shoprite Ghana',
    logoBg: '#DC2626',
    logoText: 'SHOPRITE',
    type: 'Supermarché  •  Grande Surface',
    location: 'Accra, Ghana',
    distance: '4.2 km',
    flag: '🇬🇭',
    badges: [
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'On-site', color: '#F59E0B', bg: '#FFFBEB' },
    ],
    category: 'Supermarché',
    categoryColor: '#10B981',
    categoryBg: '#ECFDF5',
    rating: '4.6',
    reviews: '850',
  },
  {
    id: '8',
    name: 'DZY Official Store',
    logoBg: '#8B5CF6',
    logoText: 'DZY\nStore',
    type: 'Boutique Officielle  •  DizzitUp Partner',
    location: 'Lomé, Togo & Multi-Pays',
    distance: '0.5 km',
    flag: '🇹🇬',
    badges: [
      { text: 'Pickup', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
      { text: 'On-site', color: '#8B5CF6', bg: '#F5F3FF' },
    ],
    category: 'Électronique',
    categoryColor: '#8B5CF6',
    categoryBg: '#F5F3FF',
    rating: '5.0',
    reviews: '3,100',
  },
  {
    id: '9',
    name: 'AfriMarket Cotonou',
    logoBg: '#059669',
    logoText: 'Afri\nMarket',
    type: 'Alimentation  •  Supermarché',
    location: 'Cotonou, Bénin',
    distance: '5.1 km',
    flag: '🇧🇯',
    badges: [
      { text: 'Delivery', color: '#10B981', bg: '#ECFDF5' },
    ],
    category: 'Goods',
    categoryColor: '#059669',
    categoryBg: '#D1FAE5',
    rating: '4.7',
    reviews: '412',
  },
  {
    id: '10',
    name: 'TechHub Mali',
    logoBg: '#2563EB',
    logoText: 'Tech\nHub',
    type: 'High-Tech  •  Services Digital',
    location: 'Bamako, Mali',
    distance: '3.8 km',
    flag: '🇲🇱',
    badges: [
      { text: 'Pickup', color: '#3B82F6', bg: '#EFF6FF' },
      { text: 'On-site', color: '#8B5CF6', bg: '#F5F3FF' },
    ],
    category: 'Électronique',
    categoryColor: '#2563EB',
    categoryBg: '#DBEAFE',
    rating: '4.5',
    reviews: '280',
  },
];

export default function ShopsScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [activeSubNav, setActiveSubNav] = useState('shops');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [toast, setToast] = useState(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [bannerSlide, setBannerSlide] = useState(1);
  const [displayedCount, setDisplayedCount] = useState(5);

  const filteredShops = shopsList.filter((shop) => shop.name.toLowerCase().includes(query.trim().toLowerCase()) && (activeFilter === 'Tout' || (activeFilter === 'Électronique' ? shop.category === 'Électronique' : activeFilter === 'Goods' ? ['Marketplace','Supermarché'].includes(shop.category) : true)));
  const visibleShops = filteredShops.slice(0, displayedCount);

  const handleLoadMore = () => {
    if (displayedCount >= filteredShops.length) {
      setToast({ title: language === 'fr' ? 'Toutes les boutiques' : 'All Shops Loaded', message: language === 'fr' ? 'Toutes les boutiques partenaires sont actuellement affichées.' : 'All partner shops are currently displayed.' });
    } else {
      setDisplayedCount(prev => prev + 5);
    }
  };

  const runQuickAction = (id) => { if (id === '1') setToast({title: language === 'fr' ? 'Référencement démarré' : 'Referral started', message: language === 'fr' ? 'Le formulaire de recommandation est prêt.' : 'The referral form is ready.'}); else if (id === '2') setActiveSubNav('shops'); else if (id === '3') {setActiveFilter('Tout');setToast({title: language === 'fr' ? 'À proximité' : 'Nearby', message: language === 'fr' ? 'Les commerces sont classés selon votre position simulée.' : 'Shops sorted by your location.'});} else setActiveSubNav('new'); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.circleLogo} />
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot}>
                <Text style={{color: '#FFFFFF', fontSize: 7, fontWeight: 'bold', textAlign: 'center'}}>1</Text>
              </View>
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
          
          <Text style={styles.mainTitle}>{t('shopsTitle', 'Shops')}</Text>
          <Text style={styles.subtitle}>{t('shopsSubtitle', 'Découvrez, payez et soutenez les entreprises africaines.')}</Text>
          <Text style={styles.acceptedTokensText}>
            <Text style={{color: '#3B82F6'}}>Cards</Text>  •  <Text style={{color: '#3B82F6'}}>Stablecoins</Text>  •  <Text style={{color: '#3B82F6'}}>Mobile Money</Text>  accepted
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('shopsSearchPlaceholder', 'Rechercher par nom, ville, pays ou catégorie...')}
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Actions rapides */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard} onPress={() => runQuickAction(action.id)}>
                <View style={[styles.quickActionIconContainer, {backgroundColor: action.iconBg}]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mes shops */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{language === 'fr' ? 'Mes shops' : 'My Shops'}</Text>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={handleLoadMore}>
              <Text style={styles.showAllText}>{language === 'fr' ? 'Voir plus' : 'See more'}</Text>
              <Ionicons name="chevron-down" size={14} color="#1A2840" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {FILTER_ITEMS.map((item) => {
              const isActive = activeFilter === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.filterChip,
                    isActive ? styles.filterChipActive : null
                  ]}
                  onPress={() => setActiveFilter(item.id)}
                >
                  <Ionicons
                    name={item.icon}
                    size={15}
                    color={isActive ? '#FFFFFF' : item.iconColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive ? styles.filterChipTextActive : null
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[styles.filterChip, { paddingHorizontal: 10 }]}>
              <Ionicons name="options-outline" size={16} color="#1A2840" />
            </TouchableOpacity>
          </ScrollView>

          {/* Shops List */}
          <View style={styles.shopsList}>
            {visibleShops.map((shop, index) => (
              <View key={shop.id}>
                <TouchableOpacity style={styles.shopItem} onPress={() => navigation.navigate('ShopDetailsScreen', { shop: shop })}>
                  
                  {/* Logo */}
                  <View style={[styles.shopLogo, {backgroundColor: shop.logoBg}]}>
                    <Text style={[styles.shopLogoText, shop.id === '4' || shop.id === '5' ? {fontSize: 8} : {}]}>
                      {shop.logoText}
                    </Text>
                  </View>

                  {/* Info Central */}
                  <View style={styles.shopContent}>
                    <View style={styles.shopTitleRow}>
                      <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                      <Text style={styles.shopFlag}> {shop.flag}</Text>
                    </View>
                    <Text style={styles.shopType} numberOfLines={1}>{shop.type}</Text>
                    <Text style={styles.shopLocation}>{shop.location} • {shop.distance}</Text>
                    
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
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{marginTop: 10}} />
                  </View>

                </TouchableOpacity>
                {index < visibleShops.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Button Voir plus at the bottom of shop list */}
          {displayedCount < filteredShops.length && (
            <TouchableOpacity 
              style={{
                marginHorizontal: 16,
                marginVertical: 12,
                paddingVertical: 12,
                backgroundColor: '#F1F5F9',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#CBD5E1'
              }}
              onPress={handleLoadMore}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E293B', marginRight: 6 }}>
                {language === 'fr' ? `Voir plus (${filteredShops.length - displayedCount} restantes)` : `See more (${filteredShops.length - displayedCount} remaining)`}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#1E293B" />
            </TouchableOpacity>
          )}

          {/* Refer Banner CTA at bottom */}
          {isBannerVisible && (
            <View style={styles.bannerContainer}>
              <View style={[styles.inviteBanner, { backgroundColor: '#F0FDF4' }]}>
                <TouchableOpacity style={styles.closeBannerButton} onPress={() => setIsBannerVisible(false)}>
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.inviteContent}>
                  <Text style={styles.inviteTitle}>Refer a Store or Business{'\n'}and earn <Text style={{ color: '#10B981' }}>$10 in DZY</Text></Text>
                  <Text style={styles.inviteSubtitle}>Refer a store or business{'\n'}and earn rewards.</Text>
                  <TouchableOpacity style={[styles.inviteButton, { backgroundColor: '#10B981' }]} onPress={() => setToast({title: 'Refer a store', message: 'Formulaire de parrainage prêt.'})}>
                    <Text style={styles.inviteButtonText}>Refer now</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.storeGraphic}>
                  <View style={styles.storeBuilding}>
                    <View style={styles.storeAwning}><Text style={styles.storeAwningText}>DZY</Text></View>
                    <View style={styles.storeFront}>
                      <View style={styles.storeDoor} />
                      <View style={styles.storeWindow} />
                    </View>
                  </View>
                  <View style={styles.storeCoin}><Text style={styles.storeCoinText}>DZY</Text></View>
                </View>
              </View>
              <View style={styles.carouselDotsContainer}>
                <TouchableOpacity onPress={() => setBannerSlide(0)}><View style={[styles.carouselDot, bannerSlide === 0 ? styles.activeDot : styles.inactiveDot]} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setBannerSlide(1)}><View style={[styles.carouselDot, bannerSlide === 1 ? styles.activeDot : styles.inactiveDot]} /></TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <BottomNavBar activeTab="shops" language="fr" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 10, paddingBottom: 6 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  circleLogo: { width: 34, height: 34, borderRadius: 17 },
  headerRightIcons: { flexDirection: 'row' },
  iconBtnRight: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginLeft: 8, position: 'relative' },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 4, paddingBottom: 30 },
  mainTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 26, color: '#1A2840', paddingHorizontal: 16, marginBottom: 2 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', paddingHorizontal: 16, marginBottom: 4 },
  acceptedTokensText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', paddingHorizontal: 16, marginBottom: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, height: 42, marginHorizontal: 16, marginBottom: 18 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#1A2840', outlineStyle: 'none' },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', paddingHorizontal: 16, marginBottom: 10 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 18 },
  quickActionCard: { width: '23.5%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F3F7', borderRadius: 14, padding: 8, alignItems: 'center', minHeight: 110, justifyContent: 'flex-start' },
  quickActionIconContainer: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickActionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#1A2840', textAlign: 'center', marginBottom: 2, lineHeight: 12 },
  quickActionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 8, color: '#9CA3AF', textAlign: 'center', lineHeight: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  showAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  filtersScroll: { paddingHorizontal: 16, marginBottom: 14 },
  filterChipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2840', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 8 },
  filterChipTextActive: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 8 },
  filterChipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#1A2840' },
  shopsList: { paddingHorizontal: 16, marginBottom: 16 },
  shopItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', paddingVertical: 12 },
  shopLogo: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  shopLogoText: { color: '#FFFFFF', fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, textAlign: 'center' },
  shopContent: { flex: 1 },
  shopName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 1 },
  shopType: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#6B7280', marginBottom: 2 },
  shopLocation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9CA3AF', marginBottom: 6 },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  shopRight: { alignItems: 'flex-end' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  categoryBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#1A2840' },
  reviewsText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  bannerContainer: { marginHorizontal: 16, marginTop: 4, position: 'relative' },
  inviteBanner: { borderRadius: 17, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', overflow: 'hidden', position: 'relative', minHeight: 125 },
  inviteContent: { flex: 1, zIndex: 2, justifyContent: 'center' },
  inviteTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', lineHeight: 18, marginBottom: 3 },
  inviteSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 13, marginBottom: 8 },
  inviteButton: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  inviteButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#FFFFFF' },
  storeGraphic: { width: '45%', height: '100%', position: 'absolute', right: 5, top: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  storeBuilding: { width: 72, height: 68, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB', overflow: 'hidden', position: 'relative' },
  storeAwning: { backgroundColor: '#10B981', height: 20, justifyContent: 'center', alignItems: 'center' },
  storeAwningText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#FFFFFF' },
  storeFront: { flex: 1, backgroundColor: '#FAFAFA', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 4, paddingHorizontal: 6 },
  storeDoor: { width: 20, height: 30, backgroundColor: '#059669', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  storeWindow: { width: 24, height: 22, backgroundColor: '#E0F2FE', borderRadius: 4, borderWidth: 1.5, borderColor: '#38BDF8' },
  storeCoin: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFC759', borderWidth: 2, borderColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 4, bottom: 10 },
  storeCoinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#FFFFFF' },
  closeBannerButton: { position: 'absolute', top: 10, right: 12, zIndex: 10 },
  carouselDotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 6, left: 0, right: 0, gap: 5 },
  carouselDot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: '#10B981', width: 7, height: 7, borderRadius: 3.5 },
  inactiveDot: { backgroundColor: '#D1D5DB' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
});
