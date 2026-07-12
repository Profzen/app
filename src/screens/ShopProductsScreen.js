import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';

const { width } = Dimensions.get('window');
const cardWidth = (Math.min(width, 520) - 48) / 2;

const products = [
  { 
    id: '1', name: 'Samsung Galaxy A14', 
    desc1: 'Smartphone', desc2: '64 Go • 4 Go RAM', 
    price: '155 000 FCFA', stock: 'En stock' 
  },
  { 
    id: '2', name: 'Écouteurs sans fil', 
    desc1: 'Bluetooth 5.3', desc2: 'Son HD • Réduction\nde bruit', 
    price: '25 000 FCFA', stock: 'En stock' 
  },
  { 
    id: '3', name: 'Montre connectée', 
    desc1: 'Écran tactile 1,9"', desc2: 'Suivi santé • Sport\nÉtanche IP67', 
    price: '45 000 FCFA', stock: 'En stock' 
  },
  { 
    id: '4', name: 'OMO Détergent 2,5kg', 
    desc1: 'Poudre, 2,5 kg', desc2: 'Fraîcheur longue\ndurée', 
    price: '6 500 FCFA', stock: 'En stock' 
  },
  { 
    id: '5', name: 'HP 250 G9', 
    desc1: 'Intel Core i3', desc2: '8 Go RAM • 256 Go SSD\n15,6" • Windows 11', 
    price: '310 000 FCFA', stock: 'En stock' 
  },
  { 
    id: '6', name: 'Ninja Air Fryer', 
    desc1: '4,7L • 1500W', desc2: 'Cuisson sans huile\nTechnologie AirCrisp', 
    price: '85 000 FCFA', stock: 'En stock' 
  },
  { 
    id: '7', name: 'Kit Solaire PV 30W', 
    desc1: 'Panneau solaire', desc2: 'Monocristallin\nHaute efficacité', 
    price: '150 000 FCFA', stock: 'En stock' 
  },
  { 
    id: '8', name: 'Internet package', 
    desc1: 'Forfaits data', desc2: 'valables 1, 2 ou 3\nmois', 
    price: '15 000 FCFA', stock: 'En stock' 
  },
];

