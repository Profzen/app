import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Share, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

const categories = ['Tout', 'Téléphones & Tablettes', 'Électronique', 'Maison & Bureau'];

const products = [
  { 
    id: '1', name: 'Samsung Galaxy A14', 
    desc1: 'Smartphone', desc2: '64 Go • 4 Go RAM', 
    price: '155 000 FCFA', stock: 'En stock', category: 'Téléphones & Tablettes', priceValue: 155000
  },
  { 
    id: '2', name: 'Écouteurs sans fil', 
    desc1: 'Bluetooth 5.3', desc2: 'Son HD • Réduction\nde bruit', 
    price: '25 000 FCFA', stock: 'En stock', category: 'Électronique', priceValue: 25000
  },
  { 
    id: '3', name: 'Montre connectée', 
    desc1: 'Écran tactile 1,9"', desc2: 'Suivi santé • Sport\nÉtanche IP67', 
    price: '45 000 FCFA', stock: 'En stock', category: 'Électronique', priceValue: 45000
  },
  { 
    id: '4', name: 'OMO Détergent 2,5kg', 
    desc1: 'Poudre, 2,5 kg', desc2: 'Fraîcheur longue\ndurée', 
    price: '6 500 FCFA', stock: 'En stock', category: 'Maison & Bureau', priceValue: 6500
  },
  { 
    id: '5', name: 'HP 250 G9', 
    desc1: 'Intel Core i3', desc2: '8 Go RAM • 256 Go SSD\n15,6" • Windows 11', 
    price: '310 000 FCFA', stock: 'En stock', category: 'Électronique', priceValue: 310000
  },
  { 
    id: '6', name: 'Ninja Air Fryer', 
    desc1: '4,7L • 1500W', desc2: 'Cuisson sans huile\nTechnologie AirCrisp', 
    price: '85 000 FCFA', stock: 'En stock', category: 'Maison & Bureau', priceValue: 85000
  },
  { 
    id: '7', name: 'Kit Solaire PV 30W', 
    desc1: 'Panneau solaire', desc2: 'Monocristallin\nHaute efficacité', 
    price: '150 000 FCFA', stock: 'En stock', category: 'Maison & Bureau', priceValue: 150000
  },
  { 
    id: '8', name: 'Internet package', 
    desc1: 'Forfaits data', desc2: 'valables 1, 2 ou 3\nmois', 
    price: '15 000 FCFA', stock: 'En stock', category: 'Électronique', priceValue: 15000
  },
];

export default function ShopProductsScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [favorite, setFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tout');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const productWidth = width < 340 ? Math.max(250, width - 40) : (Math.min(width, 520) - 56) / 2;
  const filteredProducts = useMemo(() => products.filter((product) => (category === 'Tout' || product.category === category) && product.name.toLowerCase().includes(query.trim().toLowerCase()) && (priceFilter === 'all' || (priceFilter === 'low' ? product.priceValue < 50000 : product.priceValue >= 50000))), [category, query, priceFilter]);
  const shareShop = async () => { try { await Share.share({title: 'Jumia Sénégal', message: 'Découvrez les produits de Jumia Sénégal sur DizzitUp.'}); } finally { setToast({title: 'Partage prêt', message: 'La boutique peut maintenant être envoyée à vos contacts.'}); } };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => setFavorite(!favorite)}>
              <Ionicons name={favorite ? "heart" : "heart-outline"} size={20} color={favorite ? "#EF4444" : "#1A2840"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={shareShop}>
              <Ionicons name="share-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => setToast({title:'Options de la boutique',message:'Les actions supplémentaires sont disponibles.'})}>
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
            <TouchableOpacity style={[styles.tab, activeTab === 'products' && styles.tabActive]} onPress={() => setActiveTab('products')}>
              <Ionicons name="bag-handle-outline" size={16} color={activeTab === 'products' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'products' ? styles.tabTextActive : styles.tabTextInactive}>Produits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'reviews' && styles.tabActive]} onPress={() => setActiveTab('reviews')}>
              <Ionicons name="star-outline" size={16} color={activeTab === 'reviews' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'reviews' ? styles.tabTextActive : styles.tabTextInactive}>Avis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.tabActive]} onPress={() => setActiveTab('info')}>
              <Ionicons name="information-circle-outline" size={16} color={activeTab === 'info' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'info' ? styles.tabTextActive : styles.tabTextInactive}>Infos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'shop' && styles.tabActive]} onPress={() => setActiveTab('shop')}>
              <Ionicons name="storefront-outline" size={16} color={activeTab === 'shop' ? '#FFB800' : '#94A3B8'} style={{marginRight: 6}} />
              <Text style={activeTab === 'shop' ? styles.tabTextActive : styles.tabTextInactive}>Boutique</Text>
            </TouchableOpacity>
          </View>

          {activeTab !== 'products' && <ShopTabContent tab={activeTab} onViewShop={() => navigation.navigate('ShopDetailsScreen')} />}

          <View style={activeTab === 'products' ? null : styles.hidden}>

          {/* Search & Filter */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{marginRight: 8}} />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Rechercher un produit..." 
                placeholderTextColor="#94A3B8"
                value={query}
                onChangeText={setQuery}
              />
            </View>
            <TouchableOpacity style={styles.btnFilter} onPress={() => setFilterOpen(!filterOpen)}>
              <Ionicons name="options-outline" size={18} color="#3B82F6" style={{marginRight: 6}} />
              <Text style={styles.btnFilterText}>Filtrer</Text>
            </TouchableOpacity>
          </View>
          {filterOpen && <View style={styles.filterPanel}><Text style={styles.filterPanelTitle}>Prix</Text>{[{value:'all',label:'Tous les prix'},{value:'low',label:'Moins de 50 000 FCFA'},{value:'high',label:'50 000 FCFA et plus'}].map((option) => <TouchableOpacity key={option.value} style={[styles.filterOption, priceFilter === option.value && styles.filterOptionActive]} onPress={() => {setPriceFilter(option.value);setFilterOpen(false)}}><Text style={styles.filterOptionText}>{option.label}</Text>{priceFilter === option.value && <Ionicons name="checkmark" size={18} color="#F59E0B" />}</TouchableOpacity>)}</View>}

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((item) => <TouchableOpacity key={item} style={category === item ? styles.categoryChipActive : styles.categoryChip} onPress={() => setCategory(item)}><Text style={category === item ? styles.categoryChipTextActive : styles.categoryChipText}>{item}</Text></TouchableOpacity>)}
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipTextBlue}>Plus ˅</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={[styles.productCard, {width: productWidth}]}>
                <TouchableOpacity style={styles.heartIcon} onPress={() => setFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])}>
                  <Ionicons name={favorites.includes(product.id) ? "heart" : "heart-outline"} size={14} color={favorites.includes(product.id) ? "#EF4444" : "#64748B"} />
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
          </View>

        </ScrollView>
        <BottomNavBar activeTab="shops" />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

