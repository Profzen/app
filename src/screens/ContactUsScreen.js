import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function ContactUsScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [toast, setToast] = useState(null);

  // Support Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      setToast({ 
        title: language === 'fr' ? 'Champ requis' : 'Required Field', 
        message: language === 'fr' ? 'Veuillez remplir le sujet et votre message.' : 'Please fill in both subject and message.' 
      });
      return;
    }
    setToast({ 
      title: language === 'fr' ? 'Message envoyé' : 'Message Sent', 
      message: language === 'fr' ? 'Notre équipe support vous répondra dans les plus brefs délais.' : 'Our support team will reply as soon as possible.' 
    });
    setSubject('');
    setMessage('');
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
              <Text style={styles.pageSubtitle}>{language === 'fr' ? 'Assistance & Support client 7j/7' : 'Assistance & Customer Support 24/7'}</Text>
            </View>
          </View>

          {/* Quick Channels Grid */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? "CANAUX D'ASSISTANCE RAPIDE" : 'QUICK SUPPORT CHANNELS'}</Text>
          <View style={styles.channelsGrid}>
            {/* Live Chat AI */}
            <TouchableOpacity style={styles.channelCard} onPress={() => navigation.navigate('AskAminataScreen')}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="chatbubbles-outline" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.channelTitle}>Chat IA Aminata</Text>
              <Text style={styles.channelDesc}>{language === 'fr' ? 'Réponse instantanée 24/7' : 'Instant 24/7 response'}</Text>
            </TouchableOpacity>

            {/* Email Support */}
            <TouchableOpacity style={styles.channelCard} onPress={() => setToast({ title: 'Email Support', message: 'support@dizzitup.com' })}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="mail-outline" size={22} color="#10B981" />
              </View>
              <Text style={styles.channelTitle}>{language === 'fr' ? 'Par Email' : 'By Email'}</Text>
              <Text style={styles.channelDesc}>support@dizzitup.com</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.channelsGrid}>
            {/* Phone WhatsApp */}
            <TouchableOpacity style={styles.channelCard} onPress={() => setToast({ title: 'WhatsApp Support', message: 'Contact +228 90 00 00 00' })}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              </View>
              <Text style={styles.channelTitle}>WhatsApp Pro</Text>
              <Text style={styles.channelDesc}>+228 90 00 00 00</Text>
            </TouchableOpacity>

            {/* FAQ Center */}
            <TouchableOpacity style={styles.channelCard} onPress={() => navigation.navigate('AboutDizzitUpScreen')}>
              <View style={[styles.channelIconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="help-circle-outline" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.channelTitle}>{language === 'fr' ? "Centre d'aide" : 'Help Center'}</Text>
              <Text style={styles.channelDesc}>{language === 'fr' ? 'Guides & FAQ' : 'Guides & FAQ'}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'ENVOYER UN MESSAGE AU SUPPORT' : 'SEND A MESSAGE TO SUPPORT'}</Text>
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{language === 'fr' ? 'Sujet de votre demande' : 'Subject'}</Text>
              <TextInput
                style={styles.input}
                placeholder={language === 'fr' ? "Ex: Problème de recharge, question sur les frais..." : "E.g. Top-up issue, fee question..."}
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{language === 'fr' ? 'Votre message' : 'Your message'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={language === 'fr' ? "Décrivez votre problème ou votre question en détail..." : "Describe your problem or question in detail..."}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSendMessage}>
              <Ionicons name="paper-plane-outline" size={18} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>{t('btnSendMessage', 'Envoyer le message')}</Text>
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
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#4B5563', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 46, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1A2840' },
  textArea: { height: 110, paddingTop: 10 },
  submitBtn: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#FFC759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
  submitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
});
