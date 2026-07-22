import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const transactions = [
  {
    id: '1',
    type: 'envoi',
    title: 'Envoi de fonds',
    subtitle: 'À John Doe',
    date: '23 mai 2024 • 14:32',
    amount: '- 50,00 DZ',
    balance: 'Solde : 120,00 DZ',
    isPositive: false,
    icon: 'arrow-up-right-outline',
    iconColor: '#10B981',
    iconBg: '#DCFCE7',
  },
  {
    id: '2',
    type: 'demande',
    title: 'Demande de fonds',
    subtitle: 'De John Doe',
    date: '18 mai 2024 • 09:15',
    amount: '+ 25,00 DZ',
    balance: 'Solde : 170,00 DZ',
    isPositive: true,
    icon: 'arrow-down-outline',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
  },
  {
    id: '3',
    type: 'paiement',
    title: 'Paiement & achat essentiel',
    subtitle: 'Paiement chez DZY Store',
    date: '15 mai 2024 • 16:45',
    amount: '- 15,00 DZ',
    balance: 'Solde : 145,00 DZ',
    isPositive: false,
    icon: 'bag-handle-outline',
    iconColor: '#0052FF',
    iconBg: '#EFF6FF',
  },
  {
    id: '4',
    type: 'envoi',
    title: 'Envoi de fonds',
    subtitle: 'À John Doe',
    date: '10 mai 2024 • 11:20',
    amount: '- 30,00 DZ',
    balance: 'Solde : 160,00 DZ',
    isPositive: false,
    icon: 'arrow-up-right-outline',
    iconColor: '#10B981',
    iconBg: '#DCFCE7',
  },
  {
    id: '5',
    type: 'demande',
    title: 'Demande de fonds',
    subtitle: 'De John Doe',
    date: '05 mai 2024 • 08:10',
    amount: '+ 40,00 DZ',
    balance: 'Solde : 190,00 DZ',
    isPositive: true,
    icon: 'arrow-down-outline',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
  },
  {
    id: '6',
    type: 'invitation',
    title: 'Invitation acceptée',
    subtitle: 'John Doe a rejoint DizzitUp',
    date: '01 mai 2024 • 18:30',
    amount: '+ 10,00 DZ',
    balance: 'Bonus',
    isPositive: true,
    icon: 'person-add-outline',
    iconColor: '#8B5CF6',
    iconBg: '#F3E8FF',
    noArrow: true,
  },
];

export default function ContactHistoryScreen() {
  const navigation = useNavigation();

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
          
          {/* Contact Profile Info */}
          <View style={styles.profileHeaderSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' }} style={styles.avatarImage} />
              <View style={styles.badgeVerified}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            </View>

            <Text style={styles.contactName}>John Doe</Text>
            <Text style={styles.relationText}>Frère</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationFlagText}>🇹🇬  Lomé, Togo</Text>
            </View>
          </View>

          {/* 2 Tabs Bar */}
          <View style={styles.tabsRowContainer}>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabTextInactive}>Informations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, styles.tabButtonActive]}>
              <Text style={styles.tabTextActive}>Historique</Text>
            </TouchableOpacity>
          </View>

          {/* Transactions Header & Action Buttons */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Historique des transactions</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity style={styles.btnSmallAction}>
                <Ionicons name="download-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.btnSmallActionText}>Télécharger PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSmallAction}>
                <Ionicons name="options-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.btnSmallActionText}>Filtres</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Month Selector Dropdown Card */}
          <View style={styles.monthCard}>
            <View style={styles.monthIconWrapper}>
              <Ionicons name="calendar-outline" size={18} color="#0052FF" />
            </View>
            <View style={styles.monthContent}>
              <Text style={styles.monthLabel}>Historique mensuel</Text>
              <TouchableOpacity style={styles.monthDropdownBtn}>
                <Text style={styles.monthValueText}>Mai 2024</Text>
                <Ionicons name="chevron-down" size={14} color="#1A2840" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsContainerCard}>
            {transactions.map((tx, index) => (
              <React.Fragment key={tx.id}>
                <TouchableOpacity style={styles.txRowItem} activeOpacity={0.75}>
                  <View style={[styles.txIconBox, { backgroundColor: tx.iconBg }]}>
                    <Ionicons name={tx.icon} size={18} color={tx.iconColor} />
                  </View>
                  <View style={styles.txMainInfo}>
                    <Text style={styles.txTitleText}>{tx.title}</Text>
                    <Text style={styles.txSubText}>{tx.subtitle}</Text>
                    <Text style={styles.txDateText}>{tx.date}</Text>
                  </View>
                  <View style={styles.txAmountSection}>
                    <View style={styles.txAmountRow}>
                      <Text style={[styles.txAmountText, { color: tx.isPositive ? '#10B981' : '#1A2840' }]}>
                        {tx.amount}
                      </Text>
                      {!tx.noArrow && (
                        <Ionicons 
                          name={tx.isPositive ? "arrow-down" : "arrow-up"} 
                          size={14} 
                          color={tx.isPositive ? '#10B981' : '#EF4444'} 
                          style={{ marginLeft: 3 }} 
                        />
                      )}
                    </View>
                    <Text style={styles.txBalanceText}>{tx.balance}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                {index < transactions.length - 1 && <View style={styles.txDividerLine} />}
              </React.Fragment>
            ))}
          </View>

          {/* Privacy Security Banner Card */}
          <View style={styles.privacyBannerCard}>
            <Ionicons name="lock-closed-outline" size={16} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.privacyBannerText}>
              Seules vos transactions avec ce contact sont affichées.
            </Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="contacts" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 10 },
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
  tabsRowContainer: { flexDirection: 'row', marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 20 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabButtonActive: { borderBottomWidth: 2, borderBottomColor: '#FFC759' },
  tabTextInactive: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840', flex: 1 },
  sectionActions: { flexDirection: 'row', gap: 6 },
  btnSmallAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  btnSmallActionText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#1A2840' },
  monthCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginHorizontal: 16, marginBottom: 16 },
  monthIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  monthContent: { flex: 1 },
  monthLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 1 },
  monthDropdownBtn: { flexDirection: 'row', alignItems: 'center' },
  monthValueText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840' },
  transactionsContainerCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 18, marginHorizontal: 16, marginBottom: 16 },
  txRowItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  txIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  txMainInfo: { flex: 1 },
  txTitleText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#1A2840', marginBottom: 1 },
  txSubText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginBottom: 1 },
  txDateText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF' },
  txAmountSection: { alignItems: 'flex-end' },
  txAmountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  txAmountText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13 },
  txBalanceText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280' },
  txDividerLine: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 14 },
  privacyBannerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F8FF', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 16 },
  privacyBannerText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1A2840' }
});
