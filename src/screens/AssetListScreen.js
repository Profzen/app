import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, LayoutAnimation, UIManager, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import { theme } from '../theme/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WEB_DEFAULT_TOKENS = [
  { symbol: "DZY", name: "DIZZITUP INDEX", chain: "polygon" },
  
  // USDT
  { symbol: "USDT", name: "Tether USD", chain: "polygon" },
  { symbol: "USDT", name: "Tether USD", chain: "ethereum" },
  { symbol: "USDT", name: "Tether USD", chain: "solana" },
  { symbol: "USDT", name: "Tether USD", chain: "bsc" },

  // USDC
  { symbol: "USDC", name: "USD Coin", chain: "polygon" },
  { symbol: "USDC", name: "USD Coin", chain: "ethereum" },
  { symbol: "USDC", name: "USD Coin", chain: "base" },
  { symbol: "USDC", name: "USD Coin", chain: "solana" },
  { symbol: "USDC", name: "USD Coin", chain: "bsc" },

  // POL
  { symbol: "POL", name: "Polygon (POL)", chain: "polygon" },
  
  // BNB
  { symbol: "BNB", name: "BNB", chain: "bsc" },
  
  // DAI
  { symbol: "DAI", name: "Dai Stablecoin", chain: "bsc" },

  // ETH
  { symbol: "ETH", name: "Ethereum", chain: "ethereum" },
  { symbol: "ETH", name: "Ethereum", chain: "base" },

  // SOL
  { symbol: "SOL", name: "Solana", chain: "solana" },

  // WBTC
  { symbol: "WBTC", name: "Wrapped Bitcoin", chain: "polygon" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", chain: "ethereum" },

  // WETH
  { symbol: "WETH", name: "Wrapped Ethereum", chain: "polygon" },
  { symbol: "WETH", name: "Wrapped Ethereum", chain: "ethereum" },
  { symbol: "WETH", name: "Wrapped Ethereum", chain: "base" },
];

const CAN_BUY_SELL = ['USDC', 'USDT'];

import * as Clipboard from 'expo-clipboard';

