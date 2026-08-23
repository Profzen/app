import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AppToast from '../components/AppToast';

export default function ReferBusinessScreen() {
  const navigation = useNavigation();
  const { user, t } = useApp();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastConfig, setToastConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

  // Form State
  const [referrant, setReferrant] = useState({
    firstName: user?.firstName || user?.name || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.phone || ""
  });

  const [business, setBusiness] = useState({
    name: "",
    contactEmail: "",
    contactMobile: "",
    country: ""
  });

  const handleSubmit = async () => {
    if (!referrant.email || !business.name || !business.contactMobile) {
      setToastConfig({ visible: true, title: t('errors.error', 'Error'), message: t('referBusiness.submitError', 'Please fill all required fields.'), type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        referrant,
        businesses: [business]
      };

      let API_URL = process.env.EXPO_PUBLIC_BUY_GOODS_API_URL || 'http://localhost:3001/api';
      if (Platform.OS === 'android' && API_URL.includes('localhost')) {
        API_URL = API_URL.replace('localhost', '10.0.2.2');
      }

      const response = await fetch(`${API_URL}/public/referrals/business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to submit');
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting referral:", error);
      setToastConfig({ visible: true, title: t('errors.error', 'Error'), message: t('referBusiness.submitError', 'An error occurred during submission.'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={40} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>{t('referBusiness.successTitle', 'Thank you!')}</Text>
          <Text style={styles.successDesc}>
            {t('referBusiness.successMessage1', 'We have successfully received your referral.')} {business.name}
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.goBack()}>
            <Text style={styles.btnPrimaryText}>{t('referBusiness.backToHome', "Back to Home")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('referBusiness.title1', 'Refer a')} {t('referBusiness.title2', 'Business')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" style={{marginRight: 8}} />
            <Text style={styles.infoBannerText}>
              {t('referBusiness.subtitle1', "Help us expand the DizzitUp ecosystem.")} {t('referBusiness.subtitle2', "Earn rewards")} {t('referBusiness.subtitle3', "when they successfully onboard!")}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('referBusiness.yourInfo', 'Your Information')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.firstName', 'First Name')}</Text>
              <TextInput style={styles.input} value={referrant.firstName} onChangeText={(t) => setReferrant({...referrant, firstName: t})} placeholder="First Name" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.lastName', 'Last Name')}</Text>
              <TextInput style={styles.input} value={referrant.lastName} onChangeText={(t) => setReferrant({...referrant, lastName: t})} placeholder="Last Name" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.email', 'Email *')}</Text>
              <TextInput style={styles.input} value={referrant.email} onChangeText={(t) => setReferrant({...referrant, email: t})} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.mobileNumber', 'Mobile Number')}</Text>
              <TextInput style={styles.input} value={referrant.mobile} onChangeText={(t) => setReferrant({...referrant, mobile: t})} placeholder="Mobile Number" keyboardType="phone-pad" placeholderTextColor="#94A3B8" />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('referBusiness.referredBusinesses', 'Referred Businesses')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.businessName', 'Business Name *')}</Text>
              <TextInput style={styles.input} value={business.name} onChangeText={(t) => setBusiness({...business, name: t})} placeholder="Business Name" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.contactMobile', 'Contact Mobile *')}</Text>
              <TextInput style={styles.input} value={business.contactMobile} onChangeText={(t) => setBusiness({...business, contactMobile: t})} placeholder="Phone Number" keyboardType="phone-pad" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.contactEmail', 'Contact Email')}</Text>
              <TextInput style={styles.input} value={business.contactEmail} onChangeText={(t) => setBusiness({...business, contactEmail: t})} placeholder="Email (optional)" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('referBusiness.country', 'Country')}</Text>
              <TextInput style={styles.input} value={business.country} onChangeText={(t) => setBusiness({...business, country: t})} placeholder="Country" placeholderTextColor="#94A3B8" />
            </View>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.8} style={styles.btnPrimaryWrapper}>
            <LinearGradient
              colors={['#FFD166', '#FF9F1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimary}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#1A2840" />
              ) : (
                <Text style={styles.btnPrimaryText}>{t('referBusiness.submitReferrals', 'Submit Referrals')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={{height: 40}} />

        </ScrollView>
        <AppToast 
          visible={toastConfig.visible}
          title={toastConfig.title}
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig({ ...toastConfig, visible: false })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  iconCircleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  pageTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#20365B' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  infoBanner: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#FEF3C7' },
  infoBannerText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#92400E', lineHeight: 18 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)', elevation: 3 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#20365B', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#FFC759', alignSelf: 'flex-start', paddingBottom: 4 },
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#20365B', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#94A3B8', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#20365B' },
  btnPrimaryWrapper: { marginTop: 12, borderRadius: 12, boxShadow: '0px 4px 8px rgba(255,159,28,0.3)', elevation: 4 },
  btnPrimary: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnPrimaryText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#20365B', textShadow: '0px 1px 2px rgba(255,255,255,0.3)' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: '#1A2840', marginBottom: 12 },
  successDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32 }
});
