import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WalletCard from '../components/WalletCard';
import BottomNavBar from '../components/BottomNavBar';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const TODO_LIST = [
  { id: '1', icon: 'person-outline', iconColor: '#F59E0B', iconBgColor: '#FFFBEB', title: 'Abdou asked you\nto buy something', buttonText: 'View', buttonColor: '#F59E0B', buttonBgColor: '#FFFBEB' },
  { id: '2', icon: 'warning-outline', iconColor: '#EF4444', iconBgColor: '#FEF2F2', title: 'Low balance,\ntop up your account', buttonText: 'Top up', buttonColor: '#EF4444', buttonBgColor: '#FEF2F2' },
  { id: '3', icon: 'shield-checkmark-outline', iconColor: '#3B82F6', iconBgColor: '#EFF6FF', title: 'Complete your profile\nfor more security', buttonText: 'Complete', buttonColor: '#3B82F6', buttonBgColor: '#EFF6FF' },
  { id: '4', icon: 'storefront-outline', iconColor: '#8B5CF6', iconBgColor: '#F5F3FF', title: 'Create your DZYStore\nand start selling', buttonText: 'Create', buttonColor: '#8B5CF6', buttonBgColor: '#F5F3FF' },
];

const QUICK_ACTIONS = [
  { id: '1', icon: 'bag-handle-outline', color: '#8B5CF6', bgColor: '#F5F3FF', title: 'Buy goods' },
  { id: '2', icon: 'document-text-outline', color: '#3B82F6', bgColor: '#EFF6FF', title: 'Pay bills' },
  { id: '3', icon: 'cart-outline', color: '#F59E0B', bgColor: '#FFFBEB', title: 'Buy / Pay me' },
  { id: '4', icon: 'paper-plane-outline', color: '#8B5CF6', bgColor: '#F5F3FF', title: 'Send & Request' },
  { id: '5', icon: 'add-outline', color: '#10B981', bgColor: '#ECFDF5', title: 'Top-up DZYwallet' },
  { id: '6', icon: 'storefront-outline', color: '#F59E0B', bgColor: '#FFFBEB', title: 'Refer a business' },
  { id: '7', icon: 'globe-outline', color: '#3B82F6', bgColor: '#EFF6FF', title: 'Source in Africa' },
  { id: '8', icon: 'business-outline', color: '#0D9488', bgColor: '#F0FDFA', title: 'Distribute cash\nXOF ATM' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletBalances] = useState({ DZY: 125500, GHS: 125000, XOF: 510000 });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image source={require('../../dizzitup logo cercle.png')} style={styles.avatarImage} />
              <View>
                <Text style={styles.greetingText}>Hello,</Text>
                <Text style={styles.nameText}>David</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={20} color="#1A2840" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="gift-outline" size={20} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallet Card */}
          <WalletCard balances={walletBalances} />

          {/* To-do list */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>To-do list</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.todoListContainer}>
            {TODO_LIST.map(item => (
              <View key={item.id} style={styles.todoItem}>
                <View style={[styles.todoIconWrapper, { backgroundColor: item.iconBgColor }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <Text style={styles.todoTitle}>{item.title}</Text>
                <TouchableOpacity style={[styles.todoButton, { backgroundColor: item.buttonBgColor }]}>
                  <Text style={[styles.todoButtonText, { color: item.buttonColor }]}>{item.buttonText}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Invite Banner */}
          <View style={styles.inviteBanner}>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Invite friends{'\n'}and earn{'\n'}<Text style={styles.inviteTitleHighlight}>$5 in DZY</Text></Text>
              <Text style={styles.inviteSubtitle}>Send money, buy goods,{'\n'}pay bills and earn rewards.</Text>
              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteButtonText}>Invite now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inviteGraphic}>
              {/* Using CSS for a giant coin placeholder instead of image for now */}
              <View style={styles.giantCoin}>
                <View style={styles.innerCoin}>
                  <Text style={styles.coinText}>DZY</Text>
                </View>
              </View>
              {/* Little avatars */}
              <Image source={require('../../dizzitup logo cercle.png')} style={[styles.miniAvatar, { top: 10, right: 10 }]} />
              <Image source={require('../../dizzitup logo cercle.png')} style={[styles.miniAvatar, { bottom: 10, left: 10 }]} />
              <TouchableOpacity style={styles.closeBannerButton}>
                <Ionicons name="close" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
          </View>
          
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity key={action.id} style={styles.actionGridItem} onPress={() => { if(action.id==='1' || action.id==='4') navigation.navigate('SendMoneyScreen'); else if(action.id==='5') navigation.navigate('TopUpScreen'); else if(action.id==='2') navigation.navigate('CashierScanScreen'); else if(action.id==='3' || action.id==='6' || action.id==='7') navigation.navigate('ShopsScreen'); else if(action.id==='8') navigation.navigate('WithdrawFundsScreen'); }}>
                <View style={[styles.actionGridIcon, { backgroundColor: action.bgColor }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionGridText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <View style={styles.securityTextContent}>
              <Text style={styles.securityTitle}>Secure, simple and instant</Text>
              <Text style={styles.securityDesc}>Your funds are protected by the <Text style={{color: '#F59E0B'}}>DizzitUp</Text> security protocol.</Text>
            </View>
            <View style={styles.lockIconWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#1A2840" />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
        
        <BottomNavBar 
          activeTab="Home" 
          isMenuOpen={isMenuOpen} 
          onCenterButtonPress={() => setIsMenuOpen(!isMenuOpen)} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  greetingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
  },
  nameText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  viewAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#F59E0B',
  },
  todoListContainer: {
    paddingHorizontal: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  todoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  todoTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 18,
    paddingRight: 16,
  },
  todoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  todoButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  inviteBanner: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  inviteContent: {
    flex: 1,
    zIndex: 2,
  },
  inviteTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
    lineHeight: 24,
    marginBottom: 8,
  },
  inviteTitleHighlight: {
    color: '#3B82F6',
  },
  inviteSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: '#1A2840',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  inviteGraphic: {
    width: 120,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giantCoin: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FDE68A',
    transform: [{ perspective: 800 }, { rotateY: '-20deg' }],
    shadowColor: '#F59E0B',
    shadowOffset: { width: -4, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  innerCoin: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  coinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  closeBannerButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  actionGridItem: {
    width: (width - 20) / 4,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionGridIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionGridText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  securityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  securityTextContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  securityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  lockIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  }
});
