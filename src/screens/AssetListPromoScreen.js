import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

const ASSETS_DATA = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', iconUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', price: '$64,019.28', change: '- 0.81 %', isUp: false, isFav: false },
  { id: '2', symbol: 'ETH', name: 'Ethereum', iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', price: '$1,732.30', change: '+ 0.36 %', isUp: true, isFav: false }, 
  { id: '3', symbol: 'USDC', name: 'USD Coin', iconUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', price: '$0.9997', change: '+ 0.01 %', isUp: true, isFav: false },
  { id: '4', symbol: 'EURC', name: 'EURC', iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20562.png', price: '$1.14', change: '- 0.12 %', isUp: false, isFav: false },
  { id: '5', symbol: 'DZY', name: 'DZY', isLocalIcon: true, price: '125,500.00', change: '+ 0.25 %', isUp: true, isFav: true },
  { id: '6', symbol: 'SOL', name: 'Solana', iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png', price: '$73.73', change: '+ 1.24 %', isUp: true, isFav: false },
];

export default function AssetListPromoScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Tous les actifs');

  const renderAssetRow = ({ item }) => (
    <View style={styles.assetRow}>
      <View style={styles.assetIconContainer}>
        {item.isLocalIcon ? (
          <Image source={require('../../dizzitup logo cercle.png')} style={{width: 36, height: 36}} resizeMode="contain" />
        ) : (
          <Image source={{ uri: item.iconUrl }} style={{width: 36, height: 36}} resizeMode="contain" />
        )}
      </View>
      
      <View style={styles.assetNameContainer}>
        <Text style={styles.assetSymbol}>{item.symbol}</Text>
        <Text style={styles.assetName}>{item.name}</Text>
      </View>

      <View style={styles.sparklineContainer}>
        <Ionicons name={item.isUp ? "trending-up-outline" : "trending-down-outline"} size={24} color={item.isUp ? "#10B981" : "#EF4444"} />
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.assetPrice}>{item.price}</Text>
        <Text style={[styles.assetChange, { color: item.isUp ? '#10B981' : '#EF4444' }]}>
          {item.isUp ? '▲' : '▼'} {item.change.replace('+ ', '').replace('- ', '')}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellButton}>
          <Text style={styles.sellText}>Sell</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.favButton}>
        <Ionicons name={item.isFav ? "star" : "star-outline"} size={18} color={item.isFav ? "#F59E0B" : "#A0AABF"} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>Liste des actifs</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1} adjustsFontSizeToFit>Suivez tous vos actifs au même endroit.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Custom Asset Wallet Promo Card */}
          <View style={styles.walletPromoCard}>
            <View style={styles.walletPromoContent}>
              <View style={styles.walletPromoHeader}>
                <Text style={styles.walletPromoBrand}><Text style={{color: '#F59E0B'}}>DZY</Text>wallet</Text>
                <TouchableOpacity style={styles.promoArrowBtn}>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.walletPromoMainText}>
                Tout votre argent,{'\n'}toujours <Text style={{color: '#FFC759'}}>avec vous.</Text>
              </Text>
              
              <Text style={styles.walletPromoSubText1}>
                Sécurisé sur blockchains, Sans frontière ni Intermédiaire
              </Text>
              
              <Text style={styles.walletPromoSubText2}>
                A Non-Custodial, Multi-chain Stablecoins & Crypto Wallet
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
            
            <View style={styles.walletPromoGraphic}>
              <Image source={require('../../assets/promo_blue_wallet.png')} style={{width: 140, height: 140, position: 'absolute', right: -20, bottom: -20}} resizeMode="contain" />
            </View>
          </View>

          {/* Search & Sort */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#8B92A5" style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder}>Rechercher un actif</Text>
            </View>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Trier</Text>
              <Ionicons name="filter-outline" size={18} color="#1A2840" />
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

          {/* Asset List */}
          <View style={styles.listContainer}>
            {ASSETS_DATA.map(item => (
              <View key={item.id}>
                {renderAssetRow({ item })}
                <View style={styles.rowDivider} />
              </View>
            ))}
          </View>

          {/* Add Asset Button */}
          <TouchableOpacity style={styles.addAssetButton}>
            <Ionicons name="add" size={20} color="#1A2840" style={{marginRight: 8}} />
            <Text style={styles.addAssetText}>Ajouter un actif</Text>
          </TouchableOpacity>
          
          <View style={{ height: 20 }} />

          {/* Invite Banner Footer */}
          <View style={styles.inviteBanner}>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Invitez vos amis{'\n'}et gagnez <Text style={styles.inviteTitleHighlight}>$5 en DZY</Text></Text>
              <Text style={styles.inviteSubtitle}>Envoyez de l'argent, achetez,{'\n'}payez des factures et gagnez des récompenses.</Text>
              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteButtonText}>Inviter maintenant</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inviteGraphic}>
              <View style={styles.phonePlaceholder}>
                <View style={styles.miniCoin}>
                  <Text style={styles.miniCoinText}>DZY</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBannerButton}>
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
        
        <BottomNavBar 
          activeTab="Accueil" 
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  walletPromoCard: {
    backgroundColor: '#0F172A', // Dark blue
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  walletPromoContent: {
    flex: 1,
    zIndex: 2,
  },
  walletPromoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  walletPromoBrand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  promoArrowBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletPromoMainText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 28,
  },
  walletPromoSubText1: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  walletPromoSubText2: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 12,
  },
  walletPromoNetworks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  networkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#E2E8F0',
  },
  networkDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  walletPromoGraphic: {
    width: 80,
    position: 'relative',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8B92A5',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
  },
  sortText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
    marginRight: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  tabItem: {
    marginRight: 24,
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#8B92A5',
  },
  tabTextActive: {
    color: '#1A2840',
    fontFamily: 'Inter_600SemiBold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFC759',
    borderRadius: 1.5,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  assetIconContainer: {
    marginRight: 12,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetNameContainer: {
    width: 80,
  },
  assetSymbol: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  assetName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
  },
  sparklineContainer: {
    flex: 1,
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
    width: 70,
    marginRight: 12,
  },
  assetPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  assetChange: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  buyButton: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  buyText: {
    color: '#F59E0B',
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  sellButton: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sellText: {
    color: '#10B981',
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  favButton: {
    padding: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addAssetText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  inviteBanner: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  inviteContent: {
    flex: 1,
    zIndex: 2,
  },
  inviteTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
  },
  inviteTitleHighlight: {
    color: '#FFC759',
  },
  inviteSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: '#FFC759',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  inviteGraphic: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePlaceholder: {
    width: 60,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  miniCoin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCoinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#1A2840',
  },
  closeBannerButton: {
    position: 'absolute',
    top: 0,
    right: -10,
  }
});
