import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Share, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { getOperatorLogo } from '../utils/operatorLogos';
import { ALL_COUNTRIES } from '../utils/countriesData';

export default function ShareSuccessCaptionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, user } = useApp();

  const { platform = 'whatsapp', transactionData = {}, cardStyle = ['#20365B', '#111D33'] } = route.params || {};

  const {
    amount = '0.00',
    token = 'USDC',
    actionKey = null,
    actionType = null,
    network = 'Polygon',
    date = '',
    txHash = '',
    senderAvatar = null,
  } = transactionData;

  // Anonymize sender (use actual user data if available)
  const rawSenderName = transactionData.senderName || user?.firstName || user?.name || 'User';
  const displaySenderName = rawSenderName.split(' ')[0];
  const rawSenderCountry = transactionData.senderCountry || user?.country || 'FR';
  const matchedSenderCountry = ALL_COUNTRIES.find(c => c.name.toLowerCase() === rawSenderCountry.toLowerCase() || c.code.toLowerCase() === rawSenderCountry.toLowerCase());
  const senderFlag = transactionData.senderFlag || matchedSenderCountry?.flag || '🇫🇷';

  // Anonymize recipient
  const rawRecipientName = transactionData.recipientName || 'Bénéficiaire';
  const displayRecipientName = rawRecipientName.split(' ')[0];
  const rawRecipientCountry = transactionData.recipientCountry || 'TG';
  const matchedRecipientCountry = ALL_COUNTRIES.find(c => c.name.toLowerCase() === rawRecipientCountry.toLowerCase() || c.code.toLowerCase() === rawRecipientCountry.toLowerCase());
  const recipientFlag = transactionData.recipientFlag || matchedRecipientCountry?.flag || '🇹🇬';


  const resolvedAction = actionKey
    ? t(`shareSuccess.${actionKey}`, actionType || 'transferred')
    : (actionType || t('shareSuccess.actionSent', 'sent funds'));

  const shortTxHash = txHash && txHash.length > 18
    ? `${txHash.slice(0, 7)}...${txHash.slice(-5)}`
    : txHash;

  // Resolve operator logo for recipient (e.g. Mixx by Yas, Moov, MTN, Orange, etc.)
  const opLogo = getOperatorLogo(rawRecipientName)
    || getOperatorLogo(transactionData?.operatorName)
    || getOperatorLogo(transactionData?.providerName)
    || getOperatorLogo(transactionData?.recipient);

  // Format date compactly
  const formatShortDate = (raw) => {
    if (!raw) return '';
    const d = new Date(raw);
    if (!isNaN(d.getTime()) && raw.length > 10 && (raw.includes('T') || raw.includes('-') || raw.includes('/'))) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const mon = months[d.getMonth()];
      const year = d.getFullYear();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${mon} ${year} • ${h}:${m}`;
    }
    return String(raw)
      .replace(/September/i, 'Sep')
      .replace(/October/i, 'Oct')
      .replace(/November/i, 'Nov')
      .replace(/December/i, 'Dec')
      .replace(/January/i, 'Jan')
      .replace(/February/i, 'Feb')
      .replace(/March/i, 'Mar')
      .replace(/April/i, 'Apr')
      .replace(/August/i, 'Aug')
      .replace(/\s+at\s+/i, ' • ')
      .replace(/\s+à\s+/i, ' • ')
      .replace(/\s*-\s*/, ' • ');
  };

  const isWithdraw = actionKey === 'actionWithdrawn' || (actionType && actionType.toLowerCase().includes('cash'));

  // Clean, modern, professional social message (no emoji clutter, clean link)
  const generateDefaultCaption = () => {
    const cleanRecipient = rawRecipientName?.replace(/\s*\(.*?\)/g, '').trim() || rawRecipientName;
    if (isWithdraw) {
      return `Successfully cashed out ${amount} ${token} to ${cleanRecipient} with @DizzitUp. Instant, borderless, and without middlemen.\n\nhttps://dizzitup.com`;
    }
    return `Successfully sent ${amount} ${token} to ${cleanRecipient} with @DizzitUp. Fast, borderless, and secure on Polygon.\n\nhttps://dizzitup.com`;
  };

  const [captionText, setCaptionText] = useState(generateDefaultCaption);
  const [isFocused, setIsFocused] = useState(false);
  const [toast, setToast] = useState(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({
          title: t('shareSuccess.shareModalTitle', 'Partager mon succès DizzitUp'),
          text: captionText,
          url: 'https://dizzitup.com/',
        });
      } else {
        await Share.share({
          title: t('shareSuccess.shareModalTitle', 'Partager mon succès DizzitUp'),
          message: captionText,
          url: 'https://dizzitup.com/',
        });
      }
      setToast({
        title: t('shareSuccess.toastShareSuccessTitle', 'Félicitations !'),
        message: t('shareSuccess.toastShareSuccessMsg', 'Succès partagé ! 1 DZY a été crédité sur votre compte.')
      });
      setTimeout(() => {
        navigation.navigate('RewardsScreen');
      }, 1500);
    } catch (error) {
      setToast({
        title: t('shareSuccess.toastShareTitle', 'Succès partagé'),
        message: t('shareSuccess.toastShareMsg', '1 DZY crédité dans vos Rewards !')
      });
      setTimeout(() => {
        navigation.navigate('RewardsScreen');
      }, 1500);
    }
  };

  const copyCaption = async () => {
    await Clipboard.setStringAsync(captionText);
    setToast({
      title: t('shareSuccess.copiedTitle', 'Message copié !'),
      message: t('shareSuccess.copiedDesc', 'Prêt à être partagé.'),
    });
  };

  const resetCaption = () => {
    setCaptionText(generateDefaultCaption());
    setToast({
      title: t('shareSuccess.resetTitle', 'Message réinitialisé'),
      message: t('shareSuccess.resetDesc', 'Texte original restauré.'),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('HomeScreen');
            }
          }}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t('shareSuccess.writeMessage', 'Your message')}</Text>
            <Text style={styles.headerStepBadge}>{t('shareSuccess.step3of3', 'Step 3 of 3')}</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Compact Stepper Pill */}
          <View style={styles.stepperPillRow}>
            <View style={styles.stepperItemDone}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.stepperTextDone}>{t('shareSuccess.stepNetwork', 'Network')}</Text>
            </View>
            <View style={styles.stepperDivider} />
            <View style={styles.stepperItemDone}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.stepperTextDone}>{t('shareSuccess.stepVisual', 'Visual')}</Text>
            </View>
            <View style={styles.stepperDivider} />
            <View style={styles.stepperItemActive}>
              <Text style={styles.stepperBadgeActive}>3</Text>
              <Text style={styles.stepperTextActive}>{t('shareSuccess.stepMessage', 'Message')}</Text>
            </View>
          </View>

          {/* Sleek Condensed Visual Card Preview */}
          <LinearGradient
            colors={Array.isArray(cardStyle) ? cardStyle : [cardStyle, cardStyle]}
            style={styles.visualCardCompact}
          >
            {/* Top brand & status row */}
            <View style={styles.compactHeaderRow}>
              <View style={styles.compactBrandWrap}>
                <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.compactLogo} />
                <Text style={styles.compactBrandText}>Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
              </View>
              <View style={styles.compactSuccessPill}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={styles.compactSuccessPillText}>{t('shareSuccess.txSuccessShort', 'Success')}</Text>
              </View>
            </View>

            {/* Compact Hero: Amount & Action */}
            <View style={styles.compactHeroRow}>
              <View style={styles.compactHeroLeft}>
                <Text style={styles.compactActionLabel}>{resolvedAction}</Text>
                <Text style={styles.compactAmountText}>
                  {amount} <Text style={{ color: '#FFC759' }}>{token}</Text>
                </Text>
                <Text style={styles.compactViaText}>via <Text style={{ color: '#FFC759', fontWeight: '700' }}>DZYWallet</Text></Text>
              </View>

              {/* Compact Transfer Flow */}
              <View style={styles.compactFlowWrap}>
                {/* Sender */}
                <View style={styles.compactUserItem}>
                  <View style={styles.compactAvatar}>
                    {senderAvatar ? (
                      <Image source={{ uri: senderAvatar }} style={styles.compactAvatarImg} />
                    ) : (
                      <Text style={styles.compactAvatarText}>{displaySenderName?.slice(0, 2).toUpperCase() || 'DZ'}</Text>
                    )}
                  </View>
                  <Text style={styles.compactUserName} numberOfLines={1}>{displaySenderName} {senderFlag}</Text>
                </View>

                <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.7)" style={{ marginHorizontal: 6 }} />

                {/* Recipient */}
                <View style={styles.compactUserItem}>
                  <View style={[styles.compactAvatar, opLogo && { backgroundColor: '#FFFFFF', padding: 2 }]}>
                    {opLogo ? (
                      <Image source={opLogo} style={[styles.compactAvatarImg, { borderRadius: 14 }]} resizeMode="contain" />
                    ) : transactionData?.recipientAvatar ? (
                      <Image source={{ uri: transactionData.recipientAvatar }} style={styles.compactAvatarImg} />
                    ) : (
                      <Text style={styles.compactAvatarText}>{displayRecipientName?.slice(0, 2).toUpperCase() || '?'}</Text>
                    )}
                  </View>
                  <Text style={styles.compactUserName} numberOfLines={1}>{displayRecipientName} {recipientFlag}</Text>
                </View>
              </View>
            </View>

            {/* Bottom Meta Line */}
            <View style={styles.compactMetaStrip}>
              <Text style={styles.compactMetaText} numberOfLines={1}>
                {network} • {formatShortDate(date)} • {shortTxHash}
              </Text>
              <Text style={styles.compactUrlText}>dizzitup.com</Text>
            </View>
          </LinearGradient>

          {/* Section: Your message */}
          <View style={styles.captionBoxContainer}>
            <View style={styles.captionHeaderRow}>
              <View style={styles.captionHeaderLeft}>
                <Ionicons name="chatbubble-ellipses-outline" size={17} color="#20365B" style={{ marginRight: 6 }} />
                <Text style={styles.captionBoxTitle}>{t('shareSuccess.yourMessage', 'Your message')}</Text>
              </View>
              <Text style={[styles.charCounterBadge, captionText.length > 250 && { color: '#E11D48', fontWeight: '700' }]}>
                {captionText.length}/280
              </Text>
            </View>

            <View style={[styles.captionInputCard, isFocused && styles.captionInputCardFocused]}>
              <TextInput
                style={styles.captionTextInput}
                value={captionText}
                onChangeText={setCaptionText}
                multiline={true}
                editable={true}
                maxLength={280}
                placeholder={t('shareSuccess.messagePlaceholder', 'Write a message...')}
                placeholderTextColor="#94A3B8"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              <View style={styles.captionCardFooter}>
                <TouchableOpacity
                  style={styles.actionPillBtn}
                  onPress={resetCaption}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.actionPillText}>{t('shareSuccess.reset', 'Reset')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionPillBtn, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}
                  onPress={copyCaption}
                  activeOpacity={0.7}
                >
                  <Ionicons name="copy-outline" size={13} color="#20365B" style={{ marginRight: 4 }} />
                  <Text style={[styles.actionPillText, { color: '#20365B', fontWeight: '700' }]}>{t('shareSuccess.copy', 'Copy')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Main Action Button */}
          <TouchableOpacity style={styles.btnPrimaryShare} onPress={handleShare} activeOpacity={0.88}>
            <Ionicons name="share-social-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.btnPrimaryShareText}>{t('shareSuccess.shareAndEarn', 'Share and earn 1 DZY')}</Text>
          </TouchableOpacity>

          {/* Security Note at bottom */}
          <View style={styles.bottomSecurityRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.bottomSecurityText}>
              {t('shareSuccess.shareSecurityNote', 'Safe & encrypted. Earn 1 DZY reward upon sharing.')}
            </Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 60, zIndex: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  headerStepBadge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },

  /* Compact Stepper */
  stepperPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignSelf: 'center',
  },
  stepperItemDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperTextDone: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  stepperDivider: {
    width: 14,
    height: 1,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  stepperItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepperBadgeActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFC759',
    color: '#1A2840',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    lineHeight: 16,
  },
  stepperTextActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: '#1A2840',
  },

  /* Condensed Visual Card Preview */
  visualCardCompact: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  compactBrandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  compactBrandText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  compactSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  compactSuccessPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },

  compactHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  compactHeroLeft: {
    flex: 1,
  },
  compactActionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFC759',
    marginBottom: 2,
  },
  compactAmountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  compactViaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 1,
  },

  compactFlowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactUserItem: {
    alignItems: 'center',
    width: 48,
  },
  compactAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 2,
  },
  compactAvatarImg: {
    width: 28,
    height: 28,
  },
  compactAvatarText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  compactUserName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#CBD5E1',
    textAlign: 'center',
  },

  compactMetaStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  compactMetaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#94A3B8',
    flex: 1,
  },
  compactUrlText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9.5,
    color: '#FFC759',
  },

  /* Caption Box */
  captionBoxContainer: {
    marginBottom: 16,
  },
  captionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  captionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionBoxTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  charCounterBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  captionInputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  captionInputCardFocused: {
    borderColor: '#FFC759',
  },
  captionTextInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#1A2840',
    lineHeight: 21,
    minHeight: 85,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  },
  captionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },

  /* Primary Button */
  btnPrimaryShare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    height: 48,
    marginBottom: 12,
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryShareText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },

  /* Bottom Security Row */
  bottomSecurityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSecurityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
});
