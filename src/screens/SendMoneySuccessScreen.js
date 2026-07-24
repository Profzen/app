import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function SendMoneySuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    blockchain = 'Polygon',
    token = 'USDC',
    recipient = 'My Business',
    amount = '1',
    txHash = '91d99789-98cc-44c0-8a14-da693...'
  } = route.params || {};

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(txHash);
    setCopied(true);
    setToastMessage('L\'adresse a bien été copié !');
    setTimeout(() => {
      setCopied(false);
      setToastMessage('');
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('HomeScreen')}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Confirmation</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >

          {/* Web-Style Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerCardLeft}>
              <View style={styles.headerIconBadge}>
                <Ionicons name="paper-plane" size={20} color="#1A2840" />
              </View>
              <View style={styles.headerTitles}>
                <Text style={styles.headerTitleText}>Envoyer des fonds</Text>
                <View style={styles.secureStatusRow}>
                  <View style={styles.secureDot} />
                  <Text style={styles.secureStatusText}>SÉCURISÉ</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Toast Notification */}
          {copied && (
            <View style={styles.toastBox}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

          {/* Success Content Card */}
          <View style={styles.contentCard}>
            
            {/* Big Green Checkmark Badge */}
            <View style={styles.successIconBadge}>
              <Ionicons name="checkmark" size={38} color="#FFFFFF" />
            </View>

            {/* Title & Green Subtitle */}
            <Text style={styles.successTitle}>Transaction Soumise !</Text>
            <Text style={styles.successSubtitle}>
              Vous avez envoyé avec succès <Text style={{ fontFamily: 'Inter_700Bold' }}>{amount} {token}</Text> à <Text style={{ fontFamily: 'Inter_700Bold' }}>{recipient}</Text>
            </Text>

            {/* Tx Hash Box with Copy Icon */}
            <View style={styles.hashBoxContainer}>
              <Text style={styles.hashText} numberOfLines={1} ellipsisMode="middle">
                {txHash}
              </Text>
              <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard} activeOpacity={0.7}>
                <Ionicons 
                  name={copied ? "checkmark-done" : "copy-outline"} 
                  size={18} 
                  color={copied ? "#10B981" : "#64748B"} 
                />
              </TouchableOpacity>
            </View>

            {/* Done Action Button */}
            <TouchableOpacity 
              style={styles.doneBtn} 
              onPress={() => navigation.navigate('HomeScreen')}
              activeOpacity={0.88}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>

          </View>

          {/* Footer Security Badge */}
          <View style={styles.footerSecurityContainer}>
            <View style={styles.goldDot} />
            <Text style={styles.footerSecurityText}>NŒUD DE TRANSACTION SÉCURISÉ</Text>
          </View>

        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: '#0F172A',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitles: {
    justifyContent: 'center',
  },
  headerTitleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    color: '#0F172A',
    marginBottom: 2,
  },
  secureStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secureDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  secureStatusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#10B981',
    letterSpacing: 0.6,
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  toastText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#047857',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  successIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  hashBoxContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  hashText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: '#64748B',
    marginRight: 10,
  },
  copyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#0B132B',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B132B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  doneBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  footerSecurityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFC759',
    marginRight: 6,
  },
  footerSecurityText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
});
