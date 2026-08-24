


import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WalletCard from '../components/WalletCard';
import BottomNavBar from '../components/BottomNavBar';
import { LanguageSelector } from '../components/LanguageSelector';
import { shareInviteLink, shareShopLink } from '../utils/shareHelper';
import { useApp } from '../context/AppContext';


import { isSmallScreen, isShortScreen } from '../utils/responsive';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, t, user } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [walletBalances, setWalletBalances] = useState({});

  useEffect(() => {
    if (user) {
      if (user.role === 'merchant' && user.businessBalances) {
        setWalletBalances(user.businessBalances);
      } else if (user.allBalances) {
        setWalletBalances(user.allBalances);
      }
    }
  }, [user]);

  // Dynamically generate To-Do List based on real user state
  const TODO_LIST = [];
  
  if ((user?.balanceDZY || 0) < 10) {
    TODO_LIST.push({
      id: '2',
      icon: 'warning-outline',
      iconColor: '#EF4444',
      iconBgColor: '#FEF2F2',
      title: t('home.todos.low_balance.title', 'Low balance,\ntop up your account'),
      buttonText: t('home.todos.low_balance.button', 'Top up'),
      buttonColor: '#EF4444',
      buttonBgColor: '#FEF2F2',
      route: 'TopUpScreen'
    });
  }

  if (!user?.firstName || !user?.lastName || !user?.phone) {
    TODO_LIST.push({
      id: '3',
      icon: 'shield-checkmark-outline',
      iconColor: '#3B82F6',
      iconBgColor: '#EFF6FF',
      title: t('home.todos.complete_profile.title', 'Complete your profile\nfor more security'),
      buttonText: t('home.todos.complete_profile.button', 'Complete'),
      buttonColor: '#3B82F6',
      buttonBgColor: '#EFF6FF',
      route: 'SecureAccountScreen'
    });
  }

  // Always show Business/Merchant card as the final call to action
  TODO_LIST.push({
      id: '4',
      icon: 'storefront-outline',
      iconColor: '#8B5CF6',
      iconBgColor: '#F5F3FF',
      title: user?.role === 'merchant'
        ? t('home.todos.merchant_dashboard.title', 'Access your Business\nDashboard')
        : t('home.todos.create_store.title', 'Create your DZYStore\nand start selling'),
      buttonText: user?.role === 'merchant'
        ? t('home.todos.merchant_dashboard.button', 'Access')
        : t('home.todos.create_store.button', 'Create'),
      buttonColor: '#8B5CF6',
      buttonBgColor: '#F5F3FF',
      route: user?.role === 'merchant' ? 'BusinessAccountScreen' : 'ShopsScreen'
  });

  const QUICK_ACTIONS = [
    { id: '1', icon: 'bag-handle-outline', color: '#3B82F6', bgColor: '#EFF6FF', title: t('home.actions.buy_goods', 'Buy goods') },
    { id: '2', icon: 'document-text-outline', color: '#8B5CF6', bgColor: '#F5F3FF', title: t('home.actions.pay_bills', 'Pay bills') },
    { id: '3', icon: 'cart-outline', color: '#F59E0B', bgColor: '#FFFBEB', title: t('home.actions.buy_pay_me', 'Buy / Pay me') },
    { id: '4', icon: 'people-outline', color: '#10B981', bgColor: '#ECFDF5', title: t('home.actions.send_request', 'Send &\nRequest funds') },
    { id: '5', icon: 'add-circle-outline', color: '#10B981', bgColor: '#ECFDF5', title: t('home.actions.top_up', 'Top-up\nDZYwallet') },
    { id: '6', icon: 'storefront-outline', color: '#F59E0B', bgColor: '#FFFBEB', title: t('home.actions.refer_business', 'Refer\na business') },
    { id: '7', icon: 'globe-outline', color: '#3B82F6', bgColor: '#EFF6FF', title: t('home.actions.source_africa', 'Source\nin Africa') },
    { id: '8', icon: 'phone-portrait-outline', color: '#10B981', bgColor: '#F0FDFA', title: t('home.actions.personal_atm', 'Personal ATM') },
  ];

  useEffect(() => {
    if (!isBannerVisible) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, [isBannerVisible]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => navigation.navigate('PersonalAccountScreen')}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarRing, user?.role === 'merchant' ? styles.merchantRing : styles.userRing]}>
                <View style={styles.avatarWrapper}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                  {user?.avatar ? (
                    <Image source={typeof user.avatar === 'string' ? { uri: user.avatar } : user.avatar} style={styles.avatarImage} />
                  ) : null}
                </View>
              </View>
              <View style={{ flexShrink: 1, paddingRight: 4 }}>
                <Text style={styles.greetingText}>{language === 'fr' ? 'Bonjour,' : 'Hello,'}</Text>
                <Text style={styles.nameText} numberOfLines={1}>{(user?.name || 'Utilisateur').split(' ')[0]}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <LanguageSelector />
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={18} color="#1A2840" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
                <Ionicons name="settings-outline" size={20} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          <WalletCard balances={walletBalances} />

          <View style={styles.todoCard}>
            <View style={[styles.sectionHeader, styles.todoCardHeader]}>
              <Text style={styles.sectionTitle}>{language === 'fr' ? 'À faire' : 'To-do list'}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TodoListScreen')}>
                <Text style={styles.viewAllText}>{t('viewAll', 'View all')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.todoListContainer}>
              {TODO_LIST.map((item, index) => (
                <View key={item.id} style={[styles.todoItem, index < TODO_LIST.length - 1 && styles.todoItemDivider]}>
                  <View style={[styles.todoIconWrapper, { backgroundColor: item.iconBgColor }]}>
                    <Ionicons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <Text style={styles.todoTitle}>{item.title}</Text>
                  <TouchableOpacity style={[styles.todoButton, { backgroundColor: item.buttonBgColor }]} onPress={() => navigation.navigate(item.route)}>
                    <Text style={[styles.todoButtonText, { color: item.buttonColor }]}>{item.buttonText}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {isBannerVisible && (
            <View style={styles.bannerContainer}>
              {activeSlide === 0 ? (
                <View style={[styles.inviteBanner, { backgroundColor: '#EEF5FF' }]}>
                  <TouchableOpacity style={styles.closeBannerButton} onPress={() => setIsBannerVisible(false)} accessibilityLabel="Close banner">
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.inviteContent}>
                    <Text style={styles.inviteTitle}>
                      {language === 'fr' ? "Invitez vos amis\net gagnez " : "Invite friends\nand earn "}
                      <Text style={{ color: '#3B82F6' }}>$5 in DZY</Text>
                    </Text>
                    <Text style={styles.inviteSubtitle}>
                      {language === 'fr' ? "Envoyez des fonds, achetez,\npayez vos factures et gagnez." : "Send money, buy goods,\npay bills and earn rewards."}
                    </Text>
                    <TouchableOpacity style={[styles.inviteButton, { backgroundColor: '#071D54' }]} onPress={() => navigation.navigate('RewardsScreen')}>
                      <Text style={styles.inviteButtonText}>{language === 'fr' ? 'Inviter' : 'Invite now'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inviteGraphic}>
                    <View style={styles.inviteOrbitOne} />
                    <View style={styles.inviteOrbitTwo} />
                    <View style={styles.giantCoin}>
                      <View style={styles.innerCoin}>
                        <Text style={styles.coinText}>DZY</Text>
                      </View>
                    </View>
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={[styles.miniAvatar, { top: 10, right: 12 }]} />
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=9' }} style={[styles.miniAvatar, { bottom: 12, left: 14 }]} />
                  </View>
                </View>
              ) : (
                <View style={[styles.inviteBanner, { backgroundColor: '#F0FDF4' }]}>
                  <TouchableOpacity style={styles.closeBannerButton} onPress={() => setIsBannerVisible(false)} accessibilityLabel="Close banner">
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.inviteContent}>
                    <Text style={styles.inviteTitle}>
                      {language === 'fr' ? "Référencez un commerce\net gagnez " : "Refer a Store or Business\nand earn "}
                      <Text style={{ color: '#10B981' }}>$10 in DZY</Text>
                    </Text>
                    <Text style={styles.inviteSubtitle}>
                      {language === 'fr' ? "Recommandez un business\net gagnez des récompenses." : "Refer a store or business\nand earn rewards."}
                    </Text>
                    <TouchableOpacity style={[styles.inviteButton, { backgroundColor: '#10B981' }]} onPress={() => navigation.navigate('ShopsScreen')}>
                      <Text style={styles.inviteButtonText}>{language === 'fr' ? 'Référencer' : 'Refer now'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.storeGraphic}>
                    <Image source={require('../../assets/brand/dzy_store_icone.png')} style={{ width: 100, height: 85 }} resizeMode="contain" />
                  </View>
                </View>
              )}
              <View style={styles.carouselDotsContainer}>
                <TouchableOpacity onPress={() => setActiveSlide(0)}><View style={[styles.carouselDot, activeSlide === 0 ? styles.activeDotSlide0 : styles.inactiveDot]} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveSlide(1)}><View style={[styles.carouselDot, activeSlide === 1 ? styles.activeDotSlide1 : styles.inactiveDot]} /></TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{language === 'fr' ? 'Raccourcis rapides' : 'Quick actions'}</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity key={action.id} style={styles.actionGridItem} onPress={() => { if (action.id === '1' || action.id === '7') navigation.navigate('ShopsScreen'); else if (action.id === '2') navigation.navigate('ContactsScreen', { nextScreen: 'ChooseServiceScreen' }); else if (action.id === '3') navigation.navigate('ReceiveFundsV2Screen'); else if (action.id === '4') navigation.navigate('ContactsScreen', { nextScreen: 'SendMoneyScreen' }); else if (action.id === '5') navigation.navigate('TopUpScreen'); else if (action.id === '6') navigation.navigate('ReferBusinessScreen'); else if (action.id === '8') navigation.navigate('WithdrawFundsScreen'); }}>
                <View style={styles.actionGridIcon}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionGridText} numberOfLines={2}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.securityBanner}>
            <View style={styles.securityIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#1A2840" />
            </View>
            <View style={styles.securityTextContent}>
              <Text style={styles.securityTitle}>{language === 'fr' ? 'Sécurisé, simple et instantané' : 'Secure, simple and instant'}</Text>
              <Text style={styles.securityDesc}>
                {language === 'fr' ? 'Vos fonds sont protégés par les protocoles de sécurité les ' : 'Your funds are protected by the '}
                <Text style={{ color: '#F59E0B' }}>{language === 'fr' ? 'plus élevés.' : 'highest'}</Text>
                {language === 'fr' ? '' : ' security protocols.'}
              </Text>
            </View>
            <View style={styles.lockIconWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#1A2840" />
            </View>
          </View>

          <View style={{ height: 24 }} />
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
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 8 
  },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: isSmallScreen ? 14 : 20, 
    paddingBottom: 8 
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 6 
  },
  avatarRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  merchantRing: { borderColor: '#8B5CF6' },
  userRing: { borderColor: '#3B82F6' },
  avatarWrapper: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: '#071D54', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  avatarImage: { ...StyleSheet.absoluteFill, width: 38, height: 38, borderRadius: 19 },
  greetingText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A2840' },
  nameText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  merchantBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  merchantBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#FFFFFF', letterSpacing: 0.5 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconButton: { 
    width: 34, 
    height: 34, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: isSmallScreen ? 4 : 8, 
    position: 'relative', 
    backgroundColor: '#FFFFFF' 
  },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: isSmallScreen ? 14 : 20, 
    marginTop: 14, 
    marginBottom: 8 
  },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#1A2840' },
  viewAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#F59E0B' },
  todoCard: { 
    marginHorizontal: isSmallScreen ? 14 : 20, 
    marginTop: 10, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#F0F2F6', 
    backgroundColor: '#FFFFFF', 
    boxShadow: '0px 4px 12px #0A1737', 
    overflow: 'hidden' 
  },
  todoCardHeader: { paddingHorizontal: 12, marginTop: 0, marginBottom: 0, paddingVertical: 8 },
  todoListContainer: { paddingHorizontal: 12 },
  todoItem: { flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingVertical: 3 },
  todoItemDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F3F7' },
  todoIconWrapper: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  todoTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840', lineHeight: 14, paddingRight: 10 },
  todoButton: { minWidth: 60, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  todoButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  bannerContainer: { marginHorizontal: isSmallScreen ? 14 : 20, marginTop: 10, position: 'relative' },
  inviteBanner: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', overflow: 'hidden', position: 'relative', minHeight: 125 },
  inviteContent: { flex: 1, zIndex: 2, justifyContent: 'center', paddingRight: 80 },
  inviteTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', lineHeight: 18, marginBottom: 3 },
  inviteSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', lineHeight: 13, marginBottom: 8 },
  inviteButton: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 7 },
  inviteButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#FFFFFF' },
  inviteGraphic: { width: 90, height: '100%', position: 'absolute', right: 0, top: 0, justifyContent: 'center', alignItems: 'center' },
  giantCoin: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFC33D', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFE078', transform: [{ perspective: 800 }, { rotateY: '-20deg' }], boxShadow: '-4px 8px 10px #F59E0B' },
  innerCoin: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F6A900', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FBBF24' },
  coinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF' },
  miniAvatar: { width: 26, height: 26, borderRadius: 13, position: 'absolute', borderWidth: 2, borderColor: '#FFFFFF' },
  inviteOrbitOne: { position: 'absolute', width: 95, height: 48, borderRadius: 48, borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed', transform: [{ rotate: '-18deg' }] },
  inviteOrbitTwo: { position: 'absolute', width: 85, height: 38, borderRadius: 40, borderWidth: 1, borderColor: '#F59E0B', borderStyle: 'dashed', transform: [{ rotate: '20deg' }] },
  storeGraphic: { width: 90, height: '100%', position: 'absolute', right: 5, top: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  closeBannerButton: { position: 'absolute', top: 8, right: 10, zIndex: 10 },
  carouselDotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 6, left: 0, right: 0, gap: 5 },
  carouselDot: { width: 6, height: 6, borderRadius: 3 },
  activeDotSlide0: { backgroundColor: '#10B981', width: 7, height: 7, borderRadius: 3.5 },
  activeDotSlide1: { backgroundColor: '#10B981', width: 7, height: 7, borderRadius: 3.5 },
  inactiveDot: { backgroundColor: '#D1D5DB' },
  quickActionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: isSmallScreen ? 10 : 16,
    justifyContent: 'space-between',
  },
  actionGridItem: { 
    width: '23.5%', 
    alignItems: 'center', 
    minHeight: 80, 
    paddingHorizontal: 2, 
    paddingVertical: 7, 
    borderWidth: 1, 
    borderColor: '#F1F3F7', 
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  actionGridIcon: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  actionGridText: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, lineHeight: 11.5, color: '#1A2840', textAlign: 'center', paddingHorizontal: 1 },
  securityBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    marginHorizontal: isSmallScreen ? 14 : 20, 
    borderRadius: 14, 
    padding: 10, 
    marginTop: 8 
  },
  securityIconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10, boxShadow: '0px 2px 4px #000' },
  securityTextContent: { flex: 1 },
  securityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', marginBottom: 2 },
  securityDesc: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#6B7280', lineHeight: 14 },
  lockIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }
});



