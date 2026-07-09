import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../dizzitup logo cercle.png')} style={styles.logoCircle} resizeMode="contain" />
            <Text style={styles.dizzitText}>Dizzit<Text style={styles.upText}>Up</Text></Text>
          </View>
          <View style={styles.headerRight}>
            <Image source={{uri: 'https://flagcdn.com/w40/fr.png'}} style={styles.flagIcon} />
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#1A2840" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="time-outline" size={22} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={22} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Wallet Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <View style={styles.walletHeaderLeft}>
                <Text style={styles.soldeText}>Solde total</Text>
                <Ionicons name="eye" size={16} color="#FFFFFF" style={{marginLeft: 8}} />
              </View>
              <TouchableOpacity style={styles.rechargerBtn}>
                <Ionicons name="add" size={14} color="#1A2840" />
                <Text style={styles.rechargerText}>Recharger</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowRightBtn}>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.walletBody}>
              <View style={styles.walletBalanceSection}>
                <Text style={styles.balanceAmount}>125 500 <Text style={styles.balanceCurrency}>DZY</Text></Text>
                <View style={styles.conversionRow}>
                  <Text style={styles.conversionText}>≈ 191,34 EUR</Text>
                  <Text style={styles.conversionDivider}>|</Text>
                  <Text style={styles.conversionText}>≈ 125 120 XAF</Text>
                </View>
              </View>
              
              <View style={styles.bigDzyIcon}>
                <Image source={require('../../dizzitup logo cercle.png')} style={{width: 80, height: 80}} resizeMode="contain" />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="paper-plane-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>Envoyer</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="download-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>Recevoir</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconWrapper}>
                <Ionicons name="swap-horizontal-outline" size={24} color="#1A2840" />
              </View>
              <Text style={styles.actionItemText}>Convertir</Text>
            </TouchableOpacity>
            
            <View style={styles.verticalDivider} />
            
            <TouchableOpacity style={styles.actionItemDisabled}>
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
            <TouchableOpacity>
              <Text style={styles.voirTout}>Voir tout <Ionicons name="arrow-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fondsScroll}>
            {FONDS_DATA.map((item, index) => (
              <React.Fragment key={item.id}>
                <View style={styles.fondItem}>
                  <View style={styles.fondIcon}>
                    {item.isLocal ? (
                      <Image source={require('../../dizzitup logo cercle.png')} style={{width: 68, height: 68, transform: [{scale: 1.2}]}} resizeMode="contain" />
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
                  <Text style={styles.fondBalance}>{item.balance}</Text>
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
              <Text style={styles.cardPromoTitle}>Réservez votre</Text>
              <Text style={styles.cardPromoTitleDzy}>DZYCard</Text>
              <Text style={styles.cardPromoSub}>Payez partout dans le monde avec votre carte DZYCard.</Text>
              
              <TouchableOpacity style={styles.reserveBtn}>
                <Text style={styles.reserveBtnText}>Réserver maintenant</Text>
              </TouchableOpacity>
              
              <View style={styles.payMethods}>
                <View style={styles.payBadge}>
                  <Ionicons name="logo-apple" size={14} color="#000" />
                  <Text style={styles.payBadgeText}>Pay</Text>
                </View>
                <View style={styles.payBadge}>
                  <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png'}} style={{width: 14, height: 14, marginRight: 2}} />
                  <Text style={styles.payBadgeText}>Pay</Text>
                </View>
              </View>
            </View>

            <View style={styles.dzyCardMockup}>
              <View style={styles.dzyCardMockupInner}>
                <View style={styles.dzyCardMockupHeader}>
                  <View style={styles.dzyCardLogoRow}>
                    <View style={styles.miniDzyLogo}>
                      <Text style={styles.miniDzyLogoText}>D</Text>
                      <View style={styles.miniDzyLogoStrike} />
                    </View>
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
            <TouchableOpacity>
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
                    {tx.amount}
                  </Text>
                  {tx.amountSub && (
                    <Text style={styles.txAmountSub}>{tx.amountSub}</Text>
                  )}
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#A0AABF" style={{marginLeft: 8}} />
              </View>
            ))}
          </View>
          
          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="Accueil" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    marginRight: 6,
  },
  dizzitText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  upText: {
    color: '#FFC759',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  walletCard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soldeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  rechargerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  rechargerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 4,
  },
  arrowRightBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceCurrency: {
    fontSize: 18,
  },
  conversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  conversionDivider: {
    color: '#475569',
    marginHorizontal: 8,
    fontSize: 12,
  },
  bigDzyIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconWrapper: {
    marginBottom: 8,
  },
  actionItemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  actionItemDisabled: {
    flex: 1.2,
    alignItems: 'center',
    position: 'relative',
  },
  actionIconWrapperDisabled: {
    marginBottom: 8,
  },
  actionItemTextDisabled: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#6B7280',
  },
  unavailableBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    position: 'absolute',
    bottom: -16,
    width: 90,
  },
  unavailableText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 7,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 9,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  voirTout: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  fondsScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  fondItem: {
    alignItems: 'center',
    width: 70,
  },
  fondIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  customFondIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fondSymbol: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  fondSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  fondBalance: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
  },
  fondCurrency: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#6B7280',
  },
  fondSeparator: {
    marginHorizontal: 4,
    marginBottom: 30, // Align with icons
  },
  cardPromo: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardPromoContent: {
    flex: 1,
    zIndex: 2,
    paddingRight: 10,
  },
  cardPromoTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#FFFFFF',
  },
  cardPromoTitleDzy: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#FFC759',
    marginBottom: 8,
  },
  cardPromoSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#E2E8F0',
    lineHeight: 14,
    marginBottom: 16,
  },
  reserveBtn: {
    backgroundColor: '#FFC759',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  reserveBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  payMethods: {
    flexDirection: 'row',
    gap: 8,
  },
  payBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  payBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#000000',
    marginLeft: 2,
  },
  dzyCardMockup: {
    width: 140,
    height: 120,
    position: 'absolute',
    right: -20,
    bottom: -10,
    transform: [{ rotate: '-10deg' }],
  },
  dzyCardMockupInner: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDotsPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.1,
    zIndex: -1,
  },
  patternDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    margin: 4,
  },
  dzyCardMockupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dzyCardLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniDzyLogo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  miniDzyLogoText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    color: '#FFC759',
  },
  miniDzyLogoStrike: {
    position: 'absolute',
    width: 8,
    height: 1,
    backgroundColor: '#FFC759',
    transform: [{rotate: '-45deg'}],
  },
  miniDizzitUp: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  dzyCardCurrency: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  cardChip: {
    width: 24,
    height: 18,
    borderRadius: 2,
    marginBottom: 16,
  },
  dzyCardMockupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardDots: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  visaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#F8FAFC',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  txSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  txGreen: {
    color: '#10B981',
  },
  txDark: {
    color: '#1A2840',
  },
  txAmountSub: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#10B981',
    marginTop: 2,
  },
  txTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#A0AABF',
    marginTop: 4,
  },
});
