import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Platform, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';

export default function AskAminataScreen() {
  const navigation = useNavigation();
  const { language, t, user } = useApp();
  const firstName = user?.name ? user.name.split(' ')[0] : (user?.merchantProfile?.shop_name || '');
  
  // Create greeting dynamically based on language and user name
  const rawGreeting = t('askAminata.greeting', 'Hello {{name}}! 👋 I am Aminata, DizzitUp\'s AI assistant. How can I help you today?');
  const greeting = rawGreeting.replace(/David|ديفيد|ዳዊት|{{name}}/i, firstName ? `${firstName}` : '');

  const INITIAL_MESSAGES = [
    {
      id: '1',
      sender: 'aminata',
      text: greeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const SUGGESTED_QUESTIONS = [
    t('askAminata.qTopUp', 'How to top up via Mobile Money?'),
    t('askAminata.qFees', 'What are the fees on DZY?'),
    t('askAminata.qBusiness', 'How to create a Business account?'),
    t('askAminata.qShops', 'Where to find partner shops?')
  ];

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleLinkPress = (url) => {
    if (url.startsWith('dizzitup://navigate/')) {
      const withoutScheme = url.replace('dizzitup://navigate/', '');
      const [screenName, queryString] = withoutScheme.split('?');
      
      const params = {};
      if (queryString) {
        queryString.split('&').forEach(pair => {
          const [key, val] = pair.split('=');
          if (key) params[key] = decodeURIComponent(val || '');
        });
      }
      
      navigation.navigate(screenName, params);
      return false; // prevent default behavior
    }
    Linking.openURL(url);
    return false;
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const cleanHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await fetch(`${process.env.EXPO_PUBLIC_BUY_GOODS_API_URL}/public/aminata-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            userRole: user?.role,
            language: language,
            platform: 'mobile',
            userName: firstName,
            page: 'Aminata Chat Mobile',
          },
          history: cleanHistory
        })
      });

      const data = await response.json();
      
      const replyMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'aminata',
        text: data.text || t('askAminata.errorGeneric', 'Sorry, I couldn\'t respond.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    } catch (error) {
      console.error('Aminata Chat Error:', error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'aminata',
        text: t('askAminata.errorNetwork', 'A network error occurred. Please try again.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Retour">
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.assistantAvatarWrap}>
            <View style={styles.avatarCircle}>
              <Image source={require('../../assets/brand/aminata_avatar.jpg')} style={{width: 32, height: 32, borderRadius: 16}} />
            </View>
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.pageTitle}>{t('askAminata.title', 'Ask Aminata')}</Text>
            <Text style={styles.pageSubtitle}>{t('askAminata.subtitle', 'AI Virtual Assistant • Online')}</Text>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
          {messages.map((item) => (
            <View key={item.id} style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aminataBubble]}>
              {item.sender === 'aminata' && (
                <View style={styles.msgAvatarCircle}>
                  <Image source={require('../../assets/brand/aminata_avatar.jpg')} style={{width: 28, height: 28, borderRadius: 14}} />
                </View>
              )}
              <View style={[styles.bubbleContent, item.sender === 'user' ? styles.userBubbleContent : styles.aminataBubbleContent]}>
                {item.sender === 'user' ? (
                  <Text style={styles.userMsgText}>
                    {item.text}
                  </Text>
                ) : (
                  <Markdown onLinkPress={handleLinkPress} style={markdownStyles}>
                    {item.text}
                  </Markdown>
                )}
                <Text style={[styles.msgTime, item.sender === 'user' ? styles.userMsgTime : styles.aminataMsgTime]}>
                  {item.time}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.aminataBubble]}>
              <View style={styles.msgAvatarCircle}>
                <Image source={require('../../assets/brand/aminata_avatar.jpg')} style={{width: 28, height: 28, borderRadius: 14}} />
              </View>
              <View style={[styles.bubbleContent, styles.aminataBubbleContent]}>
                <Text style={styles.aminataMsgText}>...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Questions Chips */}
        <View style={styles.suggestedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <TouchableOpacity key={idx} style={styles.chip} onPress={() => handleSendMessage(q)}>
                <Ionicons name="help-circle-outline" size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                <Text style={styles.chipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={t('askAminata.placeholder', 'Ask Aminata a question...')}
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage()}>
            <Ionicons name="send" size={18} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <BottomNavBar activeTab="More" language={language} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0F2F5', backgroundColor: '#FFFFFF' },
  backButton: { paddingRight: 10, paddingVertical: 4 },
  assistantAvatarWrap: { position: 'relative', marginRight: 10 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  headerTitleContainer: { flex: 1 },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  pageSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#10B981' },
  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  messageBubble: { flexDirection: 'row', marginBottom: 14, maxWidth: '85%' },
  aminataBubble: { alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgAvatarCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A2840', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4 },
  bubbleContent: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, flexShrink: 1 },
  aminataBubbleContent: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F2F5' },
  userBubbleContent: { backgroundColor: '#FFC759' },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  aminataMsgText: { color: '#1A2840' },
  userMsgText: { color: '#1A2840', fontFamily: 'Inter_500Medium' },
  msgTime: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  aminataMsgTime: { color: '#9CA3AF' },
  userMsgTime: { color: '#6B7280' },
  suggestedContainer: { paddingVertical: 8, backgroundColor: '#FAFAFC' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2563EB' },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  textInput: { flex: 1, height: 44, backgroundColor: '#F9FAFB', borderRadius: 22, paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1A2840', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center' },
});

const markdownStyles = StyleSheet.create({
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1A2840', lineHeight: 20 },
  paragraph: { marginVertical: 4 },
  link: { color: '#3B82F6', textDecorationLine: 'underline' },
  strong: { fontFamily: 'Inter_700Bold' },
  list_item: { marginVertical: 4 }
});
