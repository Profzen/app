import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppSelect from '../components/AppSelect';
import { useApp } from '../context/AppContext';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function CashRegisterScreen() {
  const navigation = useNavigation();
  const { t, user } = useApp();
  const [activeTab, setActiveTab] = useState('billets');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [amount, setAmount] = useState('0');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3500);
  };

  // Use merchant's country from settings to determine initial fiat currency dynamically
  const defaultCurrency = getCountryCurrencyInfo(user?.country || '').currency;
  const [currency, setCurrency] = useState(defaultCurrency);
  const [rates, setRates] = useState({ XOF: 600, XAF: 600, GHS: 12, NGN: 1100, USD: 1 }); // Fallback rates

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates(data.rates);
        }
      })
      .catch(err => console.log('Rates fetch error:', err));
  }, []);

  // Calculate equivalent USDT based on selected fiat and amount
  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
  const rateToUSD = rates[currency] || 1;
  const equivalentInUSD = (numericAmount / rateToUSD);

  let equivalentTokenAmount = '0.00';
  if (selectedToken === 'DZY') {
    equivalentTokenAmount = (equivalentInUSD * 10).toFixed(2);
  } else if (selectedToken === 'EURC') {
    const rateToEUR = rates['EUR'] || 0.92;
    equivalentTokenAmount = (equivalentInUSD * rateToEUR).toFixed(2);
  } else {
    // USDT, USDC
    equivalentTokenAmount = equivalentInUSD.toFixed(2);
  }

  const getFlagUrl = (currencyCode) => {
    const curToIso = {
      XOF: 'ci', XAF: 'cm', GHS: 'gh', NGN: 'ng', KES: 'ke', UGX: 'ug', ZAR: 'za',
      USD: 'us', EUR: 'eu', GBP: 'gb', CAD: 'ca', AUD: 'au', JPY: 'jp', CNY: 'cn',
      CHF: 'ch', INR: 'in', BRL: 'br', RUB: 'ru', KRW: 'kr', MXN: 'mx', AED: 'ae',
      DZD: 'dz', MAD: 'ma', EGP: 'eg', BDT: 'bd', BHD: 'bh', BWP: 'bw', BYN: 'by',
      BZD: 'bz', BOB: 'bo', BAM: 'ba', BND: 'bn', BGN: 'bg', BIF: 'bi', GEL: 'ge',
      GMD: 'gm', GTQ: 'gt', GYD: 'gy', HTG: 'ht', HNL: 'hn', HKD: 'hk', IDR: 'id',
      ILS: 'il', IQD: 'iq', IRR: 'ir', ISK: 'is', JMD: 'jm', JOD: 'jo', KWD: 'kw',
      KZT: 'kz', LAK: 'la', LBP: 'lb', LKR: 'lk', LRD: 'lr', LSL: 'ls', LYD: 'ly',
      MDL: 'md', MGA: 'mg', MKD: 'mk', MMK: 'mm', MNT: 'mn', MOP: 'mo'
    };
    const iso = curToIso[currencyCode];
    if (iso) return `https://flagcdn.com/w40/${iso}.png`;
    return `https://flagcdn.com/w40/${currencyCode.substring(0, 2).toLowerCase()}.png`;
  };


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
              {activeTab === 'billets' ? t('pos.cashier', 'Caissier') : t('pos.pos_title', 'Point of Sale (POS/ATM)')}
            </Text>
            {activeTab === 'qr' && (
              <Text style={styles.pageSubtitle}>{t('pos.cash_desks', 'Caisses (TPE/DAB)')}</Text>
            )}
          </View>

          {/* Empty view to balance flex layout and keep title centered */}
          <View style={{ width: 38 }} />
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
                {t('pos.receive_payment_multiline', 'Recevoir\nle paiement')}
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
                {t('pos.scan_tickets_multiline', 'Scanner les\nbillets')}
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
                  <Text style={styles.montantLabelText}>{t('pos.amount', 'Montant')}</Text>
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
                  options={Object.keys(rates).sort().map((val) => ({ value: val, label: val, flagUrl: getFlagUrl(val) }))}
                  onChange={setCurrency}
                  title={t('pos.choose_currency', 'Choisir la devise')}
                  style={styles.currencySelectBtn}
                  textStyle={styles.currencySelectText}
                  chevronColor="#FFC759"
                />
              </View>

              {/* Amount Display */}
              <View style={styles.amountDisplayGroup}>
                <Text style={styles.montantTitleText}>{t('pos.amount_to_pay', 'Montant à payer')}</Text>
                <Text style={styles.mainAmountText}>{amount || '0'}</Text>
                <View style={styles.equivBadgePill}>
                  <Text style={styles.equivBadgeText}>≈ {equivalentTokenAmount} {selectedToken}</Text>
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
                onPress={() => navigation.navigate('CashierScanScreen', {
                  amount: numericAmount,
                  currency: currency,
                  equivalent: equivalentTokenAmount,
                  token: selectedToken
                })}
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={styles.btnReceivePaymentText}>{t('pos.receive_payment', 'Recevoir le paiement')}</Text>
              </TouchableOpacity>

            </View>
          ) : (
            /* Scanner Billets Tab View */
            <View style={styles.billetsContainer}>
              <TouchableOpacity style={styles.infoBtnTopRight} onPress={() => setInfoModalVisible(true)}>
                <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.billetsTitle}>{t('pos.event_ticket_scanner', 'Scanner de billets d\'événements')}</Text>
              <Text style={styles.billetsSub}>
                {t('pos.scan_tickets_desc', 'Scannez les codes QR des billets pour\nvalider leur entrée.')}
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

                    {isCameraActive && cameraPermission?.granted ? (
                      <CameraView
                        style={{ width: '100%', height: '100%', borderRadius: 999 }}
                        facing="back"
                        onBarcodeScanned={({ data }) => {
                          setIsCameraActive(false);
                          showToast(`${t('pos.scanned_ticket', 'Billet scanné :')} ${data}`);
                        }}
                      />
                    ) : (
                      <>
                        {/* Center Ticket Icon */}
                        <Ionicons name="ticket-outline" size={68} color="#FFC759" />
                        {/* Horizontal Glowing Laser Beam */}
                        <View style={styles.laserBeamLine} />
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.billetsActions}>
                <TouchableOpacity
                  style={styles.btnCamera}
                  onPress={async () => {
                    if (!cameraPermission?.granted) {
                      const res = await requestCameraPermission();
                      if (res.granted) setIsCameraActive(true);
                    } else {
                      setIsCameraActive(true);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="camera-outline" size={22} color="#1A2840" style={{ marginRight: 8 }} />
                  <Text style={styles.btnCameraText}>{t('pos.authorize_camera', 'Autoriser la caméra')}</Text>
                </TouchableOpacity>

                <View style={styles.separatorRow}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>{t('pos.or', 'OU')}</Text>
                  <View style={styles.separatorLine} />
                </View>

                <TouchableOpacity
                  style={styles.btnImport}
                  onPress={async () => {
                    let result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ['images'],
                      allowsEditing: true,
                      quality: 1,
                    });
                    if (!result.canceled) {
                      showToast(t('pos.image_imported', 'Image importée avec succès!'));
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="image-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnImportText}>{t('pos.import_image', 'Importer une image')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="home" />

        {/* Custom Beautiful Toast Notification */}
        {toast.visible && (
          <View style={styles.toastContainer}>
            <View style={styles.toastContent}>
              <Ionicons name="checkmark-circle" size={24} color="#FFC759" />
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>
          </View>
        )}

        {/* Info Modal for Scanner */}
        <Modal visible={infoModalVisible} transparent animationType="fade" onRequestClose={() => setInfoModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.infoModalCard}>
              <View style={styles.infoModalHeader}>
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <Text style={styles.infoModalTitle}>{t('pos.event_ticket_scanner', 'Scanner de billets')}</Text>
              </View>
              <Text style={styles.infoModalText}>
                {t('pos.info_modal_desc', "Cette fonctionnalit� permet de scanner le QR code d'un client (ex. un ticket d'�v�nement) pour valider son entr�e ou traiter une demande sp�ciale. Cliquez sur 'Autoriser la cam�ra' pour commencer.")}
              </Text>
              <TouchableOpacity style={styles.infoModalBtn} onPress={() => setInfoModalVisible(false)}>
                <Text style={styles.infoModalBtnText}>{t('pos.close', 'Fermer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View >
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: '#FFFFFF',
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
  terminalCard: { backgroundColor: '#20365B', borderRadius: 24, padding: 18, marginHorizontal: 16 },
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
  billetsContainer: { backgroundColor: '#20365B', borderRadius: 24, padding: 20, marginHorizontal: 16 },
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
  laserBeamLine: { position: 'absolute', width: 150, height: 2, backgroundColor: '#38BDF8', top: '50%', boxShadow: '0px 0px 8px #38BDF8' },
  billetsActions: { width: '100%' },
  btnCamera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 14, marginBottom: 14 },
  btnCameraText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  separatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  separatorLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  separatorText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#9CA3AF', marginHorizontal: 12 },
  btnImport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', height: 48, borderRadius: 14 },
  btnImportText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFFFFF' },
  toastContainer: { position: 'absolute', top: Platform.OS === 'android' ? 60 : 50, left: 20, right: 20, zIndex: 1000, alignItems: 'center' },
  toastContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#20365B', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8, borderWidth: 1, borderColor: 'rgba(255, 199, 89, 0.2)' },
  toastText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFFFFF', marginLeft: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  infoModalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  infoModalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoModalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#0F172A', marginLeft: 10 },
  infoModalText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 24 },
  infoModalBtn: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  infoModalBtnText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF' }
});














