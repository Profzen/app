import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  Linking,
  Share,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { smsService } from '../services/smsService';
import { useApp } from '../context/AppContext';

export default function SocialShareModal({
  visible,
  onClose,
  title,
  subtitle,
  shareUrl = '',
  shareMessage = '',
  recipientPhone = '',
  onShareComplete,
}) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);
  const [showTwilioInput, setShowTwilioInput] = useState(false);
  const [targetPhone, setTargetPhone] = useState(recipientPhone || '');
  const [sendingSms, setSendingSms] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  const displayTitle = title || t('share.title', 'Share via');
  const displaySubtitle = subtitle || t('share.subtitle', 'Choose an application to send your message directly');
  const defaultBaseMsg = t('share.defaultMessage', 'Check this out on DizzitUp!');
  const effectiveMessage = shareMessage || defaultBaseMsg;
  const fullText = shareUrl ? `${effectiveMessage}\n\n${shareUrl}` : effectiveMessage;
  const encodedText = encodeURIComponent(fullText);
  const encodedUrl = encodeURIComponent(shareUrl || '');

  const showToastMsg = (msg) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    showToastMsg(t('common.copied', 'Copied to clipboard!'));
    setTimeout(() => setCopied(false), 2000);
    onShareComplete?.('copy');
  };

  const openAppOrWeb = async (appUrl, webFallback, channelName) => {
    try {
      const canOpen = await Linking.canOpenURL(appUrl).catch(() => false);
      if (canOpen) {
        await Linking.openURL(appUrl);
        onShareComplete?.(channelName);
        return;
      }
      if (webFallback) {
        const canWeb = await Linking.canOpenURL(webFallback).catch(() => false);
        if (canWeb) {
          await Linking.openURL(webFallback);
          onShareComplete?.(channelName);
          return;
        }
      }
      // Fallback to native system share
      await Share.share({ message: fullText, url: shareUrl, title });
      onShareComplete?.(channelName);
    } catch (err) {
      console.warn(`[SocialShare] Error opening ${channelName}:`, err);
      await Share.share({ message: fullText, url: shareUrl, title }).catch(() => {});
    }
  };

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: async () => {
        const appUrl = `whatsapp://send?text=${encodedText}`;
        const webUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        await openAppOrWeb(appUrl, webUrl, 'whatsapp');
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: 'paper-plane',
      color: '#229ED9',
      action: async () => {
        const appUrl = `tg://msg_url?url=${encodedUrl}&text=${encodedText}`;
        const webUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        await openAppOrWeb(appUrl, webUrl, 'telegram');
      },
    },
    {
      id: 'messenger',
      name: 'Messenger',
      icon: 'chatbubble-ellipses',
      color: '#0084FF',
      action: async () => {
        const appUrl = `fb-messenger://share?link=${encodedUrl}`;
        const webUrl = `https://www.messenger.com/`;
        await openAppOrWeb(appUrl, webUrl, 'messenger');
      },
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: 'chatbox-ellipses',
      color: '#10B981',
      action: async () => {
        if (targetPhone) {
          setShowTwilioInput(true);
        } else {
          // Open native SMS app directly
          await smsService.openDeviceSms(targetPhone, fullText);
          onShareComplete?.('sms');
        }
      },
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      action: async () => {
        await Clipboard.setStringAsync(fullText);
        showToastMsg(t('share.copiedForInstagram', 'Text copied! Opening Instagram...'));
        const appUrl = 'instagram://';
        const webUrl = 'https://www.instagram.com/';
        await openAppOrWeb(appUrl, webUrl, 'instagram');
      },
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'logo-tiktok',
      color: '#000000',
      action: async () => {
        await Clipboard.setStringAsync(fullText);
        showToastMsg(t('share.copiedForTikTok', 'Link copied! Opening TikTok...'));
        const appUrl = 'tiktok://';
        const webUrl = 'https://www.tiktok.com/';
        await openAppOrWeb(appUrl, webUrl, 'tiktok');
      },
    },
    {
      id: 'email',
      name: 'E-mail',
      icon: 'mail',
      color: '#EA4335',
      action: async () => {
        const mailUrl = `mailto:?subject=${encodeURIComponent(displayTitle)}&body=${encodedText}`;
        await Linking.openURL(mailUrl).catch(async () => {
          await Share.share({ message: fullText, title: displayTitle });
        });
        onShareComplete?.('email');
      },
    },
    {
      id: 'more',
      name: t('share.more', 'More...'),
      icon: 'share-social',
      color: '#475569',
      action: async () => {
        try {
          await Share.share({
            message: fullText,
            url: shareUrl,
            title: displayTitle,
          });
          onShareComplete?.('native_more');
        } catch {
          // ignore
        }
      },
    },
  ];

  const handleSendTwilioSms = async () => {
    if (!targetPhone) {
      showToastMsg(t('share.enterPhone', 'Please enter a phone number'));
      return;
    }
    setSendingSms(true);
    try {
      await smsService.sendTwilioSms(targetPhone, fullText);
      showToastMsg(t('share.smsSent', 'SMS sent successfully!'));
      setShowTwilioInput(false);
      onShareComplete?.('sms');
    } catch (err) {
      // Fallback directly to native SMS
      await smsService.openDeviceSms(targetPhone, fullText);
      setShowTwilioInput(false);
      onShareComplete?.('device_sms');
    } finally {
      setSendingSms(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Sheet Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{displayTitle}</Text>
              <Text style={styles.subtitle}>{displaySubtitle}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Feedback banner */}
          {!!statusFeedback && (
            <View style={styles.feedbackBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.feedbackText}>{statusFeedback}</Text>
            </View>
          )}

          {/* Message Preview Card with Copy Button */}
          <View style={styles.previewCard}>
            <Text style={styles.previewText} numberOfLines={3}>
              {fullText}
            </Text>
            <TouchableOpacity style={styles.copyPill} onPress={handleCopyLink} activeOpacity={0.8}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color="#071D54" style={{ marginRight: 4 }} />
              <Text style={styles.copyPillText}>{copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy message')}</Text>
            </TouchableOpacity>
          </View>

          {/* Direct SMS Form if active */}
          {showTwilioInput ? (
            <View style={styles.twilioBox}>
              <View style={styles.twilioHeader}>
                <Ionicons name="chatbubbles-outline" size={16} color="#0284C7" style={{ marginRight: 6 }} />
                <Text style={styles.twilioTitle}>{t('share.sendDirectSms', 'Direct SMS dispatch')}</Text>
              </View>
              <View style={styles.twilioInputRow}>
                <TextInput
                  style={styles.twilioInput}
                  value={targetPhone}
                  onChangeText={setTargetPhone}
                  placeholder="+225 07 00 00 00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={styles.twilioSendBtn}
                  onPress={handleSendTwilioSms}
                  disabled={sendingSms}
                >
                  {sendingSms ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="send" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.twilioSendBtnText}>{t('common.send', 'Send')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.twilioCancelBtn}
                onPress={() => smsService.openDeviceSms(targetPhone, fullText)}
              >
                <Text style={styles.twilioCancelText}>{t('share.useDeviceSms', 'Or open device SMS app')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Grid of Social Channels */}
          <Text style={styles.sectionLabel}>{t('share.chooseApp', 'Messaging & Social Apps')}</Text>
          <View style={styles.grid}>
            {channels.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                style={styles.channelItem}
                onPress={ch.action}
                activeOpacity={0.75}
              >
                <View style={[styles.iconCircle, { backgroundColor: ch.color }]}>
                  <Ionicons name={ch.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.channelName} numberOfLines={1}>
                  {ch.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    boxShadow: '0px -8px 24px rgba(0, 0, 0, 0.15)',
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#0F172A',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  feedbackText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#065F46',
  },
  previewCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  previewText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    marginBottom: 8,
  },
  copyPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  copyPillText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#071D54',
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  channelItem: {
    width: (Dimensions.get('window').width > 500 ? 500 : Dimensions.get('window').width - 40) / 4 - 8,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12)',
  },
  channelName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
  },
  twilioBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  twilioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  twilioTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#0369A1',
  },
  twilioInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  twilioInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#0F172A',
  },
  twilioSendBtn: {
    backgroundColor: '#0284C7',
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  twilioSendBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  twilioCancelBtn: {
    alignSelf: 'center',
    marginTop: 8,
  },
  twilioCancelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
});
