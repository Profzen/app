import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import BottomNavBar from '../components/BottomNavBar';

export default function CashierScanScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconSquareBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Caisse (TPE)</Text>
          <TouchableOpacity style={styles.iconSquareBtn}>
            <Ionicons name="help-circle-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Title & Subtitle Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Scannez pour payer</Text>
            <Text style={styles.subTitle}>
              Montrez ce QR Code à votre client{'\n'}pour qu'il effectue le paiement.
            </Text>
          </View>

          {/* Dark Blue Summary Card */}
          <View style={styles.summaryCard}>
            {/* Left Column: Montant à recevoir */}
            <View style={styles.summaryLeftCol}>
              <Text style={styles.summaryLabel}>Montant à recevoir</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountMainText}>2 000</Text>
                <Text style={styles.amountCurrencyText}> XOF</Text>
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabelText}>Vous encaisserez : </Text>
                <Text style={styles.detailValueText}>0,0033 USDT</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabelText}>Frais de transaction : </Text>
                <Text style={styles.detailValueText}>0,0001 USDT</Text>
              </View>
            </View>

            <View style={styles.verticalDivider} />

            {/* Right Column: Vous recevrez & Network */}
            <View style={styles.summaryRightCol}>
              <Text style={styles.summaryLabel}>Vous recevrez</Text>
              <View style={styles.tokenPillBadge}>
                <CryptoIcon symbol="USDT" size={20} />
                <Text style={styles.tokenPillText}>USDT</Text>
              </View>

              <View style={styles.networkBox}>
                <Text style={styles.networkLabel}>Réseau</Text>
                <View style={styles.networkValueRow}>
                  <CryptoIcon symbol="POL" size={16} />
                  <Text style={styles.networkNameText}>Polygon</Text>
                </View>
              </View>
            </View>
          </View>

          {/* QR Code Container Box */}
          <View style={styles.qrSectionWrapper}>
            <View style={styles.qrCardContainer}>
              <View style={styles.mockQrGraphic}>
                <Ionicons name="qr-code-outline" size={170} color="#1A2840" />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.refreshQrBtn} 
              onPress={() => navigation.navigate('CashierSuccessScreen')}
              activeOpacity={0.7}
            >
              <Ionicons name="scan-outline" size={16} color="#0052FF" style={{ marginRight: 6 }} />
              <Text style={styles.refreshQrText}>Actualiser le QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* Status Banner: En attente du paiement */}
          <View style={styles.statusBannerCard}>
            <View style={styles.statusClockIconCircle}>
              <Ionicons name="time-outline" size={20} color="#0052FF" />
            </View>

            <View style={styles.statusContentGroup}>
              <Text style={styles.statusTitle}>En attente du paiement</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.statusSubtext}>Le QR Code expirera dans </Text>
                <Text style={styles.statusTimerText}>04:52</Text>
              </View>
            </View>

            <View style={styles.spinnerGraphicBox}>
              <Ionicons name="sparkles-outline" size={22} color="#0052FF" />
            </View>
          </View>

          {/* Warning Banner: Gardez l'application ouverte */}
          <View style={styles.warningBannerCard}>
            <View style={styles.warningShieldIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.warningContentGroup}>
              <Text style={styles.warningTitleText}>Gardez l'application ouverte</Text>
              <Text style={styles.warningSubtextText}>
                Ne fermez pas cette page avant d'avoir{'\n'}reçu le paiement.
              </Text>
            </View>
          </View>

          {/* Cancel Transaction Button */}
          <TouchableOpacity 
            style={styles.btnCancelTransaction} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="close-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.btnCancelText}>Annuler la transaction</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 10 },
  iconSquareBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#1A2840' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 6, paddingBottom: 30, paddingHorizontal: 16 },
  titleSection: { alignItems: 'center', marginBottom: 16 },
  mainTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840', marginBottom: 4 },
  subTitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  summaryCard: { flexDirection: 'row', backgroundColor: '#071D54', borderRadius: 20, padding: 16, marginBottom: 20 },
  summaryLeftCol: { flex: 1.2 },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  amountMainText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#FFC759' },
  amountCurrencyText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#FFFFFF' },
  dividerLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  detailLabelText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF' },
  detailValueText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: '#FFC759' },
  verticalDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 12 },
  summaryRightCol: { flex: 0.8 },
  tokenPillBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 10 },
  tokenPillText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#FFFFFF', marginLeft: 6 },
  networkBox: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  networkLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#9CA3AF', marginBottom: 2 },
  networkValueRow: { flexDirection: 'row', alignItems: 'center' },
  networkNameText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#FFFFFF', marginLeft: 4 },
  qrSectionWrapper: { alignItems: 'center', marginBottom: 20 },
  qrCardContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, marginBottom: 12, borderWidth: 1, borderColor: '#F0F2F5' },
  mockQrGraphic: { justifyContent: 'center', alignItems: 'center' },
  refreshQrBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  refreshQrText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#0052FF' },
  statusBannerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F6FF', borderRadius: 16, padding: 14, marginBottom: 12 },
  statusClockIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E0EDFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statusContentGroup: { flex: 1 },
  statusTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  statusSubtext: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  statusTimerText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#0052FF' },
  spinnerGraphicBox: { justifyContent: 'center', alignItems: 'center', paddingLeft: 8 },
  warningBannerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 16, padding: 14, marginBottom: 16 },
  warningShieldIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  warningContentGroup: { flex: 1 },
  warningTitleText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  warningSubtextText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 15 },
  btnCancelTransaction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA', height: 48, borderRadius: 12 },
  btnCancelText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#EF4444' }
});
