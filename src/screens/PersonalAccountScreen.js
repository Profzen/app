import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, Platform, StatusBar, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function PersonalAccountScreen() {
  const navigation = useNavigation();
  const { language, t, user, updateUserProfile } = useApp();
  const [toast, setToast] = useState(null);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || '');
  const [city, setCity] = useState(user?.city || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // When the user context finally loads/updates, sync the local form state
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCountry(user.country || '');
      setCity(user.city || '');
    }
  }, [user]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const first_name = name.split(' ')[0] || '';
    const last_name = name.split(' ').slice(1).join(' ') || '';
    
    const result = await updateUserProfile({
        first_name,
        last_name,
        mobile_number: phone,
        country_of_residence: country,
        city_of_residence: city
    });
    
    setIsSaving(false);
    
    if (result.success) {
      setToast({ 
        title: t('personalAccount.saveSuccess', 'Profile Updated'), 
        message: t('personalAccount.saveSuccessMsg', 'Your details have been saved.'),
        type: 'success'
      });
    } else {
      setToast({ 
        title: t('personalAccount.saveError', 'Update Error'), 
        message: result.error || t('personalAccount.saveErrorMsg', 'Could not update profile.'),
        type: 'error'
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Retour">
              <Ionicons name="arrow-back" size={22} color="#1A2840" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.pageTitle}>{t('personalAccount.title', 'Personal Account')}</Text>
              <Text style={styles.pageSubtitle}>{t('personalAccount.subtitle', 'Personal Details & Verification')}</Text>
            </View>
          </View>

          {/* User Header Avatar */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarWrap}>
              <Image source={user?.avatar || require('../../assets/avatars/david.jpg')} style={styles.avatarImage} />
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setToast({ title: t('personalAccount.title', 'Profile Photo'), message: 'Sélecteur de photo ouvert', type: 'info' })}>
                <Ionicons name="camera" size={14} color="#1A2840" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileNameText}>{name || user?.email}</Text>
            <View style={styles.kycBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.kycBadgeText}>{t('personalAccount.verifiedBadge', 'VERIFIED ACCOUNT (LEVEL 2)')}</Text>
            </View>
          </View>

          {/* Form Section */}
          <Text style={styles.sectionHeader}>{t('personalAccount.accountDetails', 'ACCOUNT DETAILS')}</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t('personalAccount.fullName', 'Full Name')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('personalAccount.fullName', 'Name')} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t('personalAccount.emailAddress', 'Email Address')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={[styles.input, {color: '#9CA3AF'}]} value={email} editable={false} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t('personalAccount.phoneNumber', 'Phone Number')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t('personalAccount.country', 'Country of Residence')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="flag-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={country} onChangeText={setCountry} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t('personalAccount.city', 'City / Address')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="location-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={city} onChangeText={setCity} />
              </View>
            </View>
          </View>

          {/* Verification / Document Section */}
          <Text style={styles.sectionHeader}>{t('personalAccount.identityDoc', 'IDENTITY DOCUMENT')}</Text>
          <View style={styles.card}>
            <View style={styles.docRow}>
              <View style={styles.docIconWrap}>
                <Ionicons name="card-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.docText}>
                <Text style={styles.docTitle}>{t('personalAccount.idCard', 'National ID / Passport')}</Text>
                <Text style={styles.docDesc}>{t('personalAccount.docVerified', 'Document verified')} 12 Fév 2026</Text>
              </View>
              <View style={styles.statusVerifiedChip}>
                <Text style={styles.statusVerifiedText}>{t('personalAccount.verified', 'Verified')}</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
            onPress={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#1A2840" />
            ) : (
              <Text style={styles.saveButtonText}>{t('personalAccount.btnSave', 'Save Changes')}</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="More" />
        <AppToast visible={!!toast} title={toast?.title} message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      </KeyboardAvoidingView>
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
  profileHeaderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', padding: 18, alignItems: 'center', marginBottom: 16 },
  avatarWrap: { position: 'relative', width: 74, height: 74, borderRadius: 37, marginBottom: 10 },
  avatarImage: { width: 74, height: 74, borderRadius: 37 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  profileNameText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840', marginBottom: 6 },
  kycBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  kycBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#059669', marginLeft: 4 },
  sectionHeader: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.8, marginTop: 10, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  fieldRow: { marginVertical: 8 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#4B5563', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 46 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1A2840' },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  docIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  docText: { flex: 1, paddingRight: 6 },
  docTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A2840' },
  docDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 },
  statusVerifiedChip: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusVerifiedText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#10B981' },
  saveButton: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 8px rgba(255,199,89,0.3)', elevation: 4 },
  saveButtonText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
});
