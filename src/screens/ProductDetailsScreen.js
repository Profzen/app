import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Share, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import AppConfirmModal from '../components/AppConfirmModal';
import PriceDisplay from '../components/PriceDisplay';
import PhysicalGoodsWarningModal from '../components/PhysicalGoodsWarningModal';
import { useApp } from '../context/AppContext';
import { convertCurrencyAmount } from '../utils/countryCurrencyUtils';
import { buyGoodsApi } from '../services/buyGoodsApi';
import { getProductMedia, isVideoUrl } from '../utils/productMedia';

import ProductVideoSlide from '../components/ProductVideoSlide';

const { width } = Dimensions.get('window');
// Compact gallery so price, quantity and actions stay visible without scrolling
const GALLERY_HEIGHT = Math.min(Math.round(width * 0.62), 250);
const THUMB_STEP = 54; // thumbnail width (46) + gap (8)

export default function ProductDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { t, cart, addToCart, cartCount, language, user, isFavorite, toggleFavorite } = useApp();
  const routeProduct = route?.params?.product;
  const shop = route?.params?.shop;

  // Always load the full product by id: Home search / deep links only pass a partial
  // search-index row (no price, one image). The marketplace row is refreshed too.
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isHydrating, setIsHydrating] = useState(!!routeProduct?.id);
  useEffect(() => {
    let active = true;
    const id = routeProduct?.id;
    if (!id) { setIsHydrating(false); return undefined; }
    setIsHydrating(true);
    buyGoodsApi.getProductById(id)
      .then((p) => { if (active && p) setFetchedProduct(p); })
      .catch(() => {})
      .finally(() => { if (active) setIsHydrating(false); });
    return () => { active = false; };
  }, [routeProduct?.id]);

  const product = routeProduct
    ? (fetchedProduct ? { ...routeProduct, ...fetchedProduct, name: fetchedProduct.name || routeProduct.name || routeProduct.title } : routeProduct)
    : null;

  const [quantity, setQuantity] = useState(1);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [conflictModal, setConflictModal] = useState(null);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'cart' or 'buy'
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [galleryWidth, setGalleryWidth] = useState(width);
  const galleryRef = useRef(null);
  const thumbsRef = useRef(null);

  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 16);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="cube-outline" size={56} color="#94A3B8" />
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840', marginTop: 16 }}>
            {t('product.notFound', 'Product not found')}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: '#FFB800', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#1A2840' }}>{t('common.back', 'Back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rawCurrency = product.currency || shop?.currency || 'USD';
  const displayCurrency = rawCurrency === 'XOF' ? 'FCFA' : rawCurrency;
  const numLocale = language === 'en' ? 'en-US' : 'fr-FR';

  const rawAmount = typeof product.price === 'number' 
    ? product.price 
    : (product.variants?.[0]?.prices?.[0]?.amount || product.amount || product.price);
  const displayPrice = (rawAmount !== undefined && rawAmount !== null && !isNaN(Number(rawAmount)))
    ? `${Number(rawAmount).toLocaleString(numLocale)} ${displayCurrency}`
    : (product.price || '');
  const hasValidPrice = rawAmount !== undefined && rawAmount !== null && rawAmount !== '' && !isNaN(Number(rawAmount));
  // Never let a product be bought while its real price is still loading / unknown
  const canPurchase = hasValidPrice && !isHydrating;

  // All images + videos stored by the merchant in product_images
  const media = getProductMedia(product).all;
  const safeMediaIndex = activeMediaIndex < media.length ? activeMediaIndex : 0;
  const activeMedia = media[safeMediaIndex] || null;
  const goToMedia = (idx) => {
    if (!media.length) return;
    const next = Math.max(0, Math.min(idx, media.length - 1));
    setActiveMediaIndex(next);
    galleryRef.current?.scrollTo({ x: next * galleryWidth, animated: true });
    thumbsRef.current?.scrollTo({ x: Math.max(0, next * THUMB_STEP - THUMB_STEP * 2), animated: true });
  };

  // Favorites (shared user_favorites table). Merchants can't favorite their own products.
  const productOwnerId = product?.merchant_id || product?.merchant?.id || shop?.id || null;
  const isOwnProduct = !!(user?.merchantProfile?.id && productOwnerId && String(user.merchantProfile.id) === String(productOwnerId));
  const productIsFavorite = isFavorite('product', product?.id);
  const handleToggleFavorite = async () => {
    if (!product?.id || favoriteBusy) return;
    setFavoriteBusy(true);
    const result = await toggleFavorite('product', product.id);
    setFavoriteBusy(false);
    setToast(result.success
      ? { title: t(result.isFavorite ? 'profile.favorites.added' : 'profile.favorites.removed', result.isFavorite ? 'Added to your favorites' : 'Removed from your favorites'), message: product?.name || product?.title || '' }
      : { title: t('profile.favorites.error', "We couldn't update your favorites. Please try again."), message: '' });
  };
  const ratingValue = Math.max(0, Math.min(5, Number(product?.rating) || 0));
  const reviewCount = Math.max(0, Number(product?.review_count ?? product?.reviewCount) || 0);
  const merchantSpecs = Array.isArray(product?.metadata?.specifications)
    ? product.metadata.specifications.filter((s) => s && s.key && s.value)
    : [];

  // Dynamic delivery fee from merchant settings in buygoods backend
  const rawDeliveryFee = (shop?.delivery_fee !== undefined && shop?.delivery_fee !== null)
    ? Number(shop.delivery_fee)
    : (product?.merchant?.delivery_fee !== undefined && product?.merchant?.delivery_fee !== null)
    ? Number(product.merchant.delivery_fee)
    : null;

  const standardDeliveryFee = rawDeliveryFee !== null
    ? (rawDeliveryFee > 0 ? convertCurrencyAmount(rawDeliveryFee, shop?.currency || 'XOF', rawCurrency) : 0)
    : 0;

  const deliveryFeeFormatted = standardDeliveryFee > 0
    ? `${Number(standardDeliveryFee).toLocaleString(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${displayCurrency}`
    : t('orderVerification.free', 'Gratuit');

  const merchantName = shop?.shop_name || shop?.name || product?.merchant?.shop_name || product?.merchant?.name || t('paymentSuccess.partnerMerchant', 'Partner Merchant');
  const merchantInitial = (merchantName || 'DZ').slice(0, 2).toUpperCase();
  const merchantLogo = shop?.shop_logo_url || shop?.logoUrl || shop?.raw?.shop_logo_url || product?.merchant?.shop_logo_url || product?.merchant?.logoUrl || product?.merchant_logo;

  const executeAddToCart = (force = false) => {
    const res = addToCart(product, quantity, shop, force);
    if (res.conflict) {
      setConflictModal({
        title: t('cart.conflictTitle', 'Different shop in cart'),
        message: t('cart.conflictMsg', {
          currentMerchantName: res.currentMerchantName,
          newMerchantName: res.newMerchantName,
          defaultValue: `Your cart already contains items from "${res.currentMerchantName}". Would you like to clear your cart and start fresh with "${res.newMerchantName}"?`
        }),
        onConfirm: () => {
          setConflictModal(null);
          executeAddToCart(true);
        },
      });
      return;
    }
    if (res.success) {
      setToast({
        title: t('cart.addedSuccessTitle', 'Item added!'),
        message: t('cart.addedSuccessMsg', {
          qty: quantity,
          name: product.name || product.title,
          count: res.count,
          defaultValue: `${quantity}x ${product.name || product.title} added to cart (${res.count} items).`
        }),
      });
    }
  };

  const executeBuyNow = () => {
    addToCart(product, quantity, shop, true);
    navigation.navigate('OrderVerificationScreen', {
      directOrder: {
        product,
        shop,
        quantity,
      }
    });
  };

  const handleAddToCart = () => {
    if (!canPurchase) return;
    if (!product.offering_type || product.offering_type === 'physical_good') {
      setPendingAction('cart');
      setWarningModalVisible(true);
    } else {
      executeAddToCart();
    }
  };

  const handleBuyNow = () => {
    if (!canPurchase) return;
    if (!product.offering_type || product.offering_type === 'physical_good') {
      setPendingAction('buy');
      setWarningModalVisible(true);
    } else {
      executeBuyNow();
    }
  };

  const handleWarningContinue = () => {
    setWarningModalVisible(false);
    // Execute the action that was originally requested before the warning
    if (pendingAction === 'buy') {
      executeBuyNow();
    } else if (pendingAction === 'cart') {
      executeAddToCart();
    }
    setPendingAction(null);
  };

  const shareProduct = async () => { 
    try { 
      await Share.share({
        title: product.name || product.title, 
        message: t('product.shareMessage', 'Check out {{name}} on DizzitUp.', { name: product.name || product.title })
      }); 
    } finally { 
      setToast({
        title: t('product.sharedTitle', 'Product shared'), 
        message: t('product.sharedDesc', 'Sharing link prepared successfully.')
      }); 
    } 
  };

  const shareProductGift = async () => { 
    const pName = product.name || product.title || 'Produit';
    const sName = merchantName || 'DizzitUp';
    const productUrl = `https://dizzitup.com/product/${product.id}`;
    try { 
      await Share.share({
        title: t('shop.giftProductTitle', `Achetez-moi ceci : ${pName}`, { name: pName }), 
        message: t('shop.giftProductMsg', `J'aimerais ce produit sur DizzitUp : ${pName} (${displayPrice}) chez ${sName}. Vous pouvez me l'offrir ici : ${productUrl}`, { name: pName, price: displayPrice, shop: sName, url: productUrl })
      }); 
      setToast({
        title: t('shop.shareSuccessTitle', 'Lien cadeau prêt'), 
        message: t('shop.shareSuccessDesc', 'Le lien du produit a été partagé avec succès.')
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
                setToast({
                  title: t('cart.emptyTitle', 'Panier vide'),
                  message: t('cart.emptyDesc', 'Votre panier ne contient aucun article pour l\'instant.')
                });
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
          {!isOwnProduct && (
            <TouchableOpacity style={styles.iconBtnRight} onPress={handleToggleFavorite} disabled={favoriteBusy} accessibilityRole="button" accessibilityState={{ selected: productIsFavorite }}>
              <Ionicons name={productIsFavorite ? "heart" : "heart-outline"} size={20} color={productIsFavorite ? "#EF4444" : "#1A2840"} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtnRight} onPress={shareProduct}>
            <Ionicons name="share-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Full-width media carousel (swipe or arrows), images + videos */}
        <View style={styles.galleryWrap} onLayout={(e) => setGalleryWidth(e.nativeEvent.layout.width || width)}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (galleryWidth || 1));
              if (idx !== safeMediaIndex && idx >= 0 && idx < media.length) {
                setActiveMediaIndex(idx);
                thumbsRef.current?.scrollTo({ x: Math.max(0, idx * THUMB_STEP - THUMB_STEP * 2), animated: true });
              }
            }}
          >
            {(media.length > 0 ? media : [null]).map((url, idx) => (
              <View key={`${url || 'placeholder'}-${idx}`} style={{ width: galleryWidth, height: GALLERY_HEIGHT }}>
                {url && isVideoUrl(url) ? (
                  <ProductVideoSlide
                    uri={url}
                    isActive={idx === safeMediaIndex}
                    playLabel={t('product.playVideo', 'Play video')}
                    errorTitle={t('product.videoErrorTitle', 'Video unavailable')}
                    errorDesc={t('product.videoErrorDesc', 'This video could not be opened on your device.')}
                  />
                ) : (
                  <Image
                    source={url ? { uri: url } : require('../../assets/brand/product_no_image.jpg')}
                    defaultSource={require('../../assets/brand/product_no_image.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                )}
              </View>
            ))}
          </ScrollView>

          {media.length > 1 && safeMediaIndex > 0 && (
            <TouchableOpacity style={[styles.galleryArrow, { left: 12 }]} onPress={() => goToMedia(safeMediaIndex - 1)} accessibilityLabel={t('common.previous', 'Previous')}>
              <Ionicons name="chevron-back" size={22} color="#1A2840" />
            </TouchableOpacity>
          )}
          {media.length > 1 && safeMediaIndex < media.length - 1 && (
            <TouchableOpacity style={[styles.galleryArrow, { right: 12 }]} onPress={() => goToMedia(safeMediaIndex + 1)} accessibilityLabel={t('common.next', 'Next')}>
              <Ionicons name="chevron-forward" size={22} color="#1A2840" />
            </TouchableOpacity>
          )}
          {media.length > 1 && (
            <View style={styles.mediaCounter}>
              {activeMedia && isVideoUrl(activeMedia) && <Ionicons name="videocam" size={12} color="#FFB800" style={{ marginRight: 4 }} />}
              <Text style={styles.mediaCounterText}>{safeMediaIndex + 1}/{media.length}</Text>
            </View>
          )}
        </View>

        {media.length > 1 && (
          <ScrollView ref={thumbsRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaThumbRow}>
            {media.map((url, idx) => (
              <TouchableOpacity
                key={`${url}-${idx}`}
                style={[styles.mediaThumb, idx === safeMediaIndex && styles.mediaThumbActive]}
                onPress={() => goToMedia(idx)}
                activeOpacity={0.8}
              >
                {isVideoUrl(url) ? (
                  <View style={styles.mediaThumbVideo}>
                    <Ionicons name="play-circle" size={24} color="#FFB800" />
                  </View>
                ) : (
                  <Image source={{ uri: url }} style={styles.mediaThumbImage} resizeMode="cover" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Top Section: Product Info */}
        <View style={styles.topSection}>

          {/* Right Column: Product Info */}
          <View style={styles.rightCol}>
            {!!(product.category || product.desc1) && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category || product.desc1}</Text>
              </View>
            )}
            
            <Text style={styles.productTitle}>{product.name}</Text>
            
            {/* Real rating from the database (products.rating / review_count) */}
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={`star-${i}`}
                  name={reviewCount > 0 && ratingValue >= i ? 'star' : reviewCount > 0 && ratingValue >= i - 0.5 ? 'star-half' : 'star-outline'}
                  size={14}
                  color={reviewCount > 0 ? '#F59E0B' : '#CBD5E1'}
                />
              ))}
              {reviewCount > 0 ? (
                <>
                  <Text style={styles.ratingText}>{ratingValue.toFixed(1)}</Text>
                  <Text style={styles.reviewsText}>{t('product.reviewsCount', '({{count}} reviews)', { count: reviewCount.toLocaleString(numLocale) })}</Text>
                </>
              ) : (
                <Text style={styles.reviewsText}>{t('product.noReviewsYet', 'No reviews yet')}</Text>
              )}
            </View>

            {/* Multi-Currency Price Display: Local currency first, USDT & DZY */}
            {hasValidPrice ? (
              <PriceDisplay
                amount={rawAmount}
                baseCurrency={rawCurrency}
                quantity={quantity}
                size="large"
                style={{ marginVertical: 8 }}
              />
            ) : (
              <View style={{ marginVertical: 14, alignItems: 'flex-start' }}>
                <ActivityIndicator size="small" color="#FFB800" />
              </View>
            )}

            {/* Quantity Selector */}
            <View style={styles.qtyContainer}>
              <Text style={styles.qtyLabel}>
                {product?.pricing_model === 'per_night' ? t('product.nights', 'Nuits') :
                 product?.pricing_model === 'per_month' ? t('product.months', 'Mois') :
                 product?.pricing_model === 'per_day' ? t('product.days', 'Jours') :
                 product?.pricing_model === 'per_hour' ? t('product.hours', 'Heures') :
                 t('orderVerification.qty', 'Quantité')}
              </Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#1A2840" />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(prev => prev + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Accepted Payment Methods Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('product.acceptedPaymentMethods', 'Accepted payment methods')}</Text>
          <View style={styles.paymentCard}>
            
            {/* 1. Visa, Mastercard */}
            <View style={styles.paymentMethodRow}>
              <View style={styles.cardLogoBadge}>
                <Text style={styles.visaLogoText}>VISA</Text>
                <View style={styles.mcCirclesWrap}>
                  <View style={[styles.mcCircle, { backgroundColor: '#EB001B' }]} />
                  <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', marginLeft: -5, opacity: 0.95 }]} />
                </View>
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>{t('product.visaMastercard', 'Visa, Mastercard')}</Text>
                <Text style={styles.paymentMethodSubtitle}>{t('product.visaMastercardSub', 'International credit & debit cards (3D Secure)')}</Text>
              </View>
              <View style={styles.paymentMethodTag}>
                <Ionicons name="shield-checkmark" size={11} color="#2563EB" style={{ marginRight: 3 }} />
                <Text style={styles.paymentMethodTagText}>3D Secure</Text>
              </View>
            </View>

            {/* 2. Mobile Money */}
            <View style={styles.paymentMethodRow}>
              <View style={[styles.paymentMethodIconBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>{t('product.mobileMoney', 'Mobile Money')}</Text>
                <Text style={styles.paymentMethodSubtitle}>{t('product.mobileMoneySub', 'Orange Money, MTN MoMo, Moov, Wave...')}</Text>
              </View>
              <View style={[styles.paymentMethodTag, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Ionicons name="flash" size={10} color="#D97706" style={{ marginRight: 3 }} />
                <Text style={[styles.paymentMethodTagText, { color: '#B45309' }]}>Instant</Text>
              </View>
            </View>

            {/* 3. Stablecoins (USDC, USDT, EURC) - No mention of 'Crypto' */}
            <View style={styles.paymentMethodRow}>
              <View style={[styles.paymentMethodIconBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <View style={styles.multiCryptoRow}>
                  <CryptoIcon symbol="USDT" size={18} />
                  <View style={{ marginLeft: -6 }}>
                    <CryptoIcon symbol="USDC" size={18} />
                  </View>
                  <View style={{ marginLeft: -6 }}>
                    <CryptoIcon symbol="EURC" size={18} />
                  </View>
                </View>
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>{t('product.stablecoins', 'Stablecoins (USDT, USDC, EURC)')}</Text>
                <Text style={styles.paymentMethodSubtitle}>{t('product.stablecoinsSub', 'USDC, USDT, EURC (1:1 USD / EUR)')}</Text>
              </View>
              <View style={[styles.paymentMethodTag, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.paymentMethodTagText, { color: '#059669' }]}>0% Fee</Text>
              </View>
            </View>

            {/* 4. DZY Token */}
            <View style={[styles.paymentMethodRow, { marginBottom: 6 }]}>
              <View style={[styles.paymentMethodIconBox, { backgroundColor: '#FFFDF0', borderColor: '#FDE68A' }]}>
                <CryptoIcon symbol="DZY" size={26} />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>{t('product.dzyToken', 'DZY Token')}</Text>
                <Text style={styles.paymentMethodSubtitle}>{t('product.dzyTokenSub', 'Native DizzitUp digital token & discounts')}</Text>
              </View>
              <View style={[styles.paymentMethodTag, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={[styles.paymentMethodTagText, { color: '#1D4ED8' }]}>Rewards</Text>
              </View>
            </View>

            {/* Security Banner */}
            <View style={styles.securityBanner}>
              <View style={styles.securityIconBox}>
                <Ionicons name="shield-checkmark" size={18} color="#2563EB" />
              </View>
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>{t('product.securePurchaseTitle', '100% Secure purchase')}</Text>
                <Text style={styles.securityText}>{t('product.securePurchaseDesc', 'Pay securely with Cards, Mobile Money, Stablecoins or DZY Token.')}</Text>
              </View>
            </View>

          </View>
        </View>

        <View style={styles.divider} />

        {/* Description Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('product.description', 'Description')}</Text>
          <View style={styles.descRow}>
            <Text style={styles.descText} numberOfLines={descriptionExpanded ? undefined : 3}>
              {product.description || product.subtitle || t('product.defaultDesc', 'Product guaranteed and verified by our DizzitUp partner merchant network.')}
            </Text>
            <TouchableOpacity style={styles.descChevron} onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
              <Ionicons name={descriptionExpanded ? "chevron-up" : "chevron-down"} size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Caractéristiques Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('product.specs', 'Specifications')}</Text>
          <View style={styles.featuresGrid}>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="phone-portrait-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>{t('product.category', 'Category')}</Text>
                <Text style={styles.featureValue}>{product.category || product.desc1 || t('common.general', 'General')}</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>{t('product.warranty', 'Warranty')}</Text>
                <Text style={styles.featureValue}>{product.warranty || t('product.warrantyVal', 'DizzitUp Warranty')}</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="lock-closed-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>{t('product.protection', 'Protection')}</Text>
                <Text style={styles.featureValue}>{t('product.protectionVal', '4-digit Secure PIN payment')}</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="cube-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>{t('product.condition', 'Condition')}</Text>
                <Text style={styles.featureValue}>{product.condition || (product.stock ? t('product.inStock', 'In stock') : t('product.brandNew', 'New in stock'))}</Text>
              </View>
            </View>

          </View>

          {/* Merchant-defined specifications (products.metadata.specifications) */}
          {merchantSpecs.length > 0 && (
            <View style={styles.merchantSpecsCard}>
              {merchantSpecs.map((spec, idx) => (
                <View key={`${spec.key}-${idx}`} style={[styles.merchantSpecRow, idx < merchantSpecs.length - 1 && styles.merchantSpecDivider]}>
                  <Text style={styles.merchantSpecKey}>{spec.key}</Text>
                  <Text style={styles.merchantSpecValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Livraison & Retrait Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('product.deliveryAndPickup', 'Delivery & pickup')}</Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryItem}>
                <Ionicons name="bus-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                <View>
                  <Text style={styles.deliveryLabel}>{t('product.homeDelivery', 'Home delivery')}</Text>
                  <Text style={styles.deliveryValue}>{t('product.deliveryDelay', '1 to 3 business days')}</Text>
                </View>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="storefront-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                <View>
                  <Text style={styles.deliveryLabel}>{t('product.storePickup', 'Store pickup')}</Text>
                  <Text style={styles.deliveryValue}>{t('product.pickupToday', 'Today')}</Text>
                </View>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                <View>
                  <Text style={styles.deliveryLabel}>{t('product.deliveryFees', 'Delivery fee')}</Text>
                  <Text style={styles.deliveryValue}>{t('product.fromDeliveryFee', `From ${deliveryFeeFormatted}`, { fee: deliveryFeeFormatted })}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Vendu par Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('product.soldBy', 'Sold by')}</Text>
          <View style={styles.vendorRow}>
            {merchantLogo ? (
              <View style={styles.vendorLogoImageWrapper}>
                <Image
                  source={{ uri: merchantLogo }}
                  style={styles.vendorLogoImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.vendorMonogramContainer}>
                <Text style={styles.vendorMonogramText}>{merchantInitial}</Text>
                <View style={styles.vendorVerifiedTag}>
                  <Text style={styles.vendorVerifiedTagText}>VERIFIED</Text>
                </View>
              </View>
            )}
            <View style={styles.vendorContent}>
              <View style={styles.vendorNameRow}>
                <Text style={styles.vendorName} numberOfLines={1}>{merchantName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{marginLeft: 4}} />
              </View>
              <View style={styles.vendorCategoryBadge}>
                <Text style={styles.vendorCategoryText}>{t('product.verifiedPartner', 'Verified Merchant')}</Text>
              </View>
              <Text style={styles.vendorSince}>{t('product.partnerPlatform', 'DizzitUp Partner')}</Text>
            </View>
            <TouchableOpacity style={styles.btnStore} onPress={() => navigation.navigate('ShopDetailsScreen', { shop: shop || { id: product?.merchant_id, name: merchantName } })}>
              <Ionicons name="storefront-outline" size={16} color="#1A2840" style={{marginRight: 6}} />
              <Text style={styles.btnStoreText}>{t('product.visitShop', 'Store')}</Text>
              <Ionicons name="chevron-forward" size={14} color="#1A2840" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Floating Ergonomic Action Bar */}
      <View style={[styles.bottomActionBar, { paddingBottom: bottomPadding }]}>
        {/* Buy Me / Diaspora Gift Action */}
        <TouchableOpacity
          style={styles.btnGiftModern}
          onPress={shareProductGift}
          activeOpacity={0.8}
        >
          <Ionicons name="gift-outline" size={18} color="#2563EB" style={{ marginRight: 5 }} />
          <Text style={[styles.btnGiftModernText, { flexShrink: 1 }]} adjustsFontSizeToFit numberOfLines={1}>{t('shop.actions.buy_me', 'Buy me')}</Text>
        </TouchableOpacity>

        {/* Add to Cart Action */}
        <TouchableOpacity 
          style={[styles.btnCartModern, !canPurchase && { opacity: 0.5 }]} 
          onPress={() => handleAddToCart(false)}
          disabled={!canPurchase}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={18} color="#1A2840" style={{ marginRight: 5 }} />
          <Text style={[styles.btnCartModernText, { flexShrink: 1 }]} adjustsFontSizeToFit numberOfLines={1}>{t('product.addToCart', 'Add to cart')}</Text>
          {cartCount > 0 && (
            <View style={styles.cartCountDot}>
              <Text style={styles.cartCountDotText} adjustsFontSizeToFit numberOfLines={1}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Primary CTA: Buy Now */}
        <TouchableOpacity 
          style={[styles.btnBuyModern, !canPurchase && { opacity: 0.5 }]} 
          onPress={handleBuyNow}
          disabled={!canPurchase}
          activeOpacity={0.85}
        >
          <Ionicons name="flash" size={16} color="#1A2840" style={{ marginRight: 5 }} />
          <Text style={[styles.btnBuyModernText, { flexShrink: 1 }]} adjustsFontSizeToFit numberOfLines={1}>{t('product.buyNow', 'Buy now')}</Text>
        </TouchableOpacity>
      </View>
      {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}

      <AppConfirmModal
        visible={!!conflictModal}
        title={conflictModal?.title}
        message={conflictModal?.message}
        icon="cart-outline"
        iconColor="#FFB800"
        iconBg="#FFFBEB"
        cancelText={t('common.cancel', 'Cancel')}
        confirmText={t('cart.replaceBtn', 'Replace cart')}
        confirmVariant="warning"
        onCancel={() => setConflictModal(null)}
        onConfirm={conflictModal?.onConfirm}
      />

      <PhysicalGoodsWarningModal 
        visible={warningModalVisible}
        onClose={() => setWarningModalVisible(false)}
        onContinue={handleWarningContinue}
        shopCountry={shop?.country || product?.merchant?.country || 'your region'}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 40 },
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // space for sticky bottom bar
  },
  topSection: {
    flexDirection: width < 380 ? 'column' : 'row',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  leftCol: {
    width: width < 380 ? '100%' : '42%',
    marginRight: width < 380 ? 0 : 16,
    marginBottom: width < 380 ? 16 : 0,
  },
  mainImageContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    height: 200,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryWrap: { backgroundColor: '#FFFFFF', marginBottom: 8 },
  galleryArrow: { position: 'absolute', top: '50%', marginTop: -17, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', shadowColor: '#1A2840', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  mediaCounter: { position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(26, 40, 64, 0.85)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  mediaCounterText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  mediaThumbRow: { gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  mediaThumb: { width: 46, height: 46, borderRadius: 10, borderWidth: 2, borderColor: '#E2E8F0', overflow: 'hidden', backgroundColor: '#FFFFFF' },
  mediaThumbActive: { borderColor: '#FFB800' },
  mediaThumbImage: { width: '100%', height: '100%' },
  mediaThumbVideo: { flex: 1, backgroundColor: '#1A2840', justifyContent: 'center', alignItems: 'center' },
  merchantSpecsCard: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14 },
  merchantSpecRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 11, gap: 12 },
  merchantSpecDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  merchantSpecKey: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748B' },
  merchantSpecValue: { flex: 1.2, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', textAlign: 'right' },
  mockMainImage: {
    width: '80%',
    height: '80%',
    backgroundColor: '#3B82F6', // Mock color for the phone
    borderRadius: 8,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thumbnail: {
    width: 32,
    height: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailActive: {
    borderColor: '#FFB800',
    borderWidth: 2,
  },
  mockThumbImage: {
    width: '60%',
    height: '80%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  thumbnailMore: {
    width: 32,
    height: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailMoreText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1A2840',
  },
  rightCol: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#8B5CF6',
  },
  productTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 8,
    lineHeight: 22,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1A2840',
    marginLeft: 4,
  },
  reviewsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  stockText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#10B981',
  },
  priceText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginBottom: 4,
  },
  subPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subPriceText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#3B82F6',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  cardLogoBadge: {
    width: 48,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  visaLogoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1A1F71',
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  mcCirclesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  mcCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  paymentMethodIconBox: {
    width: 48,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  multiCryptoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
    marginRight: 8,
  },
  paymentMethodTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  paymentMethodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  paymentMethodTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1E40AF',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 10,
    marginTop: 4,
  },
  securityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1E40AF',
    marginBottom: 2,
  },
  securityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#3B82F6',
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 12,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    paddingRight: 16,
  },
  descChevron: {
    paddingTop: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#1A2840',
    marginBottom: 2,
  },
  featureValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  deliveryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%', // Taking full width on mobile for clarity, but could be columns.
    // Wait, the mockup shows them in a single row or columns. It's a row. Let's make it flexible.
  },
  deliveryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
    marginBottom: 2,
  },
  deliveryValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorLogoImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorLogoImage: {
    width: '100%',
    height: '100%',
  },
  vendorMonogramContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1A2840',
    borderWidth: 2,
    borderColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorMonogramText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#FFC759',
    letterSpacing: 0.5,
  },
  vendorVerifiedTag: {
    backgroundColor: '#FFC759',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 1,
  },
  vendorVerifiedTagText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 7,
    color: '#1A2840',
    letterSpacing: 0.5,
  },
  vendorContent: {
    flex: 1,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  vendorCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  vendorCategoryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#8B5CF6',
  },
  vendorSince: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#1A2840',
    marginBottom: 4,
  },
  vendorRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorRating: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 4,
  },
  vendorReviews: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  btnStore: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnStoreText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginHorizontal: 10,
    minWidth: 18,
    textAlign: 'center',
  },
  btnGiftModern: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    paddingHorizontal: 8,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginRight: 6,
  },
  btnGiftModernText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: '#1D4ED8',
    textAlign: 'center',
  },
  btnCartModern: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    paddingHorizontal: 8,
    borderRadius: 23,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  btnCartModernText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#1A2840',
    textAlign: 'center',
  },
  cartCountDot: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartCountDotText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  btnBuyModern: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    paddingHorizontal: 8,
    borderRadius: 23,
    backgroundColor: '#FFB800',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  btnBuyModernText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13.5,
    color: '#1A2840',
    textAlign: 'center',
  },
});
