import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WithdrawFundsMobileMoneySuccessScreen() {
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
          
          {/* Simple Stepper (1 to 5) - All Active */}
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
            <View style={[styles.stepLine, styles.stepLineActive]} />

            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>5</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.stepOverTitleSuccess}>Étape 5/5</Text>
          <Text style={styles.mainTitle}>Retrait réussi !</Text>
          <Text style={styles.mainSubtitle}>Votre retrait a été effectué avec succès.</Text>

          {/* Huge Main Card with light green top background */}
          <View style={styles.successCardContainer}>
            <View style={styles.successCardTopBg} />
            
            {/* Confetti & Checkmark */}
            <View style={styles.successIconContainer}>
              <View style={[styles.confetti, {backgroundColor: '#10B981', top: 20, left: 40, width: 8, height: 8, transform: [{rotate: '15deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#FFB800', top: 15, left: 90, width: 6, height: 10, transform: [{rotate: '-20deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#10B981', bottom: 20, left: 30, width: 6, height: 6, transform: [{rotate: '45deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#FFB800', top: 40, right: 90, width: 8, height: 8, transform: [{rotate: '10deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#10B981', top: 20, right: 40, width: 6, height: 10, transform: [{rotate: '-30deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#FFB800', bottom: 30, right: 30, width: 6, height: 6, transform: [{rotate: '25deg'}]}]} />
              <View style={[styles.confetti, {backgroundColor: '#10B981', bottom: 10, right: 70, width: 6, height: 6, transform: [{rotate: '60deg'}]}]} />
              
              <View style={styles.checkCircleLarge}>
                <Ionicons name="checkmark" size={48} color="#FFFFFF" />
              </View>
              <View style={styles.checkCircleShadow} />
            </View>

            {/* Inner White Card */}
            <View style={styles.innerWhiteCard}>
              
              {/* Amounts Header */}
              <View style={styles.amountsHeader}>
                <View style={styles.amountCol}>
                  <Text style={styles.amountLabel}>Vous retirez</Text>
                  <Text style={styles.amountValue}>250 000 FCFA</Text>
                  <Text style={styles.amountSub}>≈ 250,00 USDC</Text>
                </View>

                <View style={styles.amountArrowContainer}>
                  <Ionicons name="arrow-forward" size={16} color="#10B981" />
                </View>

                <View style={styles.amountColRight}>
                  <Text style={styles.amountLabel}>Vous recevez</Text>
                  <Text style={styles.amountValueGreen}>247 000 FCFA</Text>
                  <Text style={styles.amountSub}>via Mixx by Yas (Togo)</Text>
                </View>
              </View>

              <View style={styles.innerDivider} />

              {/* Details List */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#ECFDF5'}]}>
                    <Ionicons name="business" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.detailLabel}>Moyen de retrait</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>Mixx by Yas (Togo)</Text>
                  <Text style={styles.mixxLogoText}> mixx</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#EFF6FF'}]}>
                    <Text style={{color: '#3B82F6', fontSize: 10, fontWeight: 'bold'}}>$</Text>
                  </View>
                  <Text style={styles.detailLabel}>Votre DZYwallet a été débité de</Text>
                </View>
                <Text style={styles.detailValueRegular}>251,40 USDC</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#ECFDF5'}]}>
                    <Ionicons name="git-network-outline" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.detailLabel}>Réseau</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>Polygon </Text>
                  <View style={styles.polygonSmallLogo}>
                    <Text style={{color: '#FFF', fontSize: 8, fontWeight: 'bold'}}>∞</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#F5F3FF'}]}>
                    <Ionicons name="document-text-outline" size={14} color="#8B5CF6" />
                  </View>
                  <Text style={styles.detailLabel}>Transaction de vente</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>Sell 251,40 USDC</Text>
                  <View style={styles.successBadge}>
                    <Text style={styles.successBadgeText}>Succès</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#F5F3FF'}]}>
                    <Ionicons name="open-outline" size={14} color="#8B5CF6" />
                  </View>
                  <Text style={styles.detailLabel}>Voir sur la blockchain</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueBlue}>0xA1b2...4fE6d7</Text>
                  <Ionicons name="copy-outline" size={14} color="#64748B" style={{marginLeft: 6}} />
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#EFF6FF'}]}>
                    <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                  </View>
                  <Text style={styles.detailLabel}>Date et heure</Text>
                </View>
                <Text style={styles.detailValueRegular}>30 juin 2025 à 14:32</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#FFFBEB'}]}>
                    <Ionicons name="id-card-outline" size={14} color="#F59E0B" />
                  </View>
                  <Text style={styles.detailLabel}>ID de retrait</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValueRegular}>DZTR-250630-143245</Text>
                  <Ionicons name="copy-outline" size={14} color="#64748B" style={{marginLeft: 6}} />
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, {backgroundColor: '#ECFDF5'}]}>
                    <Ionicons name="person-outline" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.detailLabel}>Destinataire</Text>
                </View>
                <Text style={styles.detailValueRegular}>+228 90 12 34 56</Text>
              </View>

            </View>
          </View>

          {/* Success Banner Bottom */}
          <View style={styles.successBannerBottom}>
            <View style={styles.successBannerIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.successBannerText}>
              Vous recevrez une notification dès que les fonds{'\n'}sont disponibles sur votre compte Mixx.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.btnOutline}>
              <Ionicons name="time-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.btnOutlineText}>Voir l'historique</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('DashboardScreen')}>
              <Ionicons name="refresh" size={20} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.btnPrimaryText}>Effectuer un autre retrait</Text>
            </TouchableOpacity>
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
  stepOverTitleSuccess: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#10B981', // Green for success
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
  },
  successCardContainer: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFAFA', // base bg
    marginBottom: 16,
  },
  successCardTopBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#F0FDF4', // light green
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
  checkCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  checkCircleShadow: {
    position: 'absolute',
    width: 60,
    height: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    bottom: 15,
    zIndex: 1,
  },
  innerWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  amountsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  amountColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  amountValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  amountValueGreen: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#10B981',
  },
  amountSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#475569',
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValueRegular: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  detailValueBlue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#3B82F6',
  },
  mixxLogoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#8B5CF6',
  },
  polygonSmallLogo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  successBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  successBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#059669',
  },
  successBannerBottom: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  successBannerIconCircle: {
    marginRight: 12,
  },
  successBannerText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    lineHeight: 18,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFB800',
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 8,
  },
  btnOutlineText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  btnPrimary: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 8,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
});
