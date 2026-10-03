


import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Animated, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WalletCard from '../components/WalletCard';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { LanguageSelector } from '../components/LanguageSelector';
import { shareShopLink, handleUserInviteShare } from '../utils/shareHelper';
import { useApp } from '../context/AppContext';
import { useBuyGoods } from '../hooks/useBuyGoods';
import { buyGoodsApi } from '../services/buyGoodsApi';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import PriceDisplay from '../components/PriceDisplay';

import { isSmallScreen, isShortScreen } from '../utils/responsive';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, t, user, isUserLoading, detectedCountry, refreshUser, hasUnreadNotifications } = useApp();
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [walletBalances, setWalletBalances] = useState({});
  const [timelineTab, setTimelineTab] = useState('featured');
  const [featuredShops, setFeaturedShops] = useState([]);
  const [newsProducts, setNewsProducts] = useState([]);
  const [toastInfo, setToastInfo] = useState({ visible: false, title: '', message: '' });
  const { fetchMerchants, fetchAllProducts, loading: dataLoading } = useBuyGoods();

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchTab, setSelectedSearchTab] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await buyGoodsApi.searchGlobal(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.warn('Search error on HomeScreen:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const uniqueSearchResults = useMemo(() => {
    if (!Array.isArray(searchResults)) return [];
    const seen = new Set();
    return searchResults.filter((item) => {
      const key = `${item.entity_type || 'item'}_${item.entity_id || item.id || item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [searchResults]);

  const categorizedResults = useMemo(() => {
    const groups = {
      giftCards: [],
      products: [],
      utilities: [],
      operators: [],
      stores: [],
    };

    uniqueSearchResults.forEach((item) => {
      if (item.entity_type === 'gift_card') groups.giftCards.push(item);
      else if (item.entity_type === 'product') groups.products.push(item);
      else if (item.entity_type === 'utility_provider') groups.utilities.push(item);
      else if (item.entity_type === 'mobile_operator') groups.operators.push(item);
      else if (item.entity_type === 'merchant' || item.entity_type === 'store') groups.stores.push(item);
    });

    return groups;
  }, [uniqueSearchResults]);

  const filteredSearchResults = useMemo(() => {
    if (selectedSearchTab === 'ALL') return uniqueSearchResults;
    if (selectedSearchTab === 'gift_card') return categorizedResults.giftCards;
    if (selectedSearchTab === 'product') return categorizedResults.products;
    if (selectedSearchTab === 'utility_provider') return categorizedResults.utilities;
    if (selectedSearchTab === 'mobile_operator') return categorizedResults.operators;
    if (selectedSearchTab === 'merchant') return categorizedResults.stores;
    return uniqueSearchResults;
  }, [selectedSearchTab, uniqueSearchResults, categorizedResults]);

  const handleSearchResultPress = (item) => {
    const queryBackup = searchQuery;
    setSearchQuery('');
    setSearchResults([]);

    if (item.entity_type === 'gift_card') {
      navigation.navigate('ExploreGiftCardsScreen', {
        initialQuery: item.title,
        selectedCardId: String(item.entity_id),
      });
    } else if (item.entity_type === 'product') {
      navigation.navigate('ProductDetailsScreen', {
        product: {
          id: item.entity_id,
          name: item.title,
          title: item.title,
          price: item.price,
          currency: item.currency,
          images: item.image_url ? [item.image_url] : [],
        },
      });
    } else if (item.entity_type === 'utility_provider') {
      navigation.navigate('BillDetailsScreen', {
        providerId: item.entity_id,
        operatorName: item.title,
      });
    } else if (item.entity_type === 'mobile_operator') {
      navigation.navigate('MobileRechargeScreen', {
        operatorId: item.entity_id,
        operatorName: item.title,
      });
    } else if (item.entity_type === 'merchant' || item.entity_type === 'store') {
      navigation.navigate('ShopsScreen', {
        merchantId: item.entity_id,
        searchQuery: item.title,
      });
    }
  };

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const merchants = await fetchMerchants('');
        const products = await fetchAllProducts('');

        // Apply Geolocation logic primarily, fallback to COI or user country
        const targetCountry = (detectedCountry || user?.COI || user?.country || 'Senegal').toLowerCase();
        
        let localMerchants = merchants.filter(m => (m.country || '').toLowerCase() === targetCountry);
        let localProducts = products.filter(p => (p.merchant?.country || '').toLowerCase() === targetCountry);
        
        // Diaspora fallback: if they have no local physical merchants, show global/digital services
        if (localMerchants.length === 0) {
          localMerchants = merchants.filter(m => (m.shop_categories || '').toLowerCase().includes('digital') || (m.shop_categories || '').toLowerCase().includes('global'));
        }
        if (localProducts.length === 0) {
          localProducts = products.filter(p => (p.category || '').toLowerCase().includes('digital') || (p.category || '').toLowerCase().includes('global') || !p.merchant?.country);
        }

        // If still empty, just show something as fallback
        if (localMerchants.length === 0) localMerchants = merchants;
        if (localProducts.length === 0) localProducts = products;

        setFeaturedShops(localMerchants.slice(0, 4));
        setNewsProducts(localProducts.slice(0, 4));
      } catch (err) {
        console.warn('Failed to load timeline data:', err);
      }
    };
    loadRealData();
  }, [fetchMerchants, fetchAllProducts, user?.COI, user?.country, detectedCountry]);

  useEffect(() => {
    if (user) {
      const isMerchant = user?.role === 'merchant';
      const balances = (isMerchant && user?.businessBalances && Object.keys(user.businessBalances).length > 0)
        ? user.businessBalances
        : (user?.allBalances || {});
      setWalletBalances(balances);
    }
  }, [user]);

  // Dynamically generate To-Do List based on real user state
  const TODO_LIST = [];
  
  TODO_LIST.push({
    id: '1',
    icon: 'people-outline',
    iconColor: '#3B82F6',
    iconBgColor: '#EFF6FF',
    title: t('contacts.manage_contacts_title', 'Manage your contacts'),
    buttonText: t('common.manage', 'Manage'),
    buttonColor: '#3B82F6',
    buttonBgColor: '#EFF6FF',
    route: 'ContactsScreen'
  });
  if ((user?.balanceDZY || 0) < 10) {
    TODO_LIST.push({
      id: '2',
      icon: 'warning-outline',
      iconColor: '#EF4444',
      iconBgColor: '#FEF2F2',
      title: t('home.todos.low_balance.title', 'Solde faible,\nrechargez votre compte'),
      buttonText: t('home.todos.low_balance.button', 'Recharger'),
      buttonColor: '#EF4444',
      buttonBgColor: '#FEF2F2',
      route: 'TopUpScreen'
    });
  }

  if (!user?.firstName || !user?.lastName || !user?.phone) {
    TODO_LIST.push({
      id: '3',
      icon: 'shield-checkmark-outline',
      iconColor: '#3B82F6',
      iconBgColor: '#EFF6FF',
      title: t('home.todos.complete_profile.title', 'Complétez votre profil\npour plus de sécurité'),
      buttonText: t('home.todos.complete_profile.button', 'Compléter'),
      buttonColor: '#3B82F6',
      buttonBgColor: '#EFF6FF',
      route: 'SecureAccountScreen'
    });
  }

  // Always show Business/Merchant card as the final call to action
  TODO_LIST.push({
      id: '4',
      icon: 'storefront-outline',
      iconColor: '#8B5CF6',
      iconBgColor: '#F5F3FF',
      title: user?.role === 'merchant'
        ? t('home.todos.merchant_dashboard.title', 'Accéder à votre\nTableau de bord Pro')
        : t('home.todos.create_store.title', 'Créez votre DZYStore\net commencez à vendre'),
      buttonText: user?.role === 'merchant'
        ? t('home.todos.merchant_dashboard.button', 'Accéder')
        : t('home.todos.create_store.button', 'Créer'),
      buttonColor: '#8B5CF6',
      buttonBgColor: '#F5F3FF',
      route: user?.role === 'merchant' ? 'BusinessAccountScreen' : 'ShopsScreen'
  });



  useEffect(() => {
    if (!isBannerVisible) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, [isBannerVisible]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false} 
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FFB800']}
              tintColor="#FFB800"
            />
          }
        >

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => navigation.navigate('PersonalAccountScreen')}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarRing, user?.role === 'merchant' ? styles.merchantRing : styles.userRing]}>
                <View style={styles.avatarWrapper}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                  {user?.avatar ? (
                    <Image source={typeof user.avatar === 'string' ? { uri: user.avatar } : user.avatar} style={styles.avatarImage} />
                  ) : null}
                </View>
              </View>
              <View style={styles.userTextCol}>
                <Text style={styles.greetingText} numberOfLines={1}>{t('greetingHello', 'Bonjour,')}</Text>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                  {isUserLoading && !user?.name ? '...' : (user?.name || 'Utilisateur').split(' ')[0]}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <LanguageSelector />
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('NotificationsScreen')} accessibilityLabel="Notifications">
                <Ionicons name="notifications-outline" size={18} color="#1A2840" />
                {hasUnreadNotifications && <View style={styles.notificationDot} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
                <Ionicons name="settings-outline" size={20} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Global Search Bar */}
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchBarInput}
                placeholder={t('home.searchPlaceholder', 'Search products, gift cards, utilities...')}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCorrect={false}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#20365B" style={{ marginRight: 6 }} />
              )}
              {!!searchQuery && !isSearching && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Live Search Results Dropdown */}
            {searchQuery.trim().length >= 2 && (
              <View style={styles.searchResultsPanel}>
                {/* Category Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.searchFilterTabs}>
                  {[
                    { id: 'ALL', label: `All (${searchResults.length})` },
                    { id: 'gift_card', label: `Gift Cards (${categorizedResults.giftCards.length})` },
                    { id: 'product', label: `Products (${categorizedResults.products.length})` },
                    { id: 'utility_provider', label: `Utilities (${categorizedResults.utilities.length})` },
                    { id: 'mobile_operator', label: `Operators (${categorizedResults.operators.length})` },
                    { id: 'merchant', label: `Stores (${categorizedResults.stores.length})` },
                  ].map(tab => (
                    <TouchableOpacity
                      key={tab.id}
                      style={[styles.searchFilterTab, selectedSearchTab === tab.id && styles.searchFilterTabActive]}
                      onPress={() => setSelectedSearchTab(tab.id)}
                    >
                      <Text style={[styles.searchFilterTabText, selectedSearchTab === tab.id && styles.searchFilterTabTextActive]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {isSearching ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#20365B" />
                    <Text style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>Searching across DizzitUp...</Text>
                  </View>
                ) : filteredSearchResults.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Ionicons name="search-outline" size={28} color="#CBD5E1" />
                    <Text style={{ marginTop: 6, fontSize: 13, color: '#64748B', fontWeight: '600' }}>
                      No results for "{searchQuery}"
                    </Text>
                    <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                      Try searching for "Roblox", "Netflix", or an African country
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 320 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {filteredSearchResults.map((item, idx) => {
                      const isGiftCard = item.entity_type === 'gift_card';
                      const isProduct = item.entity_type === 'product';
                      const isUtility = item.entity_type === 'utility_provider';
                      const isOperator = item.entity_type === 'mobile_operator';
                      const isStore = item.entity_type === 'merchant' || item.entity_type === 'store';

                      let badgeColor = '#3B82F6';
                      let badgeBg = '#EFF6FF';
                      let badgeLabel = 'Service';
                      let defaultIcon = 'cube-outline';

                      if (isGiftCard) {
                        badgeColor = '#059669';
                        badgeBg = '#ECFDF5';
                        badgeLabel = 'Gift Card';
                        defaultIcon = 'gift-outline';
                      } else if (isProduct) {
                        badgeColor = '#D97706';
                        badgeBg = '#FFFBEB';
                        badgeLabel = 'Product';
                        defaultIcon = 'pricetag-outline';
                      } else if (isUtility) {
                        badgeColor = '#7C3AED';
                        badgeBg = '#F5F3FF';
                        badgeLabel = 'Utility';
                        defaultIcon = 'flash-outline';
                      } else if (isOperator) {
                        badgeColor = '#2563EB';
                        badgeBg = '#EFF6FF';
                        badgeLabel = 'Airtime';
                        defaultIcon = 'cellular-outline';
                      } else if (isStore) {
                        badgeColor = '#DB2777';
                        badgeBg = '#FDF2F8';
                        badgeLabel = 'Store';
                        defaultIcon = 'storefront-outline';
                      }

                      return (
                        <TouchableOpacity
                          key={`srch-${item.entity_type || 'item'}-${item.entity_id || idx}-${idx}`}
                          style={styles.searchResultRow}
                          onPress={() => handleSearchResultPress(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.searchThumbWrap}>
                            {item.image_url ? (
                              <Image source={{ uri: item.image_url }} style={styles.searchThumb} resizeMode="contain" />
                            ) : (
                              <View style={[styles.searchThumbPlaceholder, { backgroundColor: badgeBg }]}>
                                <Ionicons name={defaultIcon} size={18} color={badgeColor} />
                              </View>
                            )}
                          </View>
                          <View style={styles.searchInfoCol}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <Text style={styles.searchResultTitle} numberOfLines={1}>
                                {item.title}
                              </Text>
                              <View style={[styles.searchResultBadge, { backgroundColor: badgeBg }]}>
                                <Text style={[styles.searchResultBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                              </View>
                            </View>
                            <Text style={styles.searchResultSub} numberOfLines={1}>
                              {item.subtitle || item.category || item.provider || item.country_code || ''}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {isUserLoading && !user?.id ? (
            <View style={{ height: 180, marginHorizontal: isSmallScreen ? 14 : 20, marginTop: 8, marginBottom: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' }}>
              <ActivityIndicator size="large" color="#FFC759" />
            </View>
          ) : (
            <View>
              <WalletCard balances={walletBalances} />
              
              {/* POS (Cash Register) Quick Access for Merchants */}
              {user?.role === 'merchant' && (
                <TouchableOpacity 
                  style={styles.merchantPosButton}
                  onPress={() => navigation.navigate('CashRegisterScreen')}
                  activeOpacity={0.8}
                >
                  <View style={styles.posIconContainer}>
                    <Ionicons name="calculator" size={24} color="#FFF" />
                  </View>
                  <View style={styles.posTextContainer}>
                    <Text style={styles.posButtonTitle}>{t('home.openPos', 'Point of Sale (POS)')}</Text>
                    <Text style={styles.posButtonSub}>{t('home.openPosSub', 'In-store Stablecoins & DZY payment')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {isUserLoading && !user?.id ? (
            <View style={[styles.todoCard, { height: 160, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="small" color="#94A3B8" />
            </View>
          ) : (
            <View style={styles.todoCard}>
              <View style={[styles.sectionHeader, styles.todoCardHeader]}>
                <Text style={styles.sectionTitle}>{t('todoTitle', 'To-do list')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TodoListScreen')}>
                  <Text style={styles.viewAllText}>{t('viewAll', 'View all')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.todoListContainer}>
                {TODO_LIST.map((item, index) => (
                  <View key={item.id} style={[styles.todoItem, index < TODO_LIST.length - 1 && styles.todoItemDivider]}>
                    <View style={[styles.todoIconWrapper, { backgroundColor: item.iconBgColor }]}>
                      <Ionicons name={item.icon} size={18} color={item.iconColor} />
                    </View>
                    <Text style={styles.todoTitle}>{item.title}</Text>
                    <TouchableOpacity style={[styles.todoButton, { backgroundColor: item.buttonBgColor }]} onPress={() => navigation.navigate(item.route)}>
                      <Text style={[styles.todoButtonText, { color: item.buttonColor }]}>{item.buttonText}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {isBannerVisible && (
            <View style={styles.bannerContainer}>
              {activeSlide === 0 ? (
                <View style={[styles.inviteBanner, { backgroundColor: '#EEF5FF' }]}>
                  <TouchableOpacity style={styles.closeBannerButton} onPress={() => setIsBannerVisible(false)} accessibilityLabel="Close banner">
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.inviteContent}>
                    <Text style={styles.inviteTitle}>
                      {t('home.inviteBannerTitle_1', "Invite friends\nand earn ")}
                      <Text style={{ color: '#3B82F6' }}>{t('home.inviteBannerAmount', "$5 in DZY")}</Text>
                    </Text>
                    <Text style={styles.inviteSubtitle}>
                      {t('home.inviteBannerDesc', "Send funds, shop,\npay bills and earn rewards.")}
                    </Text>
                    <TouchableOpacity 
                      style={[styles.inviteButton, { backgroundColor: '#071D54' }]} 
                      onPress={() => {
                        handleUserInviteShare(user);
                      }}
                    >
                      <Text style={styles.inviteButtonText}>{t('home.btnInviteNow', 'Invite')}</Text>
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
                      {t('home.referBannerTitle_1', "Refer a store\nand earn ")}
                      <Text style={{ color: '#10B981' }}>{t('home.referBannerAmount', "$10 in DZY")}</Text>
                    </Text>
                    <Text style={styles.inviteSubtitle}>
                      {t('home.referBannerDesc', "Recommend a business\nand earn rewards.")}
                    </Text>
                    <TouchableOpacity style={[styles.inviteButton, { backgroundColor: '#10B981' }]} onPress={() => navigation.navigate('ShopsScreen')}>
                      <Text style={styles.inviteButtonText}>{t('home.btnReferNow', 'Refer')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.storeGraphic}>
                    <Image source={require('../../assets/brand/dzy_store_icone.png')} style={{ width: 100, height: 85 }} resizeMode="contain" />
                  </View>
                </View>
              )}
              <View style={styles.carouselDotsContainer}>
                <TouchableOpacity onPress={() => setActiveSlide(0)}><View style={[styles.carouselDot, activeSlide === 0 ? styles.activeDotSlide0 : styles.inactiveDot]} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveSlide(1)}><View style={[styles.carouselDot, activeSlide === 1 ? styles.activeDotSlide1 : styles.inactiveDot]} /></TouchableOpacity>
              </View>
            </View>
          )}



          <View style={styles.timelineTabsContainer}>
            <TouchableOpacity 
              style={[styles.timelineTab, timelineTab === 'featured' && styles.timelineTabActive]}
              onPress={() => setTimelineTab('featured')}
              activeOpacity={0.8}
            >
              <Text style={[styles.timelineTabText, timelineTab === 'featured' && styles.timelineTabTextActive]}>
                {t('home.tabs.featured', 'Featured')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timelineTab, timelineTab === 'news' && styles.timelineTabActive]}
              onPress={() => setTimelineTab('news')}
              activeOpacity={0.8}
            >
              <Text style={[styles.timelineTabText, timelineTab === 'news' && styles.timelineTabTextActive]}>
                {t('home.tabs.news', 'News')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineContentContainer}>
            {dataLoading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FFC759" />
              </View>
            ) : timelineTab === 'featured' ? (
              <View style={styles.timelineList}>
                {featuredShops.length > 0 ? featuredShops.map((shop, index) => {
                  const locationStr = `${shop.city_village || 'Local'}, ${shop.country || 'Global'}`;
                  return (
                    <TouchableOpacity key={`shop-${shop.id || 'id'}-${index}`} style={styles.timelineCard} onPress={() => navigation.navigate('ShopDetailsScreen', { shop })}>
                      <Image
                        source={shop.shop_logo_url ? { uri: shop.shop_logo_url } : (shop.shop_banner_url ? { uri: shop.shop_banner_url } : require('../../assets/brand/store_default_banner.jpg'))}
                        defaultSource={require('../../assets/brand/store_default_banner.jpg')}
                        style={styles.timelineImage}
                      />
                      <View style={styles.timelineCardContent}>
                        <View style={styles.timelineBadge}><Text style={styles.timelineBadgeText}>{language === 'en' ? 'Featured' : 'En vedette'}</Text></View>
                        <Text style={styles.timelineTitle} numberOfLines={1}>{shop.shop_name}</Text>
                        <Text style={styles.timelineSubtitle} numberOfLines={2}>{locationStr} • {shop.shop_categories || 'Marketplace'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }) : (
                  <View style={styles.timelineEmptyState}>
                    <Ionicons name="star-outline" size={24} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <Text style={styles.timelineEmptyText}>
                      {t('home.timeline.featured_empty', 'Discover featured products, shops and businesses here.')}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.timelineList}>
                {newsProducts.length > 0 ? newsProducts.map((product, index) => {
                  return (
                    <TouchableOpacity key={`product-${product.id || 'id'}-${index}`} style={styles.timelineCard} onPress={() => navigation.navigate('ProductDetailsScreen', { product })}>
                      <Image
                        source={product.product_images && product.product_images.length > 0 ? { uri: product.product_images[0] } : product.thumbnail ? { uri: product.thumbnail } : product.images && product.images.length > 0 ? { uri: product.images[0] } : require('../../assets/brand/product_no_image.jpg')}
                        defaultSource={require('../../assets/brand/product_no_image.jpg')}
                        style={styles.timelineImage}
                        resizeMode="cover"
                      />
                      <View style={styles.timelineCardContent}>
                        <View style={[styles.timelineBadge, { backgroundColor: '#F3E8FF' }]}><Text style={[styles.timelineBadgeText, { color: '#9333EA' }]}>{language === 'en' ? 'New' : 'Nouveau'}</Text></View>
                        <Text style={styles.timelineTitle} numberOfLines={1}>{product.name || product.title || 'Produit'}</Text>
                        <Text style={styles.timelineSubtitle} numberOfLines={1}>{product.merchant?.shop_name || 'DizzitUp'}</Text>
                        <PriceDisplay amount={product.price || 0} baseCurrency={product.currency || 'XOF'} />
                      </View>
                    </TouchableOpacity>
                  );
                }) : (
                  <View style={styles.timelineEmptyState}>
                    <Ionicons name="newspaper-outline" size={24} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <Text style={styles.timelineEmptyText}>
                      {t('home.timeline.news_empty', 'Stay updated with local news from your network.')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.securityBanner}>
            <View style={styles.securityIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#1A2840" />
            </View>
            <View style={styles.securityTextContent}>
              <Text style={styles.securityTitle}>{t('securityBannerTitle', 'Sécurisé, simple et instantané')}</Text>
              <Text style={styles.securityDesc}>
                {t('securityBannerDesc', 'Vos fonds et données sont protégés par le chiffrement réseau de classe entreprise.')}
              </Text>
            </View>
            <View style={styles.lockIconWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#1A2840" />
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <BottomNavBar
          activeTab="Home"
        />
        <AppToast visible={toastInfo.visible} title={toastInfo.title} message={toastInfo.message} type="info" onClose={() => setToastInfo({ ...toastInfo, visible: false })} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 8 
  },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: isSmallScreen ? 14 : 20, 
    paddingBottom: 8 
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 6 
  },
  userTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  merchantRing: { borderColor: '#8B5CF6' },
  userRing: { borderColor: '#3B82F6' },
  avatarWrapper: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: '#071D54', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  avatarImage: { ...StyleSheet.absoluteFill, width: 38, height: 38, borderRadius: 19 },
  greetingText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B', lineHeight: 15 },
  nameText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', lineHeight: 19 },
  merchantBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  merchantBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#FFFFFF', letterSpacing: 0.5 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { 
    width: 34, 
    height: 34, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative', 
    backgroundColor: '#FFFFFF' 
  },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: isSmallScreen ? 14 : 20, 
    marginTop: 14, 
    marginBottom: 8 
  },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  viewAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#F59E0B' },
  todoCard: { 
    marginHorizontal: isSmallScreen ? 14 : 20, 
    marginTop: 10, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#F0F2F6', 
    backgroundColor: '#FFFFFF', 
    boxShadow: '0px 4px 12px #0A1737', 
    overflow: 'hidden' 
  },
  merchantPosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    marginHorizontal: isSmallScreen ? 14 : 20,
    marginTop: 4,
    marginBottom: 4,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  posIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    boxShadow: '0px 4px 8px rgba(139, 92, 246, 0.4)',
  },
  posTextContainer: {
    flex: 1,
  },
  posButtonTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#4C1D95',
    marginBottom: 2,
  },
  posButtonSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#7C3AED',
  },
  todoCardHeader: { paddingHorizontal: 12, marginTop: 0, marginBottom: 0, paddingVertical: 8 },
  todoListContainer: { paddingHorizontal: 12 },
  todoItem: { flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingVertical: 3 },
  todoItemDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F3F7' },
  todoIconWrapper: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  todoTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', lineHeight: 14, paddingRight: 10 },
  todoButton: { minWidth: 60, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  todoButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  bannerContainer: { marginHorizontal: isSmallScreen ? 14 : 20, marginTop: 10, position: 'relative' },
  inviteBanner: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', overflow: 'hidden', position: 'relative', minHeight: 125 },
  inviteContent: { flex: 1, zIndex: 2, justifyContent: 'center', paddingRight: 80 },
  inviteTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', lineHeight: 18, marginBottom: 3 },
  inviteSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', lineHeight: 13, marginBottom: 8 },
  inviteButton: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 7 },
  inviteButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#FFFFFF' },
  inviteGraphic: { width: 90, height: '100%', position: 'absolute', right: 0, top: 0, justifyContent: 'center', alignItems: 'center' },
  giantCoin: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFC33D', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFE078', transform: [{ perspective: 800 }, { rotateY: '-20deg' }], boxShadow: '-4px 8px 10px #F59E0B' },
  innerCoin: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F6A900', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FBBF24' },
  coinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF' },
  miniAvatar: { width: 26, height: 26, borderRadius: 13, position: 'absolute', borderWidth: 2, borderColor: '#FFFFFF' },
  inviteOrbitOne: { position: 'absolute', width: 95, height: 48, borderRadius: 48, borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed', transform: [{ rotate: '-18deg' }] },
  inviteOrbitTwo: { position: 'absolute', width: 85, height: 38, borderRadius: 40, borderWidth: 1, borderColor: '#F59E0B', borderStyle: 'dashed', transform: [{ rotate: '20deg' }] },
  storeGraphic: { width: 90, height: '100%', position: 'absolute', right: 5, top: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  closeBannerButton: { position: 'absolute', top: 8, right: 10, zIndex: 10 },
  carouselDotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 6, left: 0, right: 0, gap: 5 },
  carouselDot: { width: 6, height: 6, borderRadius: 3 },
  activeDotSlide0: { backgroundColor: '#10B981', width: 7, height: 7, borderRadius: 3.5 },
  activeDotSlide1: { backgroundColor: '#10B981', width: 7, height: 7, borderRadius: 3.5 },
  inactiveDot: { backgroundColor: '#D1D5DB' },
  quickActionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: isSmallScreen ? 10 : 16,
    justifyContent: 'space-between',
  },
  actionGridItem: { 
    width: '23.5%', 
    alignItems: 'center', 
    minHeight: 80, 
    paddingHorizontal: 2, 
    paddingVertical: 7, 
    borderWidth: 1, 
    borderColor: '#F1F3F7', 
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  actionGridIcon: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  actionGridText: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, lineHeight: 11.5, color: '#1A2840', textAlign: 'center', paddingHorizontal: 1 },
  timelineTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: isSmallScreen ? 14 : 20,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 4,
  },
  timelineTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineTabActive: {
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineTabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#475569'
  },
  timelineTabTextActive: {
    color: '#0F172A',
    fontFamily: 'Inter_700Bold',
  },
  timelineContentContainer: {
    marginHorizontal: isSmallScreen ? 14 : 20,
    marginBottom: 16,
  },
  timelineEmptyState: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timelineEmptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18
  },
  timelineList: { gap: 12 },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  timelineImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#F1F5F9'
  },
  timelineCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center'
  },
  timelineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6
  },
  timelineBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#D97706',
    textTransform: 'uppercase'
  },
  timelineTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4
  },
  timelineSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16
  },
  securityBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    marginHorizontal: isSmallScreen ? 14 : 20, 
    borderRadius: 14, 
    padding: 10, 
    marginTop: 8 
  },
  securityIconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10, boxShadow: '0px 2px 4px #000' },
  securityTextContent: { flex: 1 },
  securityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', marginBottom: 2 },
  securityDesc: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', lineHeight: 14 },
  lockIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  // Global Search Bar Styles
  searchBarWrapper: {
    marginHorizontal: isSmallScreen ? 14 : 20,
    marginTop: 4,
    marginBottom: 12,
    zIndex: 100,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchBarInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
    paddingVertical: 0,
  },
  searchResultsPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  searchFilterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchFilterTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchFilterTabActive: {
    backgroundColor: '#20365B',
    borderColor: '#20365B',
  },
  searchFilterTabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  searchFilterTabTextActive: {
    color: '#FFFFFF',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  searchThumbWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#F8FAFC',
  },
  searchThumb: {
    width: '100%',
    height: '100%',
  },
  searchThumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  searchInfoCol: {
    flex: 1,
  },
  searchResultTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#1A2840',
    flexShrink: 1,
  },
  searchResultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  searchResultBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  searchResultSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
});



