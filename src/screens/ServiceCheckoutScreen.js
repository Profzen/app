import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform, StatusBar, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';

const rawBuyGoods = process.env.EXPO_PUBLIC_BUY_GOODS_API_URL || 'https://buygoods-api.dizzitup.com/api';
const BUY_GOODS_API = rawBuyGoods.replace(/\/api\/?$/, '');
const PAY_BILLS_URL = process.env.EXPO_PUBLIC_PAY_BILLS_URL || 'https://paybills.dizzitup.com';
const rawDizzyWallet = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'https://wallet.dizzitup.com/api';
const DIZZYWALLET_API = rawDizzyWallet.replace(/\/api\/?$/, '');

export default function ServiceCheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { session, language } = useApp();
  
  const { product, beneficiary } = route.params;
  
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoadingContext(true);

        // 1. Determine Route based on Category
        let path = "/SelectService";
        if (product.category === 'mobile_data_airtime') path = "/topups/operators";
        else if (product.category === 'utilities') path = "/PayUtilityBills/SelectUtilityService";
        else if (product.category === 'gift_cards') path = "/GiftCards/SelectGiftCard";
        else if (product.category === 'education') path = "/PayUtilityBills/SelectUtilityService";
        else if (product.isRemittance) path = "/send-remittance"; 
        
        let targetHost = product.isRemittance || !product.isService ? 'https://buygoods.dizzitup.com' : PAY_BILLS_URL;

        // 2. Create Context for Services
        let contextId = null;
        if (product.isService && !product.isRemittance) {
          const contextRes = await fetch(`${BUY_GOODS_API}/api/public/context/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              phone_number: beneficiary.phone, 
              country_code: beneficiary.country_code || "TG", 
              currency: "USD", 
              marketplace: beneficiary.country_code || "TG" 
            }),
          });
          
          if (contextRes.ok) {
            const ctxData = await contextRes.json();
            contextId = ctxData.context_id;
          }
        }

        // 3. Generate SSO Token
        let handoffToken = "";
        if (session?.access_token) {
          try {
            const tokenRes = await fetch(`${DIZZYWALLET_API}/api/auth/paybills-token`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (tokenRes.ok) {
              const tokenData = await tokenRes.json();
              handoffToken = tokenData.token;
            }
          } catch (tokenErr) {
            console.log("SSO Token generation failed", tokenErr);
          }
        }

        // 4. Construct URL
        const params = new URLSearchParams();
        if (language) params.set('lang', language);
        if (contextId) params.set('ctx', contextId);
        if (handoffToken) params.set('token', handoffToken);
        if (beneficiary.phone) params.set('phone', beneficiary.phone);
        if (beneficiary.country_code || beneficiary.country) params.set('country', (beneficiary.country_code || beneficiary.country).toUpperCase());
        
        // Pass item context if physical good
        if (!product.isService && !product.isRemittance) {
          params.set('quantity', '1');
          params.set('amount', product.price);
        }

        const fName = beneficiary.first_name || beneficiary.name?.split(' ')[0] || "";
        const lName = beneficiary.last_name || beneficiary.name?.split(' ')?.slice(1)?.join(' ') || "";
        if (fName) params.set('firstName', fName);
        if (lName) params.set('lastName', lName);
        if (beneficiary.email) params.set('email', beneficiary.email);
        if (beneficiary.city) params.set('city', beneficiary.city);
        if (beneficiary.id) params.set('beneficiaryId', beneficiary.id);
        params.set('skipRecipient', 'true');

        const finalUrl = `${targetHost}${path}?${params.toString()}`;
        console.log("Loading Secure Checkout URL:", finalUrl);
        
        setCheckoutUrl(finalUrl);
        setLoadingContext(false);
      } catch (err) {
        console.error("Failed to initialize checkout", err);
        setErrorMsg("Erreur d'initialisation du paiement sécurisé.");
        setLoadingContext(false);
      }
    };

    initializeCheckout();
  }, [product, beneficiary]);

  const handleNavigationStateChange = (navState) => {
    const url = navState.url;
    // Intercept success/cancel URLs to close the WebView
    if (url.includes('/order-success') || url.includes('success=true')) {
      AppToast.showSuccess("Paiement réussi !");
      navigation.navigate('ContactHistoryScreen', { contact: beneficiary });
    } else if (url.includes('/order-cancel') || url.includes('cancel=true')) {
      AppToast.showError("Paiement annulé.");
      navigation.goBack();
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.modalBackdrop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Paiement Sécurisé</Text>
              <View style={styles.secureBadge}>
                <Ionicons name="lock-closed" size={10} color="#10B981" />
                <Text style={styles.secureText}>256-BIT SSL</Text>
              </View>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.container}>
        {loadingContext ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#FFC759" />
            <Text style={styles.loadingText}>Initialisation du paiement sécurisé...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorCenter}>
            <Ionicons name="warning" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.retryBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : checkoutUrl ? (
          <WebView 
            ref={webViewRef}
            source={{ uri: checkoutUrl }}
            style={{ flex: 1 }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={[styles.loadingCenter, { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF' }]}>
                <ActivityIndicator size="large" color="#FFC759" />
              </View>
            )}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true} // Crucial for payment widgets
          />
        ) : null}
      </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: 'transparent' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 17, 40, 0.4)' },
  safeArea: { flex: 1, justifyContent: 'flex-end', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) : 44 },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  dragHandleWrap: { width: '100%', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#1A2840', marginRight: 8 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  secureText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#10B981', marginLeft: 4 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#6B7280', marginTop: 16 },
  errorCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#20365B', marginTop: 16, textAlign: 'center', marginBottom: 24 },
  retryBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#20365B' }
});
