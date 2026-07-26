import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';

export default function PersonalAccountScreen() {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [toast, setToast] = useState(null);

  // Form State
  const [name, setName] = useState('David Mensah');
  const [email, setEmail] = useState('david.mensah@email.com');
  const [phone, setPhone] = useState('+228 90 12 34 56');
  const [country, setCountry] = useState('Togo / Ghana');
  const [city, setCity] = useState('Lomé, Quartier Adidogomé');

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MoreSettingsScreen');
  };

  const handleSave = () => {
    setToast({ 
      title: language === 'fr' ? 'Profil mis à jour' : 'Profile Updated', 
      message: language === 'fr' ? 'Vos informations personnelles ont été enregistrées.' : 'Your personal details have been saved.' 
    });
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
              <Text style={styles.pageTitle}>{t('personalAccount', 'Personal Account')}</Text>
              <Text style={styles.pageSubtitle}>{language === 'fr' ? 'Informations personnelles & Vérification' : 'Personal Details & Verification'}</Text>
            </View>
          </View>

          {/* User Header Avatar */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatarImage} />
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setToast({ title: language === 'fr' ? 'Photo de profil' : 'Profile Photo', message: language === 'fr' ? 'Sélecteur de photo ouvert' : 'Photo picker opened' })}>
                <Ionicons name="camera" size={14} color="#1A2840" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileNameText}>{name}</Text>
            <View style={styles.kycBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.kycBadgeText}>{language === 'fr' ? 'COMPTE VÉRIFIÉ (NIVEAU 2)' : 'VERIFIED ACCOUNT (LEVEL 2)'}</Text>
            </View>
          </View>

          {/* Form Section */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? 'INFORMATIONS DU COMPTE' : 'ACCOUNT DETAILS'}</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{language === 'fr' ? 'Nom complet' : 'Full Name'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={language === 'fr' ? 'Nom' : 'Name'} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{language === 'fr' ? 'Adresse Email' : 'Email Address'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{language === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{language === 'fr' ? 'Pays de résidence' : 'Country of Residence'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="flag-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={country} onChangeText={setCountry} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{language === 'fr' ? 'Ville / Adresse' : 'City / Address'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="location-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                <TextInput style={styles.input} value={city} onChangeText={setCity} />
              </View>
            </View>
          </View>

          {/* Verification / Document Section */}
          <Text style={styles.sectionHeader}>{language === 'fr' ? "DOCUMENT D'IDENTITÉ" : 'IDENTITY DOCUMENT'}</Text>
          <View style={styles.card}>
            <View style={styles.docRow}>
              <View style={styles.docIconWrap}>
                <Ionicons name="card-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.docText}>
                <Text style={styles.docTitle}>{language === 'fr' ? "Carte Nationale d'Identité / Passeport" : 'National ID / Passport'}</Text>
                <Text style={styles.docDesc}>{language === 'fr' ? 'Document validé le 12 Fév 2026' : 'Document verified on Feb 12, 2026'}</Text>
              </View>
              <View style={styles.statusVerifiedChip}>
                <Text style={styles.statusVerifiedText}>{language === 'fr' ? 'Validé' : 'Verified'}</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('btnSave', 'Enregistrer les modifications')}</Text>
          </TouchableOpacity>

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
  saveButton: { height: 50, borderRadius: 14, backgroundColor: '#FFC759', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 2 },
  saveButtonText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A2840' },
});
