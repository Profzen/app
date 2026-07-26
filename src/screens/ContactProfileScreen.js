import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

import { CONTACTS_MOCK } from '../mocks/contactsMock';

export default function ContactProfileScreen({ route }) {
  const navigation = useNavigation();
  const contactParam = route?.params?.contact;
  const contact = contactParam || CONTACTS_MOCK[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.actionSquareBtn}>
              <Ionicons name="pencil-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionSquareBtn}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Profile Header Section */}
          <View style={styles.profileHeaderSection}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={typeof contact.avatar === 'number' ? contact.avatar : (contact.image ? { uri: contact.image } : require('../../assets/avatars/david.jpg'))} 
                style={styles.avatarImage} 
              />
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
            
            {/* Card 1: Envoyer de l'argent (Green Diagonal Arrow ↗) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('SendMoneyScreen')}>
              <View style={styles.quickCardIconBox}>
                <Ionicons name="trending-up" size={26} color="#10B981" />
              </View>
              <Text style={styles.quickCardText}>Envoyer{'\n'}de l'argent</Text>
            </TouchableOpacity>

            {/* Card 2: Demander de l'argent (3 Stacked Golden Coins 🪙) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('SendMoneyScreen')}>
              <View style={styles.quickCardIconBox}>
                <View style={styles.goldenCoinsStack}>
                  <View style={[styles.miniCoin, { top: 0, left: 4 }]} />
                  <View style={[styles.miniCoin, { top: 5, left: 0 }]} />
                  <View style={[styles.miniCoin, { top: 5, left: 8 }]} />
                </View>
              </View>
              <Text style={styles.quickCardText}>Demander{'\n'}de l'argent</Text>
            </TouchableOpacity>

            {/* Card 3: Payer & Envoyer essentiels (Solid Blue Shopping Bag 🛍️) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ShopsScreen')}>
              <View style={styles.quickCardIconBox}>
                <Ionicons name="bag-handle" size={26} color="#0052FF" />
              </View>
              <Text style={styles.quickCardText}>Payer &{'\n'}Envoyer essentiels</Text>
            </TouchableOpacity>

            {/* Card 4: Inviter (Purple Person Plus 👤+) */}
            <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ContactsScreen')}>
              <View style={styles.quickCardIconBox}>
                <Ionicons name="person-add-outline" size={26} color="#8B5CF6" />
              </View>
              <Text style={styles.quickCardText}>Inviter</Text>
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
                <Text style={styles.infoValue}>+228 90 12 34 56</Text>
              </View>
              <View style={styles.infoActionIcons}>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <Ionicons name="call-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn}>
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
                <Text style={styles.infoValue}>johndoe@gmail.com</Text>
              </View>
              <TouchableOpacity style={styles.actionCircleBtn}>
                <Ionicons name="mail-outline" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 3: Mobile */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="wallet-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Mobile</Text>
                <Text style={styles.infoValue}>+228 90 12 34 56</Text>
              </View>
              <TouchableOpacity style={styles.actionCircleBtn}>
                <Ionicons name="copy-outline" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 4: EVM wallet */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="logo-ethereum" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>EVM wallet</Text>
                <Text style={styles.infoValue}>0xA1B2...3C4D5E</Text>
              </View>
              <View style={styles.infoActionIcons}>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <Ionicons name="open-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <Ionicons name="copy-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 5: Solana wallet */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="layers-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Solana wallet</Text>
                <Text style={styles.infoValue}>8xZ7...9AbC</Text>
              </View>
              <View style={styles.infoActionIcons}>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <Ionicons name="open-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircleBtn}>
                  <Ionicons name="copy-outline" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* Row 6: Pays */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Pays</Text>
                <Text style={styles.infoValue}>Togo</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>

            <View style={styles.rowDivider} />

            {/* Row 7: Groupe */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="people-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Groupe</Text>
                <Text style={styles.infoValue}>Famille</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>

            <View style={styles.rowDivider} />

            {/* Row 8: Parrain */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="heart-outline" size={18} color="#6B7280" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Parrain</Text>
                <Text style={[styles.infoValue, { color: '#10B981' }]}>Oui</Text>
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
                <Text style={styles.verifiedBannerTitle}>Contact vérifié</Text>
                <Ionicons name="checkmark-circle" size={14} color="#D97706" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.verifiedBannerSubtext}>
                Ce contact est vérifié et peut recevoir de l'argent sur DizzitUp.
              </Text>
            </View>
            <View style={styles.verifiedCheckBadge}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>

          {/* Activité récente Section */}
          <View style={styles.activityHeaderRow}>
            <Text style={styles.activityTitleText}>Activité récente</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('ContactHistoryScreen')}>
              <Text style={styles.viewAllText}>Voir tout</Text>
              <Ionicons name="arrow-forward" size={14} color="#0052FF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.activityContainerCard}>
            <TouchableOpacity style={styles.activityRow} onPress={() => navigation.navigate('ContactHistoryScreen')}>
              <View style={[styles.activityIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="arrow-up-right-outline" size={18} color="#10B981" />
              </View>
              <View style={styles.activityMainContent}>
                <Text style={styles.activityItemTitle}>Vous avez envoyé de l'argent</Text>
                <Text style={styles.activityDateText}>23 avril 2024 • 14:32</Text>
              </View>
              <Text style={styles.activityAmountNegative}>- 50,00 DZ</Text>
              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity style={styles.activityRow} onPress={() => navigation.navigate('ContactHistoryScreen')}>
              <View style={[styles.activityIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="arrow-down-outline" size={18} color="#D97706" />
              </View>
              <View style={styles.activityMainContent}>
                <Text style={styles.activityItemTitle}>Demande d'argent</Text>
                <Text style={styles.activityDateText}>18 avril 2024 • 09:15</Text>
              </View>
              <Text style={styles.activityAmountPositive}>+ 25,00 DZ</Text>
              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          {/* Sticky Action CTA Button */}
          <TouchableOpacity 
            style={styles.btnSendMoney} 
            onPress={() => navigation.navigate('SendMoneyScreen')}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={18} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.btnSendMoneyText}>Envoyer de l'argent</Text>
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
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  backButton: { padding: 4 },
  headerRightActions: { flexDirection: 'row', gap: 8 },
  actionSquareBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
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
  activityHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  activityTitleText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  viewAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#0052FF' },
  activityContainerCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 18, marginHorizontal: 16, marginBottom: 16 },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  activityIconCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  activityMainContent: { flex: 1 },
  activityItemTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 1 },
  activityDateText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF' },
  activityAmountNegative: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  activityAmountPositive: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#10B981' },
  btnSendMoney: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', height: 48, borderRadius: 12, marginHorizontal: 16, marginBottom: 10 },
  btnSendMoneyText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' }
});
