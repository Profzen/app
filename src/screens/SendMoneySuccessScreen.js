import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SendMoneySuccessScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Success Animation / Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircleBg}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
          </View>
          {/* Decorative particles (simplified with absolute positioning) */}
          <View style={[styles.particle, { top: 20, left: 20, backgroundColor: '#E2E8F0', transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.particle, { top: 10, right: 40, backgroundColor: '#10B981', transform: [{ rotate: '15deg' }] }]} />
          <View style={[styles.particle, { bottom: 20, left: 30, backgroundColor: '#8B5CF6', transform: [{ rotate: '-20deg' }] }]} />
          <View style={[styles.particle, { bottom: 40, right: 20, backgroundColor: '#F59E0B', transform: [{ rotate: '60deg' }] }]} />
        </View>

        {/* Titles */}
        <Text style={styles.pageTitle}>Transaction réussie !</Text>
        <Text style={styles.pageSubtitle}>Vous avez envoyé de l'argent avec succès.</Text>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          
          {/* Row 1: Montant envoyé */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={[styles.detailIconBox, {backgroundColor: '#F8F9FE'}]}>
                <Ionicons name="paper-plane-outline" size={20} color="#1A2840" />
              </View>
              <Text style={styles.detailLabel}>Montant envoyé</Text>
            </View>
            <View style={styles.detailRightCol}>
              <View style={styles.detailRight}>
                <Text style={styles.detailAmount}>4 000</Text>
                <Text style={styles.detailCurrency}> Ar</Text>
              </View>
              <Text style={styles.detailSubAmount}>≈ 1,03 DZ</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Row 2: Destinataire */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={[styles.detailIconBox, {backgroundColor: '#F8F9FE'}]}>
                <Ionicons name="person-outline" size={20} color="#1A2840" />
              </View>
              <Text style={styles.detailLabel}>Destinataire</Text>
            </View>
            <Text style={styles.detailValueBold}>Rajo Ratovoniasina</Text>
          </View>
          <View style={styles.divider} />

          {/* Row 3: Méthode */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={[styles.dzyLogoBox, {marginRight: 12}]}>
                <Text style={styles.dzyLogoText}>D</Text>
                <View style={styles.dzyLogoStrike} />
              </View>
              <Text style={styles.detailLabel}>Méthode</Text>
            </View>
            <View style={styles.methodRight}>
              <View style={[styles.dzyLogoBox, {marginRight: 8}]}>
                <Text style={styles.dzyLogoText}>D</Text>
                <View style={styles.dzyLogoStrike} />
              </View>
              <Text style={styles.detailValueBold}>Dizzy</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Row 4: Date */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={[styles.detailIconBox, {backgroundColor: '#F8F9FE'}]}>
                <Ionicons name="calendar-outline" size={20} color="#1A2840" />
              </View>
              <Text style={styles.detailLabel}>Date et heure</Text>
            </View>
            <Text style={styles.detailValue}>24 juin 2025 • 14:32</Text>
          </View>
          <View style={styles.divider} />

          {/* Row 5: Ref */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={[styles.detailIconBox, {backgroundColor: '#F8F9FE'}]}>
                <Ionicons name="document-text-outline" size={20} color="#1A2840" />
              </View>
              <Text style={styles.detailLabel}>Référence</Text>
            </View>
            <Text style={styles.detailValue}>DZ-250624-143213</Text>
          </View>

        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.btnFinish} onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.btnFinishText}>Terminé</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDetails} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
          <Ionicons name="receipt-outline" size={18} color="#0052CC" style={{marginRight: 8}} />
          <Text style={styles.btnDetailsText}>Voir les détails de la transaction</Text>
          <Ionicons name="chevron-forward" size={16} color="#0052CC" style={{marginLeft: 4, marginTop: 2}} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircleBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF3C7', // light yellow background
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFB800', // yellow
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 40,
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
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
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1A2840',
  },
  detailRightCol: {
    alignItems: 'flex-end',
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  detailAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  detailCurrency: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
  detailSubAmount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  detailValueBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  detailValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dzyLogoBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#05112F', // Dark blue background
    justifyContent: 'center',
    alignItems: 'center',
  },
  dzyLogoText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#FFC759',
    includeFontPadding: false,
  },
  dzyLogoStrike: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#FFC759',
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnFinish: {
    width: '100%',
    backgroundColor: '#FFB800',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnFinishText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
  btnDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDetailsText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0052CC',
  },
});
