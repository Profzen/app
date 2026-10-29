import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Share, Platform, StatusBar, ActivityIndicator, ImageBackground, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import PriceDisplay from '../components/PriceDisplay';
import { useBuyGoods } from '../hooks/useBuyGoods';
import { useApp } from '../context/AppContext';
import { parseCleanCategories, getCountryFlagUrl, formatMerchantLocation } from '../utils/categoryUtils';
import { getProductCoverImage } from '../utils/productMedia';
import { buildDzyStoreUrl } from '../utils/storeUtils';
import { isPhysicalItem, isTicketProduct, getWebProductUrl } from '../utils/productUtils';
import QRCode from 'qrcode';
import Svg, { Rect } from 'react-native-svg';


export default function ShopDetailsScreen({ route }) {
  const navigation = useNavigation();
  const shopParam = route?.params?.shop;
  const initialShop = shopParam || {};

  const { t, cartCount, user, isFavorite, toggleFavorite } = useApp();
  const { fetchStoreDetails, fetchAllProducts } = useBuyGoods();

  const [shop, setShop] = useState(initialShop);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favoriteBusyKey, setFavoriteBusyKey] = useState(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [shopInfoExpanded, setShopInfoExpanded] = useState(false);
  const [paymentInfoExpanded, setPaymentInfoExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrInShareModal, setShowQrInShareModal] = useState(false);

  // Favorites (shared user_favorites table). Merchants can't favorite their own shop or products.
  const shopId = shop?.id || shop?.merchant_id || null;
  const isOwnShop = !!(user?.merchantProfile?.id && shopId && String(user.merchantProfile.id) === String(shopId));
  const shopIsFavorite = isFavorite('merchant', shopId);
  const handleToggleFavorite = async (targetType, targetId, label) => {
    const busyKey = `${targetType}:${targetId}`;
    if (!targetId || favoriteBusyKey === busyKey) return;
    setFavoriteBusyKey(busyKey);
    const result = await toggleFavorite(targetType, targetId);
    setFavoriteBusyKey(null);
    setToast(result.success
      ? { title: t(result.isFavorite ? 'profile.favorites.added' : 'profile.favorites.removed', result.isFavorite ? 'Added to your favorites' : 'Removed from your favorites'), message: label || '' }
      : { title: t('profile.favorites.error', "We couldn't update your favorites. Please try again."), message: '' });
  };

  const shopCategoriesList = useMemo(() => {
    const raw = shop.shop_categories || shop.raw?.shop_categories || shop.category;
    const parsed = parseCleanCategories(raw);
    if (parsed.length > 0) return parsed;
    return [t('shop.badges.marketplace', 'Marketplace')];
  }, [shop.shop_categories, shop.raw?.shop_categories, shop.category, t]);

  const storeFlagUrl = useMemo(() => {
    return getCountryFlagUrl(shop.country || shop.raw?.country || shop.country_code);
  }, [shop.country, shop.raw?.country, shop.country_code]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const slugOrId = initialShop.slug || initialShop.id;
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
        const merchantId = initialShop.id || shop.id;
        storeProds = merchantId
          ? allProds.filter(p => (p.merchant_id === merchantId || p.merchant?.id === merchantId) && (p.status === 'active' || p.status === 'published' || !p.status))
          : allProds.filter(p => p.status === 'active' || p.status === 'published' || !p.status);
      }

      setProducts(storeProds);
      setLoading(false);
    };

    loadData();
  }, [initialShop.slug, initialShop.id]);

  const copyToClipboard = (label, text) => {
    setToast({ title: t('copied_title', "{{label}} copied!", { label }), message: `${text}` });
  };

  const rawData = shop.raw || {};

  // 1. Location & Address Resolution (Prevents 'Not specified' when store location exists)
  const displayAddress = useMemo(() => {
    return (
      shop.shop_address ||
      rawData.shop_address ||
      shop.street_name_number ||
      rawData.street_name_number ||
      shop.street_name ||
      rawData.street_name ||
      shop.neighborhood ||
      rawData.neighborhood ||
      shop.african_way_address ||
      rawData.african_way_address ||
      shop.how_to_get_there ||
      rawData.how_to_get_there ||
      null
    );
  }, [shop, rawData]);

  const displayLocation = useMemo(() => {
    const city = shop.city_village || rawData.city_village || shop.city;
    const country = shop.country || rawData.country;
    const combined = [city, country].filter(Boolean).join(', ');
    if (combined) return combined;
    if (shop.location) return shop.location;
    return displayAddress || null;
  }, [shop, rawData, displayAddress]);

  const effectiveAddress = displayAddress || displayLocation || t('shop.info.not_specified', 'Not specified');
  const effectiveLocation = displayLocation || displayAddress || t('shop.info.not_specified', 'Not specified');

  // 2. Open in Maps (Apple Maps on iOS / Google Maps on Android & Web)
  const openInMaps = (addressOrLocation) => {
    if (!addressOrLocation || addressOrLocation === t('shop.info.not_specified', 'Not specified')) return;
    const query = encodeURIComponent(addressOrLocation.trim());
    const googleMapsWeb = `https://www.google.com/maps/search/?api=1&query=${query}`;

    if (Platform.OS === 'ios') {
      const appleMaps = `maps:0,0?q=${query}`;
      Linking.canOpenURL(appleMaps).then((supported) => {
        if (supported) {
          Linking.openURL(appleMaps);
        } else {
          Linking.openURL(googleMapsWeb);
        }
      }).catch(() => Linking.openURL(googleMapsWeb));
    } else if (Platform.OS === 'android') {
      const geoUrl = `geo:0,0?q=${query}`;
      Linking.canOpenURL(geoUrl).then((supported) => {
        if (supported) {
          Linking.openURL(geoUrl);
        } else {
          Linking.openURL(googleMapsWeb);
        }
      }).catch(() => Linking.openURL(googleMapsWeb));
    } else {
      Linking.openURL(googleMapsWeb);
    }
  };

  // 3. Social Media URLs & Merchant Settings Resolution
  const merchantWhatsapp = shop.shop_whatsapp_number || rawData.shop_whatsapp_number || shop.whatsapp;
  const merchantTelegram = shop.shop_telegram_username || rawData.shop_telegram_username || shop.telegram || shop.shop_telegram;
  const merchantFacebook = shop.shop_facebook_page || rawData.shop_facebook_page || shop.facebook || shop.shop_facebook;
  const merchantInstagram = shop.shop_instagram || rawData.shop_instagram || shop.instagram;
  const rawWebsite = shop.shop_website || rawData.shop_website || shop.website;
  const merchantWebsite = (rawWebsite && !rawWebsite.includes('dizzitup.com/DZYstore')) ? rawWebsite : null;

  const getCleanHandle = (value, platform) => {
    if (!value || typeof value !== 'string') return null;
    let str = value.trim();
    if (!str) return null;
    str = str.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    if (platform === 'telegram') {
      str = str.replace(/^t\.me\//i, '').replace(/^\/+/, '');
      return str.startsWith('@') ? str : '@' + str;
    }
    if (platform === 'instagram') {
      str = str.replace(/^instagram\.com\//i, '').replace(/^\/+/, '');
      return str.startsWith('@') ? str : '@' + str;
    }
    if (platform === 'facebook') {
      str = str.replace(/^facebook\.com\//i, '').replace(/^\/+/, '');
      return str.startsWith('@') ? str : '@' + str;
    }
    if (platform === 'website') {
      return str.split('/')[0];
    }
    if (platform === 'whatsapp') {
      return str;
    }
    return str;
  };

  const tgHandle = getCleanHandle(merchantTelegram, 'telegram');
  const igHandle = getCleanHandle(merchantInstagram, 'instagram');
  const fbHandle = getCleanHandle(merchantFacebook, 'facebook');
  const webHandle = getCleanHandle(merchantWebsite, 'website');

  const cleanWhatsAppUrl = (phone) => {
    if (!phone || typeof phone !== 'string') return null;
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length >= 7 ? `https://wa.me/${clean}` : null;
  };

  const normalizeTelegramUrl = (handle) => {
    if (!handle || typeof handle !== 'string') return null;
    const clean = handle.trim().replace(/^@/, '');
    if (!clean) return null;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    return `https://t.me/${clean}`;
  };

  const normalizeInstagramUrl = (handle) => {
    if (!handle || typeof handle !== 'string') return null;
    const clean = handle.trim().replace(/^@/, '');
    if (!clean) return null;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    return `https://instagram.com/${clean}`;
  };

  const normalizeFacebookUrl = (value) => {
    if (!value || typeof value !== 'string') return null;
    const clean = value.trim();
    if (!clean) return null;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    if (clean.includes('facebook.com')) return `https://${clean.replace(/^https?:\/\//, '')}`;
    return `https://facebook.com/${clean.replace(/^@/, '')}`;
  };

  const normalizeWebUrl = (value) => {
    if (!value || typeof value !== 'string') return null;
    const clean = value.trim();
    if (!clean) return null;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    return `https://${clean}`;
  };

  const waUrl = cleanWhatsAppUrl(merchantWhatsapp);
  const tgUrl = normalizeTelegramUrl(merchantTelegram);
  const fbUrl = normalizeFacebookUrl(merchantFacebook);
  const igUrl = normalizeInstagramUrl(merchantInstagram);
  const webUrl = normalizeWebUrl(merchantWebsite);

  const hasAnySocial = Boolean(waUrl || tgUrl || fbUrl || igUrl || webUrl);

  const shopName = shop.shop_name || shop.name || 'Store';
  const userRefCode = user?.referralCode || user?.referral_code || (user?.id ? `DZY-${user.id.slice(0, 6).toUpperCase()}` : '');
  const rawStoreUrl = buildDzyStoreUrl(shop);
  const publicStoreUrl = userRefCode ? `${rawStoreUrl}?ref=${encodeURIComponent(userRefCode)}` : rawStoreUrl;
  const shareText = `Check out ${shopName} on DizzitUp!`;
  const shareMessage = t('shop.shareShopMsg', "Discover the {{name}} store on DizzitUp: {{url}}", { name: shopName, url: publicStoreUrl });

  const shopQr = useMemo(() => {
    try {
      return QRCode.create(publicStoreUrl || 'https://dizzitup.com', {
        errorCorrectionLevel: 'M',
      });
    } catch {
      return null;
    }
  }, [publicStoreUrl]);

  const copyStoreLink = async () => {
    try {
      await Clipboard.setStringAsync(publicStoreUrl);
      setToast({
        title: t('shop.shareCopiedTitle', "Link copied"),
        message: t('store.linkCopied', 'Store link copied to clipboard!')
      });
    } catch {
      setToast({
        title: t('shop.shareCopiedTitle', "Link copied"),
        message: publicStoreUrl
      });
    }
  };

  const shareShop = async () => {
    try {
      await Share.share({
        title: shopName,
        message: shareMessage
      });
      setToast({
        title: t('shop.shareSuccessTitle', "Gift link ready"),
        message: t('shop.shareSuccessDesc', "The link is ready to be shared with friends and family.")
      });
    } catch {
      setToast({
        title: t('shop.shareCopiedTitle', "Link copied"),
        message: publicStoreUrl
      });
    }
  };

  const shareShopGiftRequest = async () => {
    try {
      await Share.share({
        title: t('shop.giftRequestTitle', "Buy this for me on DizzitUp: {{name}}", { name: shopName }),
        message: t('shop.giftRequestShopMsg', "Gift me items from {{name}} on DizzitUp: {{url}}", { name: shopName, url: publicStoreUrl })
      });
      setToast({
        title: t('shop.shareSuccessTitle', "Gift link ready"),
        message: t('shop.shareSuccessDesc', "The link is ready to be shared with friends and family.")
      });
    } catch {
      setToast({
        title: t('shop.shareCopiedTitle', "Link copied"),
        message: publicStoreUrl
      });
    }
  };

  const shareProductGift = async (product) => {
    const pName = product.name || product.title || 'Produit';
    const pPrice = product.price ? `${product.price.toLocaleString('fr-FR')} ${product.currency || 'USD'}` : '';
    const shopName = shop.shop_name || shop.name || 'DizzitUp Store';
    const productUrl = `https://dizzitup.com/product/${product.id}`;
    try {
      await Share.share({
        title: t('shop.giftProductTitle', "Buy this for me: {{name}}", { name: pName }),
        message: t('shop.giftProductMsg', "I would love this on DizzitUp: {{name}} ({{price}}) from {{shop}}. You can buy it for me here: {{url}}", { name: pName, price: pPrice, shop: shopName, url: productUrl })
      });
      setToast({
        title: t('shop.shareSuccessTitle', "Gift link ready"),
        message: t('shop.shareSuccessDesc', "The link is ready to be shared with friends and family.")
      });
    } catch {
      setToast({
        title: t('shop.shareCopiedTitle', "Link copied"),
        message: `${productUrl}`
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity
              style={styles.iconBtnRight}
              onPress={() => {
                if (cartCount > 0) {
                  navigation.navigate('OrderVerificationScreen');
                } else {
                  setToast({ title: t('cart.emptyTitle', "Empty cart"), message: t('cart.emptyDesc', "Your cart contains no items for now.") });
                }
              }}
            >
              <Ionicons name="cart-outline" size={18} color="#1A2840" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            {!isOwnShop && (
              <TouchableOpacity style={styles.iconBtnRight} onPress={() => handleToggleFavorite('merchant', shopId, shop?.name || shop?.shop_name)} accessibilityRole="button" accessibilityState={{ selected: shopIsFavorite }}>
                <Ionicons name={shopIsFavorite ? "heart" : "heart-outline"} size={18} color={shopIsFavorite ? "#EF4444" : "#1A2840"} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => setShowShareModal(true)}>
              <Ionicons name="share-outline" size={18} color="#1A2840" />
              <View style={styles.shareBadgeDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Banner Cover Area (Task 4: full width ~3:1, cover, soft dark gradient, logo circle overlapping bottom-left edge, no text on banner) */}
          <View style={styles.coverContainer}>
            <View style={styles.coverBg}>
              <Image
                source={shop.shop_banner_url ? { uri: shop.shop_banner_url } : (shop.bannerUrl ? { uri: shop.bannerUrl } : require('../../assets/brand/store_default_banner.jpg'))}
                defaultSource={require('../../assets/brand/store_default_banner.jpg')}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.65)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>

            {/* Circular Logo overlapping bottom-left edge */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                {(shop.shop_logo_url || shop.logoUrl) ? (
                  <Image source={{ uri: shop.shop_logo_url || shop.logoUrl }} style={{ width: 64, height: 64, borderRadius: 32 }} resizeMode="cover" />
                ) : (
                  <Image source={require('../../assets/brand/shop_placeholder.jpg')} style={{ width: 64, height: 64, borderRadius: 32 }} resizeMode="cover" />
                )}
              </View>
              {(shop.is_verified || shop.verified) && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}
            </View>
          </View>

          {/* Shop Metadata */}
          <View style={styles.shopInfoHeader}>
            <View style={[styles.shopNameRow, { flexWrap: 'wrap', gap: 6 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                <Text style={[styles.shopName, { flexShrink: 1 }]} numberOfLines={2}>{shop.shop_name || shop.name || t('shop.default_name', "Shop")}</Text>
                {(shop.is_verified || shop.verified) && <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 6, flexShrink: 0 }} />}
              </View>
              <View style={[styles.flagCityBadge, { marginLeft: 0 }]}>
                {storeFlagUrl ? (
                  <Image source={{ uri: storeFlagUrl }} style={{ width: 16, height: 11, marginRight: 4, borderRadius: 2 }} />
                ) : null}
                <Text style={styles.flagCityText}>
                  {formatMerchantLocation(
                    shop.city_village || shop.raw?.city_village || shop.city,
                    shop.country || shop.raw?.country || shop.country_code
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.badgesRow}>
              <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>{t('shop.badges.active', 'ACTIVE')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="bus-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={[styles.statusBadgeText, { color: '#64748B' }]}>{shop.deliveryTime || '24h'}</Text>
              </View>
                {
                  shopCategoriesList.slice(0, 2).map((cat, idx) => (
                    <View key={idx} style={[styles.statusBadge, { backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#7C3AED' }]} numberOfLines={1}>{cat}</Text>
                    </View>
                  ))
                }
              {
                  shopCategoriesList.length > 2 && (
                    <View style={[styles.statusBadge, { backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#7C3AED' }]} numberOfLines={1}>+{shopCategoriesList.length - 2}</Text>
                    </View>
                  )
                }
            </View>

            <View style={styles.shopMetaRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{shop.rating || '5.0'}</Text>
              <Text style={styles.reviewsText}>({shop.review_count || shop.reviews || t('shop.reviews.verifiedMerchant', "Verified merchant")})</Text>
              <Text style={styles.dotSeparator}>•</Text>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}
                onPress={() => openInMaps(effectiveLocation)}
                activeOpacity={0.7}
              >
                <Ionicons name="location-outline" size={13} color="#2563EB" style={{ marginRight: 2 }} />
                <Text style={[styles.locationText, { color: '#2563EB', textDecorationLine: 'underline' }]} numberOfLines={1}>
                  {effectiveLocation}
                </Text>
              </TouchableOpacity>

              {!!shop.distance && (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.distanceText}>{shop.distance}</Text>
                </>
              )}
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={18} color="#1A2840" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>{products.length}</Text>
                <Text style={styles.statLabel}>{t('shop.stats.products', 'Products')}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>{shop.is_verified ? t('shop.stats.verified', 'Verified') : t('shop.stats.partner', 'Partner')}</Text>
                <Text style={styles.statLabel}>{t('shop.stats.escrow', 'Secure')}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flash-outline" size={18} color="#F59E0B" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>{shop.deliveryTime || '24-48h'}</Text>
                <Text style={styles.statLabel}>{t('shop.info.delivery', "Pickup / Delivery")}</Text>
              </View>
            </View>
          </View>

          {/* Social Profiles & Share Store Card */}
          <View style={styles.shareCardContainer}>
            <View style={styles.fullCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.cardTitle}>
                  {hasAnySocial ? t('shop.actions.connect_and_share', 'Store Links & Share') : t('shop.actions.share_store', 'Share store')}
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' }}
                  onPress={() => setShowShareModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-social-outline" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#2563EB' }}>
                    {t('shop.actions.share', 'Share')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.socialIconsRow}>
                {/* WhatsApp */}
                <TouchableOpacity
                  style={[styles.socialBrandBtn, { backgroundColor: waUrl ? '#25D366' : '#E5E7EB' }]}
                  onPress={() => waUrl ? Linking.openURL(waUrl).catch(() => setToast({ title: 'WhatsApp', message: t('shop.social.error', "Could not open link") })) : setToast({ title: 'WhatsApp', message: t('shop.social.missing', 'This store does not have a WhatsApp number provided.') })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={20} color={waUrl ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>

                {/* Telegram */}
                <TouchableOpacity
                  style={[styles.socialBrandBtn, { backgroundColor: tgUrl ? '#229ED9' : '#E5E7EB' }]}
                  onPress={() => tgUrl ? Linking.openURL(tgUrl).catch(() => setToast({ title: 'Telegram', message: t('shop.social.error', "Could not open link") })) : setToast({ title: 'Telegram', message: t('shop.social.missing', 'This store does not have a Telegram account provided.') })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="paper-plane" size={18} color={tgUrl ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>

                {/* Instagram */}
                <TouchableOpacity
                  onPress={() => igUrl ? Linking.openURL(igUrl).catch(() => setToast({ title: 'Instagram', message: t('shop.social.error', "Could not open link") })) : setToast({ title: 'Instagram', message: t('shop.social.missing', 'This store does not have an Instagram account provided.') })}
                  activeOpacity={0.8}
                >
                  {igUrl ? (
                    <LinearGradient
                      colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.socialBrandBtn}
                    >
                      <Ionicons name="logo-instagram" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.socialBrandBtn, { backgroundColor: '#E5E7EB' }]}>
                      <Ionicons name="logo-instagram" size={20} color="#9CA3AF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={[styles.socialBrandBtn, { backgroundColor: fbUrl ? '#1877F2' : '#E5E7EB' }]}
                  onPress={() => fbUrl ? Linking.openURL(fbUrl).catch(() => setToast({ title: 'Facebook', message: t('shop.social.error', "Could not open link") })) : setToast({ title: 'Facebook', message: t('shop.social.missing', 'This store does not have a Facebook page provided.') })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-facebook" size={20} color={fbUrl ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>

                {/* Direct Share Circle Button */}
                <TouchableOpacity
                  style={[styles.socialBrandBtn, { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#BFDBFE' }]}
                  onPress={() => setShowShareModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social-outline" size={18} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Accordion 1: Informations sur la boutique */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShopInfoExpanded(!shopInfoExpanded)}
            >
              <Text style={styles.accordionTitle}>{t('shop.info.title', "Store information")}</Text>
              <Ionicons name={shopInfoExpanded ? "chevron-up" : "chevron-down"} size={20} color="#1A2840" />
            </TouchableOpacity>
            {shopInfoExpanded && (
              <View style={styles.accordionContent}>
                {/* ── 1. Logistics Section ── */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => openInMaps(effectiveAddress)}
                  activeOpacity={effectiveAddress !== t('shop.info.not_specified', "Not specified") ? 0.7 : 1}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons name="cube-outline" size={18} color="#1A2840" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.address', "Address")}</Text>
                    <Text style={effectiveAddress !== t('shop.info.not_specified', "Not specified") ? styles.channelHandle : styles.channelNotSpecified} numberOfLines={1}>
                      {effectiveAddress}
                    </Text>
                  </View>
                  {effectiveAddress !== t('shop.info.not_specified', "Not specified") ? (
                    <View style={[styles.channelActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <Text style={[styles.channelActionText, { color: '#2563EB' }]}>{t('common.open', "Open")}</Text>
                      <Ionicons name="location-outline" size={12} color="#2563EB" style={{ marginLeft: 3 }} />
                    </View>
                  ) : (
                    <View style={styles.channelDisabledBadge}>
                      <Text style={styles.channelDisabledText}>{t('shop.info.not_specified', "Not specified")}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => openInMaps(effectiveLocation)}
                  activeOpacity={effectiveLocation !== t('shop.info.not_specified', "Not specified") ? 0.7 : 1}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="location-outline" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.location', "Location")}</Text>
                    <Text style={effectiveLocation !== t('shop.info.not_specified', "Not specified") ? styles.channelHandle : styles.channelNotSpecified} numberOfLines={1}>
                      {effectiveLocation}
                    </Text>
                  </View>
                  {effectiveLocation !== t('shop.info.not_specified', "Not specified") ? (
                    <View style={[styles.channelActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <Text style={[styles.channelActionText, { color: '#2563EB' }]}>{t('common.open', "Open")}</Text>
                      <Ionicons name="location-outline" size={12} color="#2563EB" style={{ marginLeft: 3 }} />
                    </View>
                  ) : (
                    <View style={styles.channelDisabledBadge}>
                      <Text style={styles.channelDisabledText}>{t('shop.info.not_specified', "Not specified")}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.channelCard}>
                  <View style={[styles.channelIconBox, { backgroundColor: '#F8FAFC' }]}>
                    <Ionicons name="bus-outline" size={18} color="#1A2840" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.delivery', "Pickup / Delivery")}</Text>
                    <Text style={styles.channelHandle}>
                      {shop.deliveryTime || '24-48h'} • {t('shop.info.available', "Available")}
                    </Text>
                  </View>
                  <View style={[styles.channelActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Text style={[styles.channelActionText, { color: '#059669' }]}>{t('shop.info.available', "Available")}</Text>
                    <Ionicons name="checkmark-circle-outline" size={12} color="#059669" style={{ marginLeft: 3 }} />
                  </View>
                </View>

                {/* ── 2. Social Media & Direct Contact Section (Clickable Brand Cards, NO RAW URLS!) ── */}
                <Text style={styles.sectionSubhead}>{t('shop.info.social_media_title', "Social Media & Contact")}</Text>

                {/* WhatsApp */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => { if (waUrl) Linking.openURL(waUrl); }}
                  activeOpacity={waUrl ? 0.7 : 1}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: '#25D36618' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.whatsapp', 'WhatsApp')}</Text>
                    <Text style={waUrl ? styles.channelHandle : styles.channelNotSpecified} numberOfLines={1}>
                      {waUrl ? (merchantWhatsapp || t('shop.info.contact_on_whatsapp', "Chat with merchant")) : t('shop.info.not_specified', "Not specified")}
                    </Text>
                  </View>
                  {waUrl ? (
                    <View style={[styles.channelActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                      <Text style={[styles.channelActionText, { color: '#059669' }]}>{t('common.open', "Open")}</Text>
                      <Ionicons name="arrow-forward" size={11} color="#059669" style={{ marginLeft: 3 }} />
                    </View>
                  ) : (
                    <View style={styles.channelDisabledBadge}>
                      <Text style={styles.channelDisabledText}>{t('shop.info.not_specified', "Not specified")}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Telegram */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => { if (tgUrl) Linking.openURL(tgUrl); }}
                  activeOpacity={tgUrl ? 0.7 : 1}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: '#229ED918' }]}>
                    <Ionicons name="paper-plane" size={18} color="#229ED9" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.telegram', 'Telegram')}</Text>
                    <Text style={tgUrl ? styles.channelHandle : styles.channelNotSpecified} numberOfLines={1}>
                      {tgUrl ? (tgHandle || t('shop.info.telegram', 'Telegram')) : t('shop.info.not_specified', "Not specified")}
                    </Text>
                  </View>
                  {tgUrl ? (
                    <View style={[styles.channelActionBtn, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                      <Text style={[styles.channelActionText, { color: '#0284C7' }]}>{t('common.open', "Open")}</Text>
                      <Ionicons name="arrow-forward" size={11} color="#0284C7" style={{ marginLeft: 3 }} />
                    </View>
                  ) : (
                    <View style={styles.channelDisabledBadge}>
                      <Text style={styles.channelDisabledText}>{t('shop.info.not_specified', "Not specified")}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => { if (fbUrl) Linking.openURL(fbUrl); }}
                  activeOpacity={fbUrl ? 0.7 : 1}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: '#1877F218' }]}>
                    <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.facebook', 'Facebook')}</Text>
                    <Text style={fbUrl ? styles.channelHandle : styles.channelNotSpecified} numberOfLines={1}>
                      {fbUrl ? (fbHandle || t('shop.info.facebook', "Facebook")) : t('shop.info.not_specified', "Not specified")}
                    </Text>
                  </View>
                  {fbUrl ? (
                    <View style={[styles.channelActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <Text style={[styles.channelActionText, { color: '#1D4ED8' }]}>{t('common.open', "Open")}</Text>
                      <Ionicons name="arrow-forward" size={11} color="#1D4ED8" style={{ marginLeft: 3 }} />
                    </View>
                  ) : (
                    <View style={styles.channelDisabledBadge}>
                      <Text style={styles.channelDisabledText}>{t('shop.info.not_specified', "Not specified")}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Instagram */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => { if (igUrl) Linking.openURL(igUrl); }}
                  activeOpacity={igUrl ? 0.7 : 1}
                >
                  <LinearGradient
                    colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.channelIconBox}
                  >
                    <Ionicons name="logo-instagram" size={19} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.instagram', 'Instagram')}</Text>
                    <Text style={igUrl ? styles.channelHandle : styles.channelNotSpecified} numberOfLines={1}>
                      {igUrl ? (igHandle || t('shop.info.instagram', "Instagram")) : t('shop.info.not_specified', "Not specified")}
                    </Text>
                  </View>
                  {igUrl ? (
                    <View style={[styles.channelActionBtn, { backgroundColor: '#FDF2F8', borderColor: '#FBCFE8' }]}>
                      <Text style={[styles.channelActionText, { color: '#BE185D' }]}>{t('common.open', "Open")}</Text>
                      <Ionicons name="arrow-forward" size={11} color="#BE185D" style={{ marginLeft: 3 }} />
                    </View>
                  ) : (
                    <View style={styles.channelDisabledBadge}>
                      <Text style={styles.channelDisabledText}>{t('shop.info.not_specified', "Not specified")}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Website */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => { if (webUrl) Linking.openURL(webUrl); }}
                  activeOpacity={webUrl ? 0.7 : 1}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: '#05966918' }]}>
                    <Ionicons name="globe-outline" size={20} color="#059669" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{t('shop.info.website', "Website")}</Text>
                    <Text style={webUrl ? styles.channelHandle : styles.channelNotSpecified} numberOfLines={1}>
                      {webUrl ? (webHandle || t('shop.info.website', "Website")) : t('shop.info.not_specified', "Not specified")}
                    </Text>
                  </View>
                  {webUrl ? (
                    <View style={[styles.channelActionBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                      <Text style={[styles.channelActionText, { color: '#059669' }]}>{t('common.visit', "Visit")}</Text>
                      <Ionicons name="arrow-forward" size={11} color="#059669" style={{ marginLeft: 3 }} />
                    </View>
                  ) : (
                    <View style={styles.channelDisabledBadge}>
                      <Text style={styles.channelDisabledText}>{t('shop.info.not_specified', "Not specified")}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* ── 3. DZYstore Web & Sharing Card ── */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={copyStoreLink}
                  activeOpacity={0.7}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: '#1A284014' }]}>
                    <Ionicons name="link-outline" size={19} color="#1A2840" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>DZYstore Web</Text>
                    <Text style={styles.channelHandle} numberOfLines={1}>{publicStoreUrl.replace(/^https?:\/\//, '')}</Text>
                  </View>
                  <View style={[styles.channelActionBtn, { backgroundColor: '#1A2840', borderColor: '#1A2840' }]}>
                    <Ionicons name="copy-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={[styles.channelActionText, { color: '#FFFFFF' }]}>{t('store.copyBtn', "Copy")}</Text>
                  </View>
                </TouchableOpacity>

                {/* Prominent Share Banner */}
                <TouchableOpacity
                  style={styles.shareBannerCard}
                  onPress={() => setShowShareModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shareBannerLeft}>
                    <View style={styles.shareBannerIconBox}>
                      <Ionicons name="share-social" size={18} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shareBannerTitle}>{t('store.shareStoreTitle', "Share Store")}</Text>
                      <Text style={styles.shareBannerSub} numberOfLines={1}>{t('shop.info.share_store_sub', "Share store link via messages or social apps")}</Text>
                    </View>
                  </View>
                  <View style={styles.shareBannerBtn}>
                    <Ionicons name="share-social-outline" size={12} color="#FFFFFF" />
                    <Text style={styles.shareBannerBtnText}>{t('shop.actions.share', "Share")}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Accordion 2: Informations de paiement */}
          <View style={[styles.accordionContainer, { marginBottom: 20 }]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setPaymentInfoExpanded(!paymentInfoExpanded)}
            >
              <Text style={styles.accordionTitle}>{t('shop.payment.title', 'Payment information')}</Text>
              <Ionicons name={paymentInfoExpanded ? "chevron-up" : "chevron-down"} size={20} color="#1A2840" />
            </TouchableOpacity>
            {paymentInfoExpanded && (
              <View style={styles.accordionContent}>
                <TouchableOpacity style={styles.infoRow} onPress={() => copyToClipboard('DZYwallet', shop.dzy_wallet || 'USDC, USDT, EURC, DZY')}>
                  <Ionicons name="wallet-outline" size={16} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>DZYwallet</Text>
                    <Text style={styles.infoTextSub}>{shop.dzy_wallet || 'USDC, USDT, EURC, DZY'}</Text>
                  </View>
                  <Ionicons name="copy-outline" size={14} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => { if (shop.evm_wallet) copyToClipboard('EVM wallet', shop.evm_wallet); }}>
                  <Ionicons name="hardware-chip-outline" size={16} color="#8B5CF6" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>EVM wallet</Text>
                    <Text style={styles.infoTextSub}>{shop.evm_wallet || t('shop.info.not_specified', "Not specified")}</Text>
                  </View>
                  {shop.evm_wallet && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => { if (shop.solana_wallet) copyToClipboard('Solana wallet', shop.solana_wallet); }}>
                  <Ionicons name="server-outline" size={16} color="#10B981" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>Solana wallet</Text>
                    <Text style={styles.infoTextSub}>{shop.solana_wallet || t('shop.info.not_specified', "Not specified")}</Text>
                  </View>
                  {shop.solana_wallet && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => { if (shop.iban_euro) copyToClipboard('IBAN Euro', shop.iban_euro); }}>
                  <Text style={{ fontSize: 14 }}>🇪🇺</Text>
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.payment.euro_iban', 'Euro IBAN Virtual account')}</Text>
                    <Text style={styles.infoTextSub}>{shop.iban_euro || t('shop.info.not_specified', "Not specified")}</Text>
                  </View>
                  {shop.iban_euro && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => { if (shop.usd_account) copyToClipboard('USD Account', shop.usd_account); }}>
                  <Text style={{ fontSize: 14 }}>🇺🇸</Text>
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.payment.usd_account', 'USD Bank Virtual account')}</Text>
                    <Text style={styles.infoTextSub}>{shop.usd_account || t('shop.info.not_specified', "Not specified")}</Text>
                  </View>
                  {shop.usd_account && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Produits populaires */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('shop.sections.popular_products', "Popular Products")}</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('ShopProductsScreen', { shop: shop })}>
              <Text style={styles.showAllText}>{t('common.viewAll', "View All")}</Text>
              <Ionicons name="arrow-forward" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
            {loading && <ActivityIndicator size="large" color="#3B82F6" style={{ margin: 20 }} />}
            {!loading && products.length === 0 && <Text style={{ margin: 20, color: '#64748B' }}>{t('shop.products.no_products_found', "No products found for this search.")}</Text>}
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                {!isOwnShop && (
                  <TouchableOpacity style={styles.heartIcon} onPress={() => handleToggleFavorite('product', product.id, product.name || product.title)}>
                    <Ionicons name={isFavorite('product', product.id) ? "heart" : "heart-outline"} size={16} color="#F59E0B" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ProductDetailsScreen', { product, shop })}>
                  <View style={[styles.productImgPlaceholder, { padding: 0, overflow: 'hidden' }]}>
                    <Image
                      source={getProductCoverImage(product) ? { uri: getProductCoverImage(product) } : require('../../assets/brand/product_no_image.jpg')}
                      defaultSource={require('../../assets/brand/product_no_image.jpg')}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name || product.title || 'Produit'}</Text>
                  <PriceDisplay
                    amount={product.price || 0}
                    baseCurrency={product.currency || shop?.currency || 'XOF'}
                    size="compact"
                  />
                  <Text style={styles.productStock}>{product.stock_quantity > 0 || !product.stock_quantity ? t('shop.products.in_stock', "In stock") : t('outOfStock', "Out of stock")}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.btnBuySmall, isTicketProduct(product) && { backgroundColor: '#FFC759' }]}
                  onPress={() => {
                    navigation.navigate('ProductDetailsScreen', { product, shop });
                  }}
                >
                  <Text style={styles.btnBuySmallText} adjustsFontSizeToFit numberOfLines={1}>
                    {isTicketProduct(product)
                      ? t('product.getTicket', "Get ticket")
                      : t('shop.actions.buy', "Buy")}
                  </Text>
                </TouchableOpacity>

                {!isTicketProduct(product) && (
                  <TouchableOpacity style={styles.btnBuyMeSmall} onPress={() => shareProductGift(product)}>
                    <Ionicons name="gift-outline" size={11} color="#1A2840" style={{ marginRight: 3 }} />
                    <Text style={[styles.btnBuyMeSmallText, { flexShrink: 1 }]} adjustsFontSizeToFit numberOfLines={1}>{t('shop.actions.buy_me', "Buy me")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>

          {/* À propos de la boutique */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>{t('shop.sections.about_store', "About the store")} {shop.shop_name || shop.name || t('shop.default_name', "Shop")}</Text>
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutText} numberOfLines={aboutExpanded ? undefined : 3}>
                {shop.description || shop.shop_description || `Welcome to the official store of ${shop.shop_name || shop.name || 'this merchant'}. Discover its products and services at the best price.`}
              </Text>
              <TouchableOpacity style={styles.aboutChevron} onPress={() => setAboutExpanded(!aboutExpanded)}>
                <Ionicons name={aboutExpanded ? "chevron-up" : "chevron-down"} size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Instagram-style Profile Share Modal (Task 7) */}
        <Modal
          visible={showShareModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowShareModal(false);
            setShowQrInShareModal(false);
          }}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowShareModal(false);
              setShowQrInShareModal(false);
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalCard}
              onPress={(e) => e?.stopPropagation && e.stopPropagation()}
            >
              <View style={styles.sheetHandle} />

              {/* Profile Avatar */}
              <View style={styles.shareProfileAvatarWrapper}>
                {(shop.shop_logo_url || shop.logoUrl) ? (
                  <Image source={{ uri: shop.shop_logo_url || shop.logoUrl }} style={styles.shareProfileAvatar} resizeMode="cover" />
                ) : (
                  <Image source={require('../../assets/brand/shop_placeholder.jpg')} style={styles.shareProfileAvatar} resizeMode="cover" />
                )}
                {(shop.is_verified || shop.verified) && (
                  <View style={styles.shareProfileVerifiedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  </View>
                )}
              </View>

              {/* Profile Name & Location */}
              <Text style={styles.shareProfileName} numberOfLines={2}>{shopName}</Text>
              <Text style={styles.shareProfileSubtitle} numberOfLines={1}>{displayLocation || t('shop.default_name', 'Shop')}</Text>

              {/* QR Code view toggle */}
              {showQrInShareModal && shopQr ? (
                <View style={styles.qrDisplayBox}>
                  <View style={styles.qrCodeWrapper}>
                    <Svg width={180} height={180} viewBox={`0 0 ${shopQr.modules.size} ${shopQr.modules.size}`}>
                      <Rect width={shopQr.modules.size} height={shopQr.modules.size} fill="#FFFFFF" />
                      {Array.from(shopQr.modules.data).map((cell, index) =>
                        cell ? (
                          <Rect
                            key={index}
                            x={index % shopQr.modules.size}
                            y={Math.floor(index / shopQr.modules.size)}
                            width="1"
                            height="1"
                            fill="#1A2840"
                          />
                        ) : null
                      )}
                    </Svg>
                  </View>
                  <Text style={styles.qrScanHint}>{t('store.scanToVisit', 'Scan to visit this store on any device')}</Text>
                </View>
              ) : null}

              {/* 4 Instagram-style Action Buttons: Follow, Share, Copy link, QR code */}
              <View style={styles.instaActionsRow}>
                {/* 1. Follow / Favorite */}
                {!isOwnShop ? (
                  <TouchableOpacity
                    style={styles.instaActionItem}
                    onPress={() => handleToggleFavorite('merchant', shopId, shopName)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.instaActionCircle, shopIsFavorite && styles.instaActionCircleActive]}>
                      <Ionicons
                        name={shopIsFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={shopIsFavorite ? "#EF4444" : "#1A2840"}
                      />
                    </View>
                    <Text style={styles.instaActionLabel} numberOfLines={1}>
                      {shopIsFavorite ? t('store.following', 'Following') : t('store.follow', 'Follow')}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* 2. Share */}
                <TouchableOpacity
                  style={styles.instaActionItem}
                  onPress={async () => {
                    try {
                      await Share.share({
                        title: shopName,
                        message: `${shareText} ${publicStoreUrl}`,
                        url: publicStoreUrl,
                      });
                    } catch (err) {
                      console.log('Share error:', err?.message);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.instaActionCircle}>
                    <Ionicons name="share-social-outline" size={24} color="#1A2840" />
                  </View>
                  <Text style={styles.instaActionLabel} numberOfLines={1}>
                    {t('common.share', 'Share')}
                  </Text>
                </TouchableOpacity>

                {/* 3. Copy Link */}
                <TouchableOpacity
                  style={styles.instaActionItem}
                  onPress={copyStoreLink}
                  activeOpacity={0.8}
                >
                  <View style={styles.instaActionCircle}>
                    <Ionicons name="link-outline" size={24} color="#1A2840" />
                  </View>
                  <Text style={styles.instaActionLabel} numberOfLines={1}>
                    {t('store.copyLink', 'Copy link')}
                  </Text>
                </TouchableOpacity>

                {/* 4. QR Code */}
                <TouchableOpacity
                  style={styles.instaActionItem}
                  onPress={() => setShowQrInShareModal(prev => !prev)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.instaActionCircle, showQrInShareModal && styles.instaActionCircleActive]}>
                    <Ionicons
                      name="qr-code-outline"
                      size={24}
                      color={showQrInShareModal ? "#3B82F6" : "#1A2840"}
                    />
                  </View>
                  <Text style={styles.instaActionLabel} numberOfLines={1}>
                    {t('store.qrCode', 'QR code')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setShowShareModal(false);
                  setShowQrInShareModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseBtnText}>{t('common.close', 'Close')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 6 },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-start' },
  headerRightIcons: { flexDirection: 'row' },
  iconBtnRight: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginLeft: 8, position: 'relative' },
  shareBadgeDot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  coverContainer: { width: '100%', marginBottom: 38, position: 'relative' },
  coverBg: { width: '100%', height: 135, backgroundColor: '#1A2840', overflow: 'hidden', position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  logoContainer: { position: 'absolute', bottom: -30, left: 16 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1A2840', borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.15)', elevation: 4 },
  logoText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#FFFFFF' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#FFFFFF', borderRadius: 10 },
  shopInfoHeader: { paddingHorizontal: 16, marginBottom: 16 },
  shopNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  shopName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  shopType: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280', marginBottom: 6 },
  shopMetaRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#1A2840', marginLeft: 3 },
  reviewsText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginLeft: 3 },
  dotSeparator: { color: '#D1D5DB', marginHorizontal: 6 },
  locationText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1A2840', marginLeft: 3 },
  distanceText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1A2840' },
  statsCard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 14, marginHorizontal: 16, paddingVertical: 12, marginBottom: 14 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statNumber: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280' },
  statDivider: { width: 1, height: 24, backgroundColor: '#F3F4F6' },
  shareCardContainer: { marginHorizontal: 16, marginBottom: 12 },
  fullCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 14, padding: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  socialIconsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  socialBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  flagCityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 'auto' },
  flagCityText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
  accordionContainer: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FAFAFA' },
  accordionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  accordionContent: { padding: 16, paddingTop: 8, backgroundColor: '#FFFFFF' },
  infoList: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', minHeight: 32, marginBottom: 8 },
  infoText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#1A2840', flex: 1, marginLeft: 4 },
  infoTextSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  infoTextSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 },
  sectionContainer: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  showAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#3B82F6' },
  productsScroll: { paddingHorizontal: 16, marginBottom: 18 },
  productCard: { width: 140, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 14, padding: 8, marginRight: 10, position: 'relative' },
  heartIcon: { position: 'absolute', top: 8, right: 8, zIndex: 2 },
  productImgPlaceholder: { height: 90, backgroundColor: '#F8FAFC', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  productInfo: { marginBottom: 8 },
  productName: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', marginBottom: 2 },
  productPrice: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#1A2840', marginBottom: 2 },
  productStock: { fontFamily: 'Inter_500Medium', fontSize: 9, color: '#10B981' },
  btnBuySmall: { backgroundColor: '#FFC759', paddingVertical: 5, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  btnBuySmallText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', textAlign: 'center' },
  btnBuyMeSmall: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFC759', paddingVertical: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  btnBuyMeSmallText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#1A2840', textAlign: 'center' },
  aboutSection: { paddingHorizontal: 16 },
  aboutTextContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  aboutText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', lineHeight: 18, paddingRight: 8 },
  aboutChevron: { paddingBottom: 2 },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    width: '100%',
    alignItems: 'center',
    boxShadow: '0px -4px 20px rgba(0,0,0,0.12)',
    elevation: 10,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 18,
  },
  shareProfileAvatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    backgroundColor: '#1A2840',
  },
  shareProfileAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  shareProfileVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
  },
  shareProfileName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 4,
  },
  shareProfileSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrDisplayBox: {
    alignItems: 'center',
    marginVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrScanHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  instaActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginVertical: 18,
  },
  instaActionItem: {
    alignItems: 'center',
    width: 70,
  },
  instaActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  instaActionCircleActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  instaActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    textAlign: 'center',
  },
  modalCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  modalCloseBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  fullShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  fullShareBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#2563EB',
  },
  socialBrandBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  channelIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  channelInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  channelName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  channelHandle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  channelNotSpecified: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  channelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
  },
  channelActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  channelDisabledBadge: {
    width: 76,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  channelDisabledText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
  },
  sectionSubhead: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 8,
  },
  shareBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginTop: 8,
  },
  shareBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  shareBannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  shareBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1E3A8A',
  },
  shareBannerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  shareBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  shareBannerBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
  },
});
