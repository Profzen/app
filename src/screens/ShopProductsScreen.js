import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Share, useWindowDimensions, Platform, StatusBar, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

import { useBuyGoods } from '../hooks/useBuyGoods';
import { useApp } from '../context/AppContext';
import PriceDisplay from '../components/PriceDisplay';
import ShopSmartFilterModal from '../components/ShopSmartFilterModal';
import WriteReviewModal from '../components/WriteReviewModal';
import { reviewService } from '../services/reviewService';

export default function ShopProductsScreen({ route }) {
  const navigation = useNavigation();
  const shopParam = route?.params?.shop;
  const [shop, setShop] = useState(shopParam || {});

  const { fetchAllProducts, fetchStoreDetails } = useBuyGoods();
  const { width } = useWindowDimensions();
  const { t, cartCount, user } = useApp();
  const [favorite, setFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [smartFilters, setSmartFilters] = useState({
    sortBy: 'featured',
    categories: [],
    inStockOnly: false,
    minPrice: null,
    maxPrice: null,
    pricePreset: 'all',
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [writeReviewVisible, setWriteReviewVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const merchantId = shop.raw?.id || shop.id;
      const slugOrId = shop.slug || merchantId;
      let storeProds = [];

      if (slugOrId) {
        const storeDetails = await fetchStoreDetails(slugOrId);
        if (storeDetails?.merchant) {
          setShop(prev => ({ ...prev, ...storeDetails.merchant, raw: storeDetails.merchant }));
        }
        if (storeDetails?.products && Array.isArray(storeDetails.products) && storeDetails.products.length > 0) {
          storeProds = storeDetails.products;
        }
      }

      if (storeProds.length === 0) {
        const allProds = await fetchAllProducts();
        storeProds = merchantId 
          ? allProds.filter(p => (p.merchant_id === merchantId || (p.merchant && p.merchant.id === merchantId)) && (p.status === 'active' || p.status === 'published' || !p.status))
          : allProds.filter(p => p.status === 'active' || p.status === 'published' || !p.status);
      }
      setProducts(storeProds);
      setLoading(false);
    };
    loadProducts();
  }, [shop.id, shop.raw?.id, shop.slug]);

  const numColumns = width >= 900 ? 4 : (width >= 600 ? 3 : 2);
  const cardGap = 8;
  const productWidth = width < 340 
    ? (width - 32) 
    : (width - 32 - (cardGap * (numColumns - 1))) / numColumns;
  
  const dynamicCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const shopCategoriesList = useMemo(() => {
    const raw = shop.shop_categories || shop.raw?.shop_categories || shop.category;
    if (!raw) return [t('shop.badges.marketplace', 'Marketplace')];
    if (Array.isArray(raw)) {
      return raw.map(c => (typeof c === 'string' ? c.trim() : (c?.name || String(c)))).filter(Boolean);
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.map(c => (typeof c === 'string' ? c.trim() : (c?.name || String(c)))).filter(Boolean);
          }
        } catch (e) {}
      }
      return trimmed.split(',').map(c => c.trim()).filter(Boolean);
    }
    return [t('shop.badges.marketplace', 'Marketplace')];
  }, [shop.shop_categories, shop.raw?.shop_categories, shop.category, t]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (smartFilters.sortBy && smartFilters.sortBy !== 'featured') count++;
    if (smartFilters.categories && smartFilters.categories.length > 0) count += smartFilters.categories.length;
    if (smartFilters.inStockOnly) count++;
    if (smartFilters.minPrice || smartFilters.maxPrice || smartFilters.pricePreset !== 'all') count++;
    return count;
  }, [smartFilters]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const pName = (product.title || product.name || '').toLowerCase();
      const pCategory = product.category || product.desc1 || 'All';
      let pPriceValue = 0;
      if (typeof product.price === 'number') {
        pPriceValue = product.price;
      } else if (product.variants && product.variants.length > 0 && product.variants[0].prices && product.variants[0].prices.length > 0) {
        pPriceValue = Number(product.variants[0].prices[0].amount) || 0;
      }

      // Query search
      if (query.trim() && !pName.includes(query.trim().toLowerCase())) {
        return false;
      }

      // Category chip filter
      if (category !== 'All' && pCategory !== category) {
        return false;
      }

      // Multi-select category filter from smart filter modal
      if (smartFilters.categories && smartFilters.categories.length > 0) {
        if (!smartFilters.categories.includes(pCategory)) {
          return false;
        }
      }

      // In-stock only filter
      if (smartFilters.inStockOnly) {
        if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
          return false;
        }
      }

      // Price range
      if (smartFilters.minPrice !== null && !isNaN(smartFilters.minPrice) && smartFilters.minPrice > 0) {
        if (pPriceValue < smartFilters.minPrice) return false;
      }
      if (smartFilters.maxPrice !== null && !isNaN(smartFilters.maxPrice) && smartFilters.maxPrice > 0) {
        if (pPriceValue > smartFilters.maxPrice) return false;
      }

      return true;
    });

    // Sorting
    if (smartFilters.sortBy === 'price_asc') {
      result.sort((a, b) => {
        const pA = Number(a.price) || (a.variants?.[0]?.prices?.[0]?.amount) || 0;
        const pB = Number(b.price) || (b.variants?.[0]?.prices?.[0]?.amount) || 0;
        return pA - pB;
      });
    } else if (smartFilters.sortBy === 'price_desc') {
      result.sort((a, b) => {
        const pA = Number(a.price) || (a.variants?.[0]?.prices?.[0]?.amount) || 0;
        const pB = Number(b.price) || (b.variants?.[0]?.prices?.[0]?.amount) || 0;
        return pB - pA;
      });
    } else if (smartFilters.sortBy === 'rating') {
      result.sort((a, b) => (Number(b.rating) || 5) - (Number(a.rating) || 5));
    } else if (smartFilters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return result;
  }, [products, category, query, smartFilters]);

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      const merchantId = shop.id || shop.raw?.id;
      await reviewService.submitReview({
        userId: user?.id,
        merchantId,
        rating,
        comment,
      });
      setToast({
        title: t('review.submitSuccessTitle', 'Avis publié !'),
        message: t('review.submitSuccessMsg', 'Merci pour votre retour. Votre avis est maintenant synchronisé.'),
      });
      setReviewsRefreshKey((k) => k + 1);
    } catch (err) {
      setToast({
        title: t('common.error', 'Erreur'),
        message: t('review.submitError', 'Impossible de publier votre avis. Veuillez réessayer.'),
      });
    }
  };

  const shareShop = async () => {
    const shopName = shop.name || shop.shop_name || shop.raw?.shop_name || 'Boutique DizzitUp';
    const shopSlug = shop.slug || shop.id || 'boutique';
    const shopUrl = `https://dizzitup.com/stores/${shopSlug}`;
    try {
      await Share.share({
        title: shopName,
        message: t('shop.giftRequestShopMsg', `Découvrez la boutique ${shopName} sur DizzitUp : ${shopUrl}`, { name: shopName, url: shopUrl })
      });
      setToast({
        title: t('shop.shareSuccessTitle', 'Boutique partagée'),
        message: t('shop.shareSuccessDesc', 'Le lien de la boutique a été partagé.')
      });
    } catch {
      setToast({
        title: t('shop.shareCopiedTitle', 'Lien copié'),
        message: `${shopUrl}`
      });
    }
  };

  const shareProductGift = async (product) => {
    const pName = product.name || product.title || 'Produit';
    const rawPrice = product.price || (product.variants?.[0]?.prices?.[0]?.amount || 0);
    const curr = product.currency || shop.currency || 'XOF';
    const pPrice = `${Number(rawPrice).toLocaleString()} ${curr}`;
    const shopName = shop.name || shop.shop_name || shop.raw?.shop_name || 'Boutique DizzitUp';
    const productUrl = `https://dizzitup.com/product/${product.id}`;
    try {
      await Share.share({
        title: t('shop.giftProductTitle', `Achetez-moi ceci : ${pName}`, { name: pName }),
        message: t('shop.giftProductMsg', `J'aimerais ce produit sur DizzitUp : ${pName} (${pPrice}) chez ${shopName}. Vous pouvez me l'offrir ici : ${productUrl}`, { name: pName, price: pPrice, shop: shopName, url: productUrl })
      });
      setToast({
        title: t('shop.shareSuccessTitle', 'Lien cadeau partagé'),
        message: t('shop.shareSuccessDesc', 'Le lien du produit a été partagé.')
      });
    } catch {
      setToast({
        title: t('shop.shareCopiedTitle', 'Lien copié'),
        message: `${productUrl}`
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity
              style={styles.iconBtnRight}
              onPress={() => {
                if (cartCount > 0) {
                  navigation.navigate('OrderVerificationScreen');
                } else {
                  setToast({ title: t('cart.emptyTitle', 'Panier vide'), message: t('cart.emptyDesc', 'Votre panier ne contient aucun article pour l\'instant.') });
                }
              }}
            >
              <Ionicons name="cart-outline" size={20} color="#1A2840" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => setFavorite(!favorite)}>
              <Ionicons name={favorite ? "heart" : "heart-outline"} size={20} color={favorite ? "#EF4444" : "#1A2840"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={shareShop}>
              <Ionicons name="share-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Condensed Shop Info */}
          <View style={styles.condensedInfo}>
            <View style={styles.logoCircle}>
              {(shop.logoUrl || shop.raw?.shop_logo_url || shop.shop_logo_url) ? (
                <Image source={{ uri: shop.logoUrl || shop.raw?.shop_logo_url || shop.shop_logo_url }} style={{ width: 64, height: 64, borderRadius: 32 }} resizeMode="cover" />
              ) : (
                <Image source={require('../../assets/brand/shop_placeholder.jpg')} style={{ width: 64, height: 64, borderRadius: 32 }} resizeMode="cover" />
              )}
              {(shop.is_verified || shop.verified) && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <View style={styles.verifiedBadgeBg} />
                </View>
              )}
            </View>
            <View style={styles.condensedContent}>
              <View style={styles.shopNameRow}>
                <Text style={styles.shopName}>{shop.name || shop.raw?.shop_name || shop.shop_name || t('shop.default_name', 'Boutique')}</Text>
                {(shop.is_verified || shop.verified) && <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{marginLeft: 4}} />}
              </View>
              {/* Categories Pills List (Neat Wrapping List, No Horizontal Scroll) */}
              <View style={styles.shopCategoriesWrapper}>
                {shopCategoriesList.map((cat, idx) => (
                  <View key={idx} style={styles.shopCategoryPill}>
                    <Text style={styles.shopCategoryPillText}>{cat}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.shopMetaRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{shop.rating || '5.0'}</Text>
                <Text style={styles.reviewsText}>({shop.review_count || shop.reviews || t('shop.reviews.verifiedMerchant', 'Marchand vérifié')})</Text>
                <Text style={styles.dotSeparator}>|</Text>
                <Ionicons name="location-outline" size={12} color="#64748B" />
                <Text style={styles.locationText}>{shop.location || [shop.raw?.city_village || shop.city_village || shop.city, shop.raw?.country || shop.country].filter(Boolean).join(', ')}</Text>
                {!!shop.distance && (
                  <>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.distanceText}>{shop.distance}</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsCard}>
            <Text style={styles.paymentMethodsTitle}>{t('shop.sections.accepted_payment_methods', 'Moyens de paiement acceptés')}</Text>
            <View style={styles.paymentIconsRow}>
              <View style={styles.paymentItem}>
                <View style={styles.tokenIconBg}><CryptoIcon symbol="USDT" size={36} /></View>
                <Text style={styles.tokenLabel}>USDT</Text>
              </View>
              <View style={styles.paymentItem}>
                <View style={styles.tokenIconBg}><CryptoIcon symbol="USDC" size={36} /></View>
                <Text style={styles.tokenLabel}>USDC</Text>
              </View>
              <View style={styles.paymentItem}>
                <View style={styles.tokenIconBg}><CryptoIcon symbol="EURC" size={36} /></View>
                <Text style={styles.tokenLabel}>EURC</Text>
              </View>
              <View style={styles.paymentItem}>
                <View style={styles.tokenIconBg}><CryptoIcon symbol="DZY" size={36} /></View>
                <Text style={styles.tokenLabel}>DZY</Text>
              </View>
              <TouchableOpacity style={styles.paymentItem}>
                <Text style={styles.plusLink}>{t('shop.categories.more', '+ Plus')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, activeTab === 'products' && styles.tabActive]} onPress={() => setActiveTab('products')}>
              <Ionicons name="bag-handle-outline" size={16} color={activeTab === 'products' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'products' ? styles.tabTextActive : styles.tabTextInactive}>{t('shop.tabs.products', 'Produits')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'reviews' && styles.tabActive]} onPress={() => setActiveTab('reviews')}>
              <Ionicons name="star-outline" size={16} color={activeTab === 'reviews' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'reviews' ? styles.tabTextActive : styles.tabTextInactive}>{t('shop.tabs.reviews', 'Avis')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.tabActive]} onPress={() => setActiveTab('info')}>
              <Ionicons name="information-circle-outline" size={16} color={activeTab === 'info' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'info' ? styles.tabTextActive : styles.tabTextInactive}>{t('shop.tabs.info', 'Infos')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'shop' && styles.tabActive]} onPress={() => setActiveTab('shop')}>
              <Ionicons name="storefront-outline" size={16} color={activeTab === 'shop' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'shop' ? styles.tabTextActive : styles.tabTextInactive}>{t('shop.tabs.store', 'Boutique')}</Text>
            </TouchableOpacity>
          </View>

          {activeTab !== 'products' && (
            <ShopTabContent 
              tab={activeTab} 
              shop={shop} 
              onViewShop={() => navigation.navigate('ShopDetailsScreen', { shop: shop })} 
              onOpenWriteModal={(existingRev) => {
                setEditingReview(existingRev || null);
                setWriteReviewVisible(true);
              }}
              reviewsRefreshTrigger={reviewsRefreshKey}
              t={t} 
              currentUser={user}
            />
          )}

          <View style={activeTab === 'products' ? null : styles.hidden}>

          {/* Search & Filter */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{marginRight: 8}} />
              <TextInput 
                style={styles.searchInput} 
                placeholder={t('shop.products.search_placeholder', 'Rechercher un produit...')} 
                placeholderTextColor="#94A3B8"
                value={query}
                onChangeText={setQuery}
              />
            </View>
            <TouchableOpacity 
              style={[styles.btnFilter, activeFilterCount > 0 && styles.btnFilterActive]} 
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons 
                name="options-outline" 
                size={18} 
                color={activeFilterCount > 0 ? '#1A2840' : '#3B82F6'} 
                style={{marginRight: 6}} 
              />
              <Text style={[styles.btnFilterText, activeFilterCount > 0 && styles.btnFilterTextActive]}>
                {activeFilterCount > 0 ? `${t('shop.products.filter', 'Filtrer')} (${activeFilterCount})` : t('shop.products.filter', 'Filtrer')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {dynamicCategories.map((item) => (
              <TouchableOpacity 
                key={item} 
                style={category === item ? styles.categoryChipActive : styles.categoryChip} 
                onPress={() => setCategory(item)}
              >
                <Text style={category === item ? styles.categoryChipTextActive : styles.categoryChipText}>
                  {item === 'All' ? t('shop.categories.all', 'All') : item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {loading ? (
              <ActivityIndicator size="large" color="#3B82F6" style={{ margin: 30, width: '100%' }} />
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyProducts}>
                <Ionicons name="cube-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyProductsText}>{t('shop.products.no_products_found', 'Aucun produit trouvé dans cette boutique.')}</Text>
              </View>
            ) : (
              filteredProducts.map((product) => (
                <View key={product.id} style={[styles.productCard, {width: productWidth}]}>
                  <TouchableOpacity style={styles.heartIcon} onPress={() => setFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])}>
                    <Ionicons name={favorites.includes(product.id) ? "heart" : "heart-outline"} size={14} color={favorites.includes(product.id) ? "#EF4444" : "#64748B"} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('ProductDetailsScreen', { product: product, shop: shop })}>
                    {product.product_images && product.product_images.length > 0 ? (
                      <Image source={{ uri: product.product_images[0] }} style={styles.productImgPlaceholder} resizeMode="cover" />
                    ) : product.thumbnail ? (
                      <Image source={{ uri: product.thumbnail }} style={styles.productImgPlaceholder} resizeMode="cover" />
                    ) : product.images && product.images.length > 0 ? (
                      <Image source={{ uri: product.images[0] }} style={styles.productImgPlaceholder} resizeMode="cover" />
                    ) : (
                      <Image source={require('../../assets/brand/product_no_image.jpg')} style={styles.productImgPlaceholder} resizeMode="cover" />
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.productContent}>
                    <TouchableOpacity onPress={() => navigation.navigate('ProductDetailsScreen', { product: product, shop: shop })}>
                      <Text style={styles.productName} numberOfLines={1}>{product.title || product.name}</Text>
                      <Text style={styles.productDesc} numberOfLines={1}>{product.subtitle || ''}</Text>
                      <Text style={styles.productDescLines} numberOfLines={2}>{product.description || ''}</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.priceStockRow}>
                      <PriceDisplay 
                        amount={product.price || (product.variants?.[0]?.prices?.[0]?.amount || 0)} 
                        baseCurrency={product.currency || shop.currency || 'XOF'} 
                        targetCountry={shop?.country || product?.merchant?.country}
                      />
                      <Text style={styles.productStock}>
                        {(product.stock_quantity !== undefined && product.stock_quantity <= 0) ? t('outOfStock', 'Rupture') : (product.stock || t('shop.products.in_stock', 'En stock'))}
                      </Text>
                    </View>
                    
                    {/* Dual Action: Buy (Acheter) & Buy me (Achetez-moi) */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity 
                        style={styles.btnBuyCard} 
                        onPress={() => navigation.navigate('ProductDetailsScreen', { product: product, shop: shop })}
                      >
                        <Ionicons name="cart-outline" size={13} color="#1A2840" style={{marginRight: 4}} />
                        <Text style={styles.btnBuyCardText}>{t('shop.actions.buy', 'Acheter')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.btnBuyMeCard} 
                        onPress={() => shareProductGift(product)}
                      >
                        <Ionicons name="gift-outline" size={13} color="#1D4ED8" style={{marginRight: 4}} />
                        <Text style={styles.btnBuyMeCardText}>{t('shop.actions.buy_me', 'Achetez-moi')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Footer Features */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.footerFeaturesScroll}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>{t('shop.features.secure_payment', 'Paiement sécurisé')}</Text>
                <Text style={styles.featureSubtitle}>{t('shop.features.secure_100', '100% sécurisé par Escrow')}</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="bus-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>{t('shop.features.fast_delivery', 'Livraison rapide')}</Text>
                <Text style={styles.featureSubtitle}>
                  {shop.country ? `${t('shop.features.nationwide_delivery', 'Livraison')} • ${shop.country}` : t('shop.features.fast_delivery', 'Livraison rapide & suivie')}
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="headset-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>{t('shop.features.support_24_7', 'Support 7j/7')}</Text>
                <Text style={styles.featureSubtitle}>{t('shop.features.dedicated_support', 'Assistance dédiée')}</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>{t('shop.features.verified_seller', 'Vendeur vérifié')}</Text>
                <Text style={styles.featureSubtitle}>{t('shop.features.trusted_merchant', 'Marchand de confiance')}</Text>
              </View>
            </View>
          </ScrollView>
          </View>

        </ScrollView>
        <BottomNavBar activeTab="shops" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}

        {/* Smart Filter Modal */}
        <ShopSmartFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          products={products}
          currency={shop.currency || 'USD'}
          currentFilters={smartFilters}
          onApplyFilters={setSmartFilters}
        />

        {/* Write Review Modal */}
        <WriteReviewModal
          visible={writeReviewVisible}
          onClose={() => {
            setWriteReviewVisible(false);
            setEditingReview(null);
          }}
          shopName={shop.name || shop.shop_name || shop.raw?.shop_name}
          onSubmit={handleReviewSubmit}
          initialRating={editingReview?.rating || 5}
          initialComment={editingReview?.comment || ''}
          isEditing={!!editingReview}
        />
      </View>
    </SafeAreaView>
  );
}

function ShopReviewsTabContent({ shop, shopName, onOpenWriteModal, reviewsRefreshTrigger, t, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [votedMap, setVotedMap] = useState({});

  React.useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      setLoading(true);
      const merchantId = shop.id || shop.raw?.id;
      const data = await reviewService.fetchMerchantReviews(merchantId);
      if (isMounted) {
        setReviews(data || []);
        setLoading(false);
      }
    };
    loadReviews();
    return () => { isMounted = false; };
  }, [shop.id, shop.raw?.id, reviewsRefreshTrigger]);

  const handleVoteHelpful = async (rev) => {
    if (votedMap[rev.id]) return;
    setVotedMap((prev) => ({ ...prev, [rev.id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === rev.id ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r))
    );
    await reviewService.voteHelpful(rev.id, rev.helpfulVotes || 0);
  };

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : (shop.rating || '5.0');

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const sortedReviews = React.useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [reviews, sortBy]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const myReview = React.useMemo(() => {
    if (!currentUser?.id) return null;
    return reviews.find(
      (r) => r.userId === currentUser.id || r.user_id === currentUser.id
    ) || null;
  }, [reviews, currentUser?.id]);

  return (
    <View style={styles.tabPage}>
      {/* Header & Write Review Action */}
      <View style={styles.reviewsHeaderRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.tabPageTitle}>
            {t('shop.reviews.title', 'Avis clients')} ({totalReviews})
          </Text>
          <Text style={styles.reviewsHeaderSub}>
            {t('shop.reviews.sub', 'Avis authentifiés et vérifiés')}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.btnWriteReview} 
          onPress={() => onOpenWriteModal(myReview)} 
          activeOpacity={0.85}
        >
          <Ionicons 
            name={myReview ? "pencil" : "create-outline"} 
            size={15} 
            color="#1A2840" 
            style={{ marginRight: 5 }} 
          />
          <Text style={styles.btnWriteReviewText}>
            {myReview 
              ? t('shop.reviews.editBtn', 'Modifier mon avis') 
              : t('shop.reviews.writeBtn', 'Donner un avis')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Summary Card with breakdown bars (Amazon / Shopify style) */}
      <View style={styles.ratingCardContainer}>
        <View style={styles.ratingCardLeft}>
          <Text style={styles.ratingScoreBig}>{avgRating}</Text>
          <View style={styles.starsRowCompact}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.round(Number(avgRating)) ? 'star' : 'star-outline'}
                size={16}
                color="#F59E0B"
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
          <Text style={styles.ratingCountSub}>
            {t('shop.reviews.basedOn', `Basé sur ${totalReviews} avis`, { count: totalReviews })}
          </Text>
          <View style={styles.verifiedBuyersBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.verifiedBuyersBadgeText}>{t('shop.reviews.verifiedBuyers', '100% Vérifié')}</Text>
          </View>
        </View>

        <View style={styles.ratingCardRight}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star];
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <View key={star} style={styles.breakdownRow}>
                <Text style={styles.breakdownStarLabel}>{star}★</Text>
                <View style={styles.breakdownTrack}>
                  <View style={[styles.breakdownFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.breakdownPctText}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Trust Notice */}
      <View style={styles.trustBanner}>
        <Ionicons name="shield-checkmark" size={18} color="#10B981" style={{ marginRight: 8 }} />
        <Text style={styles.trustBannerText}>
          {t('shop.reviews.escrowGuarantee', 'Commandes sécurisées par contrat intelligent Escrow. Les avis sont authentifiés après confirmation de réception.')}
        </Text>
      </View>

      {/* Loading state */}
      {loading && (
        <ActivityIndicator size="small" color="#FFB800" style={{ marginVertical: 20 }} />
      )}

      {/* Empty State */}
      {!loading && totalReviews === 0 && (
        <View style={styles.emptyReviewsCard}>
          <Ionicons name="chatbubbles-outline" size={36} color="#94A3B8" style={{ marginBottom: 8 }} />
          <Text style={styles.emptyReviewsTitle}>
            {t('shop.reviews.beFirst', 'Soyez le premier à donner votre avis !')}
          </Text>
          <Text style={styles.emptyReviewsSub}>
            {t('shop.reviews.shareExperience', `Partagez votre expérience d'achat chez ${shopName}.`, { name: shopName })}
          </Text>
          <TouchableOpacity style={[styles.btnWriteReview, { marginTop: 12 }]} onPress={onOpenWriteModal} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={15} color="#1A2840" style={{ marginRight: 5 }} />
            <Text style={styles.btnWriteReviewText}>{t('shop.reviews.writeBtn', 'Donner un avis')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reviews List */}
      {!loading && totalReviews > 0 && (
        <View style={styles.reviewsListContainer}>
          {/* Sorting Row */}
          <View style={styles.reviewsSortRow}>
            <Text style={styles.reviewsSortLabel}>{t('shop.reviews.sort', 'Trier :')}</Text>
            <View style={styles.reviewsSortPills}>
              {[
                { id: 'newest', label: t('shop.reviews.sortNewest', 'Plus récents') },
                { id: 'highest', label: t('shop.reviews.sortHighest', 'Mieux notés') },
                { id: 'lowest', label: t('shop.reviews.sortLowest', 'Moins bien notés') },
              ].map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.reviewSortChip, sortBy === s.id && styles.reviewSortChipActive]}
                  onPress={() => setSortBy(s.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.reviewSortChipText, sortBy === s.id && styles.reviewSortChipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cards */}
          {sortedReviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerAvatarText}>{rev.authorInitials || 'DZ'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.reviewerNameRow}>
                    <Text style={styles.reviewerName}>{rev.authorName}</Text>
                    {rev.isVerifiedBuyer && (
                      <View style={styles.verifiedTag}>
                        <Ionicons name="checkmark-circle" size={11} color="#059669" style={{ marginRight: 2 }} />
                        <Text style={styles.verifiedTagText}>{t('shop.reviews.verifiedBuyer', 'Acheteur vérifié')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewDate}>{formatDate(rev.createdAt)}</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= rev.rating ? 'star' : 'star-outline'}
                      size={13}
                      color="#F59E0B"
                    />
                  ))}
                </View>
              </View>

              {!!rev.comment && <Text style={styles.reviewCommentText}>{rev.comment}</Text>}

              <View style={styles.reviewCardFooter}>
                <TouchableOpacity
                  style={[styles.btnHelpful, votedMap[rev.id] && styles.btnHelpfulActive]}
                  onPress={() => handleVoteHelpful(rev)}
                  disabled={votedMap[rev.id]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={votedMap[rev.id] ? 'thumbs-up' : 'thumbs-up-outline'}
                    size={13}
                    color={votedMap[rev.id] ? '#059669' : '#64748B'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.btnHelpfulText, votedMap[rev.id] && styles.btnHelpfulTextActive]}>
                    {t('shop.reviews.helpful', 'Utile')} ({rev.helpfulVotes || 0})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ShopTabContent({ tab, shop, onViewShop, onOpenWriteModal, reviewsRefreshTrigger, t, currentUser }) {
  const shopName = shop.name || shop.shop_name || shop.raw?.shop_name || t('shop.default_name', 'Boutique');

  if (tab === 'reviews') {
    return (
      <ShopReviewsTabContent
        shop={shop}
        shopName={shopName}
        onOpenWriteModal={onOpenWriteModal}
        reviewsRefreshTrigger={reviewsRefreshTrigger}
        t={t}
        currentUser={currentUser}
      />
    );
  }

  if (tab === 'info') {
    const address = shop.shop_address || shop.street_name_number || shop.african_way_address || [shop.city_village || shop.raw?.city_village, shop.country || shop.raw?.country].filter(Boolean).join(', ') || t('shop.info.not_specified', 'Non spécifié');
    const hours = shop.opening_hours || 'Lundi – Samedi, 08:00 – 20:00';
    const deliveryText = Array.isArray(shop.delivery_modes) && shop.delivery_modes.length > 0 
      ? shop.delivery_modes.map(m => m === 'picking' ? 'Retrait boutique' : (m === 'delivery' ? 'Livraison' : m)).join(', ') 
      : t('shop.info.delivery_options', 'Livraison à domicile & retrait en boutique');
    const verification = (shop.is_verified || shop.verified) ? t('shop.info.verified_merchant', 'Marchand vérifié par DizzitUp') : t('shop.info.partner_store', 'Boutique partenaire DizzitUp');

    const infoItems = [
      { icon: 'time-outline', title: t('shop.info.opening_hours', 'Horaires'), text: hours },
      { icon: 'bus-outline', title: t('shop.info.delivery', 'Livraison & Retrait'), text: deliveryText },
      { icon: 'location-outline', title: t('shop.info.address', 'Adresse'), text: address },
      { icon: 'shield-checkmark-outline', title: 'Sécurité & Vérification', text: verification }
    ];

    if (shop.shop_email || shop.shop_mobile_number) {
      infoItems.push({
        icon: 'call-outline',
        title: 'Contact',
        text: [shop.shop_mobile_number, shop.shop_email].filter(Boolean).join(' • ')
      });
    }

    return (
      <View style={styles.tabPage}>
        <Text style={styles.tabPageTitle}>{t('shop.info.practical_info', 'Informations pratiques')}</Text>
        {infoItems.map((item) => (
          <View key={item.title} style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name={item.icon} size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>{item.title}</Text>
              <Text style={styles.tabPageText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  const aboutText = shop.description || shop.about || shop.shop_description || t('shop.default_about', 'Bienvenue sur la boutique officielle de {{name}} sur DizzitUp. Découvrez nos produits certifiés avec garantie de livraison par séquestre Escrow.', { name: shopName });

  return (
    <View style={styles.tabPage}>
      <Text style={styles.tabPageTitle}>{t('shop.sections.about_store', 'À propos de la boutique')}</Text>
      <Text style={styles.tabPageText}>{aboutText}</Text>
      <TouchableOpacity style={styles.viewShopButton} onPress={onViewShop}>
        <Ionicons name="storefront-outline" size={19} color="#1A2840" />
        <Text style={styles.viewShopButtonText}>{t('shop.actions.view_full_profile', 'Voir la fiche complète')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    borderColor: '#E2E8F0',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  condensedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF9E00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeBg: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    zIndex: -1,
    borderRadius: 5,
  },
  condensedContent: {
    flex: 1,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  shopCategoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  shopCategoryPill: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopCategoryPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#7C3AED',
    lineHeight: 15,
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#1A2840',
    marginLeft: 2,
  },
  reviewsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginLeft: 2,
  },
  dotSeparator: {
    color: '#CBD5E1',
    marginHorizontal: 4,
    fontSize: 10,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#1A2840',
    marginLeft: 2,
  },
  distanceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#1A2840',
  },
  paymentMethodsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  paymentMethodsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 12,
    textAlign: 'center',
  },
  paymentIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tokenLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#1A2840',
  },
  plusLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#3B82F6',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 24,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFB800',
  },
  tabTextInactive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#94A3B8',
  },
  tabTextActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFB800',
  },
  searchFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    outlineStyle: 'none',
    padding: 0,
  },
  btnFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  btnFilterActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FFB800',
  },
  btnFilterText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#3B82F6',
  },
  btnFilterTextActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChipActive: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryChipTextActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1A2840',
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
  },
  categoryChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
  categoryChipTextBlue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#3B82F6',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    gap: 8,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  hidden: { display: 'none' },
  filterPanel: { marginHorizontal: 16, marginBottom: 14, padding: 12, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterPanelTitle: { fontFamily: 'Inter_700Bold', color: '#1A2840', marginBottom: 6 },
  filterOption: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderRadius: 10 },
  filterOptionActive: { backgroundColor: '#FFF8E6' },
  filterOptionText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#1A2840' },
  tabPage: { margin: 16, padding: 18, backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  tabPageTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#1A2840' },
  tabPageText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: '#64748B' },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reviewsHeaderSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  btnWriteReview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnWriteReviewText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  ratingCardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  ratingCardLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#FDE68A',
    minWidth: 100,
  },
  ratingScoreBig: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: '#1A2840',
    lineHeight: 40,
  },
  starsRowCompact: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  ratingCountSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
  },
  verifiedBuyersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  verifiedBuyersBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#059669',
  },
  ratingCardRight: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2.5,
  },
  breakdownStarLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#475569',
    width: 26,
  },
  breakdownTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  breakdownPctText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    color: '#64748B',
    width: 32,
    textAlign: 'right',
  },
  reviewsListContainer: {
    marginTop: 8,
  },
  reviewsSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reviewsSortLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  reviewsSortPills: {
    flexDirection: 'row',
    gap: 6,
  },
  reviewSortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewSortChipActive: {
    backgroundColor: '#1A2840',
    borderColor: '#1A2840',
  },
  reviewSortChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  reviewSortChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  reviewerAvatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#3B82F6',
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  reviewerName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#059669',
  },
  reviewDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCommentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#334155',
    marginBottom: 10,
  },
  reviewCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  btnHelpful: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnHelpfulActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  btnHelpfulText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  btnHelpfulTextActive: {
    color: '#059669',
    fontFamily: 'Inter_600SemiBold',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', marginBottom: 3 },
  viewShopButton: { 
    marginTop: 18, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#FFB800', 
    flexDirection: 'row', 
    gap: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  viewShopButtonText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1A2840' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 40 },
  heartIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 1,
  },
  productImgPlaceholder: {
    height: 140,
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  productContent: {
    flex: 1,
    paddingTop: 4,
  },
  productName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 2,
    lineHeight: 16,
  },
  productDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
  },
  productDescLines: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginBottom: 6,
    height: 24,
    lineHeight: 12,
  },
  priceStockRow: {
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  productStock: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#10B981',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  btnBuyCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFB800',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  btnBuyCardText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10.5,
    color: '#1A2840',
  },
  btnBuyMeCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBuyMeCardText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#1D4ED8',
  },
  emptyProducts: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyProductsText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  trustBannerText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
  },
  emptyReviewsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviewsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyReviewsSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  footerFeaturesScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 180,
  },
  featureTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  featureSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
});