function ShopTabContent({ tab, onViewShop }) {
  if (tab === 'reviews') return <View style={styles.tabPage}><Text style={styles.tabPageTitle}>Avis clients</Text><View style={styles.ratingSummary}><Text style={styles.ratingBig}>4.6</Text><View><Text style={styles.stars}>★★★★★</Text><Text style={styles.tabPageText}>3 235 avis vérifiés</Text></View></View>{['Livraison rapide et produit conforme.', 'Très bon vendeur, je recommande.', 'Service client réactif.'].map((review, index) => <View key={review} style={styles.reviewCard}><View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{['MK','OT','AB'][index]}</Text></View><View style={{flex:1}}><Text style={styles.reviewName}>{['Marie K.','Ousmane T.','Aïssatou B.'][index]}</Text><Text style={styles.tabPageText}>{review}</Text></View></View>)}</View>;
  if (tab === 'info') return <View style={styles.tabPage}><Text style={styles.tabPageTitle}>Informations pratiques</Text>{[['time-outline','Horaires','Lundi à dimanche, 08:00 – 22:00'],['bus-outline','Livraison','Livraison, retrait et commande en ligne'],['location-outline','Adresse','Dakar, Sénégal'],['shield-checkmark-outline','Vérification','Marchand vérifié depuis 2016']].map(([icon,title,text]) => <View key={title} style={styles.infoRow}><View style={styles.infoIcon}><Ionicons name={icon} size={20} color="#3B82F6" /></View><View><Text style={styles.infoTitle}>{title}</Text><Text style={styles.tabPageText}>{text}</Text></View></View>)}</View>;
  return <View style={styles.tabPage}><Text style={styles.tabPageTitle}>À propos de la boutique</Text><Text style={styles.tabPageText}>Jumia Sénégal propose des produits électroniques, téléphones, articles pour la maison et de nombreux services avec paiement sécurisé en crypto.</Text><TouchableOpacity style={styles.viewShopButton} onPress={onViewShop}><Ionicons name="storefront-outline" size={19} color="#1A2840" /><Text style={styles.viewShopButtonText}>Voir la fiche complète</Text></TouchableOpacity></View>;
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
    outlineStyle: 'none',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 6,
    marginBottom: 8,
    marginHorizontal: 4,
    position: 'relative',
  },
  hidden: { display: 'none' },
  filterPanel: { marginHorizontal: 16, marginBottom: 14, padding: 12, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterPanelTitle: { fontFamily: 'Inter_700Bold', color: '#1A2840', marginBottom: 6 },
  filterOption: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderRadius: 10 },
  filterOptionActive: { backgroundColor: '#FFF8E6' },
  filterOptionText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#1A2840' },
  tabPage: { margin: 16, padding: 18, backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  tabPageTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, color: '#1A2840', marginBottom: 14 },
  tabPageText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#64748B' },
  ratingSummary: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: '#FFF8E6', marginBottom: 12 },
  ratingBig: { fontFamily: 'Inter_700Bold', fontSize: 34, color: '#1A2840', marginRight: 14 },
  stars: { color: '#F59E0B', letterSpacing: 2, marginBottom: 3 },
  reviewCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reviewAvatarText: { fontFamily: 'Inter_700Bold', color: '#3B82F6' },
  reviewName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', marginBottom: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', marginBottom: 3 },
  viewShopButton: { marginTop: 18, height: 50, borderRadius: 14, backgroundColor: '#FFB800', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  viewShopButtonText: { fontFamily: 'Inter_700Bold', color: '#1A2840' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 40 },
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
