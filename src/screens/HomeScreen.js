


import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WalletCard from '../components/WalletCard';
import BottomNavBar from '../components/BottomNavBar';
import { shareInviteLink, shareShopLink } from '../utils/shareHelper';
import { useApp } from '../context/AppContext';


const getFlagCode = (lang) => {
  switch (lang) {
    case 'fr': return 'fr';
    case 'pt': return 'pt';
    case 'ar': return 'sa';
    case 'am': return 'et';
    default: return 'gb';
  }
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { language, toggleLanguage, t, user } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [walletBalances, setWalletBalances] = useState({});

  useEffect(() => {
    if (user && user.allBalances) {
      setWalletBalances(user.allBalances);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => navigation.navigate('PersonalAccountScreen')}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarRing, { borderColor: user?.role === 'merchant' ? '#8B5CF6' : '#20365B' }]}>
                <View style={styles.avatarWrapper}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                  {user?.avatar ? (
                    <Image source={typeof user.avatar === 'string' ? { uri: user.avatar } : user.avatar} style={styles.avatarImage} />
                  ) : null}
                </View>
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.greetingText}>{language === 'fr' ? 'Bonjour,' : 'Hello,'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.nameText} numberOfLines={1}>{(user?.name || 'Utilisateur').split(' ')[0]}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.langButton} onPress={toggleLanguage} accessibilityLabel="Switch Language">
                <Text style={styles.langText}>{language.toUpperCase()}</Text>
                <Image source={{ uri: `https://flagcdn.com/w40/${getFlagCode(language)}.png` }} style={styles.langFlag} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={20} color="#1A2840" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={20} color="#1A2840" />
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
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
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
                    <Image source={require('../../assets/brand/dzy_store_icone.png')} style={{ width: 110, height: 95 }} resizeMode="contain" />
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
              <TouchableOpacity key={action.id} style={styles.actionGridItem} onPress={() => { if (action.id === '1' || action.id === '3' || action.id === '6' || action.id === '7') navigation.navigate('ShopsScreen'); else if (action.id === '2') navigation.navigate('ChooseServiceScreen'); else if (action.id === '4') navigation.navigate('SendMoneyScreen'); else if (action.id === '5') navigation.navigate('TopUpScreen'); else if (action.id === '8') navigation.navigate('WithdrawFundsScreen'); }}>
                <View style={styles.actionGridIcon}>
                  <Ionicons name={action.icon} size={27} color={action.color} />
                </View>
                <Text style={styles.actionGridText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.securityBanner}>
            <View style={styles.securityIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <View style={styles.securityTextContent}>
              <Text style={styles.securityTitle}>{language === 'fr' ? 'Sécurisé, simple et instantané' : 'Secure, simple and instant'}</Text>
              <Text style={styles.securityDesc}>
                {language === 'fr' ? 'Vos fonds sont protégés par les protocole de sécurité les ' : 'Your funds are protected by the '}
                <Text style={{ color: '#F59E0B' }}>{language === 'fr' ? 'plus élevés.' : 'highest'}</Text>
                {language === 'fr' ? '' : ' security protocols.'}
              </Text>
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  avatarRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#071D54', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { ...StyleSheet.absoluteFillObject, width: 40, height: 40, borderRadius: 20 },
  greetingText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1A2840' },
  nameText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840' },
  merchantBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  merchantBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#FFFFFF', letterSpacing: 0.5 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  
    langButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, marginLeft: 8, height: 36 },
    langText: { marginRight: 6, fontSize: 12, fontFamily: 'Inter_700Bold', color: '#1A2840' },
    langFlag: { width: 18, height: 13, borderRadius: 2 },
