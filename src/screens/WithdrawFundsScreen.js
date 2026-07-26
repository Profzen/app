import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppSelect from '../components/AppSelect';

const fiatOptions = [{value:'FCFA',label:'🇸🇳  FCFA'},{value:'GHS',label:'🇬🇭  GHS'},{value:'NGN',label:'🇳🇬  NGN'},{value:'USD',label:'🇺🇸  USD'}];

export default function WithdrawFundsScreen() {
  const navigation = useNavigation();
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [selectedNetwork, setSelectedNetwork] = useState('Polygon');
  const [amount, setAmount] = useState('250 000');
  const [currency, setCurrency] = useState('FCFA');

  const tokens = [
    { id: 'USDC', name: 'USDC', balance: '1 250,00', icon: 'USDC_ICON' },
    { id: 'USDT', name: 'USDT', balance: '930,00', icon: 'USDT_ICON' },
    { id: 'EURC', name: 'EURC', balance: '420,00', icon: 'EURC_ICON' },
    { id: 'DZY', name: 'DZY', balance: '12 500', icon: 'DZY_ICON' },
  ];

  const networks = [
    { id: 'Polygon', name: 'Polygon', icon: 'POLYGON_ICON' },
    { id: 'Base', name: 'Base', icon: 'BASE_ICON' },
    { id: 'Solana', name: 'Solana', icon: 'SOLANA_ICON' },
    { id: 'Ethereum', name: 'Ethereum', icon: 'ETH_ICON' },
  ];

  const renderTokenIcon = (id) => <CryptoIcon symbol={id} size={48} />;

  const renderNetworkIcon = (id) => {
    switch (id) {
      case 'Polygon': return <View style={[styles.networkIconCircle, {backgroundColor: '#8247E5'}]}><Ionicons name="git-network" size={16} color="#FFF" /></View>;
      case 'Base': return <View style={[styles.networkIconCircle, {backgroundColor: '#0052FF'}]}><View style={styles.baseIconInner} /></View>;
      case 'Solana': return <View style={[styles.networkIconCircle, {backgroundColor: '#14F195'}]}><Ionicons name="water" size={16} color="#000" /></View>;
      case 'Ethereum': return <View style={[styles.networkIconCircle, {backgroundColor: '#F3F4F6'}]}><Ionicons name="logo-electron" size={16} color="#3C3C3D" /></View>;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Retirer des fonds</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Simple Stepper (1 to 5) */}
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>1</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepLine} />
            
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>5</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.stepOverTitle}>Étape 1/5</Text>
          <Text style={styles.mainTitle}>Choisissez les détails de votre retrait</Text>
          <Text style={styles.mainSubtitle}>Sélectionnez le montant, le jeton et le réseau.</Text>

          {/* Main Card */}
          <View style={styles.mainCard}>
            
            {/* Montant à retirer */}
            <Text style={styles.sectionTitle}>Montant à retirer</Text>
            <View style={styles.amountInputContainer}>
              <TextInput 
                style={styles.amountInput}
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/\D/g, '').slice(0, 12).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))}
                keyboardType="numeric"
              />
              <AppSelect value={currency} options={fiatOptions} onChange={setCurrency} title="Choisir la devise" style={styles.currencySelector} textStyle={styles.currencyCode} />
            </View>
            <Text style={styles.equivText}>≈ 417,33 USDC</Text>

            <View style={styles.divider} />

            {/* Choisissez le jeton */}
            <Text style={styles.sectionTitle}>Choisissez le jeton</Text>
            <View style={styles.gridContainer}>
              {tokens.map((token) => (
                <TouchableOpacity 
                  key={token.id} 
                  style={[styles.gridItemCard, selectedToken === token.id && styles.gridItemCardActive]}
                  onPress={() => setSelectedToken(token.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIconContainer}>
                    {renderTokenIcon(token.id)}
                  </View>
                  <Text style={styles.itemName}>{token.name}</Text>
                  <Text style={styles.itemSubText}>Solde : {token.balance}</Text>
                  
                  {selectedToken === token.id && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Choisissez le réseau */}
            <Text style={[styles.sectionTitle, {marginTop: 8}]}>Choisissez le réseau</Text>
            <View style={styles.gridContainer}>
              {networks.map((net) => (
                <TouchableOpacity 
                  key={net.id} 
                  style={[styles.gridItemCard, selectedNetwork === net.id && styles.gridItemCardActive]}
                  onPress={() => setSelectedNetwork(net.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIconContainer}>
                    {renderNetworkIcon(net.id)}
                  </View>
                  <Text style={styles.itemName}>{net.name}</Text>
                  
                  {selectedNetwork === net.id && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="information" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.infoBannerText}>
                Assurez-vous que le réseau sélectionné est supporté par la plateforme de réception.
              </Text>
            </View>

          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('WithdrawFundsMethodScreen')}>
            <Text style={styles.btnContinueText}>Continuer</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFB800',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  stepOverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFB800',
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    height: 56,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    outlineStyle: 'none',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  flagText: {
    fontSize: 16,
    marginRight: 6,
  },
  currencyCode: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  equivText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItemCard: {
    width: '23%', // approx 4 items per row, or we could use flex: 1 and map
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  gridItemCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFB800',
    borderWidth: 1.5,
  },
  itemIconContainer: {
    marginBottom: 10,
  },
  tokenIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  networkIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseIconInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  itemName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemSubText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFB800',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  btnContinue: {
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
});
