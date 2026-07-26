import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

import { SHOPS_MOCK } from '../mocks/shopsMock';

const { width } = Dimensions.get('window');

const popularProducts = [
  { id: '1', name: 'Samsung Galaxy A14', price: '155 000 FCFA', stock: 'En stock', icon: 'hardware-chip-outline' },
  { id: '2', name: 'Écouteurs Sans fil', price: '25 000 FCFA', stock: 'En stock', icon: 'headset-outline' },
  { id: '3', name: 'Montre connectée', price: '45 000 FCFA', stock: 'En stock', icon: 'watch-outline' },
  { id: '4', name: 'OMO Détergent 2,5kg', price: '8 550 FCFA', stock: 'En stock', icon: 'cube-outline' },
];

export default function ShopDetailsScreen({ route }) {
  const navigation = useNavigation();
  const shopParam = route?.params?.shop;
  const shop = shopParam || SHOPS_MOCK[0];

  const [favorite, setFavorite] = useState(false);
  const [productFavorites, setProductFavorites] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [toast, setToast] = useState(null);

  const copyToClipboard = (label, text) => {
    setToast({ title: `${label} copié !`, message: `${text}` });
  };

  const shareShop = async () => {
    try {
      await Share.share({ title: 'Jumia Sénégal', message: 'Découvrez la boutique Jumia Sénégal sur DizzitUp : dzy.store/jumia-senegal' });
      setToast({ title: 'Boutique partagée', message: 'Le partage a été préparé avec succès.' });
    } catch {
      setToast({ title: 'Lien copié', message: 'dzy.store/jumia-senegal a été copié.' });
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
                <Text style={styles.coverTitle}>{shop.name?.toUpperCase()}</Text>
                <Text style={styles.coverSubtitle}>Tout ce dont vous{'\n'}avez besoin, livré{'\n'}chez vous.</Text>
              </View>
              <Image 
                source={shop.coverImage || require('../../assets/promo_shop.png')} 
                style={styles.coverImage} 
              />
            </View>

            {/* Circular Logo overlay */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image source={shop.logoImage || require('../../assets/brand/dizzitup_logo_cercle.png')} style={{width: 36, height: 36}} resizeMode="contain" />
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
              <Text style={styles.shopName}>{shop.name}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 6 }} />
            </View>

            <View style={styles.badgesRow}>
              <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>ACTIVE</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="bus-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={[styles.statusBadgeText, { color: '#64748B' }]}>{shop.deliveryTime || '24h'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#F5F3FF' }]}>
                <Text style={[styles.statusBadgeText, { color: '#8B5CF6' }]}>{shop.category}</Text>
              </View>
            </View>

            <Text style={styles.shopType}>Shopping en ligne</Text>

            <View style={styles.shopMetaRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>4.6</Text>
              <Text style={styles.reviewsText}>(3,215 avis)</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.locationText}>Dakar, Sénégal</Text>
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
                <Text style={styles.statLabel}>Produits</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={18} color="#1A2840" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>52,3 k</Text>
                <Text style={styles.statLabel}>Abonnés</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="person-outline" size={18} color="#1A2840" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statNumber}>128</Text>
                <Text style={styles.statLabel}>Abonnements</Text>
              </View>
            </View>
          </View>

          {/* QR Code & Share Cards Row */}
          <View style={styles.twoCardsRow}>
            {/* QR Card */}
            <View style={[styles.halfCard, { marginRight: 6 }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>QR code boutique</Text>
                <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
              </View>
              <View style={styles.qrRow}>
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={42} color="#1A2840" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.qrText}>Scannez pour visiter ma boutique</Text>
                  <TouchableOpacity style={styles.urlRow} onPress={() => copyToClipboard('Lien boutique', 'dzy.store/jumia-senegal')}>
                    <Text style={styles.urlText} numberOfLines={1}>dzy.store/jumia-senegal</Text>
                    <Ionicons name="copy-outline" size={12} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Share Card */}
            <View style={[styles.halfCard, { marginLeft: 6 }]}>
              <Text style={styles.cardTitle}>Partager la boutique</Text>
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

          {/* Key Location & Delivery Info Card */}
          <View style={styles.keyInfoCard}>
            <View style={styles.keyInfoCol}>
              <Ionicons name="business-outline" size={18} color="#1A2840" />
              <Text style={styles.keyInfoTitle}>Adresse</Text>
              <Text style={styles.keyInfoDesc}>Sacré-Coeur 3{'\n'}Villa N°9732</Text>
            </View>
            <View style={styles.keyInfoCol}>
              <Ionicons name="location-outline" size={18} color="#1A2840" />
              <Text style={styles.keyInfoTitle}>Localisation</Text>
              <Text style={styles.keyInfoDesc}>Dakar, Sénégal{'\n'}1,5 km</Text>
            </View>
            <View style={styles.keyInfoCol}>
              <Ionicons name="bag-handle-outline" size={18} color="#1A2840" />
              <Text style={styles.keyInfoTitle}>Retrait</Text>
              <Text style={[styles.keyInfoDesc, { color: '#10B981', fontWeight: 'bold' }]}>Disponible</Text>
            </View>
            <View style={styles.keyInfoCol}>
              <Ionicons name="bus-outline" size={18} color="#1A2840" />
              <Text style={styles.keyInfoTitle}>Livraison</Text>
              <Text style={[styles.keyInfoDesc, { color: '#10B981', fontWeight: 'bold' }]}>Disponible</Text>
            </View>
          </View>

          {/* Detailed Info Cards (Payment Info vs Shop Info) */}
          <View style={styles.twoCardsRow}>
            {/* Payment Info Card */}
            <View style={[styles.halfCard, { marginRight: 6 }]}>
              <Text style={styles.cardTitle}>Informations de paiement</Text>
              <View style={styles.infoList}>
                <TouchableOpacity style={styles.infoRow} onPress={() => copyToClipboard('DZYwallet', 'USDC, USDT, EURC, DZY')}>
                  <Ionicons name="wallet-outline" size={14} color="#1A2840" />
                  <Text style={styles.infoText} numberOfLines={1}>DZYwallet (USDC, USDT...)</Text>
                  <Ionicons name="copy-outline" size={12} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => copyToClipboard('EVM wallet', '0x7d17...9Fa3c2E')}>
                  <Ionicons name="logo-polygon" size={14} color="#8B5CF6" />
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>EVM wallet</Text>
                    <Text style={styles.infoTextSub}>0x7d17...9Fa3c2E</Text>
                  </View>
                  <Ionicons name="copy-outline" size={12} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => copyToClipboard('Solana wallet', '7GfK9...mJ8nPcLz')}>
                  <Ionicons name="server-outline" size={14} color="#10B981" />
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>Solana wallet</Text>
                    <Text style={styles.infoTextSub}>7GfK9...mJ8nPcLz</Text>
                  </View>
                  <Ionicons name="copy-outline" size={12} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => copyToClipboard('IBAN Euro', 'DE89 3704 0044 0532 0130 00')}>
                  <Text style={{ fontSize: 10 }}>🇪🇺</Text>
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>Euro IBAN Virtual account</Text>
                    <Text style={styles.infoTextSub}>DE89 3704 0044 0532 0130 00</Text>
                  </View>
                  <Ionicons name="copy-outline" size={12} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => copyToClipboard('USD Account', 'AE10 3315 8923 1000 0001 234')}>
                  <Text style={{ fontSize: 10 }}>🇺🇸</Text>
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>USD Bank Virtual account</Text>
                    <Text style={styles.infoTextSub}>AE10 3315 8923 1000 0001 234</Text>
                  </View>
                  <Ionicons name="copy-outline" size={12} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Shop Info Card */}
            <View style={[styles.halfCard, { marginLeft: 6 }]}>
              <Text style={styles.cardTitle}>Informations sur la boutique</Text>
              <View style={styles.infoList}>
                <TouchableOpacity style={styles.infoRow}>
                  <Ionicons name="cube-outline" size={14} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>Adresse</Text>
                    <Text style={styles.infoTextSub}>Sacré-Coeur 3, Villa N°9732</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>Localisation</Text>
                    <Text style={styles.infoTextSub}>Dakar, Sénégal (1,5 km)</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow}>
                  <Ionicons name="bus-outline" size={14} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>Retrait / Livraison</Text>
                    <Text style={styles.infoTextSub}>Disponible</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={() => copyToClipboard('URL DZYStore', 'dzy.store/jumia-senegal')}>
                  <Ionicons name="globe-outline" size={14} color="#1A2840" />
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>DZYstore URL</Text>
                    <Text style={styles.infoTextSub}>dzy.store /jumia-senegal</Text>
                  </View>
                  <Ionicons name="copy-outline" size={12} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoRow} onPress={shareShop}>
                  <Ionicons name="logo-whatsapp" size={14} color="#10B981" />
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={styles.infoTextSmall}>Partage sur les réseaux</Text>
                    <Text style={styles.infoTextSub}>WhatsApp, Facebook, IG...</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Moyens de paiement acceptés */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Moyens de paiement acceptés</Text>
            <View style={styles.paymentSelectGrid}>
              <TouchableOpacity 
                style={[styles.paymentSelectCard, selectedPayment === 'card' && styles.paymentSelectCardActive]}
                onPress={() => setSelectedPayment('card')}
              >
                <View style={[styles.paymentSelectIcon, { backgroundColor: '#FFC759' }]}>
                  <Ionicons name="card-outline" size={18} color="#1A2840" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.paymentSelectTitle}>Card Payment</Text>
                  <Text style={styles.paymentSelectSub}>Visa, Mastercard, Amex</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentSelectCard, selectedPayment === 'wallet' && styles.paymentSelectCardActive]}
                onPress={() => setSelectedPayment('wallet')}
              >
                <View style={[styles.paymentSelectIcon, { backgroundColor: '#F8FAFC' }]}>
                  <Ionicons name="wallet-outline" size={18} color="#1A2840" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.paymentSelectTitle}>DZYwallet (Stablecoins & DZY)</Text>
                  <Text style={styles.paymentSelectSub}>USDC, USDT, EURC, DZY</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentSelectCard, selectedPayment === 'mobile' && styles.paymentSelectCardActive]}
                onPress={() => setSelectedPayment('mobile')}
              >
                <View style={[styles.paymentSelectIcon, { backgroundColor: '#F8FAFC' }]}>
                  <Ionicons name="phone-portrait-outline" size={18} color="#1A2840" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.paymentSelectTitle}>Mobile Money (géolocalisé)</Text>
                  <Text style={styles.paymentSelectSub}>Payer avec Mobile Money</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.btnAcheter} onPress={() => navigation.navigate('ShopProductsScreen')}>
              <Ionicons name="cart-outline" size={18} color="#1A2840" style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.btnAcheterTitle}>Acheter</Text>
                <Text style={styles.btnAcheterSub}>Buy</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnAchetezMoi} onPress={() => setToast({ title: 'Option Achetez-le moi', message: 'Le lien de paiement cadeau est prêt.' })}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.btnAchetezMoiTitle}>Achetez-le moi</Text>
                <Text style={styles.btnAchetezMoiSub}>Buy me</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Produits populaires */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Produits populaires</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('ShopProductsScreen')}>
              <Text style={styles.showAllText}>Voir tout</Text>
              <Ionicons name="arrow-forward" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
            {popularProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <TouchableOpacity style={styles.heartIcon} onPress={() => setProductFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])}>
                  <Ionicons name={productFavorites.includes(product.id) ? "heart" : "heart-outline"} size={16} color="#F59E0B" />
                </TouchableOpacity>
                
                <View style={styles.productImgPlaceholder}>
                  <Ionicons name={product.icon} size={32} color="#3B82F6" />
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  <Text style={styles.productStock}>{product.stock}</Text>
                </View>

                <TouchableOpacity style={styles.btnBuySmall} onPress={() => navigation.navigate('ProductDetailsScreen')}>
                  <Text style={styles.btnBuySmallText}>Acheter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnBuyMeSmall} onPress={() => setToast({ title: 'Achetez-moi', message: 'Lien cadeau généré.' })}>
                  <Text style={styles.btnBuyMeSmallText}>Achetez-moi</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* À propos de Jumia Sénégal */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>À propos de Jumia Sénégal</Text>
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutText} numberOfLines={aboutExpanded ? undefined : 3}>
                Jumia Sénégal est la plateforme de e-commerce numéro 1 au Sénégal. Nous vous proposons des milliers de produits dans plusieurs catégories : électronique, mode, maison, beauté, sport et bien plus encore.
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
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
  coverBg: { height: 140, backgroundColor: '#FF6B00', borderRadius: 16, flexDirection: 'row', overflow: 'hidden', padding: 16, position: 'relative' },
  coverTextContent: { flex: 1, zIndex: 2 },
  coverTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: '#FFFFFF', marginBottom: 4 },
  coverSubtitle: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', lineHeight: 16 },
  coverImage: { width: 140, height: '120%', position: 'absolute', right: 0, top: 0, borderRadius: 16, opacity: 0.9 },
  logoContainer: { position: 'absolute', bottom: -30, left: 14 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF6B00', borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
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
  twoCardsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12 },
  halfCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 14, padding: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', marginBottom: 8 },
  qrRow: { flexDirection: 'row', alignItems: 'center' },
  qrPlaceholder: { width: 50, height: 50, backgroundColor: '#F8FAFC', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  qrText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#6B7280', lineHeight: 11, marginBottom: 4 },
  urlRow: { flexDirection: 'row', alignItems: 'center' },
  urlText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#3B82F6', marginRight: 4 },
  socialIconsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  socialBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  keyInfoCard: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 14, marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 8, marginBottom: 12 },
  keyInfoCol: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  keyInfoTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#1A2840', marginTop: 4, marginBottom: 2 },
  keyInfoDesc: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#6B7280', textAlign: 'center', lineHeight: 11 },
  infoList: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', minHeight: 24 },
  infoText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#1A2840', flex: 1, marginLeft: 4 },
  infoTextSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#1A2840' },
  infoTextSub: { fontFamily: 'Inter_400Regular', fontSize: 8, color: '#6B7280' },
  sectionContainer: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginBottom: 10 },
  paymentSelectGrid: { gap: 8 },
  paymentSelectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 10 },
  paymentSelectCardActive: { borderColor: '#FFC759', backgroundColor: '#FFFDF5' },
  paymentSelectIcon: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  paymentSelectTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  paymentSelectSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280' },
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
