import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import { LanguageSelector } from '../components/LanguageSelector';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const DEFAULT_FONDS = [
  { id: '1', symbol: 'USDC', sub: 'USDC', balance: '0.00', currency: 'USDC' },
  { id: '2', symbol: 'USDT', sub: '(TRC20)', balance: '0.00', currency: 'USDT' },
  { id: '3', symbol: 'EURC', sub: 'EURC', balance: '0.00', currency: 'EURC' },
  { id: '4', symbol: 'DZY', sub: 'DZY', balance: '0.00', currency: 'DZY' },
  { id: '5', symbol: 'Bitcoin', sub: '(WBTC)', balance: '0.00', currency: 'WBTC' },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { hideBalance, toggleHideBalance, language, toggleLanguage, t, transactions, user } = useApp();

  const getDynamicFonds = () => {
    if (!user?.rawBalances || user.rawBalances.length === 0) return DEFAULT_FONDS;
    
    // Map backend balances to our UI format
    return user.rawBalances.map((item, index) => {
      const cur = (item.currency || item.token || item.symbol || '').toUpperCase();
      let uiProps = DEFAULT_FONDS.find(f => f.symbol === cur || f.currency === cur);
      
      if (!uiProps) {
        // Fallback for unknown tokens
        uiProps = {
          symbol: cur,
          sub: item.chain ? `(${item.chain.toUpperCase()})` : cur,
          currency: cur,
          isCustom: true,
          icon: 'wallet-outline',
          iconColor: '#94A3B8'
        };
      }

      return {
        ...uiProps,
        id: `f_${index}`,
        balance: formatAmount(item.balance || 0),
      };
    });
  };

  const dynamicFonds = getDynamicFonds();

  const getTxStyles = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'SEND') return { icon: 'arrow-up-circle-outline', color: '#EF4444' };
    if (t === 'RECEIVE') return { icon: 'arrow-down-circle-outline', color: '#10B981' };
    if (t === 'BUY') return { icon: 'cart-outline', color: '#F59E0B' };
    if (t === 'TOP_UP' || t === 'TOP-UP') return { icon: 'phone-portrait-outline', color: '#34D399' };
    if (t === 'SWAP') return { icon: 'swap-horizontal-outline', color: '#8B5CF6' };
    if (t === 'PAY') return { icon: 'flash-outline', color: '#60A5FA' };
    if (t === 'SALE') return { icon: 'arrow-down-circle-outline', color: '#10B981' };
    return { icon: 'time-outline', color: '#9CA3AF' };
  };

  const formatAmount = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "0.00";
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(num);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.logoCircle} resizeMode="contain" />
            <Text style={styles.dizzitText}>Dizzit<Text style={styles.upText}>Up</Text></Text>
          </View>
          <View style={styles.headerRight}>
            <LanguageSelector />
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('NotificationsScreen')}>
              <Ionicons name="notifications-outline" size={18} color="#1A2840" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <Ionicons name="time-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')} accessibilityLabel="Ouvrir les paramètres">
              <Ionicons name="settings-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Wallet Card */}
          <LinearGradient colors={['#2B4C7E', '#20365B']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <TouchableOpacity style={styles.walletHeaderLeft} onPress={toggleHideBalance} activeOpacity={0.7}>
                <Text style={styles.soldeText}>{language === 'fr' ? 'Solde total' : 'Total balance'}</Text>
                <Ionicons name={hideBalance ? "eye-off" : "eye"} size={18} color="#FFFFFF" style={{marginLeft: 8}} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rechargerBtn} onPress={() => navigation.navigate('TopUpScreen')}>
                <Ionicons name="add" size={14} color="#1A2840" />
                <Text style={styles.rechargerText}>{language === 'fr' ? 'Recharger' : 'Top-up'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowRightBtn} onPress={() => navigation.navigate('AssetListScreen')}>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.walletBody}>
              <View style={styles.walletBalanceSection}>
                <Text style={styles.balanceAmount}>{hideBalance ? '••••••••' : '125 500'} {!hideBalance && <Text style={styles.balanceCurrency}>DZY</Text>}</Text>
                <View style={styles.conversionRow}>
                  <Text style={styles.conversionText}>{hideBalance ? '••••••••' : '≈ 191,34 EUR'}</Text>
                  {!hideBalance && (
                    <>
                      <Text style={styles.conversionDivider}>|</Text>
                      <Text style={styles.conversionText}>≈ 125 120 XAF</Text>
                    </>
                  )}
                </View>
              </View>
              
              <View style={styles.bigDzyIcon}>
                <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={{width: 80, height: 80}} resizeMode="contain" />
              </View>
            </View>
          </LinearGradient>

          {/* Quick Actions */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SendMoneyScreen')}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="paper-plane-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>{language === 'fr' ? 'Envoyer' : 'Send'}</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ReceiveFundsV2Screen')}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="download-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>{language === 'fr' ? 'Recevoir' : 'Receive'}</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SwapTokensScreen')}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="swap-horizontal-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>{language === 'fr' ? 'Convertir' : 'Swap'}</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItemDisabled} onPress={() => navigation.navigate('WithdrawFundsScreen')}>
              <View style={styles.actionIconWrapperDisabled}>
                <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
              </View>
              <Text style={styles.actionItemTextDisabled}>{language === 'fr' ? 'Retirer' : 'Cash-out'}</Text>
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableText}>{language === 'fr' ? 'Non disponible\ndepuis votre pays' : 'Not available\nin your country'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Mes fonds */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{language === 'fr' ? 'Mes fonds' : 'My Assets'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AssetListScreen')}>
              <Text style={styles.voirTout}>{t('viewAll', 'Voir tout')} <Ionicons name="arrow-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fondsScroll}>
            {dynamicFonds.map((item, index) => (
              <React.Fragment key={item.id}>
                <View style={styles.fondItem}>
                  <View style={styles.fondIcon}>
                    <CryptoIcon symbol={item.currency || item.symbol} size={44} />
                  </View>
                  <Text style={styles.fondSymbol}>{item.symbol}</Text>
                  <Text style={styles.fondSub}>{item.sub}</Text>
                  <Text style={styles.fondBalance}>{hideBalance ? '••••' : item.balance}</Text>
                  <Text style={styles.fondCurrency}>{item.currency}</Text>
                </View>
                
                {index < dynamicFonds.length - 1 && (
                  <View style={styles.fondSeparator}>
                    <Ionicons name="chevron-forward" size={16} color="#475569" />
                  </View>
                )}
              </React.Fragment>
            ))}
          </ScrollView>

          {/* DZYCard Promo */}
          <LinearGradient colors={['#2B4C7E', '#20365B']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.cardPromo}>
            <View style={styles.cardPromoContent}>
              <Text style={styles.cardPromoText}>
                {language === 'fr' 
                  ? 'Votre carte Visa en $US et non pas en Naira, Bir, ZAR, FCFA, ... pour acheter et voyager partout dans le monde.'
                  : 'Your Visa card in $USD (not Naira, Birr, ZAR, FCFA...) to shop and travel worldwide.'}
              </Text>
              
              <View style={styles.payMethods}>
                <View style={styles.payBadge}>
                  <Ionicons name="logo-apple" size={15} color="#000000" />
                  <Text style={styles.payBadgeText}>Pay</Text>
                </View>
                <View style={styles.payBadge}>
                  <Ionicons name="logo-google" size={14} color="#4285F4" style={{marginRight: 2}} />
                  <Text style={styles.payBadgeText}>Pay</Text>
                </View>
              </View>
            </View>

            <View style={styles.dzyCardMockup}>
              <View style={styles.dzyCardMockupInner}>
                <View style={styles.dzyCardMockupHeader}>
                  <View style={styles.dzyCardLogoRow}>
                    <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.cardLogoImg} resizeMode="contain" />
                    <Text style={styles.miniDizzitUp}>Dizzit<Text style={{color: '#FFC759'}}>Up</Text></Text>
                  </View>
                  <Text style={styles.dzyCardCurrency}>$US</Text>
                </View>
                
                <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chip_in_credit_card.svg/512px-Chip_in_credit_card.svg.png'}} style={styles.cardChip} />
                
                <View style={styles.dzyCardMockupFooter}>
                  <Text style={styles.cardDots}>••••  1234</Text>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
                
                <View style={styles.cardDotsPattern}>
                  {[...Array(60)].map((_, i) => (
                    <View key={i} style={styles.patternDot} />
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Transactions récentes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{language === 'fr' ? 'Transactions récentes' : 'Recent Transactions'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <Text style={styles.voirTout}>{t('viewAll', 'Voir tout')} <Ionicons name="arrow-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {transactions && transactions.length > 0 ? transactions.slice(0, 5).map((tx, idx) => {
              const { icon, color } = getTxStyles(tx.type);
              const isPositive = tx.type === 'RECEIVE' || tx.type === 'SALE';
              const title = t(`common.wallet.tx_type.${(tx.type || 'unknown').toLowerCase()}`, tx.type).toUpperCase();
              let timeStr = '';
              try {
                if (tx.timestamp) {
                  const d = new Date(tx.timestamp);
                  timeStr = d.toLocaleDateString() + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
              } catch (e) {}

              return (
                <View key={tx.id || idx} style={styles.txRow}>
                  <View style={[styles.txIconBox, {borderColor: color + '40'}]}>
                    <Ionicons name={icon} size={18} color={color} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{title}</Text>
                    <Text style={styles.txSub}>{tx.toFrom}</Text>
                  </View>
                  <View style={styles.txAmountCol}>
                    <Text style={[styles.txAmount, isPositive ? styles.txGreen : styles.txDark]}>
                      {hideBalance ? '••••' : `${isPositive ? '+' : '-'}${formatAmount(tx.amount)} ${tx.currency}`}
                    </Text>
                    <Text style={styles.txTime}>{timeStr}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#A0AABF" style={{marginLeft: 8}} />
                </View>
              );
            }) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontFamily: 'Inter_500Medium' }}>
                  {t('common.wallet.no_transactions', 'Aucune transaction')}
                </Text>
              </View>
            )}
          </View>
          
          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: Platform.OS === 'android' ? 14 : 12, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  logoCircle: { width: 28, height: 28, marginRight: 5 },
  dizzitText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  upText: { color: '#FFC759' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  walletCard: { borderRadius: 24, padding: 20, marginTop: 12, position: 'relative', overflow: 'hidden' },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  walletHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  soldeText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#94A3B8' },
  rechargerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC759', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  rechargerText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  arrowRightBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  walletBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  walletBalanceSection: { flex: 1 },
  balanceAmount: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 32, color: '#FFFFFF', letterSpacing: -0.5 },
  balanceCurrency: { fontSize: 20, color: '#FFC759' },
  conversionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  conversionText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94A3B8' },
  conversionDivider: { color: '#475569', fontSize: 12 },
  bigDzyIcon: { opacity: 0.85 },
  actionsGrid: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, marginTop: 14, alignItems: 'center', justifyContent: 'space-around', boxShadow: '0px 2px 6px #000' },
  actionItem: { alignItems: 'center', flex: 1 },
  actionItemDisabled: { alignItems: 'center', flex: 1, opacity: 0.6 },
  actionIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionIconWrapperDisabled: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionItemText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  actionItemTextDisabled: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#6B7280' },
  verticalDivider: { width: 1, height: 32, backgroundColor: '#F1F5F9' },
  unavailableBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  unavailableText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#EF4444', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 12 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840' },
  voirTout: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#3B82F6' },
  fondsScroll: { gap: 12, paddingRight: 16 },
  fondItem: { width: 100, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, alignItems: 'center', boxShadow: '0px 2px 6px #000' },
  fondIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  customFondIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  fondSymbol: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  fondSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8', marginBottom: 4 },
  fondBalance: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  fondCurrency: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#64748B' },
  fondSeparator: { justifyContent: 'center', alignItems: 'center' },
  cardPromo: { borderRadius: 20, padding: 16, marginTop: 18, flexDirection: 'row', overflow: 'hidden' },
  cardPromoContent: { flex: 1, paddingRight: 12, justifyContent: 'space-between' },
  cardPromoText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#E2E8F0', lineHeight: 18 },
  payMethods: { flexDirection: 'row', gap: 8, marginTop: 12 },
  payBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  payBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#000000', marginLeft: 2 },
  dzyCardMockup: { width: 110, height: 74, borderRadius: 10, backgroundColor: '#1E293B', padding: 8, justifyContent: 'space-between' },
  dzyCardMockupInner: { flex: 1, justifyContent: 'space-between' },
  dzyCardMockupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dzyCardLogoRow: { flexDirection: 'row', alignItems: 'center' },
  cardLogoImg: { width: 16, height: 16, marginRight: 4 },
  miniDzyLogo: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', marginRight: 2 },
  miniDzyLogoText: { fontSize: 8, fontWeight: 'bold', color: '#000' },
  miniDzyLogoStrike: { display: 'none' },
  miniDizzitUp: { fontSize: 9, fontWeight: 'bold', color: '#FFF' },
  dzyCardCurrency: { fontSize: 9, fontWeight: 'bold', color: '#FFC759' },
  cardChip: { width: 14, height: 10, borderRadius: 2 },
  dzyCardMockupFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDots: { fontSize: 8, color: '#94A3B8' },
  visaText: { fontSize: 9, fontWeight: 'bold', color: '#FFF', fontStyle: 'italic' },
  cardDotsPattern: { display: 'none' },
  patternDot: {},
  transactionsList: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, gap: 12, boxShadow: '0px 2px 6px #000' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  txIconBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  txInfo: { flex: 1 },
  txTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  txSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8', marginTop: 2 },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13 },
  txGreen: { color: '#10B981' },
  txDark: { color: '#1A2840' },
  txAmountSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#3B82F6' },
  txTime: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8', marginTop: 2 },
});
