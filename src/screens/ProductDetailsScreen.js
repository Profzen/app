import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

const { width } = Dimensions.get('window');

const defaultProduct = {
  id: '1',
  name: 'Samsung Galaxy A14',
  price: '155 000 FCFA',
  desc1: 'Smartphone',
  desc2: '64 Go • 4 Go RAM',
  stock: 'En stock',
  category: 'Téléphones & Tablettes'
};

export default function ProductDetailsScreen({ route }) {
  const navigation = useNavigation();
  const productParam = route?.params?.product;
  const product = productParam || defaultProduct;
  const shop = route?.params?.shop;

  const [favorite, setFavorite] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [toast, setToast] = useState(null);

  const shareProduct = async () => { try { await Share.share({title: product.name, message: `Découvrez le ${product.name} sur DizzitUp.`}); } finally { setToast({title: 'Produit partagé', message: 'Le partage a été préparé avec succès.'}); } };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.iconBtnRight} onPress={() => setFavorite(!favorite)}>
            <Ionicons name={favorite ? "heart" : "heart-outline"} size={20} color={favorite ? "#EF4444" : "#1A2840"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtnRight} onPress={shareProduct}>
            <Ionicons name="share-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Section: 2 Columns Layout */}
        <View style={styles.topSection}>
          
          {/* Left Column: Images */}
          <View style={styles.leftCol}>
            <View style={styles.mainImageContainer}>
              <Image source={require('../../assets/promo_shop.png')} style={{ width: '100%', height: 180, borderRadius: 12 }} resizeMode="contain" />
            </View>
          </View>

          {/* Right Column: Product Info */}
          <View style={styles.rightCol}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category || product.desc1 || 'High-Tech'}</Text>
            </View>
            
            <Text style={styles.productTitle}>{product.name}</Text>
            
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Ionicons name="star-half" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>4.6</Text>
              <Text style={styles.reviewsText}>(3,235 avis)</Text>
            </View>

            <View style={styles.stockBadge}>
              <View style={styles.stockDot} />
              <Text style={styles.stockText}>{product.stock || 'En stock'}</Text>
            </View>

            <Text style={styles.priceText}>{product.price}</Text>

            {/* Payment Methods */}
            <View style={styles.paymentCard}>
              <Text style={styles.paymentCardTitle}>Moyens de paiement acceptés</Text>
              <View style={styles.paymentIconsRow}>
                {['USDT', 'USDC', 'EURC', 'DZY'].map((symbol) => <View key={symbol} style={styles.paymentItem}><CryptoIcon symbol={symbol} size={24} /><Text style={styles.tokenLabel}>{symbol}</Text></View>)}
              </View>
            </View>

            {/* Security Banner */}
            <View style={styles.securityBanner}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" style={{marginRight: 8}} />
              <View style={{flex: 1}}>
                <Text style={styles.securityTitle}>Achat 100% sécurisé</Text>
                <Text style={styles.securityText}>Payez en toute sécurité avec vos cryptos préférées.</Text>
              </View>
            </View>

          </View>
        </View>

        <View style={styles.divider} />

        {/* Description Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descRow}>
            <Text style={styles.descText} numberOfLines={descriptionExpanded ? undefined : 3}>
              Le Samsung Galaxy A14 allie performance et élégance. Profitez d'un grand écran immersif, d'une batterie longue durée et d'un design moderne pour vous accompagner au quotidien.
            </Text>
            <TouchableOpacity style={styles.descChevron} onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
              <Ionicons name={descriptionExpanded ? "chevron-up" : "chevron-down"} size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Caractéristiques Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.featuresGrid}>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="phone-portrait-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Écran</Text>
                <Text style={styles.featureValue}>6.6" FHD+ PLS LCD</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="camera-reverse-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Caméra frontale</Text>
                <Text style={styles.featureValue}>13 MP</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="hardware-chip-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Mémoire (RAM)</Text>
                <Text style={styles.featureValue}>4 Go</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="cpu-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Processeur</Text>
                <Text style={styles.featureValue}>Octa-core 2.0 GHz</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="save-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Stockage</Text>
                <Text style={styles.featureValue}>64 Go</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="notifications-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Système</Text>
                <Text style={styles.featureValue}>Android 13, One UI</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="battery-full-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Batterie</Text>
                <Text style={styles.featureValue}>5 000 mAh</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="wifi-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Connectivité</Text>
                <Text style={styles.featureValue}>4G LTE, Wi-Fi, Bluetooth 5.2</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="camera-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Caméra arrière</Text>
                <Text style={styles.featureValue}>50 MP + 2 MP + 2 MP</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Ionicons name="color-palette-outline" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>Couleur</Text>
                <Text style={styles.featureValue}>Noir</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Livraison & Retrait Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Livraison & retrait</Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryItem}>
                <Ionicons name="bus-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                <View>
                  <Text style={styles.deliveryLabel}>Livraison à domicile</Text>
                  <Text style={styles.deliveryValue}>1 à 3 jours ouvrés</Text>
                </View>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="storefront-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                <View>
                  <Text style={styles.deliveryLabel}>Retrait en boutique</Text>
                  <Text style={styles.deliveryValue}>Aujourd'hui</Text>
                </View>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                <View>
                  <Text style={styles.deliveryLabel}>Frais de livraison</Text>
                  <Text style={styles.deliveryValue}>À partir de 1 000 FCFA</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Vendu par Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Vendu par</Text>
          <View style={styles.vendorRow}>
            <View style={styles.vendorLogoCircle}>
              <Text style={styles.vendorLogoText}>JUMIA</Text>
            </View>
            <View style={styles.vendorContent}>
              <View style={styles.vendorNameRow}>
                <Text style={styles.vendorName}>Jumia Sénégal</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{marginLeft: 4}} />
              </View>
              <View style={styles.vendorCategoryBadge}>
                <Text style={styles.vendorCategoryText}>Marketplace</Text>
              </View>
              <Text style={styles.vendorSince}>Membre depuis 2016</Text>
              <View style={styles.vendorRatingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.vendorRating}>4.6</Text>
                <Text style={styles.vendorReviews}>(3,235 avis)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.btnStore} onPress={() => navigation.navigate('ShopDetailsScreen')}>
              <Ionicons name="storefront-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.btnStoreText}>Voir la boutique</Text>
              <Ionicons name="chevron-forward" size={16} color="#1A2840" style={{marginLeft: 8}} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity style={styles.btnContact} onPress={() => setToast({title: 'Contact vendeur', message: 'Une conversation avec Jumia Sénégal a été ouverte.'})}>
          <Ionicons name="chatbubble-outline" size={18} color="#3B82F6" style={{marginRight: 8}} />
          <Text style={styles.btnContactText}>Contacter le vendeur</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnBuy} onPress={() => navigation.navigate('OrderVerificationScreen')}>
          <Ionicons name="cart-outline" size={18} color="#1A2840" style={{marginRight: 8}} />
          <Text style={styles.btnBuyText}>Acheter maintenant</Text>
        </TouchableOpacity>
      </View>
      {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0,
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  leftCol: {
    width: '40%',
    marginRight: 16,
  },
  mainImageContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    height: 200,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  paymentCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentItem: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tokenLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8,
    color: '#1A2840',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
  },
  securityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#1A2840',
    marginBottom: 2,
  },
  securityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#64748B',
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
  vendorLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9E00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vendorLogoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
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
    fontSize: 11,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnContact: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  btnContactText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#3B82F6',
  },
  btnBuy: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#FFB800',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  btnBuyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
});
