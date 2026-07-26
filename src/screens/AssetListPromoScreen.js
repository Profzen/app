import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

const INITIAL_ASSETS = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', price: '$64,019.28', change: '0.81 %', isUp: false, isFav: false, category: 'Crypto' },
  { id: '2', symbol: 'ETH', name: 'Ethereum', price: '$1,732.30', change: '0.36 %', isUp: true, isFav: false, category: 'Crypto' }, 
  { id: '3', symbol: 'USDC', name: 'USD Coin', price: '$0.9997', change: '0.01 %', isUp: true, isFav: false, category: 'Stablecoins' },
  { id: '4', symbol: 'EURC', name: 'EURC', price: '$1.14', change: '0.12 %', isUp: false, isFav: false, category: 'Stablecoins' },
  { id: '5', symbol: 'DZY', name: 'DZY', price: '125,500.00', change: '0.25 %', isUp: true, isFav: true, category: 'Crypto' },
  { id: '6', symbol: 'SOL', name: 'Solana', price: '$73.73', change: '1.28 %', isUp: true, isFav: false, category: 'Crypto' },
];

export default function AssetListPromoScreen() {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Tous les actifs');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [toast, setToast] = useState(null);

  const toggleFavorite = (id) => {
    setAssets(prev => prev.map(item => item.id === id ? { ...item, isFav: !item.isFav } : item));
  };

  const filteredAssets = assets.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'Crypto') return item.category === 'Crypto';
    if (activeTab === 'Stablecoins') return item.category === 'Stablecoins';
    if (activeTab === 'Favoris') return item.isFav;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Liste des actifs</Text>
            <Text style={styles.headerSubtitle}>Suivez tous vos actifs au même endroit.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          
          {/* DZYwallet Hero Promo Card */}
          <TouchableOpacity style={styles.walletPromoCard} activeOpacity={0.9} onPress={() => navigation.navigate('TopUpWalletScreen')}>
            <View style={styles.walletPromoContent}>
              <Text style={styles.walletPromoBrand}>DZY<Text style={{ color: '#FFC759' }}>wallet</Text></Text>
              
              <Text style={styles.walletPromoMainText}>
                Tout votre argent,{'\n'}toujours <Text style={{ color: '#FFC759' }}>avec vous.</Text>
              </Text>
              
              <Text style={styles.walletPromoSubText1}>
                Sécurisé sur la blockchain, Sans intermédiaire, Sans frontière
              </Text>
              
              <Text style={styles.walletPromoSubText2}>
                A non-custodial, multi-chain Stablecoin & Crypto wallet
              </Text>
              
              <View style={styles.walletPromoNetworks}>
                <Text style={styles.networkText}>Ethereum</Text>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>Polygon</Text>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>Base</Text>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>BSC</Text>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>Solana</Text>
              </View>
            </View>
            
            {/* Graphic Illustration */}
            <View style={styles.walletPromoGraphic}>
              {/* Floating Crypto Coins */}
              <View style={[styles.floatingCoin, { top: 4, left: 0, backgroundColor: '#3B82F6' }]}>
                <Text style={styles.floatingCoinText}>$</Text>
              </View>
              <View style={[styles.floatingCoin, { top: 2, right: 30, backgroundColor: '#10B981' }]}>
                <Text style={styles.floatingCoinText}>T</Text>
              </View>
              <View style={[styles.floatingCoin, { top: 8, right: 2, backgroundColor: '#2563EB' }]}>
                <Text style={styles.floatingCoinText}>€</Text>
              </View>
              <View style={[styles.floatingCoin, { top: 34, right: 18, backgroundColor: '#F59E0B' }]}>
                <Text style={styles.floatingCoinText}>₿</Text>
              </View>
              
              {/* Wallet Illustration */}
              <View style={styles.leatherWallet}>
                <View style={styles.walletStitching} />
                <View style={styles.walletClasp}>
                  <View style={styles.claspCoin}>
                    <Text style={styles.claspCoinText}>D</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Search & Sort Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un actif"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.sortButton} onPress={() => setToast({ title: 'Triage des actifs', message: 'Les actifs sont triés par ordre de valeur.' })}>
              <Text style={styles.sortText}>Trier</Text>
              <Ionicons name="options-outline" size={16} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {['Tous les actifs', 'Crypto', 'Stablecoins', 'Favoris'].map(tab => (
              <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Assets List */}
          <View style={styles.listContainer}>
            {filteredAssets.map((item, index) => (
              <View key={item.id}>
                <View style={styles.assetRow}>
                  {/* Icon */}
                  <View style={styles.assetIconContainer}>
                    <CryptoIcon symbol={item.symbol} size={38} />
                  </View>
                  
                  {/* Symbol & Name */}
                  <View style={styles.assetNameContainer}>
                    <Text style={styles.assetSymbol}>{item.symbol}</Text>
                    <Text style={styles.assetName}>{item.name}</Text>
                  </View>

                  {/* Sparkline simulation */}
                  <View style={styles.sparklineContainer}>
                    <Ionicons 
                      name={item.isUp ? "pulse-outline" : "pulse-outline"} 
                      size={24} 
                      color={item.isUp ? "#10B981" : "#EF4444"} 
                    />
                  </View>

                  {/* Price & Change */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.assetPrice}>{item.price}</Text>
                    <Text style={[styles.assetChange, { color: item.isUp ? '#10B981' : '#EF4444' }]}>
                      {item.isUp ? '▲' : '▼'} {item.change}
                    </Text>
                  </View>

                  {/* Buy / Sell Buttons */}
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate('SwapTokensScreen')}>
                      <Text style={styles.buyText}>Buy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sellButton} onPress={() => navigation.navigate('SwapTokensScreen')}>
                      <Text style={styles.sellText}>Sell</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Star Favorite */}
                  <TouchableOpacity style={styles.favButton} onPress={() => toggleFavorite(item.id)}>
                    <Ionicons name={item.isFav ? "star" : "star-outline"} size={18} color={item.isFav ? "#FFC759" : "#D1D5DB"} />
                  </TouchableOpacity>
                </View>

                {index < filteredAssets.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </View>

          {/* Add Asset Button */}
          <TouchableOpacity 
            style={styles.addAssetButton} 
            onPress={() => setToast({ title: 'Ajouter un actif', message: 'Recherche de jetons personnalisés ouverte.' })}
          >
            <Ionicons name="add" size={18} color="#1A2840" style={{ marginRight: 6 }} />
            <Text style={styles.addAssetText}>Ajouter un actif</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
        
        <BottomNavBar 
          activeTab="More" 
          language="fr"
          isMenuOpen={isMenuOpen} 
          onCenterButtonPress={() => setIsMenuOpen(!isMenuOpen)} 
        />

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
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  backButton: { padding: 4, marginRight: 4 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840', marginBottom: 1 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 8, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  walletPromoCard: { backgroundColor: '#071D54', marginHorizontal: 20, borderRadius: 16, padding: 18, marginTop: 14, marginBottom: 18, flexDirection: 'row', overflow: 'hidden', minHeight: 150 },
  walletPromoContent: { flex: 1, zIndex: 2 },
  walletPromoBrand: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#FFFFFF', marginBottom: 8 },
  walletPromoMainText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#FFFFFF', marginBottom: 8, lineHeight: 22 },
  walletPromoSubText1: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#E2E8F0', marginBottom: 4 },
  walletPromoSubText2: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#94A3B8', marginBottom: 10 },
  walletPromoNetworks: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  networkText: { fontFamily: 'Inter_500Medium', fontSize: 8, color: '#E2E8F0' },
  networkDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#FFC759' },
  walletPromoGraphic: { width: 100, height: '100%', position: 'absolute', right: 8, top: 0, justifyContent: 'center', alignItems: 'center' },
  floatingCoin: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', position: 'absolute', borderWidth: 1, borderColor: '#FFFFFF' },
  floatingCoinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#FFFFFF' },
  leatherWallet: { width: 70, height: 60, backgroundColor: '#0A1128', borderRadius: 12, borderWidth: 2, borderColor: '#1E293B', position: 'absolute', bottom: 10, right: 6, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 6 },
  walletStitching: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed', borderRadius: 10 },
  walletClasp: { width: 24, height: 20, backgroundColor: '#1E293B', borderRadius: 6, borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  claspCoin: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center' },
  claspCoinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 8, color: '#1A2840' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 42, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, marginRight: 10 },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#1A2840', outlineStyle: 'none' },
  sortButton: { flexDirection: 'row', alignItems: 'center', height: 42, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20 },
  sortText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#1A2840', marginRight: 6 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 6 },
  tabItem: { marginRight: 20, paddingVertical: 10, position: 'relative' },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280' },
  tabTextActive: { color: '#1A2840', fontFamily: 'Inter_600SemiBold' },
  tabIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, backgroundColor: '#FFC759', borderRadius: 1.5 },
  listContainer: { paddingHorizontal: 16, marginBottom: 14 },
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  assetIconContainer: { marginRight: 10 },
  assetNameContainer: { width: 70 },
  assetSymbol: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 1 },
  assetName: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  sparklineContainer: { flex: 1, alignItems: 'center' },
  priceContainer: { alignItems: 'flex-end', marginRight: 10 },
  assetPrice: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 1 },
  assetChange: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8, gap: 4 },
  buyButton: { backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  buyText: { color: '#F59E0B', fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  sellButton: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  sellText: { color: '#10B981', fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  favButton: { padding: 4 },
  rowDivider: { height: 1, backgroundColor: '#F3F4F6' },
  addAssetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFC', marginHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5' },
  addAssetText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
});

