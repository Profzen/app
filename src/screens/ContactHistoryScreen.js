import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
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
    icon: 'arrow-up-outline',
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
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
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
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
    iconColor: '#3B82F6',
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
    icon: 'arrow-up-outline',
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
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
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
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
    iconBg: '#F5F3FF',
    noArrow: true, // For the bonus it doesn't have an arrow next to the amount
  },
];

export default function ContactHistoryScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="pencil-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Condensed Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image source={{uri: 'https://i.pravatar.cc/150?img=11'}} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <View style={styles.verifiedBadgeBg} />
              </View>
            </View>

            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileRelation}>Frère</Text>
            <Text style={styles.locationText}>🇹🇬 Lomé, Togo</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabTextInactive}>Informations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.tabActive]}>
              <Text style={styles.tabTextActive}>Historique</Text>
            </TouchableOpacity>
          </View>

          {/* Title & Filters Row */}
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Historique des transactions</Text>
            <View style={styles.historyHeaderActions}>
              <TouchableOpacity style={styles.actionBtnSmall}>
                <Ionicons name="download-outline" size={14} color="#1A2840" style={{marginRight: 4}} />
                <Text style={styles.actionBtnSmallText}>Télécharger PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtnSmall, {marginLeft: 8}]}>
                <Ionicons name="options-outline" size={14} color="#1A2840" style={{marginRight: 4}} />
                <Text style={styles.actionBtnSmallText}>Filtres</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Month Selector */}
          <View style={styles.monthSelectorCard}>
            <View style={styles.monthSelectorIcon}>
              <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.monthSelectorContent}>
              <Text style={styles.monthSelectorLabel}>Historique mensuel</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.monthSelectorValue}>Mai 2024</Text>
                <Ionicons name="chevron-down" size={14} color="#1A2840" style={{marginLeft: 4}} />
              </View>
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsList}>
            {transactions.map((tx, index) => (
              <View key={tx.id}>
                <TouchableOpacity style={styles.transactionItem}>
                  <View style={[styles.txIconCircle, {backgroundColor: tx.iconBg}]}>
                    <Ionicons 
                      name={tx.icon} 
                      size={20} 
                      color={tx.iconColor} 
                      style={tx.icon === 'arrow-up-outline' ? {transform: [{rotate: '45deg'}]} : {}} 
                    />
                  </View>
                  <View style={styles.txContent}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txSubtitle}>{tx.subtitle}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4}}>
                      <Text style={[styles.txAmount, {color: tx.isPositive ? '#10B981' : '#1A2840'}]}>
                        {tx.amount}
                      </Text>
                      {!tx.noArrow && (
                        <Ionicons 
                          name={tx.isPositive ? "arrow-down" : "arrow-up"} 
                          size={14} 
                          color={tx.isPositive ? '#10B981' : '#EF4444'} 
                          style={{marginLeft: 4}}
                        />
                      )}
                    </View>
                    <Text style={styles.txBalance}>{tx.balance}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{marginLeft: 8}} />
                </TouchableOpacity>
                {index < transactions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Privacy Banner */}
          <View style={styles.privacyBanner}>
            <Ionicons name="lock-closed-outline" size={16} color="#1A2840" style={{marginRight: 8}} />
            <Text style={styles.privacyBannerText}>
              Seules vos transactions avec ce contact sont affichées.
            </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightIcons: {
    flexDirection: 'row',
  },
  iconBtnRight: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeBg: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    zIndex: -1,
    borderRadius: 8,
  },
  profileName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1A2840',
    marginBottom: 4,
  },
  profileRelation: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#475569',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFB800',
  },
  tabTextInactive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#94A3B8',
  },
  tabTextActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  historyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    flex: 1,
  },
  historyHeaderActions: {
    flexDirection: 'row',
  },
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnSmallText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
  },
  monthSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  monthSelectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  monthSelectorContent: {
    flex: 1,
  },
  monthSelectorLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 2,
  },
  monthSelectorValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  transactionsList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  txIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txContent: {
    flex: 1,
  },
  txTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  txSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  txDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  txBalance: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 40,
  },
  privacyBannerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
});
