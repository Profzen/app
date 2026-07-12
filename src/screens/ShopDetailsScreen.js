import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const popularProducts = [
  { id: '1', name: 'Samsung Galaxy A14', price: '155 000 FCFA', stock: 'En stock', image: 'https://i.pravatar.cc/150?img=1' }, // Using dummy images
  { id: '2', name: 'Écouteurs sans fil', price: '25 000 FCFA', stock: 'En stock', image: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Montre connectée', price: '45 000 FCFA', stock: 'En stock', image: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'OMO Détergent 2,5kg', price: '6 500 FCFA', stock: 'En stock', image: 'https://i.pravatar.cc/150?img=4' },
];

export default function ShopDetailsScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="heart-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="share-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Cover Image Area */}
          <View style={styles.coverContainer}>
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverTitle}>JUMIA</Text>
              <Text style={styles.coverSubtitle}>Tout ce dont vous{'\n'}avez besoin, livré{'\n'}chez vous.</Text>
            </View>
            
            {/* Circular Logo overlaying cover */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>JUMIA</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <View style={styles.verifiedBadgeBg} />
              </View>
            </View>
          </View>

          {/* Shop Info Header */}
          <View style={styles.shopInfoHeader}>
            <View style={styles.shopNameRow}>
              <Text style={styles.shopName}>Jumia Sénégal</Text>
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" style={{marginLeft: 6}} />
            </View>
            
            <View style={[styles.categoryBadge, {backgroundColor: '#F5F3FF'}]}>
              <Text style={[styles.categoryBadgeText, {color: '#8B5CF6'}]}>Marketplace</Text>
            </View>
            
            <Text style={styles.shopType}>Shopping en ligne</Text>
            
            <View style={styles.shopMetaRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>4.6</Text>
              <Text style={styles.reviewsText}>(3,235 avis)</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text style={styles.locationText}>Dakar, Sénégal</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.distanceText}>1,5 km</Text>
            </View>
          </View>

          {/* Info Cards Grid */}
          <View style={styles.infoCardsGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color="#3B82F6" style={{marginBottom: 8}} />
              <Text style={styles.infoCardTitle}>Horaires</Text>
              <Text style={styles.infoCardTextBlue}>Lun - Dim</Text>
              <Text style={styles.infoCardText}>08:00 - 22:00</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="bus-outline" size={20} color="#3B82F6" style={{marginBottom: 8}} />
              <Text style={styles.infoCardTitle}>Livraison</Text>
              <Text style={styles.infoCardText}>Delivery, Pickup</Text>
              <Text style={styles.infoCardText}>On-line</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" style={{marginBottom: 8}} />
              <Text style={styles.infoCardTitle}>Vérifié</Text>
              <Text style={styles.infoCardText}>Marchand</Text>
              <Text style={styles.infoCardText}>Vérifié</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="storefront-outline" size={20} color="#3B82F6" style={{marginBottom: 8}} />
              <Text style={styles.infoCardTitle}>Depuis</Text>
              <Text style={styles.infoCardTextBlue}>2016</Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsCard}>
            <Text style={styles.paymentMethodsTitle}>Moyens de paiement acceptés</Text>
            <View style={styles.paymentIconsRow}>
              <View style={styles.paymentItem}>
                <View style={[styles.tokenIcon, {backgroundColor: '#10B981'}]}><Text style={styles.tokenIconText}>₮</Text></View>
                <Text style={styles.tokenLabel}>USDT</Text>
              </View>
              <View style={styles.paymentItem}>
                <View style={[styles.tokenIcon, {backgroundColor: '#3B82F6'}]}><Text style={styles.tokenIconText}>$</Text></View>
                <Text style={styles.tokenLabel}>USDC</Text>
              </View>
              <View style={styles.paymentItem}>
                <View style={[styles.tokenIcon, {backgroundColor: '#3B82F6'}]}><Text style={styles.tokenIconText}>€</Text></View>
                <Text style={styles.tokenLabel}>EURC</Text>
              </View>
              <View style={styles.paymentItem}>
                <View style={[styles.tokenIcon, {backgroundColor: '#0A1128'}]}><Text style={[styles.tokenIconText, {color: '#FFB800'}]}>D</Text></View>
                <Text style={styles.tokenLabel}>DZY</Text>
              </View>
              <TouchableOpacity style={styles.paymentItem}>
                <Text style={styles.plusLink}>+ Plus</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.btnContact}>
              <Ionicons name="chatbubble-outline" size={18} color="#3B82F6" style={{marginRight: 8}} />
              <Text style={styles.btnContactText}>Contacter</Text>
            </TouchableOpacity>
          <TouchableOpacity style={styles.btnProducts} onPress={() => navigation.navigate('ShopProductsScreen')}>
              <Ionicons name="bag-handle-outline" size={18} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.btnProductsText}>Voir les produits</Text>
            </TouchableOpacity>
          </View>

          {/* Produits populaires */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Produits populaires</Text>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.showAllText}>Voir tout</Text>
              <Ionicons name="arrow-forward" size={16} color="#3B82F6" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
            {popularProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <TouchableOpacity style={styles.heartIcon}>
                  <Ionicons name="heart-outline" size={18} color="#F59E0B" />
                </TouchableOpacity>
                <View style={styles.productImgPlaceholder} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  <Text style={styles.productStock}>{product.stock}</Text>
                </View>
            <TouchableOpacity style={styles.btnBuy} onPress={() => navigation.navigate('ProductDetailsScreen')}>
                  <Text style={styles.btnBuyText}>Acheter</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* À propos */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>À propos de Jumia Sénégal</Text>
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutText}>
                Jumia Sénégal est la plateforme de e-commerce numéro 1 au Sénégal. Nous vous proposons des milliers de produits dans plusieurs catégories : électronique, mode, maison, beauté, sport et bien plus encore.
              </Text>
              <TouchableOpacity style={styles.aboutChevron}>
                <Ionicons name="chevron-down" size={20} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingBottom: 40,
  },
  coverContainer: {
    marginHorizontal: 16,
    marginBottom: 50, // Space for the overlapping logo
    position: 'relative',
  },
  coverPlaceholder: {
    height: 160,
    backgroundColor: '#FF9E00',
    borderRadius: 16,
    padding: 20,
  },
  coverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  coverSubtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF9E00',
    borderWidth: 4,
    borderColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeBg: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    zIndex: -1,
    borderRadius: 8,
  },
  shopInfoHeader: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  shopType: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 8,
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 4,
  },
  reviewsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  dotSeparator: {
    color: '#CBD5E1',
    marginHorizontal: 8,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 4,
  },
  distanceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
  },
  infoCardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoCard: {
    width: (width - 32 - 36) / 4, // 4 cards with 12 spacing (3*12=36)
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1A2840',
    marginBottom: 4,
  },
  infoCardText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 2,
  },
  infoCardTextBlue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 2,
  },
  paymentMethodsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  paymentMethodsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  tokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
  },
  plusLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#3B82F6',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  btnContact: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  btnContactText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#3B82F6',
  },
  btnProducts: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#FFB800',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  btnProductsText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  showAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#3B82F6',
  },
  productsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    position: 'relative',
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  productImgPlaceholder: {
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 4,
  },
  productStock: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#10B981',
  },
  btnBuy: {
    backgroundColor: '#FFB800',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnBuyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  aboutSection: {
    paddingHorizontal: 16,
  },
  aboutTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  aboutText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    paddingRight: 16,
  },
  aboutChevron: {
    paddingBottom: 2,
  },
});
