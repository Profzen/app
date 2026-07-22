import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppToast from '../components/AppToast';

export default function ChooseServiceScreen() {
  const navigation = useNavigation();
  const [operatorSearch, setOperatorSearch] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('MTN');
  const [toast, setToast] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header Top Bar */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Choisir un produit ou service</Text>
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
          <Text style={styles.headerSubtitle}>Sélectionnez le produit ou le service que vous souhaitez payer.</Text>
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
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' }} 
                  style={styles.avatar} 
                />
                <View style={styles.verifiedCheckBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.beneficiaryDetails}>
                <Text style={styles.beneficiaryName}>Mama Kemi Adebayo</Text>
                <Text style={styles.beneficiaryRelation}>Mère</Text>
                
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>+234 802 123 4567</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>Lagos, Nigeria 🇳🇬</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('PayBillsScreen')}>
                <Ionicons name="create-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Service Selector Card */}
          <TouchableOpacity style={styles.serviceSelectorCard} onPress={() => setToast({ title: 'Changer de service', message: 'Recharge mobile, Factures, Internet & TV.' })}>
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

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Fixed Bottom CTA & Step Progress */}
        <View style={styles.bottomFixedContainer}>
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => navigation.navigate('MobileRechargeScreen')}
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

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 50 },
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  backButton: { padding: 4, marginRight: 4 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 16 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingBottom: 150 },
  beneficiaryCard: { backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 16, padding: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  beneficiaryMain: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F3F4F6' },
  verifiedCheckBadge: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFFDF0' },
  beneficiaryDetails: { flex: 1 },
  beneficiaryName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', marginBottom: 2 },
  beneficiaryRelation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  detailText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1A2840' },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  editButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
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
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', paddingHorizontal: 16, marginBottom: 12 },
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

