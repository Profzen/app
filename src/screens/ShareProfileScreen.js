import React, { useMemo, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Platform, StatusBar, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';
import ScreenFooter from '../components/ScreenFooter';
import { isSmallScreen } from '../utils/responsive';
import { buildDzyStoreUrl } from '../utils/storeUtils';
import { getFullCountryName, getFlagEmoji } from '../utils/countryCurrencyUtils';

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
  const { user, accountMode, t, language } = useApp();
  const [toast, setToast] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const storyShotRef = useRef(null);
  const squareShotRef = useRef(null);

  const isBusiness = user?.role === 'merchant' || accountMode === 'business';
  const merchant = isBusiness ? (user?.merchantProfile || null) : null;

  const countryRaw = merchant?.country || merchant?.raw?.country || user?.country || '';
  const cityRaw = merchant?.city_village || merchant?.raw?.city_village || merchant?.city || merchant?.raw?.city || user?.city || '';
  const city = cityRaw ? (cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1)) : '';
  const countryName = getFullCountryName(countryRaw, language);
  const flagEmoji = getFlagEmoji(countryRaw);
  const countryPart = countryName ? [countryName, flagEmoji].filter(Boolean).join(' ') : '';
  const locationText = [city, countryPart].filter(Boolean).join(', ');

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

  const shareCaption = useMemo(() => (
    isBusiness ? `${shareText}\n\n@dizzitup` : shareText
  ), [isBusiness, shareText]);

  const qrPayload = isBusiness ? profile.storeUrl : profile.inviteUrl;
  const qr = useMemo(() => {
    return QRCode.create(qrPayload || 'https://dizzitup.com', {
      errorCorrectionLevel: isBusiness ? 'H' : 'M',
    });
  }, [qrPayload, isBusiness]);

  const qrSize = isSmallScreen ? 150 : 180;
  const ProfileQr = ({ size = qrSize } = {}) => {
    const centerLogoSize = Math.round(size * 0.24);
    return (
    <View style={styles.qrInnerWrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${qr.modules.size} ${qr.modules.size}`} accessibilityLabel="QR Code">
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
        <View style={[styles.qrCenterLogo, { width: centerLogoSize, height: centerLogoSize, borderRadius: centerLogoSize * 0.24 }]}>
          <Image
            source={require('../../assets/brand/finalLogo_512x512.png')}
            style={{ width: centerLogoSize * 0.74, height: centerLogoSize * 0.74, borderRadius: centerLogoSize * 0.16 }}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
    );
  };

  const copy = async () => {
    await Clipboard.setStringAsync(shareCaption);
    setToast({
      title: t('common.copied', 'Link copied'),
      message: isBusiness
        ? t('shareProfile.captionCopied', 'Caption copied. Paste it into your post.')
        : t('shareProfile.copied', 'Profile details copied to clipboard.'),
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

  const copyReferralCode = async () => {
    if (!profile.referralCode) return;
    await Clipboard.setStringAsync(profile.referralCode);
    setToast({
      title: t('dizzyFamily.code_copied', 'Code copied'),
      message: t('dizzyFamily.code_copied_msg', 'The referral code has been copied.'),
      type: 'success',
    });
  };

  const handleShare = async () => {
    if (!isBusiness) {
      await Share.share({ title: profile.name, message: shareCaption });
      return;
    }

    setIsSharing(true);
    try {
      const imageUri = await squareShotRef.current?.capture();
      if (!imageUri) throw new Error('Business profile image capture is unavailable.');

      if (Platform.OS === 'web') {
        const imageBlob = await (await fetch(imageUri)).blob();
        const imageFile = new File([imageBlob], 'dizzitup-business-profile.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
          await navigator.share({ files: [imageFile], title: profile.name, text: shareCaption });
        } else if (navigator.share) {
          await navigator.share({ title: profile.name, text: shareCaption, url: profile.storeUrl });
        } else {
          await Share.share({ title: profile.name, message: shareCaption });
        }
        return;
      }

      try {
        const shareModule = await import('react-native-share');
        const nativeShare = shareModule.default || shareModule;
        const result = await nativeShare.open({
          url: imageUri,
          type: 'image/png',
          filename: 'dizzitup-business-profile.png',
          title: profile.name,
          message: shareCaption,
          failOnCancel: false,
        });
        if (result?.dismissedAction) return;
      } catch (nativeShareError) {
        if (nativeShareError?.message?.toLowerCase?.().includes('cancel')) return;
        console.warn('[ShareProfile] Native share sheet unavailable, using Expo Sharing:', nativeShareError);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/png',
            dialogTitle: t('shareProfile.title', 'Share my DizzitUp profile'),
          });
        } else {
          await Share.share({ title: profile.name, message: shareCaption });
        }
      }
    } catch (err) {
      console.warn('[ShareProfile] Business profile sharing failed:', err);
      setToast({
        title: t('errors.error', 'Error'),
        message: t('shareProfile.shareFailed', 'Could not open sharing. Copy the caption or save an image and try again.'),
        type: 'error',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const saveImageForPosting = async (format) => {
    const shotRef = format === 'story' ? storyShotRef : squareShotRef;
    const fileName = `dizzitup-business-profile-${format}.png`;
    try {
      const imageUri = await shotRef.current?.capture();
      if (!imageUri) throw new Error('Business profile image capture is unavailable.');

      if (Platform.OS === 'web') {
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUri;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        const permission = await MediaLibrary.requestPermissionsAsync(true, []);
        if (permission.status !== 'granted') {
          setToast({
            title: t('shareProfile.permissionTitle', 'Photo permission needed'),
            message: t('shareProfile.permissionMessage', 'Allow photo access to save this image to your gallery.'),
            type: 'error',
          });
          return;
        }
        await MediaLibrary.Asset.create(imageUri);
      }

      setToast({
        title: t('shareProfile.imageSavedTitle', 'Image saved'),
        message: format === 'story'
          ? t('shareProfile.storySaved', 'Story image saved to your gallery.')
          : t('shareProfile.squareSaved', 'Square image saved to your gallery.'),
        type: 'success',
      });
    } catch (err) {
      console.warn('[ShareProfile] Saving profile image failed:', err);
      setToast({
        title: t('errors.error', 'Error'),
        message: t('shareProfile.saveFailed', 'Could not save the image. Please try again.'),
        type: 'error',
      });
    }
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} maxFontSizeMultiplier={1.3}>{t('shareProfile.title', 'Share my DizzitUp profile')}</Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={1.3}>{t('shareProfile.subtitle', 'Help people identify you before they pay or send funds.')}</Text>
            </View>
          </View>
          <View style={styles.card}>
            {renderAvatar()}
            <Text style={styles.name} maxFontSizeMultiplier={1.3}>{profile.name}</Text>
            {!isBusiness && !!profile.identifier && (
              <Text style={styles.identifier} maxFontSizeMultiplier={1.3}>{profile.identifier}</Text>
            )}
            <View style={styles.qr}><ProfileQr /></View>
            <Text style={styles.hint} maxFontSizeMultiplier={1.3}>
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
                <Text style={styles.storeUrlText} numberOfLines={1} ellipsizeMode="middle" maxFontSizeMultiplier={1.3}>
                  {profile.storeUrl}
                </Text>
                <Ionicons name="copy-outline" size={13} color="#64748B" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            ) : null}
            {isBusiness ? (
              !!profile.referralCode && (
                <View style={styles.refContainer}>
                  <Text style={styles.refLabel} maxFontSizeMultiplier={1.3}>{t('shareProfile.referralCodeLabel', 'Referral code')}</Text>
                  <TouchableOpacity
                    style={styles.refRow}
                    onPress={copyReferralCode}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={profile.referralCode}
                  >
                    <Text style={styles.refText} maxFontSizeMultiplier={1.3}>{profile.referralCode}</Text>
                    <Ionicons name="copy-outline" size={12} color="#A16207" style={{ marginLeft: 5 }} />
                  </TouchableOpacity>
                </View>
              )
            ) : (
              !!profile.referralCode && <Text style={styles.ref} maxFontSizeMultiplier={1.3}>{profile.referralCode}</Text>
            )}
            {isBusiness && (
              <TouchableOpacity
                style={styles.payLinkButton}
                onPress={() => navigation.navigate('InvoicePayLinkScreen')}
                activeOpacity={0.8}
              >
                <Ionicons name="link-outline" size={17} color="#1A2840" />
                <Text style={styles.payLinkButtonText} maxFontSizeMultiplier={1.3}>
                  {t('shareProfile.createPayLink', 'Create a pay link')}
                </Text>
              </TouchableOpacity>
            )}
            {isBusiness && (
              <View style={styles.saveForPostingRow}>
                <TouchableOpacity
                  style={styles.saveForPostingButton}
                  onPress={() => saveImageForPosting('story')}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={t('shareProfile.saveStory', 'Save Story image')}
                >
                  <Ionicons name="download-outline" size={16} color="#1A2840" />
                  <Text style={styles.saveForPostingText} maxFontSizeMultiplier={1.2}>
                    {t('shareProfile.saveStory', 'Save Story image')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveForPostingButton}
                  onPress={() => saveImageForPosting('square')}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={t('shareProfile.saveSquare', 'Save square image')}
                >
                  <Ionicons name="download-outline" size={16} color="#1A2840" />
                  <Text style={styles.saveForPostingText} maxFontSizeMultiplier={1.2}>
                    {t('shareProfile.saveSquare', 'Save square image')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <ScreenFooter
          backgroundColor="#F8FAFC"
          borderTop={true}
          borderTopColor="#E8EDF4"
          paddingHorizontal={16}
          paddingTop={8}
          minBottomInset={Platform.OS === 'android' ? 14 : 8}
        >
          <TouchableOpacity
            style={[styles.primary, isSharing && { opacity: 0.7 }]}
            onPress={handleShare}
            disabled={isSharing}
            activeOpacity={0.85}
          >
            {isSharing ? (
              <ActivityIndicator color="#1A2840" size="small" />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={20} color="#1A2840" />
                <Text style={styles.primaryText} maxFontSizeMultiplier={1.3}>{t('shareProfile.share', 'Share profile')}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={copy} activeOpacity={0.75}>
            <Ionicons name="copy-outline" size={19} color="#1A2840" />
            <Text style={styles.secondaryText} maxFontSizeMultiplier={1.3}>
              {isBusiness
                ? t('shareProfile.copyCaption', 'Copy caption')
                : t('shareProfile.copy', 'Copy profile details')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.privacy} maxFontSizeMultiplier={1.3}>
            {t('shareProfile.privacy', 'Only share this profile with people you trust. Never share your PIN or recovery information.')}
          </Text>
        </ScreenFooter>
      </View>
      {isBusiness && (
        <View pointerEvents="none" style={styles.offscreenShotWrapper}>
          {[
            { format: 'story', ref: storyShotRef },
            { format: 'square', ref: squareShotRef },
          ].map(({ format, ref }) => {
            const isStory = format === 'story';
            const outputHeight = isStory ? 1920 : 1080;
            const qrArtSize = isStory ? 210 : 132;
            return (
              <ViewShot
                key={format}
                ref={ref}
                options={{ format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: outputHeight }}
                style={isStory ? styles.offscreenStoryShot : styles.offscreenSquareShot}
                collapsable={false}
              >
                <LinearGradient
                  colors={['#20365B', '#111D33']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.shareImageCard, isStory ? styles.shareImageStory : styles.shareImageSquare]}
                  collapsable={false}
                >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardBrandRow}>
                  <Image
                    source={require('../../assets/brand/dizzitup_logo_cercle.png')}
                    style={styles.cardBrandLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardBrandText}>
                    Dizzit<Text style={{ color: '#FFC759' }}>Up</Text>
                  </Text>
                </View>
                <Text style={styles.cardHashtag}>
                  #NoBorder<Text style={{ color: '#FFC759' }}>NoMiddleman</Text>
                </Text>
              </View>

              <Text style={[styles.cardBusinessName, !isStory && styles.cardBusinessNameSquare]} numberOfLines={2}>
                {profile.name}
              </Text>

              {!!locationText && (
                <Text style={[styles.cardLocationText, !isStory && styles.cardLocationTextSquare]} numberOfLines={1}>
                  {locationText}
                </Text>
              )}

              <View style={[styles.cardQrContainer, !isStory && styles.cardQrContainerSquare]}>
                <ProfileQr size={qrArtSize} />
              </View>

              <Text style={[styles.cardScanHint, !isStory && styles.cardScanHintSquare]} numberOfLines={1}>
                {t('shareProfile.scanHintBusiness', 'Scan to open my DZYstore')}
              </Text>

              {!!profile.referralCode && (
                <View style={[styles.cardReferralContainer, !isStory && styles.cardReferralContainerSquare]}>
                  <Text style={[styles.cardReferralLabel, !isStory && styles.cardReferralLabelSquare]}>
                    {t('shareProfile.referralCodeLabel', 'Referral code')}
                  </Text>
                  <Text style={[styles.cardReferralCode, !isStory && styles.cardReferralCodeSquare]}>
                    {profile.referralCode}
                  </Text>
                </View>
              )}

              <View style={[styles.cardFooterRow, !isStory && styles.cardFooterRowSquare]}>
                <Image
                  source={require('../../assets/brand/dizzitup_logo_cercle.png')}
                  style={styles.cardFooterLogo}
                  resizeMode="contain"
                />
                <Text style={styles.cardFooterBrand}>
                  Dizzit<Text style={{ color: '#FFC759' }}>Up</Text>
                  {' • '}
                  <Text style={styles.cardFooterUrl}>dizzitup.com</Text>
                </Text>
              </View>
                </LinearGradient>
              </ViewShot>
            );
          })}
        </View>
      )}
      <AppToast visible={!!toast} title={toast?.title} message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 36) : 0 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: isSmallScreen ? 14 : 18, paddingTop: 10, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: isSmallScreen ? 12 : 18 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: isSmallScreen ? 20 : 22, color: '#1A2840' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, color: '#64748B', marginTop: 3 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: isSmallScreen ? 14 : 18, alignItems: 'center', borderWidth: 1, borderColor: '#E8EDF4', marginBottom: 10 },
  avatarTile: { width: isSmallScreen ? 52 : 60, height: isSmallScreen ? 52 : 60, borderRadius: 16, backgroundColor: '#071D54', borderWidth: 1.5, borderColor: '#FFC759', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: isSmallScreen ? 20 : 22, color: '#FFC759', letterSpacing: 0.5 },
  avatarInitialsVerified: { fontSize: 18, lineHeight: 22 },
  verifiedBadge: { marginTop: 2, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, backgroundColor: 'rgba(255, 199, 89, 0.18)' },
  verifiedText: { fontFamily: 'Inter_700Bold', fontSize: 7.5, color: '#FFC759', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: isSmallScreen ? 18 : 20, color: '#1A2840', marginTop: isSmallScreen ? 8 : 10, textAlign: 'center' },
  identifier: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B', marginTop: 3 },
  qr: { padding: isSmallScreen ? 8 : 12, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginTop: isSmallScreen ? 10 : 14 },
  qrInnerWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  qrCenterLogo: { position: 'absolute', width: 38, height: 38, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2 },
  qrLogoImg: { width: 28, height: 28, borderRadius: 6 },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, color: '#64748B', textAlign: 'center', marginTop: 8 },
  storeUrlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#F1F5F9', borderRadius: 8, maxWidth: '90%' },
  storeUrlText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#3B82F6', textDecorationLine: 'underline' },
  refContainer: { marginTop: 8, alignItems: 'center' },
  refLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#64748B', marginBottom: 2 },
  ref: { marginTop: 2, backgroundColor: '#FFF7E1', color: '#A16207', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontFamily: 'Inter_700Bold', fontSize: 12 },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  refText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#A16207',
  },
  primary: { height: 48, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840' },
  secondary: { height: 44, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDE4EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  secondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  saveForPostingRow: { flexDirection: 'row', width: '100%', gap: 8, marginTop: 10 },
  saveForPostingButton: { flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: '#FFF8E8', borderWidth: 1, borderColor: '#F3D58C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 6 },
  saveForPostingText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#1A2840', textAlign: 'center' },
  privacy: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 14, color: '#94A3B8', textAlign: 'center', marginTop: 8, paddingHorizontal: 8 },
  payLinkButton: { height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#DDE4EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, paddingHorizontal: 14, width: '100%' },
  payLinkButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840' },
  offscreenShotWrapper: {
    position: 'absolute',
    left: -2000,
    top: 0,
    width: 360,
  },
  offscreenStoryShot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 360,
    height: 640,
  },
  offscreenSquareShot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 360,
    height: 360,
  },
  shareImageCard: {
    width: '100%',
    alignItems: 'center',
  },
  shareImageStory: { height: 640, borderRadius: 24, padding: 26, justifyContent: 'space-between' },
  shareImageSquare: { height: 360, borderRadius: 22, padding: 16, justifyContent: 'space-between' },
  cardHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBrandLogo: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  cardBrandText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  cardHashtag: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  cardBusinessName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 19,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
    width: '100%',
  },
  cardBusinessNameSquare: { fontSize: 16, lineHeight: 20, marginBottom: 0 },
  cardLocationText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFC759',
    textAlign: 'center',
    marginBottom: 10,
    width: '100%',
  },
  cardLocationTextSquare: { fontSize: 10, lineHeight: 13, marginBottom: 0 },
  cardQrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardQrContainerSquare: { padding: 6, borderRadius: 12 },
  cardScanHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
  },
  cardScanHintSquare: { fontSize: 9, marginTop: 0 },
  cardReferralContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 199, 89, 0.14)',
  },
  cardReferralContainerSquare: { marginTop: 0, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  cardReferralLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#E2E8F0',
  },
  cardReferralLabelSquare: { fontSize: 8 },
  cardReferralCode: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFC759',
    marginTop: 1,
  },
  cardReferralCodeSquare: { fontSize: 10 },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cardFooterRowSquare: { marginTop: 0 },
  cardFooterLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  cardFooterBrand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  cardFooterUrl: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
});
