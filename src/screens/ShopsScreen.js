import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ImageBackground, Platform, StatusBar, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { useBuyGoods } from '../hooks/useBuyGoods';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import { LanguageSelector } from '../components/LanguageSelector';
import { useApp } from '../context/AppContext';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';

const { width } = Dimensions.get('window');


const getQuickActions = (t) => [
  { id: '1', title: t('qaReferTitle', 'Refer a\nbusiness/Shop'), subtitle: t('qaReferSub', 'Share and\nsupport\ncommerce'), icon: 'add-outline', color: '#F59E0B', iconBg: '#FFFBEB' },
  { id: '2', title: t('qaMyShopsTitle', 'My Shops'), subtitle: t('qaMyShopsSub', 'View shops I\ndeal with'), icon: 'bag-handle-outline', color: '#10B981', iconBg: '#ECFDF5' },
  { id: '3', title: t('qaNearbyTitle', 'Nearby\nShops'), subtitle: t('qaNearbySub', 'Discover shops\nnear you'), icon: 'location-outline', color: '#20365B', iconBg: '#EFF6FF' },
  { id: '4', title: t('qaNewShopsTitle', 'New\nShops'), subtitle: t('qaNewShopsSub', 'New Shops &\nBusinesses'), icon: 'storefront-outline', color: '#8B5CF6', iconBg: '#F5F3FF' },
];

