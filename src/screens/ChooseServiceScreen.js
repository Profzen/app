import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppToast from '../components/AppToast';

export default function ChooseServiceScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Mode: null = Main Services Grid (Screenshot 2), 'mobile' = Operator Selection (Screenshot 1)
  const [selectedService, setSelectedService] = useState(route.params?.initialService || null);
  const [operatorSearch, setOperatorSearch] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('MTN');
  const [toast, setToast] = useState(null);

  const beneficiary = route.params?.beneficiary || {
    name: 'Mama Kemi Adebayo',
    relation: 'Mère',
    phone: '+234 802 123 4567',
    country: 'Lagos, Nigeria 🇳🇬',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  };

  const handleBack = () => {
    if (selectedService !== null) {
      setSelectedService(null);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Top Bar */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>
                {selectedService === null ? 'Choisir un service' : 'Choisir un produit ou service'}
              </Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={18} color="#1A2840" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            {selectedService === null
              ? 'Sélectionnez le type de service que vous souhaitez envoyer ou payer.'
              : 'Sélectionnez le produit ou le service que vous souhaitez payer.'
            }
          </Text>
        </View>

        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Selected Beneficiary Summary Card */}
          <View style={styles.beneficiaryCard}>
            <View style={styles.beneficiaryMain}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: beneficiary.avatar }} style={styles.avatar} />
                <View style={styles.verifiedCheckBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.beneficiaryDetails}>
                <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
                <Text style={styles.beneficiaryRelation}>{beneficiary.relation}</Text>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>{beneficiary.country}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('PayBillsScreen')}>
                <Ionicons name="create-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ========================================================================= */}
          {/* MODE 1: SCREENSHOT 2 - CHOISIR UN SERVICE (GRID OF 5 SERVICES)           */}
          {/* ========================================================================= */}
          {selectedService === null && (
            <View style={styles.servicesGridContainer}>
              <Text style={styles.sectionTitle}>Sélectionnez un service</Text>

              {/* Row 1: Eau, gaz, électricité + Recharge mobile */}
              <View style={styles.serviceRowTwo}>
                <TouchableOpacity 
                  style={styles.serviceTileHalf}
                  onPress={() => setSelectedService('mobile')}
                  activeOpacity={0.8}
                >
                  <View style={styles.tileHeaderRow}>
                    <View style={[styles.tileIconBg, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="document-text-outline" size={22} color="#D97706" />
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </View>
                  <Text style={styles.tileTitle}>Eau, gaz, électricité</Text>
                  <Text style={styles.tileSubtitle}>Payez vos factures d'eau, de gaz, d'électricité et autres factures.</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.serviceTileHalf}
                  onPress={() => setSelectedService('mobile')}
                  activeOpacity={0.8}
                >
                  <View style={styles.tileHeaderRow}>
                    <View style={[styles.tileIconBg, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="phone-portrait-outline" size={22} color="#16A34A" />
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </View>
                  <Text style={styles.tileTitle}>Recharge mobile</Text>
                  <Text style={styles.tileSubtitle}>Crédits mobiles instantanés pour vos proches.</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2: Internet, TV, Jeux & Crypto (Full Width) */}
              <TouchableOpacity 
                style={styles.serviceTileFull}
                onPress={() => setSelectedService('mobile')}
                activeOpacity={0.8}
              >
                <View style={styles.tileFullLeft}>
                  <View style={[styles.tileIconBgLarge, { backgroundColor: '#EFF6FF' }]}>
                    <View style={styles.multiIconGrid}>
                      <Ionicons name="wifi-outline" size={14} color="#2563EB" style={{ margin: 2 }} />
                      <Ionicons name="tv-outline" size={14} color="#2563EB" style={{ margin: 2 }} />
                      <Ionicons name="game-controller-outline" size={14} color="#2563EB" style={{ margin: 2 }} />
                      <Ionicons name="logo-bitcoin" size={14} color="#2563EB" style={{ margin: 2 }} />
                    </View>
                  </View>
                  <View style={styles.tileFullTextWrap}>
                    <Text style={styles.tileTitle}>Internet, TV, Jeux & Crypto</Text>
                    <Text style={styles.tileSubtitle}>Abonnements Internet et données, abonnements TV et bouquets, jeux en ligne et services crypto.</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Row 3: Envoyer/Demander des fonds + Produits & Services essentiels */}
              <View style={styles.serviceRowTwo}>
                <TouchableOpacity 
                  style={styles.serviceTileHalf}
                  onPress={() => navigation.navigate('SendMoneyScreen', { recipient: beneficiary.name })}
                  activeOpacity={0.8}
                >
                  <View style={styles.tileHeaderRow}>
                    <View style={[styles.tileIconBg, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="swap-horizontal-outline" size={22} color="#9333EA" />
                    </View>
                  </View>
                  <Text style={styles.tileTitle}>Envoyer/Demander des fonds</Text>
                  <Text style={styles.tileSubtitle}>Envoyez ou demandez de l'aide à vos proches en quelques secondes.</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.serviceTileHalf}
                  onPress={() => navigation.navigate('ShopsScreen')}
                  activeOpacity={0.8}
                >
                  <View style={styles.tileHeaderRow}>
                    <View style={[styles.tileIconBg, { backgroundColor: '#FFEDD5' }]}>
                      <Ionicons name="basket-outline" size={22} color="#EA580C" />
                    </View>
                  </View>
                  <Text style={styles.tileTitle}>Produits & Services essentiels</Text>
                  <Text style={styles.tileSubtitle}>Alimentaire, Éducation, et Santé et bien d'autres produits et services essentiels.</Text>
                </TouchableOpacity>
              </View>

              {/* Accepted Payment Methods Banner */}
              <View style={styles.paymentMethodsBanner}>
                <View style={styles.shieldIconBox}>
                  <Ionicons name="checkmark-circle-outline" size={26} color="#0F172A" />
                </View>
                <View style={styles.bannerTextWrap}>
                  <Text style={styles.bannerTitle}>Tous méthodes de paiement acceptés</Text>
                  <View style={styles.paymentBadgesRow}>
                    <View style={styles.paymentBadgesGroup}>
                      <View style={[styles.coinDot, { backgroundColor: '#26A17B' }]}><Text style={styles.coinDotText}>T</Text></View>
                      <View style={[styles.coinDot, { backgroundColor: '#2775CA' }]}><Text style={styles.coinDotText}>$</Text></View>
                      <View style={[styles.coinDot, { backgroundColor: '#0284C7' }]}><Text style={styles.coinDotText}>€</Text></View>
                      <View style={[styles.coinDot, { backgroundColor: '#FFC759' }]}><Text style={[styles.coinDotText, { color: '#0F172A' }]}>D</Text></View>
                    </View>
                    <Text style={styles.paymentMethodLabel}>Stablecoins (USDT, USDC, EURC) & DZY</Text>
                  </View>

                  <View style={styles.paymentBadgesRow}>
                    <View style={styles.cardsRow}>
                      <Text style={[styles.cardTag, { color: '#1A1F71' }]}>VISA</Text>
                      <View style={styles.mcDotWrap}>
                        <View style={[styles.mcDot, { backgroundColor: '#EB001B' }]} />
                        <View style={[styles.mcDot, { backgroundColor: '#F79E1B', marginLeft: -5 }]} />
                      </View>
                      <Text style={[styles.cardTag, { color: '#006FCF', fontSize: 8 }]}>AMEX</Text>
                    </View>
                    <Text style={styles.paymentMethodLabel}>Visa, Mastercard, American Express cards</Text>
                  </View>

                  <View style={styles.paymentBadgesRow}>
                    <View style={styles.mmBadge}>
                      <Text style={styles.mmBadgeText}>MM</Text>
                    </View>
                    <Text style={styles.paymentMethodLabel}>African Mobile Money</Text>
                  </View>
                </View>
              </View>

            </View>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: SCREENSHOT 1 - CHOISIR UN PRODUIT OU SERVICE (MTN RECHARGE)       */}
          {/* ========================================================================= */}
          {selectedService !== null && (
            <View>
              {/* Selected Service Header Selector */}
              <TouchableOpacity style={styles.serviceSelectorCard} onPress={() => setSelectedService(null)}>
                <View style={[styles.serviceIconBg, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#10B981" />
                </View>
                <View style={styles.serviceTextWrap}>
                  <Text style={styles.serviceTitle}>Recharge mobile</Text>
                  <Text style={styles.serviceSubtitle}>Crédits mobiles instantanés pour vos proches.</Text>
                </View>
                <View style={styles.changeBtnRow}>
                  <Text style={styles.changeBtnText}>Changer</Text>
                  <Ionicons name="chevron-down" size={14} color="#1A2840" style={{ marginLeft: 2 }} />
                </View>
              </TouchableOpacity>

              {/* Operator Search Input */}
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un opérateur..."
                  placeholderTextColor="#9CA3AF"
                  value={operatorSearch}
                  onChangeText={setOperatorSearch}
                />
              </View>

              {/* Opérateur détecté Section */}
              <Text style={styles.sectionTitle}>Opérateur détecté</Text>

              <TouchableOpacity 
                style={[styles.operatorCard, selectedOperator === 'MTN' && styles.operatorCardActive]}
                onPress={() => setSelectedOperator('MTN')}
                activeOpacity={0.8}
              >
                {/* MTN Yellow Square Logo */}
                <View style={styles.mtnLogoSquare}>
                  <View style={styles.mtnOval}>
                    <Text style={styles.mtnLogoText}>MTN</Text>
                  </View>
                </View>

                <View style={styles.operatorInfo}>
                  <Text style={styles.operatorTitle}>MTN Nigeria</Text>
                  <Text style={styles.operatorSubtitle}>Rechargez des crédits MTN</Text>
                </View>

                <View style={styles.operatorRightActions}>
                  <View style={styles.selectedCheckCircle}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#1A2840" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>

              {/* Autres opérateurs non listés ? Card */}
              <View style={styles.unlistedCard}>
                <View style={styles.unlistedShieldIcon}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#071D54" />
                </View>
                <View style={styles.unlistedContent}>
                  <Text style={styles.unlistedTitle}>Autres opérateurs non listés ?</Text>
                  <Text style={styles.unlistedSubtitle}>Utilisez notre recherche pour trouver d'autres opérateurs disponibles.</Text>
                </View>
                <TouchableOpacity style={styles.unlistedSearchBtn} onPress={() => setToast({ title: 'Recherche opérateurs', message: 'Recherche étendue en Afrique ouverte.' })}>
                  <Ionicons name="search-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                  <Text style={styles.unlistedSearchText}>Rechercher</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Fixed Bottom CTA for Mode 2 (Screenshot 1) */}
        {selectedService !== null && (
          <View style={styles.bottomFixedContainer}>
            <TouchableOpacity 
              style={styles.ctaButton} 
              onPress={() => navigation.navigate('MobileRechargeScreen', { operator: selectedOperator, beneficiary })}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#1A2840" />
            </TouchableOpacity>

            {/* Step Indicator */}
            <View style={styles.stepProgressRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
              <Text style={styles.stepProgressText}>Paiement 3/4 : Produit ou service</Text>
            </View>

            {/* Progress Bar 4 Segments */}
            <View style={styles.progressBarRow}>
              <View style={[styles.progressSegment, styles.segmentActive]} />
              <View style={[styles.progressSegment, styles.segmentActive]} />
              <View style={[styles.progressSegment, styles.segmentActive]} />
              <View style={[styles.progressSegment, styles.segmentInactive]} />
            </View>
          </View>
        )}

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backButton: { padding: 4, marginRight: 4 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 16 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  beneficiaryCard: { backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 16, padding: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  beneficiaryMain: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6' },
  verifiedCheckBadge: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFFDF0' },
  beneficiaryDetails: { flex: 1 },
  beneficiaryName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginBottom: 2 },
  beneficiaryRelation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  detailText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1A2840' },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  editButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
  
  /* Services Grid Styles (Screenshot 2) */
  servicesGridContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginBottom: 14 },
  serviceRowTwo: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  serviceTileHalf: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 18, padding: 14, minHeight: 140, justifyContent: 'spaceBetween', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  tileHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tileIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  tileTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 4 },
  tileSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#64748B', lineHeight: 14 },
  serviceTileFull: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 18, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  tileFullLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  tileIconBgLarge: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  multiIconGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  tileFullTextWrap: { flex: 1 },

  /* Accepted Payment Banner */
  paymentMethodsBanner: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, padding: 16, marginTop: 8, marginBottom: 20, flexDirection: 'row' },
  shieldIconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#0F172A', marginBottom: 10 },
  paymentBadgesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  paymentBadgesGroup: { flexDirection: 'row', marginRight: 8 },
  coinDot: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: -4, borderWidth: 1, borderColor: '#FFFFFF' },
  coinDotText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#FFFFFF' },
  paymentMethodLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#475569', flex: 1 },
  cardsRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTag: { fontFamily: 'Inter_700Bold', fontSize: 9, marginRight: 3 },
  mcDotWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 3 },
  mcDot: { width: 8, height: 8, borderRadius: 4 },
  mmBadge: { backgroundColor: '#FFC759', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, marginRight: 8 },
  mmBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#0F172A' },

  /* Operator Selection Styles (Screenshot 1) */
  serviceSelectorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, padding: 12, marginHorizontal: 16, marginBottom: 16 },
  serviceIconBg: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceTextWrap: { flex: 1 },
  serviceTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  serviceSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  changeBtnRow: { flexDirection: 'row', alignItems: 'center' },
  changeBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 18, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#1A2840', outlineStyle: 'none' },
  operatorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 12, marginHorizontal: 16, marginBottom: 18 },
  operatorCardActive: { backgroundColor: '#FFFDF5', borderColor: '#FFC759' },
  mtnLogoSquare: { width: 44, height: 44, backgroundColor: '#FFCC00', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mtnOval: { width: 34, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  mtnLogoText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#000000' },
  operatorInfo: { flex: 1 },
  operatorTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  operatorSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280' },
  operatorRightActions: { flexDirection: 'row', alignItems: 'center' },
  selectedCheckCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center' },
  unlistedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 16 },
  unlistedShieldIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 12 },
  unlistedContent: { flex: 1, paddingRight: 6 },
  unlistedTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', marginBottom: 2 },
  unlistedSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', lineHeight: 14 },
  unlistedSearchBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  unlistedSearchText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
  bottomFixedContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  ctaButton: { backgroundColor: '#FFC759', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 12, marginBottom: 10 },
  ctaButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginRight: 8 },
  stepProgressRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepProgressText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#6B7280' },
  progressBarRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingHorizontal: 40 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  segmentActive: { backgroundColor: '#FFC759' },
  segmentInactive: { backgroundColor: '#E5E7EB' },
});
