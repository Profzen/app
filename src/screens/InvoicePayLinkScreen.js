import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Share, Platform, StatusBar, KeyboardAvoidingView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import AppSelect from '../components/AppSelect';
import AppToast from '../components/AppToast';

const CURRENCIES = ['USDC', 'USDT', 'EURC'].map((code) => ({ value: code, label: code }));
const slugify = (value) => String(value || 'global').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'global';

export default function InvoicePayLinkScreen() {
  const navigation = useNavigation();
  const { user, t } = useApp();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [description, setDescription] = useState('');
  const [generated, setGenerated] = useState(null);
  const [toast, setToast] = useState(null);

  const createPayLink = () => {
    const numeric = Number(String(amount).replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric <= 0) return setToast({ title: t('common.error', 'Error'), message: t('invoicePayLink.invalidAmount', 'Enter a valid amount.'), type: 'error' });
    const merchant = user?.merchantProfile;
    if (!merchant?.shop_name) return setToast({ title: t('common.error', 'Error'), message: t('invoicePayLink.missingAccount', 'No business account is available for this payment request.'), type: 'error' });
    // Until the backend exposes a dedicated DZYpaylink endpoint, use the existing public DZYStore URL.
    // The amount and description stay in the shared message, so we never publish a fabricated payment URL.
    const url = merchant.public_url || merchant.shop_url || `https://dizzitup.com/DZYstore/${slugify(merchant.country)}/${slugify(merchant.city_village)}/${slugify(merchant.shop_name)}`;
    setGenerated({ amount: numeric.toFixed(2), currency, description: description.trim(), url });
  };
  const shareMessage = generated ? t('invoicePayLink.shareMessage', 'Payment request: {{amount}} {{currency}} — {{description}} {{url}}', { amount: generated.amount, currency: generated.currency, description: generated.description || t('invoicePayLink.defaultDescription', 'Invoice'), url: generated.url }) : '';
  const copyLink = async () => { await Clipboard.setStringAsync(generated.url); setToast({ title: t('common.copied', "Link copied"), message: t('invoicePayLink.copied', 'Payment link copied.'), type: 'success' }); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color="#1A2840" /></TouchableOpacity><View style={{ flex: 1 }}><Text style={styles.title}>{t('invoicePayLink.title', 'Invoice & DZYpaylink')}</Text><Text style={styles.subtitle}>{t('invoicePayLink.subtitle', 'Create and share a simple payment request.')}</Text></View></View>
        <View style={styles.card}>
          <Text style={styles.label}>{t('invoicePayLink.amount', 'Amount')}</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" style={styles.input} />
          <Text style={styles.label}>{t('invoicePayLink.currency', 'Currency')}</Text><AppSelect value={currency} options={CURRENCIES} onChange={setCurrency} title={t('invoicePayLink.currency', 'Currency')} />
          <Text style={styles.label}>{t('invoicePayLink.description', 'Description')}</Text><TextInput value={description} onChangeText={setDescription} placeholder={t('invoicePayLink.descriptionPlaceholder', 'Products, service or invoice reference')} style={[styles.input, styles.description]} multiline />
          <TouchableOpacity style={styles.generateBtn} onPress={createPayLink}><Ionicons name="link-outline" size={20} color="#1A2840" /><Text style={styles.generateText}>{t('invoicePayLink.generate', 'Generate payment link')}</Text></TouchableOpacity>
        </View>
        {generated && <View style={styles.resultCard}>
          <View style={styles.successIcon}><Ionicons name="checkmark" size={22} color="#047857" /></View><Text style={styles.resultTitle}>{generated.amount} {generated.currency}</Text><Text style={styles.url} numberOfLines={2}>{generated.url}</Text>
          <View style={styles.actions}><TouchableOpacity style={styles.copyBtn} onPress={copyLink}><Ionicons name="copy-outline" size={18} color="#1A2840" /><Text style={styles.copyText}>{t('common.copy', 'Copy')}</Text></TouchableOpacity><TouchableOpacity style={styles.shareBtn} onPress={() => Share.share({ title: t('invoicePayLink.title', 'Invoice & DZYpaylink'), message: shareMessage })}><Ionicons name="share-social-outline" size={18} color="#FFF" /><Text style={styles.shareText}>{t('common.share', 'Share')}</Text></TouchableOpacity></View>
          <TouchableOpacity onPress={() => Linking.openURL('https://dizzitup.com/dashboard')}><Text style={styles.dashboardLink}>{t('invoicePayLink.fullDashboard', 'Open full invoice dashboard')}</Text></TouchableOpacity>
        </View>}
      </KeyboardAvoidingView>
      <AppToast visible={!!toast} title={toast?.title} message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 36) : 0 }, container: { flex: 1, padding: 20 }, header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }, backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' }, subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', marginTop: 3 }, card: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E8EDF4' }, label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#475569', marginBottom: 7, marginTop: 12 }, input: { minHeight: 50, borderWidth: 1, borderColor: '#DDE4EE', borderRadius: 13, paddingHorizontal: 14, fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1A2840', backgroundColor: '#FCFDFE' }, description: { height: 80, paddingTop: 13, textAlignVertical: 'top' }, generateBtn: { height: 52, borderRadius: 14, backgroundColor: '#FFC759', marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, generateText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840' }, resultCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#D1FAE5', marginTop: 16, alignItems: 'center' }, successIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }, resultTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840', marginTop: 8 }, url: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B', textAlign: 'center', marginVertical: 10 }, actions: { flexDirection: 'row', gap: 10, width: '100%' }, copyBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#DDE4EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, copyText: { fontFamily: 'Inter_600SemiBold', color: '#1A2840' }, shareBtn: { flex: 1, height: 46, borderRadius: 12, backgroundColor: '#071D54', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, shareText: { fontFamily: 'Inter_600SemiBold', color: '#FFF' }, dashboardLink: { fontFamily: 'Inter_600SemiBold', color: '#2563EB', marginTop: 15, textDecorationLine: 'underline' },
});