export default function ShopProductsScreen() {
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
          
          {/* Condensed Shop Info */}
          <View style={styles.condensedInfo}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>JUMIA</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <View style={styles.verifiedBadgeBg} />
              </View>
            </View>
            <View style={styles.condensedContent}>
              <View style={styles.shopNameRow}>
                <Text style={styles.shopName}>Jumia Sénégal</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{marginLeft: 4}} />
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>Marketplace</Text>
              </View>
              <Text style={styles.shopType}>Shopping en ligne</Text>
              <View style={styles.shopMetaRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>4.6</Text>
                <Text style={styles.reviewsText}>(3,235 avis)</Text>
                <Text style={styles.dotSeparator}>|</Text>
                <Ionicons name="location-outline" size={12} color="#64748B" />
                <Text style={styles.locationText}>Dakar, Sénégal</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.distanceText}>1,5 km</Text>
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsCard}>
            <Text style={styles.paymentMethodsTitle}>Moyens de paiement acceptés</Text>
            <View style={styles.paymentIconsRow}>
              <View style={styles.paymentItem}>
                <CryptoIcon symbol="USDT" size={36} />
                <Text style={styles.tokenLabel}>USDT</Text>
              </View>
              <View style={styles.paymentItem}>
                <CryptoIcon symbol="USDC" size={36} />
                <Text style={styles.tokenLabel}>USDC</Text>
              </View>
              <View style={styles.paymentItem}>
                <CryptoIcon symbol="EURC" size={36} />
                <Text style={styles.tokenLabel}>EURC</Text>
              </View>
              <View style={styles.paymentItem}>
                <CryptoIcon symbol="DZY" size={36} />
                <Text style={styles.tokenLabel}>DZY</Text>
              </View>
              <TouchableOpacity style={styles.paymentItem}>
                <Text style={styles.plusLink}>+ Plus</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, styles.tabActive]}>
              <Ionicons name="bag-handle-outline" size={16} color="#FFB800" style={{marginRight: 6}} />
              <Text style={styles.tabTextActive}>Produits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="star-outline" size={16} color="#94A3B8" style={{marginRight: 6}} />
              <Text style={styles.tabTextInactive}>Avis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="information-circle-outline" size={16} color="#94A3B8" style={{marginRight: 6}} />
              <Text style={styles.tabTextInactive}>Infos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="storefront-outline" size={16} color="#94A3B8" style={{marginRight: 6}} />
              <Text style={styles.tabTextInactive}>Boutique</Text>
            </TouchableOpacity>
          </View>

          {/* Search & Filter */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{marginRight: 8}} />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Rechercher un produit..." 
                placeholderTextColor="#94A3B8"
              />
            </View>
            <TouchableOpacity style={styles.btnFilter}>
              <Ionicons name="options-outline" size={18} color="#3B82F6" style={{marginRight: 6}} />
              <Text style={styles.btnFilterText}>Filtrer</Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            <TouchableOpacity style={styles.categoryChipActive}>
              <Text style={styles.categoryChipTextActive}>Tout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Téléphones & Tablettes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Électronique</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Maison & Bureau</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipTextBlue}>Plus ˅</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <TouchableOpacity style={styles.heartIcon}>
                  <Ionicons name="heart-outline" size={14} color="#64748B" />
                </TouchableOpacity>
                <View style={styles.productImgPlaceholder} />
                <View style={styles.productContent}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productDesc}>{product.desc1}</Text>
                  <Text style={styles.productDescLines} numberOfLines={2}>{product.desc2}</Text>
                  
                  <View style={styles.priceStockRow}>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    <Text style={styles.productStock}>{product.stock}</Text>
                  </View>
                  
              <TouchableOpacity style={styles.btnBuyCeci} onPress={() => navigation.navigate('ProductDetailsScreen')}>
                    <Ionicons name="cart-outline" size={12} color="#1A2840" style={{marginRight: 4}} />
                    <Text style={styles.btnBuyCeciText}>Achetez-moi ceci</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Footer Features */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.footerFeaturesScroll}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>Paiement sécurisé</Text>
                <Text style={styles.featureSubtitle}>100% sécurisé</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="bus-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>Livraison rapide</Text>
                <Text style={styles.featureSubtitle}>Partout au Sénégal</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="headset-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>Support 7j/7</Text>
                <Text style={styles.featureSubtitle}>Assistance dédiée</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
              <View>
                <Text style={styles.featureTitle}>Vendeur vérifié</Text>
                <Text style={styles.featureSubtitle}>Marchand de confiance</Text>
              </View>
            </View>
          </ScrollView>

        </ScrollView>
        <BottomNavBar activeTab="shops" />
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
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#8B5CF6',
  },
  shopType: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#3B82F6',
    marginBottom: 4,
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
    padding: 0,
  },
  btnFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnFilterText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#3B82F6',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChipActive: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipTextActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    justifyContent: 'space-between',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 6,
    marginBottom: 8,
    marginHorizontal: 4,
    position: 'relative',
  },
  heartIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 1,
  },
  productImgPlaceholder: {
    height: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  productContent: {
    flex: 1,
  },
  productName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#1A2840',
    marginBottom: 2,
  },
  productDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 7,
    color: '#64748B',
  },
  productDescLines: {
    fontFamily: 'Inter_400Regular',
    fontSize: 7,
    color: '#64748B',
    marginBottom: 4,
    height: 18,
  },
  priceStockRow: {
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#1A2840',
  },
  productStock: {
    fontFamily: 'Inter_500Medium',
    fontSize: 7,
    color: '#10B981',
  },
  btnBuyCeci: {
    flexDirection: 'row',
    backgroundColor: '#FFB800',
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBuyCeciText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 7,
    color: '#1A2840',
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
});