export default function AssetListScreen() {
  const navigation = useNavigation();
  const { t, user, language } = useApp();
  const [expandedTokens, setExpandedTokens] = useState({});

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    // You could add a toast here
  };

  const isMerchant = user?.role === 'merchant';
  const totalUsdValue = user?.totalUsdValue || 0;
  const currentRawBalances = user?.rawBalances || [];
  
  const groupedTokens = useMemo(() => {
    const groups = {};
    
    // First, initialize groups with default tokens
    WEB_DEFAULT_TOKENS.forEach(tok => {
      if (!groups[tok.symbol]) {
        groups[tok.symbol] = {
          symbol: tok.symbol,
          name: tok.name,
          balance: 0,
          usdValue: 0,
          networks: []
        };
      }
      // Add default empty networks
      if (!groups[tok.symbol].networks.find(n => n.chain === tok.chain)) {
        groups[tok.symbol].networks.push({ chain: tok.chain, balance: 0, usdValue: 0, label: tok.name });
      }
    });

    // Merge actual user balances
    if (currentRawBalances && Array.isArray(currentRawBalances)) {
      currentRawBalances.forEach(b => {
        const sym = (b.currency || b.token || b.symbol || '').toUpperCase();
        const chain = (b.chain || b.network || 'unknown').toLowerCase();
        const bal = parseFloat(b.balance || 0);
        const usd = parseFloat(b.usdValue || (bal * (b.price || 1)));

        if (!groups[sym]) {
          groups[sym] = { symbol: sym, name: sym, balance: 0, usdValue: 0, networks: [] };
        }
        groups[sym].balance += bal;
        groups[sym].usdValue += usd;
        
        const existingNet = groups[sym].networks.find(n => n.chain === chain);
        if (existingNet) {
          existingNet.balance = bal;
          existingNet.usdValue = usd;
        } else {
          groups[sym].networks.push({ chain, balance: bal, usdValue: usd, label: sym });
        }
      });
    }

    const result = Object.values(groups).sort((a, b) => b.usdValue - a.usdValue);
    return result;
  }, [currentRawBalances]);

  const fallbackDZY = user?.balanceDZY || 0;
  const dzyToken = groupedTokens.find(t => t.symbol === 'DZY') || { symbol: 'DZY', balance: 0, usdValue: 0 };
  dzyToken.balance = dzyToken.balance || fallbackDZY;
  dzyToken.usdValue = totalUsdValue;
  const otherTokens = groupedTokens.filter(t => t.symbol !== 'DZY');

  const toggleExpand = (symbol) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTokens(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  const displayEvmAddress = user?.role === 'merchant' && user?.businessEvmAddress ? user.businessEvmAddress : user?.evmAddress;
  const displaySolanaAddress = user?.role === 'merchant' && user?.businessSolanaAddress ? user.businessSolanaAddress : user?.solanaAddress;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('wallet.actions.my_assets', 'My Assets')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Wallet Addresses Section */}
        <View style={styles.addressesContainer}>
          <Text style={styles.addressesTitle}>{t('wallet.my_addresses', 'My Wallet Addresses')}</Text>
          
          <View style={styles.addressBox}>
            <View style={styles.addressLeft}>
              <View style={styles.networkLogoContainer}>
                <Image source={require('../../assets/cryptos/pol.png')} style={styles.networkLogo} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>Polygon / Base / BSC (EVM)</Text>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {displayEvmAddress || 'Not created yet'}
                </Text>
              </View>
            </View>
            {displayEvmAddress && (
              <TouchableOpacity onPress={() => copyToClipboard(displayEvmAddress)} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color="#20365B" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.addressBox}>
            <View style={styles.addressLeft}>
              <View style={styles.networkLogoContainer}>
                <Image source={require('../../assets/cryptos/sol.png')} style={styles.networkLogo} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>Solana</Text>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {displaySolanaAddress || 'Not created yet'}
                </Text>
              </View>
            </View>
            {displaySolanaAddress && (
              <TouchableOpacity onPress={() => copyToClipboard(displaySolanaAddress)} style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color="#20365B" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
           <View style={styles.sectionIconWrapper}>
             <Ionicons name="trending-up" size={18} color="#FFC759" />
           </View>
           <Text style={styles.sectionTitle}>{t('wallet.supportedTokens', 'Default supported / planned tokens list')}</Text>
        </View>

        {/* DZY Card Native Style */}
        <View style={[styles.card, styles.dzyCard]}>
           <View style={styles.dzyTopRow}>
             <View style={styles.dzyIconWrapper}>
               <CryptoIcon symbol="DZY" size={32} />
             </View>
             <View style={styles.dzyInfo}>
               <Text style={styles.dzyTitle}>DIZZITUP INDEX (DZY)</Text>
               <Text style={styles.dzySubtitle}>(Reflecting Total Wallet USD)</Text>
             </View>
             <View style={styles.dzyBalances}>
               <Text style={styles.dzyBalance}>{dzyToken.balance.toFixed(2)}</Text>
               <Text style={styles.dzyUsd}>${totalUsdValue.toFixed(2)}</Text>
             </View>
           </View>
           
           <View style={styles.dzyBottomRow}>
             <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFC759' }]}>
               <Text style={[styles.actionBtnText, { color: '#20365B' }]}>{t('wallet.buy', 'Buy')}</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#20365B' }]}>
               <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>{t('wallet.sell', 'Sell')}</Text>
             </TouchableOpacity>
           </View>
        </View>

        {/* Other Tokens Accordion */}
        <View style={styles.otherTokensContainer}>
          {otherTokens.map(token => {
            const isExpanded = expandedTokens[token.symbol];
            const canBuySell = CAN_BUY_SELL.includes(token.symbol);
            
            return (
              <View key={token.symbol} style={styles.tokenWrapper}>
                <TouchableOpacity 
                  style={styles.tokenRow}
                  onPress={() => toggleExpand(token.symbol)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tokenLeft}>
                    <CryptoIcon symbol={token.symbol} size={36} />
                    <View style={styles.tokenNameContainer}>
                      <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.tokenNetworkCount}>{token.networks.length} Networks</Text>
                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color="#878FA4" style={{marginLeft: 4, marginTop: 2}} />
                      </View>
                    </View>
                  </View>
                  
                  {canBuySell && (
                    <View style={styles.miniActionButtons}>
                      <View style={styles.miniBtnYellow}><Text style={styles.miniBtnYellowText}>{t('wallet.buy', 'Buy')}</Text></View>
                      <View style={styles.miniBtnDark}><Text style={styles.miniBtnDarkText}>{t('wallet.sell', 'Sell')}</Text></View>
                    </View>
                  )}
                  
                  <View style={styles.tokenRight}>
                     <Text style={styles.tokenBalance}>{token.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</Text>
                     <Text style={styles.tokenUsd}>${token.usdValue.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.networksList}>
                    {token.networks.map((net, i) => (
                      <View key={`${token.symbol}-${net.chain}-${i}`} style={styles.networkRow}>
                        <View style={styles.networkLeft}>
                          <View style={styles.networkIconWrapper}>
                             {/* Attempt to show native network icon, fallback to token icon */}
                             <CryptoIcon symbol={net.chain === 'ethereum' ? 'ETH' : net.chain === 'polygon' ? 'POL' : net.chain === 'solana' ? 'SOL' : net.chain === 'bsc' ? 'BNB' : token.symbol} size={20} />
                          </View>
                          <View>
                            <Text style={styles.networkName}>{net.chain}</Text>
                            <Text style={styles.networkLabel}>{net.chain} Network</Text>
                          </View>
                        </View>
                        <View style={styles.networkRight}>
                          <Text style={styles.networkBalance}>{net.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</Text>
                          <Text style={styles.networkUsd}>${net.usdValue.toFixed(2)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNavBar activeTab="Wallet" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  addressesContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F2F6',
  },
  addressesTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 12,
  },
  addressBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F2F6',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  addressInfo: {
    marginLeft: 10,
    flex: 1,
  },
  networkLogoContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  networkLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  addressLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#878FA4',
    marginBottom: 2,
  },
  addressText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#1A2840',
  },
  copyBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,199,89,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    color: '#20365B',
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F2F6',
    padding: 16,
    marginBottom: 16,
  },
  dzyCard: {
    borderColor: 'rgba(255,199,89,0.3)',
    backgroundColor: 'rgba(255,199,89,0.05)',
  },
  dzyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dzyIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,199,89,0.2)',
  },
  dzyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dzyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#20365B',
  },
  dzySubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#878FA4',
    marginTop: 2,
  },
  dzyBalances: {
    alignItems: 'flex-end',
  },
  dzyBalance: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#20365B',
  },
  dzyUsd: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#878FA4',
    marginTop: 2,
  },
  dzyBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,199,89,0.2)',
    paddingTop: 16,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  actionBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  otherTokensContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F2F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tokenWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenNameContainer: {
    marginLeft: 12,
  },
  tokenSymbol: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#1A2840',
  },
  tokenNetworkCount: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#878FA4',
    marginTop: 2,
  },
  miniActionButtons: {
    flexDirection: 'row',
    marginRight: 10,
  },
  miniBtnYellow: {
    backgroundColor: '#FFC759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  miniBtnYellowText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#1A2840',
  },
  miniBtnDark: {
    backgroundColor: '#1A2840',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniBtnDarkText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#1A2840',
  },
  tokenUsd: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#878FA4',
    marginTop: 2,
  },
  networksList: {
    paddingBottom: 12,
    paddingLeft: 12,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  networkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F0F2F6',
  },
  networkName: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#1A2840',
    textTransform: 'capitalize',
  },
  networkLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#878FA4',
    textTransform: 'capitalize',
  },
  networkRight: {
    alignItems: 'flex-end',
  },
  networkBalance: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#1A2840',
  },
  networkUsd: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#878FA4',
  }
});
