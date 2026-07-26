import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import BottomNavBar from '../components/BottomNavBar';
import AppSelect from '../components/AppSelect';
import CryptoIcon from '../components/CryptoIcon';

export default function ReceiveFundsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('adresse');
  const [selectedChain, setSelectedChain] = useState('POL');
  const [copied, setCopied] = useState(false);
  const address = '0xA9651F585c8A8D5dFFE0483d4d36B7Ed80786bC4';
  const copyAddress = async () => { await Clipboard.setStringAsync(address); setCopied(true); };
  const shareAddress = () => Share.share({message: `Adresse DizzitUp ${selectedChain}: ${address}`});

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
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
          
          {/* Title Area */}
          <View style={styles.titleArea}>
            <View style={styles.titleIconBox}>
              <Ionicons name="sync" size={24} color="#1A2840" />
            </View>
            <View style={styles.titleTexts}>
              <Text style={styles.pageTitle}>Recevoir fonds</Text>
              <View style={styles.secureTag}>
                <View style={styles.secureDot} />
                <Text style={styles.secureText}>SÉCURISÉ</Text>
              </View>
            </View>
          </View>

          {/* Blockchain Selector */}
          <View style={styles.blockchainSection}>
            <Text style={styles.sectionLabel}>CHOISIR LA BLOCKCHAIN</Text>
            <AppSelect
              value={selectedChain}
              options={[{value:'POL',label:'Polygon'},{value:'ETH',label:'Ethereum'},{value:'SOL',label:'Solana'},{value:'BNB',label:'Chaîne BNB'}]}
              onChange={setSelectedChain}
              title="Choisir la blockchain"
              renderLeading={(option) => <CryptoIcon symbol={option.value} size={28} style={{marginRight: 10}} />}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'adresse' && styles.tabActive]}
              onPress={() => setActiveTab('adresse')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'adresse' && styles.tabTextActive]}>ADRESSE</Text>
              {activeTab === 'adresse' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'scanner' && styles.tabActive]}
              onPress={() => setActiveTab('scanner')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'scanner' && styles.tabTextActive]}>SCANNER QR</Text>
              {activeTab === 'scanner' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Content based on Active Tab */}
          {activeTab === 'adresse' ? (
            <>
              {/* Address Card */}
              <View style={styles.addressCard}>
            {/* Top of Card */}
            <View style={styles.cardTop}>
              <View style={styles.evmTag}>
                <Text style={styles.evmText}>EVM RÉSEAU</Text>
              </View>
              <View style={styles.polygonIconBgSmall}>
                <Ionicons name="infinite" size={14} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={styles.cardAccessRow}>
              <View style={styles.accessDot} />
              <Text style={styles.accessText}>ACCÈS SÉCURISÉ</Text>
            </View>

            <Text style={styles.addressText}>
              0xA9651F585c8A8D5dFFE0483d4d36B7{'\n'}Ed80786bC4
            </Text>

            {/* Bottom of Card */}
            <View style={styles.cardFooter}>
              <View style={styles.cardFooterLeft}>
                <Ionicons name="sync-outline" size={14} color="#94A3B8" style={{marginRight: 6}} />
                <Text style={styles.cardFooterText}>NŒUD DIZZITUP V2.4</Text>
              </View>
              <View style={styles.cardFooterRight}>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" style={{marginRight: 4}} />
                <Text style={styles.verifiedText}>VÉRIFIÉ</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionBtnsRow}>
            <TouchableOpacity style={styles.btnCopy} onPress={copyAddress}>
              <Ionicons name="copy-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.btnCopyText}>{copied ? 'COPIÉ' : 'COPIER'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnShare} onPress={shareAddress}>
              <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.btnShareText}>PARTAGER</Text>
            </TouchableOpacity>
          </View>
          </>
          ) : (
          <>
            {/* QR Scanner Card */}
            <View style={styles.qrCard}>
              <View style={styles.qrHeader}>
                <Ionicons name="scan-outline" size={24} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.qrTitle}>Scanner pour payer</Text>
              </View>
              <Text style={styles.qrSubtitle}>Ceci est votre adresse dédiée pour Polygon</Text>
              
              <View style={styles.qrCodeWrapper}>
                <Ionicons name="qr-code" size={180} color="#1A2840" />
              </View>

              <View style={styles.qrFooter}>
                <Ionicons name="shield-checkmark" size={16} color="#3B82F6" style={{marginRight: 6}} />
                <Text style={styles.qrFooterText}>Transaction 100% sécurisée</Text>
              </View>
            </View>
          </>
          )}

          {/* Bottom Security Banner */}
          <View style={styles.bottomBanner}>
            <View style={styles.accessDot} />
            <Text style={styles.bottomBannerText}>NŒUD DE TRANSACTION SÉCURISÉ</Text>
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
  headerRight: {
    flexDirection: 'row',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: '#FFB800',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
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
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  titleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleTexts: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
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
    marginRight: 6,
  },
  secureText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#10B981',
  },
  blockchainSection: {
    marginBottom: 24,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  polygonIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8247E5', // Polygon purple
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent', // Will use absolute indicator
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#1A2840',
    borderRadius: 1.5,
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#1A2840',
  },
  addressCard: {
    backgroundColor: '#0F1E40', // Dark blue
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // Add subtle background waves simulation if needed via an image or standard color. Using solid color for now as per simple styling.
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  evmTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  evmText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  polygonIconBgSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(130, 71, 229, 0.5)', // Translucent polygon purple
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8247E5',
  },
  cardAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFB800',
    marginRight: 8,
  },
  accessText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFB800',
  },
  addressText: {
    fontFamily: 'SpaceGrotesk_600SemiBold', // Or monospace
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 32,
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#10B981',
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  btnCopy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  btnCopyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  btnShare: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1E40',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  btnShareText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  bottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FE',
    paddingVertical: 12,
    borderRadius: 12,
  },
  bottomBannerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  qrSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  qrCodeWrapper: {
    width: 220,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  qrFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrFooterText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#3B82F6', // Blue color for secure transaction text
  },
});
