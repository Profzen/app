import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TopUpSummaryScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharger le portefeuille</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Ionicons name="checkmark" size={16} color="#FFB800" />
            </View>
            <Text style={styles.stepTextCompleted}>Mode de paiement</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLineCompleted]} />
          
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Ionicons name="checkmark" size={16} color="#FFB800" />
            </View>
            <Text style={styles.stepTextCompleted}>Détails</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLineCompleted]} />
          
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepTextInsideActive}>3</Text>
            </View>
            <Text style={styles.stepTextActive}>Résumé</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLinePending]} />
          
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCirclePending]}>
              <Text style={styles.stepTextInsidePending}>4</Text>
            </View>
            <Text style={styles.stepTextPending}>Paiement</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLinePending]} />
          
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCirclePending]}>
              <Text style={styles.stepTextInsidePending}>5</Text>
            </View>
            <Text style={styles.stepTextPending}>Confirmation</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Vérifiez et confirmez</Text>
          <Text style={styles.subTitle}>Vérifiez les détails de votre transaction avant de procéder au paiement.</Text>
        </View>

        {/* Détails de la transaction */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="document-text" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.cardHeaderTitle}>DÉTAILS DE LA TRANSACTION</Text>
          </View>

          <View style={styles.detailRowMain}>
            <Text style={styles.detailLabelMain}>Vous achetez</Text>
            <View style={styles.detailValueCol}>
              <Text style={styles.detailValueMain}>10 USDC</Text>
              <Text style={styles.detailValueSub}>≈ 6 500 XOF</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Réseau</Text>
            <View style={styles.networkRow}>
              <Text style={styles.networkName}>Réseau principal de base</Text>
              <View style={styles.networkIconCircle}>
                <Ionicons name="aperture" size={14} color="#3B82F6" />
              </View>
              <Text style={styles.networkToken}>USDC</Text>
            </View>
          </View>

          <View style={styles.detailRowWithIcon}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.detailLabel}>Stablecoin acheté</Text>
              <Ionicons name="information-circle-outline" size={14} color="#94A3B8" style={{marginLeft: 4}} />
            </View>
            <Text style={styles.detailValue}>+ 10,00 USDC</Text>
          </View>

          <View style={styles.detailRowWithIcon}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.detailLabel}>Frais DizzitUp</Text>
              <Ionicons name="information-circle-outline" size={14} color="#94A3B8" style={{marginLeft: 4}} />
            </View>
            <Text style={styles.detailValue}>+ 0,50 USDC</Text>
          </View>

          <View style={styles.detailRowWithIcon}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.detailLabel}>Frais réseau</Text>
              <Ionicons name="information-circle-outline" size={14} color="#94A3B8" style={{marginLeft: 4}} />
            </View>
            <Text style={styles.detailValue}>+ 0,00 USDC</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>10,50 USD</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#3B82F6" style={{marginRight: 12}} />
            <Text style={styles.infoBoxText}>
              Vous avez payé <Text style={{fontFamily: 'Inter_700Bold'}}>10,50 €</Text> et recevrez <Text style={{fontFamily: 'Inter_700Bold'}}>10,00 USDC</Text>
            </Text>
          </View>
        </View>

        {/* Méthode de paiement */}
        <View style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodLeft}>
            <View style={styles.cardIconBox}>
              <Ionicons name="card" size={24} color="#FFFFFF" />
              <View style={styles.cardIconDot} />
            </View>
            <View>
              <Text style={styles.paymentMethodTitle}>Méthode de paiement</Text>
              <Text style={styles.paymentMethodSub}>Carte bancaire •••• 4242</Text>
            </View>
          </View>
          <Text style={styles.visaText}>VISA</Text>
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#3B82F6" style={{marginRight: 12}} />
          <View style={{flex: 1}}>
            <Text style={styles.securityBannerTitle}>Paiement 100% sécurisé</Text>
            <Text style={styles.securityBannerText}>Nous n'enregistrons et ne stockons pas vos moyens de paiement. Toutes vos données sont chiffrées.</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.btnConfirm}>
          <Ionicons name="lock-closed-outline" size={20} color="#1A2840" />
          <Text style={styles.btnConfirmText}>Confirmer le paiement</Text>
          <Ionicons name="arrow-forward" size={20} color="#1A2840" />
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  stepItem: {
    alignItems: 'center',
    width: 50,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    borderWidth: 1,
    borderColor: '#FFB800',
    backgroundColor: '#FFFFFF',
  },
  stepCircleActive: {
    backgroundColor: '#FFB800',
  },
  stepCirclePending: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  stepTextInsideActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  stepTextInsidePending: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  stepTextCompleted: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    color: '#1A2840',
    textAlign: 'center',
  },
  stepTextActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#FFB800',
    textAlign: 'center',
  },
  stepTextPending: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: 13,
    marginHorizontal: -10,
  },
  stepLineCompleted: {
    backgroundColor: '#FFB800',
  },
  stepLinePending: {
    backgroundColor: '#E2E8F0',
  },
  titleSection: {
    alignItems: 'center',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    letterSpacing: 0.5,
  },
  detailRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabelMain: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
  },
  detailValueCol: {
    alignItems: 'flex-end',
  },
  detailValueMain: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  detailValueSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
    marginRight: 6,
  },
  networkIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  networkToken: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  detailRowWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
    borderStyle: 'dashed', // if possible, or just solid
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  infoBoxText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 40,
    height: 28,
    backgroundColor: '#1A2840',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  cardIconDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444', // Mastercard-like dot
  },
  paymentMethodTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  paymentMethodSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  visaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A21BA', // Visa blue
    fontStyle: 'italic',
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  securityBannerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 4,
  },
  securityBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#1A2840',
    lineHeight: 16,
  },
  btnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  btnConfirmText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
});
