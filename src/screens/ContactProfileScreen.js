import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import Avatar from '../components/Avatar';

import * as Clipboard from 'expo-clipboard';

import { useApp } from '../context/AppContext';

export default function ContactProfileScreen({ route }) {
  const { t } = useApp();
  const navigation = useNavigation();
  const contact = route?.params?.contact;

  if (!contact) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.contactName}>Contact introuvable</Text>
          <TouchableOpacity style={styles.btnSendMoney} onPress={() => navigation.goBack()}>
             <Text style={styles.btnSendMoneyText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCopy = async (text, type) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    AppToast.showSuccess(`${type} copié!`);
  };

  const handleLink = (url) => {
    Linking.openURL(url).catch(() => AppToast.showError("Impossible d'ouvrir le lien"));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#20365B" />
          </TouchableOpacity>
          <View style={styles.headerRightActionsPill}>
            <TouchableOpacity style={styles.actionPillBtn} onPress={() => navigation.navigate('EditBeneficiaryScreen', { isEditing: true, beneficiary: contact })}>
              <Ionicons name="pencil-outline" size={18} color="#20365B" />
            </TouchableOpacity>
            <View style={styles.pillDivider} />
            <TouchableOpacity style={styles.actionPillBtn} onPress={() => Alert.alert('Options', 'Voulez-vous bloquer ou supprimer ce contact?', [{text: 'Annuler', style: 'cancel'}, {text: 'Supprimer', style: 'destructive', onPress: () => AppToast.showInfo('Fonctionnalité en cours de développement') }])}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#20365B" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Profile Header Section */}
          <View style={styles.profileHeaderSection}>
            <View style={styles.avatarWrapper}>
              <Avatar image={contact.avatar_url || contact.image} name={contact.first_name ? `${contact.first_name} ${contact.last_name}` : contact.name} size={90} style={styles.avatarImage} />
              <View style={styles.badgeVerified}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            </View>

            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.relationText}>{contact.relation}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationFlagText}>{contact.flag}  {contact.location}</Text>
            </View>
          </View>

          {/* 2 Tabs Bar */}
          <View style={styles.tabsRowContainer}>
            <TouchableOpacity style={[styles.tabButton, styles.tabButtonActive]}>
              <Text style={styles.tabTextActive}>Informations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('ContactHistoryScreen', { contact: contact })}>
              <Text style={styles.tabTextInactive}>Historique</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Quick Action Cards Grid (Exact Mockup Icons) */}
          <View style={styles.quickActionsGrid}>
            
            {/* Card 1: envoyer des Stablecoins (Green Diagonal Arrow ↗) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('SendMoneyScreen', { contact })}>
              <View style={styles.quickCardIconBox}>
                <Ionicons name="trending-up" size={26} color="#10B981" />
              </View>
              <Text style={styles.quickCardText}>{t('home.actions.send_request', "Envoyer\nde l'argent")}</Text>
            </TouchableOpacity>

            {/* Card 2: Demander de l'argent (3 Stacked Golden Coins 🪙) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ReceiveFundsV2Screen', { contact })}>
              <View style={styles.quickCardIconBox}>
                <View style={styles.goldenCoinsStack}>
                  <View style={[styles.miniCoin, { top: 0, left: 4 }]} />
                  <View style={[styles.miniCoin, { top: 5, left: 0 }]} />
                  <View style={[styles.miniCoin, { top: 5, left: 8 }]} />
                </View>
              </View>
              <Text style={styles.quickCardText}>{t('contacts.quick_action_request_money', "Demander\nde l'argent")}</Text>
            </TouchableOpacity>

            {/* Card 3: Payer & Envoyer essentiels (Solid Blue Shopping Bag 🛍️) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ShopsScreen')}>
              <View style={styles.quickCardIconBox}>
                <Ionicons name="bag-handle" size={26} color="#0052FF" />
              </View>
              <Text style={styles.quickCardText}>{t('contacts.quick_action_1.title', "Payer &\nEnvoyer essentiels")}</Text>
            </TouchableOpacity>

            {/* Card 4: Inviter (Purple Person Plus 👤+) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('RewardsScreen')}>
              <View style={styles.quickCardIconBox}>
                <Ionicons name="person-add-outline" size={26} color="#8B5CF6" />
              </View>
              <Text style={styles.quickCardText}>{t('contacts.quick_action_5.title', 'Inviter')}</Text>
            </TouchableOpacity>

          </View>

          {/* Contact Details Information List */}
          <View style={styles.infoListCard}>
            
            {/* Row 1: Téléphone */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{(contact.phone || contact.raw_data?.phone) || 'Non renseigné'}</Text>
              </View>
              <View style={styles.infoActionIcons}>
                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleLink(`tel:${(contact.phone || contact.raw_data?.phone)}`)}>
                  <Ionicons name="call-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleLink(`sms:${(contact.phone || contact.raw_data?.phone)}`)}>
                  <Ionicons name="chatbubble-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 2: Email */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{(contact.email || contact.raw_data?.email) || 'Non renseigné'}</Text>
              </View>
              <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleLink(`mailto:${(contact.email || contact.raw_data?.email)}`)}>
                <Ionicons name="mail-outline" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 3: EVM wallet */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="wallet-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>EVM wallet</Text>
                <Text style={styles.infoValue}>{(contact.evm_address || contact.raw_data?.evm_address) ? `${(contact.evm_address || contact.raw_data?.evm_address).substring(0, 6)}...${(contact.evm_address || contact.raw_data?.evm_address).substring((contact.evm_address || contact.raw_data?.evm_address).length - 4)}` : 'Non renseigné'}</Text>
              </View>
              <View style={styles.infoActionIcons}>
                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleLink(`https://polygonscan.com/address/${(contact.evm_address || contact.raw_data?.evm_address)}`)}>
                  <Ionicons name="open-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleCopy((contact.evm_address || contact.raw_data?.evm_address), 'Valeur')}>
                  <Ionicons name="copy-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 4: Solana wallet */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="layers-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Solana wallet</Text>
                <Text style={styles.infoValue}>{(contact.solana_address || contact.raw_data?.solana_address) ? `${(contact.solana_address || contact.raw_data?.solana_address).substring(0, 4)}...${(contact.solana_address || contact.raw_data?.solana_address).substring((contact.solana_address || contact.raw_data?.solana_address).length - 4)}` : 'Non renseigné'}</Text>
              </View>
              <View style={styles.infoActionIcons}>
                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleLink(`https://solscan.io/account/${(contact.solana_address || contact.raw_data?.solana_address)}`)}>
                  <Ionicons name="open-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn} onPress={() => handleCopy((contact.solana_address || contact.raw_data?.solana_address), 'Valeur')}>
                  <Ionicons name="copy-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 5: Pays */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Pays</Text>
                <Text style={styles.infoValue}>{contact.location || 'Non renseigné'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>

            <View style={styles.rowDivider} />

            {/* Row 6: Groupe */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="people-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Groupe</Text>
                <Text style={styles.infoValue}>{contact.relation || 'Non renseigné'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>

            <View style={styles.rowDivider} />

            {/* Row 7: Parrain */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="heart-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Parrain</Text>
                <Text style={[styles.infoValue, { color: contact.isSponsor ? '#10B981' : '#6B7280' }]}>{contact.isSponsor ? 'Oui' : 'Non'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>

          </View>

          {/* Contact vérifié Shield Card Banner */}
          <View style={styles.verifiedBannerCard}>
            <View style={styles.verifiedShieldIcon}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#D97706" />
            </View>
            <View style={styles.verifiedBannerContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={styles.verifiedBannerTitle}>{t('beneficiary_management.profile.verified_contact', 'Contact vérifié')}</Text>
                <Ionicons name="checkmark-circle" size={14} color="#D97706" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.verifiedBannerSubtext}>
                {t('beneficiary_management.profile.verified_desc', "Ce contact est vérifié et peut recevoir de l'argent sur DizzitUp.")}
              </Text>
            </View>
            <View style={styles.verifiedCheckBadge}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>

          {/* Sticky Action CTA Button */}
          <TouchableOpacity 
            style={styles.btnSendMoney} 
            onPress={() => navigation.navigate('SendMoneyScreen', { contact })}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={18} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.btnSendMoneyText}>{t('wallet.actions.send', "envoyer des Stablecoins")}</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="contacts" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#20365B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  headerRightActionsPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 4, paddingVertical: 4, shadowColor: '#20365B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  actionPillBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  pillDivider: { width: 1, height: 18, backgroundColor: '#E2E8F0', marginHorizontal: 2 },
  
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 6, paddingBottom: 30 },
  profileHeaderSection: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 10 },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  badgeVerified: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 1 },
  contactName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840', marginBottom: 2 },
  relationText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationFlagText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A2840' },
  tabsRowContainer: { flexDirection: 'row', marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabButtonActive: { borderBottomWidth: 2, borderBottomColor: '#FFC759' },
  tabTextInactive: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  quickActionsGrid: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  quickCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  quickCardIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  goldenCoinsStack: { width: 24, height: 20, position: 'relative' },
  miniCoin: { width: 14, height: 11, borderRadius: 5, backgroundColor: '#FFC759', borderWidth: 1.5, borderColor: '#D97706', position: 'absolute' },
  quickCardText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#1A2840', textAlign: 'center', lineHeight: 14 },
  infoListCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 18, marginHorizontal: 16, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  infoIconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  infoTextGroup: { flex: 1 },
  infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 1 },
  infoValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  infoActionIcons: { flexDirection: 'row', gap: 6 },
  actionCircleBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  rowDivider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 14 },
  verifiedBannerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF0', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 16 },
  verifiedShieldIcon: { marginRight: 10 },
  verifiedBannerContent: { flex: 1 },
  verifiedBannerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  verifiedBannerSubtext: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 15 },
  verifiedCheckBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  btnSendMoney: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 12, marginHorizontal: 16, marginBottom: 10 },
  btnSendMoneyText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' }
});
