import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import BottomNavBar from '../components/BottomNavBar';

export default function CashierSuccessScreen() {
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
        
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            {/* Confetti mock - simple colored dots could be absolute positioned, or just the main icon */}
            <View style={[styles.confettiDot, { backgroundColor: '#FFB800', top: 10, left: -20 }]} />
            <View style={[styles.confettiDot, { backgroundColor: '#3B82F6', top: -10, left: 10 }]} />
            <View style={[styles.confettiDot, { backgroundColor: '#10B981', top: 5, right: -15 }]} />
            <View style={[styles.confettiDot, { backgroundColor: '#FFB800', bottom: 10, right: -25 }]} />
            <View style={[styles.confettiDot, { backgroundColor: '#3B82F6', bottom: -5, left: -10 }]} />
            
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.successTitle}>Paiement reçu avec succès !</Text>
          <Text style={styles.successSubtitle}>Le paiement a été confirmé.{'\n'}Merci.</Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountLeft}>
            <Text style={styles.amountLabel}>Montant reçu</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountValueMain}>2 000</Text>
              <Text style={styles.amountValueCurrency}> XOF</Text>
            </View>
            <View style={styles.dividerDark} />
            <Text style={styles.amountValueSub}>≈ 0,0034 USDT</Text>
          </View>
          
          <View style={styles.amountDividerVertical} />
          
          <View style={styles.amountRight}>
            <Text style={styles.amountLabel}>Vous avez reçu</Text>
            <View style={styles.tokenBadge}>
              <CryptoIcon symbol="USDT" size={28} />
              <Text style={styles.tokenBadgeText}>USDT</Text>
            </View>
            <View style={styles.networkBox}>
              <Text style={styles.networkLabelText}>Réseau</Text>
              <View style={styles.networkContent}>
                <CryptoIcon symbol="POL" size={20} />
                <Text style={styles.networkBoxText}>Polygon</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>Détails de la transaction</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="calendar-outline" size={16} color="#3B82F6" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Date et heure</Text>
            </View>
            <Text style={styles.detailValue}>30 Mai 2025 à 09:42</Text>
          </View>
          
          <View style={styles.dividerLight} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="pricetag-outline" size={16} color="#3B82F6" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>ID de transaction</Text>
            </View>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>0x7a3f...e9b2c4d</Text>
              <Ionicons name="copy-outline" size={14} color="#1A2840" style={{marginLeft: 6}} />
            </View>
          </View>
          
          <View style={styles.dividerLight} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="wallet-outline" size={16} color="#3B82F6" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Méthode de paiement</Text>
            </View>
            <Text style={styles.detailValue}>Caisse (TPE)</Text>
          </View>
          
          <View style={styles.dividerLight} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="git-network-outline" size={16} color="#3B82F6" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Réseau</Text>
            </View>
            <Text style={styles.detailValue}>Polygon</Text>
          </View>
          
          <View style={styles.dividerLight} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="document-text-outline" size={16} color="#3B82F6" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Statut</Text>
            </View>
            <View style={styles.statusBadgeGreen}>
              <Text style={styles.statusBadgeTextGreen}>Réussi •</Text>
            </View>
          </View>
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.securityIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Transaction sécurisée</Text>
            <Text style={styles.securityText}>Vos fonds sont protégés par un chiffrement de niveau bancaire et des partenaires de confiance.</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.btnReceipt} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
          <Ionicons name="receipt-outline" size={20} color="#1A2840" style={{position: 'absolute', left: 20}} />
          <Text style={styles.btnReceiptText}>Voir le reçu</Text>
          <Ionicons name="arrow-forward" size={20} color="#1A2840" style={{position: 'absolute', right: 20}} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnNewTransaction} onPress={() => navigation.navigate('CashierScanScreen')}>
          <Text style={styles.btnNewTransactionText}>Nouvelle transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnReturn} onPress={() => navigation.navigate('CashRegisterScreen')}>
          <Text style={styles.btnReturnText}>Retour à la caisse</Text>
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
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 16,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  confettiDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  successTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
    lineHeight: 20,
  },
  amountCard: {
    flexDirection: 'row',
    backgroundColor: '#0A1128',
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
    color: '#10B981', // Green
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
    color: '#10B981', // Green
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
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailsCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  statusBadgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  statusBadgeTextGreen: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#10B981',
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5', // Light green
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  securityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  securityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    lineHeight: 18,
  },
  btnReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    position: 'relative',
  },
  btnReceiptText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  btnNewTransaction: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFB800',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  btnNewTransactionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
  btnReturn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  btnReturnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
});
