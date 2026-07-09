import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

const TODO_LIST = [
  { id: '1', title: 'Abdou asked you\nto buy something', action: 'View', icon: 'person-outline', color: '#F59E0B', bg: '#FEF3C7' },
  { id: '2', title: 'Low balance,\ntop up your account', action: 'Top up', icon: 'warning-outline', color: '#EF4444', bg: '#FEE2E2' },
  { id: '3', title: 'Complete your profile\nfor more security', action: 'Complete', icon: 'shield-checkmark-outline', color: '#3B82F6', bg: '#DBEAFE' },
  { id: '4', title: 'Create your DZYStore\nand start selling', action: 'Create', icon: 'storefront-outline', color: '#8B5CF6', bg: '#EDE9FE' },
];

const QUICK_ACTIONS = [
  { id: '1', label: 'Buy goods', icon: 'document-text-outline', color: '#3B82F6' },
  { id: '2', label: 'Pay bills', icon: 'flash-outline', color: '#8B5CF6' },
  { id: '3', label: 'Buy / Pay me', icon: 'cart-outline', color: '#F59E0B' },
  { id: '4', label: 'Send &\nRequest funds', icon: 'people-outline', color: '#10B981' },
  { id: '5', label: 'Top-up\nDZYwallet', icon: 'add-circle-outline', color: '#10B981' },
  { id: '6', label: 'Refer\na business', icon: 'storefront-outline', color: '#F59E0B' },
  { id: '7', label: 'Source\nin Africa', icon: 'earth-outline', color: '#3B82F6' },
  { id: '8', label: 'Distribute\ncash', icon: 'cash-outline', color: '#10B981' },
];

