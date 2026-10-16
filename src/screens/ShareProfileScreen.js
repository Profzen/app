import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';
import { buildDzyStoreUrl } from '../utils/storeUtils';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ShareProfileScreen() {
  const navigation = useNavigation();
  const { user, accountMode, t } = useApp();
  const [toast, setToast] = useState(null);
  const [imageError, setImageError] = useState(false);

  const isBusiness = user?.role === 'merchant' || accountMode === 'business';
  const merchant = isBusiness ? (user?.merchantProfile || null) : null;

  const profile = useMemo(() => {
    const isVerified = Boolean(merchant?.is_verified || merchant?.verified);
    const shopName = merchant?.shop_name || '';
    const personalName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'DizzitUp member';
    const name = isBusiness ? (shopName || personalName) : personalName;

    const phone = user?.mobile_number || user?.phone || '';
    const referralCode = user?.referralCode || user?.referral_code || (user?.id ? `DZY-${user.id.slice(0, 6).toUpperCase()}` : '');
    const inviteUrl = referralCode ? `https://dizzitup.com/invite?ref=${encodeURIComponent(referralCode)}` : 'https://dizzitup.com';

    const storeUrl = isBusiness ? buildDzyStoreUrl(merchant) : '';
    const logoUrl = isBusiness
      ? (merchant?.shop_logo_url || null)
      : (user?.avatar_url || user?.avatar?.uri || null);

    const initials = isBusiness
      ? (getInitials(shopName) || getInitials(personalName) || 'DZ')
      : (getInitials(personalName) || 'DU');

    return {
      name,
      phone,
      referralCode,
      inviteUrl,
      storeUrl,
      logoUrl,
      initials,
      isVerified,
      identifier: phone || user?.email || merchant?.shop_unique_id || '',
    };
  }, [user, accountMode, isBusiness, merchant]);

  const shareText = useMemo(() => {
    if (isBusiness) {
      return t(
        'shareProfile.messageBusiness',
        'Here is the DizzitUp profile of my business, {{shopName}}. Use it to identify me safely before sending money, paying a bill or buying from me.\nDZYstore: {{storeUrl}}\nReferral code: {{referralCode}}',
        {
          shopName: profile.name,
          storeUrl: profile.storeUrl,
          referralCode: profile.referralCode,
        }
      );
    }
    return t(
      'shareProfile.message',
      'Here is my DizzitUp profile. Use it to identify me safely before sending money, paying a bill or buying goods: {{name}} — {{identifier}} — {{url}}',
      {
        name: profile.name,
        identifier: profile.identifier,
        url: profile.inviteUrl,
      }
    );
  }, [isBusiness, profile, t]);

  const qrPayload = isBusiness ? profile.storeUrl : profile.inviteUrl;
  const qr = useMemo(() => {
    return QRCode.create(qrPayload || 'https://dizzitup.com', {
      errorCorrectionLevel: isBusiness ? 'H' : 'M',
    });
  }, [qrPayload, isBusiness]);

  const ProfileQr = () => (
    <View style={styles.qrInnerWrapper}>
      <Svg width={190} height={190} viewBox={`0 0 ${qr.modules.size} ${qr.modules.size}`} accessibilityLabel="QR Code">
        <Rect width={qr.modules.size} height={qr.modules.size} fill="#FFFFFF" />
        {Array.from(qr.modules.data).map((cell, index) =>
          cell ? (
            <Rect
              key={index}
              x={index % qr.modules.size}
              y={Math.floor(index / qr.modules.size)}
              width="1"
              height="1"
              fill="#071D54"
            />
          ) : null
        )}
      </Svg>
      {isBusiness && (
        <View style={styles.qrCenterLogo}>
          <Image
            source={require('../../assets/brand/finalLogo_512x512.png')}
            style={styles.qrLogoImg}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );

  const copy = async () => {
    await Clipboard.setStringAsync(shareText);
    setToast({
      title: t('common.copied', 'Link copied'),
      message: t('shareProfile.copied', 'Profile details copied to clipboard.'),
      type: 'success',
    });
  };

  const copyStoreUrl = async () => {
    if (!profile.storeUrl) return;
    await Clipboard.setStringAsync(profile.storeUrl);
    setToast({
      title: t('common.copied', 'Link copied'),
      message: t('store.linkCopied', 'Store link copied to clipboard!'),
      type: 'success',
    });
  };

  const renderAvatar = () => {
    const hasImage = Boolean(profile.logoUrl) && !imageError;
    if (hasImage) {
      return (
        <View style={styles.avatarTile}>
          <Image
            source={{ uri: profile.logoUrl }}
            style={styles.avatarImage}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View style={styles.avatarTile}>
        <Text style={[styles.avatarInitials, isBusiness && profile.isVerified && styles.avatarInitialsVerified]}>
          {profile.initials}
        </Text>
        {isBusiness && profile.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>{t('shareProfile.verified', 'VERIFIED')}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('shareProfile.title', 'Share my DizzitUp profile')}</Text>
            <Text style={styles.subtitle}>{t('shareProfile.subtitle', 'Help people identify you before they pay or send funds.')}</Text>
          </View>
        </View>
        <View style={styles.card}>
          {renderAvatar()}
          <Text style={styles.name}>{profile.name}</Text>
          {!isBusiness && !!profile.identifier && (
            <Text style={styles.identifier}>{profile.identifier}</Text>
          )}
          <View style={styles.qr}><ProfileQr /></View>
          <Text style={styles.hint}>
            {isBusiness
              ? t('shareProfile.scanHintBusiness', 'Scan to open my DZYstore')
              : t('shareProfile.scanHint', 'Scan to open the verified DizzitUp invitation link.')}
          </Text>
          {isBusiness ? (
            <TouchableOpacity
              style={styles.storeUrlRow}
              onPress={copyStoreUrl}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={profile.storeUrl}
            >
              <Text style={styles.storeUrlText} numberOfLines={1} ellipsizeMode="middle">
                {profile.storeUrl}
              </Text>
              <Ionicons name="copy-outline" size={13} color="#64748B" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          ) : null}
          {isBusiness ? (
            !!profile.referralCode && (
              <View style={styles.refContainer}>
                <Text style={styles.refLabel}>{t('shareProfile.referralCodeLabel', 'Referral code')}</Text>
                <Text style={styles.ref}>{profile.referralCode}</Text>
              </View>
            )
          ) : (
            !!profile.referralCode && <Text style={styles.ref}>{profile.referralCode}</Text>
          )}
          {isBusiness && (
            <TouchableOpacity
              style={styles.payLinkButton}
              onPress={() => navigation.navigate('InvoicePayLinkScreen')}
              activeOpacity={0.8}
            >
              <Ionicons name="link-outline" size={17} color="#1A2840" />
              <Text style={styles.payLinkButtonText}>
                {t('shareProfile.createPayLink', 'Create a pay link')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.primary}
          onPress={() => Share.share({ title: profile.name, message: shareText })}
        >
          <Ionicons name="share-social-outline" size={20} color="#1A2840" />
          <Text style={styles.primaryText}>{t('shareProfile.share', 'Share profile')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={copy}>
          <Ionicons name="copy-outline" size={19} color="#1A2840" />
          <Text style={styles.secondaryText}>{t('shareProfile.copy', 'Copy profile details')}</Text>
        </TouchableOpacity>
        <Text style={styles.privacy}>
          {t('shareProfile.privacy', 'Only share this profile with people you trust. Never share your PIN or recovery information.')}
        </Text>
      </View>
      <AppToast visible={!!toast} title={toast?.title} message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 36) : 0 },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#64748B', marginTop: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E8EDF4', marginBottom: 18 },
  avatarTile: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#071D54', borderWidth: 1.5, borderColor: '#FFC759', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#FFC759', letterSpacing: 0.5 },
  avatarInitialsVerified: { fontSize: 20, lineHeight: 24 },
  verifiedBadge: { marginTop: 2, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, backgroundColor: 'rgba(255, 199, 89, 0.18)' },
  verifiedText: { fontFamily: 'Inter_700Bold', fontSize: 7.5, color: '#FFC759', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 21, color: '#1A2840', marginTop: 12, textAlign: 'center' },
  identifier: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748B', marginTop: 4 },
  qr: { padding: 14, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  qrInnerWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  qrCenterLogo: { position: 'absolute', width: 42, height: 42, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2 },
  qrLogoImg: { width: 32, height: 32, borderRadius: 6 },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: '#64748B', textAlign: 'center', marginTop: 12 },
  storeUrlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#F1F5F9', borderRadius: 8, maxWidth: '90%' },
  storeUrlText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#3B82F6', textDecorationLine: 'underline' },
  refContainer: { marginTop: 12, alignItems: 'center' },
  refLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#64748B', marginBottom: 4 },
  ref: { marginTop: 4, backgroundColor: '#FFF7E1', color: '#A16207', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, fontFamily: 'Inter_700Bold' },
  primary: { height: 54, borderRadius: 15, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
  secondary: { height: 50, borderRadius: 15, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDE4EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  secondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  privacy: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: '#94A3B8', textAlign: 'center', marginTop: 14, paddingHorizontal: 12 },
  payLinkButton: { height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#DDE4EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingHorizontal: 16, width: '100%' },
  payLinkButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
});
