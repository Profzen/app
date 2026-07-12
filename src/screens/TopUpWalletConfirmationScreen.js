import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TopUpWalletConfirmationScreen() {
  const navigation = useNavigation();
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
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Ionicons name="checkmark" size={16} color="#FFB800" />
                <View style={styles.tinyCheckBadge}>
                  <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.stepText}>Paiement</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />

            <View style={styles.stepWrapper}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, styles.stepNumberActive]}>5</Text>
              </View>
              <Text style={[styles.stepText, styles.stepTextActive]}>Confirmation</Text>
            </View>
          </View>

          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            {/* Confetti mocks */}
            <View style={[styles.confetti, {backgroundColor: '#FFB800', top: 10, left: 20, width: 6, height: 6}]} />
            <View style={[styles.confetti, {backgroundColor: '#3B82F6', top: 30, left: 10, width: 4, height: 4}]} />
            <View style={[styles.confetti, {backgroundColor: '#10B981', bottom: 10, left: 20, width: 8, height: 8}]} />
            <View style={[styles.confetti, {backgroundColor: '#FFB800', top: 0, right: 30, width: 8, height: 8}]} />
            <View style={[styles.confetti, {backgroundColor: '#3B82F6', top: 20, right: 10, width: 5, height: 5}]} />
            <View style={[styles.confetti, {backgroundColor: '#10B981', bottom: 15, right: 25, width: 6, height: 6}]} />
            
            <View style={styles.checkCircleLarge}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.mainTitle}>Paiement réussi !</Text>
          <Text style={styles.mainSubtitle}>
            Votre recharge a été effectuée avec succès.{'\n'}
            Les cryptos ont été créditées sur votre portefeuille.
          </Text>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardHeaderTitle}>DÉTAILS DE LA TRANSACTION</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.iconWrapper}>
                  <Text style={{color: '#3B82F6', fontSize: 10, fontWeight: 'bold'}}>USDC</Text>
                </View>
                <Text style={styles.detailLabel}>Vous avez reçu</Text>
              </View>
              <Text style={styles.detailValueBold}>10 USDC</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="git-network-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.detailLabel}>Réseau</Text>
              </View>
              <View style={styles.networkRow}>
                <Text style={styles.detailValueBold}>Polygon</Text>
                <View style={styles.polygonBadge}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>∞</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="time-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.detailLabel}>Date et heure</Text>
              </View>
              <Text style={styles.detailValueBold}>30 Mai 2025 à 09:41</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="document-text-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.detailLabel}>Montant payé</Text>
              </View>
              <Text style={styles.detailValueBold}>10,50 USD</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="card-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.detailLabel}>Méthode de paiement</Text>
              </View>
              <Text style={styles.detailValueBold}>Carte bancaire •••• 4242</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRowAlt}>
              <View style={styles.detailLeft}>
                <View style={styles.iconWrapper}>
                  <Text style={{color: '#3B82F6', fontSize: 14, fontWeight: 'bold'}}>#</Text>
                </View>
                <Text style={styles.detailLabel}>ID de transaction</Text>
              </View>
              <View style={styles.txIdCol}>
                <View style={styles.txIdRow}>
                  <Text style={styles.detailValueRegular}>0x7a3f...e9b2c4d</Text>
                  <Ionicons name="copy-outline" size={14} color="#3B82F6" style={{marginLeft: 8}} />
                </View>
                <View style={styles.txLinkRow}>
                  <Text style={styles.txLinkText}>Voir sur Polygonscan</Text>
                  <Ionicons name="open-outline" size={12} color="#3B82F6" style={{marginLeft: 4}} />
                </View>
              </View>
            </View>
          </View>

          {/* Success Banner */}
          <View style={styles.successBanner}>
            <View style={styles.shieldIconContainer}>
              <Ionicons name="shield" size={24} color="#10B981" />
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" style={{position: 'absolute'}} />
            </View>
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Transaction sécurisée</Text>
              <Text style={styles.successDesc}>
                Vos cryptos sont maintenant disponibles{'\n'}dans votre portefeuille DZYwallet.
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('AssetsListScreen')}>
            <Ionicons name="wallet-outline" size={20} color="#1A2840" style={styles.btnIconLeft} />
            <Text style={styles.btnPrimaryText}>Voir mon portefeuille DZYwallet</Text>
            <Ionicons name="arrow-forward" size={20} color="#1A2840" style={styles.btnIconRight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('TopUpWalletScreen')}>
            <Text style={styles.btnSecondaryText}>Effectuer une autre recharge</Text>
          </TouchableOpacity>

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
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    height: 100,
    position: 'relative',
  },
  checkCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 10,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
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
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1E293B',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
  },
  detailValueBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  detailValueRegular: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  polygonBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  txIdCol: {
    alignItems: 'flex-end',
  },
  txIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  txLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txLinkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#3B82F6',
  },
  successBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5', // Light green
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  shieldIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#065F46', // Dark green text
    marginBottom: 4,
  },
  successDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
  },
  btnIconLeft: {
    position: 'absolute',
    left: 20,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  btnIconRight: {
    position: 'absolute',
    right: 20,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  btnSecondaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
});
