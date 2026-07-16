import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppSelect from '../components/AppSelect';

export default function CashRegisterScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('qr');
  const [amount, setAmount] = useState('2000');
  const [currency, setCurrency] = useState('XOF');

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setAmount(amount.slice(0, -1));
    } else if (key === ',') {
      if (!amount.includes(',')) {
        setAmount(amount + ',');
      }
    } else {
      if (amount === '0') {
        setAmount(key);
      } else {
        setAmount(amount + key);
      }
    }
  };

  const renderKey = (key, icon = null) => (
    <TouchableOpacity 
      style={styles.keyBtn} 
      onPress={() => handleKeyPress(key)}
      activeOpacity={0.7}
    >
      {icon ? (
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      ) : (
        <Text style={styles.keyText}>{key}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>
            {activeTab === 'qr' ? 'Caisse (TPE)' : 'Caissier (PDV)'}
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CashierSendFundsScreen')}>
            <Ionicons name="scan" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, activeTab === 'billets' && {paddingBottom: 0, paddingHorizontal: 0}]} showsVerticalScrollIndicator={false}>
          
          {/* Top Switch */}
          <View style={[styles.switchContainer, activeTab === 'billets' && {marginHorizontal: 16}]}>
            <TouchableOpacity 
              style={[styles.switchTab, activeTab === 'qr' ? styles.switchTabActiveQR : styles.switchTabInactiveQR]}
              onPress={() => setActiveTab('qr')}
            >
              <Ionicons name={activeTab === 'qr' ? "card-outline" : "wallet-outline"} size={20} color={activeTab === 'qr' ? '#FFB800' : (activeTab === 'billets' ? '#FFFFFF' : '#1A2840')} style={{marginRight: 8}} />
              <Text style={[styles.switchText, activeTab === 'qr' ? styles.switchTextActiveQR : styles.switchTextInactiveQR]}>
                {activeTab === 'qr' ? 'Afficher\nle QR Code' : 'Recevoir\nle paiement'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.switchTab, activeTab === 'billets' ? styles.switchTabActiveBillets : styles.switchTabInactiveBillets]}
              onPress={() => setActiveTab('billets')}
            >
              <Ionicons name="scan-outline" size={20} color={activeTab === 'billets' ? '#1A2840' : '#1A2840'} style={{marginRight: 8}} />
              <Text style={[styles.switchText, activeTab === 'billets' ? styles.switchTextActiveBillets : styles.switchTextInactiveBillets]}>
                Scanner{'\n'}les billets
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'qr' ? (
            /* Main Card - Caisse TPE */
            <View style={styles.mainCard}>
            
            {/* Top Row: Montant & Cryptos */}
            <View style={styles.cardTopRow}>
              <View style={styles.montantLabelRow}>
                <Ionicons name="arrow-up-right-box-outline" size={18} color="#FFFFFF" style={{marginRight: 6}} />
                <Text style={styles.montantLabel}>Montant</Text>
              </View>
              
              <View style={styles.cryptoPillsRow}>
                <View style={[styles.cryptoPill, styles.cryptoPillActive]}>
                  <CryptoIcon symbol="USDT" size={22} />
                  <Text style={styles.cryptoPillTextActive}>USDT</Text>
                </View>
                <View style={styles.cryptoPill}>
                  <CryptoIcon symbol="USDC" size={22} />
                  <Text style={styles.cryptoPillText}>USDC</Text>
                </View>
                <View style={styles.cryptoPill}>
                  <CryptoIcon symbol="DZY" size={22} />
                  <Text style={styles.cryptoPillText}>DZY</Text>
                </View>
              </View>
            </View>

            {/* Currency Selector */}
            <View style={styles.currencySelectorRow}>
              <AppSelect
                value={currency}
                options={['XOF', 'XAF', 'GHS', 'NGN'].map((value) => ({value, label: value}))}
                onChange={setCurrency}
                title="Choisir la devise de la caisse"
                style={styles.currencySelectorBtn}
                textStyle={styles.currencySelectorText}
                chevronColor="#FFB800"
              />
            </View>

            {/* Amount Display */}
            <View style={styles.amountDisplayContainer}>
              <Text style={styles.amountText}>{amount || '0'}</Text>
              <View style={styles.equivPill}>
                <Text style={styles.equivText}>≈ 0,0034 USDT</Text>
              </View>
            </View>

            {/* Keypad */}
            <View style={styles.keypad}>
              <View style={styles.keypadRow}>
                {renderKey('1')}
                {renderKey('2')}
                {renderKey('3')}
              </View>
              <View style={styles.keypadRow}>
                {renderKey('4')}
                {renderKey('5')}
                {renderKey('6')}
              </View>
              <View style={styles.keypadRow}>
                {renderKey('7')}
                {renderKey('8')}
                {renderKey('9')}
              </View>
              <View style={styles.keypadRow}>
                {renderKey(',')}
                {renderKey('0')}
                {renderKey('backspace', 'backspace-outline')}
              </View>
            </View>

            {/* Action Button */}
              <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('CashierScanScreen')}>
              <Ionicons name="qr-code" size={24} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.btnActionText}>Afficher le QR Code</Text>
            </TouchableOpacity>

          </View>
          ) : (
            /* Main Card - Scanner Billets */
            <View style={styles.billetsContainer}>
              <TouchableOpacity style={styles.infoBtnTopRight}>
                <Ionicons name="information" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.billetsTitle}>Scanner de billets d'événements</Text>
              <Text style={styles.billetsSub}>Scannez les codes QR des billets pour{'\n'}valider leur entrée.</Text>

              {/* Scanner Graphic Area */}
              <View style={styles.scannerGraphicArea}>
                <View style={styles.scannerCircleOuter}>
                  <View style={styles.scannerCircleInner}>
                    {/* Corners */}
                    <View style={[styles.scanCorner, styles.scanCornerTL]} />
                    <View style={[styles.scanCorner, styles.scanCornerTR]} />
                    <View style={[styles.scanCorner, styles.scanCornerBL]} />
                    <View style={[styles.scanCorner, styles.scanCornerBR]} />
                    
                    {/* Center Ticket Icon */}
                    <Ionicons name="ticket-outline" size={64} color="rgba(255,255,255,0.2)" />
                    
                    {/* Laser Line */}
                    <View style={styles.laserLine}>
                      <View style={styles.laserGlow} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.billetsActions}>
              <TouchableOpacity style={styles.btnCamera} onPress={() => navigation.navigate('CashierScanScreen')}>
                  <Ionicons name="camera-outline" size={24} color="#1A2840" style={{marginRight: 8}} />
                  <Text style={styles.btnCameraText}>Autoriser la caméra</Text>
                </TouchableOpacity>

                <View style={styles.separatorRow}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>OU</Text>
                  <View style={styles.separatorLine} />
                </View>

                <TouchableOpacity style={styles.btnImport}>
                  <Ionicons name="image-outline" size={24} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.btnImportText}>Importer une image</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </ScrollView>

        <BottomNavBar />
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
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
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  switchTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  switchTabActiveQR: {
    backgroundColor: '#071536',
  },
  switchTabInactiveQR: {
    backgroundColor: '#071536', // when billets is active, left tab is dark blue
  },
  switchTabActiveBillets: {
    backgroundColor: '#FFB800',
  },
  switchTabInactiveBillets: {
    backgroundColor: '#FFFFFF',
  },
  switchText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  switchTextActiveQR: {
    color: '#FFFFFF',
  },
  switchTextInactiveQR: {
    color: '#FFFFFF',
  },
  switchTextActiveBillets: {
    color: '#1A2840',
  },
  switchTextInactiveBillets: {
    color: '#1A2840',
  },
  mainCard: {
    backgroundColor: '#071536',
    borderRadius: 32,
    padding: 24,
    marginHorizontal: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  montantLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  montantLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  cryptoPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cryptoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cryptoPillActive: {
    backgroundColor: '#FFB800',
  },
  cryptoIconSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  cryptoPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  cryptoPillTextActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  currencySelectorRow: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  currencySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFB800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 34,
    width: 110,
  },
  currencySelectorText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFB800',
  },
  amountDisplayContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 64,
    color: '#FFFFFF',
    lineHeight: 72,
    marginBottom: 8,
  },
  equivPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  equivText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFB800',
  },
  keypad: {
    marginBottom: 32,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyBtn: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 20,
    borderRadius: 20,
  },
  btnActionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  billetsContainer: {
    backgroundColor: '#071536',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    flex: 1,
    minHeight: 600,
  },
  infoBtnTopRight: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  billetsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  billetsSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  scannerGraphicArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  scannerCircleOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerCircleInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFB800',
    borderWidth: 3,
  },
  scanCornerTL: {
    top: 40,
    left: 40,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  scanCornerTR: {
    top: 40,
    right: 40,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  scanCornerBL: {
    bottom: 40,
    left: 40,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  scanCornerBR: {
    bottom: 40,
    right: 40,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  laserLine: {
    position: 'absolute',
    width: 200,
    height: 2,
    backgroundColor: '#38BDF8',
    top: '50%',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  laserGlow: {
    position: 'absolute',
    width: 80,
    height: 4,
    backgroundColor: '#FFFFFF',
    top: -1,
    left: 60,
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  billetsActions: {
    width: '100%',
  },
  btnCamera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  btnCameraText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  separatorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 16,
  },
  btnImport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 18,
    borderRadius: 16,
  },
  btnImportText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
