import React, { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Platform, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import { SHOPS_MOCK } from '../mocks/shopsMock';
import { useApp } from '../context/AppContext';

const ADDITIONAL_SHOPS = [
  {
    id: 'kemi-fashion-ci',
    name: 'Kemi African Fashion',
    category: 'Mode & Artisanat',
    type: 'Boutique Créateur',
    rating: 4.9,
    reviewsCount: 540,
    verified: true,
    sinceYear: 2020,
    location: 'Abidjan, Côte d\'Ivoire',
    flag: '🇨🇮',
    deliveryTime: '24-48h',
    hasDelivery: true,
    hasOnline: true,
    hasPickup: true,
    acceptedCryptos: ['USDT', 'USDC', 'DZY'],
    coverImage: require('../../assets/promo_shop.png'),
    logoImage: require('../../assets/brand/dizzitup_logo_cercle.png'),
    description: 'Boutique spécialisée en vêtements et accessoires en tissus pagne et wax traditionnels fait main.',
    workingHours: 'Lun - Sam: 09:00 - 19:30',
  },
  {
    id: 'express-market-cm',
    name: 'Douala Express Market',
    category: 'Supermarché & Épicerie',
    type: 'Commerce de Proximité',
    rating: 4.5,
    reviewsCount: 310,
    verified: true,
    sinceYear: 2022,
    location: 'Douala, Cameroun',
    flag: '🇨🇲',
    deliveryTime: 'Express 2h',
    hasDelivery: true,
    hasOnline: true,
    hasPickup: true,
    acceptedCryptos: ['USDC', 'EURC', 'DZY'],
    coverImage: require('../../assets/promo_wallet.png'),
    logoImage: require('../../assets/brand/dizzitup_logo_cercle.png'),
    description: 'Produits alimentaires locaux, cosmétiques africains et produits ménagers livrés rapidement à Douala.',
    workingHours: 'Lun - Dim: 07:30 - 21:00',
  },
  {
    id: 'nairobi-solar-ke',
    name: 'Nairobi Solar Solutions',
    category: 'Énergie & High-Tech',
    type: 'Fournisseur Agréé',
    rating: 4.8,
    reviewsCount: 780,
    verified: true,
    sinceYear: 2019,
    location: 'Nairobi, Kenya',
    flag: '🇰🇪',
    deliveryTime: '48h',
    hasDelivery: true,
    hasOnline: true,
    hasPickup: false,
    acceptedCryptos: ['USDT', 'USDC', 'BTC', 'DZY'],
    coverImage: require('../../assets/promo_blue_wallet.png'),
    logoImage: require('../../assets/brand/dizzitup_logo_cercle.png'),
    description: 'Kits solaires autonomes, générateurs écologiques et batteries rechargeables payables en stablecoins.',
    workingHours: 'Lun - Ven: 08:00 - 18:00',
  }
];

const ALL_SHOPS_LIST = [...SHOPS_MOCK, ...ADDITIONAL_SHOPS];

export default function AllShopsScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [toast, setToast] = useState(null);

  const CATEGORY_FILTERS = [
    { id: 'Tous', label: t('shopsFilterAll', 'Tous les Shops'), icon: 'storefront-outline' },
    { id: 'À proximité', label: t('shopsFilterNearby', 'À proximité'), icon: 'location-outline' },
    { id: 'Marketplace', label: t('shopsFilterMarketplace', 'Marketplace & High-Tech'), icon: 'laptop-outline' },
    { id: 'Supermarché', label: t('shopsFilterSupermarket', 'Supermarché & Alimentation'), icon: 'cart-outline' },
    { id: 'Mode', label: t('shopsFilterFashion', 'Mode & Créateurs'), icon: 'shirt-outline' },
    { id: 'DZY Partner', label: t('shopsFilterDzyPartner', 'Partenaires DZY'), icon: 'ribbon-outline' },
  ];

  const filteredShops = useMemo(() => {
    return ALL_SHOPS_LIST.filter(shop => {
      const matchesQuery = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shop.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesQuery) return false;

      if (activeFilter === 'Tous') return true;
      if (activeFilter === 'À proximité') return shop.rating >= 4.7;
      if (activeFilter === 'Marketplace') return shop.category.includes('Marketplace') || shop.category.includes('High-Tech');
      if (activeFilter === 'Supermarché') return shop.category.includes('Supermarché') || shop.category.includes('Épicerie');
      if (activeFilter === 'Mode') return shop.category.includes('Mode');
      if (activeFilter === 'DZY Partner') return shop.acceptedCryptos.includes('DZY');

      return true;
    });
  }, [searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeftRow}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Retour"
            >
              <Ionicons name="arrow-back" size={20} color="#1A2840" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>{t('allShopsTitle', 'Tous les Shops')}</Text>
              <Text style={styles.headerSubtitle}>{ALL_SHOPS_LIST.length} {t('allShopsSubtitle', 'marchands partenaires certifiés')}</Text>
            </View>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity 
              style={styles.iconBtnRight}
              onPress={() => setToast({ title: 'Notifications', message: 'Aucune nouvelle alerte pour le moment.' })}
            >
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconBtnRight} 
              onPress={() => navigation.navigate('RewardsScreen')}
            >
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconBtnRight} 
              onPress={() => navigation.navigate('MoreSettingsScreen')}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Search Input */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par nom, ville, pays ou catégorie..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
            {CATEGORY_FILTERS.map(filter => {
              const isActive = activeFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={filter.icon} 
                    size={14} 
                    color={isActive ? '#FFFFFF' : '#64748B'} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Shops Section Header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCountText}>
              <Text style={{ fontFamily: 'Inter_700Bold', color: '#1A2840' }}>{filteredShops.length}</Text> boutiques trouvées
            </Text>
            <TouchableOpacity onPress={() => setToast({ title: 'Tri des boutiques', message: 'Trié par note et pertinence.' })}>
              <Text style={styles.sortText}>Pertinence ▾</Text>
            </TouchableOpacity>
          </View>

          {/* Shops List */}
          {filteredShops.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucune boutique trouvée</Text>
              <Text style={styles.emptySubText}>Essayez de modifier votre recherche ou vos filtres.</Text>
            </View>
          ) : (
            filteredShops.map(shop => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                onPress={() => navigation.navigate('ShopDetailsScreen', { shop })}
                activeOpacity={0.85}
              >
                {/* Shop Cover Banner */}
                <View style={styles.coverWrapper}>
                  <Image source={shop.coverImage} style={styles.coverImage} resizeMode="cover" />
                  <View style={styles.coverOverlay} />
                  <View style={styles.flagBadge}>
                    <Text style={styles.flagText}>{shop.flag} {shop.location}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFB800" style={{ marginRight: 3 }} />
                    <Text style={styles.ratingText}>{shop.rating} ({shop.reviewsCount})</Text>
                  </View>
                </View>

                {/* Shop Info Container */}
                <View style={styles.shopDetailsContent}>
                  <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.shopName}>{shop.name}</Text>
                        {shop.verified && (
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 6 }} />
                        )}
                      </View>
                      <Text style={styles.shopCategory}>{shop.category} • {shop.type}</Text>
                    </View>
                    <Image source={shop.logoImage} style={styles.shopLogoMini} resizeMode="contain" />
                  </View>

                  <Text style={styles.shopDescription} numberOfLines={2}>
                    {shop.description}
                  </Text>

                  {/* Delivery and Working Hours */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Ionicons name="time-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.metaBadgeText}>{shop.deliveryTime}</Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Ionicons name="bag-check-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.metaBadgeText}>{shop.workingHours}</Text>
                    </View>
                  </View>

                  {/* Accepted Cryptos and Visit Button */}
                  <View style={styles.cardFooter}>
                    <View style={styles.cryptosRow}>
                      <Text style={styles.acceptsLabel}>Accepté:</Text>
                      {shop.acceptedCryptos.slice(0, 4).map(crypto => (
                        <View key={crypto} style={{ marginRight: 4 }}>
                          <CryptoIcon symbol={crypto} size={18} />
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity 
                      style={styles.visitBtn}
                      onPress={() => navigation.navigate('ShopDetailsScreen', { shop })}
                    >
                      <Text style={styles.visitBtnText}>Visiter</Text>
                      <Ionicons name="arrow-forward" size={14} color="#1A2840" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

        </ScrollView>

        {/* Global Toast */}
        {toast && (
          <View style={styles.toastWrap}>
            <AppToast 
              title={toast.title} 
              message={toast.message} 
              onClose={() => setToast(null)} 
            />
          </View>
        )}

        {/* Bottom Navbar */}
        <BottomNavBar activeTab="shops" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 4 : 0,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#0A1128',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtnRight: {
    width: 34,
    height: 34,
    justify: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
    padding: 0,
    outlineStyle: 'none',
  },
  filtersContainer: {
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#1A2840',
    borderColor: '#1A2840',
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  resultsCountText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  sortText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#0052FF',
  },
  emptyState: {
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  coverWrapper: {
    height: 120,
    width: '100%',
    position: 'relative',
    backgroundColor: '#071D54',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 17, 40, 0.25)',
  },
  flagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1A2840',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  shopDetailsContent: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  shopName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  shopCategory: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  shopLogoMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  shopDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  metaBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cryptosRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    marginRight: 6,
  },
  visitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  visitBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  toastWrap: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    zIndex: 100,
  },
});
