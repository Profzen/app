import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const FONDS_DATA = [
  { id: '1', symbol: 'USDC', sub: 'USDC', balance: '12 450,00', currency: 'USDC', iconUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { id: '2', symbol: 'USDT', sub: '(TRC20)', balance: '8 750,00', currency: 'USDT', iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { id: '3', symbol: 'EURC', sub: 'EURC', balance: '3 200,00', currency: 'EURC', isCustom: true, icon: 'logo-euro', iconColor: '#2775CA' },
  { id: '4', symbol: 'DZY', sub: 'DZY', balance: '125 500,00', currency: 'DZY', isLocal: true },
  { id: '5', symbol: 'Bitcoin', sub: '(WBTC)', balance: '0,2450', currency: 'WBTC', iconUrl: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png' },
];

const TRANSACTIONS = [
  { id: '1', title: 'Achat BuyGoods', sub: 'Supermarket, Yaoundé', amount: '-25 000 DZY', time: '12 Mai 2024 • 11:09', isPositive: false, icon: 'bag-handle-outline', color: '#F59E0B' },
  { id: '2', title: 'Facture CEET', sub: 'Paiement électricité', amount: '-8 500 DZY', time: '11 Mai 2024 • 18:15', isPositive: false, icon: 'flash-outline', color: '#3B82F6' },
  { id: '3', title: 'Transfert reçu', sub: 'De : Sarah M.', amount: '+15 000 DZY', time: '11 Mai 2024 • 14:20', isPositive: true, icon: 'download-outline', color: '#10B981' },
  { id: '4', title: 'Airtime & Data', sub: 'MTN Cameroun', amount: '-2 000 DZY', time: '10 Mai 2024 • 09:15', isPositive: false, icon: 'call-outline', color: '#3B82F6' },
  { id: '5', title: 'Conversion DZY → USDC', sub: 'Taux : 1 DZY = 0,00021 USDC', amount: '-50 000 DZY', amountSub: '+37,00 USDC', time: '09 Mai 2024 • 16:05', isPositive: null, icon: 'swap-horizontal-outline', color: '#F59E0B' },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { hideBalance, toggleHideBalance, language, toggleLanguage, t } = useApp();

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
            <TouchableOpacity onPress={toggleLanguage} accessibilityLabel="Changer la langue / Switch language">
              <Image source={{uri: language === 'fr' ? 'https://flagcdn.com/w40/fr.png' : 'https://flagcdn.com/w40/gb.png'}} style={styles.flagIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#1A2840" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <Ionicons name="time-outline" size={22} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')} accessibilityLabel="Ouvrir les paramètres">
              <Ionicons name="settings-outline" size={22} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Wallet Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <TouchableOpacity style={styles.walletHeaderLeft} onPress={toggleHideBalance} activeOpacity={0.7}>
                <Text style={styles.soldeText}>Solde total</Text>
                <Ionicons name={hideBalance ? "eye-off" : "eye"} size={18} color="#FFFFFF" style={{marginLeft: 8}} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rechargerBtn} onPress={() => navigation.navigate('TopUpScreen')}>
                <Ionicons name="add" size={14} color="#1A2840" />
                <Text style={styles.rechargerText}>Recharger</Text>
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
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SendMoneyScreen')}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="paper-plane-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>Envoyer</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ReceiveFundsV2Screen')}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="download-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>Recevoir</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SwapTokensScreen')}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="swap-horizontal-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>Convertir</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItemDisabled} onPress={() => navigation.navigate('WithdrawFundsScreen')}>
              <View style={styles.actionIconWrapperDisabled}>
                <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
              </View>
              <Text style={styles.actionItemTextDisabled}>Cash-out</Text>
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableText}>Non disponible{'\n'}depuis votre pays</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Mes fonds */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes fonds</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AssetListScreen')}>
              <Text style={styles.voirTout}>Voir tout <Ionicons name="arrow-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fondsScroll}>
            {FONDS_DATA.map((item, index) => (
              <React.Fragment key={item.id}>
                <View style={styles.fondItem}>
                  <View style={styles.fondIcon}>
                    {item.isLocal ? (
                      <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={{width: 68, height: 68, transform: [{scale: 1.2}]}} resizeMode="contain" />
                    ) : item.isCustom ? (
                      <View style={[styles.customFondIcon, {backgroundColor: item.iconColor}]}>
                        <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                      </View>
                    ) : (
                      <Image source={{uri: item.iconUrl}} style={{width: 44, height: 44}} resizeMode="contain" />
                    )}
                  </View>
                  <Text style={styles.fondSymbol}>{item.symbol}</Text>
                  <Text style={styles.fondSub}>{item.sub}</Text>
                  <Text style={styles.fondBalance}>{hideBalance ? '••••' : item.balance}</Text>
                  <Text style={styles.fondCurrency}>{item.currency}</Text>
                </View>
                
                {index < FONDS_DATA.length - 1 && (
                  <View style={styles.fondSeparator}>
                    <Ionicons name="chevron-forward" size={16} color="#475569" />
                  </View>
                )}
              </React.Fragment>
            ))}
          </ScrollView>

          {/* DZYCard Promo */}
          <View style={styles.cardPromo}>
            <View style={styles.cardPromoContent}>
              <Text style={styles.cardPromoText}>
                Votre carte Visa en $US et non pas en Naira, Bir, ZAR, FCFA, ... pour acheter et voyager partout dans le monde.
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
                
                {/* Dots background pattern simulation */}
                <View style={styles.cardDotsPattern}>
                  {[...Array(60)].map((_, i) => (
                    <View key={i} style={styles.patternDot} />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Transactions récentes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <Text style={styles.voirTout}>Voir tout <Ionicons name="arrow-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {TRANSACTIONS.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIconBox, {borderColor: tx.color + '40'}]}>
                  <Ionicons name={tx.icon} size={18} color={tx.color} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txSub}>{tx.sub}</Text>
                </View>
                <View style={styles.txAmountCol}>
                  <Text style={[styles.txAmount, tx.isPositive === true ? styles.txGreen : (tx.isPositive === false ? styles.txDark : styles.txDark)]}>
                    {hideBalance ? '••••' : tx.amount}
                  </Text>
                  {tx.amountSub && (
                    <Text style={styles.txAmountSub}>{hideBalance ? '••••' : tx.amountSub}</Text>
                  )}
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#A0AABF" style={{marginLeft: 8}} />
              </View>
            ))}
          </View>
          
          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0 },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 12, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 32, height: 32, marginRight: 6 },
  dizzitText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840' },
  upText: { color: '#FFC759' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flagIcon: { width: 24, height: 16, borderRadius: 3 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  walletCard: { backgroundColor: '#071536', borderRadius: 24, padding: 20, marginTop: 12, position: 'relative', overflow: 'hidden' },
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
  actionsGrid: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, marginTop: 14, alignItems: 'center', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
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
  fondItem: { width: 100, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  fondIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  customFondIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  fondSymbol: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  fondSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8', marginBottom: 4 },
  fondBalance: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  fondCurrency: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#64748B' },
  fondSeparator: { justifyContent: 'center', alignItems: 'center' },
  cardPromo: { backgroundColor: '#071536', borderRadius: 20, padding: 16, marginTop: 18, flexDirection: 'row', overflow: 'hidden' },
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
  transactionsList: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
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
