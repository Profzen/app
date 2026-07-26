import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';

export default function AskAminataScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();

  const INITIAL_MESSAGES = [
    {
      id: '1',
      sender: 'aminata',
      text: language === 'fr' 
        ? "Bonjour David ! 👋 Je suis Aminata, l'assistante virtuelle intelligente de DizzitUp. Comment puis-je vous aider aujourd'hui ?"
        : "Hello David! 👋 I am Aminata, DizzitUp's AI assistant. How can I help you today?",
      time: '10:00'
    }
  ];

  const SUGGESTED_QUESTIONS = language === 'fr' ? [
    "Comment recharger par Mobile Money ?",
    "Quels sont les frais sur DZY ?",
    "Comment créer un compte Business ?",
    "Où trouver les boutiques partenaires ?"
  ] : [
    "How to top up via Mobile Money?",
    "What are the fees on DZY?",
    "How to create a Business account?",
    "Where to find partner shops?"
  ];

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const getAminataResponse = (userText) => {
    const textLower = userText.toLowerCase();
    if (textLower.includes('recharger') || textLower.includes('mobile money') || textLower.includes('top up')) {
      return language === 'fr' 
        ? "Pour recharger votre portefeuille : allez sur l'écran d'accueil, cliquez sur 'Top-up' ou 'Recharger', sélectionnez 'Mobile Money' (Moov, MTN, Mixx), entrez le montant et validez sur votre téléphone !"
        : "To top up your wallet: go to the home screen, tap 'Top-up', select 'Mobile Money', enter the amount and validate on your phone!";
    }
    if (textLower.includes('frais') || textLower.includes('dzy') || textLower.includes('fee')) {
      return language === 'fr'
        ? "Les paiements et transferts en DZY bénéficient de 0% de frais réseau ! Pour les retraits Mobile Money, les frais sont affichés en toute transparence avant validation (1% à 1.5%)."
        : "DZY payments and transfers enjoy 0% network fees! For Mobile Money cashouts, transparent fees (1% to 1.5%) are displayed before validation.";
    }
    if (textLower.includes('business') || textLower.includes('marchand') || textLower.includes('merchant')) {
      return language === 'fr'
        ? "Pour ouvrir un compte Business : rendez-vous dans Réglages > Business account, activez votre profil marchand et accédez à votre caisse TPE QR Code instantanée !"
        : "To open a Business account: go to Settings > Business Account, activate your merchant profile and access your instant QR Code POS Cashier!";
    }
    if (textLower.includes('boutique') || textLower.includes('shop')) {
      return language === 'fr'
        ? "Cliquez sur l'onglet 'Boutique' en bas pour explorer les commerces certifiés DizzitUp acceptant les stablecoins (USDT, USDC, EURC, DZY) près de chez vous."
        : "Tap the 'Shop' tab at the bottom to explore certified DizzitUp merchants accepting stablecoins (USDT, USDC, EURC, DZY) near you.";
    }
    return language === 'fr'
      ? "Merci pour votre question ! Je note votre demande. Vous pouvez aussi consulter notre centre d'aide ou contacter le support direct."
      : "Thank you for your question! You can also check our help center or contact direct support.";
  };

  const handleSendMessage = (textToSend) => {
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

    setTimeout(() => {
      const replyMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'aminata',
        text: getAminataResponse(query),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 600);
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
              <Ionicons name="sparkles" size={18} color="#FFC759" />
            </View>
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.pageTitle}>{t('askAminata', 'Ask Aminata')}</Text>
            <Text style={styles.pageSubtitle}>{language === 'fr' ? 'Assistante virtuelle IA • En ligne' : 'AI Virtual Assistant • Online'}</Text>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
          {messages.map((item) => (
            <View key={item.id} style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aminataBubble]}>
              {item.sender === 'aminata' && (
                <View style={styles.msgAvatarCircle}>
                  <Ionicons name="sparkles" size={14} color="#FFC759" />
                </View>
              )}
              <View style={[styles.bubbleContent, item.sender === 'user' ? styles.userBubbleContent : styles.aminataBubbleContent]}>
                <Text style={[styles.msgText, item.sender === 'user' ? styles.userMsgText : styles.aminataMsgText]}>
                  {item.text}
                </Text>
                <Text style={[styles.msgTime, item.sender === 'user' ? styles.userMsgTime : styles.aminataMsgTime]}>
                  {item.time}
                </Text>
              </View>
            </View>
          ))}
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
            placeholder={language === 'fr' ? "Posez votre question à Aminata..." : "Ask Aminata a question..."}
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage()}>
            <Ionicons name="send" size={18} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <BottomNavBar activeTab="More" language="fr" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0F2F5', backgroundColor: '#FFFFFF' },
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
  bubbleContent: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
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
