import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '../context/AppContext';

export default function BottomNavBar({ activeTab = 'Home', onCenterButtonPress, isMenuOpen, language: propLanguage }) {
  const navigation = useNavigation();
  const [localMenuOpen, setLocalMenuOpen] = useState(false);
  const menuOpen = typeof isMenuOpen === 'boolean' ? isMenuOpen : localMenuOpen;

  let accountMode = 'personal';
  let activeLanguage = propLanguage || 'fr';
  let t = (k, f) => f || k;
  try {
    const appCtx = useApp();
    if (appCtx && appCtx.accountMode) accountMode = appCtx.accountMode;
    if (appCtx && appCtx.language) activeLanguage = appCtx.language;
    if (appCtx && appCtx.t) t = appCtx.t;
  } catch (e) { }

  const handleHomePress = () => {
    if (accountMode === 'business') {
      navigation.navigate('DashboardEngScreen');
    } else {
      navigation.navigate('HomeScreen');
    }
  };

  const QUICK_ACTIONS = [
    { id: '1', icon: 'bag-handle-outline', color: '#3B82F6', bgColor: '#EFF6FF', label: activeLanguage === 'en' ? 'Buy goods' : 'Acheter des biens', route: 'ShopsScreen' },
    { id: '2', icon: 'document-text-outline', color: '#8B5CF6', bgColor: '#F5F3FF', label: activeLanguage === 'en' ? 'Pay bills' : 'Payer des factures', route: 'ContactsScreen' },
    { id: '3', icon: 'cart-outline', color: '#F59E0B', bgColor: '#FFFBEB', label: activeLanguage === 'en' ? 'Request funds' : 'Demander des fonds', route: 'ReceiveFundsV2Screen' },
    { id: '4', icon: 'people-outline', color: '#10B981', bgColor: '#ECFDF5', label: activeLanguage === 'en' ? 'Send Stablecoins' : "envoyer des Stablecoins", route: 'ContactsScreen' },
    { id: '5', icon: 'add-circle-outline', color: '#10B981', bgColor: '#ECFDF5', label: activeLanguage === 'en' ? 'Top up' : 'Recharger', route: 'TopUpScreen' },
    { id: '6', icon: 'storefront-outline', color: '#F59E0B', bgColor: '#FFFBEB', label: activeLanguage === 'en' ? 'Refer a shop' : 'Référer un shop', route: 'ReferBusinessScreen' },
    { id: '7', icon: 'swap-horizontal', color: '#3B82F6', bgColor: '#EFF6FF', label: activeLanguage === 'en' ? 'Swap' : 'Échanger', route: 'SwapTokensScreen' },
    { id: '8', icon: 'qr-code-outline', color: '#10B981', bgColor: '#F0FDFA', label: 'Scan & Cash', route: 'LocalExchangeScreen' },
  ];

  const closeAndNavigate = (route) => {
    setLocalMenuOpen(false);
    navigation.navigate(route);
  };

  const activeTabLower = (activeTab || '').toLowerCase();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <Modal visible={menuOpen} transparent={true} animationType="fade" onRequestClose={() => {
        if (onCenterButtonPress) onCenterButtonPress();
        else setLocalMenuOpen(false);
      }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
          if (onCenterButtonPress) onCenterButtonPress();
          else setLocalMenuOpen(false);
        }}>
          <TouchableOpacity activeOpacity={1} style={styles.shortcutMenu} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.shortcutTitle}>{activeLanguage === 'en' ? 'Quick actions' : 'Actions rapides'}</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity key={action.id} style={styles.actionGridItem} onPress={() => closeAndNavigate(action.route)}>
                  <View style={[styles.actionGridIcon, { backgroundColor: action.bgColor }]}>
                    <Ionicons name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text style={styles.actionGridText} numberOfLines={2} adjustsFontSizeToFit>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <View style={styles.container}>
        {/* Home */}
        <NavItem
          icon="home"
          label={t('tabHome', 'Accueil')}
          isActive={activeTabLower === 'home' || activeTabLower === 'accueil'}
          onPress={handleHomePress}
        />

        {/* Contacts */}
        <NavItem
          icon="people-outline"
          label={t('tabContacts', 'Contacts')}
          isActive={activeTabLower === 'contacts'}
          onPress={() => navigation.navigate('ContactsScreen')}
        />

        {/* Center Floating Button */}
        <View style={styles.centerButtonWrapper}>
          <TouchableOpacity
            style={[styles.centerButton, menuOpen && styles.centerButtonActive]}
            onPress={() => {
              if (onCenterButtonPress) {
                onCenterButtonPress();
              } else {
                setLocalMenuOpen(!localMenuOpen);
              }
            }}
            activeOpacity={0.8}
            accessibilityLabel={menuOpen ? 'Fermer les actions rapides' : 'Ouvrir les actions rapides'}
          >
            <Ionicons
              name={menuOpen ? "close" : "swap-horizontal"}
              size={26}
              color="#1A2840"
            />
          </TouchableOpacity>
        </View>

        {/* Shops */}
        <NavItem
          icon="storefront-outline"
          label={t('tabShops', 'Boutique')}
          isActive={['shops', 'shop', 'boutique', 'boutiques'].includes(activeTabLower)}
          onPress={() => navigation.navigate('ShopsScreen')}
        />

        {/* Wallet / Assets */}
        <NavItem
          icon="wallet-outline"
          label={t('tabWallet', 'Portefeuille')}
          isActive={['wallet', 'portefeuille', 'assets'].includes(activeTabLower)}
          onPress={() => navigation.navigate('AssetListScreen')}
        />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, isActive, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={isActive ? icon.replace('-outline', '') : icon} size={22} color={isActive ? '#20365B' : '#A0AABF'} />
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F4F5F7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
  },
  shortcutMenu: {
    position: 'absolute', left: 12, right: 12, bottom: 100, zIndex: 50,
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.16,
    shadowRadius: 14, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  shortcutTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', marginBottom: 12 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionGridItem: { width: '23%', alignItems: 'center', marginBottom: 12 },
  actionGridIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionGridText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#1A2840', textAlign: 'center', lineHeight: 12 },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    position: 'relative',
    height: 58,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#A0AABF',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#20365B',
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerButton: {
    position: 'absolute',
    top: -20,
    backgroundColor: '#FFC759',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px #FFC759',
  },
  centerButtonActive: {
    backgroundColor: '#FFB800',
  },
});
