import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import Avatar from '../components/Avatar';
import AppToast from '../components/AppToast';
import contactService from '../services/contactService';
import { useApp } from '../context/AppContext';

const formatTxDate = (dateString, lang = 'fr') => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString || '';
    const dateFormatted = d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = d.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    return `${dateFormatted} • ${timeFormatted}`;
  } catch (e) {
    return dateString || '';
  }
};

export default function ContactHistoryScreen({ route }) {
  const navigation = useNavigation();
  const { language, t, user, session } = useApp();
  const contact = route?.params?.contact;
  if (!contact) return null;

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAllHistory = async () => {
      setIsLoading(true);
      const combinedTxs = [];

      try {
        // 1. Fetch remittance transactions from Supabase
        if (contact?.id && contact.id.includes('-')) {
          const { success, data } = await contactService.getBeneficiaryHistory(contact.id);
          if (success && Array.isArray(data)) {
            data.forEach(tx => {
              combinedTxs.push({
                id: tx.id,
                type: 'remittance',
                title: t('contacts.history.send_funds', 'Send funds'),
                subtitle: t('contacts.history.transfer_done', 'Transfer complete'),
                date: formatTxDate(tx.created_at, language),
                amount: `- ${tx.send_amount} ${tx.send_currency || 'USD'}`,
                balance: `${t('contacts.history.ref', 'Ref :')} ${tx.reference_number || 'N/A'}`,
                isPositive: false,
                icon: 'arrow-up-circle-outline',
                iconColor: '#10B981',
                iconBg: '#DCFCE7',
                rawDate: new Date(tx.created_at).getTime(),
              });
            });
          }
        }

        // 2. Fetch crypto/wallet transactions from dizzy-wallet
        let rawWalletApi = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && rawWalletApi.includes('localhost')) {
          rawWalletApi = rawWalletApi.replace('localhost', '10.0.2.2');
        }
        const walletBase = rawWalletApi.replace(/\/wallet\/?$/, '').replace(/\/api\/?$/, '') + '/api/wallet';
        const effectiveAuth = user?.dizzyToken || user?.businessDizzyToken || session?.access_token;

        if (effectiveAuth) {
          const res = await fetch(`${walletBase}/history?chain=all`, {
            headers: { 'Authorization': `Bearer ${effectiveAuth}` }
          });
          if (res.ok) {
            const json = await res.json().catch(() => ({}));
            const walletList = json.history || [];

            const cEvm = (contact.evm_address || contact.address || '').toLowerCase();
            const cSol = (contact.solana_address || '').toLowerCase();
            const cName = (contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`).toLowerCase().trim();
            const cPhone = (contact.phone || contact.phone_number || '').replace(/[^0-9]/g, '');

            walletList.forEach(tx => {
              const toAddr = (tx.to || '').toLowerCase();
              const metaName = (tx.metadata?.recipientName || tx.metadata?.beneficiary_name || '').toLowerCase().trim();
              const metaPhone = (tx.metadata?.beneficiary_phone || '').replace(/[^0-9]/g, '');

              const isMatch = (cEvm && toAddr === cEvm) ||
                              (cSol && toAddr === cSol) ||
                              (cName && metaName && (metaName.includes(cName) || cName.includes(metaName))) ||
                              (cPhone && metaPhone && metaPhone.slice(-8) === cPhone.slice(-8));

              if (isMatch) {
                const txHash = tx.hash || tx.id || '';
                const shortRef = txHash.length > 18 ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : txHash;
                combinedTxs.push({
                  id: tx.id || tx.hash,
                  type: 'crypto_send',
                  title: t('contacts.history.send_funds', 'Send funds'),
                  subtitle: tx.chain ? `${tx.chain.toUpperCase()} • ${tx.status || 'Complete'}` : t('contacts.history.transfer_done', 'Transfer complete'),
                  date: formatTxDate(tx.timestamp || tx.createdAt, language),
                  amount: `- ${tx.amount} ${tx.token || 'USDC'}`,
                  balance: `${t('contacts.history.ref', 'Ref :')} ${shortRef || 'TXN'}`,
                  isPositive: false,
                  icon: 'arrow-up-circle-outline',
                  iconColor: '#10B981',
                  iconBg: '#DCFCE7',
                  rawDate: new Date(tx.timestamp || tx.createdAt).getTime(),
                });
              }
            });
          }
        }

        // Sort descending by date
        combinedTxs.sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));

        if (isMounted) {
          setTransactions(combinedTxs);
        }
      } catch (err) {
        console.warn('Error fetching unified contact history:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllHistory();
    return () => { isMounted = false; };
  }, [contact?.id, contact?.phone, contact?.evm_address]);

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
            <TouchableOpacity style={styles.actionPillBtn} onPress={() => AppToast.showInfo('Options en cours de développement')}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#20365B" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Contact Profile Info */}
          <View style={styles.profileHeaderSection}>
            <View style={styles.avatarWrapper}>
              <Avatar 
                image={contact.avatar_url || contact.image || contact.avatar} 
                name={contact.first_name ? `${contact.first_name} ${contact.last_name}` : contact.name} 
                size={90} 
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
              <Text style={styles.tabTextInactive}>{t('contacts.tab.info', 'Information')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, styles.tabButtonActive]}>
              <Text style={styles.tabTextActive}>{t('contacts.tab.history', 'History')}</Text>
            </TouchableOpacity>
          </View>

          {/* Transactions Header & Action Buttons */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('contacts.history.title', 'Transaction History')}</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity style={styles.btnSmallAction} onPress={() => AppToast.showInfo("Fonctionnalité en cours de développement")}>
                <Ionicons name="download-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.btnSmallActionText}>PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSmallAction} onPress={() => navigation.navigate('FiltersScreen')}>
                <Ionicons name="options-outline" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.btnSmallActionText}>{t('contacts.history.filters', 'Filters')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Month Selector Dropdown Card */}
          <View style={styles.monthCard}>
            <View style={styles.monthIconWrapper}>
              <Ionicons name="calendar-outline" size={18} color="#0052FF" />
            </View>
            <View style={styles.monthContent}>
              <Text style={styles.monthLabel}>{t('contacts.history.monthly', 'Monthly history')}</Text>
              <TouchableOpacity style={styles.monthDropdownBtn}>
                <Text style={styles.monthValueText}>{new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : (language === 'pt' ? 'pt-PT' : (language === 'ar' ? 'ar-SA' : (language === 'am' ? 'am-ET' : 'en-US'))), { month: 'long', year: 'numeric' })}</Text>
                <Ionicons name="chevron-down" size={14} color="#1A2840" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsContainerCard}>
            {isLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#20365B" />
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="receipt-outline" size={28} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>{t('contacts.history.empty_title', 'No transactions yet')}</Text>
                <Text style={styles.emptySubtitle}>
                  {t('contacts.history.empty_subtitle', `Transactions with ${contact.name} will appear here.`)}
                </Text>
              </View>
            ) : (
              transactions.map((tx, index) => (
                <React.Fragment key={tx.id || index}>
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
              ))
            )}
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
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
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
    boxShadow: '0px 1px 2px #000',
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
  emptyContainer: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#878FA4',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
});
