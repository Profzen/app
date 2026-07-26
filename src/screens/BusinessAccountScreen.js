import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function BusinessAccountScreen() {
  const navigation = useNavigation();
  const [toast, setToast] = useState(null);
  const { accountMode, setAccountMode, language, t } = useApp();

  const activeAccount = accountMode || 'personal';
  const [confirmModalTarget, setConfirmModalTarget] = useState(null);
  const [hasBusinessAccount, setHasBusinessAccount] = useState(true);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleRequestSwitch = (type) => {
    if (type === activeAccount) {
      setToast({
        title: language === 'fr' ? 'Compte déjà actif' : 'Account Already Active',
        message: type === 'business' 
          ? (language === 'fr' ? 'Vous êtes déjà sur le Compte Business.' : 'You are already on the Business Account.')
          : (language === 'fr' ? 'Vous êtes déjà sur le Compte Personnel.' : 'You are already on the Personal Account.')
      });
      return;
    }
    setConfirmModalTarget(type);
  };

  const handleConfirmSwitch = () => {
    const target = confirmModalTarget;
    setAccountMode(target);
    setConfirmModalTarget(null);
    setToast({
      title: target === 'business' 
        ? (language === 'fr' ? 'Compte Business Actif' : 'Business Account Active') 
        : (language === 'fr' ? 'Compte Personnel Actif' : 'Personal Account Active'),
      message: target === 'business'
        ? (language === 'fr' ? 'Mode Marchand Pro activé. L\'accueil affichera le Dashboard Business.' : 'Merchant Pro mode activated. Home will show Business Dashboard.')
        : (language === 'fr' ? 'Mode Personnel activé. L\'accueil affichera la Home standard.' : 'Personal mode activated. Home will show standard view.')
    });
  };

  const handleGoToBusinessHome = () => {
    navigation.navigate('CashRegisterScreen');
  };

  const handleAddBusiness = () => {
    setHasBusinessAccount(true);
    setAccountMode('business');
    navigation.navigate('CashRegisterScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Retour">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.pageTitle}>{t('businessAccount', 'Business Account')}</Text>
              <Text style={styles.pageSubtitle}>{language === 'fr' ? 'Gestion du profil marchand & basculement' : 'Merchant Profile & Mode Switcher'}</Text>
            </View>
          </View>

          {/* Account Mode Switcher */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? "COMPTE EN COURS D'UTILISATION" : 'CURRENT ACTIVE ACCOUNT'}</Text>
          
          {/* Option 1: Personal Account */}
          <TouchableOpacity
            style={[styles.accountCard, activeAccount === 'personal' && styles.accountCardActive]}
            onPress={() => handleRequestSwitch('personal')}
          >
            <View style={styles.accountCardLeft}>
              <View style={[styles.avatarCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="person" size={22} color="#3B82F6" />
              </View>
              <View style={styles.accountTextInfo}>
                <Text style={styles.accountTypeTitle}>{language === 'fr' ? 'Compte Personnel' : 'Personal Account'}</Text>
                <Text style={styles.accountSubText}>David Mensah • david.mensah@email.com</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              {activeAccount === 'personal' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Option 2: Business Account (Factice) */}
          {hasBusinessAccount ? (
            <TouchableOpacity
              style={[styles.accountCard, activeAccount === 'business' && styles.accountCardActive]}
              onPress={() => handleRequestSwitch('business')}
            >
              <View style={styles.accountCardLeft}>
                <View style={[styles.avatarCircle, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="storefront" size={22} color="#8B5CF6" />
                </View>
                <View style={styles.accountTextInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.accountTypeTitle}>David's Electronics Store</Text>
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  </View>
                  <Text style={styles.accountSubText}>N° ID: DZY-BIZ-8890 • Lomé, Togo</Text>
                </View>
              </View>
              <View style={styles.radioOuter}>
                {activeAccount === 'business' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noBusinessCard}>
              <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
              <Text style={styles.noBusinessText}>{language === 'fr' ? "Aucun compte Business n'est encore enregistré." : 'No Business Account registered yet.'}</Text>
            </View>
          )}

          {/* Business Details & Shortcuts */}
          {hasBusinessAccount && (
            <>
              <Text style={styles.sectionHeader}>{language === 'fr' ? 'DÉTAILS DU COMPTE BUSINESS' : 'BUSINESS ACCOUNT DETAILS'}</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{language === 'fr' ? 'Nom commercial :' : 'Business Name:'}</Text>
                  <Text style={styles.infoValue}>David's Tech & Electronics</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{language === 'fr' ? 'Catégorie :' : 'Category:'}</Text>
                  <Text style={styles.infoValue}>High-Tech & Services Digital</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="qr-code-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{language === 'fr' ? 'Caisse TPE / QR Code :' : 'POS Terminal / QR Code:'}</Text>
                  <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '700' }]}>{language === 'fr' ? 'Actif & Prêt' : 'Active & Ready'}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{language === 'fr' ? 'Cryptos acceptées :' : 'Accepted Cryptos:'}</Text>
                  <Text style={styles.infoValue}>USDT, USDC, EURC, DZY</Text>
                </View>
              </View>

              {/* Main Action Button to Business Home */}
              <TouchableOpacity style={styles.primaryBizBtn} onPress={handleGoToBusinessHome}>
                <Ionicons name="storefront-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBizBtnText}>{language === 'fr' ? 'Ouvrir l\'Interface Business (Caisse TPE)' : 'Open Business Interface (POS Cashier)'}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Add / Create New Business Account Button */}
          <TouchableOpacity style={styles.addBizBtn} onPress={handleAddBusiness}>
            <Ionicons name="add-circle-outline" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={styles.addBizBtnText}>
              {hasBusinessAccount 
                ? (language === 'fr' ? 'Ajouter / Configurer un autre compte Business' : 'Add / Configure another Business account') 
                : (language === 'fr' ? 'Créer mon premier compte Business' : 'Create my first Business account')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Modal de Confirmation de Basculement */}
        <Modal
          visible={confirmModalTarget !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setConfirmModalTarget(null)}
        >
          <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContainer}>
              <View style={[modalStyles.iconCircle, { backgroundColor: confirmModalTarget === 'business' ? '#F5F3FF' : '#EFF6FF' }]}>
                <Ionicons
                  name={confirmModalTarget === 'business' ? "storefront" : "person"}
                  size={28}
                  color={confirmModalTarget === 'business' ? "#8B5CF6" : "#3B82F6"}
                />
              </View>

              <Text style={modalStyles.modalTitle}>{language === 'fr' ? 'Confirmer le basculement' : 'Confirm Account Switch'}</Text>
              <Text style={modalStyles.modalMessage}>
                {confirmModalTarget === 'business'
                  ? (language === 'fr' ? 'Voulez-vous basculer vers votre Compte Business (David\'s Electronics Store) ? L\'interface d\'accueil basculera en mode Marchand Pro.' : 'Switch to your Business Account (David\'s Electronics Store)? Home view will switch to Merchant Pro mode.')
                  : (language === 'fr' ? 'Voulez-vous basculer vers votre Compte Personnel ? L\'interface d\'accueil repassera en mode Particulier.' : 'Switch back to your Personal Account? Home view will switch to Personal mode.')}
              </Text>

              <View style={modalStyles.modalActions}>
                <TouchableOpacity
                  style={modalStyles.cancelBtn}
                  onPress={() => setConfirmModalTarget(null)}
                >
                  <Text style={modalStyles.cancelBtnText}>{language === 'fr' ? 'Annuler' : 'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.confirmBtn, { backgroundColor: confirmModalTarget === 'business' ? '#8B5CF6' : '#3B82F6' }]}
                  onPress={handleConfirmSwitch}
                >
                  <Text style={modalStyles.confirmBtnText}>{language === 'fr' ? 'Confirmer' : 'Confirm'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BottomNavBar activeTab="More" />
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingTop: Platform.OS === 'android' ? 36 : 10 },
  backButton: { paddingRight: 14, paddingVertical: 4 },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', marginTop: 2 },
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.8, marginTop: 14, marginBottom: 8, marginLeft: 4 },
  accountCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#F0F2F5', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  accountCardActive: { borderColor: '#8B5CF6', backgroundColor: '#F9F8FF' },
  accountCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  avatarCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  accountTextInfo: { flex: 1 },
  accountTypeTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  accountSubText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 },
  proBadge: { backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  proBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#FFFFFF' },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#8B5CF6' },
  noBusinessCard: { backgroundColor: '#FFFBEB', borderRadius: 14, borderWidth: 1, borderColor: '#FDE68A', padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  noBusinessText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#B45309', marginLeft: 10, flex: 1 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', paddingHorizontal: 16, paddingVertical: 6, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46, paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  rowIcon: { marginRight: 10 },
  infoLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280', width: 140 },
  infoValue: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  primaryBizBtn: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#FFC759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
  primaryBizBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
  addBizBtn: { height: 48, borderRadius: 14, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#DDD6FE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addBizBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#8B5CF6' },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
