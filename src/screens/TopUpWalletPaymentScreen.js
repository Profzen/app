import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TopUpWalletPaymentScreen() {
  const navigation = useNavigation();
  React.useEffect(() => {
    const timer = setTimeout(() => navigation.navigate('TopUpWalletConfirmationScreen'), 2500);
    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Recharger le portefeuille</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Progress Stepper (5 steps) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Ionicons name="checkmark" size={16} color="#FFB800" />
                <View style={styles.tinyCheckBadge}>
                  <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.stepText}>Mode de paiement</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Ionicons name="checkmark" size={16} color="#FFB800" />
                <View style={styles.tinyCheckBadge}>
                  <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.stepText}>Détails</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Ionicons name="checkmark" size={16} color="#FFB800" />
                <View style={styles.tinyCheckBadge}>
                  <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.stepText}>Résumé</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, styles.stepNumberActive]}>4</Text>
              </View>
              <Text style={[styles.stepText, styles.stepTextActive]}>Paiement</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepWrapper}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>Confirmation</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.mainTitle}>Paiement en cours</Text>
          <Text style={styles.mainSubtitle}>
            Nous traitons votre paiement en toute sécurité.{'\n'}Veuillez ne pas quitter cette page.
          </Text>

          {/* Horizontal Flow Diagram */}
          <View style={styles.flowContainer}>
            {/* Left Node */}
            <View style={styles.nodeItem}>
              <View style={styles.nodeIconSquare}>
                <View style={styles.mockCreditCard}>
                  <View style={styles.mockCardChip} />
                  <View style={styles.mockCardCircles}>
                    <View style={[styles.mockCardCircle, {backgroundColor: '#EB001B', zIndex: 2}]} />
                    <View style={[styles.mockCardCircle, {backgroundColor: '#F79E1B', marginLeft: -6, zIndex: 1}]} />
                  </View>
                </View>
              </View>
              <Text style={styles.nodeTitle}>Carte bancaire</Text>
            </View>

            {/* Dotted Line */}
            <View style={styles.horizontalDottedLine}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Center Node */}
            <View style={styles.centerNodeWrapper}>
              <View style={styles.pulseCircleOuter}>
                <View style={styles.pulseCircleInner}>
                  <View style={styles.crossmintShield}>
                    <Ionicons name="flash" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.crossmintTextBold}>crossmint</Text>
                  <Text style={styles.pulseSubtitle}>Vérification{'\n'}sécurisée</Text>
                </View>
              </View>
            </View>

            {/* Dotted Line */}
            <View style={styles.horizontalDottedLine}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Right Node */}
            <View style={styles.nodeItem}>
              <View style={styles.nodeIconCircle}>
                <Text style={{color: '#FFB800', fontSize: 24, fontWeight: 'bold'}}>Ð</Text>
              </View>
              <Text style={styles.nodeTitle}>DZY Wallet</Text>
            </View>
          </View>

          {/* Verification Banner */}
          <View style={styles.verificationBanner}>
            <View style={styles.spinnerIcon}>
              {/* Static representation of a spinner */}
              <View style={styles.spinnerCircle} />
            </View>
            <View style={styles.verificationContent}>
              <Text style={styles.verificationTitle}>Vérification de votre paiement...</Text>
              <Text style={styles.verificationDesc}>
                Votre banque et Crossmint confirment{'\n'}actuellement la transaction.
              </Text>
            </View>
          </View>

          {/* Details List */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="time-outline" size={20} color="#1A2840" style={{marginRight: 12}} />
                <Text style={styles.detailLabel}>Temps estimé</Text>
              </View>
              <Text style={styles.detailValueBold}>Moins de 2 minutes</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="lock-closed-outline" size={20} color="#3B82F6" style={{marginRight: 12}} />
                <Text style={styles.detailLabel}>Montant à payer</Text>
              </View>
              <Text style={styles.detailValueBold}>10,50 USD</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#1A2840" style={{marginRight: 12}} />
                <Text style={styles.detailLabel}>Transaction sécurisée par</Text>
              </View>
              <View style={styles.crossmintLogoSmall}>
                <Ionicons name="flower" size={16} color="#10B981" />
                <Text style={styles.crossmintTextSmall}>crossmint</Text>
              </View>
            </View>
          </View>

          {/* Security Banner Max */}
          <View style={styles.securityBannerMax}>
            <View style={styles.maxShieldContainer}>
              <Ionicons name="shield" size={32} color="#FFB800" />
              <Ionicons name="flash" size={16} color="#FFFFFF" style={{position: 'absolute'}} />
            </View>
            <View style={styles.maxSecurityContent}>
              <Text style={styles.maxSecurityTitle}>Sécurité maximale</Text>
              <Text style={styles.maxSecurityDesc}>
                Vos informations bancaires sont protégées par{'\n'}un chiffrement de niveau bancaire.
              </Text>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 50,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  stepCircleActive: {
    borderColor: '#FFB800',
  },
  stepCircleCompleted: {
    borderColor: '#FFB800',
  },
  tinyCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFB800',
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFB800',
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#FFB800',
    fontFamily: 'Inter_600SemiBold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 13,
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  flowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  nodeItem: {
    alignItems: 'center',
    width: 80,
  },
  nodeIconSquare: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mockCreditCard: {
    width: 40,
    height: 28,
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
    padding: 4,
    justifyContent: 'space-between',
  },
  mockCardChip: {
    width: 10,
    height: 6,
    backgroundColor: '#FFB800',
    borderRadius: 1,
  },
  mockCardCircles: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  mockCardCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A2840',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nodeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
  },
  horizontalDottedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    marginTop: -24,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFB800',
    marginHorizontal: 2,
  },
  centerNodeWrapper: {
    alignItems: 'center',
    marginTop: -24, // adjust alignment
  },
  pulseCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'rgba(255, 184, 0, 0.2)', // Light yellow outer ring
    borderTopColor: '#FFB800', // Highlight part of the ring
    borderRightColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }], // Rotate to make highlight start from top right
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pulseCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }], // Counter-rotate the content
  },
  crossmintShield: {
    width: 32,
    height: 36,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  crossmintTextBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  pulseSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  verificationBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  spinnerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  spinnerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#DBEAFE',
    borderLeftColor: '#3B82F6',
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  verificationDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
  detailValueBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  crossmintLogoSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossmintTextSmall: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginLeft: 4,
  },
  securityBannerMax: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  maxShieldContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  maxSecurityContent: {
    flex: 1,
  },
  maxSecurityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  maxSecurityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});
