import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WithdrawFundsMobileMoneyProcessingScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => navigation.navigate('WithdrawFundsMobileMoneySuccessScreen'), 3500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Retirer des fonds vers Mobile Money</Text>
          <TouchableOpacity style={styles.iconCircleBtn}>
            <Ionicons name="headset-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 5-Step Horizontal Stepper (Step 4 Active) */}
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

          {/* Titles & Step Indicator */}
          <Text style={styles.stepOverTitle}>Étape 4/5</Text>
          <Text style={styles.mainTitle}>Retrait en cours</Text>
          <Text style={styles.mainSubtitle}>
            Votre transaction est en cours de traitement.{'\n'}Veuillez ne pas quitter cette page.
          </Text>

          {/* Main Card Container */}
          <View style={styles.mainCard}>
            
            {/* Background decorative circles */}
            <View style={styles.bgDecorativeCircle1} />
            <View style={styles.bgDecorativeCircle2} />

            <View style={styles.nodesContainer}>
              {/* Stage 1: DZY Wallet (Completed) */}
              <View style={styles.nodeCard}>
                <View style={styles.nodeLeft}>
                  <View style={styles.nodeIconBox}>
                    <Ionicons name="wallet-outline" size={22} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.nodeTitle}>DZY Wallet</Text>
                    <Text style={styles.nodeSubtitle}>Vérification de solde</Text>
                  </View>
                </View>
                <View style={styles.checkCircleDone}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              </View>

              {/* Dotted Arrow Down */}
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={16} color="#FFC759" />
              </View>

              {/* Stage 2: Traitement en cours - Polygon (Active) */}
              <View style={styles.nodeCard}>
                <View style={styles.nodeLeft}>
                  <View style={styles.nodeIconBox}>
                    <Ionicons name="hourglass-outline" size={22} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.nodeTitle}>Traitement en cours</Text>
                    <Text style={styles.nodeSubtitle}>Réseau blockchain Polygon</Text>
                  </View>
                </View>
                <View style={styles.spinnerCircle} />
              </View>

              {/* Dotted Arrow Down */}
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={16} color="#FFC759" />
              </View>

              {/* Stage 3: Mixx by Yas (Togo) (Pending) */}
              <View style={styles.nodeCard}>
                <View style={styles.nodeLeft}>
                  <View style={styles.nodeIconBox}>
                    <Ionicons name="business-outline" size={22} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.nodeTitle}>Mixx by Yas (Togo)</Text>
                    <Text style={styles.nodeSubtitle}>Envoi vers Mobile Money</Text>
                  </View>
                </View>
                <View style={styles.spinnerCircleLight} />
              </View>
            </View>

            {/* Traitement en cours... Banner Box */}
            <View style={styles.statusBanner}>
              <View style={styles.statusHeader}>
                <View style={styles.clockIconContainer}>
                  <Ionicons name="time-outline" size={24} color="#F59E0B" />
                </View>
                <View style={styles.statusHeaderTextContainer}>
                  <Text style={styles.statusTitle}>Traitement en cours...</Text>
                  <Text style={styles.statusDesc}>
                    Votre retrait est en cours de traitement.{'\n'}Merci de patienter quelques instants.
                  </Text>
                </View>
              </View>

              <View style={styles.statusDivider} />

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

          {/* Notification Info Banner Card */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information-circle" size={20} color="#475569" />
            </View>
            <Text style={styles.infoBannerText}>
              Vous recevrez une notification dès que le retrait sera finalisé avec succès.
            </Text>
          </View>

          {/* Footer Badge (Sécurisé par DizzitUp) */}
          <View style={styles.footerBadge}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#1A2840" style={{ marginRight: 6 }} />
            <Text style={styles.footerBadgeText}>Sécurisé par DizzitUp</Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  iconCircleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, paddingHorizontal: 20 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { backgroundColor: '#FFC759' },
  stepNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#9CA3AF' },
  stepNumberActive: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#1A2840' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#F1F5F9', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: '#FFC759' },
  stepOverTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#F59E0B', marginBottom: 4 },
  mainTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840', marginBottom: 6 },
  mainSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 20 },
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F0F2F5', padding: 14, marginBottom: 16, position: 'relative', overflow: 'hidden' },
  bgDecorativeCircle1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(255, 199, 89, 0.12)', borderStyle: 'dashed', top: '15%', left: '50%', marginLeft: -120 },
  bgDecorativeCircle2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255, 199, 89, 0.18)', borderStyle: 'dashed', top: '25%', left: '50%', marginLeft: -80 },
  nodesContainer: { paddingVertical: 10, zIndex: 1 },
  nodeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  nodeLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  nodeIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  nodeTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  nodeSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  checkCircleDone: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center' },
  spinnerCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: '#FEF3C7', borderTopColor: '#F59E0B' },
  spinnerCircleLight: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: '#FEF3C7', borderTopColor: '#FFC759' },
  arrowContainer: { alignItems: 'center', paddingVertical: 6, zIndex: 1 },
  statusBanner: { backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 16, padding: 14, marginTop: 14, zIndex: 1 },
  statusHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  clockIconContainer: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statusHeaderTextContainer: { flex: 1 },
  statusTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  statusDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 15 },
  statusDivider: { height: 1, backgroundColor: '#FEF3C7', marginBottom: 10 },
  statusStatsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  statCol: { flex: 1, alignItems: 'center' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', marginBottom: 2 },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  statValueYellow: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#F59E0B' },
  statDividerVertical: { width: 1, height: 26, backgroundColor: '#FEF3C7' },
  infoBanner: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, alignItems: 'center', marginBottom: 16 },
  infoIconCircle: { marginRight: 10 },
  infoBannerText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#475569', lineHeight: 15 },
  footerBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFC759', paddingVertical: 12, borderRadius: 14 },
  footerBadgeText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' }
});
