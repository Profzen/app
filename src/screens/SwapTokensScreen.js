import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppSelect from '../components/AppSelect';

const chainOptions = ['Polygon', 'Ethereum', 'Base', 'Solana', 'BNB Chain'].map((value) => ({value, label: value, iconName: 'git-network'}));
const tokenOptions = ['DZY', 'USDC', 'USDT', 'POL', 'WBTC', 'ETH', 'SOL'].map((value) => ({value, label: value}));

export default function SwapTokensScreen() {
  const [fromChain, setFromChain] = useState('Polygon');
  const [toChain, setToChain] = useState('Solana');
  const navigation = useNavigation();
  const [fromAmount, setFromAmount] = useState('0,00');
  const [toAmount, setToAmount] = useState('0,00');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('USDT');
  const chooseQuickToken = (symbol) => setFromToken(symbol);
  const swapSides = () => { setFromChain(toChain); setToChain(fromChain); setFromToken(toToken); setToToken(fromToken); setFromAmount(toAmount); setToAmount(fromAmount); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.pageTitle}>Échange de jetons</Text>
            <Text style={styles.pageSubtitle}>Swap/Bridge tokens</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-vertical" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.introText}>Échangez vos jetons instantanément aux meilleurs taux.</Text>

          {/* Chain Selectors */}
          <View style={styles.chainRow}>
            <View style={styles.chainCol}>
              <Text style={styles.inputLabel}>DE LA CHAÎNE</Text>
              <AppSelect value={fromChain} options={chainOptions} onChange={setFromChain} title="Choisir la chaîne source" style={styles.chainSelector} textStyle={styles.chainName} />
            </View>
            <View style={{width: 16}} />
            <View style={styles.chainCol}>
              <Text style={styles.inputLabel}>À CHAÎNE</Text>
              <AppSelect value={toChain} options={chainOptions} onChange={setToChain} title="Choisir la chaîne cible" style={styles.chainSelector} textStyle={styles.chainName} />
            </View>
          </View>

          {/* DZY Banner */}
          <View style={styles.dzyBanner}>
            <View style={styles.dzyBannerHeader}>
              <Ionicons name="rocket-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.dzyBannerTitle}>Le jeton DZY arrive bientôt !</Text>
            </View>
            <Text style={styles.dzyBannerText}>
              Le token natif de DizzitUp sera lancé au deuxième trimestre 2026. Vous pourrez bientôt échanger des DZY contre d'autres tokens !
            </Text>
          </View>

          {/* Quick Selection */}
          <Text style={styles.inputLabel}>SÉLECTION RAPIDE - POLYGON</Text>
          <View style={styles.quickSelectionRow}>
            <TouchableOpacity style={styles.quickTokenCard} onPress={() => chooseQuickToken('DZY')}>
              <View style={[styles.tokenLogoWrapper, {borderColor: '#FFB800'}]}>
                <CryptoIcon symbol="DZY" size={28} />
              </View>
              <Text style={styles.quickTokenName}>DZY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickTokenCard} onPress={() => chooseQuickToken('USDC')}>
              <View style={[styles.tokenLogoWrapper, {borderColor: '#3B82F6'}]}>
                <CryptoIcon symbol="USDC" size={28} />
              </View>
              <Text style={styles.quickTokenName}>USDC</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickTokenCard} onPress={() => chooseQuickToken('USDT')}>
              <View style={[styles.tokenLogoWrapper, {borderColor: '#10B981'}]}>
                <CryptoIcon symbol="USDT" size={28} />
              </View>
              <Text style={styles.quickTokenName}>USDT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickTokenCard} onPress={() => chooseQuickToken('POL')}>
              <View style={[styles.tokenLogoWrapper, {borderColor: '#8B5CF6'}]}>
                <CryptoIcon symbol="POL" size={28} />
              </View>
              <Text style={styles.quickTokenName}>POL</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickTokenCard} onPress={() => chooseQuickToken('WBTC')}>
              <View style={[styles.tokenLogoWrapper, {borderColor: '#F59E0B'}]}>
                <CryptoIcon symbol="WBTC" size={28} />
              </View>
              <Text style={styles.quickTokenName}>WBTC</Text>
            </TouchableOpacity>
          </View>

          {/* Swap Box */}
          <View style={styles.swapContainer}>
            
            {/* From Input */}
            <View style={styles.inputBox}>
              <View style={styles.inputBoxHeader}>
                <Text style={styles.inputLabel}>À PARTIR DU JETON</Text>
                <View style={styles.balanceInfo}>
                  <Ionicons name="wallet-outline" size={14} color="#D97706" style={{marginRight: 4}} />
                  <Text style={styles.balanceValue}>0,0000 USDC</Text>
                  <TouchableOpacity>
                    <Text style={styles.maxText}>MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputRow}>
                <AppSelect value={fromToken} options={tokenOptions} onChange={setFromToken} title="Jeton à échanger" style={styles.tokenSelector} textStyle={styles.selectedTokenName} renderLeading={(option) => <CryptoIcon symbol={option.value} size={24} style={{marginRight: 6}} />} />
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={fromAmount}
                    onChangeText={setFromAmount}
                    keyboardType="numeric"
                  />
                  <View style={styles.upDownArrows}>
                    <Ionicons name="chevron-up" size={12} color="#1A2840" />
                    <Ionicons name="chevron-down" size={12} color="#1A2840" />
                  </View>
                </View>
              </View>
            </View>

            {/* Swap Button (floating) */}
            <View style={styles.swapBtnWrapper}>
              <TouchableOpacity style={styles.swapBtn} onPress={swapSides}>
                <Ionicons name="swap-vertical" size={20} color="#1A2840" />
              </TouchableOpacity>
            </View>

            {/* To Input */}
            <View style={styles.inputBox}>
              <View style={styles.inputBoxHeader}>
                <Text style={styles.inputLabel}>À TOKEN (ESTIMATION)</Text>
              </View>
              <View style={styles.inputRow}>
                <AppSelect value={toToken} options={tokenOptions} onChange={setToToken} title="Jeton à recevoir" style={styles.tokenSelector} textStyle={styles.selectedTokenName} renderLeading={(option) => <CryptoIcon symbol={option.value} size={24} style={{marginRight: 6}} />} />
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={toAmount}
                    onChangeText={setToAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

          </View>

          {/* Wallet Status */}
          <View style={styles.walletStatusBox}>
            <View style={styles.walletStatusRow}>
              <View style={styles.walletStatusLeft}>
                <View style={styles.greenDot} />
                <Text style={styles.walletStatusLabel}>PORTEFEUILLE ACTIF (POLYGON)</Text>
              </View>
              <View style={styles.walletStatusRight}>
                <Text style={styles.walletAddress}>0x5C29...9b91</Text>
                <Ionicons name="copy-outline" size={16} color="#1A2840" style={{marginLeft: 8}} />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.walletStatusRow}>
              <Text style={styles.walletStatusLabel}>SOLDE DISPONIBLE</Text>
              <View style={styles.walletStatusRightCol}>
                <Text style={styles.walletBalanceBold}>0 USDC</Text>
                <TouchableOpacity>
                  <Text style={styles.viewOnChainText}>VOIR SUR LA CHAÎNE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('SuccessScreen')}>
            <Ionicons name="flash" size={20} color="#FFB800" style={{marginRight: 8}} />
            <Text style={styles.btnActionText}>ÉCHANGEZ DES JETONS MAINTENANT</Text>
          </TouchableOpacity>

          {/* Footer Info */}
          <View style={styles.footerInfoRow}>
            <Text style={styles.footerInfoText}>• GLISSEMENT 0,5%</Text>
            <Text style={styles.footerInfoText}>• FRAIS DE RÉSEAU RÉDUITS</Text>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  pageSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  headerRightIcons: {
    flexDirection: 'row',
  },
  iconBtnRight: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginLeft: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB800',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  introText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  chainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chainCol: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chainSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chainLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  polygonIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chainName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  dzyBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  dzyBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dzyBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  dzyBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  quickSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  quickTokenCard: {
    alignItems: 'center',
  },
  tokenLogoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  usdcLogo: {
    backgroundColor: '#2775CA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usdtLogo: {
    backgroundColor: '#26A17B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  polygonLogo: {
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wbtcLogo: {
    backgroundColor: '#F7931A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTokenName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  swapContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  inputBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    marginRight: 8,
  },
  maxText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#F59E0B',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedTokenName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginHorizontal: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    outlineStyle: 'none',
    textAlign: 'right',
    minWidth: 100,
  },
  upDownArrows: {
    marginLeft: 8,
    alignItems: 'center',
  },
  swapBtnWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 10,
    backgroundColor: '#FAFAFA', // matching background to hide border line
    padding: 4,
    borderRadius: 24,
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletStatusBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  walletStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  walletStatusLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  walletStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletAddress: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  walletStatusRightCol: {
    alignItems: 'flex-end',
  },
  walletBalanceBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  viewOnChainText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#F59E0B',
  },
  btnAction: {
    flexDirection: 'row',
    backgroundColor: '#0A1128',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  btnActionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  footerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerInfoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginHorizontal: 12,
  },
});
