import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const ASSETS_DATA = [
  { id: '1', name: 'USD Coin', symbol: 'USDC', balance: '12 450,00', conversion: '≈ 12 450,00 $US', iconUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', type: 'stablecoin' },
  { id: '2', name: 'Tether USD (TRC20)', symbol: 'USDT', balance: '8 750,00', conversion: '≈ 8 750,00 $US', iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png', type: 'stablecoin' },
  { id: '3', name: 'Euro Coin', symbol: 'EURC', balance: '3 200,00', conversion: '≈ 3 480,00 $US', isCustom: true, icon: 'logo-euro', iconColor: '#2775CA', type: 'stablecoin' },
  { id: '4', name: 'DizzitUp Token', symbol: 'DZY', balance: '125 500,00', conversion: '≈ 26 355,00 $US', isLocal: true, type: 'crypto' },
  { id: '5', name: 'Wrapped Bitcoin', symbol: 'WBTC', balance: '0,2450', conversion: '≈ 16 415,00 $US', iconUrl: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png', type: 'crypto' },
];

export default function AssetsListScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['4']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFavoriteToggle = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const filteredAssets = ASSETS_DATA.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'crypto') return asset.type === 'crypto';
    if (activeTab === 'stablecoins') return asset.type === 'stablecoin';
    if (activeTab === 'favorites') return favorites.includes(asset.id);
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
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
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={22} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')}>
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
            <TouchableOpacity style={styles.bannerAction} onPress={() => navigation.navigate('TopUpWalletScreen')}>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Search & Filter Tabs */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#A0AABF" />
              <TextInput 
                style={styles.searchInput}
                placeholder="Rechercher un actif..."
                placeholderTextColor="#A0AABF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.tabsContainer}>
            {['all', 'crypto', 'stablecoins', 'favorites'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'all' ? 'Tous' : tab === 'crypto' ? 'Cryptos' : tab === 'stablecoins' ? 'Stablecoins' : 'Favoris'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Asset List */}
          <View style={styles.assetList}>
            {filteredAssets.map(asset => (
              <View key={asset.id} style={styles.assetCard}>
                <View style={styles.assetIconWrapper}>
                  {asset.isLocal ? (
                    <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={{width: 36, height: 36}} resizeMode="contain" />
                  ) : asset.isCustom ? (
                    <View style={[styles.customIcon, { backgroundColor: asset.iconColor }]}>
                      <Ionicons name={asset.icon} size={20} color="#FFFFFF" />
                    </View>
                  ) : (
                    <Image source={{ uri: asset.iconUrl }} style={{width: 36, height: 36}} resizeMode="contain" />
                  )}
                </View>

                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                </View>

                <View style={styles.assetRight}>
                  <Text style={styles.assetBalance}>{asset.balance}</Text>
                  <Text style={styles.assetConversion}>{asset.conversion}</Text>
                </View>

                <TouchableOpacity style={styles.favBtn} onPress={() => handleFavoriteToggle(asset.id)}>
                  <Ionicons name={favorites.includes(asset.id) ? "star" : "star-outline"} size={18} color={favorites.includes(asset.id) ? "#F59E0B" : "#A0AABF"} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar 
          activeTab="More" 
          isMenuOpen={isMenuOpen} 
          onCenterButtonPress={() => setIsMenuOpen(!isMenuOpen)} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  banner: { borderRadius: 18, padding: 18, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerContent: { flex: 1 },
  bannerTag: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#FFC759', letterSpacing: 0.5 },
  bannerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF', marginTop: 4 },
  bannerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8', marginTop: 2 },
  bannerAction: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  searchSection: { marginTop: 16, marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1A2840', marginLeft: 8 },
  tabsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  tabActive: { backgroundColor: '#FFC759', borderColor: '#FFC759' },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#6B7280' },
  tabTextActive: { fontFamily: 'Inter_700Bold', color: '#1A2840' },
  assetList: { gap: 10 },
  assetCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  assetIconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  customIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  assetInfo: { flex: 1 },
  assetName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  assetSymbol: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 },
  assetRight: { alignItems: 'flex-end', marginRight: 12 },
  assetBalance: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  assetConversion: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8', marginTop: 2 },
  favBtn: { padding: 4 },
});
