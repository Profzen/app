import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Share,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { isSmallScreen } from '../utils/responsive';

const CHAINS = [
  { id: 'Polygon', name: 'Polygon', isDefault: true, subtitleKey: 'receiveFunds.recommendedFast', defaultSub: 'Recommended • Fast & Lowest Fees' },
  { id: 'Solana', name: 'Solana', isDefault: false, subtitleKey: 'receiveFunds.crossmintSupported', defaultSub: 'Fast • Crossmint Supported' },
  { id: 'Base', name: 'Base', isDefault: false, subtitleKey: '', defaultSub: 'Coinbase L2 • Low Fees' },
  { id: 'BNB Chain', name: 'BNB Chain', isDefault: false, subtitleKey: '', defaultSub: 'Binance Smart Chain' },
  { id: 'Ethereum', name: 'Ethereum', isDefault: false, subtitleKey: '', defaultSub: 'Ethereum Mainnet' },
];

const EVM_TOKENS = ['USDC', 'USDT', 'EURC', 'DZY', 'POL', 'ETH'];
const SOLANA_TOKENS = ['USDC', 'USDT', 'SOL', 'DZY'];
const QUICK_AMOUNTS = ['5', '10', '25', '50', '100'];

export default function ReceiveFundsV2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { session, user, t } = useApp();

  const [addresses, setAddresses] = useState({ evm: '', solana: '' });
  const [selectedChain, setSelectedChain] = useState('Polygon');
  const [token, setToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAddress = async () => {
      try {
        const authToken = session?.access_token || '';
        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
          DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        }
        const syncRes = await fetch(`${DIZZY_URL}/wallet/sync-smart-address`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const syncData = await syncRes.json();
        if (isMounted && syncRes.ok && syncData.success) {
          setAddresses({
            evm: syncData.evmAddress || '',
            solana: syncData.solanaAddress || '',
          });
        }
      } catch (err) {
        console.error('Failed to sync smart wallet address:', err);
      }
    };
    fetchAddress();
    return () => { isMounted = false; };
  }, [session]);

  // Resolve current active address
  const evmAddress = addresses.evm || user?.evmAddress || user?.businessEvmAddress || '';
  const solanaAddress = addresses.solana || user?.solanaAddress || '';
  const activeAddress = selectedChain === 'Solana'
    ? (solanaAddress || t('common.loading', 'Loading...'))
    : (evmAddress || t('common.loading', 'Loading...'));

  // Ensure selected token matches available network tokens
  const currentTokens = selectedChain === 'Solana' ? SOLANA_TOKENS : EVM_TOKENS;
  useEffect(() => {
    if (!currentTokens.includes(token)) {
      setToken(currentTokens[0]);
    }
  }, [selectedChain]);

  // QR Code Generation
  const qrPayload = amount && parseFloat(amount) > 0
    ? (selectedChain === 'Solana'
        ? `solana:${activeAddress}?amount=${amount}&spl-token=${token}`
        : `ethereum:${activeAddress}@137?amount=${amount}&token=${token}`)
    : activeAddress;

  const qr = activeAddress && activeAddress !== t('common.loading', 'Loading...')
    ? QRCode.create(qrPayload, { errorCorrectionLevel: 'M' })
    : null;

  const copyAddress = async () => {
    if (!activeAddress || activeAddress === t('common.loading', 'Loading...')) return;
    try {
      await Clipboard.setStringAsync(activeAddress);
      setCopied(true);
      setToast({
        title: t('receiveFunds.toastTitle', 'Address copied!'),
        message: t('receiveFunds.toastDesc', 'The address has been copied to the clipboard.'),
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const copyPaymentRequest = async () => {
    if (!activeAddress || activeAddress === t('common.loading', 'Loading...')) return;
    try {
      const msg = amount && parseFloat(amount) > 0
        ? t('receiveFunds.shareRequestMessage', 'Send {{amount}} {{token}} to my DizzitUp wallet ({{chain}}): {{address}}', {
            amount,
            token,
            chain: selectedChain,
            address: activeAddress,
          })
        : activeAddress;
      await Clipboard.setStringAsync(msg);
      setCopied(true);
      setToast({
        title: t('receiveFunds.toastTitle', 'Address copied!'),
        message: amount ? t('common.copied', 'Copied!') : t('receiveFunds.toastDesc', 'The address has been copied to the clipboard.'),
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const sharePaymentRequest = async () => {
    if (!activeAddress || activeAddress === t('common.loading', 'Loading...')) return;
    try {
      const message = amount && parseFloat(amount) > 0
        ? t('receiveFunds.shareRequestMessage', 'Send {{amount}} {{token}} to my DizzitUp wallet ({{chain}}): {{address}}', {
            amount,
            token,
            chain: selectedChain,
            address: activeAddress,
          })
        : t('receiveFunds.shareAddressMessage', 'My DizzitUp {{chain}} address: {{address}}', {
            chain: selectedChain,
            address: activeAddress,
          });
      await Share.share({ message });
    } catch {
      await copyPaymentRequest();
    }
  };

  const handleSelectChain = (chain) => {
    setSelectedChain(chain.id);
    setShowNetworkModal(false);
  };

  const handleSelectToken = (selectedTok) => {
    setToken(selectedTok);
    setShowTokenModal(false);
  };

  const handleBack = () => {
    const pivotScreen = route.params?.pivotScreen;
    const pivotParams = route.params?.pivotParams;
    if (pivotScreen) {
      navigation.navigate(pivotScreen, pivotParams);
    } else {
      navigation.goBack();
    }
  };

  const RealQrCode = () => {
    if (!qr) return null;
    const qrSize = isSmallScreen ? 160 : 180;
    return (
      <Svg width={qrSize} height={qrSize} viewBox={`0 0 ${qr.modules.size} ${qr.modules.size}`} accessibilityLabel="QR Code">
        <Rect width={qr.modules.size} height={qr.modules.size} fill="#FFFFFF" />
        {Array.from(qr.modules.data).map((cell, index) =>
          cell ? (
            <Rect
              key={index}
              x={index % qr.modules.size}
              y={Math.floor(index / qr.modules.size)}
              width="1"
              height="1"
              fill="#0F172A"
            />
          ) : null
        )}
      </Svg>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Toast Alert */}
        {!!toast && (
          <View style={styles.toastWrap}>
            <AppToast
              title={toast.title}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t('receiveFunds.receive_funds_title', 'Receive funds')}
            </Text>
            <View style={styles.secureBadgeRow}>
              <View style={styles.secureDot} />
              <Text style={styles.secureBadgeText}>
                {t('receiveFunds.secureTransaction', '100% secure transaction')}
              </Text>
            </View>
          </View>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section: Request Amount First */}
          <View style={styles.requestHeroCard}>
            <View style={styles.requestHeaderRow}>
              <View>
                <Text style={styles.requestCardTitle}>
                  {t('receiveFunds.requestAmount', 'Request Amount')}
                </Text>
                <Text style={styles.requestCardSubtitle}>
                  {t('receiveFunds.requestSubtitle', 'Enter an amount to generate a payment request')}
                </Text>
              </View>
              {amount ? (
                <TouchableOpacity onPress={() => setAmount('')} style={styles.clearBtn} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  <Text style={styles.clearBtnText}>{t('common.clear', 'Clear')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Amount Input with Token Selector Pill */}
            <View style={styles.amountInputRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
              />

              <TouchableOpacity
                style={styles.tokenPill}
                onPress={() => setShowTokenModal(true)}
                activeOpacity={0.8}
              >
                <CryptoIcon symbol={token} size={22} style={{ marginRight: 6 }} />
                <Text style={styles.tokenPillText}>{token}</Text>
                <Ionicons name="chevron-down" size={14} color="#0F172A" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {/* Quick Amount Suggestion Chips */}
            <View style={styles.quickChipsRow}>
              {QUICK_AMOUNTS.map((val) => {
                const isSelected = amount === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.quickChip, isSelected && styles.quickChipActive]}
                    onPress={() => setAmount(val)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                      +{val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* QR Code and Address Card */}
          <LinearGradient
            colors={['#2B4C7E', '#20365B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.qrCard}
          >
            {/* Top pill showing current chain */}
            <View style={styles.cardHeaderTop}>
              <View style={styles.chainPill}>
                <CryptoIcon symbol={selectedChain} size={14} />
                <Text style={styles.chainPillText}>{selectedChain.toUpperCase()}</Text>
              </View>

              <View style={styles.nodeTagRow}>
                <Ionicons name="shield-checkmark" size={13} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={styles.nodeTagText}>{t('receiveFunds.secure', 'SECURE')}</Text>
              </View>
            </View>

            {/* QR Center Box */}
            <View style={styles.qrCenterWrapper}>
              <View style={styles.qrWhiteBox}>
                <RealQrCode />
              </View>

              {/* Dynamic Request Pill */}
              {amount && parseFloat(amount) > 0 ? (
                <View style={styles.requestedAmountBadge}>
                  <Text style={styles.requestedAmountLabel}>
                    {t('receiveFunds.requesting', 'Requesting')}:
                  </Text>
                  <Text style={styles.requestedAmountValue}>
                    {amount} {token}
                  </Text>
                </View>
              ) : (
                <Text style={styles.qrScanHint}>
                  {t('receiveFunds.scan_to_pay', 'Scan to Pay')}
                </Text>
              )}
            </View>

            {/* Divider */}
            <View style={styles.cardDivider} />

            {/* Address Row */}
            <Text style={styles.addressLabel}>
              {t('receiveFunds.your_address', 'YOUR ADDRESS')}
            </Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {activeAddress}
              </Text>
              <Pressable style={styles.addressCopyBtn} onPress={copyAddress}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </LinearGradient>

          {/* Action Buttons: Copy & Share */}
          <View style={styles.actionBtnsRow}>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={copyPaymentRequest}
              activeOpacity={0.85}
            >
              <Ionicons name="copy-outline" size={18} color="#0F172A" style={{ marginRight: 8 }} />
              <Text style={styles.copyBtnText}>
                {copied ? t('receiveFunds.copied', 'COPIED') : t('receiveFunds.copy', 'COPY')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={sharePaymentRequest}
              activeOpacity={0.85}
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareBtnText}>
                {t('receiveFunds.share', 'SHARE')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Discreet Multichain Switcher Chip */}
          <TouchableOpacity
            style={styles.networkChip}
            onPress={() => setShowNetworkModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.networkChipLeft}>
              <View style={styles.networkIconWrapper}>
                <CryptoIcon symbol={selectedChain} size={20} />
              </View>
              <View>
                <Text style={styles.networkChipTitle}>
                  {t('common.network', 'Network')}:{' '}
                  <Text style={styles.networkChipBold}>{selectedChain}</Text>
                  {selectedChain === 'Polygon' ? ` (${t('common.default', 'Default')})` : ''}
                </Text>
                <Text style={styles.networkChipSubtitle}>
                  {selectedChain === 'Polygon'
                    ? t('receiveFunds.recommendedFast', 'Recommended • Fast & Lowest Fees')
                    : selectedChain === 'Solana'
                    ? t('receiveFunds.crossmintSupported', 'Fast • Crossmint Supported')
                    : `${selectedChain} Network Node`}
                </Text>
              </View>
            </View>

            <View style={styles.networkChipRight}>
              <Text style={styles.networkChangeText}>
                {t('receiveFunds.changeNetwork', 'Change')}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#2563EB" />
            </View>
          </TouchableOpacity>

          {/* Pivot Return Button if arriving from ContactProfile */}
          {route.params?.pivotScreen && (
            <TouchableOpacity
              style={styles.pivotButton}
              onPress={() => navigation.navigate(route.params.pivotScreen, route.params.pivotParams)}
              activeOpacity={0.88}
            >
              <Ionicons name="arrow-back" size={16} color="#071D54" style={{ marginRight: 6 }} />
              <Text style={styles.pivotButtonText}>
                {t('common.backToContact', 'Back to Contact')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Bottom Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconBox}>
              <Ionicons name="shield-checkmark" size={18} color="#FFC759" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityBannerTitle}>
                {t('receiveFunds.bannerTitle', 'DizzitUp Secure Transaction Node')}
              </Text>
              <Text style={styles.securityBannerDesc}>
                {t('receiveFunds.bannerDesc', 'Your transactions are protected by our infrastructure.')}
              </Text>
            </View>
          </View>
        </ScrollView>

        <BottomNavBar />

        {/* Modal: Discreet Multichain Selection Sheet */}
        <Modal
          visible={showNetworkModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNetworkModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowNetworkModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {t('receiveFunds.networkModalTitle', 'Select Blockchain Network')}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {t('receiveFunds.networkModalSubtitle', 'Choose network to receive funds (Polygon is default)')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowNetworkModal(false)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.chainsList}>
                {CHAINS.map((chain, index) => {
                  const isSelected = selectedChain === chain.id;
                  const subtitle = chain.subtitleKey ? t(chain.subtitleKey, chain.defaultSub) : chain.defaultSub;
                  return (
                    <TouchableOpacity
                      key={chain.id}
                      style={[styles.chainRow, isSelected && styles.chainRowActive]}
                      onPress={() => handleSelectChain(chain)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.chainRowLeft}>
                        <View style={styles.chainIconSquare}>
                          <CryptoIcon symbol={chain.id} size={24} />
                        </View>
                        <View>
                          <View style={styles.chainNameRow}>
                            <Text style={styles.chainRowName}>{chain.name}</Text>
                            {chain.isDefault ? (
                              <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.chainRowSub}>{subtitle}</Text>
                        </View>
                      </View>

                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                      ) : (
                        <Ionicons name="radio-button-off" size={20} color="#CBD5E1" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal: Token Selector Sheet */}
        <Modal
          visible={showTokenModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTokenModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowTokenModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {t('common.currency', 'Currency')} / Token
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {t('common.select', 'Select')} token to receive
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowTokenModal(false)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.tokensGrid}>
                {currentTokens.map((tok) => {
                  const isSelected = token === tok;
                  return (
                    <TouchableOpacity
                      key={tok}
                      style={[styles.tokenGridItem, isSelected && styles.tokenGridItemActive]}
                      onPress={() => handleSelectToken(tok)}
                      activeOpacity={0.75}
                    >
                      <CryptoIcon symbol={tok} size={28} style={{ marginBottom: 6 }} />
                      <Text style={[styles.tokenGridText, isSelected && styles.tokenGridTextActive]}>
                        {tok}
                      </Text>
                      {isSelected ? (
                        <View style={styles.tokenCheckDot}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  toastWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 60,
    zIndex: 99,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingBottom: 10,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: isSmallScreen ? 16 : 17,
    color: '#0F172A',
  },
  secureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  secureBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#10B981',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  /* Scroll Body */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingTop: 8,
    paddingBottom: 70,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },

  /* Hero Request Amount Card */
  requestHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallScreen ? 14 : 16,
    marginBottom: 14,
    boxShadow: '0px 2px 8px #F1F5F9',
  },
  requestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  requestCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: isSmallScreen ? 14 : 15,
    color: '#0F172A',
  },
  requestCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  clearBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginLeft: 3,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 10,
  },
  amountInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 22 : 26,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tokenPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  quickChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickChipActive: {
    backgroundColor: '#071D54',
  },
  quickChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#334155',
  },
  quickChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },

  /* QR Card */
  qrCard: {
    borderRadius: 24,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 12,
    boxShadow: '0px 8px 24px #20365B',
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  chainPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nodeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  nodeTagText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#10B981',
    letterSpacing: 0.5,
  },

  /* QR Box */
  qrCenterWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrWhiteBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    boxShadow: '0px 4px 12px #000',
  },
  requestedAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  requestedAmountLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#071D54',
  },
  requestedAmountValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#071D54',
  },
  qrScanHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 10,
  },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 14,
  },

  /* Address Box */
  addressLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  addressText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 8,
  },
  addressCopyBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },

  /* Action Buttons */
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  copyBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  shareBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#071D54',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px #071D54',
  },
  shareBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  /* Discreet Network Switcher Chip */
  networkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  networkChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  networkIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  networkChipTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  networkChipBold: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#0F172A',
  },
  networkChipSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  networkChipRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  networkChangeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#2563EB',
  },

  /* Pivot Button */
  pivotButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pivotButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#071D54',
  },

  /* Bottom Security Banner */
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  securityIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  securityContent: {
    flex: 1,
  },
  securityBannerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#0F172A',
  },
  securityBannerDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  /* Modal Sheets */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  chainsList: {
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  chainRowActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  chainRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chainIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chainNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chainRowName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  defaultBadge: {
    backgroundColor: '#15803D',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  defaultBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chainRowSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  /* Tokens Grid Modal */
  tokensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 8,
  },
  tokenGridItem: {
    width: (Dimensions.get('window').width > 500 ? 480 : Dimensions.get('window').width - 56) / 3,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tokenGridItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tokenGridText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#334155',
  },
  tokenGridTextActive: {
    color: '#1D4ED8',
  },
  tokenCheckDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
