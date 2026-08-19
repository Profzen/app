import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Animated, LayoutAnimation, UIManager } from 'react-native';
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

const WALLET_TOKENS = [
  {
    id: 'DZY',
    symbol: 'DZY',
    name: 'DIZZITUP INDEX (DZY)',
    subtitle: '(Reflecting Total Wallet USD)',
    balance: '54.84',
    usdValue: '$5.48',
    canBuySell: false,
    networks: [],
  },
  {
    id: 'POL',
    symbol: 'POL',
    name: 'POL',
    balance: '13.1026',
    usdValue: '$1.06',
    canBuySell: false,
    networks: [
      { id: 'pol_poly', name: 'Polygon Network', label: 'Polygon (POL)', balance: '13.1026', usdValue: '$1.06', networkIcon: 'POL' }
    ]
  },
  {
    id: 'USDT',
    symbol: 'USDT',
    name: 'USDT',
    balance: '2.8976',
    usdValue: '$2.90',
    canBuySell: true,
    networks: [
      { id: 'usdt_poly', name: 'Polygon Network', label: 'Tether USD', balance: '2.8976', usdValue: '$2.90', networkIcon: 'POL' },
      { id: 'usdt_eth', name: 'Ethereum Network', label: 'Tether USD', balance: '0.0000', usdValue: '$0.00', networkIcon: 'ETH' },
      { id: 'usdt_sol', name: 'Solana Network', label: 'Tether USD', balance: '0.0000', usdValue: '$0.00', networkIcon: 'SOL' },
      { id: 'usdt_bsc', name: 'Bsc Network', label: 'Tether USD', balance: '0.0000', usdValue: '$0.00', networkIcon: 'BNB' }
    ]
  },
  {
    id: 'USDC',
    symbol: 'USDC',
    name: 'USDC',
    balance: '1.5221',
    usdValue: '$1.52',
    canBuySell: true,
    networks: [
      { id: 'usdc_poly', name: 'Polygon Network', label: 'USD Coin', balance: '1.2500', usdValue: '$1.25', networkIcon: 'POL' },
      { id: 'usdc_eth', name: 'Ethereum Network', label: 'USD Coin', balance: '0.0000', usdValue: '$0.00', networkIcon: 'ETH' },
      { id: 'usdc_base', name: 'Base Network', label: 'USD Coin', balance: '0.2721', usdValue: '$0.27', networkIcon: 'ETH' }
    ]
  },
  {
    id: 'BNB',
    symbol: 'BNB',
    name: 'BNB',
    balance: '0.0000',
    usdValue: '$0.00',
    canBuySell: false,
    networks: [
      { id: 'bnb_bsc', name: 'Bsc Network', label: 'BNB', balance: '0.0000', usdValue: '$0.00', networkIcon: 'BNB' }
    ]
  },
  {
    id: 'ETH',
    symbol: 'ETH',
    name: 'ETH',
    balance: '0.0000',
    usdValue: '$0.00',
    canBuySell: false,
    networks: [
      { id: 'eth_eth', name: 'Ethereum Network', label: 'Ethereum', balance: '0.0000', usdValue: '$0.00', networkIcon: 'ETH' },
      { id: 'eth_base', name: 'Base Network', label: 'Ethereum', balance: '0.0000', usdValue: '$0.00', networkIcon: 'ETH' }
    ]
  },
];