iconButton: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 8, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840' },
  viewAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#F59E0B' },
  todoCard: { marginHorizontal: 20, marginTop: 12, borderRadius: 17, borderWidth: 1, borderColor: '#F0F2F6', backgroundColor: '#FFFFFF', boxShadow: '0px 4px 12px #0A1737', overflow: 'hidden' },
  todoCardHeader: { paddingHorizontal: 14, marginTop: 0, marginBottom: 0, paddingVertical: 9 },
  todoListContainer: { paddingHorizontal: 14 },
  todoItem: { flexDirection: 'row', alignItems: 'center', minHeight: 42, paddingVertical: 3 },
  todoItemDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F3F7' },
  todoIconWrapper: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  todoTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', lineHeight: 15, paddingRight: 16 },
  todoButton: { minWidth: 66, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  todoButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  bannerContainer: { marginHorizontal: 20, marginTop: 12, position: 'relative' },
  inviteBanner: { borderRadius: 17, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', overflow: 'hidden', position: 'relative', minHeight: 135 },
  inviteContent: { flex: 1, zIndex: 2, justifyContent: 'center' },
  inviteTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', lineHeight: 20, marginBottom: 4 },
  inviteSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 14, marginBottom: 10 },
  inviteButton: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8 },
  inviteButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF' },
  inviteGraphic: { width: '45%', height: '100%', position: 'absolute', right: 0, top: 0, justifyContent: 'center', alignItems: 'center' },
  giantCoin: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFC33D', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFE078', transform: [{ perspective: 800 }, { rotateY: '-20deg' }], boxShadow: '-4px 8px 10px #F59E0B' },
  innerCoin: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F6A900', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FBBF24' },
  coinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#FFFFFF' },
  miniAvatar: { width: 30, height: 30, borderRadius: 15, position: 'absolute', borderWidth: 2, borderColor: '#FFFFFF' },
  inviteOrbitOne: { position: 'absolute', width: 120, height: 58, borderRadius: 60, borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed', transform: [{ rotate: '-18deg' }] },
  inviteOrbitTwo: { position: 'absolute', width: 110, height: 46, borderRadius: 55, borderWidth: 1, borderColor: '#F59E0B', borderStyle: 'dashed', transform: [{ rotate: '20deg' }] },
  storeGraphic: { width: '45%', height: '100%', position: 'absolute', right: 5, top: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  storeBuilding: { width: 78, height: 72, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB', overflow: 'hidden', position: 'relative', boxShadow: '0px 4px 6px #000' },
  storeAwning: { backgroundColor: '#10B981', height: 22, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#059669' },
  storeAwningText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: '#FFFFFF', letterSpacing: 0.5 },
  storeFront: { flex: 1, backgroundColor: '#FAFAFA', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 6, paddingHorizontal: 8 },
  storeDoor: { width: 22, height: 32, backgroundColor: '#059669', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  storeWindow: { width: 28, height: 24, backgroundColor: '#E0F2FE', borderRadius: 4, borderWidth: 1.5, borderColor: '#38BDF8' },
  storeCoin: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC759', borderWidth: 2, borderColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 4, bottom: 12, boxShadow: '0px 3px 5px #F59E0B' },
  storeCoinText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#FFFFFF' },
  closeBannerButton: { position: 'absolute', top: 10, right: 12, zIndex: 10 },
  carouselDotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 8, left: 0, right: 0, gap: 6 },
  carouselDot: { width: 7, height: 7, borderRadius: 3.5 },
  activeDotSlide0: { backgroundColor: '#10B981', width: 8, height: 8, borderRadius: 4 },
  activeDotSlide1: { backgroundColor: '#10B981', width: 8, height: 8, borderRadius: 4 },
  inactiveDot: { backgroundColor: '#D1D5DB' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20 },
  actionGridItem: { flexBasis: '25%', maxWidth: '25%', alignItems: 'center', minHeight: 86, paddingHorizontal: 3, paddingVertical: 9, borderWidth: 1, borderColor: '#F1F3F7', borderRadius: 14 },
  actionGridIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 3 },
  actionGridText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, lineHeight: 12, color: '#1A2840', textAlign: 'center', paddingHorizontal: 4 },
  securityBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', marginHorizontal: 20, borderRadius: 16, padding: 12, marginTop: 10 },
  securityIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, boxShadow: '0px 2px 4px #000' },
  securityTextContent: { flex: 1 },
  securityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', marginBottom: 2 },
  securityDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', lineHeight: 16 },
  lockIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 12 }
});



