import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { DizzitButton } from '../components/DizzitButton';

export default function ReviewPaymentScreen() {
  const [selectedPayment, setSelectedPayment] = useState('card');

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérifier et payer</Text>
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
        <Text style={styles.headerSubtitle}>Vérifiez les détails de votre paiement et confirmez pour continuer.</Text>
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
            <Text style={styles.contactRelation}>Mère</Text>
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
            <Text style={styles.serviceSubtitle}>MTN Nigeria</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={14} color="#1A2840" style={styles.editIcon} />
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.inputLabel}>Montant</Text>
          <View style={styles.amountInputRow}>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.amountInput}
                value="20"
                keyboardType="numeric"
                editable={false}
              />
            </View>
            <TouchableOpacity style={styles.currencySelector}>
              <Text style={styles.currencyFlag}>🇺🇸</Text>
              <Text style={styles.currencyText}>USD</Text>
              <Ionicons name="chevron-down" size={16} color="#1A2840" />
            </TouchableOpacity>
          </View>
          <Text style={styles.convertedAmount}>≈ 32,250 NGN</Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Payer avec</Text>

          {/* Card Payment */}
          <TouchableOpacity 
            style={[styles.paymentCard, selectedPayment === 'card' && styles.paymentCardSelected]}
            onPress={() => setSelectedPayment('card')}
            activeOpacity={0.7}
          >
            <View style={[styles.paymentIconWrapper, selectedPayment === 'card' && styles.paymentIconWrapperSelected]}>
              <Ionicons name="card-outline" size={20} color={selectedPayment === 'card' ? "#1A2840" : "#6B7280"} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Card Payment</Text>
              <Text style={styles.paymentSubtitle}>Visa, Mastercard, Amex</Text>
            </View>
            {selectedPayment === 'card' ? (
              <View style={styles.radioSelected}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.radioUnselected} />
            )}
          </TouchableOpacity>

          {/* DZYwallet */}
          <TouchableOpacity 
            style={[styles.paymentCard, selectedPayment === 'wallet' && styles.paymentCardSelected]}
            onPress={() => setSelectedPayment('wallet')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentIconWrapper}>
              <Ionicons name="wallet-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>DZYwallet (Stablecoins & DZY)</Text>
              <Text style={styles.paymentSubtitle}>USDC, USDT, EURC, DZY</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#1A2840" />
          </TouchableOpacity>

          {/* Mobile Money */}
          <TouchableOpacity 
            style={[styles.paymentCard, selectedPayment === 'mobile' && styles.paymentCardSelected]}
            onPress={() => setSelectedPayment('mobile')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentIconWrapper}>
              <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Mobile Money</Text>
              <Text style={styles.paymentSubtitle}>Payer avec Mobile Money</Text>
            </View>
            {selectedPayment === 'mobile' ? (
              <View style={styles.radioSelected}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.radioUnselected} />
            )}
          </TouchableOpacity>
        </View>

        {/* Payment Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsHeader}>Détails du paiement</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant</Text>
            <Text style={styles.detailValue}>20.00 USD</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelWithIcon}>
              <Text style={styles.detailLabel}>Frais de service</Text>
              <Ionicons name="information-circle-outline" size={14} color="#8B92A5" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.detailValue}>0.50 USD</Text>
          </View>

          <View style={styles.dashedLine} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>20.50 USD</Text>
          </View>
        </View>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <View style={styles.securityIconWrapper}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#1A2840" />
          </View>
          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>Paiement 100% sécurisé</Text>
            <Text style={styles.securityText}>Vos fonds sont protégés par le protocole de sécurité DZYwallet.</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <DizzitButton 
          title="Payer & envoyer"
          onPress={() => {}}
          icon={
            <View style={styles.buttonIconLeft}>
              <Ionicons name="lock-closed-outline" size={18} color="#1A2840" />
            </View>
          }
          style={styles.payButton}
        />
        <View style={styles.absoluteArrowWrapper}>
          <Ionicons name="arrow-forward" size={20} color="#1A2840" />
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepTitleRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" />
            <Text style={styles.stepTitle}>Paiement 4/4 : Vérification et confirmation</Text>
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
    marginLeft: 32,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  amountSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  amountInput: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  currencyFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  currencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginRight: 8,
  },
  convertedAmount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  paymentMethodsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  paymentCardSelected: {
    borderColor: '#FFC759',
    backgroundColor: '#FFFBEB',
  },
  paymentIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconWrapperSelected: {
    backgroundColor: '#FFC759',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  detailsHeader: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  detailLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  totalValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  securityIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#10B981',
    marginBottom: 2,
  },
  securityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    position: 'relative',
  },
  payButton: {
    marginBottom: 16,
  },
  buttonIconLeft: {
    marginRight: 8,
  },
  absoluteArrowWrapper: {
    position: 'absolute',
    right: 40,
    top: 32, // approximately center of button vertically
    zIndex: 10,
  },
  stepContainer: {
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
