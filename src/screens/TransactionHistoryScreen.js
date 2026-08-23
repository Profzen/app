import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, RefreshControl, Image, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';
import { generateAndShareStatement } from '../utils/pdfGenerator';
import { calculateTransactionStats, getActiveCurrencies } from '../utils/statisticsHelper';

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const { transactions, isTransactionsLoading, refreshTransactions, t, user } = useApp();
  const [activeTab, setActiveTab] = useState('historique');
  const [filterType, setFilterType] = useState('ALL');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('DZY');

  const activeCurrencies = getActiveCurrencies(transactions);
  const stats = calculateTransactionStats(transactions, selectedCurrency, t);

  const getFilteredTransactions = () => {
    if (filterType === 'ALL') return transactions;
    return transactions.filter(tx => {
      const type = (tx.type || '').toUpperCase();
      const metaType = tx.metadata?.type || '';
      const paymentCtx = tx.metadata?.payment_context || '';

      switch(filterType) {
        case 'PAY_BILLS': return paymentCtx === 'bill_payment' || metaType === 'invoice_payment';
        case 'TOP_UP': return type === 'TOP_UP' || type === 'TOP-UP';
        case 'BUY_VOUCHERS': return type === 'BUY' && metaType !== 'physical_goods';
        case 'BUY_GOODS': return type === 'BUY' && metaType === 'physical_goods';
        case 'WALLET_TOP_UP': return type === 'RECEIVE' && metaType === 'deposit'; // Just an example, adapt as needed
        case 'SEND': return type === 'SEND';
        case 'RECEIVE': return type === 'RECEIVE';
        default: return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const handleDownloadStatement = async () => {
    await generateAndShareStatement(filteredTransactions, user, t);
  };

  const getTypeIcon = (type, meta = {}) => {
    const isBill = meta?.payment_context === 'bill_payment' || meta?.type === 'invoice_payment' || meta?.type === 'invoice';
    if (isBill) return <Ionicons name="cart" size={20} color="#10B981" />; // Emerald

    const typeUpper = (type || '').toUpperCase();
    if (typeUpper === 'SEND') return <Ionicons name="arrow-up-circle" size={20} color="#EF4444" />;
    if (typeUpper === 'RECEIVE') return <Ionicons name="arrow-down-circle" size={20} color="#10B981" />;
    if (typeUpper === 'BUY') return <Ionicons name="cart" size={20} color="#F59E0B" />;
    if (typeUpper === 'TOP_UP' || typeUpper === 'TOP-UP') return <Ionicons name="phone-portrait" size={20} color="#34D399" />;
    if (typeUpper === 'SWAP') return <Ionicons name="swap-vertical" size={20} color="#8B5CF6" />;
    if (typeUpper === 'STAKE') return <Ionicons name="server" size={20} color="#3B82F6" />;
    if (typeUpper === 'CASH-OUT' || typeUpper === 'CASH_OUT') return <Ionicons name="cash" size={20} color="#F97316" />;
    if (typeUpper === 'PAY') return <Ionicons name="flash" size={20} color="#60A5FA" />;
    if (typeUpper === 'SALE') return <Ionicons name="arrow-down-circle" size={20} color="#10B981" />;

    return <Ionicons name="time" size={20} color="#9CA3AF" />;
  };

  const getStatusStyle = (status) => {
    const statusUpper = (status || 'PENDING').toUpperCase();
    if (['COMPLETED', 'CONFIRMED', 'SUCCESS'].includes(statusUpper)) {
      return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' };
    }
    if (statusUpper === 'FAILED' || statusUpper === 'CANCELLED') {
      return { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' };
    }
    if (statusUpper === 'PROCESSING') {
      return { bg: '#DBEAFE', text: '#1E40AF', icon: 'sync' };
    }
    return { bg: '#FEF3C7', text: '#92400E', icon: 'time' };
  };

  const formatAmount = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return '';
    try {
      const d = new Date(dateObj);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('common.wallet.personal_history', 'Historique des Transactions')}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => navigation.navigate('ContactUsScreen')}>
              <Ionicons name="help" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtnSmall, {marginLeft: 8}]} onPress={() => setIsFilterVisible(true)}>
              <Ionicons name="funnel-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isTransactionsLoading} onRefresh={refreshTransactions} tintColor="#2B4C7E" />
          }
        >
          
          {/* Top Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setActiveTab('historique')}
            >
              <View style={styles.tabContent}>
                <Ionicons name="time-outline" size={18} color={activeTab === 'historique' ? '#FFB800' : '#64748B'} style={{marginRight: 6}} />
                <Text style={[styles.tabText, activeTab === 'historique' && styles.tabTextActive]}>{t('common.tabs.history', 'HISTORIQUE').toUpperCase()}</Text>
              </View>
              {activeTab === 'historique' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setActiveTab('statistiques')}
            >
              <View style={styles.tabContent}>
                <Ionicons name="stats-chart-outline" size={18} color={activeTab === 'statistiques' ? '#FFB800' : '#64748B'} style={{marginRight: 6}} />
                <Text style={[styles.tabText, activeTab === 'statistiques' && styles.tabTextActive]}>{t('common.tabs.statistics', 'STATISTIQUES').toUpperCase()}</Text>
              </View>
              {activeTab === 'statistiques' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          {activeTab === 'historique' && (
          <View style={styles.mainCard}>
            
            <LinearGradient colors={['#2B4C7E', '#20365B']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{user.role === 'merchant' ? t('common.wallet.business_history', 'Historique Pro') : t('common.wallet.personal_history', 'Historique Personnel')}</Text>
              <Text style={styles.cardSubtitle}>{t('common.wallet.total_transactions', '{{count}} transactions au total').replace('{{count}}', filteredTransactions.length)}</Text>
              
              <View style={styles.cardControls}>
                <TouchableOpacity style={styles.releveBtn} onPress={handleDownloadStatement}>
                  <Ionicons name="download-outline" size={18} color="#1A2840" style={{marginRight: 6}} />
                  <Text style={styles.releveBtnText}>{t('common.wallet.statement', 'RELEVÉ')}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.cardBody}>
              {filteredTransactions.length === 0 && !isTransactionsLoading ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <View style={styles.emptyIconCircle}>
                      <Ionicons name="receipt-outline" size={48} color="#1A2840" />
                      <View style={styles.timeBadge}>
                        <Ionicons name="time" size={16} color="#FFB800" />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.emptyTitle}>{t('common.wallet.no_transactions', 'Aucune transaction')}</Text>
                  <Text style={styles.emptySubtitle}>
                    {t('common.wallet.history_will_appear', 'Votre historique apparaîtra ici\ndès que vous effectuerez des transactions.')}
                  </Text>
                  <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('HomeScreen')}>
                    <Ionicons name="swap-horizontal" size={20} color="#1A2840" style={{marginRight: 8}} />
                    <Text style={styles.btnActionText}>{t('common.actions.make_transaction', 'Effectuer une transaction')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {filteredTransactions.map((tx, idx) => {
                    const statusConfig = getStatusStyle(tx.status);
                    const isPositive = tx.type === 'RECEIVE' || tx.type === 'SALE';
                    
                    return (
                      <View key={tx.id || idx} style={styles.txRow}>
                        <View style={styles.txHeader}>
                          <View style={styles.txTypeContainer}>
                            {getTypeIcon(tx.type, tx.metadata)}
                            <Text style={styles.txType}>{t(`common.wallet.tx_type.${(tx.type || 'unknown').toLowerCase()}`, tx.type).toUpperCase()}</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                            <Ionicons name={statusConfig.icon} size={12} color={statusConfig.text} style={{marginRight: 4}} />
                            <Text style={[styles.statusText, { color: statusConfig.text }]}>
                              {t(`common.wallet.status_type.${(tx.status || 'PENDING').toLowerCase()}`, tx.status).toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.txBody}>
                          <View style={styles.txDetailsLeft}>
                            <Text style={styles.txToFromLabel}>{t('common.wallet.to_from', 'Vers / De')}</Text>
                            <Text style={styles.txToFromValue}>{tx.toFrom}</Text>
                            {!!tx.merchant && tx.type !== 'SEND' && (
                              <Text style={styles.txMerchant}>{tx.merchant}</Text>
                            )}
                            <Text style={styles.txDate}>{formatTime(tx.timestamp)}</Text>
                          </View>
                          
                          <View style={styles.txDetailsRight}>
                            <Text style={[styles.txAmount, isPositive ? styles.amountPos : styles.amountNeg]}>
                              {isPositive ? '+' : '-'}{formatAmount(tx.amount)}
                            </Text>
                            <View style={styles.txCurrencyChain}>
                              <Text style={styles.txCurrency}>{tx.currency}</Text>
                              <Text style={styles.txDot}>•</Text>
                              <Text style={styles.txChain}>{tx.chain}</Text>
                            </View>
                            {!!tx.country && (
                              <View style={styles.txCountry}>
                                <Image source={{ uri: `https://flagcdn.com/w40/${tx.country.toLowerCase()}.png` }} style={styles.flagIcon} />
                                <Text style={styles.txCountryCode}>{tx.country.toUpperCase()}</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {tx.onChain?.explorerLink && (
                          <TouchableOpacity style={styles.explorerBtn} onPress={() => Linking.openURL(tx.onChain.explorerLink)}>
                            <Text style={styles.explorerBtnText}>{t('common.wallet.view_onchain', 'Explorer')}</Text>
                            <Ionicons name="open-outline" size={14} color="#20365B" />
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
          )}

          {/* STATISTICS TAB RENDER */}
          {activeTab === 'statistiques' && (
            <View style={styles.statsContainer}>
              
              {/* Currency Selector */}
              <View style={styles.currencySelectorContainer}>
                <Text style={styles.statsSectionTitle}>{t('stats.select_currency', 'Select Currency')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
                  {activeCurrencies.map(currency => (
                    <TouchableOpacity 
                      key={currency} 
                      style={[styles.currencyChip, selectedCurrency === currency && styles.currencyChipActive]}
                      onPress={() => setSelectedCurrency(currency)}
                    >
                      <Text style={[styles.currencyChipText, selectedCurrency === currency && styles.currencyChipTextActive]}>{currency}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Volume Overview Cards */}
              <View style={styles.volumeCardsContainer}>
                <LinearGradient 
                  colors={['#2B4C7E', '#1A2840']} 
                  start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
                  style={[styles.volumeCard, { marginRight: 8 }]}
                >
                  <View style={styles.volumeHeader}>
                    <View style={[styles.volumeIconBox, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
                      <Ionicons name="arrow-down" size={16} color="#34D399" />
                    </View>
                    <Text style={styles.volumeLabel}>{t('stats.total_in', 'Total In')}</Text>
                  </View>
                  <View style={styles.volumeAmountContainer}>
                    <Text style={[styles.volumeAmount, { color: '#FFFFFF' }]}>{formatAmount(stats.totalIn)}</Text>
                    <Text style={styles.volumeCurrency}>{selectedCurrency}</Text>
                  </View>
                </LinearGradient>

                <LinearGradient 
                  colors={['#FFC759', '#F59E0B']} 
                  start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
                  style={[styles.volumeCard, { marginLeft: 8 }]}
                >
                  <View style={styles.volumeHeader}>
                    <View style={[styles.volumeIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                      <Ionicons name="arrow-up" size={16} color="#1A2840" />
                    </View>
                    <Text style={[styles.volumeLabel, { color: '#1A2840' }]}>{t('stats.total_out', 'Total Out')}</Text>
                  </View>
                  <View style={styles.volumeAmountContainer}>
                    <Text style={[styles.volumeAmount, { color: '#1A2840' }]}>{formatAmount(stats.totalOut)}</Text>
                    <Text style={[styles.volumeCurrency, { color: 'rgba(26, 40, 64, 0.7)' }]}>{selectedCurrency}</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Transaction Categories Breakdown */}
              <View style={styles.categoriesCard}>
                <Text style={styles.statsSectionTitle}>{t('stats.spending_breakdown', 'Spending Breakdown')}</Text>
                
                {stats.categories.length === 0 ? (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <Ionicons name="pie-chart-outline" size={32} color="#CBD5E1" />
                    <Text style={{ marginTop: 8, color: '#64748B', fontSize: 12 }}>{t('stats.no_spending', 'No outgoing transactions found.')}</Text>
                  </View>
                ) : (
                  stats.categories.map((cat, index) => (
                    <View key={index} style={styles.categoryRow}>
                      <View style={[styles.categoryIconWrap, { backgroundColor: cat.bgColor }]}>
                        <Ionicons name={cat.icon} size={16} color={cat.color} />
                      </View>
                      
                      <View style={styles.categoryInfo}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>{cat.name}</Text>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.categoryValue}>{formatAmount(cat.value)}</Text>
                            <Text style={styles.categoryPercent}>{cat.percentage.toFixed(1)}%</Text>
                          </View>
                        </View>
                        
                        {/* Progress Bar */}
                        <View style={styles.progressBarTrack}>
                          <View 
                            style={[
                              styles.progressBarFill, 
                              { 
                                backgroundColor: cat.color, 
                                width: `${stats.maxCategoryValue > 0 ? (cat.value / stats.maxCategoryValue) * 100 : 0}%` 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>

            </View>
          )}

          {/* Info Banner (Only on Historique) */}
          {activeTab === 'historique' && (
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={16} color="#1A2840" />
            </View>
            <Text style={styles.infoText}>
              {t('common.wallet.download_info', 'Vous pouvez télécharger votre relevé mensuel au format PDF.')}
            </Text>
          </View>
          )}

        </ScrollView>

        <BottomNavBar activeTab="History" />
      </View>

      {/* Filter Bottom Sheet Modal */}
      <Modal visible={isFilterVisible} transparent animationType="slide" onRequestClose={() => setIsFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('common.wallet.filter_title', 'Filtres')}</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#1A2840" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSubtitle}>{t('common.wallet.filter_subtitle', 'Affinez la liste des transactions')}</Text>

            <View style={styles.sheetSectionTitleRow}>
              <Ionicons name="receipt-outline" size={18} color="#1A2840" />
              <Text style={styles.sheetSectionTitle}>{t('common.wallet.filter_tx_type', 'Type de transaction')}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.filterList}>
              {[
                { key: 'ALL', label: t('common.wallet.filter_all', 'Toutes les transactions'), icon: null },
                { key: 'PAY_BILLS', label: t('common.wallet.filter_pay_bills', 'Paiement de factures'), sub: 'Éducation, Santé, Électricité, Prestations...', icon: 'receipt-outline', color: '#60A5FA' },
                { key: 'TOP_UP', label: t('common.wallet.filter_mobile_topup', 'Recharge téléphonique'), icon: 'phone-portrait-outline', color: '#34D399' },
                { key: 'BUY_VOUCHERS', label: t('common.wallet.filter_vouchers', "Achat de bons d'achat"), sub: 'Gift Cards, Vouchers', icon: 'card-outline', color: '#F59E0B' },
                { key: 'BUY_GOODS', label: t('common.wallet.filter_goods', 'Achat de produits physiques'), icon: 'bag-outline', color: '#A78BFA' },
                { key: 'WALLET_TOP_UP', label: t('common.wallet.filter_wallet_topup', 'Recharge du portefeuille DZYWallet'), icon: 'wallet-outline', color: '#60A5FA' },
                { key: 'SEND', label: t('common.wallet.filter_send', 'Envoi de fonds'), icon: 'arrow-up-outline', color: '#34D399' },
                { key: 'RECEIVE', label: t('common.wallet.filter_receive', 'Réception de fonds'), icon: 'arrow-down-outline', color: '#34D399' },
              ].map((opt) => (
                <TouchableOpacity 
                  key={opt.key} 
                  style={[styles.filterItem, filterType === opt.key && styles.filterItemActive]}
                  onPress={() => setFilterType(opt.key)}
                >
                  <View style={styles.filterItemLeft}>
                    {opt.icon && (
                      <View style={[styles.filterIconBox, { backgroundColor: (opt.color || '#1A2840') + '15' }]}>
                        <Ionicons name={opt.icon} size={16} color={opt.color} />
                      </View>
                    )}
                    <View style={!opt.icon && { marginLeft: 36 }}>
                      <Text style={[styles.filterLabel, filterType === opt.key && styles.filterLabelActive]}>{opt.label}</Text>
                      {opt.sub && <Text style={styles.filterSub}>{opt.sub}</Text>}
                    </View>
                  </View>
                  <View style={styles.radioBox}>
                    {filterType === opt.key && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="funnel-outline" size={18} color="#FFFFFF" style={{marginRight: 6}} />
                <Text style={styles.applyBtnText}>{t('common.wallet.apply_filters', 'Appliquer les filtres')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setFilterType('ALL')}>
                <Ionicons name="refresh-outline" size={18} color="#1A2840" style={{marginRight: 6}} />
                <Text style={styles.resetBtnText}>{t('common.wallet.reset_filters', 'Réinitialiser')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: '#1A2840',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    overflow: 'hidden',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  tabText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#64748B' },
  tabTextActive: { color: '#FFB800' },
  tabIndicator: {
    position: 'absolute', bottom: 0, width: '40%', height: 3,
    backgroundColor: '#FFB800', borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
  mainCard: {
    borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9',
    marginBottom: 24, boxShadow: '0px 4px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
  },
  cardHeader: { padding: 24 },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFFFFF', marginBottom: 8 },
  cardSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#94A3B8', marginBottom: 24 },
  cardControls: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  releveBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFB800',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
  },
  releveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1A2840' },
  cardBody: { backgroundColor: '#FFFFFF', padding: 0 }, // Removed padding for list
  
  // Empty State
  emptyState: { padding: 32, alignItems: 'center' },
  emptyIconContainer: { marginBottom: 24 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  timeBadge: {
    position: 'absolute', bottom: 20, right: 20, backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 2,
  },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#1A2840', marginBottom: 12, textAlign: 'center' },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btnAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, width: '100%',
  },
  btnActionText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840' },
  
  // Transactions List
  transactionsList: { paddingHorizontal: 16, paddingVertical: 8 },
  txRow: {
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 16, marginBottom: 12, backgroundColor: '#FFFFFF'
  },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  txTypeContainer: { flexDirection: 'row', alignItems: 'center' },
  txType: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1A2840', marginLeft: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.5 },
  
  txBody: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  txDetailsLeft: { flex: 1, paddingRight: 8 },
  txToFromLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  txToFromValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#334155', marginBottom: 2 },
  txMerchant: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#64748B', marginBottom: 6 },
  txDate: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#94A3B8', marginTop: 4 },
  
  txDetailsRight: { alignItems: 'flex-end', justifyContent: 'center' },
  txAmount: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 4 },
  amountPos: { color: '#10B981' },
  amountNeg: { color: '#20365B' },
  txCurrencyChain: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  txCurrency: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#64748B' },
  txDot: { fontSize: 10, color: '#94A3B8', marginHorizontal: 4 },
  txChain: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#64748B' },
  
  txCountry: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  flagIcon: { width: 16, height: 10, borderRadius: 2, marginRight: 4 },
  txCountryCode: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#64748B' },

  explorerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFC759', paddingVertical: 10, borderRadius: 8, marginTop: 12 },
  explorerBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#20365B', marginRight: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16 },
  infoIconCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A2840', lineHeight: 20 },

  // Bottom Sheet Filter Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1A2840' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  sheetSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748B', marginTop: 8, marginBottom: 24 },
  sheetSectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sheetSectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840', marginLeft: 8 },
  filterList: { marginBottom: 20 },
  filterItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterItemActive: { backgroundColor: '#FFFAEB', marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 12, borderBottomWidth: 0 },
  filterItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  filterIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  filterLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  filterLabelActive: { color: '#D97706' },
  filterSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8', marginTop: 2, marginRight: 20 },
  radioBox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFB800' },
  sheetActions: { paddingVertical: 12 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFB800', paddingVertical: 16, borderRadius: 16, marginBottom: 12 },
  applyBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  resetBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A2840' },

  // Statistics Tab Styles
  statsContainer: { paddingBottom: 24 },
  statsSectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', marginBottom: 16 },
  currencySelectorContainer: { marginBottom: 24, paddingHorizontal: 16 },
  currencyScroll: { flexDirection: 'row' },
  currencyChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  currencyChipActive: { backgroundColor: '#FFC759', borderColor: '#FFB800' },
  currencyChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#64748B' },
  currencyChipTextActive: { color: '#1A2840' },
  
  volumeCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
  volumeCard: { flex: 1, padding: 18, borderRadius: 24, overflow: 'hidden', boxShadow: '0px 8px 16px rgba(0,0,0,0.08)', elevation: 4 },
  volumeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  volumeIconBox: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  volumeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#9CA3AF' },
  volumeAmountContainer: { flexDirection: 'row', alignItems: 'baseline' },
  volumeAmount: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, marginRight: 6 },
  volumeCurrency: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' },

  categoriesCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', padding: 24, marginHorizontal: 16, boxShadow: '0px 4px 10px rgba(0,0,0,0.03)', elevation: 2 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  categoryIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  categoryInfo: { flex: 1 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  categoryName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  categoryValue: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840' },
  categoryPercent: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#9CA3AF' },
  progressBarTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 }
});
