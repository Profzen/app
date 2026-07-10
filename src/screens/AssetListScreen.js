import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

const ASSETS_DATA = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', icon: 'logo-bitcoin', iconColor: '#F7931A', price: '$64,019.78', change: '- 0.40 %', isUp: false, isFav: false },
  { id: '2', symbol: 'ETH', name: 'Ethereum', icon: 'diamond-outline', iconColor: '#627EEA', price: '$1,732.30', change: '+ 0.06 %', isUp: true, isFav: false }, 
  { id: '3', symbol: 'USDC', name: 'USD Coin', icon: 'logo-usd', iconColor: '#2775CA', price: '$0.9997', change: '+ 0.00 %', isUp: true, isFav: false },
  { id: '4', symbol: 'EURC', name: 'EURC', icon: 'logo-euro', iconColor: '#0052FF', price: '$1.14', change: '- 0.12 %', isUp: false, isFav: false },
  { id: '5', symbol: 'DZY', name: 'DZY', icon: 'logo-dribbble', iconColor: '#F59E0B', price: '125,500.00', change: '+ 0.35 %', isUp: true, isFav: true },
  { id: '6', symbol: 'SOL', name: 'Solana', icon: 'logo-venmo', iconColor: '#14F195', price: '$73.73', change: '+ 1.25 %', isUp: true, isFav: false },
];

export default function AssetListScreen() {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Tous les actifs');

  const renderAssetRow = ({ item }) => (
    <View style={styles.assetRow}>
      <View style={styles.assetIconContainer}>
        {/* Placeholder for real crypto icons, using Ionicons for now */}
        <View style={[styles.cryptoIcon, { backgroundColor: item.iconColor }]}>
          <Ionicons name={item.icon} size={20} color="#FFFFFF" />
        </View>
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
          <Text style={styles.buyText}>Acheter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellButton}>
          <Text style={styles.sellText}>Vendre</Text>
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
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
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Custom Asset Wallet Card */}
          <View style={styles.walletCard}>
            {/* Top row: Title, eye, Recharger */}
            <View style={styles.walletHeader}>
              <View style={styles.walletTitleRow}>
                <Text style={styles.walletTitleText}>DZYwallet</Text>
                <TouchableOpacity style={styles.eyeIcon}>
                  <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.walletActionsTop}>
                <TouchableOpacity style={styles.topUpButton}>
                  <Ionicons name="add" size={14} color="#1A2840" />
                  <Text style={styles.topUpText}>Recharger</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.arrowButtonRound}>
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Balances */}
            <View style={styles.walletBalancesRow}>
              <View style={styles.balancesLeft}>
                <Text style={styles.mainBalanceText}>
                  125,500.00 <Text style={styles.currencyText}>DZY</Text>
                </Text>
                <View style={styles.conversionStack}>
                  <View style={styles.conversionItem}>
                    <Image source={{ uri: 'https://flagcdn.com/w80/gh.png' }} style={styles.flagImage} />
                    <View>
                      <Text style={styles.conversionValue}>≈ 125,000.00 GHS</Text>
                      <Text style={styles.conversionLabel}>Ghana Cedi</Text>
                    </View>
                  </View>
                  <View style={styles.conversionItem}>
                    <Image source={{ uri: 'https://flagcdn.com/w80/tg.png' }} style={styles.flagImage} />
                    <View>
                      <Text style={styles.conversionValue}>≈ 510,000.00 XOF</Text>
                      <Text style={styles.conversionLabel}>CFA Franc (Togo)</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.giantCoinContainer}>
                {/* CSS Giant Coin */}
                <View style={styles.giantCoin}>
                  <View style={styles.innerCoin}>
                    <Text style={styles.coinText}>DZY</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.walletBottomActions}>
              <View style={styles.actionItem}>
                <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionLabel}>Envoyer</Text>
              </View>
              <View style={styles.actionSeparator} />
              <View style={styles.actionItem}>
                <Ionicons name="arrow-down-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionLabel}>Recevoir</Text>
              </View>
              <View style={styles.actionSeparator} />
              <View style={styles.actionItem}>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionLabel}>Historique</Text>
              </View>
              <View style={styles.actionSeparator} />
              <View style={styles.actionItem}>
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionLabel}>Cash-out</Text>
              </View>
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
    flex: 1,
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
    marginTop: 2,
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
  walletCard: {
    backgroundColor: '#0F172A', // Dark blue
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    overflow: 'hidden',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFC759',
  },
  eyeIcon: {
    marginLeft: 8,
  },
  walletActionsTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topUpButton: {
    backgroundColor: '#FFC759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  topUpText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginLeft: 4,
  },
  arrowButtonRound: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBalancesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balancesLeft: {
    flex: 1,
  },
  mainBalanceText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  currencyText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  conversionStack: {
    flexDirection: 'column',
    gap: 12,
  },
  conversionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  conversionValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  conversionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#A0AABF',
  },
  giantCoinContainer: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  giantCoin: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: -4, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  innerCoin: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  coinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  walletBottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 6,
  },
  actionSeparator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  inviteBanner: {
    backgroundColor: '#0F172A', // Dark blue variant
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
