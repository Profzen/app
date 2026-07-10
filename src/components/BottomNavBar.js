import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BottomNavBar({ activeTab = 'Home', onCenterButtonPress, isMenuOpen }) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NavItem icon="home" label="Accueil" isActive={activeTab.toLowerCase() === 'home' || activeTab.toLowerCase() === 'accueil'} onPress={() => navigation.navigate('HomeScreen')} />
        <NavItem icon="people-outline" label="Contacts" isActive={activeTab.toLowerCase() === 'contacts'} onPress={() => navigation.navigate('ContactsScreen')} />
        
        {/* Center Floating Button */}
        <View style={styles.centerButtonWrapper}>
          <TouchableOpacity 
            style={[styles.centerButton, isMenuOpen && styles.centerButtonActive]}
            onPress={() => {
              if (onCenterButtonPress) {
                onCenterButtonPress();
              } else {
                navigation.navigate('SwapTokensScreen');
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isMenuOpen ? "close" : "swap-horizontal"} 
              size={28} 
              color="#1A2840" 
            />
          </TouchableOpacity>
        </View>

        <NavItem icon="grid-outline" label="Shops" isActive={activeTab.toLowerCase() === 'shops'} onPress={() => navigation.navigate('ShopsScreen')} />
        <NavItem icon="ellipsis-horizontal" label="More" isActive={activeTab.toLowerCase() === 'more'} onPress={() => navigation.navigate('DashboardScreen')} />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, isActive, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={isActive ? icon.replace('-outline', '') : icon} size={24} color={isActive ? '#3B82F6' : '#A0AABF'} />
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F4F5F7',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
    height: 60,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  navLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#A0AABF',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#3B82F6',
  },
  centerButtonWrapper: {
    width: 60,
    alignItems: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: -10, // Elevate above the bar
    backgroundColor: '#FFC759',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
