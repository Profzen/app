import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppSelect from '../components/AppSelect';
import AppToast from '../components/AppToast';
import BottomNavBar from '../components/BottomNavBar';

const BLOCKCHAINS = [
  { value: 'Polygon', label: 'Polygon', name: 'Polygon Network' },
  { value: 'Ethereum', label: 'Ethereum', name: 'Ethereum Mainnet' },
  { value: 'Solana', label: 'Solana', name: 'Solana Network' },
  { value: 'BNB Chain', label: 'BNB Chain', name: 'BNB Smart Chain' },
  { value: 'Bitcoin', label: 'Bitcoin', name: 'Bitcoin Network' },
];

const CRYPTO_TOKENS = [
  { value: 'USDC', label: 'USDC', name: 'USD Coin' },
  { value: 'USDT', label: 'USDT', name: 'Tether USD' },
  { value: 'DIZ', label: 'DIZ', name: 'DizzitUp Token' },
  { value: 'ETH', label: 'ETH', name: 'Ethereum' },
  { value: 'BTC', label: 'BTC', name: 'Bitcoin' },
];

export default function SendMoneyScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [blockchain, setBlockchain] = useState('Polygon');
  const [token, setToken] = useState('USDC');
  const [recipient, setRecipient] = useState(route.params?.recipient || 'My Account');
  const [address, setAddress] = useState('0x48b3...6A3d');
  const [amount, setAmount] = useState('1');
  const [toast, setToast] = useState(null);

  const handleSend = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setToast({ title: 'Montant invalide', message: 'Veuillez saisir un montant supérieur à 0.' });
      return;
    }
    navigation.navigate('SendMoneySuccessScreen', {
      amount,
      token,
      recipient: recipient || 'My Business',
      hash: '91d99789-98cc-44c0-8a14-da693a72e5f1',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Envoyer des fonds</Text>
            <View style={styles.secureTagRow}>
              <View style={styles.greenDot} />
              <Text style={styles.secureTagText}>SÉCURISÉ</Text>
            </View>
          </View>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={18} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main White Form Card */}
          <View style={styles.formCard}>
            
            {/* Green Alert Banner */}
            <View style={styles.alertBanner}>
              <Ionicons name="information-circle-outline" size={18} color="#15803D" style={{ marginRight: 8 }} />
              <Text style={styles.alertBannerText}>Destinataire défini : Mon compte</Text>
            </View>

            {/* Section 1: CHOISIR LA BLOCKCHAIN */}
            <Text style={styles.fieldLabel}>CHOISIR LA BLOCKCHAIN</Text>
            <View style={styles.selectBoxRow}>
              <View style={[styles.tokenIconBadge, { backgroundColor: '#8247E5' }]}>
                <Ionicons name="cube-outline" size={16} color="#FFFFFF" />
              </View>
              <AppSelect
                value={blockchain}
                options={BLOCKCHAINS}
                onChange={(val) => setBlockchain(val)}
                title="Sélectionner la Blockchain"
                style={styles.appSelectFlex}
                textStyle={styles.selectTextBold}
              />
            </View>

            {/* Section 2: Jeton */}
            <Text style={styles.fieldLabel}>Jeton</Text>
            <View style={styles.selectBoxRow}>
              <View style={[styles.tokenIconBadge, { backgroundColor: '#2775CA' }]}>
                <Ionicons name="logo-usd" size={16} color="#FFFFFF" />
              </View>
              <AppSelect
                value={token}
                options={CRYPTO_TOKENS}
                onChange={(val) => setToken(val)}
                title="Sélectionner un jeton crypto"
                style={styles.appSelectFlex}
                textStyle={styles.selectTextBold}
              />
            </View>

            {/* Section 3: Adresse du destinataire */}
            <Text style={styles.fieldLabel}>Adresse du destinataire</Text>
            <View style={styles.recipientCard}>
              <View style={styles.userAvatarCircle}>
                <Ionicons name="person-outline" size={18} color="#2563EB" />
              </View>
              
              <View style={styles.recipientInfoWrap}>
                <Text style={styles.recipientName}>{recipient}</Text>
                <Text style={styles.recipientAddress}>{address}</Text>
              </View>

              <TouchableOpacity 
                style={styles.clearRecipientBtn}
                onPress={() => {
                  setRecipient('');
                  setAddress('');
                }}
              >
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Section 4: Montant & Solde disponible */}
            <View style={styles.amountHeaderRow}>
              <Text style={styles.fieldLabelNoMargin}>Montant</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>Disponible: 1.0000 {token}</Text>
              </View>
            </View>

            <View style={styles.amountInputRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.amountTokenSuffix}>{token}</Text>
            </View>

            {/* Main CTA Button */}
            <TouchableOpacity style={styles.sendCtaBtn} onPress={handleSend} activeOpacity={0.88}>
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.sendCtaText}>Envoyer {token}</Text>
            </TouchableOpacity>

          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, position: 'relative' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 70, zIndex: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 36 : 10, paddingBottom: 12 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#0F172A' },
  secureTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  secureTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', letterSpacing: 0.5 },
  headerRightIcons: { flexDirection: 'row' },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', padding: 18, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7', borderRadius: 14, padding: 12, marginBottom: 20 },
  alertBannerText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#15803D' },
  fieldLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#64748B', letterSpacing: 0.5, marginBottom: 8, marginTop: 12, textTransform: 'uppercase' },
  fieldLabelNoMargin: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#64748B' },
  selectBoxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  tokenIconBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  appSelectFlex: { flex: 1, borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' },
  selectTextBold: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#0F172A' },
  recipientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 12, marginBottom: 20 },
  userAvatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recipientInfoWrap: { flex: 1 },
  recipientName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#0F172A', marginBottom: 2 },
  recipientAddress: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748B' },
  clearRecipientBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  amountHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  availableBadge: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  availableBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#D97706' },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 54, marginBottom: 24 },
  amountInput: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#0F172A', outlineStyle: 'none' },
  amountTokenSuffix: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#64748B' },
  sendCtaBtn: { backgroundColor: '#071D54', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 14, shadowColor: '#071D54', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  sendCtaText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#FFFFFF' },
});
