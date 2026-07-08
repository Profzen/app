import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import BottomNavBar from '../components/BottomNavBar';
import CustomTabs from '../components/CustomTabs';
import AssetItem from '../components/AssetItem';
import { LinearGradient } from 'expo-linear-gradient';

const ASSETS_DATA = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: '$64,019.78', change: -0.40, imageUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { id: '2', symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: '$1,732.30', change: 0.06, imageUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { id: '3', symbol: 'USDC', name: 'USD Coin', type: 'stablecoin', price: '$0.9997', change: 0.00, imageUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { id: '4', symbol: 'EURC', name: 'EURC', type: 'stablecoin', price: '$1.14', change: -0.12, imageUrl: 'https://cryptologos.cc/logos/euro-coin-eurc-logo.png' },
  { id: '5', symbol: 'DZY', name: 'DZY', type: 'crypto', price: '125,500.00', change: 0.35, icon: 'flash-outline', iconColor: '#F59E0B', iconBgColor: '#FFFBEB' },
  { id: '6', symbol: 'SOL', name: 'Solana', type: 'crypto', price: '$73.73', change: 0.46, imageUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
];

const TABS = [
  { id: 'all', label: 'Tous les actifs' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'stablecoins', label: 'Stablecoins' },
  { id: 'favorites', label: 'Favoris' },
];

export default function AssetsListScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['5']); // DZY favori par défaut comme sur l'image
  
  // Prod behavior for BottomNavBar
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFavoriteToggle = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleAction = (action, symbol) => {
    // Prod behavior simulation
    alert(`Ouverture du module ${action} pour ${symbol}`);
  };

  const filteredAssets = ASSETS_DATA.filter(asset => {
    // Filter by search
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Filter by tab
    if (activeTab === 'crypto') return asset.type === 'crypto';
    if (activeTab === 'stablecoins') return asset.type === 'stablecoin';
    if (activeTab === 'favorites') return favorites.includes(asset.id);
    return true; // 'all'
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header (Fixed) */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#1A2840" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Liste des actifs</Text>
              <Text style={styles.headerSubtitle}>Suivez tous vos actifs au même endroit.</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#1A2840" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="gift-outline" size={22} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Banner */}
          <LinearGradient
            colors={['#0F172A', '#1E3A8A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTag}>DZYwallet</Text>
              <Text style={styles.bannerTitle}>Tout votre argent,{'\n'}toujours avec vous.</Text>
              <Text style={styles.bannerSubtitle}>Sécurisé. Simple. Sans frontières.</Text>
            </View>
            <TouchableOpacity style={styles.bannerAction}>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            {/* Simulation de l'illustration avec la vraie image générée */}
            <View style={styles.bannerIllustration}>
              <Image 
                source={require('../../assets/wallet_banner.png')} 
                style={styles.bannerImage} 
                resizeMode="contain" 
              />
            </View>
          </LinearGradient>

          {/* Search & Sort */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#A0AABF" />
              <TextInput 
                style={styles.searchInput}
                placeholder="Rechercher un actif"
                placeholderTextColor="#A0AABF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.sortBtn}>
              <Text style={styles.sortText}>Trier</Text>
              <Ionicons name="filter" size={16} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <CustomTabs 
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Asset List */}
          <View style={styles.listContainer}>
            {filteredAssets.map(asset => (
              <AssetItem
                key={asset.id}
                icon={asset.icon}
                imageUrl={asset.imageUrl}
                iconColor={asset.iconColor}
                iconBgColor={asset.iconBgColor}
                symbol={asset.symbol}
                name={asset.name}
                price={asset.price}
                change={asset.change}
                isFavorite={favorites.includes(asset.id)}
                onFavoriteToggle={() => handleFavoriteToggle(asset.id)}
                onBuy={() => handleAction('Achat', asset.symbol)}
                onSell={() => handleAction('Vente', asset.symbol)}
              />
            ))}
            
            {filteredAssets.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Aucun actif trouvé.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.addBtn} onPress={() => alert('Ajouter un actif')}>
              <Ionicons name="add" size={18} color="#1A2840" />
              <Text style={styles.addBtnText}>Ajouter un actif</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
        
        {/* Bottom Nav Bar */}
        <BottomNavBar 
          activeTab="Home" // Keeping Home active visually or "Shops" depending on where this lives
          isMenuOpen={isMenuOpen} 
          onCenterButtonPress={() => setIsMenuOpen(!isMenuOpen)} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
  },
  scrollView: {
    flex: 1,
  },
  banner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 140,
  },
  bannerContent: {
    zIndex: 2,
    width: '70%',
  },
  bannerTag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#10B981',
    marginBottom: 8,
  },
  bannerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#D1D5DB',
  },
  bannerAction: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  bannerIllustration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
  },
  bannerImage: {
    width: 140,
    height: 140,
    opacity: 0.9,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1A2840',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 8,
  },
  sortText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
  },
  listContainer: {
    marginTop: 8,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter_400Regular',
    color: '#A0AABF',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 8,
    height: 56,
    borderRadius: 12,
    gap: 8,
  },
  addBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  }
});
