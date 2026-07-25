import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';

const SETTINGS = [
  { id: 'account', title: 'Account setting', description: 'Manage your account settings and preferences', icon: 'person-outline', color: '#3B82F6', background: '#EFF6FF', route: 'AccountSettingsScreen' },
  { id: 'personal', title: 'Personal account', description: 'Manage your personal information and verification', icon: 'person-outline', color: '#10B981', background: '#ECFDF5', route: 'PersonalAccountScreen' },
  { id: 'business', title: 'Business account', description: 'Manage your business profile and preferences', icon: 'storefront-outline', color: '#8B5CF6', background: '#F5F3FF', route: 'BusinessAccountScreen' },
  { id: 'assistant', title: 'Ask Aminata', description: 'Get help and answers from our virtual assistant', icon: 'help-circle-outline', color: '#F59E0B', background: '#FFFBEB', route: 'AskAminataScreen' },
  { id: 'loyalty', title: 'DizzyFamily Loyalty Program', description: 'Earn rewards and enjoy exclusive benefits', icon: 'gift-outline', color: '#EF4444', background: '#FEF2F2', route: 'DizzyFamilyScreen' },
  { id: 'about', title: 'About DizzitUp', description: 'Learn more about us and our mission', icon: 'information-circle-outline', color: '#3B82F6', background: '#EFF6FF', route: 'AboutDizzitUpScreen' },
  { id: 'contact', title: 'Contact us', description: 'Get in touch with our support team', icon: 'headset-outline', color: '#10B981', background: '#ECFDF5', route: 'ContactUsScreen' },
];

export default function MoreSettingsScreen() {
  const navigation = useNavigation();
  const [toast, setToast] = useState(null);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('DashboardScreen');
    }
  };

  const openSetting = (item) => {
    if (item.route) {
      navigation.navigate(item.route);
      return;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.pageTitle}>Settings</Text>
              <Text style={styles.pageSubtitle}>Manage your account and preferences</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton} accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('PersonalAccountScreen')} accessibilityLabel="Open David Mensah profile">
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={22} color="#FFFFFF" />
              <Image source={{ uri: 'https://i.pravatar.cc/120?img=11' }} style={styles.avatar} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>David Mensah</Text>
              <Text style={styles.profileEmail}>david.mensah@email.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Settings List */}
          <View style={styles.settingsCard}>
            {SETTINGS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.settingRow, index < SETTINGS.length - 1 && styles.settingDivider]}
                onPress={() => openSetting(item)}
                accessibilityLabel={item.title}
              >
                <View style={[styles.settingIcon, { backgroundColor: item.background }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Log out Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] })} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" language="fr" />
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0 },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backButton: { paddingRight: 10, paddingVertical: 4 },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#1A2840', lineHeight: 28 },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', marginTop: 1 },
  notificationButton: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFC759', borderWidth: 1, borderColor: '#FFFFFF' },
  profileCard: { minHeight: 74, borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  avatarFallback: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#071D54', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 14 },
  avatar: { ...StyleSheet.absoluteFillObject, width: 50, height: 50, borderRadius: 25 },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#1A2840', marginBottom: 2 },
  profileEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280' },
  settingsCard: { borderWidth: 1, borderColor: '#F0F2F5', borderRadius: 16, backgroundColor: '#FFFFFF', paddingHorizontal: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  settingRow: { minHeight: 64, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingText: { flex: 1, paddingRight: 6 },
  settingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840', marginBottom: 2 },
  settingDescription: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16, color: '#6B7280' },
  logoutButton: { height: 50, borderRadius: 14, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#EF4444' },
});


