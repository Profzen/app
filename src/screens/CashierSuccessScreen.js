import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import BottomNavBar from '../components/BottomNavBar';

export default function CashierSuccessScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconSquareBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Caisse (TPE)</Text>
          <TouchableOpacity style={styles.iconSquareBtn}>
            <Ionicons name="help-circle-outline" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Success Header & Confetti */}
          <View style={styles.successHeaderSection}>
            <View style={styles.iconWrapper}>
              {/* Confetti dots */}
              <View style={[styles.confettiDot, { backgroundColor: '#FFC759', top: 0, left: -16 }]} />
              <View style={[styles.confettiDot, { backgroundColor: '#0052FF', top: -10, left: 12 }]} />
              <View style={[styles.confettiDot, { backgroundColor: '#10B981', top: 8, right: -12 }]} />
              <View style={[styles.confettiDot, { backgroundColor: '#FFC759', bottom: 6, right: -20 }]} />
              <View style={[styles.confettiDot, { backgroundColor: '#0052FF', bottom: -4, left: -8 }]} />

              <View style={styles.successGreenBadge}>
                <Ionicons name="checkmark" size={36} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.successTitleText}>Paiement reçu avec succès !</Text>
            <Text style={styles.successSubtext}>
              Le paiement a été confirmé.{'\n'}Merci.
            </Text>
          </View>

          {/* Dark Blue Summary Card */}
          <View style={styles.summaryCard}>
            {/* Left Column: Montant reçu */}
            <View style={styles.summaryLeftCol}>
              <Text style={styles.summaryLabel}>Montant reçu</Text>
              <Text style={styles.amountMainGreen}>2 000</Text>
              <Text style={styles.amountCurrencyFcfa}>2000 FCFA</Text>
            </View>

            <View style={styles.verticalDivider} />

            {/* Right Column: Vous avez reçu & Réseau */}
            <View style={styles.summaryRightCol}>
              <Text style={styles.summaryLabel}>Vous avez reçu</Text>
              <View style={styles.tokenPillBadge}>
                <CryptoIcon symbol="USDT" size={20} />
                <Text style={styles.tokenPillText}>USDT</Text>
              </View>

              <View style={styles.networkBox}>
                <Text style={styles.networkLabel}>Réseau</Text>
                <View style={styles.networkValueRow}>
                  <CryptoIcon symbol="POL" size={16} />
                  <Text style={styles.networkNameText}>Polygon</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsCardTitle}>Détails de la transaction</Text>
            
            {/* Row 1: Date et heure */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeftGroup}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="calendar-outline" size={16} color="#0052FF" />
                </View>
                <Text style={styles.detailLabelText}>Date et heure</Text>
              </View>
              <Text style={styles.detailValueText}>30 Mai 2025 à 09:42</Text>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 2: ID de transaction */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeftGroup}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="pricetag-outline" size={16} color="#0052FF" />
                </View>
                <Text style={styles.detailLabelText}>ID de transaction</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.detailValueText}>0x7a3f...e9b2c4d</Text>
                <TouchableOpacity style={{ marginLeft: 6 }}>
                  <Ionicons name="copy-outline" size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 3: Méthode de paiement */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeftGroup}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="wallet-outline" size={16} color="#0052FF" />
                </View>
                <Text style={styles.detailLabelText}>Méthode de paiement</Text>
              </View>
              <Text style={styles.detailValueText}>Caisse (TPE)</Text>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 4: Réseau */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeftGroup}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="git-network-outline" size={16} color="#0052FF" />
                </View>
                <Text style={styles.detailLabelText}>Réseau</Text>
              </View>
              <Text style={styles.detailValueText}>Polygon</Text>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 5: Statut */}
            <View style={styles.detailRow}>
              <View style={styles.detailLeftGroup}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="document-text-outline" size={16} color="#0052FF" />
                </View>
                <Text style={styles.detailLabelText}>Statut</Text>
              </View>
              <View style={styles.statusPillGreen}>
                <Text style={styles.statusPillTextGreen}>Réussi •</Text>
              </View>
            </View>
          </View>

          {/* Green Security Banner Card */}
          <View style={styles.securityBannerCard}>
            <View style={styles.securityIconBox}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#10B981" />
            </View>
            <View style={styles.securityContentGroup}>
              <Text style={styles.securityTitleText}>Transaction sécurisée</Text>
              <Text style={styles.securitySubtextText}>
                Vos fonds sont protégés par un chiffrement{'\n'}de niveau bancaire et des partenaires de confiance.
              </Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity 
            style={styles.btnVoirRecu} 
            onPress={() => navigation.navigate('TransactionHistoryScreen')}
            activeOpacity={0.85}
          >
            <Ionicons name="receipt-outline" size={18} color="#1A2840" style={{ position: 'absolute', left: 16 }} />
            <Text style={styles.btnVoirRecuText}>Voir le reçu</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A2840" style={{ position: 'absolute', right: 16 }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnNouvelleTransaction} 
            onPress={() => navigation.navigate('CashierScanScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnNouvelleTransactionText}>Nouvelle transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnRetourCaisse} 
            onPress={() => navigation.navigate('CashRegisterScreen')}
            activeOpacity={0.7}
          >
            <Text style={styles.btnRetourCaisseText}>Retour à la caisse</Text>
          </TouchableOpacity>

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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 10 },
  iconSquareBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#1A2840' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 6, paddingBottom: 30, paddingHorizontal: 16 },
  successHeaderSection: { alignItems: 'center', marginBottom: 20 },
  iconWrapper: { position: 'relative', width: 72, height: 72, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  successGreenBadge: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  confettiDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  successTitleText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840', marginBottom: 4, textAlign: 'center' },
  successSubtext: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  summaryCard: { flexDirection: 'row', backgroundColor: '#071D54', borderRadius: 20, padding: 16, marginBottom: 16 },
  summaryLeftCol: { flex: 1.2, justifyContent: 'center' },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  amountMainGreen: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: '#10B981', marginBottom: 2 },
  amountCurrencyFcfa: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFFFFF' },
  verticalDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 12 },
  summaryRightCol: { flex: 0.8 },
  tokenPillBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 10 },
  tokenPillText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#FFFFFF', marginLeft: 6 },
  networkBox: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  networkLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#9CA3AF', marginBottom: 2 },
  networkValueRow: { flexDirection: 'row', alignItems: 'center' },
  networkNameText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#FFFFFF', marginLeft: 4 },
  detailsCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 18, padding: 14, marginBottom: 16 },
  detailsCardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  detailLeftGroup: { flexDirection: 'row', alignItems: 'center' },
  detailIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F6FF', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  detailLabelText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280' },
  detailValueText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#1A2840' },
  rowDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  statusPillGreen: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#D1FAE5' },
  statusPillTextGreen: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#10B981' },
  securityBannerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7', borderRadius: 16, padding: 14, marginBottom: 16 },
  securityIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  securityContentGroup: { flex: 1 },
  securityTitleText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  securitySubtextText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 15 },
  btnVoirRecu: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 12, marginBottom: 10, position: 'relative' },
  btnVoirRecuText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  btnNouvelleTransaction: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFC759', height: 48, borderRadius: 12, marginBottom: 12 },
  btnNouvelleTransactionText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  btnRetourCaisse: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  btnRetourCaisseText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' }
});
