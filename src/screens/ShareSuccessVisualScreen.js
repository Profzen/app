import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { getOperatorLogo } from '../utils/operatorLogos';

export default function ShareSuccessVisualScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useApp();

  const { platform = 'whatsapp', transactionData = {} } = route.params || {};

  const {
    amount = '100',
    token = 'USDC',
    // actionKey: translation key like 'actionWithdrawn', 'actionSent', 'actionTopup'
    // Fallback: actionType (legacy raw string)
    actionKey = null,
    actionType = null,
    senderName = 'John Mensah',
    senderCountry = 'Ghana',
    senderFlag = '🇬🇭',
    recipientName = 'Un bénéficiaire',
    recipientCountry = 'Togo',
    recipientFlag = '🇹🇬',
    network = 'Polygon',
    date = '30 Mai 2025 - 09:41',
    txHash = '0x7a3f...e9b2c4d',
    senderAvatar = null,
  } = transactionData;

  // Resolve action label: prefer key-based i18n, fall back to raw string
  const resolvedAction = actionKey
    ? t(`shareSuccess.${actionKey}`, actionType || 'transferred')
    : (actionType || t('shareSuccess.actionSent', 'sent funds'));

  const [toast, setToast] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customStyleIndex, setCustomStyleIndex] = useState(0);

  const cardBackgrounds = [
    ['#20365B', '#111D33'], // DizzitUp Navy
    ['#0F172A', '#020617'], // Deep Slate
    ['#1E1B4B', '#09090B'], // Deep Indigo
  ];

  const toggleModifyVisual = () => {
    setCustomStyleIndex((prev) => (prev + 1) % cardBackgrounds.length);
    setToast({
      title: t('shareSuccess.toastModifiedTitle', 'Visual modified'),
      message: t('shareSuccess.toastModifiedMsg', 'New card style applied!')
    });
  };

  const handleContinue = () => {
    navigation.navigate('ShareSuccessCaptionScreen', {
      platform,
      transactionData,
      cardStyle: cardBackgrounds[customStyleIndex],
    });
  };

  const shortTxHash = txHash && txHash.length > 18
    ? `${txHash.slice(0, 7)}...${txHash.slice(-5)}`
    : txHash;

  // Resolve operator logo for recipient (e.g. Mixx by Yas, Moov, MTN, Orange, etc.)
  const opLogo = getOperatorLogo(recipientName) 
    || getOperatorLogo(transactionData?.operatorName) 
    || getOperatorLogo(transactionData?.providerName) 
    || getOperatorLogo(transactionData?.recipient);

  // Format date compactly across 2 lines so it never truncates in the 3-column metadata row
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
      return `${day} ${mon} ${year}\n${h}:${m}`;
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
      .replace(/\s+at\s+/i, '\n')
      .replace(/\s+à\s+/i, '\n')
      .replace(/\s*-\s*/, '\n');
  };

  // Shared card content renderer to avoid duplication
  const renderCardContent = () => (
    <>
      {/* Top Brand Header */}
      <View style={styles.visualHeaderRow}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/brand/dizzitup_logo_cercle.png')}
            style={styles.logoCircleImage}
          />
          <Text style={styles.brandNameText}>Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
        </View>
        <Text style={styles.hashtagText}>
          #NoBorder<Text style={{ color: '#FFC759' }}>NoMiddleman</Text>
        </Text>
      </View>

      {/* Status Pill */}
      <View style={styles.statusPillWrap}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{t('shareSuccess.txSuccess', 'Successful transaction!')}</Text>
          <View style={styles.checkBadgeGreen}>
            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Headline */}
      <Text style={styles.headlineText}>
        <Text style={styles.goldText}>{resolvedAction}</Text>
      </Text>

      {/* Amount */}
      <Text style={styles.amountLargeText}>
        {amount} <Text style={{ color: '#FFC759' }}>{token}</Text>
      </Text>
      <Text style={styles.amountSubText}>
        via <Text style={{ color: '#FFC759', fontFamily: 'Inter_700Bold' }}>DZYWallet</Text>
      </Text>

      {/* Inset Box */}
      <View style={styles.insetBox}>
        {/* Sender & Recipient */}
        <View style={styles.usersRow}>
          <View style={styles.userCol}>
            <Text style={styles.userLabel}>{t('shareSuccess.from', 'From')}</Text>
            <View style={[styles.userAvatarWrap, styles.userAvatarShielded]}>
              {senderAvatar ? (
                <Image source={{ uri: senderAvatar }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitialsText}>
                  {senderName?.slice(0, 2).toUpperCase() || 'DZ'}
                </Text>
              )}
            </View>
            <Text style={styles.userName} numberOfLines={1}>{senderName}</Text>
            <Text style={styles.userCountry}>{senderCountry} {senderFlag}</Text>
          </View>

          <View style={styles.transferArrowCircle}>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </View>

          <View style={styles.userCol}>
            <Text style={styles.userLabel}>{t('shareSuccess.to', 'To')}</Text>
            <View style={[styles.userAvatarWrap, styles.userAvatarShielded, opLogo && { backgroundColor: '#FFFFFF', padding: 2 }]}>
              {opLogo ? (
                <Image source={opLogo} style={[styles.avatarImg, { borderRadius: 16 }]} resizeMode="contain" />
              ) : transactionData?.recipientAvatar ? (
                <Image source={{ uri: transactionData.recipientAvatar }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitialsText}>
                  {recipientName?.slice(0, 2).toUpperCase() || '?'}
                </Text>
              )}
            </View>
            <Text style={styles.userName} numberOfLines={1}>{recipientName}</Text>
            <Text style={styles.userCountry}>{recipientCountry} {recipientFlag}</Text>
          </View>
        </View>

        <View style={styles.boxDivider} />

        {/* Metadata Grid */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <View style={styles.metaIconRow}>
              <View style={styles.purplePolyBadge}>
                <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>∞</Text>
              </View>
              <Text style={styles.metaLabel}>{t('shareSuccess.network', 'Network')}</Text>
            </View>
            <Text style={styles.metaValue} numberOfLines={1}>{network}</Text>
          </View>

          <View style={styles.metaCol}>
            <View style={styles.metaIconRow}>
              <Ionicons name="calendar-outline" size={12} color="#94A3B8" style={{ marginRight: 3 }} />
              <Text style={styles.metaLabel}>{t('shareSuccess.date', 'Date')}</Text>
            </View>
            <Text style={styles.metaValue} numberOfLines={2}>
              {formatShortDate(date)}
            </Text>
          </View>

          <View style={[styles.metaCol, { flex: 1.2 }]}>
            <View style={styles.metaIconRow}>
              <Ionicons name="pricetag-outline" size={12} color="#94A3B8" style={{ marginRight: 3 }} />
              <Text style={styles.metaLabel} numberOfLines={1}>{t('shareSuccess.txId', 'TX ID')}</Text>
            </View>
            <View style={styles.hashCopyRow}>
              <Text style={[styles.metaValue, { flex: 1, flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">{shortTxHash}</Text>
              <Ionicons name="copy-outline" size={11} color="#94A3B8" style={{ marginLeft: 4, flexShrink: 0 }} />
            </View>
          </View>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerSecurityText}>{t('shareSuccess.securedBlockchain', 'Secured on blockchains,')}</Text>
          <Text style={styles.footerHighlightText}>{t('shareSuccess.noBorder', 'Without borders or middlemen')}</Text>
          <View style={styles.footerDivider} />
          <Text style={styles.wannaText}>{t('shareSuccess.wannaDoSame', 'Wanna do the same?')}</Text>
          <Text style={styles.joinText}>Join Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
          <View style={styles.urlPill}>
            <Ionicons name="globe-outline" size={12} color="#FFC759" style={{ marginRight: 5 }} />
            <Text style={styles.urlPillText}>dizzitup.com</Text>
          </View>
        </View>

        <View style={styles.footerRight}>
          <Image
            source={require('../../assets/brand/dizzitup_logo_cercle.png')}
            style={styles.logoCircleFooter}
          />
          <Text style={styles.footerBrandTitle}>Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
          <Text style={styles.footerBrandTagline}>{t('shareSuccess.sendMoreGetMore', 'Send More, Get More')}</Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1A2840" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t('shareSuccess.visualTitle', 'Visual preview')}</Text>
            <Text style={styles.headerStepBadge}>{t('shareSuccess.visualStepBadge', 'Step 2 of 3')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('shareSuccess.visualSubtitle', "Here is the visual that will be shared. You can edit the text in the next step.")}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Main Visual Card */}
          <LinearGradient
            colors={cardBackgrounds[customStyleIndex]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.visualCard}
          >
            {renderCardContent()}
          </LinearGradient>

          {/* Control Buttons */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={toggleModifyVisual} activeOpacity={0.8}>
              <Text style={styles.controlBtnText}>{t('shareSuccess.modifyVisual', 'Modify visual')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsFullscreen(true)} activeOpacity={0.8}>
              <Text style={styles.controlBtnText}>{t('shareSuccess.fullscreen', 'Fullscreen')}</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Banner */}
          <View style={styles.privacyBanner}>
            <View style={styles.shieldIconCircle}>
              <Ionicons name="shield-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.privacyBannerText}>
              {t('shareSuccess.privacyNote', 'Your personal information is protected. Only country and first name are visible.')}
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnPrimary} onPress={handleContinue} activeOpacity={0.88}>
            <Text style={styles.btnPrimaryText}>{t('shareSuccess.continue', 'Continue')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A2840" style={styles.btnArrowRight} />
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Fullscreen Modal */}
        <Modal visible={isFullscreen} animationType="fade" transparent={true} onRequestClose={() => setIsFullscreen(false)}>
          <View style={styles.modalBg}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsFullscreen(false)}>
              <Ionicons name="close-circle" size={34} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.modalCardContainer}>
              <LinearGradient
                colors={cardBackgrounds[customStyleIndex]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.visualCard, styles.fullscreenVisualCard]}
              >
                {renderCardContent()}
              </LinearGradient>
            </View>
          </View>
        </Modal>

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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
    flexShrink: 0,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 36,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#1A2840',
  },
  headerStepBadge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 15,
  },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 30,
  },

  /* Visual Card */
  visualCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#111D33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  visualHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircleImage: {
    width: 26,
    height: 26,
    marginRight: 6,
  },
  brandNameText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  hashtagText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  statusPillWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    marginRight: 6,
  },
  checkBadgeGreen: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headlineText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  goldText: { color: '#FFC759' },
  amountLargeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  amountSubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 16,
  },

  /* Inset Box */
  insetBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    marginBottom: 16,
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  userCol: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  userLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 5,
  },
  userAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 5,
  },
  userAvatarShielded: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitialsText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#CBD5E1',
  },
  userName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: '90%',
  },
  userCountry: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
  transferArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    flexShrink: 0,
  },
  boxDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },

  /* Metadata */
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaCol: {
    flex: 1,
    overflow: 'hidden',
    paddingRight: 6,
    minWidth: 0,
  },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  purplePolyBadge: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
  },
  metaLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#94A3B8',
  },
  metaValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  hashCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
  },

  /* Card Footer */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  footerLeft: { flex: 1, paddingRight: 8 },
  footerSecurityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#CBD5E1',
  },
  footerHighlightText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFC759',
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 7,
    width: '80%',
  },
  wannaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#CBD5E1',
  },
  joinText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  urlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  urlPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#071D54',
  },
  footerRight: { alignItems: 'center' },
  logoCircleFooter: {
    width: 32,
    height: 32,
    marginBottom: 3,
  },
  footerBrandTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  footerBrandTagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8.5,
    color: '#CBD5E1',
    marginTop: 2,
  },

  /* Controls Row */
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  controlBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 46,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  controlBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    textAlign: 'center',
  },

  /* Privacy Banner */
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
    borderWidth: 1,
    borderColor: '#FEF08A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  shieldIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  privacyBannerText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },

  /* Primary Button */
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    height: 52,
    position: 'relative',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  btnArrowRight: {
    position: 'absolute',
    right: 18,
  },

  /* Modal */
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 54,
    right: 20,
    zIndex: 20,
  },
  modalCardContainer: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  fullscreenVisualCard: {
    width: '98%',
    maxWidth: 420,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
});
