import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import { useApp } from '../context/AppContext';

export default function ReceiveFundsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, user } = useApp();
  const [activeTab, setActiveTab] = useState('adresse');
  const [selectedChain, setSelectedChain] = useState('POL');
  const [copied, setCopied] = useState(false);
  const address = user?.evmAddress || user?.businessEvmAddress || '0xA9651F585c8A8D5dFFE0483d4d36B7Ed80786bC4';
  const copyAddress = async () => { await Clipboard.setStringAsync(address); setCopied(true); };
  const shareAddress = () => Share.share({message: `DizzitUp ${selectedChain}: ${address}`});

  const handleBack = () => {
    if (route.params?.pivotScreen) {
      navigation.navigate(route.params.pivotScreen, route.params.pivotParams);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconBtn, {marginRight: 8}]}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notifDot}>
                <Text style={styles.notifText}>1</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Title Area - Compact */}
          <View style={styles.titleArea}>
            <View style={styles.titleIconBox}>
              <Ionicons name="sync" size={20} color="#1A2840" />
            </View>
            <View style={styles.titleTexts}>
              <Text style={styles.pageTitle}>{t('receiveFunds.title', 'Receive funds')}</Text>
              <View style={styles.secureTag}>
                <View style={styles.secureDot} />
                <Text style={styles.secureText}>{t('receiveFunds.secure', 'SECURE')}</Text>
              </View>
            </View>
          </View>

          {/* Compact Network Selection — Polygon default, compact pills */}
          <View style={styles.networkPickerWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.networkScroll}>
              {[
                { id: 'POL', name: 'Polygon', icon: 'Polygon', isDefault: true, type: 'EVM' },
                { id: 'BASE', name: 'Base', icon: 'Base', isDefault: false, type: 'EVM' },
                { id: 'ETH', name: 'Ethereum', icon: 'Ethereum', isDefault: false, type: 'EVM' },
                { id: 'BNB', name: 'BNB Chain', icon: 'BNB Chain', isDefault: false, type: 'EVM' },
                { id: 'SOL', name: 'Solana', icon: 'Solana', isDefault: false, type: 'SOL' },
              ].map((net) => {
                const isSelected = selectedChain === net.id;
                return (
                  <TouchableOpacity
                    key={net.id}
                    style={[styles.networkChip, isSelected && styles.networkChipActive]}
                    onPress={() => setSelectedChain(net.id)}
                    activeOpacity={0.75}
                  >
                    <CryptoIcon symbol={net.icon} size={15} style={{ marginRight: 6 }} />
                    <Text style={[styles.networkChipText, isSelected && styles.networkChipTextActive]}>
                      {net.name}
                    </Text>
                    {net.isDefault && (
                      <View style={[styles.defaultTagSmall, isSelected && styles.defaultTagSmallActive]}>
                        <Text style={styles.defaultTagSmallText}>DEFAULT</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Tabs - Compact */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'adresse' && styles.tabActive]}
              onPress={() => setActiveTab('adresse')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'adresse' && styles.tabTextActive]}>{t('receiveFunds.tabAddress', 'ADDRESS')}</Text>
              {activeTab === 'adresse' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'scanner' && styles.tabActive]}
              onPress={() => setActiveTab('scanner')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'scanner' && styles.tabTextActive]}>{t('receiveFunds.tabQr', 'SCAN QR')}</Text>
              {activeTab === 'scanner' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Content based on Active Tab */}
          {activeTab === 'adresse' ? (
            <>
              {/* Address Card - Compact */}
              <View style={styles.addressCard}>
                {/* Top of Card */}
                <View style={styles.cardTop}>
                  <View style={styles.evmTag}>
                    <Text style={styles.evmText}>{selectedChain === 'SOL' ? 'SOLANA NETWORK' : `${selectedChain} EVM NETWORK`}</Text>
                  </View>
                  <View style={styles.polygonIconBgSmall}>
                    <CryptoIcon symbol={selectedChain === 'POL' ? 'Polygon' : selectedChain === 'SOL' ? 'Solana' : selectedChain === 'BASE' ? 'Base' : 'Ethereum'} size={18} />
                  </View>
                </View>
                
                <View style={styles.cardAccessRow}>
                  <View style={styles.accessDot} />
                  <Text style={styles.accessText}>{t('receiveFunds.secureAccess', 'SECURE ACCESS')}</Text>
                </View>

                <Text style={styles.addressText} selectTextOnFocus={true}>
                  {address ? `${address.slice(0, 22)}\n${address.slice(22)}` : ''}
                </Text>

                {/* Bottom of Card */}
                <View style={styles.cardFooter}>
                  <View style={styles.cardFooterLeft}>
                    <Ionicons name="sync-outline" size={13} color="#94A3B8" style={{marginRight: 4}} />
                    <Text style={styles.cardFooterText}>{t('receiveFunds.nodeVersion', 'DIZZITUP NODE V2.4')}</Text>
                  </View>
                  <View style={styles.cardFooterRight}>
                    <Ionicons name="shield-checkmark" size={13} color="#10B981" style={{marginRight: 4}} />
                    <Text style={styles.verifiedText}>{t('receiveFunds.verified', 'VERIFIED')}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons - Compact */}
              <View style={styles.actionBtnsRow}>
                <TouchableOpacity style={styles.btnCopy} onPress={copyAddress}>
                  <Ionicons name="copy-outline" size={18} color="#1A2840" style={{marginRight: 6}} />
                  <Text style={styles.btnCopyText}>{copied ? t('receiveFunds.copied', 'COPIED') : t('receiveFunds.copy', 'COPY')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnShare} onPress={shareAddress}>
                  <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{marginRight: 6}} />
                  <Text style={styles.btnShareText}>{t('receiveFunds.share', 'SHARE')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* QR Scanner Card - Compact */}
              <View style={styles.qrCard}>
                <View style={styles.qrHeader}>
                  <Ionicons name="scan-outline" size={20} color="#1A2840" style={{marginRight: 6}} />
                  <Text style={styles.qrTitle}>{t('receiveFunds.scanToPay', 'Scan to pay')}</Text>
                </View>
                <Text style={styles.qrSubtitle}>{t('receiveFunds.dedicatedAddress', 'Dedicated address for')} {selectedChain}</Text>
                
                <View style={styles.qrCodeWrapper}>
                  <Ionicons name="qr-code" size={140} color="#1A2840" />
                </View>

                <View style={styles.qrFooter}>
                  <Ionicons name="shield-checkmark" size={14} color="#3B82F6" style={{marginRight: 5}} />
                  <Text style={styles.qrFooterText}>{t('receiveFunds.secureTransaction', '100% secure transaction')}</Text>
                </View>
              </View>
            </>
          )}

          {/* Bottom Security Banner - Subtle */}
          <View style={styles.bottomBanner}>
            <View style={styles.accessDot} />
            <Text style={styles.bottomBannerText}>{t('receiveFunds.secureTransactionNode', 'SECURE TRANSACTION NODE')}</Text>
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
  networkPickerWrap: {
    marginBottom: 12,
  },
  networkScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  networkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  networkChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#15803D',
  },
  networkChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  networkChipTextActive: {
    color: '#15803D',
    fontFamily: 'Inter_700Bold',
  },
  defaultTagSmall: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 5,
  },
  defaultTagSmallActive: {
    backgroundColor: '#15803D',
  },
  defaultTagSmallText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  },
  headerRight: {
    flexDirection: 'row',
  },
  notifDot: {
    position: 'absolute',
    top: 5,
    right: 7,
    backgroundColor: '#FFB800',
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifText: {
    fontSize: 7,
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleTexts: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 2,
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
    marginRight: 5,
  },
  secureText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#10B981',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FE',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 2px 4px #000',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -3,
    left: '25%',
    right: '25%',
    height: 2.5,
    backgroundColor: '#1A2840',
    borderRadius: 1.5,
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#1A2840',
  },
  addressCard: {
    backgroundColor: '#0F1E40',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 6px 10px #000',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  evmTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  evmText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  polygonIconBgSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  accessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFB800',
    marginRight: 6,
  },
  accessText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFB800',
  },
  addressText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
  },
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#10B981',
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  btnCopy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnCopyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  btnShare: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1E40',
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnShareText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  bottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FE',
    paddingVertical: 8,
    borderRadius: 10,
  },
  bottomBannerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 3px 8px #000',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  qrTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  qrSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrCodeWrapper: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrFooterText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#3B82F6',
  },
});
