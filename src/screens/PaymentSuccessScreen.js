import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { DizzitButton } from '../components/DizzitButton';

export default function PaymentSuccessScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={18} color="#1A2840" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Header Area */}
        <View style={styles.successHeader}>
          {/* Confetti logic can be added later, for now we just show the big checkmark */}
          <View style={styles.confettiContainer}>
            {/* Some placeholder confetti shapes */}
            <View style={[styles.confetti, { top: 20, left: 40, backgroundColor: '#10B981', transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.confetti, { top: 80, left: 20, backgroundColor: '#10B981', transform: [{ rotate: '-20deg' }] }]} />
            <View style={[styles.confetti, { top: 30, right: 60, backgroundColor: '#10B981', transform: [{ rotate: '15deg' }] }]} />
            <View style={[styles.confetti, { top: 100, right: 30, backgroundColor: '#FFC759', transform: [{ rotate: '-45deg' }] }]} />
            <View style={[styles.confetti, { top: 90, left: 80, backgroundColor: '#FFC759', transform: [{ rotate: '30deg' }] }]} />
            
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={styles.title}>Paiement réussi !</Text>
          <Text style={styles.subtitle}>Votre paiement a été effectué avec succès.</Text>
          
          <View style={styles.securityBadgeSmall}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#10B981" />
            <Text style={styles.securityBadgeText}>Transaction 100% sécurisée</Text>
          </View>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Contact Row */}
          <View style={styles.receiptRow}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=kemi' }} style={styles.avatar} />
            <View style={styles.receiptRowInfo}>
              <Text style={styles.contactName}>Mama Kemi Adebayo</Text>
              <Text style={styles.contactRelation}>Mère</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#8B92A5" style={styles.locationIcon} />
                <Text style={styles.contactLocation}>Lagos, Nigeria 🇳🇬</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Succès</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Service Row */}
          <View style={styles.receiptRow}>
            <View style={styles.serviceIconWrapper}>
              <Ionicons name="phone-portrait-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.receiptRowInfo}>
              <Text style={styles.serviceName}>Recharge mobile</Text>
              <Text style={styles.serviceProvider}>MTN Nigeria</Text>
            </View>
            <Text style={styles.serviceAmount}>20.00 USD</Text>
          </View>

          <View style={styles.divider} />

          {/* Details */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date et heure</Text>
            <Text style={styles.detailValue}>18 mai 2024 • 10:45</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Méthode de paiement</Text>
            <View style={styles.paymentMethodValue}>
              <View style={styles.cardIconMini}>
                <Ionicons name="card-outline" size={14} color="#1A2840" />
              </View>
              <View>
                <Text style={styles.paymentMethodName}>Card Payment</Text>
                <Text style={styles.paymentMethodCards}>Visa, Mastercard</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frais de service</Text>
            <Text style={styles.detailValue}>0.50 USD</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total payé</Text>
            <Text style={styles.totalValueGreen}>20.50 USD</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Numéro de transaction</Text>
            <View style={styles.transactionNumberValue}>
              <Text style={styles.detailValue}>DZY20240518104532</Text>
              <TouchableOpacity style={styles.copyIcon}>
                <Ionicons name="copy-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIconArea}>
            <View style={styles.walletPlaceholder}>
              <Text style={styles.walletPlaceholderText}>DZ</Text>
              <View style={styles.walletShield}>
                <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>
          <View style={styles.infoBannerTextContent}>
            <Text style={styles.infoBannerTitle}>Vous avez envoyé des crédits avec succès.</Text>
            <Text style={styles.infoBannerText}>Vos proches recevront les crédits en quelques secondes.</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actionButtons}>
          <DizzitButton 
            title="Voir le reçu"
            onPress={() => {}}
            icon={<Ionicons name="document-text-outline" size={18} color="#1A2840" style={{ marginRight: 8 }} />}
            style={styles.primaryButton}
          />
          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="refresh-outline" size={18} color="#1A2840" style={styles.secondaryButtonIcon} />
              <Text style={styles.secondaryButtonText}>Faire un autre paiement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="home-outline" size={18} color="#1A2840" style={styles.secondaryButtonIcon} />
              <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#1A2840" />
          <Text style={styles.navItemText}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="people-outline" size={24} color="#8B92A5" />
          <Text style={styles.navItemTextInactive}>Contacts</Text>
        </TouchableOpacity>
        <View style={styles.fabWrapper}>
          <TouchableOpacity style={styles.fab}>
            <Ionicons name="swap-horizontal" size={24} color="#1A2840" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid-outline" size={24} color="#8B92A5" />
          <Text style={styles.navItemTextInactive}>Shops</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#8B92A5" />
          <Text style={styles.navItemTextInactive}>More</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
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
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  confettiContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 12,
    borderRadius: 4,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  securityBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  securityBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  receiptRowInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  contactRelation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
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
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  serviceIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  serviceProvider: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  serviceAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  paymentMethodValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconMini: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  paymentMethodName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'right',
  },
  paymentMethodCards: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  totalValueGreen: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#10B981',
  },
  transactionNumberValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyIcon: {
    marginLeft: 6,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoBannerIconArea: {
    marginRight: 16,
  },
  walletPlaceholder: {
    width: 50,
    height: 36,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  walletPlaceholderText: {
    color: '#FFC759',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
  },
  walletShield: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F8F9FA',
  },
  infoBannerTextContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 4,
  },
  infoBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  actionButtons: {
    paddingHorizontal: 20,
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  secondaryButtonIcon: {
    marginRight: 6,
  },
  secondaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    position: 'relative',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navItemText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1A2840',
    marginTop: 4,
  },
  navItemTextInactive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8B92A5',
    marginTop: 4,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20, // Elevate above the bar
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }
});
