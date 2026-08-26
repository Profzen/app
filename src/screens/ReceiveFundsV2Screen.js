import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, Animated, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function ReceiveFundsV2Screen() {
  const navigation = useNavigation();
  const { session, t } = useApp();
  const [addresses, setAddresses] = useState({ evm: '', solana: '' });

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const token = session?.access_token || '';
        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
          DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        }
        const syncRes = await fetch(`${DIZZY_URL}/wallet/sync-smart-address`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const syncData = await syncRes.json();
        if (syncRes.ok && syncData.success) {
          setAddresses({ evm: syncData.evmAddress, solana: syncData.solanaAddress });
        }
      } catch (err) {
        console.error("Failed to fetch address:", err);
      }
    };
    fetchAddress();
  }, [session]);
  const [activeTab, setActiveTab] = useState('adresse');
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('Polygon');
  const address = selectedChain === 'Solana' ? (addresses.solana || 'Chargement...') : (addresses.evm || 'Chargement...');
  const qr = address && address !== 'Chargement...' ? QRCode.create(address, { errorCorrectionLevel: 'M' }) : null;
  const copyAddress = () => { setShowToast(true); setCopied(true); Clipboard.setStringAsync(address).catch(() => {}); setTimeout(() => setCopied(false), 2500); };
  const shareAddress = async () => { try { await Share.share({ message: `Adresse DizzitUp ${selectedChain} : ${address}` }); } catch { await Clipboard.setStringAsync(address); setShowToast(true); setCopied(true); setTimeout(() => setCopied(false), 2500); } };
  const chooseChain = (chain) => { setSelectedChain(chain); setDropdownOpen(false); };
  const RealQrCode = () => {
    if (!qr) return null;
    return (
      <Svg width={180} height={180} viewBox={`0 0 ${qr.modules.size} ${qr.modules.size}`} accessibilityLabel="QR code de l'adresse">
        <Rect width={qr.modules.size} height={qr.modules.size} fill="#FFFFFF" />
        {Array.from(qr.modules.data).map((cell, index) => cell ? <Rect key={index} x={index % qr.modules.size} y={Math.floor(index / qr.modules.size)} width="1" height="1" fill="#20365B" /> : null)}
      </Svg>
    );
  };

  const CHAINS = [
    { id: 'Polygon', name: 'Polygon', isDefault: true, subtitle: 'DEFAULT' },
    { id: 'Ethereum', name: 'Ethereum', isDefault: false, subtitle: 'Available Node' },
    { id: 'Base', name: 'Base', isDefault: false, subtitle: 'Available Node' },
    { id: 'Solana', name: 'Solana', isDefault: false, subtitle: 'Available Node' },
    { id: 'BNB Chain', name: 'BNB Chain', isDefault: false, subtitle: 'Available Node' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t('receiveFunds.receive_funds_title', 'Recevoir des fonds')}</Text>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
            {/* Blockchain Selector */}
            <View style={styles.blockchainSection}>
              <Text style={styles.sectionLabel}>{t('receiveFunds.select_blockchain', 'SÉLECTIONNER LA BLOCKCHAIN')}</Text>
              <TouchableOpacity 
                style={[styles.dropdown, dropdownOpen && styles.dropdownOpen]}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <View style={{ marginRight: 12 }}>
                    <CryptoIcon symbol={selectedChain} size={28} />
                  </View>
                  <Text style={styles.dropdownText}>{selectedChain}</Text>
                </View>
                <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#1A2840" />
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {CHAINS.map((chain, index) => {
                    const isSelected = selectedChain === chain.id;
                    return (
                      <React.Fragment key={chain.id}>
                        {index > 0 && <View style={styles.dropdownDivider} />}
                        <TouchableOpacity 
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]} 
                          onPress={() => chooseChain(chain.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownItemLeft}>
                            <View style={{ marginRight: 14 }}>
                              <CryptoIcon symbol={chain.id} size={26} />
                            </View>
                            <View>
                              <Text style={styles.dropdownItemTitle}>{chain.name}</Text>
                              {chain.isDefault ? (
                                <Text style={styles.dropdownItemSubYellow}>{chain.subtitle}</Text>
                              ) : (
                                <Text style={styles.dropdownItemSub}>{chain.subtitle}</Text>
                              )}
                            </View>
                          </View>
                          {isSelected && <Ionicons name="checkmark-circle" size={22} color="#FFC759" />}
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  })}
                </View>
              )}
            </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'adresse' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab('adresse')}
              activeOpacity={0.8}
            >
              <Ionicons name="wallet-outline" size={18} color={activeTab === 'adresse' ? '#FFFFFF' : '#1A2840'} style={{marginRight: 6}} />
              <Text style={[styles.tabText, activeTab === 'adresse' ? styles.tabTextActive : styles.tabTextInactive]}>{t('receiveFunds.your_address', 'ADRESSE')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'qrcode' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab('qrcode')}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={18} color={activeTab === 'qrcode' ? '#FFFFFF' : '#1A2840'} style={{marginRight: 6}} />
              <Text style={[styles.tabText, activeTab === 'qrcode' ? styles.tabTextActive : styles.tabTextInactive]}>{t('receiveFunds.scan', 'SCANNER QR')}</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'adresse' ? (
            <>
              {/* Address Card */}
              <LinearGradient colors={['#2B4C7E', '#20365B']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.addressCard}>
                {/* Top of Card */}
                <View style={styles.cardTop}>
                  <View style={styles.polygonPill}>
                    <View style={styles.polygonIconSmall}>
                      <Ionicons name="infinite" size={12} color="#FFFFFF" />
                    </View>
                    <View style={styles.pillDot} />
                    <Text style={styles.polygonPillText}>POLYGON</Text>
                  </View>
                  <View style={styles.nodeSecureRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" style={{marginRight: 4}} />
                    <View style={styles.nodeDot} />
                    <Text style={styles.nodeSecureText}>{t('receiveFunds.secure', 'NOEUD SÉCURISÉ')}</Text>
                  </View>
                </View>

                {/* Address Area */}
                <Text style={styles.addressLabel}>{t('receiveFunds.your_address', 'VOTRE ADRESSE')}</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.addressText}>
                    {address}
                  </Text>
                  <Pressable style={styles.btnCopyIcon} onPress={copyAddress} onPressIn={copyAddress}>
                    <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

              </LinearGradient>

              {/* Action Buttons */}
              <View style={styles.actionBtnsRow}>
                <Pressable style={styles.btnCopy} onPress={copyAddress} onPressIn={copyAddress} accessibilityLabel="Copier l'adresse">
                  <Ionicons name="copy-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                  <Text style={styles.btnCopyText}>{copied ? t('receiveFunds.copied', 'COPIÉ ✔') : t('receiveFunds.copy', 'COPIER')}</Text>
                </Pressable>
                <TouchableOpacity style={styles.btnShare} onPress={shareAddress}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.btnShareText}>{t('receiveFunds.share', 'PARTAGER')}</Text>
                </TouchableOpacity>
              </View>

            </>
          ) : (
            <>
              {/* QR Code Card */}
              <LinearGradient colors={['#2B4C7E', '#20365B']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.addressCard}>
                {/* Top of Card */}
                <View style={styles.cardTop}>
                  <View style={styles.polygonPill}>
                    <View style={styles.polygonIconSmall}>
                      <Ionicons name="infinite" size={12} color="#FFFFFF" />
                    </View>
                    <View style={styles.pillDot} />
                    <Text style={styles.polygonPillText}>POLYGON</Text>
                  </View>
                  <View style={styles.nodeSecureRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" style={{marginRight: 4}} />
                    <View style={styles.nodeDot} />
                    <Text style={styles.nodeSecureText}>{t('receiveFunds.secure', 'NOEUD SÉCURISÉ')}</Text>
                  </View>
                </View>

                {/* QR Content */}
                <View style={styles.qrContentWrapper}>
                  <Text style={styles.qrCardTitle}>{t('receiveFunds.scan_to_pay', 'Scanner pour payer')}</Text>
                  <Text style={styles.qrCardSub}>{t('receiveFunds.dedicatedAddress', 'Ceci est votre adresse dédiée pour {{chain}}').replace('{{chain}}', selectedChain)}</Text>
                  
                  <View style={styles.qrCodeBox}>
                    <RealQrCode />
                  </View>
                  
                  <View style={styles.qrInnerTabs}>
                    <TouchableOpacity style={styles.qrInnerTab} onPress={() => setActiveTab('adresse')}>
                      <Ionicons name="wallet-outline" size={14} color="#FFFFFF" style={{marginRight: 6}} />
                      <Text style={styles.qrInnerTabText}>{t('receiveFunds.view_address', "VOIR L'ADRESSE")}</Text>
                    </TouchableOpacity>
                    <View style={styles.qrInnerTabDivider} />
                    <TouchableOpacity style={styles.qrInnerTab}>
                      <Ionicons name="scan-outline" size={14} color="#FFFFFF" style={{marginRight: 6}} />
                      <Text style={styles.qrInnerTabText}>{t('receiveFunds.scan', 'SCANNER')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* Address Area Small */}
                <Text style={styles.addressLabelSmall}>{t('receiveFunds.your_address', 'VOTRE ADRESSE')}</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.addressTextSmall} numberOfLines={1} ellipsizeMode="middle">
                    {address}
                  </Text>
                  <Pressable style={styles.btnCopyIcon} onPress={copyAddress} onPressIn={copyAddress}>
                    <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

              </LinearGradient>

              {/* Action Buttons */}
              <View style={styles.actionBtnsRow}>
                <Pressable style={styles.btnCopy} onPress={copyAddress} onPressIn={copyAddress} accessibilityLabel="Copier l'adresse">
                  <Ionicons name="copy-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                  <Text style={styles.btnCopyText}>{copied ? t('receiveFunds.copied', 'COPIÉ ✔') : t('receiveFunds.copy', 'COPIER')}</Text>
                </Pressable>
                <TouchableOpacity style={styles.btnShare} onPress={shareAddress}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.btnShareText}>{t('receiveFunds.share', 'PARTAGER')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {showToast && (
            <View style={styles.toastCard}>
              <View style={styles.toastIconBg}><Ionicons name="checkmark" size={16} color="#FFFFFF" /></View>
              <View style={styles.toastContent}><Text style={styles.toastTitle}>{t('receiveFunds.toastTitle', 'Adresse copiée !')}</Text><Text style={styles.toastDesc}>{t('receiveFunds.toastDesc', "L'adresse a été copiée dans le presse-papiers.")}</Text></View>
              <TouchableOpacity onPress={() => setShowToast(false)}><Ionicons name="close" size={20} color="#94A3B8" /></TouchableOpacity>
            </View>
          )}

          {/* Bottom Security Banner */}
          <View style={styles.bottomBanner}>
            <View style={styles.bottomBannerLeft}>
              <View style={styles.bottomBannerShield}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FFB800" />
              </View>
              <View style={styles.bottomBannerContent}>
                <Text style={styles.bottomBannerTitle}>{t('receiveFunds.bannerTitle', 'Noeud de transaction sécurisé DizzitUp')}</Text>
                <Text style={styles.bottomBannerDesc}>{t('receiveFunds.bannerDesc', 'Vos transactions sont protégées par notre infrastructure.')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </View>

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
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
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
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: '#1A2840',
    textAlign: 'center',
    marginHorizontal: 8,
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
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerCenter: {
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 4,
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  secureText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#10B981',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtnHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFB800',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  notifText: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  blockchainSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  dropdownOpen: {
    borderColor: '#FFC759',
    borderWidth: 2,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.08)',
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItemActive: {
    backgroundColor: '#FFFDF5',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  dropdownItemSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  dropdownItemSubYellow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#D97706',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 56,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FE',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#20365B',
  },
  tabInactive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#1A2840',
  },
  addressCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  polygonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(130, 71, 229, 0.2)', // Purple tint
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  polygonIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  pillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  polygonPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  nodeSecureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  nodeSecureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  addressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  addressText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginRight: 12,
  },
  btnCopyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  actionBtnsRowCard: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCopyCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnShareCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnCardText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  btnCopy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnCopyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  btnShare: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#20365B',
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnShareText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4', // Light green bg
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  toastIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#064E3B',
    marginBottom: 2,
  },
  toastDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#065F46',
  },
  bottomBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  bottomBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bottomBannerShield: {
    marginRight: 12,
  },
  bottomBannerContent: {
    flex: 1,
  },
  bottomBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  bottomBannerDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  qrContentWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  qrCardSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 24,
  },
  qrCodeBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  qrInnerTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  qrInnerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  qrInnerTabDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  qrInnerTabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  addressLabelSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  addressTextSmall: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    marginRight: 12,
  },
  walletAddressesCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, boxShadow: '0px 4px 10px rgba(0,0,0,0.05)', elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  waHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  waIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(32,54,91,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  waTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#20365B' },
  waList: { gap: 12 },
  waItem: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9', boxShadow: '0px 2px 4px rgba(0,0,0,0.05)', elevation: 2 },
  waItemContent: { flexDirection: 'row', alignItems: 'center' },
  waNetworkIconEVM: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  waNetworkIconSOL: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  waTextWrap: { flex: 1 },
  waNetworkTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#20365B', textTransform: 'uppercase', marginBottom: 2 },
  waAddressText: { fontFamily: 'SpaceGrotesk_400Regular', fontSize: 12, color: '#64748B' },
  waCopyBtnEVM: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,199,89,0.15)', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  waCopyBtnSOL: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(32,54,91,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  waEmpty: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  waEmptyText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 12 },
});
