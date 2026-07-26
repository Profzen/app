import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppSelect from '../components/AppSelect';

export default function CashRegisterScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('billets');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [amount, setAmount] = useState('2000');
  const [currency, setCurrency] = useState('XOF');

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === ',') {
      if (!amount.includes(',')) {
        setAmount(prev => prev + ',');
      }
    } else {
      if (amount === '0') {
        setAmount(key);
      } else {
        setAmount(prev => prev + key);
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
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      ) : (
        <Text style={styles.keyText}>{key}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconSquareBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleWrap}>
            <Text style={styles.pageTitle}>
              {activeTab === 'billets' ? 'Caissier' : 'Point of Sale (POS/ATM)'}
            </Text>
            {activeTab === 'qr' && (
              <Text style={styles.pageSubtitle}>Caisses (TPE/DAB)</Text>
            )}
          </View>

          <TouchableOpacity style={styles.iconSquareBtn} onPress={() => navigation.navigate('CashierSendFundsScreen')}>
            <Ionicons name="qr-code-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top 2 Mode Switcher Tabs Container */}
          <View style={[styles.modeSwitchContainer, activeTab === 'billets' && styles.modeSwitchContainerDark]}>
            <TouchableOpacity 
              style={[
                styles.modeTabBtn, 
                activeTab === 'qr' && styles.modeTabBtnActiveQR,
                activeTab === 'billets' && styles.modeTabBtnInactiveQR
              ]}
              onPress={() => setActiveTab('qr')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="wallet-outline" 
                size={20} 
                color={activeTab === 'qr' ? '#FFC759' : '#FFFFFF'} 
                style={{ marginRight: 8 }} 
              />
              <Text style={[styles.modeTabText, activeTab === 'qr' ? styles.modeTabTextActive : { color: '#FFFFFF' }]}>
                Recevoir{'\n'}le paiement
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.modeTabBtn, 
                activeTab === 'billets' && styles.modeTabBtnActiveBillets
              ]}
              onPress={() => setActiveTab('billets')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="scan-outline" 
                size={20} 
                color={activeTab === 'billets' ? '#1A2840' : '#1A2840'} 
                style={{ marginRight: 8 }} 
              />
              <Text style={[styles.modeTabText, activeTab === 'billets' ? styles.modeTabTextActiveBillets : styles.modeTabText]}>
                Scanner les{'\n'}billets
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'qr' ? (
            /* Main Dark Blue Terminal Card */
            <View style={styles.terminalCard}>
              
              {/* Top Row: Montant & Token Pills */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.montantLabelGroup}>
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.montantLabelText}>Montant</Text>
                </View>

                <View style={styles.tokenPillsContainer}>
                  <TouchableOpacity 
                    style={[styles.tokenPill, selectedToken === 'USDT' && styles.tokenPillActive]}
                    onPress={() => setSelectedToken('USDT')}
                  >
                    <CryptoIcon symbol="USDT" size={18} />
                    <Text style={[styles.tokenPillText, selectedToken === 'USDT' && styles.tokenPillTextActive]}>USDT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.tokenPill, selectedToken === 'USDC' && styles.tokenPillActive]}
                    onPress={() => setSelectedToken('USDC')}
                  >
                    <CryptoIcon symbol="USDC" size={18} />
                    <Text style={[styles.tokenPillText, selectedToken === 'USDC' && styles.tokenPillTextActive]}>USDC</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.tokenPill, selectedToken === 'DZY' && styles.tokenPillActive]}
                    onPress={() => setSelectedToken('DZY')}
                  >
                    <CryptoIcon symbol="DZY" size={18} />
                    <Text style={[styles.tokenPillText, selectedToken === 'DZY' && styles.tokenPillTextActive]}>DZY</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Currency Selector Dropdown */}
              <View style={styles.currencyRow}>
                <AppSelect
                  value={currency}
                  options={['XOF', 'XAF', 'GHS', 'NGN', 'USD'].map((val) => ({ value: val, label: val }))}
                  onChange={setCurrency}
                  title="Choisir la devise"
                  style={styles.currencySelectBtn}
                  textStyle={styles.currencySelectText}
                  chevronColor="#FFC759"
                />
              </View>

              {/* Amount Display */}
              <View style={styles.amountDisplayGroup}>
                <Text style={styles.montantTitleText}>Montant à payer</Text>
                <Text style={styles.mainAmountText}>{amount || '0'}</Text>
                <View style={styles.equivBadgePill}>
                  <Text style={styles.equivBadgeText}>≈ 0,0034 USDT</Text>
                </View>
              </View>

              {/* Numeric Keypad Grid */}
              <View style={styles.keypadGrid}>
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

              {/* Primary Action Button */}
              <TouchableOpacity 
                style={styles.btnReceivePayment} 
                onPress={() => navigation.navigate('CashierScanScreen')}
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={styles.btnReceivePaymentText}>Recevoir le paiement</Text>
              </TouchableOpacity>

            </View>
          ) : (
            /* Scanner Billets Tab View */
            <View style={styles.billetsContainer}>
              <TouchableOpacity style={styles.infoBtnTopRight}>
                <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.billetsTitle}>Scanner de billets d'événements</Text>
              <Text style={styles.billetsSub}>
                Scannez les codes QR des billets pour{'\n'}valider leur entrée.
              </Text>

              {/* Scanner Graphic Area with Ticket Icon & Laser */}
              <View style={styles.scannerGraphicArea}>
                <View style={styles.scannerCircleOuter}>
                  <View style={styles.scannerCircleInner}>
                    {/* Yellow Corner Brackets */}
                    <View style={[styles.scanCorner, styles.scanCornerTL]} />
                    <View style={[styles.scanCorner, styles.scanCornerTR]} />
                    <View style={[styles.scanCorner, styles.scanCornerBL]} />
                    <View style={[styles.scanCorner, styles.scanCornerBR]} />

                    {/* Center Ticket Icon */}
                    <Ionicons name="ticket-outline" size={68} color="#0052FF" />

                    {/* Horizontal Glowing Laser Beam */}
                    <View style={styles.laserBeamLine} />
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.billetsActions}>
                <TouchableOpacity 
                  style={styles.btnCamera} 
                  onPress={() => navigation.navigate('CashierScanScreen')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="camera-outline" size={22} color="#1A2840" style={{ marginRight: 8 }} />
                  <Text style={styles.btnCameraText}>Autoriser la caméra</Text>
                </TouchableOpacity>

                <View style={styles.separatorRow}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>OU</Text>
                  <View style={styles.separatorLine} />
                </View>

                <TouchableOpacity 
                  style={styles.btnImport}
                  activeOpacity={0.8}
                >
                  <Ionicons name="image-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnImportText}>Importer une image</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  iconSquareBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { alignItems: 'center' },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#1A2840' },
  pageSubtitle: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#6B7280' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 6, paddingBottom: 30 },
  modeSwitchContainer: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 18, padding: 4, marginHorizontal: 16, marginBottom: 16 },
  modeSwitchContainerDark: { backgroundColor: '#071D54', borderColor: '#071D54' },
  modeTabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 14 },
  modeTabBtnActiveQR: { backgroundColor: '#071D54' },
  modeTabBtnInactiveQR: { backgroundColor: 'transparent' },
  modeTabBtnActiveBillets: { backgroundColor: '#FFC759' },
  modeTabText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', textAlign: 'center', lineHeight: 15 },
  modeTabTextActive: { color: '#FFFFFF' },
  modeTabTextActiveBillets: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#1A2840', textAlign: 'center', lineHeight: 15 },
  terminalCard: { backgroundColor: '#071D54', borderRadius: 24, padding: 18, marginHorizontal: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  montantLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  montantLabelText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF' },
  tokenPillsContainer: { flexDirection: 'row', gap: 6 },
  tokenPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  tokenPillActive: { backgroundColor: '#FFC759' },
  tokenPillText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#FFFFFF', marginLeft: 4 },
  tokenPillTextActive: { color: '#1A2840' },
  currencyRow: { alignItems: 'flex-end', marginBottom: 16 },
  currencySelectBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFC759', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minHeight: 30 },
  currencySelectText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#FFC759' },
  amountDisplayGroup: { alignItems: 'center', marginBottom: 24 },
  montantTitleText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFC759', marginBottom: 4 },
  mainAmountText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 48, color: '#FFFFFF', lineHeight: 56, marginBottom: 8 },
  equivBadgePill: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16 },
  equivBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFC759' },
  keypadGrid: { marginBottom: 20 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  keyBtn: { width: '31%', height: 48, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#FFFFFF' },
  btnReceivePayment: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 14 },
  btnReceivePaymentText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  billetsContainer: { backgroundColor: '#071D54', borderRadius: 24, padding: 20, marginHorizontal: 16 },
  infoBtnTopRight: { alignSelf: 'flex-end', padding: 4 },
  billetsTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#FFFFFF', textAlign: 'center', marginBottom: 6 },
  billetsSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  scannerGraphicArea: { alignItems: 'center', marginBottom: 28 },
  scannerCircleOuter: { width: 230, height: 230, borderRadius: 115, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  scannerCircleInner: { width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: 'rgba(0,82,255,0.3)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  scanCorner: { position: 'absolute', width: 28, height: 28, borderColor: '#FFC759', borderWidth: 3 },
  scanCornerTL: { top: 24, left: 24, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
  scanCornerTR: { top: 24, right: 24, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
  scanCornerBL: { bottom: 24, left: 24, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
  scanCornerBR: { bottom: 24, right: 24, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },
  laserBeamLine: { position: 'absolute', width: 150, height: 2, backgroundColor: '#38BDF8', top: '50%', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
  billetsActions: { width: '100%' },
  btnCamera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 14, marginBottom: 14 },
  btnCameraText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  separatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  separatorLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  separatorText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#9CA3AF', marginHorizontal: 12 },
  btnImport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', height: 48, borderRadius: 14 },
  btnImportText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFFFFF' }
});
