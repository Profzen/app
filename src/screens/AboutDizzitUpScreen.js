import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Linking, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';

export default function AboutDizzitUpScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [toast, setToast] = useState(null);
  const [releaseNotes, setReleaseNotes] = useState({ features: [], fixes: [], isLoading: true });

  const appVersion = Constants?.expoConfig?.version || '1.0.37';
  const appBuildNumber = Constants?.expoConfig?.ios?.buildNumber || Constants?.expoConfig?.android?.versionCode || '52';

  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const fetchReleaseNotes = async () => {
      try {
        let { data, error } = await supabase
          .from('app_releases')
          .select('new_features, fixes')
          .eq('platform', 'all')
          .eq('language', language.split('-')[0])
          .eq('status', 'published')
          .maybeSingle();

        if (error) throw error;
        
        // Fall back to English if the current language has no release-note entry
        if (!data) {
          const fallback = await supabase
            .from('app_releases')
            .select('new_features, fixes')
            .eq('platform', 'all')
            .eq('language', 'en')
            .eq('status', 'published')
            .maybeSingle();
            
          if (fallback.error) throw fallback.error;
          data = fallback.data;
        }
        
        setReleaseNotes({
          features: data?.new_features || [],
          fixes: data?.fixes || [],
          isLoading: false
        });
      } catch (err) {
        console.log('Failed to fetch release notes, using default fallbacks:', err.message);
        setReleaseNotes({ isLoading: false, features: [], fixes: [] });
      }
    };
    fetchReleaseNotes();
  }, [language]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const openLink = async (title, url) => {
    let fullUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      await WebBrowser.openBrowserAsync(fullUrl, {
        toolbarColor: '#1A2840',
        enableBarCollapsing: true,
        showTitle: true
      });
    } catch (error) {
      console.log('Error opening web browser', error);
      setToast({ title: "Error", message: "Failed to open link." });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Retour">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.pageTitle}>{t('aboutApp.title', 'About DizzitUp')}</Text>
              <Text style={styles.pageSubtitle}>{t('aboutApp.subtitle', 'About our mission & company')}</Text>
            </View>
          </View>

          {/* Logo & Brand Header */}
          <View style={styles.brandCard}>
            <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.appName}>DizzitUp Mobile App</Text>
            <Text style={styles.versionText}>{`Version v${appVersion} (Build ${appBuildNumber} / ${currentYear})`}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Prod-Ready • Web3 & Stablecoins</Text>
            </View>
          </View>

          {/* Current Build Information & Release Notes */}
          <Text style={styles.sectionHeader}>{t('aboutApp.buildSectionTitle', 'CURRENT BUILD & RELEASE NOTES')}</Text>
          <View style={styles.buildCard}>
            {/* Build Meta Header */}
            <View style={styles.buildMetaRow}>
              <View style={styles.buildChip}>
                <Ionicons name="cube-outline" size={13} color="#1A2840" style={{ marginRight: 4 }} />
                <Text style={styles.buildChipText}>{`Build #${appBuildNumber}`}</Text>
              </View>
              <View style={styles.versionChip}>
                <Text style={styles.versionChipText}>{`v${appVersion}`}</Text>
              </View>
              <View style={styles.dateBadge}>
                <Ionicons name="calendar-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.dateBadgeText}>{currentDate}</Text>
              </View>
            </View>

            {/* New Features */}
            <View style={styles.releaseSection}>
              <View style={styles.releaseSectionHeader}>
                <Ionicons name="sparkles" size={15} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={styles.releaseSectionTitle}>{t('aboutApp.newFeaturesTitle', 'NEW FEATURES')}</Text>
              </View>
              {releaseNotes.isLoading ? (
                <Text style={styles.releaseText}>Loading...</Text>
              ) : releaseNotes.features.length > 0 ? (
                releaseNotes.features.map((feature, index) => (
                  <View key={index} style={styles.releaseItem}>
                    <Text style={styles.releaseBullet}>•</Text>
                    <Text style={styles.releaseText}>{feature}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.releaseItem}>
                  <Text style={styles.releaseText}>No release notes available.</Text>
                </View>
              )}
            </View>

            <View style={styles.releaseDivider} />

            {/* Implemented Fixes */}
            <View style={styles.releaseSection}>
              <View style={styles.releaseSectionHeader}>
                <Ionicons name="checkmark-circle" size={15} color="#3B82F6" style={{ marginRight: 6 }} />
                <Text style={styles.releaseSectionTitle}>{t('aboutApp.implementedFixesTitle', 'IMPLEMENTED FIXES')}</Text>
              </View>
              {releaseNotes.isLoading ? (
                <Text style={styles.releaseText}>Loading...</Text>
              ) : releaseNotes.fixes.length > 0 ? (
                releaseNotes.fixes.map((fix, index) => (
                  <View key={index} style={styles.releaseItem}>
                    <Text style={styles.releaseBullet}>•</Text>
                    <Text style={styles.releaseText}>{fix}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.releaseItem}>
                  <Text style={styles.releaseBullet}>•</Text>
                  <Text style={styles.releaseText}>
                    <Text style={styles.releaseBold}>{t('aboutApp.fixPosTitle', 'Point of Sale (POS): ')}</Text>
                    {t('aboutApp.fixPosDesc', 'Full 1-screen non-scrolling cashier calculator with QR receive mode default.')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.releaseDivider} />

            {/* General Warning */}
            <View style={styles.warningContainer}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning-outline" size={15} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={styles.warningTitle}>{t('aboutApp.generalWarningTitle', 'GENERAL WARNING')}</Text>
              </View>
              <Text style={styles.warningText}>
                {t('aboutApp.generalWarningText', 'Beta Test Version: This build is strictly intended for internal validation, TestFlight, and Google Play beta testers. Financial, mobile money, and blockchain operations may interact with test corridors. Please report any unexpected behavior to the team.')}
              </Text>
            </View>
          </View>

          {/* Mission Statement */}
          <Text style={styles.sectionHeader}>{t('aboutApp.missionTitle', 'OUR MISSION')}</Text>
          <View style={styles.card}>
            <Text style={styles.missionText} selectable={true}>
              {t('aboutApp.missionText', 'At DizzitUp, our mission is to break down financial borders and drive economic empowerment across Africa and the globe. We provide a seamless, Web3-powered ecosystem that bridges everyday commerce with the power of stablecoins (USDT, USDC, EURC) and our native reward token (DZY). By democratizing access to instant, borderless, and low-fee financial services, we empower individuals, diaspora communities, and merchants to build wealth and transact with ultimate freedom, security, and trust.')}
            </Text>
          </View>

          {/* App Overview & Core Capabilities */}
          <Text style={styles.sectionHeader}>{t('aboutApp.overviewTitle', 'APP OVERVIEW & SERVICES')}</Text>
          <View style={styles.card}>
            <Text style={styles.featureCategoryTitle}>
              {t('aboutApp.worldwideTitle', 'FOR EVERYONE (BUYERS, MERCHANTS & BUSINESSES WORLDWIDE)')}
            </Text>
            <View style={styles.bulletItem}>
              <Ionicons name="cart-outline" size={16} color="#FFC759" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.featBuyGoods', 'Buy goods & essentials locally and cross-border')}</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="flash-outline" size={16} color="#FFC759" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.featPayBills', 'Pay bills (Electricity, Water, Internet, Tuition)')}</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="phone-portrait-outline" size={16} color="#FFC759" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.featRecharge', 'Recharge mobile airtime & data bundles')}</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="card-outline" size={16} color="#FFC759" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.featOnRamp', 'Buy / On-ramp / Top-up USD & EUR stablecoins (Visa, Mastercard & Mobile Money)')}</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="cash-outline" size={16} color="#FFC759" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.featOffRamp', 'Sell / Off-ramp / Cash-out USD & EUR stablecoins to local African money (Mobile Money or Bank account)')}</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="globe-outline" size={16} color="#FFC759" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.featSendReceive', 'Send & receive worldwide USD & EUR stablecoins instantly')}</Text>
            </View>

            <View style={[styles.divider, { marginVertical: 12 }]} />

            <Text style={styles.featureCategoryTitle}>
              {t('aboutApp.africaBizTitle', 'FOR BUSINESSES & MERCHANTS IN AFRICA')}
            </Text>
            <View style={styles.bulletItem}>
              <Ionicons name="storefront-outline" size={16} color="#3B82F6" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.bizSellGlobal', 'Sell products & services globally to the diaspora')}</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="receipt-outline" size={16} color="#3B82F6" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.bizInvoice', 'Invoice customers and send instant Pay links')}</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="wallet-outline" size={16} color="#3B82F6" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{t('aboutApp.bizSettle', 'Settle and get paid in USD, EUR stablecoins or local African money (Mobile Money or Bank account)')}</Text>
            </View>
          </View>

          {/* Information Links */}
          <Text style={styles.sectionHeader}>{t('aboutApp.legalTitle', 'LEGAL INFORMATION & WEBSITES')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Site Web', 'https://dizzitup.com')}>
              <Ionicons name="globe-outline" size={20} color="#3B82F6" style={styles.linkIcon} />
              <Text style={styles.linkText}>{t('aboutApp.website', 'Official DizzitUp Website (dizzitup.com)')}</Text>
              <Ionicons name="open-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('YouTube', 'https://youtube.com/@dizzitup')}>
              <Ionicons name="logo-youtube" size={20} color="#FF0000" style={styles.linkIcon} />
              <Text style={styles.linkText}>{t('aboutApp.youtubeTeaser', 'Official YouTube Channel & App Teaser')}</Text>
              <Ionicons name="open-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Conditions d\'utilisation', 'dizzitup.com/terms')}>
              <Ionicons name="document-text-outline" size={20} color="#10B981" style={styles.linkIcon} />
              <Text style={styles.linkText}>{t('aboutApp.terms', 'Terms of Service')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Politique de confidentialité', 'dizzitup.com/privacy')}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#8B5CF6" style={styles.linkIcon} />
              <Text style={styles.linkText}>{t('aboutApp.privacy', 'Privacy & Data Policy')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={() => openLink('Licences', 'dizzitup.com/licenses')}>
              <Ionicons name="ribbon-outline" size={20} color="#F59E0B" style={styles.linkIcon} />
              <Text style={styles.linkText}>{t('aboutApp.licenses', 'Licenses & Regulatory Compliance')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Social Networks */}
          <Text style={styles.sectionHeader}>{t('aboutApp.communityTitle', 'JOIN THE COMMUNITY')}</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('X / Twitter', 'x.com/dizzitup')}>
              <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
              <Text style={styles.socialName}>Twitter / X</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('LinkedIn', 'linkedin.com/company/dizzitup')}>
              <Ionicons name="logo-linkedin" size={22} color="#0A66C2" />
              <Text style={styles.socialName}>LinkedIn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('Telegram', 't.me/dizzitup')}>
              <Ionicons name="paper-plane" size={22} color="#229ED9" />
              <Text style={styles.socialName}>Telegram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('YouTube', 'youtube.com/@dizzitup')}>
              <Ionicons name="logo-youtube" size={22} color="#FF0000" />
              <Text style={styles.socialName}>YouTube</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Support Button */}
          <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('ContactUsScreen')}>
            <Ionicons name="headset-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.contactBtnText}>{t('aboutApp.contactSupport', 'Contact Customer Support')}</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" />
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} onClose={() => setToast(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, },
  backButton: { paddingRight: 14, paddingVertical: 4 },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', marginTop: 2 },
  brandCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#F0F2F5', padding: 22, alignItems: 'center', marginBottom: 16 },
  logoImage: { width: 72, height: 72, marginBottom: 12 },
  appName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840' },
  versionText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B7280', marginTop: 2, marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#059669' },
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.8, marginTop: 10, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14 },
  missionText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: '#4B5563' },
  linkRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  linkIcon: { marginRight: 12 },
  linkText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  socialBtn: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F0F2F5', paddingVertical: 12, alignItems: 'center', marginHorizontal: 4 },
  socialName: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#4B5563', marginTop: 4 },
  contactBtn: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 8px #FFC759' },
  contactBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
  featureCategoryTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#1A2840', marginBottom: 8, letterSpacing: 0.5 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4 },
  bulletIcon: { marginRight: 8, marginTop: 2 },
  bulletText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#374151', lineHeight: 18 },

  /* Build Card & Release Notes */
  buildCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  buildMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  buildChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC759', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  buildChipText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#1A2840' },
  versionChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 'auto' },
  versionChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#475569' },
  dateBadge: { flexDirection: 'row', alignItems: 'center' },
  dateBadgeText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#64748B' },
  releaseSection: { marginVertical: 6 },
  releaseSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  releaseSectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#1A2840', letterSpacing: 0.6 },
  releaseItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingLeft: 4 },
  releaseBullet: { fontSize: 14, color: '#94A3B8', marginRight: 8, lineHeight: 18 },
  releaseText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, color: '#334155' },
  releaseBold: { fontFamily: 'Inter_700Bold', color: '#0F172A' },
  releaseDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  warningContainer: { backgroundColor: '#FFFBEB', borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A', padding: 12, marginTop: 6 },
  warningHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  warningTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#B45309', letterSpacing: 0.5 },
  warningText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#92400E', lineHeight: 16 },
});
