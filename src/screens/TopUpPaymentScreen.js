import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopUpPaymentScreen() {
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
          <Text style={styles.pageTitle}>Recharger</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="help-circle-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Progress Stepper */}
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
          </View>

          {/* Titles */}
          <Text style={styles.mainTitle}>Paiement en cours</Text>
          <Text style={styles.mainSubtitle}>
            Nous envoyons votre demande de paiement{'\n'}à Mixx by Yas.{'\n'}Veuillez valider le paiement sur votre téléphone.
          </Text>

          {/* Main Card: Transaction Flow */}
          <View style={styles.flowCard}>
            
            {/* Top Node: DZYwallet */}
            <View style={styles.nodeContainer}>
              <View style={styles.nodeIconCircle}>
                <Ionicons name="wallet" size={24} color="#1E3A8A" />
              </View>
              <Text style={styles.nodeTitle}>DZYwallet</Text>
              <Text style={styles.nodeSubtitle}>Source des fonds</Text>
            </View>

            {/* Dotted Line */}
            <View style={styles.dottedLineContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Center Node: Loading / Waiting */}
            <View style={styles.centerNodeWrapper}>
              <View style={styles.pulseCircleOuter}>
                <View style={styles.pulseCircleInner}>
                  <Ionicons name="phone-portrait-outline" size={32} color="#FFB800" style={{marginBottom: 8}} />
                  <Ionicons name="wifi-outline" size={20} color="#FFB800" style={{position: 'absolute', top: 32}} />
                  <Text style={styles.pulseTitle}>En attente de{'\n'}confirmation</Text>
                  <Text style={styles.pulseSubtitle}>sur votre téléphone</Text>
                </View>
              </View>
            </View>

            {/* Dotted Line */}
            <View style={styles.dottedLineContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Bottom Node: Mixx by Yas */}
            <View style={styles.nodeContainer}>
              <View style={[styles.nodeIconCircle, {backgroundColor: '#FFD646'}]}>
                <Text style={{color: '#6B21A8', fontSize: 12, fontWeight: '900', fontStyle: 'italic'}}>mixx</Text>
                <Text style={{color: '#6B21A8', fontSize: 8, fontWeight: '700'}}>by yas</Text>
              </View>
              <Text style={styles.nodeTitle}>Mixx by Yas</Text>
              <Text style={styles.nodeSubtitle}>Destination</Text>
            </View>

          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.shieldIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Transaction sécurisée</Text>
              <Text style={styles.securityDesc}>
                Ne quittez pas cette page.{'\n'}Votre paiement est en cours de traitement.
              </Text>
            </View>
          </View>

          {/* Bottom Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={24} color="#1A2840" style={{marginRight: 12}} />
              <View>
                <Text style={styles.infoLabel}>Temps estimé</Text>
                <Text style={styles.infoValue}>Moins de 2 minutes</Text>
              </View>
            </View>

            <View style={[styles.infoCard, {marginLeft: 12}]}>
              <Ionicons name="lock-closed-outline" size={24} color="#3B82F6" style={{marginRight: 12}} />
              <View>
                <Text style={styles.infoLabel}>Montant à payer</Text>
                <Text style={styles.infoValueBold}>6 663 XOF</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
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
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
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
    paddingHorizontal: 10,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 14,
    color: '#94A3B8',
  },
  stepNumberActive: {
    color: '#FFB800',
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
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
    marginTop: 15,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 12,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  flowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  nodeContainer: {
    alignItems: 'center',
  },
  nodeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nodeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
    marginBottom: 4,
  },
  nodeSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#94A3B8',
  },
  dottedLineContainer: {
    height: 40,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFB800',
  },
  centerNodeWrapper: {
    marginVertical: 8,
  },
  pulseCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'rgba(255, 184, 0, 0.2)', // Light yellow outer ring
    borderTopColor: '#FFB800', // Highlight part of the ring
    borderRightColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }], // Rotate to make highlight start from top right
  },
  pulseCircleInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }], // Counter-rotate the content
  },
  pulseTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  pulseSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  shieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE', // lighter blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  securityDesc: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  infoLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  infoValueBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
});
