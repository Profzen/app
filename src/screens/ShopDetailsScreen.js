import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Share, Platform, StatusBar, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import { useBuyGoods } from '../hooks/useBuyGoods';
import { useApp } from '../context/AppContext';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';


export default function ShopDetailsScreen({ route }) {
  const navigation = useNavigation();
  const shopParam = route?.params?.shop;
  const initialShop = shopParam || {};

  const { t } = useApp();
  const { fetchStoreDetails, fetchAllProducts } = useBuyGoods();

  const [shop, setShop] = useState(initialShop);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favorite, setFavorite] = useState(false);
  const [productFavorites, setProductFavorites] = useState([]);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [shopInfoExpanded, setShopInfoExpanded] = useState(false);
  const [paymentInfoExpanded, setPaymentInfoExpanded] = useState(false);
  const [toast, setToast] = useState(null);

  const getFlagCode = (countryInput) => {
    if (!countryInput) return 'us';
    if (countryInput.length === 2) return countryInput.toLowerCase();
    const iso = getCountryCurrencyInfo(countryInput);
    if (iso && iso.code) return iso.code.toLowerCase();
    return 'us';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const slugOrId = initialShop.slug || initialShop.id;
      if (slugOrId) {
        const storeDetails = await fetchStoreDetails(slugOrId);
        if (storeDetails) {
          setShop(prev => ({ ...prev, ...storeDetails }));
        }
      }

      const allProds = await fetchAllProducts();
      const merchantId = initialShop.id;
      const storeProducts = merchantId
        ? allProds.filter(p => p.merchant_id === merchantId || (p.merchant && p.merchant.id === merchantId))
        : allProds;

      setProducts(storeProducts);
      setLoading(false);
    };

    loadData();
  }, [initialShop.slug, initialShop.id]);

  const copyToClipboard = (label, text) => {
    setToast({ title: t('copied_title', `${label} copié !`, { label }), message: `${text}` });
  };

  const shareShop = async () => {
    const shopName = shop.shop_name || shop.name || 'Boutique';
    const shopSlug = shop.slug || 'boutique';
    const formatForUrl = (text) => text ? text.toLowerCase().replace(/\s+/g, '-') : 'unknown';
    const countryStr = formatForUrl(shop.country || 'sn');
    const cityStr = formatForUrl(shop.city_village || 'dakar');
    const shopUrl = `dizzitup://DZYstore/${countryStr}/${cityStr}/${shopSlug}`;

    try {
      await Share.share({
        title: shopName,
        message: t('shop.share.message', `Découvrez la boutique ${shopName} sur DizzitUp : ${shopUrl}`, { name: shopName, url: shopUrl })
      });
      setToast({
        title: t('shop.share.success_title', 'Boutique partagée'),
        message: t('shop.share.success_msg', 'Le partage a été préparé avec succès.')
      });
    } catch {
      setToast({
        title: t('shop.share.copied_title', 'Lien copié'),
        message: t('shop.share.copied_msg', `${shopUrl} a été copié.`, { url: shopUrl })
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
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => setFavorite(!favorite)}>
              <Ionicons name={favorite ? "heart" : "heart-outline"} size={18} color={favorite ? "#EF4444" : "#1A2840"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={shareShop}>
              <Ionicons name="share-outline" size={18} color="#1A2840" />
              <View style={styles.shareBadgeDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Banner Cover Area */}
          <View style={styles.coverContainer}>
            {/* Cover Banner */}
            <View style={styles.coverBg}>
              <View style={styles.coverTextContent}>
                <Text style={styles.coverTitle} numberOfLines={2}>{shop.shop_name || shop.name || t('shop.default_name', 'Boutique')}</Text>
                <Text style={styles.coverSubtitle}>{t('shop.cover_subtitle', 'Tout ce dont vous\navez besoin, livré\nchez vous.')}</Text>
              </View>
              <Image
                source={shop.shop_banner_url ? { uri: shop.shop_banner_url } : require('../../assets/brand/shop_default_banner.jpg')}
                style={styles.coverImage}
              />
              {!shop.shop_banner_url && (
                <View style={{position: 'absolute', bottom: 10, right: 14, backgroundColor: 'rgba(26, 40, 64, 0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12}}>
                  <Text style={{fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#FFF'}}>DZYstore • Dizzitup</Text>
                </View>
              )}
            </View>

            {/* Circular Logo overlay */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image source={shop.shop_logo_url ? { uri: shop.shop_logo_url } : require('../../assets/brand/dizzitup_logo_cercle.png')} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="contain" />
              </View>
              {shop.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}
            </View>
          </View>

          {/* Shop Metadata */}
          <View style={styles.shopInfoHeader}>
            <View style={styles.shopNameRow}>
              <Text style={styles.shopName}>{shop.shop_name || shop.name || t('shop.default_name', 'Boutique')}</Text>
              {shop.verified && <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 6 }} />}
              <View style={styles.flagCityBadge}>
                <Image source={{ uri: `https://flagcdn.com/w20/${getFlagCode(shop.country || shop.raw?.country || shop.country_code)}.png` }} style={{ width: 16, height: 11, marginRight: 4, borderRadius: 2 }} />
                <Text style={styles.flagCityText}>
                  {shop.city_village || shop.raw?.city_village || shop.city || ''}
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
              <View style={[styles.statusBadge, { backgroundColor: '#F5F3FF' }]}>
                <Text style={[styles.statusBadgeText, { color: '#8B5CF6' }]}>{shop.shop_categories || shop.category || t('shop.badges.marketplace', 'Marketplace')}</Text>
              </View>
            </View>

            <Text style={styles.shopType}>{t('shop.badges.online_shopping', 'Shopping en ligne')}</Text>

            <View style={styles.shopMetaRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>4.6</Text>
              <Text style={styles.reviewsText}>(3,215 {t('shop.stats.reviews_verified', 'avis vérifiés')})</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.locationText}>{shop.location || [shop.city_village || shop.raw?.city_village || shop.city, shop.country || shop.raw?.country].filter(Boolean).join(', ')}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.distanceText}>1,5 km</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={18} color="#1A2840" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>12 540</Text>
                <Text style={styles.statLabel}>{t('shop.stats.products', 'Produits')}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={18} color="#1A2840" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>52,3 k</Text>
                <Text style={styles.statLabel}>{t('shop.stats.followers', 'Abonnés')}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="person-outline" size={18} color="#1A2840" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>128</Text>
                <Text style={styles.statLabel}>{t('shop.stats.following', 'Abonnements')}</Text>
              </View>
            </View>
          </View>

          {/* Share Card Row */}
          <View style={styles.shareCardContainer}>
            <View style={styles.fullCard}>
              <Text style={styles.cardTitle}>{t('shop.actions.share_store', 'Partager la boutique')}</Text>
              <View style={styles.socialIconsRow}>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#ECFDF5' }]} onPress={shareShop}>
                  <Ionicons name="logo-whatsapp" size={16} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#EFF6FF' }]} onPress={shareShop}>
                  <Ionicons name="logo-facebook" size={16} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#F5F3FF' }]} onPress={shareShop}>
                  <Ionicons name="logo-instagram" size={16} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#F8FAFC' }]} onPress={shareShop}>
                  <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' }}>X</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#EFF6FF' }]} onPress={shareShop}>
                  <Ionicons name="share-social-outline" size={16} color="#3B82F6" />
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
              <Text style={styles.accordionTitle}>{t('shop.info.title', 'Informations sur la boutique')}</Text>
              <Ionicons name={shopInfoExpanded ? "chevron-up" : "chevron-down"} size={20} color="#1A2840" />
            </TouchableOpacity>
            {shopInfoExpanded && (
              <View style={styles.accordionContent}>
                <TouchableOpacity style={styles.infoRow}>
                  <Ionicons name="cube-outline" size={16} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.info.address', 'Adresse')}</Text>
                    <Text style={styles.infoTextSub}>{shop.street_name || shop.neighborhood || t('shop.info.not_specified', 'Non spécifié')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.info.location', 'Localisation')}</Text>
                    <Text style={styles.infoTextSub}>{shop.location || [shop.city_village || shop.raw?.city_village || shop.city, shop.country || shop.raw?.country].filter(Boolean).join(', ') || t('shop.info.not_specified', 'Non spécifié')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow}>
                  <Ionicons name="bus-outline" size={16} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.info.delivery', 'Retrait / Livraison')}</Text>
                    <Text style={styles.infoTextSub}>{shop.deliveryTime ? t('shop.info.available', 'Disponible') : t('shop.info.not_specified', 'Non spécifié')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => {
                  const formatForUrl = (text) => text ? text.toLowerCase().replace(/\s+/g, '-') : 'unknown';
                  const countryStr = formatForUrl(shop.country || 'sn');
                  const cityStr = formatForUrl(shop.city_village || 'dakar');
                  const shopUrl = `dizzitup://DZYstore/${countryStr}/${cityStr}/${shop.slug || 'boutique'}`;
                  copyToClipboard('URL DZYStore', shopUrl);
                }}>
                  <Ionicons name="globe-outline" size={16} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>DZYstore URL</Text>
                    <Text style={styles.infoTextSub} numberOfLines={1}>dizzitup://.../{shop.slug || 'boutique'}</Text>
                  </View>
                  <Ionicons name="copy-outline" size={14} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={shareShop}>
                  <Ionicons name="logo-whatsapp" size={16} color="#10B981" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.info.social_share', 'Partage sur les réseaux')}</Text>
                    <Text style={styles.infoTextSub}>WhatsApp, Facebook, IG...</Text>
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
              <Text style={styles.accordionTitle}>{t('shop.payment.title', 'Informations de paiement')}</Text>
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
                    <Text style={styles.infoTextSub}>{shop.evm_wallet || t('shop.info.not_specified', 'Non spécifié')}</Text>
                  </View>
                  {shop.evm_wallet && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => { if (shop.solana_wallet) copyToClipboard('Solana wallet', shop.solana_wallet); }}>
                  <Ionicons name="server-outline" size={16} color="#10B981" />
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>Solana wallet</Text>
                    <Text style={styles.infoTextSub}>{shop.solana_wallet || t('shop.info.not_specified', 'Non spécifié')}</Text>
                  </View>
                  {shop.solana_wallet && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => { if (shop.iban_euro) copyToClipboard('IBAN Euro', shop.iban_euro); }}>
                  <Text style={{ fontSize: 14 }}>🇪🇺</Text>
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.payment.euro_iban', 'Euro IBAN Virtual account')}</Text>
                    <Text style={styles.infoTextSub}>{shop.iban_euro || t('shop.info.not_specified', 'Non spécifié')}</Text>
                  </View>
                  {shop.iban_euro && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => { if (shop.usd_account) copyToClipboard('USD Account', shop.usd_account); }}>
                  <Text style={{ fontSize: 14 }}>🇺🇸</Text>
                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <Text style={styles.infoTextSmall}>{t('shop.payment.usd_account', 'USD Bank Virtual account')}</Text>
                    <Text style={styles.infoTextSub}>{shop.usd_account || t('shop.info.not_specified', 'Non spécifié')}</Text>
                  </View>
                  {shop.usd_account && <Ionicons name="copy-outline" size={14} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.btnAcheter} onPress={() => navigation.navigate('ShopProductsScreen')}>
              <Ionicons name="cart-outline" size={18} color="#1A2840" style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.btnAcheterTitle}>{t('shop.actions.buy', 'Acheter')}</Text>
                <Text style={styles.btnAcheterSub}>Buy</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnAchetezMoi} onPress={() => setToast({ title: t('shop.actions.buy_me', 'Achetez-le moi'), message: t('shop.toast.gift_link_generated', 'Lien cadeau généré.') })}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.btnAchetezMoiTitle}>{t('shop.actions.buy_me', 'Achetez-le moi')}</Text>
                <Text style={styles.btnAchetezMoiSub}>Buy me</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Produits populaires */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('shop.sections.popular_products', 'Produits populaires')}</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('ShopProductsScreen')}>
              <Text style={styles.showAllText}>{t('common.viewAll', 'Voir tout')}</Text>
              <Ionicons name="arrow-forward" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
            {loading && <ActivityIndicator size="large" color="#3B82F6" style={{ margin: 20 }} />}
            {!loading && products.length === 0 && <Text style={{ margin: 20, color: '#64748B' }}>Aucun produit trouvé.</Text>}
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                <TouchableOpacity style={styles.heartIcon} onPress={() => setProductFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])}>
                  <Ionicons name={productFavorites.includes(product.id) ? "heart" : "heart-outline"} size={16} color="#F59E0B" />
                </TouchableOpacity>

                <View style={[styles.productImgPlaceholder, { padding: 0, overflow: 'hidden' }]}>
                  {product.product_images && product.product_images.length > 0 ? (
                    <Image source={{ uri: product.product_images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : product.images && product.images.length > 0 ? (
                    <Image source={{ uri: product.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : product.thumbnail ? (
                    <Image source={{ uri: product.thumbnail }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name || 'Produit'}</Text>
                  <Text style={styles.productPrice}>{product.price ? product.price.toLocaleString('fr-FR') + ' FCFA' : 'Prix non défini'}</Text>
                  <Text style={styles.productStock}>{product.stock_quantity > 0 ? t('shop.products.in_stock', 'En stock') : t('outOfStock', 'Rupture')}</Text>
                </View>

                <TouchableOpacity style={styles.btnBuySmall} onPress={() => navigation.navigate('ProductDetailsScreen', { product })}>
                  <Text style={styles.btnBuySmallText}>{t('shop.actions.buy', 'Acheter')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnBuyMeSmall} onPress={() => setToast({ title: t('shop.actions.buy_me', 'Achetez-moi'), message: t('shop.toast.gift_link_generated', 'Lien cadeau généré.') })}>
                  <Text style={styles.btnBuyMeSmallText}>{t('shop.actions.buy_me', 'Achetez-moi')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* À propos de la boutique */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>{t('shop.sections.about_store', 'À propos de')} {shop.shop_name || shop.name || t('shop.default_name', 'la boutique')}</Text>
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutText} numberOfLines={aboutExpanded ? undefined : 3}>
                {shop.description || shop.shop_description || `Bienvenue sur la boutique officielle de ${shop.shop_name || shop.name || 'ce marchand'}. Découvrez nos produits et services au meilleur prix.`}
              </Text>
              <TouchableOpacity style={styles.aboutChevron} onPress={() => setAboutExpanded(!aboutExpanded)}>
                <Ionicons name={aboutExpanded ? "chevron-up" : "chevron-down"} size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  coverContainer: { marginHorizontal: 16, marginBottom: 40, position: 'relative', marginTop: 4 },
  coverBg: { height: 140, backgroundColor: '#1A2840', borderRadius: 16, flexDirection: 'row', overflow: 'hidden', padding: 16, position: 'relative' },
  coverTextContent: { flex: 1, zIndex: 2 },
  coverTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, lineHeight: 26, color: '#FFFFFF', marginBottom: 4 },
  coverSubtitle: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', lineHeight: 16 },
  coverImage: { width: 140, height: '120%', position: 'absolute', right: 0, top: 0, borderRadius: 16, opacity: 0.9 },
  logoContainer: { position: 'absolute', bottom: -30, left: 14 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1A2840', borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', elevation: 3 },
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
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', marginBottom: 8 },
  socialIconsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  socialBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
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
  actionButtonsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 18, gap: 10 },
  btnAcheter: { flex: 1, flexDirection: 'row', height: 46, backgroundColor: '#FFC759', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnAcheterTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', lineHeight: 15 },
  btnAcheterSub: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#1A2840' },
  btnAchetezMoi: { flex: 1, flexDirection: 'row', height: 46, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFC759', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnAchetezMoiTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', lineHeight: 15 },
  btnAchetezMoiSub: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#1A2840' },
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
  btnBuySmall: { backgroundColor: '#FFC759', paddingVertical: 5, borderRadius: 6, alignItems: 'center', marginBottom: 4 },
  btnBuySmallText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
  btnBuyMeSmall: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFC759', paddingVertical: 4, borderRadius: 6, alignItems: 'center' },
  btnBuyMeSmallText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#1A2840' },
  aboutSection: { paddingHorizontal: 16 },
  aboutTextContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  aboutText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', lineHeight: 18, paddingRight: 8 },
  aboutChevron: { paddingBottom: 2 },
});
