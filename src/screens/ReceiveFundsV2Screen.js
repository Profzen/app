import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Pressable, ScrollView, Animated, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

export default function ReceiveFundsV2Screen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('adresse');
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('Polygone');
  const address = '0x5C292F468c41b3F2D84D1d888B578aCf4BC339b91';
  const qr = QRCode.create(address, { errorCorrectionLevel: 'M' });
  const copyAddress = () => { setShowToast(true); setCopied(true); Clipboard.setStringAsync(address).catch(() => {}); setTimeout(() => setCopied(false), 2500); };
  const shareAddress = async () => { try { await Share.share({ message: `Adresse DizzitUp ${selectedChain} : ${address}` }); } catch { await Clipboard.setStringAsync(address); setShowToast(true); setCopied(true); setTimeout(() => setCopied(false), 2500); } };
  const chooseChain = (chain) => { setSelectedChain(chain); setDropdownOpen(false); };
  const RealQrCode = () => <Svg width={180} height={180} viewBox={`0 0 ${qr.modules.size} ${qr.modules.size}`} accessibilityLabel="QR code de l'adresse Polygon"><Rect width={qr.modules.size} height={qr.modules.size} fill="#FFFFFF" />{Array.from(qr.modules.data).map((cell, index) => cell ? <Rect key={index} x={index % qr.modules.size} y={Math.floor(index / qr.modules.size)} width="1" height="1" fill="#071536" /> : null)}</Svg>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.pageTitle}>Recevoir des fonds</Text>
            <View style={styles.secureTag}>
              <View style={styles.secureDot} />
              <Text style={styles.secureText}>SÉCURISÉ</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnHeader}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notifDot}>
                <Text style={styles.notifText}>1</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnHeader} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnHeader} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-vertical" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Blockchain Selector */}
          <View style={styles.blockchainSection}>
            <Text style={styles.sectionLabel}>SÉLECTIONNER LA BLOCKCHAIN</Text>
            <TouchableOpacity 
              style={[styles.dropdown, dropdownOpen && styles.dropdownOpen]}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeft}>
                <View style={styles.polygonIconBg}>
                  <Ionicons name="infinite" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.dropdownText}>{selectedChain}</Text>
              </View>
              <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#1A2840" />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={[styles.dropdownItem, selectedChain === 'Polygone' && styles.dropdownItemActive]} onPress={() => chooseChain('Polygone')}>
                  <View style={styles.dropdownItemLeft}>
                    <CryptoIcon symbol="POL" size={30} />
                    <View>
                      <Text style={styles.dropdownItemTitle}>Polygone</Text>
                      <Text style={styles.dropdownItemSubYellow}>DÉFAUT</Text>
                    </View>
                  </View>
                  {selectedChain === 'Polygone' && <Ionicons name="checkmark-circle" size={24} color="#FFB800" />}
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />

                <TouchableOpacity style={[styles.dropdownItem, selectedChain === 'Ethereum' && styles.dropdownItemActive]} onPress={() => chooseChain('Ethereum')}>
                  <View style={styles.dropdownItemLeft}>
                    <CryptoIcon symbol="ETH" size={30} />
                    <View>
                      <Text style={styles.dropdownItemTitle}>Ethereum</Text>
                      <Text style={styles.dropdownItemSub}>Nœud disponible</Text>
                    </View>
                  </View>
                  {selectedChain === 'Ethereum' && <Ionicons name="checkmark-circle" size={24} color="#FFB800" />}
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />

                <TouchableOpacity style={[styles.dropdownItem, selectedChain === 'Base' && styles.dropdownItemActive]} onPress={() => chooseChain('Base')}>
                  <View style={styles.dropdownItemLeft}>
                    <View style={[styles.cryptoIconBg, {backgroundColor: '#0052FF'}]}>
                      <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF'}} />
                    </View>
                    <View>
                      <Text style={styles.dropdownItemTitle}>Base</Text>
                      <Text style={styles.dropdownItemSub}>Nœud disponible</Text>
                    </View>
                  </View>
                  {selectedChain === 'Base' && <Ionicons name="checkmark-circle" size={24} color="#FFB800" />}
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />

                <TouchableOpacity style={[styles.dropdownItem, selectedChain === 'Solana' && styles.dropdownItemActive]} onPress={() => chooseChain('Solana')}>
                  <View style={styles.dropdownItemLeft}>
                    <CryptoIcon symbol="SOL" size={30} />
                    <View>
                      <Text style={styles.dropdownItemTitle}>Solana</Text>
                      <Text style={styles.dropdownItemSub}>Nœud disponible</Text>
                    </View>
                  </View>
                  {selectedChain === 'Solana' && <Ionicons name="checkmark-circle" size={24} color="#FFB800" />}
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />

                <TouchableOpacity style={[styles.dropdownItem, selectedChain === 'Chaîne BNB' && styles.dropdownItemActive]} onPress={() => chooseChain('Chaîne BNB')}>
                  <View style={styles.dropdownItemLeft}>
                    <CryptoIcon symbol="BNB" size={30} />
                    <View>
                      <Text style={styles.dropdownItemTitle}>Chaîne BNB</Text>
                      <Text style={styles.dropdownItemSub}>Nœud disponible</Text>
                    </View>
                  </View>
                  {selectedChain === 'Chaîne BNB' && <Ionicons name="checkmark-circle" size={24} color="#FFB800" />}
                </TouchableOpacity>
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
              <Text style={[styles.tabText, activeTab === 'adresse' ? styles.tabTextActive : styles.tabTextInactive]}>ADRESSE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'qrcode' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab('qrcode')}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={18} color={activeTab === 'qrcode' ? '#FFFFFF' : '#1A2840'} style={{marginRight: 6}} />
              <Text style={[styles.tabText, activeTab === 'qrcode' ? styles.tabTextActive : styles.tabTextInactive]}>SCANNER QR</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'adresse' ? (
            <>
              {/* Address Card */}
              <View style={styles.addressCard}>
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
                    <Text style={styles.nodeSecureText}>NOEUD SÉCURISÉ</Text>
                  </View>
                </View>

                {/* Address Area */}
                <Text style={styles.addressLabel}>VOTRE ADRESSE</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.addressText}>
                    0x5C292F468c41b3F2D84D1d88{'\n'}8B578aCf4BC339b91
                  </Text>
                  <Pressable style={styles.btnCopyIcon} onPress={copyAddress} onPressIn={copyAddress}>
                    <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

              </View>

              {/* Action Buttons */}
              <View style={styles.actionBtnsRow}>
                <Pressable style={styles.btnCopy} onPress={copyAddress} onPressIn={copyAddress} accessibilityLabel="Copier l'adresse">
                  <Ionicons name="copy-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                  <Text style={styles.btnCopyText}>COPIER</Text>
                </Pressable>
                <TouchableOpacity style={styles.btnShare} onPress={shareAddress}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.btnShareText}>PARTAGER</Text>
                </TouchableOpacity>
              </View>

            </>
          ) : (
            <>
              {/* QR Code Card */}
              <View style={styles.addressCard}>
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
                    <Text style={styles.nodeSecureText}>NOEUD SÉCURISÉ</Text>
                  </View>
                </View>

                {/* QR Content */}
                <View style={styles.qrContentWrapper}>
                  <Text style={styles.qrCardTitle}>Scanner pour payer</Text>
                  <Text style={styles.qrCardSub}>Ceci est votre adresse dédiée pour Polygon</Text>
                  
                  <View style={styles.qrCodeBox}>
                    <RealQrCode />
                  </View>
                  
                  <View style={styles.qrInnerTabs}>
                    <TouchableOpacity style={styles.qrInnerTab} onPress={() => setActiveTab('adresse')}>
                      <Ionicons name="wallet-outline" size={14} color="#FFFFFF" style={{marginRight: 6}} />
                      <Text style={styles.qrInnerTabText}>VOIR L'ADRESSE</Text>
                    </TouchableOpacity>
                    <View style={styles.qrInnerTabDivider} />
                    <TouchableOpacity style={styles.qrInnerTab}>
                      <Ionicons name="scan-outline" size={14} color="#FFFFFF" style={{marginRight: 6}} />
                      <Text style={styles.qrInnerTabText}>SCANNER</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* Address Area Small */}
                <Text style={styles.addressLabelSmall}>VOTRE ADRESSE</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.addressTextSmall} numberOfLines={1} ellipsizeMode="middle">
                    0x5C292F468c41b3F2D84D1d88B578aCf4BC339b91
                  </Text>
                  <Pressable style={styles.btnCopyIcon} onPress={copyAddress} onPressIn={copyAddress}>
                    <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

              </View>

              {/* Action Buttons */}
              <View style={styles.actionBtnsRow}>
                <Pressable style={styles.btnCopy} onPress={copyAddress} onPressIn={copyAddress} accessibilityLabel="Copier l'adresse">
                  <Ionicons name="copy-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
                  <Text style={styles.btnCopyText}>{copied ? 'COPIÉ ✔' : 'COPIER'}</Text>
                </Pressable>
                <TouchableOpacity style={styles.btnShare} onPress={shareAddress}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.btnShareText}>PARTAGER</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {showToast && (
            <View style={styles.toastCard}>
              <View style={styles.toastIconBg}><Ionicons name="checkmark" size={16} color="#FFFFFF" /></View>
              <View style={styles.toastContent}><Text style={styles.toastTitle}>Adresse copiée !</Text><Text style={styles.toastDesc}>L'adresse a été copiée dans le presse-papiers.</Text></View>
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
                <Text style={styles.bottomBannerTitle}>Noeud de transaction sécurisé DizzitUp</Text>
                <Text style={styles.bottomBannerDesc}>Vos transactions sont protégées par notre infrastructure.</Text>
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
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
  },
  dropdownOpen: {
    borderColor: '#FFB800',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  polygonIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cryptoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dropdownItemActive: {
    backgroundColor: '#FFFBEB',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#1A2840',
  },
  dropdownItemSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  dropdownItemSubYellow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFB800',
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 60,
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
    backgroundColor: '#071536',
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
    backgroundColor: '#071536',
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
});
