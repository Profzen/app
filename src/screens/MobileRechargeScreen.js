import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { DizzitButton } from '../components/DizzitButton';
import StepIndicator from '../components/StepIndicator'; // Ensure this exists or we create it

export default function MobileRechargeScreen() {
  const navigation = useNavigation();
  const [selectedAmount, setSelectedAmount] = useState(500);

  const amounts = [500, 1000, 2000, 5000, 10000, 20000];

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recharger un mobile</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={18} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Vérifiez les informations et sélectionnez le montant à recharger.</Text>
      </View>

      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Contact Card */}
        <View style={styles.selectedContactCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=kemi' }} style={styles.avatar} />
            <View style={styles.checkedCircle}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Mama Kemi Adebayo</Text>
            <Text style={styles.contactRelation}>+234 803 456 7890</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#8B92A5" style={styles.locationIcon} />
              <Text style={styles.contactLocation}>Lagos, Nigeria 🇳🇬</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={14} color="#1A2840" style={styles.editIcon} />
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Service Row */}
        <View style={styles.serviceRow}>
          <View style={styles.serviceIconWrapper}>
            <Ionicons name="phone-portrait-outline" size={20} color="#10B981" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>Recharge mobile</Text>
            <Text style={styles.serviceSubtitle}>Crédits mobiles instantanés pour vos proches.</Text>
          </View>
          <TouchableOpacity style={styles.changeServiceBtn}>
            <Text style={styles.changeServiceText}>Changer</Text>
            <Ionicons name="chevron-down" size={16} color="#1A2840" />
          </TouchableOpacity>
        </View>

        {/* Detected Operator */}
        <Text style={styles.sectionTitle}>Opérateur détecté</Text>
        <View style={styles.operatorCard}>
          <View style={styles.operatorLogo}>
            <Text style={styles.operatorLogoText}>MTN</Text>
          </View>
          <View style={styles.operatorInfo}>
            <Text style={styles.operatorName}>MTN Nigeria</Text>
            <Text style={styles.operatorDetected}>Opérateur détecté pour ce numéro</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Select Amount */}
        <Text style={styles.sectionTitle}>Sélectionnez un montant</Text>
        <View style={styles.amountsGrid}>
          {amounts.map((amount) => {
            const isSelected = selectedAmount === amount;
            return (
              <TouchableOpacity
                key={amount}
                style={[styles.amountCard, isSelected && styles.amountCardSelected]}
                onPress={() => setSelectedAmount(amount)}
                activeOpacity={0.7}
              >
                <Text style={[styles.amountValue, isSelected && styles.amountValueSelected]}>
                  {amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                </Text>
                <Text style={styles.amountCurrency}>NGN</Text>
                {isSelected ? (
                  <View style={styles.radioSelected}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Amount */}
        <TouchableOpacity style={styles.customAmountCard} activeOpacity={0.7}>
          <View style={styles.customAmountIconWrapper}>
            <Ionicons name="pencil-outline" size={16} color="#1A2840" />
          </View>
          <View style={styles.customAmountInfo}>
            <Text style={styles.customAmountTitle}>Montant personnalisé</Text>
            <Text style={styles.customAmountSubtitle}>Saisissez un autre montant</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1A2840" />
        </TouchableOpacity>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Vous allez payer</Text>
            <Text style={styles.summaryValue}>{selectedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</Text>
            <Text style={styles.summarySubLabel}>Montant</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Il/Elle va recevoir</Text>
            <Text style={styles.summaryValue}>{selectedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</Text>
            <Text style={styles.summarySubLabel}>Crédits mobiles</Text>
          </View>
        </View>

        {/* Info Text */}
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" style={styles.infoIcon} />
          <Text style={styles.infoText}>Recharge instantanée et sécurisée 24h/24, 7j/7.</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <DizzitButton 
          title="Continuer"
          onPress={() => navigation.navigate('ReviewPaymentScreen')}
          icon={<Ionicons name="arrow-forward" size={20} color="#1A2840" />}
        />
        <View style={styles.stepContainer}>
          <View style={styles.stepTitleRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" />
            <Text style={styles.stepTitle}>Paiement 3/4 : Produit ou service</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            <View style={styles.progressSegment} />
          </View>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    paddingRight: 20,
    marginLeft: 36,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  selectedContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FFC759',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  checkedCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFBEB',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13.5,
    color: '#1A2840',
    marginBottom: 2,
  },
  contactRelation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8B92A5',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  contactLocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  editIcon: {
    marginRight: 4,
  },
  editButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  serviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  changeServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  changeServiceText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginRight: 4,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  operatorLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operatorLogoText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  operatorDetected: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#10B981',
  },
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  amountCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  amountCardSelected: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFBEB',
  },
  amountValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 4,
  },
  amountValueSelected: {
    color: '#1A2840',
  },
  amountCurrency: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
  },
  radioUnselected: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioSelected: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAmountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  customAmountIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customAmountInfo: {
    flex: 1,
  },
  customAmountTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  customAmountSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryColumn: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 4,
  },
  summarySubLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#1A2840',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#4B5563',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stepContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressSegment: {
    width: 40,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#FFC759',
  }
});
