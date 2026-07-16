import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';

export default function PaymentInProgressScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement en cours</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="headset-outline" size={24} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Status Text */}
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Votre paiement est en cours</Text>
          <Text style={styles.statusSubtitle}>
            Ne quittez pas l'application.{'\n'}
            La transaction est en cours de traitement sur la blockchain.
          </Text>
        </View>

        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          
          <View style={styles.stepItem}>
            <View style={[styles.stepIconCircle, styles.stepIconCircleCompleted]}>
              <Ionicons name="wallet-outline" size={24} color="#10B981" />
              <View style={[styles.stepBadge, {backgroundColor: '#10B981'}]}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.stepTitleCompleted}>DZY Wallet</Text>
            <Text style={styles.stepSubtitle}>Paiement initié</Text>
          </View>
          
          <View style={[styles.stepLine, styles.stepLineCompleted]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepIconCircle, styles.stepIconCircleInProgress]}>
              <Ionicons name="document-text-outline" size={24} color="#F59E0B" />
              <View style={[styles.stepBadge, {backgroundColor: '#F59E0B'}]}>
                <Ionicons name="time-outline" size={10} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.stepTitleInProgress}>Smart Contract</Text>
            <Text style={styles.stepSubtitle}>En traitement</Text>
          </View>
          
          <View style={[styles.stepLine, styles.stepLinePending]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepIconCircle, styles.stepIconCirclePending]}>
              <Ionicons name="storefront-outline" size={24} color="#64748B" />
            </View>
            <Text style={styles.stepTitlePending}>Jumia Sénégal</Text>
            <Text style={styles.stepSubtitle}>En attente</Text>
          </View>

        </View>

        {/* Détails de la transaction */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>Détails de la transaction</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="scan-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Vous payez</Text>
            </View>
            <View style={styles.detailValueRow}>
              <CryptoIcon symbol="USDC" size={24} />
              <Text style={styles.detailValue}>38,95 USDC</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="cube-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Réseau</Text>
            </View>
            <View style={styles.detailValueRow}>
              <CryptoIcon symbol="POL" size={24} />
              <Text style={styles.detailValue}>Polygon</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="person-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Adresse du vendeur</Text>
            </View>
            <Text style={styles.detailValue}>jumia.sn</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="calendar-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Commande</Text>
            </View>
            <Text style={styles.detailValue}>JM-2026-000152</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="time-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.detailLabel}>Statut</Text>
            </View>
            <View style={styles.statusBadgeYellow}>
              <Text style={styles.statusBadgeTextYellow}>En cours</Text>
            </View>
          </View>

        </View>

        {/* Confirmation blockchain */}
        <View style={styles.cardSection}>
          <View style={styles.blockchainHeader}>
            <Text style={styles.cardTitle}>Confirmation blockchain</Text>
            <View style={styles.networkBadge}>
              <CryptoIcon symbol="POL" size={20} />
              <Text style={styles.networkBadgeText}>Polygon</Text>
            </View>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>En attente de confirmations réseau...</Text>
            <Text style={styles.progressValue}>Confirmation <Text style={styles.progressValueHighlight}>2 / 6</Text></Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color="#3B82F6" style={{marginBottom: 4}} />
              <Text style={styles.statLabel}>Temps estimé</Text>
              <Text style={styles.statValue}>~ 45 secondes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#3B82F6" style={{marginBottom: 4}} />
              <Text style={styles.statLabel}>Sécurité</Text>
              <Text style={styles.statValue}>100% sécurisée</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={18} color="#3B82F6" style={{marginBottom: 4}} />
              <Text style={styles.statLabel}>Bloc actuel</Text>
              <Text style={styles.statValue}>#57,892,431</Text>
            </View>
          </View>
        </View>

        {/* Security Note Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.securityBannerIcon}>
            <Ionicons name="lock-closed-outline" size={20} color="#1A2840" />
          </View>
          <View style={styles.securityBannerContent}>
            <Text style={styles.securityBannerText}>Votre paiement est sécurisé par un smart contract.{'\n'}Le vendeur recevra les fonds après confirmation de la transaction sur la blockchain.</Text>
          </View>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.navigate('PaymentSuccessScreen')}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
          <Text style={styles.btnCancelText}>Simuler la confirmation du paiement</Text>
        </TouchableOpacity>

      </ScrollView>
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
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
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
  statusHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  statusTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginBottom: 12,
  },
  statusSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
    lineHeight: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    width: 80,
  },
  stepIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    position: 'relative',
  },
  stepIconCircleCompleted: {
    borderColor: '#10B981',
  },
  stepIconCircleInProgress: {
    borderColor: '#F59E0B',
  },
  stepIconCirclePending: {
    borderColor: '#E2E8F0',
  },
  stepBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepTitleCompleted: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepTitleInProgress: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepTitlePending: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: 28,
    marginHorizontal: -8,
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  stepLinePending: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  cardSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
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
  tokenIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  statusBadgeYellow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeTextYellow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#D97706',
  },
  blockchainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tokenIconSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  tokenIconTextSmall: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  networkBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8B5CF6',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  progressValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  progressValueHighlight: {
    fontFamily: 'Inter_700Bold',
    color: '#3B82F6',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '33%', // Confirmation 2/6
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1A2840',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  securityBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFDCA8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityBannerContent: {
    flex: 1,
  },
  securityBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#1A2840',
    lineHeight: 18,
  },
  btnCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  btnCancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#3B82F6',
  },
});
