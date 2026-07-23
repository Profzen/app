import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';

export default function BusinessAccountScreen() {
  const navigation = useNavigation();
  const [toast, setToast] = useState(null);

  // Active account mode state: 'personal' | 'business'
  const [activeAccount, setActiveAccount] = useState('business');
  const [hasBusinessAccount, setHasBusinessAccount] = useState(true);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleSwitchAccount = (type) => {
    setActiveAccount(type);
    setToast({
      title: type === 'business' ? 'Compte Business Actif' : 'Compte Personnel Actif',
      message: type === 'business' ? 'Vous naviguez en mode Compte Marchand Pro.' : 'Vous naviguez en mode Compte Personnel.'
    });
  };

  const handleGoToBusinessHome = () => {
    navigation.navigate('CashRegisterScreen');
  };

  const handleAddBusiness = () => {
    setHasBusinessAccount(true);
    setActiveAccount('business');
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
              <Text style={styles.pageTitle}>Business Account</Text>
              <Text style={styles.pageSubtitle}>Gestion du profil marchand & basculement</Text>
            </View>
          </View>

          {/* Account Mode Switcher */}
          <Text style={styles.sectionHeader}>COMPTE EN COURS D'UTILISATION</Text>
          
          {/* Option 1: Personal Account */}
          <TouchableOpacity
            style={[styles.accountCard, activeAccount === 'personal' && styles.accountCardActive]}
            onPress={() => handleSwitchAccount('personal')}
          >
            <View style={styles.accountCardLeft}>
              <View style={[styles.avatarCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="person" size={22} color="#3B82F6" />
              </View>
              <View style={styles.accountTextInfo}>
                <Text style={styles.accountTypeTitle}>Compte Personnel</Text>
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
              onPress={() => handleSwitchAccount('business')}
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
              <Text style={styles.noBusinessText}>Aucun compte Business n'est encore enregistré.</Text>
            </View>
          )}

          {/* Business Details & Shortcuts */}
          {hasBusinessAccount && (
            <>
              <Text style={styles.sectionHeader}>DÉTAILS DU COMPTE BUSINESS</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>Nom commercial :</Text>
                  <Text style={styles.infoValue}>David's Tech & Electronics</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="pricetag-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>Catégorie :</Text>
                  <Text style={styles.infoValue}>High-Tech & Services Digital</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="qr-code-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>Caisse TPE / QR Code :</Text>
                  <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '700' }]}>Actif & Prêt</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={18} color="#6B7280" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>Cryptos acceptées :</Text>
                  <Text style={styles.infoValue}>USDT, USDC, EURC, DZY</Text>
                </View>
              </View>

              {/* Main Action Button to Business Home */}
              <TouchableOpacity style={styles.primaryBizBtn} onPress={handleGoToBusinessHome}>
                <Ionicons name="storefront-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBizBtnText}>Ouvrir l'Interface Business (Caisse TPE)</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Add / Create New Business Account Button */}
          <TouchableOpacity style={styles.addBizBtn} onPress={handleAddBusiness}>
            <Ionicons name="add-circle-outline" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={styles.addBizBtnText}>
              {hasBusinessAccount ? 'Ajouter / Configurer un autre compte Business' : 'Créer mon premier compte Business'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" language="fr" />
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
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
