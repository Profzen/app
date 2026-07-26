import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SendMoneySummaryScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="arrow-redo" size={20} color="#1A2840" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Envoyer de l'argent</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.pageTitle}>Récapitulatif</Text>
          <Text style={styles.pageSubtitle}>Vérifiez les informations avant de confirmer la transaction.</Text>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            {/* Row 1: Vous envoyez */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIconBox, {backgroundColor: '#FEF3C7'}]}>
                  <Ionicons name="wallet-outline" size={20} color="#1A2840" />
                </View>
                <Text style={styles.detailLabel}>Vous envoyez</Text>
              </View>
              <View style={styles.detailRight}>
                <Text style={styles.detailAmount}>4 000</Text>
                <Text style={styles.detailCurrency}> Ar</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Row 2: Frais */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIconBox, {backgroundColor: '#F1F5F9'}]}>
                  <Ionicons name="receipt-outline" size={20} color="#1A2840" />
                </View>
                <Text style={styles.detailLabel}>Frais de transaction</Text>
              </View>
              <View style={styles.detailRight}>
                <Text style={styles.detailAmount}>12</Text>
                <Text style={styles.detailCurrency}> Ar</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Row 3: Methode */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIconBox, {backgroundColor: '#EEF2FF'}]}>
                  <Ionicons name="arrow-forward-outline" size={20} color="#1A2840" />
                </View>
                <Text style={styles.detailLabel}>Méthode d'envoi</Text>
              </View>
              <View style={styles.methodRight}>
                <View style={styles.dzyLogoBox}>
                  <Text style={styles.dzyLogoText}>D</Text>
                  <View style={styles.dzyLogoStrike} />
                </View>
                <Text style={styles.methodName}>Dizzy</Text>
              </View>
            </View>
          </View>

          {/* Recipient Card */}
          <View style={styles.recipientCard}>
            <Image 
              source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}} 
              style={styles.recipientAvatar} 
            />
            <Text style={styles.recipientName}>Rajo Ratovoniasina</Text>
            <Text style={styles.recipientSub}>va recevoir</Text>
            
            <View style={styles.receiveBox}>
              <View style={styles.receiveAmountRow}>
                <Text style={styles.receiveAmount}>1,03</Text>
                <Text style={styles.receiveCurrency}> DZ</Text>
              </View>
              <Text style={styles.receiveRate}>1 € = 1,18 DZ</Text>
            </View>
          </View>

          {/* Total Card */}
          <View style={styles.totalCard}>
            <View style={styles.detailLeft}>
              <View style={[styles.detailIconBox, {backgroundColor: '#FEF3C7'}]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#1A2840" />
              </View>
              <Text style={styles.totalLabel}>Total à payer</Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.totalAmount}>4 012</Text>
              <Text style={styles.totalCurrency}> Ar</Text>
            </View>
          </View>

        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnPrev} onPress={() => navigation.goBack()}>
            <Text style={styles.btnPrevText}>Précédent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnNext} onPress={() => navigation.navigate('SendMoneySuccessScreen')}>
            <Text style={styles.btnNextText}>Confirmer</Text>
          </TouchableOpacity>
        </View>

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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dzyLogoBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#05112F', // Dark blue background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  methodName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  recipientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  recipientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  recipientName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 4,
  },
  recipientSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  receiveBox: {
    backgroundColor: '#F8F9FE',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  receiveAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  receiveAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
  },
  receiveCurrency: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  receiveRate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFC759', // Yellow border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  totalLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  totalAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  totalCurrency: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#64748B',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 16,
  },
  btnPrev: {
    flex: 1,
    backgroundColor: '#8C94A3',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnPrevText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  btnNext: {
    flex: 1,
    backgroundColor: '#FFC759',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnNextText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
});