export default function AssetListScreen() {
  const navigation = useNavigation();
  const { t } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedTokens, setExpandedTokens] = useState({});

  const toggleExpand = (tokenId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTokens(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId]
    }));
  };

  const renderTokenCard = (token) => {
    const isExpanded = expandedTokens[token.id];
    const hasNetworks = token.networks && token.networks.length > 0;
    const isDzy = token.id === 'DZY';

    return (
      <View key={token.id} style={[styles.tokenCard, isDzy && styles.dzyTokenCard]}>
        {isDzy && (
          <View style={styles.dzyBadge}>
            <Ionicons name="trending-up-outline" size={12} color="#F59E0B" />
            <Text style={styles.dzyBadgeText}>{t('wallet.supportedTokens', 'Default supported / planned tokens list')}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.tokenRowMain} 
          onPress={() => hasNetworks && toggleExpand(token.id)}
          activeOpacity={hasNetworks ? 0.7 : 1}
        >
          <View style={styles.tokenLeft}>
            <CryptoIcon symbol={token.symbol} size={36} />
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{token.name}</Text>
              {hasNetworks ? (
                <View style={styles.networksToggle}>
                  <Text style={styles.networksCountText}>
                    {token.networks.length} {t('wallet.networks', 'Networks')}
                  </Text>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color="#8B92A5" />
                </View>
              ) : (
                <Text style={styles.tokenSubtitle}>{token.subtitle}</Text>
              )}
            </View>
          </View>

          <View style={styles.tokenCenter}>
            {token.canBuySell && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.miniBtnYellow}>
                  <Text style={styles.miniBtnYellowText}>{t('wallet.buy', 'Buy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniBtnDark}>
                  <Text style={styles.miniBtnDarkText}>{t('wallet.sell', 'Sell')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {!token.canBuySell && isDzy && (
              <View style={[styles.actionButtons, { opacity: 0.5 }]}>
                <View style={styles.miniBtnDisabled}><Text style={styles.miniBtnDisabledText}>{t('wallet.buy', 'Buy')}</Text></View>
                <View style={styles.miniBtnDisabled}><Text style={styles.miniBtnDisabledText}>{t('wallet.sell', 'Sell')}</Text></View>
              </View>
            )}
          </View>

          <View style={styles.tokenRight}>
            <Text style={styles.tokenBalance}>{token.balance}</Text>
            <Text style={styles.tokenUsd}>{token.usdValue}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && hasNetworks && (
          <View style={styles.networksList}>
            {token.networks.map(net => (
              <View key={net.id} style={styles.networkRow}>
                <View style={styles.networkLeft}>
                  <View style={styles.networkIconWrapper}>
                    <CryptoIcon symbol={net.networkIcon} size={20} />
                  </View>
                  <View>
                    <Text style={styles.networkName}>{net.name}</Text>
                    <Text style={styles.networkLabel}>{net.label}</Text>
                  </View>
                </View>
                <View style={styles.networkRight}>
                  <Text style={styles.networkBalance}>{net.balance}</Text>
                  <Text style={styles.networkUsd}>{net.usdValue}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Moneco-style Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person" size={18} color="#A0AABF" />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.earnBadge}>
            <Text style={styles.earnBadgeText}>{t('wallet.earn', 'Earn 5$')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Balance Area */}
        <View style={styles.balanceSection}>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyFlag}>🇺🇸</Text>
            <Text style={styles.currencyText}>{t('wallet.usdBalance', 'USD Balance')}</Text>
          </View>
          <TouchableOpacity style={styles.eyeBtn}>
            <Ionicons name="eye-outline" size={18} color="#059669" />
          </TouchableOpacity>
        </View>
        <Text style={styles.bigBalance}>10.74 <Text style={styles.bigBalanceSymbol}>$</Text></Text>

        {/* Circular Action Buttons */}
        <View style={styles.actionsRow}>
          <View style={styles.actionItem}>
            <TouchableOpacity style={[styles.actionCircle, { backgroundColor: '#059669' }]} onPress={() => navigation.navigate('TopUpWalletScreen')}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{t('wallet.addMoney', 'Add money')}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity style={styles.actionCircle} onPress={() => navigation.navigate('SendMoneyScreen')}>
              <Ionicons name="paper-plane-outline" size={24} color="#059669" style={{ transform: [{ rotate: '45deg' }, { marginLeft: -4 }, { marginTop: 4 }] }} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{t('wallet.sendMoney', 'Send Money')}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity style={styles.actionCircle} onPress={() => navigation.navigate('WithdrawFundsScreen')}>
              <Ionicons name="arrow-down" size={24} color="#059669" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{t('wallet.withdrawMoney', 'Withdraw Money')}</Text>
          </View>
        </View>

        {/* Tokens List matching Web UI */}
        <View style={styles.tokensContainer}>
          <Text style={styles.sectionTitle}>{t('wallet.assets', 'Assets')}</Text>
          {WALLET_TOKENS.map(renderTokenCard)}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNavBar 
        activeTab="wallet" 
        isMenuOpen={isMenuOpen} 
        onCenterButtonPress={() => setIsMenuOpen(!isMenuOpen)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  earnBadgeText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#059669',
    fontSize: 14,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  currencyFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  currencyText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: '#1A2840',
    fontSize: 14,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bigBalance: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: 48,
    color: '#111827',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  bigBalanceSymbol: {
    fontSize: 28,
    color: '#9CA3AF',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 32,
    marginBottom: 24,
  },
  actionItem: {
    alignItems: 'center',
    width: 100,
  },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
  },
  tokensContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    minHeight: 500,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  tokenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dzyTokenCard: {
    backgroundColor: '#FFFAED', // light yellow
    borderColor: '#FEF3C7',
  },
  dzyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dzyBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#1A2840',
    marginLeft: 6,
  },
  tokenRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  tokenInfo: {
    marginLeft: 12,
  },
  tokenName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  tokenSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#8B92A5',
  },
  networksToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networksCountText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#8B92A5',
    marginRight: 4,
  },
  tokenCenter: {
    flex: 1.5,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  miniBtnYellow: {
    backgroundColor: '#FFC759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  miniBtnYellowText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#1A2840',
  },
  miniBtnDark: {
    backgroundColor: '#1A2840',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  miniBtnDarkText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  miniBtnDisabled: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  miniBtnDisabledText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#A0AABF',
  },
  tokenRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#1A2840',
  },
  tokenUsd: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#8B92A5',
    marginTop: 2,
  },
  networksList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
  },
  networkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  networkName: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#1A2840',
  },
  networkLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#8B92A5',
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
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#8B92A5',
  },
});
