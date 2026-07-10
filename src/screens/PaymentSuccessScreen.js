import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header (Top Right Icons only) */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#1A2840" />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-outline" size={22} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Success Animation / Icon Area */}
          <View style={styles.successArea}>
            <View style={styles.successHalo}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={styles.successTitle}>Paiement réussi !</Text>
            <Text style={styles.successSub}>Votre paiement a été effectué avec succès.</Text>
            
            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              <Text style={styles.secureText}>Transaction 100% sécurisée</Text>
            </View>
          </View>

          {/* Transaction Details Card */}
          <View style={styles.detailsCard}>
            
            {/* Contact Row */}
            <View style={styles.contactRow}>
              <Image source={{uri: 'https://i.pravatar.cc/150?img=47'}} style={styles.contactAvatar} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Mama Kemi Adebayo</Text>
                <Text style={styles.contactRelation}>Mère</Text>
                <View style={styles.contactLocation}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" />
                  <Text style={styles.contactLocationText}>Lagos, Nigeria </Text>
                  <Image source={{uri: 'https://flagcdn.com/w40/ng.png'}} style={styles.flagIcon} />
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Succès</Text>
              </View>
            </View>

            {/* Service Row */}
            <View style={styles.serviceRow}>
              <View style={styles.serviceIconBox}>
                <Ionicons name="phone-portrait-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>Recharge mobile</Text>
                <Text style={styles.serviceProvider}>MTN Nigeria</Text>
              </View>
              <Text style={styles.serviceAmount}>20.00 USD</Text>
            </View>

            <View style={styles.divider} />

            {/* Detailed Info Rows */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date et heure</Text>
              <Text style={styles.detailValue}>18 Mai 2024 • 10:45 AM</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Méthode de paiement</Text>
              <View style={styles.paymentMethod}>
                <Image source={{uri: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'}} style={styles.usdcIcon} />
                <Text style={styles.detailValue}>USDC</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Frais de service</Text>
              <Text style={styles.detailValue}>0.50 USD</Text>
            </View>

            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.detailLabel}>Total payé</Text>
              <Text style={styles.totalValue}>20.50 USD</Text>
            </View>

            <View style={[styles.detailRow, {marginBottom: 0}]}>
              <Text style={styles.detailLabel}>Numéro de transaction</Text>
              <View style={styles.txNumberRow}>
                <Text style={styles.txNumberValue}>DZY20240518104532</Text>
                <TouchableOpacity style={{marginLeft: 8}}>
                  <Ionicons name="copy-outline" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

          </View>

          {/* Cashback Reward Banner */}
          <View style={styles.rewardBanner}>
            <View style={styles.giftIconWrapper}>
              <Text style={{fontSize: 48}}>🎁</Text>
              <View style={styles.giftCheck}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.rewardContent}>
              <Text style={styles.rewardTitle}>Vous avez gagné <Text style={styles.rewardHighlight}>2.50 DZY</Text> en Cashback !</Text>
              <Text style={styles.rewardSub}>Cette récompense a été créditée dans votre DZYWallet.</Text>
              <TouchableOpacity style={styles.rewardLink}>
                <Text style={styles.rewardLinkText}>Voir mes Rewards</Text>
                <Ionicons name="arrow-forward" size={14} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Ionicons name="receipt-outline" size={20} color="#1A2840" style={{marginRight: 8}} />
              <Text style={styles.primaryBtnText}>Voir le reçu</Text>
            </TouchableOpacity>

            <View style={styles.secondaryBtnRow}>
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="refresh-outline" size={20} color="#1A2840" style={{marginRight: 6}} />
                <Text style={styles.secondaryBtnText}>Faire un autre paiement</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="home-outline" size={20} color="#1A2840" style={{marginRight: 6}} />
                <Text style={styles.secondaryBtnText}>Retour à l'accueil</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{height: 30}} />
        </ScrollView>

        <BottomNavBar activeTab="Accueil" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  successArea: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  successHalo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
  },
  successSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  secureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  contactRelation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contactLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  contactLocationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  flagIcon: {
    width: 14,
    height: 10,
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#10B981',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  serviceProvider: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  serviceAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usdcIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  totalRow: {
    marginBottom: 16,
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#10B981',
  },
  txNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txNumberValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  rewardBanner: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftIconWrapper: {
    marginRight: 16,
    position: 'relative',
  },
  giftCheck: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFBEB',
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 4,
  },
  rewardHighlight: {
    color: '#10B981',
  },
  rewardSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  rewardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  rewardLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    marginRight: 4,
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
});
