import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TopUpPaymentScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => navigation.navigate('TopUpWalletConfirmationScreen'), 3500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Recharger</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={22} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 4-Step Horizontal Stepper (Step 4 Active) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleDone]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTextDone}>Mode de paiement</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineDone]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleDone]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTextDone}>Détails</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineDone]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleDone]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.stepTextDone}>Résumé</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineDone]} />
            
            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumberActive}>4</Text>
              </View>
              <Text style={styles.stepTextActive}>Paiement</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.mainTitle}>Paiement en cours</Text>
          <Text style={styles.mainSubtitle}>
            Nous envoyons votre demande de paiement{'\n'}à Mixx by Yas.{'\n'}Veuillez valider le paiement sur votre téléphone.
          </Text>

          {/* Vertical Transaction Flow Card Container */}
          <View style={styles.flowCardContainer}>
            
            {/* Top Node: Mixx by Yas (Source des fonds) */}
            <View style={styles.nodeContainer}>
              <View style={styles.mixxLogoCircle}>
                <Text style={styles.mixxLogoText}>mixx</Text>
                <Text style={styles.mixxSubText}>by yas</Text>
              </View>
              <Text style={styles.nodeTitle}>Mixx by Yas</Text>
              <Text style={styles.nodeSubtitle}>Source des fonds</Text>
            </View>

            {/* Vertical Dotted Connector */}
            <View style={styles.verticalDottedLine}>
              <View style={styles.vDot} />
              <View style={styles.vDot} />
              <View style={styles.vDot} />
            </View>

            {/* Center Circular Confirmation Gauge */}
            <View style={styles.centerGaugeContainer}>
              <View style={styles.gaugeArcCircle}>
                <View style={styles.gaugeArcYellowSegment} />
                <View style={styles.gaugeInnerContent}>
                  <View style={styles.phoneWifiIconBox}>
                    <Ionicons name="phone-portrait-outline" size={24} color="#F59E0B" />
                    <Ionicons name="wifi-outline" size={14} color="#F59E0B" style={{ position: 'absolute', top: -6 }} />
                  </View>
                  <Text style={styles.gaugeMainText}>En attente de{'\n'}confirmation</Text>
                  <Text style={styles.gaugeSubText}>sur votre téléphone</Text>
                </View>
              </View>
            </View>

            {/* Vertical Dotted Connector */}
            <View style={styles.verticalDottedLine}>
              <View style={styles.vDot} />
              <View style={styles.vDot} />
              <View style={styles.vDot} />
            </View>

            {/* Bottom Node: DZYwallet (Destination) */}
            <View style={styles.nodeContainer}>
              <View style={styles.walletLogoSquare}>
                <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.nodeTitle}>DZYwallet</Text>
              <Text style={styles.nodeSubtitle}>Destination</Text>
            </View>

          </View>

          {/* Transaction sécurisée Info Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.shieldIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#0052FF" />
            </View>
            <View style={styles.securityBannerContent}>
              <Text style={styles.securityBannerTitle}>Transaction sécurisée</Text>
              <Text style={styles.securityBannerText}>
                Ne quittez pas cette page.{'\n'}Votre paiement est en cours de traitement.
              </Text>
            </View>
          </View>

          {/* Bottom Summary Cards Row (2 Columns) */}
          <View style={styles.bottomInfoCardsRow}>
            <View style={styles.infoColCard}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="time-outline" size={18} color="#1A2840" />
              </View>
              <View style={styles.infoColTextWrap}>
                <Text style={styles.infoColLabel}>Temps estimé</Text>
                <Text style={styles.infoColValue}>Moins de 2 minutes</Text>
              </View>
            </View>

            <View style={styles.infoColCard}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="lock-closed-outline" size={18} color="#0052FF" />
              </View>
              <View style={styles.infoColTextWrap}>
                <Text style={styles.infoColLabel}>Montant à payer</Text>
                <Text style={styles.infoColValueBold}>6 663 XOF</Text>
              </View>
            </View>
          </View>

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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 12 },
  backButton: { padding: 4 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  helpButton: { padding: 4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  stepWrapper: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCircleDone: { backgroundColor: '#FFC759', borderColor: '#FFC759' },
  stepCircleActive: { backgroundColor: '#FFFFFF', borderColor: '#FFC759', borderWidth: 2 },
  stepNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#9CA3AF' },
  stepNumberActive: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#F59E0B' },
  stepText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#9CA3AF', textAlign: 'center' },
  stepTextDone: { fontFamily: 'Inter_500Medium', fontSize: 9, color: '#1A2840', textAlign: 'center' },
  stepTextActive: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#F59E0B', textAlign: 'center' },
  stepLine: { height: 2, backgroundColor: '#E5E7EB', flex: 1, marginTop: -14 },
  stepLineDone: { backgroundColor: '#FFC759' },
  mainTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840', textAlign: 'center', marginBottom: 6 },
  mainSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 17, marginBottom: 24, paddingHorizontal: 10 },
  flowCardContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 20, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', marginBottom: 20 },
  nodeContainer: { alignItems: 'center' },
  mixxLogoCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFD646', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  mixxLogoText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#6B21A8', fontStyle: 'italic' },
  mixxSubText: { fontFamily: 'Inter_700Bold', fontSize: 7, color: '#6B21A8' },
  walletLogoSquare: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#071D54', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  nodeTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  nodeSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  verticalDottedLine: { marginVertical: 8, alignItems: 'center', gap: 4 },
  vDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFC759' },
  centerGaugeContainer: { marginVertical: 6 },
  gaugeArcCircle: { width: 170, height: 170, borderRadius: 85, borderWidth: 3, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  gaugeArcYellowSegment: { position: 'absolute', top: -3, right: -3, width: 170, height: 170, borderRadius: 85, borderWidth: 4, borderColor: '#FFC759', borderLeftColor: 'transparent', borderBottomColor: 'transparent' },
  gaugeInnerContent: { alignItems: 'center', paddingHorizontal: 16 },
  phoneWifiIconBox: { position: 'relative', marginBottom: 8, alignItems: 'center' },
  gaugeMainText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', textAlign: 'center', lineHeight: 17, marginBottom: 2 },
  gaugeSubText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', textAlign: 'center' },
  securityBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, marginBottom: 16 },
  shieldIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  securityBannerContent: { flex: 1 },
  securityBannerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  securityBannerText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 15 },
  bottomInfoCardsRow: { flexDirection: 'row', gap: 10 },
  infoColCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 12 },
  infoIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10 },
  infoColTextWrap: { flex: 1 },
  infoColLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', marginBottom: 1 },
  infoColValue: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
  infoColValueBold: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#1A2840' }
});
