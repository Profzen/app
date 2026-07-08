import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WalletCard from '../components/WalletCard';
import TodoCard from '../components/TodoCard';
import FeedItem from '../components/FeedItem';
import ServiceMenuItem from '../components/ServiceMenuItem';
import BottomNavBar from '../components/BottomNavBar';

const TODO_DATA = [
  { id: '1', icon: 'chatbubble-ellipses-outline', iconColor: '#3B82F6', iconBgColor: '#EFF6FF', title: 'Demande reçue\nRequest funds', subtitle: 'De : John Doe', date: 'Il y a 2 h' },
  { id: '2', icon: 'calendar-outline', iconColor: '#10B981', iconBgColor: '#ECFDF5', title: 'Paiement\nprogrammé', subtitle: 'Facture CEET', date: 'Échéance demain' },
  { id: '3', icon: 'paper-plane-outline', iconColor: '#8B5CF6', iconBgColor: '#F5F3FF', title: 'Buy /\nPay me this', subtitle: '2 demandes', date: 'en attente' },
  { id: '4', icon: 'wallet-outline', iconColor: '#F59E0B', iconBgColor: '#FFFBEB', title: 'Alerte Top-up\nDZYwallet', subtitle: 'Solde faible', date: '' },
  { id: '5', icon: 'gift-outline', iconColor: '#EC4899', iconBgColor: '#FDF2F8', title: 'Anniversaire\ncontact', subtitle: 'Marie K.', date: 'Demain' },
  { id: '6', icon: 'sync-outline', iconColor: '#8B5CF6', iconBgColor: '#F5F3FF', title: 'Abonnement\nmensuel', subtitle: 'Spotify', date: '15 juil. 2026' },
];

const SERVICES_DATA = [
  { id: '1', icon: 'bag-handle-outline', title: 'Pay bills & Send essentials', subtitle: 'Achetez des crédits, payez vos factures et plus', action: 'navigate_bills' },
  { id: '2', icon: 'paper-plane-outline', title: 'Send funds', subtitle: "Envoyez de l'argent à vos proches", action: 'navigate_send' },
  { id: '3', icon: 'chatbubbles-outline', title: 'Buy, Pay me this', subtitle: 'Payez un marchand ou demandez un paiement', action: 'navigate_payme' },
  { id: '4', icon: 'cash-outline', title: 'Request funds', subtitle: "Demandez de l'argent à quelqu'un", action: 'navigate_request' },
  { id: '5', icon: 'add-circle-outline', title: 'Top-up DZYwallet', subtitle: 'Rechargez votre DZYwallet facilement', action: 'navigate_topup' },
  { id: '6', icon: 'storefront-outline', title: 'Refer a business', subtitle: 'Parrainez une entreprise et gagnez des DZY', action: 'navigate_refer' },
  { id: '7', icon: 'globe-outline', title: 'Source in Africa', subtitle: 'Achetez produits et services africains', action: 'navigate_source' },
  { id: '8', icon: 'card-outline', title: 'Local FIAT ATM', subtitle: 'Scan to Cash against USDC, USDT, EURC & DZY', action: 'navigate_atm' },
];

const FEED_DATA = [
  { id: '1', icon: 'gift-outline', iconColor: '#F59E0B', iconBgColor: '#FFFBEB', titleBold: 'Ben Beckman', title: 'vous a envoyé 20 DZY.', timeAgo: 'Il y a 4 h', imageColor: '#4B5563' },
  { id: '2', icon: 'cart-outline', iconColor: '#8B5CF6', iconBgColor: '#F5F3FF', titleBold: 'Super Maki', title: 'accepte les paiements en DZY.', timeAgo: 'Il y a 1 jour', imageColor: '#9CA3AF' },
];

export default function HomeScreen() {
  // Mocked data that would come from API endpoints like /auth/profile and /wallet/balances
  const [userProfile, setUserProfile] = React.useState({
    firstName: 'David',
    profilePicture: null, // e.g. 'https://example.com/avatar.png'
  });

  const [walletBalances, setWalletBalances] = React.useState({
    DZY: 125500,
    EUR: 191.34,
    XAF: 125120
  });

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [loadingServiceId, setLoadingServiceId] = React.useState(null);

  const handleServicePress = (service) => {
    // Prod behavior: simulate navigating to a sub-screen or fetching data
    setLoadingServiceId(service.id);
    console.log(`Action demandée : ${service.action}`);
    
    setTimeout(() => {
      setLoadingServiceId(null);
      alert(`Navigation vers : ${service.title}`);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              {userProfile?.profilePicture ? (
                <Image source={{ uri: userProfile.profilePicture }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
              <View>
                <Text style={styles.greetingText}>Hello,</Text>
                <Text style={styles.nameText}>{userProfile?.firstName || 'User'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
          {/* Wallet Card */}
          <WalletCard balances={walletBalances} />
          {/* To-do List Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>To-do list</Text>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="arrow-forward" size={16} color="#1A2840" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={TODO_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TodoCard {...item} />}
            contentContainerStyle={styles.todoListContent}
          />
          {/* Promo Banner */}
          <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Earn DZY{'\n'}for free !</Text>
              <Text style={styles.promoSubtitle}>Invite friends, complete{'\n'}missions and earn DZY.</Text>
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Learn more</Text>
              </TouchableOpacity>
            </View>
            {/* Dots */}
            <View style={styles.promoDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
          
          {isMenuOpen ? (
            <View style={styles.servicesContainer}>
              {SERVICES_DATA.map(item => (
                <ServiceMenuItem 
                  key={item.id} 
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  isLoading={loadingServiceId === item.id}
                  onPress={() => handleServicePress(item)}
                />
              ))}
            </View>
          ) : (
            <React.Fragment>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pour vous, autour de vous</Text>
                <TouchableOpacity style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <Ionicons name="arrow-forward" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
              {FEED_DATA.map(item => (
                <FeedItem key={item.id} {...item} />
              ))}
            </React.Fragment>
          )}

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
    backgroundColor: '#F4F5F7',
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
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1D5DB', // Gray placeholder
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  greetingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1A2840',
  },
  nameText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
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
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
    marginRight: 4,
  },
  todoListContent: {
    paddingHorizontal: 20,
  },
  promoBanner: {
    backgroundColor: '#1A2840',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    minHeight: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  promoContent: {
    zIndex: 1,
    width: '60%',
  },
  promoTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  promoSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 18,
  },
  promoBtn: {
    backgroundColor: '#FFC759',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  promoBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  promoDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A0AABF',
    marginHorizontal: 4,
    opacity: 0.5,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    opacity: 1,
  },
  servicesContainer: {
    marginTop: 24,
    marginBottom: 8,
  }
});
