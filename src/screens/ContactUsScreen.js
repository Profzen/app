import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import * as WebBrowser from 'expo-web-browser';

export default function ContactUsScreen() {
  const navigation = useNavigation();
  const { language, t, appSettings, user } = useApp();
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      setToast({ 
        title: t('contactScreen.requiredField'), 
        message: t('contactScreen.fillSubjectMessage') 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the new backend endpoint for sending support messages securely
      const apiUrl = process.env.EXPO_PUBLIC_BUY_GOODS_API_URL || 'https://buygoods-api.dizzitup.com/api';
      const response = await fetch(`${apiUrl}/support/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || null,
          user_email: user?.email || null,
          phone: user?.phone || null,
          subject: subject.trim(),
          message: message.trim(),
          target_email: appSettings?.support_email || 'support@dizzitup.com',
          source: 'app'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send support message');
      }

      setToast({ 
        title: t('contactScreen.messageSent'), 
        message: t('contactScreen.supportWillReply') 
      });
      setSubject('');
      setMessage('');
    } catch (error) {
      console.log('Error sending support message:', error);
      setToast({
        title: t('contactScreen.error'),
        message: t('contactScreen.failedToSend')
      });
    } finally {
      setIsSubmitting(false);
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
              <Text style={styles.pageTitle}>{t('contactUs', 'Contact Us')}</Text>
              <Text style={styles.pageSubtitle}>{t('contactScreen.subtitle')}</Text>
            </View>
          </View>

          {/* Quick Channels Grid */}
          <Text style={styles.sectionHeader}>{t('contactScreen.quickChannels')}</Text>
          <View style={styles.channelsGrid}>
            {/* Live Chat AI */}
            <TouchableOpacity style={styles.channelCard} onPress={() => navigation.navigate('AskAminataScreen')}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="chatbubbles-outline" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.channelTitle}>Chat IA Aminata</Text>
              <Text style={styles.channelDesc}>{t('contactScreen.instantResponse')}</Text>
            </TouchableOpacity>

            {/* Email Support */}
            <TouchableOpacity style={styles.channelCard} onPress={() => {
              const email = appSettings?.support_email || 'support@dizzitup.com';
              Linking.openURL(`mailto:${email}`).catch(err => {
                console.log('Error opening email app:', err);
                setToast({ title: 'Email Support', message: email });
              });
            }}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="mail-outline" size={22} color="#10B981" />
              </View>
              <Text style={styles.channelTitle}>{t('contactScreen.byEmail')}</Text>
              <Text style={styles.channelDesc}>{appSettings?.support_email || 'support@dizzitup.com'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.channelsGrid}>
            {/* Phone WhatsApp */}
            <TouchableOpacity style={styles.channelCard} onPress={() => {
              const rawNumber = appSettings?.whatsapp_number || '+228 90 00 00 00';
              const cleanNumber = rawNumber.replace(/[^0-9+]/g, ''); // Remove spaces, keep +
              Linking.openURL(`whatsapp://send?phone=${cleanNumber}`).catch(err => {
                console.log('Error opening whatsapp:', err);
                setToast({ title: 'WhatsApp Support', message: `Contact ${rawNumber}` });
              });
            }}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              </View>
              <Text style={styles.channelTitle}>WhatsApp Pro</Text>
              <Text style={styles.channelDesc}>{appSettings?.whatsapp_number || '+228 90 00 00 00'}</Text>
            </TouchableOpacity>

            {/* FAQ Center */}
            <TouchableOpacity style={styles.channelCard} onPress={async () => {
              let url = appSettings?.help_center_url || 'dizzitup.com/faq';
              let fullUrl = url.startsWith('http') ? url : `https://${url}`;
              try {
                await WebBrowser.openBrowserAsync(fullUrl, {
                  toolbarColor: '#1A2840',
                  enableBarCollapsing: true,
                  showTitle: true
                });
              } catch (e) {
                console.log(e);
              }
            }}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="help-circle-outline" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.channelTitle}>{t('contactScreen.helpCenter')}</Text>
              <Text style={styles.channelDesc}>{t('contactScreen.guidesFaq')}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <Text style={styles.sectionHeader}>{t('contactScreen.sendMsgTitle')}</Text>
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('contactScreen.subject')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('contactScreen.subjectPlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('contactScreen.yourMessage')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('contactScreen.messagePlaceholder')}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleSendMessage} disabled={isSubmitting}>
              <Ionicons name="paper-plane-outline" size={18} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>{isSubmitting ? t('contactScreen.sending') : t('contactScreen.btnSendMessage')}</Text>
            </TouchableOpacity>
          </View>

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
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.8, marginTop: 10, marginBottom: 8, marginLeft: 4 },
  channelsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  channelCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', padding: 14, marginHorizontal: 4 },
  channelIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  channelTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  channelDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', padding: 16, marginTop: 4, marginBottom: 16 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, height: 48, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1A2840', outlineStyle: 'none' },
  textArea: { height: 120, paddingTop: 12 },
  submitBtn: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4, boxShadow: '0px 4px 8px #FFC759' },
  submitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
});