export default function DashboardEngScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{uri: 'https://i.pravatar.cc/100?img=11'}} style={styles.avatar} />
            <View>
              <Text style={styles.helloText}>Hello,</Text>
              <Text style={styles.nameText}>David</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#1A2840" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="gift-outline" size={22} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnBordered}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Wallet Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletTop}>
              <View style={styles.walletHeaderLeft}>
                <Text style={styles.dzyWalletText}>DZYwallet</Text>
                <Ionicons name="eye" size={16} color="#FFFFFF" style={{marginLeft: 8}} />
              </View>
              <View style={styles.walletHeaderRight}>
                <TouchableOpacity style={styles.rechargerBtn}>
                  <Ionicons name="add" size={14} color="#1A2840" />
                  <Text style={styles.rechargerText}>Top-up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.arrowRightBtn}>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.walletBody}>
              <View style={styles.walletBalanceSection}>
                <Text style={styles.balanceAmount}>125,500.00 <Text style={styles.balanceCurrency}>USD</Text></Text>
                
                <View style={styles.conversionsRow}>
                  <View style={styles.conversionItem}>
                    <Image source={{uri: 'https://flagcdn.com/w40/gh.png'}} style={styles.countryFlag} />
                    <View>
                      <Text style={styles.conversionValue}>≈ 125,500.00 GHS</Text>
                      <Text style={styles.conversionLabel}>Ghana Cedi</Text>
                    </View>
                  </View>
                  <View style={styles.conversionDivider} />
                  <View style={styles.conversionItem}>
                    <Image source={{uri: 'https://flagcdn.com/w40/tg.png'}} style={styles.countryFlag} />
                    <View>
                      <Text style={styles.conversionValue}>≈ 510,000.00 XOF</Text>
                      <Text style={styles.conversionLabel}>CFA Franc (Togo)</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.dzyLogoWrapper}>
                <Image source={require('../../dizzitup logo cercle.png')} style={styles.dzyLogoImg} resizeMode="contain" />
              </View>
            </View>

            {/* Wallet Actions (Inside Dark Card) */}
            <View style={styles.walletActions}>
              <TouchableOpacity style={styles.wActionBtn}>
                <Ionicons name="paper-plane-outline" size={24} color="#FFFFFF" />
                <Text style={styles.wActionText}>Send</Text>
              </TouchableOpacity>
              
              <View style={styles.wActionDivider} />
              
              <TouchableOpacity style={styles.wActionBtn}>
                <Ionicons name="arrow-down-outline" size={24} color="#FFFFFF" />
                <Text style={styles.wActionText}>Receive</Text>
              </TouchableOpacity>
              
              <View style={styles.wActionDivider} />
              
              <TouchableOpacity style={styles.wActionBtn}>
                <Ionicons name="time-outline" size={24} color="#FFFFFF" />
                <Text style={styles.wActionText}>History</Text>
              </TouchableOpacity>
              
              <View style={styles.wActionDivider} />
              
              <TouchableOpacity style={styles.wActionBtn}>
                <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
                <Text style={styles.wActionText}>Cash-out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* To-do list */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>To-do list</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.todoList}>
            {TODO_LIST.map((item, index) => (
              <View key={item.id}>
                <View style={styles.todoRow}>
                  <View style={[styles.todoIconBox, {borderColor: item.color, backgroundColor: item.bg}]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.todoTitle}>{item.title}</Text>
                  <TouchableOpacity style={[styles.todoActionBtn, {backgroundColor: item.bg}]}>
                    <Text style={[styles.todoActionText, {color: item.color}]}>{item.action}</Text>
                  </TouchableOpacity>
                </View>
                {index < TODO_LIST.length - 1 && <View style={styles.todoDivider} />}
              </View>
            ))}
          </View>

          {/* Invite Banner */}
          <View style={styles.inviteBanner}>
            <TouchableOpacity style={styles.closeBtn}>
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Invite friends{'\n'}and earn <Text style={styles.inviteHighlight}>$5 in DZY</Text></Text>
              <Text style={styles.inviteSub}>Send money, buy goods,{'\n'}pay bills and earn rewards.</Text>
              <TouchableOpacity style={styles.inviteBtn}>
                <Text style={styles.inviteBtnText}>Invite now</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inviteGraphic}>
              {/* Graphic elements simulation */}
              <Image source={{uri: 'https://i.pravatar.cc/100?img=5'}} style={[styles.inviteAvatar, {top: 10, right: 10}]} />
              <Image source={{uri: 'https://i.pravatar.cc/100?img=9'}} style={[styles.inviteAvatar, {bottom: 10, left: 10}]} />
              
              <View style={styles.goldCoin}>
                <View style={styles.goldCoinInner}>
                  <Text style={styles.goldCoinText}>DZY</Text>
                </View>
              </View>
              
              {/* Dotted lines simulation */}
              <View style={styles.dottedLine1} />
              <View style={styles.dottedLine2} />
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.qActionBtn}>
                <View style={styles.qActionIconBox}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.qActionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconBox}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Secure, simple and instant</Text>
              <Text style={styles.securitySub}>Your funds are protected by the{'\n'}<Text style={styles.securityHighlight}>highest</Text> security protocols.</Text>
            </View>
            <Ionicons name="lock-closed-outline" size={20} color="#1A2840" />
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="Accueil" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  helloText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  nameText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1A2840',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBtnBordered: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  walletCard: {
    backgroundColor: '#05112F', // Very dark blue
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  walletTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  walletHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dzyWalletText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  walletHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rechargerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  rechargerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 4,
  },
  arrowRightBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletBalanceSection: {
    flex: 1,
  },
  balanceAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  balanceCurrency: {
    fontSize: 18,
  },
  conversionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  conversionValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#E2E8F0',
  },
  conversionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#94A3B8',
  },
  conversionDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
  dzyLogoWrapper: {
    width: 72,
    height: 72,
    marginLeft: 16,
  },
  dzyLogoImg: {
    width: '100%',
    height: '100%',
  },
  walletActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 16,
    marginHorizontal: -20, // stretch to edges
  },
  wActionBtn: {
    flex: 1,
    alignItems: 'center',
  },
  wActionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 8,
  },
  wActionDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#1E293B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  viewAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#F59E0B',
  },
  todoList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  todoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  todoTitle: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
    lineHeight: 18,
  },
  todoActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todoActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  todoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  inviteBanner: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  inviteContent: {
    flex: 1,
    zIndex: 2,
  },
  inviteTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#1A2840',
    lineHeight: 22,
    marginBottom: 8,
  },
  inviteHighlight: {
    color: '#3B82F6',
  },
  inviteSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
  },
  inviteBtn: {
    backgroundColor: '#0F172A',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  inviteGraphic: {
    width: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldCoin: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  goldCoinInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldCoinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#B45309',
  },
  inviteAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    zIndex: 5,
  },
  dottedLine1: {
    position: 'absolute',
    width: 60,
    height: 40,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 20,
    top: 10,
    left: -20,
    zIndex: 1,
  },
  dottedLine2: {
    position: 'absolute',
    width: 60,
    height: 40,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 20,
    bottom: 10,
    right: -20,
    zIndex: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
  },
  qActionBtn: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  qActionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qActionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
    textAlign: 'center',
    lineHeight: 14,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
  },
  securityIconBox: {
    marginRight: 16,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 4,
  },
  securitySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  securityHighlight: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F59E0B',
  },
});
