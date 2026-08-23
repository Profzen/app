import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '../context/AppContext';

export default function BottomNavBar({ activeTab = 'Home', onCenterButtonPress, isMenuOpen, language: propLanguage }) {
  const navigation = useNavigation();
  const [localMenuOpen, setLocalMenuOpen] = useState(false);
  const menuOpen = typeof isMenuOpen === 'boolean' ? isMenuOpen : localMenuOpen;
  
  let accountMode = 'personal';
  let activeLanguage = propLanguage || 'fr';
  try {
    const appCtx = useApp();
    if (appCtx && appCtx.accountMode) accountMode = appCtx.accountMode;
    if (appCtx && appCtx.language) activeLanguage = appCtx.language;
  } catch (e) {}

  const handleHomePress = () => {
    if (accountMode === 'business') {
      navigation.navigate('DashboardEngScreen');
    } else {
      navigation.navigate('HomeScreen');
    }
  };

  const shortcuts = [
    ['briefcase-outline', 'Pay bills & Send essentials', 'ChooseServiceScreen'],
    ['paper-plane-outline', 'Send funds', 'SendMoneyScreen'],
    ['chatbox-ellipses-outline', 'Buy, Pay me this', 'ShopsScreen'],
    ['hand-left-outline', 'Request funds', 'ReceiveFundsV2Screen'],
    ['add-circle-outline', 'Top-up DZYwallet', 'TopUpWalletScreen'],
    ['storefront-outline', 'Refer a business', 'ShopsScreen'],
    ['globe-outline', 'Source in Africa', 'ShopsScreen'],
    ['cash-outline', 'Local FIAT ATM', 'WithdrawFundsScreen'],
  ];

  const closeAndNavigate = (route) => {
    setLocalMenuOpen(false);
    navigation.navigate(route);
  };

  const activeTabLower = (activeTab || '').toLowerCase();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      {menuOpen && (
        <View style={styles.shortcutMenu}>
          <Text style={styles.shortcutTitle}>Actions rapides</Text>
          {shortcuts.map(([icon, label, route]) => (
            <TouchableOpacity key={label} style={styles.shortcutItem} onPress={() => closeAndNavigate(route)}>
              <View style={styles.shortcutIcon}>
                <Ionicons name={icon} size={17} color="#1A2840" />
              </View>
              <Text style={styles.shortcutLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#64748B" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.container}>
        {/* Home */}
        <NavItem 
          icon="home" 
          label={activeLanguage === 'en' ? 'Home' : 'Accueil'} 
          isActive={activeTabLower === 'home' || activeTabLower === 'accueil'} 
          onPress={handleHomePress} 
        />

        {/* Contacts */}
        <NavItem 
          icon="people-outline" 
          label="Contacts" 
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
          label={activeLanguage === 'en' ? 'Shop' : 'Boutique'} 
          isActive={['shops', 'shop', 'boutique', 'boutiques'].includes(activeTabLower)} 
          onPress={() => navigation.navigate('ShopsScreen')} 
        />

        {/* Wallet / Assets */}
        <NavItem 
          icon="wallet-outline" 
          label={activeLanguage === 'en' ? 'Wallet' : 'Portefeuille'} 
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
  shortcutMenu: {
    position: 'absolute', left: 12, right: 12, bottom: 64, zIndex: 50,
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.16,
    shadowRadius: 14, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  shortcutTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', marginBottom: 6 },
  shortcutItem: { flexDirection: 'row', alignItems: 'center', minHeight: 42, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  shortcutIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#FFF7E6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  shortcutLabel: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
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
