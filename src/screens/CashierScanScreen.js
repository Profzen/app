import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function CashierScanScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Caisse (TPE)</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Titles */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Scannez pour payer</Text>
          <Text style={styles.subTitle}>Montrez ce QR Code à votre client pour qu'il effectue le paiement.</Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountLeft}>
            <Text style={styles.amountLabel}>Montant à recevoir</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountValueMain}>2 000</Text>
              <Text style={styles.amountValueCurrency}> XOF</Text>
            </View>
            <View style={styles.dividerDark} />
            <Text style={styles.amountValueSub}>≈ 0,0034 USDT</Text>
          </View>
          
          <View style={styles.amountDividerVertical} />
          
          <View style={styles.amountRight}>
            <Text style={styles.amountLabel}>Vous recevrez</Text>
            <View style={styles.tokenBadge}>
              <View style={[styles.tokenIconSmall, {backgroundColor: '#10B981'}]}><Text style={styles.tokenIconTextSmall}>₮</Text></View>
              <Text style={styles.tokenBadgeText}>USDT</Text>
            </View>
            <View style={styles.networkBox}>
              <Text style={styles.networkLabelText}>Réseau</Text>
              <View style={styles.networkContent}>
                <View style={[styles.tokenIconTiny, {backgroundColor: '#8B5CF6'}]}><Text style={styles.tokenIconTextTiny}>P</Text></View>
                <Text style={styles.networkBoxText}>Polygon</Text>
              </View>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            {/* Mock QR Code Image - replace with actual QR code component like react-native-qrcode-svg */}
            <View style={styles.mockQrCode}>
              <Ionicons name="qr-code-outline" size={160} color="#1A2840" />
            </View>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => navigation.navigate('CashierSuccessScreen')}>
            <Ionicons name="scan-outline" size={16} color="#1A2840" style={{marginRight: 6}} />
            <Text style={styles.refreshBtnText}>Simuler le paiement</Text>
          </TouchableOpacity>
        </View>

        {/* Waiting Banner */}
        <View style={styles.waitingBanner}>
          <View style={styles.waitingIconCircle}>
            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.waitingContent}>
            <Text style={styles.waitingTitle}>En attente du paiement</Text>
            <Text style={styles.waitingText}>Le QR Code expirera dans</Text>
            <Text style={styles.waitingTime}>04:52</Text>
          </View>
          <View style={styles.spinnerMock}>
            <Ionicons name="sync" size={24} color="#3B82F6" />
          </View>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <View style={styles.warningIconCircle}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Gardez l'application ouverte</Text>
            <Text style={styles.warningText}>Ne fermez pas cette page avant d'avoir reçu le paiement.</Text>
          </View>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color="#EF4444" style={{marginRight: 8}} />
          <Text style={styles.btnCancelText}>Annuler la transaction</Text>
        </TouchableOpacity>

      </ScrollView>
      
      <BottomNavBar activeTab="swap" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginBottom: 8,
  },
  subTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  amountCard: {
    flexDirection: 'row',
    backgroundColor: '#0A1128', // Dark blue
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  amountLeft: {
    flex: 1,
  },
  amountLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountValueMain: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#FFB800',
  },
  amountValueCurrency: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  dividerDark: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 12,
    marginRight: 16,
  },
  amountValueSub: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFB800',
  },
  amountDividerVertical: {
    width: 1,
    backgroundColor: '#1E293B',
    marginHorizontal: 8,
  },
  amountRight: {
    flex: 1,
    paddingLeft: 8,
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  tokenIconSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tokenIconTextSmall: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tokenBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  networkBox: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  networkLabelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
  },
  networkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIconTiny: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  tokenIconTextTiny: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  networkBoxText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  mockQrCode: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  waitingIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  waitingContent: {
    flex: 1,
  },
  waitingTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  waitingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  waitingTime: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#3B82F6',
  },
  spinnerMock: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  warningIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  warningText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 18,
  },
  btnCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  btnCancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
  },
});
