import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WithdrawFundsMobileMoneyProcessingScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Retirer des fonds vers Mobile Money</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="headset-outline" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Simple Stepper (1 to 5) */}
          <View style={styles.stepperContainer}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>1</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>2</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>3</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>4</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>5</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.stepOverTitle}>Étape 4/5</Text>
          <Text style={styles.mainTitle}>Retrait en cours</Text>
          <Text style={styles.mainSubtitle}>
            Votre transaction est en cours de traitement.{'\n'}Veuillez ne pas quitter cette page.
          </Text>

          {/* Main Card with Background Effect */}
          <View style={styles.mainCard}>
            
            {/* Background decorative circles (simulated) */}
            <View style={styles.bgDecorativeCircle1} />
            <View style={styles.bgDecorativeCircle2} />
            <View style={styles.bgDecorativeCircle3} />

            <View style={styles.nodesContainer}>
              {/* Node 1 */}
              <View style={styles.nodeCard}>
                <View style={styles.nodeLeft}>
                  <View style={[styles.nodeIconCircle, {backgroundColor: '#FFFBEB'}]}>
                    <Ionicons name="wallet" size={20} color="#FFB800" />
                  </View>
                  <View>
                    <Text style={styles.nodeTitle}>DZY Wallet</Text>
                    <Text style={styles.nodeSubtitle}>Vérification du solde</Text>
                  </View>
                </View>
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                </View>
              </View>

              {/* Arrow Down */}
              <View style={styles.arrowContainer}>
                <View style={styles.dottedLineVertical} />
                <Ionicons name="chevron-down" size={16} color="#FFB800" style={styles.arrowIcon} />
              </View>

              {/* Node 2 */}
              <View style={styles.nodeCard}>
                <View style={styles.nodeLeft}>
                  <View style={[styles.nodeIconCircle, {backgroundColor: '#F3E8FF'}]}>
                    <View style={styles.polygonBadge}>
                      <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>∞</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.nodeTitle}>Traitement sur le réseau{'\n'}blockchain Polygon</Text>
                    <Text style={styles.nodeSubtitle}>Transaction en cours</Text>
                  </View>
                </View>
                <View style={styles.spinnerCircle} />
              </View>

              {/* Arrow Down */}
              <View style={styles.arrowContainer}>
                <View style={styles.dottedLineVertical} />
                <Ionicons name="chevron-down" size={16} color="#FFB800" style={styles.arrowIcon} />
              </View>

              {/* Node 3 */}
              <View style={styles.nodeCard}>
                <View style={styles.nodeLeft}>
                  <View style={[styles.nodeIconCircle, {backgroundColor: '#FFFBEB'}]}>
                    <Ionicons name="business" size={20} color="#FFB800" />
                  </View>
                  <View>
                    <Text style={styles.nodeTitle}>Mixx by Yas (Togo)</Text>
                    <Text style={styles.nodeSubtitle}>Envoi vers Mobile Money</Text>
                  </View>
                </View>
                <View style={styles.spinnerCircle} />
              </View>
            </View>

            {/* Status Banner */}
            <View style={styles.statusBanner}>
              <View style={styles.statusHeader}>
                <View style={styles.clockIconContainer}>
                  <Ionicons name="time-outline" size={24} color="#FFB800" />
                </View>
                <View style={styles.statusHeaderTextContainer}>
                  <Text style={styles.statusTitle}>Traitement en cours...</Text>
                  <Text style={styles.statusDesc}>
                    Votre retrait est en cours de traitement.{'\n'}Merci de patienter quelques instants.
                  </Text>
                </View>
              </View>

              <View style={styles.statusStatsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Temps estimé</Text>
                  <Text style={styles.statValue}>2 à 5 minutes</Text>
                </View>
                <View style={styles.statDividerVertical} />
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Statut</Text>
                  <Text style={styles.statValueYellow}>En cours</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.infoBannerText}>
              Vous recevrez une notification dès que le retrait sera finalisé avec succès.
            </Text>
          </View>

          {/* Footer Badge (Not a button to click) */}
          <View style={styles.footerBadge}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" style={{marginRight: 8}} />
            <Text style={styles.footerBadgeText}>Sécurisé par DizzitUp</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFB800',
  },
  stepNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#FFB800',
  },
  stepOverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFB800',
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.1)',
    borderStyle: 'dashed',
    top: '20%',
    left: '50%',
    marginLeft: -150,
  },
  bgDecorativeCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.15)',
    borderStyle: 'dashed',
    top: '28%',
    left: '50%',
    marginLeft: -110,
  },
  bgDecorativeCircle3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.2)',
    borderStyle: 'dashed',
    top: '36%',
    left: '50%',
    marginLeft: -70,
  },
  nodesContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    zIndex: 1,
  },
  nodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  nodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nodeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  polygonBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  nodeSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    borderTopColor: '#FFB800',
    borderRightColor: '#FFB800',
  },
  arrowContainer: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    zIndex: 0,
  },
  dottedLineVertical: {
    width: 2,
    height: 30,
    borderWidth: 1,
    borderColor: '#FFB800',
    borderStyle: 'dashed',
    position: 'absolute',
    top: -5,
  },
  arrowIcon: {
    position: 'absolute',
    bottom: -5,
  },
  statusBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    zIndex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clockIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusHeaderTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  statusDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  statusStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 184, 0, 0.2)', // very light yellow border
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  statValueYellow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#D97706', // darker yellow
  },
  statDividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFB800',
    paddingVertical: 16,
    borderRadius: 16,
  },
  footerBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
});
