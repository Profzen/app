import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppToast from '../components/AppToast';

export default function SendMoneySuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { amount = '1', token = 'USDC', recipient = 'My Business', hash = '91d99789-98cc-44c0-8a14-da693a72e5f1' } = route.params || {};
  const [toast, setToast] = useState(null);

  const handleCopyHash = async () => {
    try {
      await Clipboard.setStringAsync(hash);
      setToast({ title: 'Copié !', message: "L'adresse a bien été copié !" });
    } catch (err) {
      setToast({ title: 'Copié !', message: "L'adresse a bien été copié !" });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Confirmation Card Container */}
          <View style={styles.mainCard}>
            
            {/* Header Box inside Card */}
            <View style={styles.cardHeaderBox}>
              <View style={styles.headerIconSquare}>
                <Ionicons name="paper-plane" size={20} color="#1A2840" />
              </View>
              
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>Envoyer des fonds</Text>
                <View style={styles.secureTagRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.secureTagText}>SÉCURISÉ</Text>
                </View>
              </View>
            </View>

            <View style={styles.dividerLine} />

            {/* Success Circle Checkmark */}
            <View style={styles.successCircleWrapper}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={42} color="#FFFFFF" />
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.successTitle}>Transaction soumise !</Text>
            <Text style={styles.successSubtitle}>
              Vous avez envoyé avec succès {amount} {token} à {recipient}
            </Text>

            {/* Hash Code Copy Box */}
            <View style={styles.hashBox}>
              <Text style={styles.hashText} numberOfLines={1} ellipsisMode="middle">
                {hash}
              </Text>

              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyHash} activeOpacity={0.7}>
                <Ionicons name="copy-outline" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Main Action Button */}
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={() => navigation.navigate('HomeScreen')}
              activeOpacity={0.88}
            >
              <Text style={styles.doneButtonText}>Terminé</Text>
            </TouchableOpacity>

          </View>

          {/* Footer Security Note */}
          <View style={styles.securityFooterRow}>
            <View style={styles.goldDot} />
            <Text style={styles.securityFooterText}>NŒUD DE TRANSACTION SÉCURISÉ</Text>
          </View>

        </ScrollView>

        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 0,
  },
  container: { flex: 1, position: 'relative' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 50, zIndex: 50 },
  mainScroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 40, alignItems: 'center' },
  mainCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1, borderColor: '#F1F5F9', padding: 20, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3, marginTop: 10 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerIconSquare: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFC759', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#0F172A' },
  secureTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  secureTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', letterSpacing: 0.5 },
  dividerLine: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: -20, marginBottom: 32 },
  successCircleWrapper: { alignItems: 'center', marginBottom: 20 },
  successCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  successTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  successSubtitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#15803D', textAlign: 'center', paddingHorizontal: 12, lineHeight: 20, marginBottom: 28 },
  hashBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingLeft: 16, paddingRight: 8, height: 52, marginBottom: 28 },
  hashText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#475569', marginRight: 8 },
  copyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  doneButton: { backgroundColor: '#071D54', height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#071D54', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  doneButtonText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#FFFFFF' },
  securityFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759', marginRight: 6 },
  securityFooterText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#94A3B8', letterSpacing: 0.8 },
});
