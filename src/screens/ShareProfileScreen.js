import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';

export default function ShareProfileScreen() {
  const navigation = useNavigation();
  const { user, t } = useApp();
  const [toast, setToast] = useState(null);
  const profile = useMemo(() => {
    const merchant = user?.role === 'merchant' ? user?.merchantProfile : null;
    const name = merchant?.shop_name || user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'DizzitUp member';
    const phone = user?.mobile_number || user?.phone || '';
    const referralCode = user?.referralCode || user?.referral_code || (user?.id ? `DZY-${user.id.slice(0, 6).toUpperCase()}` : '');
    const inviteUrl = referralCode ? `https://dizzitup.com/invite?ref=${encodeURIComponent(referralCode)}` : 'https://dizzitup.com';
    return { name, referralCode, inviteUrl, identifier: phone || user?.email || merchant?.shop_unique_id || '' };
  }, [user]);
  const shareText = t('shareProfile.message', 'Here is my DizzitUp profile. Use it to identify me safely before sending money, paying a bill or buying goods: {{name}} — {{identifier}} — {{url}}', { name: profile.name, identifier: profile.identifier, url: profile.inviteUrl });
  const qr = useMemo(() => QRCode.create(profile.inviteUrl, { errorCorrectionLevel: 'M' }), [profile.inviteUrl]);
  const ProfileQr = () => (
    <Svg width={190} height={190} viewBox={`0 0 ${qr.modules.size} ${qr.modules.size}`} accessibilityLabel="QR Code">
      <Rect width={qr.modules.size} height={qr.modules.size} fill="#FFFFFF" />
      {Array.from(qr.modules.data).map((cell, index) => cell ? <Rect key={index} x={index % qr.modules.size} y={Math.floor(index / qr.modules.size)} width="1" height="1" fill="#071D54" /> : null)}
    </Svg>
  );
  const copy = async () => {
    await Clipboard.setStringAsync(shareText);
    setToast({ title: t('common.copied', "Link copied"), message: t('shareProfile.copied', 'Profile details copied to clipboard.'), type: 'success' });
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color="#1A2840" /></TouchableOpacity>
          <View style={{ flex: 1 }}><Text style={styles.title}>{t('shareProfile.title', 'Share my DizzitUp profile')}</Text><Text style={styles.subtitle}>{t('shareProfile.subtitle', 'Help people identify you before they pay or send funds.')}</Text></View>
        </View>
        <View style={styles.card}>
          <View style={styles.logo}><Text style={styles.logoText}>D</Text></View>
          <Text style={styles.name}>{profile.name}</Text>
          {!!profile.identifier && <Text style={styles.identifier}>{profile.identifier}</Text>}
          <View style={styles.qr}><ProfileQr /></View>
          <Text style={styles.hint}>{t('shareProfile.scanHint', 'Scan to open the verified DizzitUp invitation link.')}</Text>
          {!!profile.referralCode && <Text style={styles.ref}>{profile.referralCode}</Text>}
        </View>
        <TouchableOpacity style={styles.primary} onPress={() => Share.share({ title: t('shareProfile.title', 'Share my DizzitUp profile'), message: shareText })}><Ionicons name="share-social-outline" size={20} color="#1A2840" /><Text style={styles.primaryText}>{t('shareProfile.share', 'Share profile')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={copy}><Ionicons name="copy-outline" size={19} color="#1A2840" /><Text style={styles.secondaryText}>{t('shareProfile.copy', 'Copy profile details')}</Text></TouchableOpacity>
        <Text style={styles.privacy}>{t('shareProfile.privacy', 'Only share this profile with people you trust. Never share your PIN or recovery information.')}</Text>
      </View>
      <AppToast visible={!!toast} title={toast?.title} message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 36) : 0 }, container: { flex: 1, padding: 20 }, header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 }, backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' }, subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#64748B', marginTop: 4 }, card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E8EDF4', marginBottom: 18 }, logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#071D54', borderWidth: 3, borderColor: '#FFC759', alignItems: 'center', justifyContent: 'center' }, logoText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 30, color: '#FFC759' }, name: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 21, color: '#1A2840', marginTop: 12, textAlign: 'center' }, identifier: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748B', marginTop: 4 }, qr: { padding: 14, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 }, hint: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: '#64748B', textAlign: 'center', marginTop: 12 }, ref: { marginTop: 10, backgroundColor: '#FFF7E1', color: '#A16207', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, fontFamily: 'Inter_700Bold' }, primary: { height: 54, borderRadius: 15, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, primaryText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' }, secondary: { height: 50, borderRadius: 15, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDE4EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }, secondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' }, privacy: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#94A3B8', textAlign: 'center', marginTop: 14, paddingHorizontal: 12 },
});