export default function ShopsScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, t, user, appSettings } = useApp();
  const { loading, error, fetchMerchants } = useBuyGoods();
  const [shopsList, setShopsList] = useState([]);
  const [categories] = useState([
    { id: 'Tout', label: t('shopsFilterAll', 'All Shops'), icon: 'apps', iconColor: '#FFC759' },
    { id: 'Alimentation', label: t('shopsFilterFood', 'Food & Groceries'), icon: 'restaurant-outline', iconColor: '#FFC759' },
    { id: 'Électronique', label: t('shopsFilterTech', 'Electronics'), icon: 'laptop-outline', iconColor: '#FFC759' },
    { id: 'Mode', label: t('shopsFilterFashion', 'Fashion'), icon: 'shirt-outline', iconColor: '#FFC759' },
    { id: 'Services', label: t('shopsFilterServices', 'Services'), icon: 'briefcase-outline', iconColor: '#FFC759' }
  ]);
  const [activeSubNav, setActiveSubNav] = useState('shops');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [toast, setToast] = useState(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [bannerSlide, setBannerSlide] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadMerchants = async () => {
      const data = await fetchMerchants(query);
      const catsSet = new Set();

      const mapped = data.map((m, i) => {
        let catArray = ['Marketplace'];
        if (m.shop_categories) {
          if (Array.isArray(m.shop_categories)) catArray = m.shop_categories;
          else if (typeof m.shop_categories === 'string') catArray = m.shop_categories.split(',').map(c => c.trim());
        }
        const mainCat = catArray[0] || 'Marketplace';
        const allCatsString = catArray.join(' ').toLowerCase();
        catsSet.add(mainCat);

        // Dynamic Badges based on delivery_modes
        const badges = [];
        if (m.delivery_modes && Array.isArray(m.delivery_modes)) {
          if (m.delivery_modes.includes('delivery')) badges.push({ text: t('shopBadgeDelivery', 'Delivery'), color: '#10B981', bg: '#ECFDF5' });
          if (m.delivery_modes.includes('picking')) badges.push({ text: t('shopBadgePickup', 'Pick-up'), color: '#20365B', bg: '#EFF6FF' });
          if (m.delivery_modes.includes('online') || m.delivery_modes.includes('remote') || m.delivery_modes.includes('in-person') || m.delivery_modes.includes('services')) badges.push({ text: t('shopBadgeService', 'Service'), color: '#8B5CF6', bg: '#F5F3FF' });
        }
        if (badges.length === 0) badges.push({ text: t('shopBadgeStore', 'In-Store'), color: '#F59E0B', bg: '#FFFBEB' });

        // Basic Distance Logic
        let distanceLabel = 'Global';
        if (user?.country && m.country && user.country.toLowerCase() === m.country.toLowerCase()) {
          if (user?.city && m.city_village && user.city.toLowerCase() === m.city_village.toLowerCase()) {
            distanceLabel = t('shopsDistanceCity', 'Same City');
          } else {
            distanceLabel = t('shopsDistanceCountry', 'Same Country');
          }
        }

        return {
          id: m.id || String(i),
          name: m.shop_name || 'Boutique DizzitUp',
          logoBg: '#1A2840',
          logoText: m.shop_name ? m.shop_name.substring(0, 3).toUpperCase() : 'DZY',
          logoUrl: m.shop_logo_url,
          bannerUrl: m.shop_banner_url,
          type: m.shop_categories || 'Marketplace • Shopping',
          location: `${m.city_village || 'Local'}, ${m.country || 'Global'}`,
          country: m.country,
          distance: distanceLabel,
          flag: m.country ? getCountryCurrencyInfo(m.country).code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397)) : '🌍',
          badges: badges,
          category: mainCat,
          allCategories: allCatsString,
          categoryColor: '#8B5CF6',
          categoryBg: '#F5F3FF',
          rating: t('shopsRatingNew', 'New'),
          reviews: '',
          createdAt: m.created_at,
          raw: m
        };
      });

      setShopsList(mapped);
      setRefreshing(false);
    };

    const timeoutId = setTimeout(() => {
      loadMerchants();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [query, fetchMerchants, t]);

  useEffect(() => {
    if (!isBannerVisible) return;
    const interval = setInterval(() => {
      setBannerSlide(prev => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, [isBannerVisible]);

  let filteredShops = shopsList.filter((shop) => {
    const shopCat = (shop.allCategories || shop.category || '').toLowerCase();
    const q = query.trim().toLowerCase();
    
    // Better search accuracy: match name, location, country, or category
    const matchQuery = !q || 
      shop.name.toLowerCase().includes(q) || 
      (shop.location && shop.location.toLowerCase().includes(q)) ||
      (shop.country && shop.country.toLowerCase().includes(q)) ||
      shopCat.includes(q);

    let matchFilter = false;
    if (activeFilter === 'Tout') {
      matchFilter = true;
    } else if (activeFilter === 'Alimentation') {
      matchFilter = ['food', 'restaurant', 'retail', 'merchant', 'agriculture', 'farming', 'supermarché', 'grocer'].some(k => shopCat.includes(k));
    } else if (activeFilter === 'Électronique') {
      matchFilter = ['it ', 'software', 'electronic', 'tech', 'solar', 'renewable', 'digital', 'mobile'].some(k => shopCat.includes(k));
    } else if (activeFilter === 'Mode') {
      matchFilter = ['fashion', 'clothing', 'beauty', 'cosmetic', 'mode'].some(k => shopCat.includes(k));
    } else if (activeFilter === 'Services') {
      matchFilter = ['consulting', 'professional', 'content', 'design', 'influencer', 'accounting', 'finance', 'legal', 'export', 'logistics', 'marketing', 'seo', 'freelance', 'writing', 'translation', 'healthcare', 'medical', 'home', 'furniture', 'education', 'training', 'art', 'creative', 'travel', 'tourism', 'automotive', 'event', 'ticketing', 'hotel', 'b&b', 'service'].some(k => shopCat.includes(k));
    }

    return matchQuery && matchFilter;
  });

  if (activeSubNav === 'new') {
    filteredShops.sort((a, b) => new Date(b.createdAt || 0) > new Date(a.createdAt || 0) ? -1 : 1);
  } else if (activeSubNav === 'nearby') {
    filteredShops.sort((a, b) => (a.country || '').localeCompare(b.country || ''));
  }

  const visibleShops = filteredShops.slice(0, displayedCount);

  const handleLoadMore = () => {
    if (displayedCount >= filteredShops.length) {
      setToast({ title: t('shopsNoMoreTitle', 'All Shops Loaded'), message: t('shopsNoMoreMessage', 'All partner shops are currently displayed.') });
    } else {
      setDisplayedCount(prev => prev + 6);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Passing the current query to refetch
    fetchMerchants(query).then(() => {
      // The useEffect will actually handle setting the list when fetchMerchants resolves,
      // but we can toggle this state quickly here.
      setRefreshing(false);
    });
  }, [fetchMerchants, query]);

  const runQuickAction = (id) => {
    if (id === '1') {
      navigation.navigate('ReferBusinessScreen');
    } else if (id === '2') {
      setActiveSubNav('shops');
      setActiveFilter('Tout');
      setQuery('');
    } else if (id === '3') {
      setActiveFilter('Tout');
      setActiveSubNav('nearby');
      setToast({ title: t('qaNearbyToastTitle', 'Nearby'), message: t('qaNearbyToastMessage', 'Shops sorted by location.') });
    } else {
      setActiveFilter('Tout');
      setActiveSubNav('new');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/brand/finalLogo.png')} style={{ width: 40, height: 40, borderRadius: 20 }} />
          </View>
          <View style={styles.headerRightIcons}>
            <View style={{ marginRight: 8 }}>
              <LanguageSelector />
            </View>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('NotificationsScreen')}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot}>
                <Text style={{ color: '#FFFFFF', fontSize: 7, fontWeight: 'bold', textAlign: 'center' }}>1</Text>
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

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFC759"
              colors={['#FFC759', '#20365B']}
            />
          }
        >

          <Text style={styles.mainTitle}>{t('shopsTitle', 'Shops')}</Text>
          <Text style={styles.subtitle}>{t('shopsSubtitle', 'Discover, pay and support African businesses.')}</Text>
          <Text style={styles.acceptedTokensText}>
            <Text style={{ color: '#20365B' }}>{t('paymentCards', 'Cards')}</Text>  •  <Text style={{ color: '#20365B' }}>{t('paymentStablecoins', 'Stablecoins')}</Text>  •  <Text style={{ color: '#20365B' }}>{t('paymentMobileMoney', 'Mobile Money')}</Text>  {t('paymentAccepted', 'accepted')}
          </Text>

          {/* Stunning Search Bar */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#20365B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('shopsSearchPlaceholder', 'Search by name, city, country or category...')}
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
                selectionColor="#FFC759"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} style={styles.clearSearchBtn}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Actions rapides */}
          <Text style={styles.sectionTitle}>{t('shopsQuickActions', 'Quick Actions')}</Text>
          <View style={styles.quickActionsGrid}>
            {getQuickActions(t).map(action => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard} onPress={() => runQuickAction(action.id)}>
                <View style={[styles.quickActionIconContainer, { backgroundColor: action.iconBg }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mes shops & View Toggle */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{activeSubNav === 'new' ? t('qaNewShopsTitle', 'New Shops').replace('\n', ' ') : t('qaMyShopsTitle', 'My Shops')}</Text>

            <View style={styles.viewToggleContainer}>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === 'grid' && styles.viewToggleBtnActive]}
                onPress={() => setViewMode('grid')}
              >
                <Ionicons name="grid" size={14} color={viewMode === 'grid' ? '#FFFFFF' : '#64748B'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons name="list" size={16} color={viewMode === 'list' ? '#FFFFFF' : '#64748B'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filtersScrollView}
            contentContainerStyle={styles.filtersScroll}
          >
            {categories.map((item) => {
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
                    color={isActive ? '#FFC759' : '#1A2840'}
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
          </ScrollView>

          {/* Shops List */}
          {loading && (
            <View style={{ padding: 20 }}>
              <ActivityIndicator size="large" color="#FFC759" />
              <Text style={{ textAlign: 'center', marginTop: 10, color: '#64748B', fontFamily: 'Inter_500Medium', fontSize: 12 }}>{t('shopsLoading', 'Loading...')}</Text>
            </View>
          )}

          <View style={[styles.shopsContainer, viewMode === 'grid' && styles.shopsGridContainer]}>
            {visibleShops.map((shop, index) => {
              if (viewMode === 'grid') {
                return (
                  <TouchableOpacity key={shop.id} style={styles.shopGridCard} onPress={() => navigation.navigate('ShopDetailsScreen', { shop: shop })}>
                    <View style={styles.shopGridImageContainer}>
                      {shop.bannerUrl ? (
                        <Image source={{ uri: shop.bannerUrl }} style={styles.shopGridBanner} />
                      ) : (
                        <View style={[styles.shopGridBanner, { backgroundColor: '#F1F5F9' }]} />
                      )}

                      <View style={styles.shopGridLogoWrapper}>
                        {shop.logoUrl ? (
                          <Image source={{ uri: shop.logoUrl }} style={styles.shopGridLogo} />
                        ) : (
                          <View style={[styles.shopGridLogo, { backgroundColor: '#1A2840', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={styles.shopLogoText}>{shop.logoText}</Text>
                          </View>
                        )}
                      </View>

                      <View style={[styles.categoryBadge, { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 2, paddingHorizontal: 6 }]}>
                        <Text style={[styles.categoryBadgeText, { color: shop.categoryColor, fontSize: 8 }]} numberOfLines={1}>{shop.category}</Text>
                      </View>
                    </View>

                    <View style={styles.shopGridContent}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={styles.shopGridName} numberOfLines={1}>{shop.name}</Text>
                        <Text style={styles.shopFlag}>{shop.flag}</Text>
                      </View>
                      <Text style={styles.shopGridLocation} numberOfLines={1}>{shop.location}</Text>

                      <View style={[styles.ratingRow, { marginTop: 6 }]}>
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text style={[styles.ratingText, { fontSize: 10 }]}> {shop.rating}</Text>
                        {!!shop.reviews && <Text style={[styles.reviewsText, { fontSize: 9 }]}> ({shop.reviews})</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <View key={shop.id}>
                    <TouchableOpacity style={styles.shopItem} onPress={() => navigation.navigate('ShopDetailsScreen', { shop: shop })}>
                      {/* Logo */}
                      {shop.logoUrl ? (
                        <Image source={{ uri: shop.logoUrl }} style={styles.shopLogo} />
                      ) : (
                        <ImageBackground source={require('../../assets/brand/shop_placeholder.jpg')} style={[styles.shopLogo, { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }]}>
                          <Text style={[styles.shopLogoText, { color: '#FFC759', fontSize: 18, fontWeight: '900', letterSpacing: 1 }]}>
                            {shop.logoText}
                          </Text>
                        </ImageBackground>
                      )}

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
                            <View key={bIndex} style={[styles.badge, { backgroundColor: badge.bg }]}>
                              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Right side */}
                      <View style={styles.shopRight}>
                        <View style={[styles.categoryBadge, { backgroundColor: shop.categoryBg }]}>
                          <Text style={[styles.categoryBadgeText, { color: shop.categoryColor }]}>{shop.category}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.ratingText}> {shop.rating}</Text>
                          {!!shop.reviews && <Text style={styles.reviewsText}> ({shop.reviews})</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginTop: 10 }} />
                      </View>
                    </TouchableOpacity>
                    {index < visibleShops.length - 1 && <View style={styles.divider} />}
                  </View>
                );
              }
            })}

            {/* Empty State */}
            {!loading && visibleShops.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconCircle}>
                  <Ionicons name="search-outline" size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyStateTitle}>{t('shopsEmptyTitle', 'No shops found')}</Text>
                <Text style={styles.emptyStateMessage}>
                  {t('shopsEmptyMessage', 'Try adjusting your search or filters to find what you are looking for.')}
                </Text>
                {query.length > 0 && (
                  <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => { setQuery(''); setActiveFilter('Tout'); }}>
                    <Text style={styles.clearFiltersBtnText}>{t('shopsClearFilters', 'Clear all filters')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Button Voir plus */}
          {!loading && displayedCount < filteredShops.length && (
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
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1E293B', marginRight: 6 }}>
                {t('shopsSeeMore', 'See more')} ({filteredShops.length - displayedCount} {t('shopsRemaining', 'remaining')})
              </Text>
              <Ionicons name="chevron-down" size={16} color="#1E293B" />
            </TouchableOpacity>
          )}

          {/* Refer Banner CTA at bottom */}
          {isBannerVisible && (
            <View style={styles.bannerContainer}>
              {bannerSlide === 0 ? (
                <View style={[styles.inviteBanner, { backgroundColor: '#EEF5FF' }]}>
                  <TouchableOpacity style={styles.closeBannerButton} onPress={() => setIsBannerVisible(false)} accessibilityLabel="Close banner">
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.inviteContent}>
                    <Text style={styles.inviteTitle}>
                      {t('shopsBannerInviteTitle', 'Invite friends\nand earn ')}
                      <Text style={{ color: '#20365B' }}>${appSettings.refer_user_reward || 5} in DZY</Text>
                    </Text>
                    <Text style={styles.inviteSubtitle}>
                      {t('shopsBannerInviteSub', 'Send money, buy goods,\npay bills and earn rewards.')}
                    </Text>
                    <TouchableOpacity style={[styles.inviteButton, { backgroundColor: '#071D54' }]} onPress={() => navigation.navigate('RewardsScreen')}>
                      <Text style={styles.inviteButtonText}>{t('shopsBannerInviteBtn', 'Invite now')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inviteGraphic}>
                    <View style={styles.inviteOrbitOne} />
                    <View style={styles.inviteOrbitTwo} />
                    <View style={styles.giantCoin}>
                      <View style={styles.innerCoin}>
                        <Text style={styles.coinText}>DZY</Text>
                      </View>
                    </View>
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={[styles.miniAvatar, { top: 10, right: 12 }]} />
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=9' }} style={[styles.miniAvatar, { bottom: 12, left: 14 }]} />
                  </View>
                </View>
              ) : (
                <View style={[styles.inviteBanner, { backgroundColor: '#F0FDF4' }]}>
                  <TouchableOpacity style={styles.closeBannerButton} onPress={() => setIsBannerVisible(false)} accessibilityLabel="Close banner">
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.inviteContent}>
                    <Text style={styles.inviteTitle}>
                      {t('shopsBannerReferTitle', 'Refer a Store\nand earn ')}
                      <Text style={{ color: '#10B981' }}>${appSettings.refer_business_reward || 10} in DZY</Text>
                    </Text>
                    <Text style={styles.inviteSubtitle}>
                      {t('shopsBannerReferSub', 'Refer a store or business\nand earn rewards.')}
                    </Text>
                    <TouchableOpacity style={[styles.inviteButton, { backgroundColor: '#10B981' }]} onPress={() => navigation.navigate('ReferBusinessScreen')}>
                      <Text style={styles.inviteButtonText}>{t('shopsBannerReferBtn', 'Refer now')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.storeGraphic}>
                    <Image source={require('../../assets/brand/dzy_store_icone.png')} style={{ width: 110, height: 95 }} resizeMode="contain" />
                  </View>
                </View>
              )}
              <View style={styles.carouselDotsContainer}>
                <TouchableOpacity onPress={() => setBannerSlide(0)}><View style={[styles.carouselDot, bannerSlide === 0 ? styles.activeDotSlide0 : styles.inactiveDot]} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setBannerSlide(1)}><View style={[styles.carouselDot, bannerSlide === 1 ? styles.activeDotSlide1 : styles.inactiveDot]} /></TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <BottomNavBar activeTab="shops" language={language} />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 10, paddingBottom: 6 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  headerRightIcons: { flexDirection: 'row' },
  iconBtnRight: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginLeft: 8, position: 'relative' },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 4, paddingBottom: 30 },
  mainTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 26, color: '#1A2840', paddingHorizontal: 16, marginBottom: 2 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', paddingHorizontal: 16, marginBottom: 4 },
  acceptedTokensText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', paddingHorizontal: 16, marginBottom: 14 },
  searchWrapper: { paddingHorizontal: 16, marginBottom: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, height: 50, boxShadow: '0px 4px 12px rgba(255,199,89,0.1)', elevation: 6, borderWidth: 1.5, borderColor: '#F1F5F9' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A2840', outlineStyle: 'none' },
  clearSearchBtn: { padding: 4 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', paddingHorizontal: 16, marginBottom: 10 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 18 },
  quickActionCard: { width: '23.5%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F3F7', borderRadius: 14, padding: 8, alignItems: 'center', minHeight: 110, justifyContent: 'flex-start' },
  quickActionIconContainer: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickActionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#1A2840', textAlign: 'center', marginBottom: 2, lineHeight: 12 },
  quickActionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 8, color: '#9CA3AF', textAlign: 'center', lineHeight: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginBottom: 4 },

  viewToggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 2 },
  viewToggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  viewToggleBtnActive: { backgroundColor: '#1A2840' },

  filtersScrollView: { marginBottom: 14 },
  filtersScroll: { paddingLeft: 16, paddingRight: 8 },
  filterChipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2840', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 8, borderWidth: 1, borderColor: '#1A2840' },
  filterChipTextActive: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 8 },
  filterChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },

  shopsContainer: { paddingHorizontal: 16, marginBottom: 16 },
  shopsGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },

  // List Item Styles
  shopItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', paddingVertical: 12 },
  shopLogo: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  shopLogoText: { color: '#FFFFFF', fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, textAlign: 'center' },
  shopContent: { flex: 1 },
  shopTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
  shopName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  shopFlag: { fontSize: 12, marginLeft: 4 },
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

  // Grid Item Styles
  shopGridCard: { width: (width - 44) / 2, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12, overflow: 'hidden', boxShadow: '0px 2px 8px rgba(0,0,0,0.04)', elevation: 2 },
  shopGridImageContainer: { height: 80, position: 'relative' },
  shopGridBanner: { width: '100%', height: '100%' },
  shopGridLogoWrapper: { position: 'absolute', bottom: -16, left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', padding: 2, boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', elevation: 2 },
  shopGridLogo: { width: '100%', height: '100%', borderRadius: 16 },
  shopGridContent: { padding: 12, paddingTop: 20 },
  shopGridName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', flex: 1 },
  shopGridType: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#6B7280', marginTop: 2 },
  shopGridLocation: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF', marginTop: 2 },

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
  activeDotSlide0: { backgroundColor: '#20365B', width: 7, height: 7, borderRadius: 3.5 },
  activeDotSlide1: { backgroundColor: '#10B981', width: 7, height: 7, borderRadius: 3.5 },
  activeDot: { backgroundColor: '#10B981', width: 7, height: 7, borderRadius: 3.5 },
  inactiveDot: { backgroundColor: '#D1D5DB' },
  inviteGraphic: { width: '45%', height: '100%', position: 'absolute', right: 0, top: 0, justifyContent: 'center', alignItems: 'center' },
  inviteOrbitOne: { width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', position: 'absolute' },
  inviteOrbitTwo: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', position: 'absolute' },
  giantCoin: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F59E0B' },
  innerCoin: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' },
  coinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#FFFFFF' },
  miniAvatar: { width: 22, height: 22, borderRadius: 11, position: 'absolute', borderWidth: 1, borderColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },

  // Empty State Styles
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyStateIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyStateTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1E293B', marginBottom: 8 },
  emptyStateMessage: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  clearFiltersBtn: { backgroundColor: '#1A2840', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  clearFiltersBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },
});
