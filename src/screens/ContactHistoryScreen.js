import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import { CONTACTS_MOCK } from '../mocks/contactsMock';

const transactions = [
  {
    id: '1',
    type: 'envoi',
    title: 'Envoi de fonds',
    subtitle: 'Transfert effectué',
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
    subtitle: 'Reçue',
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
    type: 'invitation',
    title: 'Invitation acceptée',
    subtitle: 'A rejoint DizzitUp',
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

export default function ContactHistoryScreen({ route }) {
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
          
          {/* Contact Profile Info */}
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
            <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('ContactProfileScreen', { contact })}>
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
                <Text style={styles.btnSmallActionText}>PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSmallAction} onPress={() => navigation.navigate('FiltersScreen')}>
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
                <Text style={styles.monthValueText}>Juillet 2026</Text>
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
                </TouchableOpacity>
                {index < transactions.length - 1 && <View style={styles.txDivider} />}
              </React.Fragment>
            ))}
          </View>

        </ScrollView>

        <BottomNavBar activeTab="contacts" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionSquareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  profileHeaderSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  badgeVerified: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  contactName: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#1A2840',
    marginBottom: 2,
  },
  relationText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationFlagText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#1A2840',
  },
  tabsRowContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabTextActive: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
  },
  tabTextInactive: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#1A2840',
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 6,
  },
  btnSmallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnSmallActionText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#1A2840',
  },
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  monthContent: {
    flex: 1,
  },
  monthLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
  },
  monthDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  monthValueText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
  },
  transactionsContainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  txRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txMainInfo: {
    flex: 1,
  },
  txTitleText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
  },
  txSubText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  txDateText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    marginTop: 2,
  },
  txAmountSection: {
    alignItems: 'flex-end',
  },
  txAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txAmountText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  txBalanceText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    marginTop: 2,
  },
  txDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
