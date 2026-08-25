import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Modal, Platform, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function BusinessAccountScreen() {
  const navigation = useNavigation();
  const [toast, setToast] = useState(null);
  const { accountMode, setAccountMode, language, t, user } = useApp();

  const isMerchant = user?.role === 'merchant';
  const hasBusinessAccount = isMerchant && !!user?.merchantProfile;
  const merchantName = user?.merchantProfile?.shop_name || "David's Electronics Store";
  const merchantId = user?.merchantProfile?.shop_unique_id || user?.merchantProfile?.id || "N/A";
  const merchantLocation = user?.merchantProfile ? `${user?.merchantProfile.city_village}, ${user?.merchantProfile.country}` : 'Lomé, Togo';
  const merchantCategory = user?.merchantProfile?.shop_categories || 'Retail / Services';
  const linkedPersonalEmail = user?.merchantProfile?.linked_personal_email || t('biz.personal_type', 'Personal');

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalType, setInfoModalType] = useState(null); // 'merchant' | 'personal'

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleShowInfo = (type) => {
    // If it's already their active role, don't show info
    if (type === 'merchant' && isMerchant) return;
    if (type === 'personal' && !isMerchant) return;
    
    setInfoModalType(type);
    setInfoModalVisible(true);
  };

  const handleLogout = async () => {
    setInfoModalVisible(false);
    // Ideally clear Supabase session here
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const handleGoToBusinessHome = () => {
    navigation.navigate('CashRegisterScreen');
  };

  const handleAddBusiness = () => {
    Linking.openURL('https://dizzitup.com/merchant-login-registration?mode=signup');
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
              <Text style={styles.pageTitle}>{t('biz.title', 'Business Account')}</Text>
              <Text style={styles.pageSubtitle}>{t('biz.subtitle', 'Merchant Profile & Mode Switcher')}</Text>
            </View>
          </View>

          {/* Account Mode Switcher */}
          <Text style={styles.sectionHeader}>{t('biz.current_active', 'CURRENT ACTIVE ACCOUNT')}</Text>
          
          {/* Option 1: Personal Account */}
          <TouchableOpacity
            style={[styles.accountCard, !isMerchant && styles.accountCardActive]}
            onPress={() => handleShowInfo('personal')}
            activeOpacity={0.8}
          >
            <View style={styles.accountCardLeft}>
              <View style={[styles.avatarCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="person" size={22} color="#3B82F6" />
              </View>
              <View style={styles.accountTextInfo}>
                <Text style={styles.accountTypeTitle}>{t('biz.personal_account', 'Personal Account')}</Text>
                <Text style={styles.accountSubText}>
                  {!isMerchant ? (user?.name || 'User') : t('biz.personal_account', 'Personal Account')} • {!isMerchant ? (user?.email || 'user@email.com') : linkedPersonalEmail}
                </Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              {!isMerchant && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Option 2: Business Account */}
          {hasBusinessAccount ? (
            <TouchableOpacity
              style={[styles.accountCard, isMerchant && styles.accountCardActive]}
              onPress={() => handleShowInfo('merchant')}
              activeOpacity={0.8}
            >
              <View style={styles.accountCardLeft}>
                <View style={[styles.avatarCircle, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="storefront" size={22} color="#8B5CF6" />
                </View>
                <View style={styles.accountTextInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.accountTypeTitle}>{merchantName}</Text>
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  </View>
                  <Text style={styles.accountSubText}>N° ID: {merchantId} • {merchantLocation}</Text>
                </View>
              </View>
              <View style={styles.radioOuter}>
                {isMerchant && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.noBusinessCard} 
              onPress={() => handleShowInfo('merchant')}
              activeOpacity={0.8}
            >
              <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
              <Text style={styles.noBusinessText}>{t('biz.no_business_account', 'No Business Account registered yet.')}</Text>
            </TouchableOpacity>
          )}

          {/* Business Details & Shortcuts */}
          {hasBusinessAccount && (
            <>
              <Text style={styles.sectionHeader}>{t('biz.details_title', 'BUSINESS ACCOUNT DETAILS')}</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{t('biz.business_name_label', 'Business Name:')}</Text>
                  <Text style={styles.infoValue}>{merchantName}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{t('biz.category_label', 'Category:')}</Text>
                  <View style={styles.categoryPillContainer}>
                    {merchantCategory.split(',').map((cat, index) => (
                      <View key={index} style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>{cat.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="qr-code-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{t('biz.pos_qr_label', 'POS Terminal / QR Code:')}</Text>
                  <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '700' }]}>{t('biz.active_ready', 'Active & Ready')}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>{t('biz.stablecoins_crypto_label', 'Stablecoins & Crypto:')}</Text>
                  <Text style={styles.infoValue}>USDT, USDC, EURC, DZY</Text>
                </View>
              </View>

              {/* Main Action Button to Business Home */}
              <TouchableOpacity style={styles.primaryBizBtn} onPress={handleGoToBusinessHome}>
                <Ionicons name="storefront-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBizBtnText}>{t('biz.open_pos', 'Open Business Interface (POS Cashier)')}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Add / Create New Business Account Button */}
          <TouchableOpacity style={styles.addBizBtn} onPress={handleAddBusiness}>
            <Ionicons name="add-circle-outline" size={20} color="#FFC759" style={{ marginRight: 8 }} />
            <Text style={styles.addBizBtnText}>
              {hasBusinessAccount 
                ? t('biz.add_another', 'Add / Configure another Business account') 
                : t('biz.create_first', 'Create my first Business account')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal de Confirmation / Information de Basculement */}
        <Modal
          visible={infoModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setInfoModalVisible(false)}
        >
          <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContainer}>
              <View style={[modalStyles.iconCircle, { backgroundColor: infoModalType === 'merchant' ? '#F5F3FF' : '#EFF6FF' }]}>
                <Ionicons
                  name={infoModalType === 'merchant' ? "storefront" : "person"}
                  size={28}
                  color={infoModalType === 'merchant' ? "#8B5CF6" : "#3B82F6"}
                />
              </View>

              <Text style={modalStyles.modalTitle}>{t('biz.switch_informational_title', 'Wallet Separation')}</Text>
              <Text style={modalStyles.modalMessage}>
                {t('biz.switch_informational_msg', 'For security and wallet separation, Merchant and Personal accounts use different logins. Please log out and log back in with your {type} email: {email}')
                  .replace('{type}', infoModalType === 'merchant' ? t('biz.merchant_type', 'Merchant') : t('biz.personal_type', 'Personal'))
                  .replace('{email}', infoModalType === 'merchant' ? 'merchant@email.com' : linkedPersonalEmail)}
              </Text>

              <View style={modalStyles.modalActions}>
                <TouchableOpacity
                  style={modalStyles.cancelBtn}
                  onPress={() => setInfoModalVisible(false)}
                >
                  <Text style={modalStyles.cancelBtnText}>{t('biz.close_btn', 'Close')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.confirmBtn, { backgroundColor: infoModalType === 'merchant' ? '#8B5CF6' : '#3B82F6' }]}
                  onPress={handleLogout}
                >
                  <Text style={modalStyles.confirmBtnText}>{t('biz.logout_btn', 'Log Out Now')}</Text>
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
  safeArea: { flex: 1, backgroundColor: '#FAFAFC',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, },
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
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 46, paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  rowIcon: { marginRight: 8 },
  infoLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280', flexShrink: 0, marginRight: 8 },
  infoValue: { flex: 1, textAlign: 'right', fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  primaryBizBtn: { height: 48, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: '0px 4px 8px #FFC759' },
  primaryBizBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840' },
  addBizBtn: { height: 46, borderRadius: 14, backgroundColor: '#20365B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  addBizBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  categoryPillContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 4, marginVertical: 2 },
  categoryPill: { backgroundColor: '#F0F2F5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginBottom: 2 },
  categoryPillText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#475569' },
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
    boxShadow: '0px 10px 20px #000',
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
