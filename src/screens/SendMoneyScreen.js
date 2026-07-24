import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppSelect from '../components/AppSelect';

const blockchains = [
  { value: 'Polygon', label: 'Polygon', subtitle: 'Polygon POS Network', iconName: 'layers', color: '#8247E5' },
  { value: 'Ethereum', label: 'Ethereum', subtitle: 'Mainnet ERC-20', iconName: 'cube', color: '#627EEA' },
  { value: 'Solana', label: 'Solana', subtitle: 'SPL Token Network', iconName: 'flash', color: '#14F195' },
  { value: 'BNB Chain', label: 'BNB Chain', subtitle: 'BEP-20 Network', iconName: 'stats-chart', color: '#F3BA2F' },
  { value: 'Bitcoin', label: 'Bitcoin', subtitle: 'BTC Native Network', iconName: 'logo-bitcoin', color: '#F7931A' },
];

const tokens = [
  { value: 'USDC', label: 'USDC', subtitle: 'USD Coin (Stablencoin)', balance: '1.0000', color: '#2775CA', iconName: 'cash-outline' },
  { value: 'USDT', label: 'USDT', subtitle: 'Tether USD', balance: '250.50', color: '#26A17B', iconName: 'wallet-outline' },
  { value: 'DIZ', label: 'DIZ', subtitle: 'Dizzitup Native Token', balance: '1250.00', color: '#FFC759', iconName: 'star-outline' },
  { value: 'ETH', label: 'ETH', subtitle: 'Ethereum Native', balance: '0.4500', color: '#627EEA', iconName: 'logo-ethereum' },
  { value: 'BTC', label: 'BTC', subtitle: 'Bitcoin Native', balance: '0.0150', color: '#F7931A', iconName: 'logo-bitcoin' },
];

export default function SendMoneyScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [blockchain, setBlockchain] = useState('Polygon');
  const [token, setToken] = useState('USDC');
  const [recipient, setRecipient] = useState(route.params?.recipient || 'My Business');
  const [amount, setAmount] = useState('1.00');

  const selectedToken = tokens.find(t => t.value === token) || tokens[0];

  const handleQuickPercent = (percent) => {
    const total = parseFloat(selectedToken.balance) || 0;
    const calculated = (total * (percent / 100)).toFixed(2);
    setAmount(calculated);
  };

  const handleClearRecipient = () => {
    setRecipient('');
  };

  const handleSend = () => {
    if (!recipient.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir l\'adresse du destinataire.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide.');
      return;
    }

    // Generate random mock transaction hash
    const mockHash = '91d99789-98cc-44c0-8a14-da693' + Math.random().toString(36).substring(2, 8);

    navigation.navigate('SendMoneySuccessScreen', {
      blockchain,
      token,
      recipient,
      amount,
      txHash: mockHash
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Envoyer des fonds</Text>
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

          {/* Form Card Container */}
          <View style={styles.formCard}>
            
            {/* Field 1: CHOISIR LA BLOCKCHAIN */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CHOISIR LA BLOCKCHAIN</Text>
              <AppSelect
                value={blockchain}
                options={blockchains}
                onChange={(val) => setBlockchain(val)}
                title="Choisir la Blockchain"
                style={styles.selectInput}
                renderLeading={(item) => (
                  <View style={[styles.optionIconBox, { backgroundColor: item?.color ? item.color + '15' : '#F1F5F9' }]}>
                    <Ionicons name={item?.iconName || 'layers'} size={18} color={item?.color || '#3B82F6'} />
                  </View>
                )}
              />
            </View>

            {/* Field 2: Jeton */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Jeton</Text>
              <AppSelect
                value={token}
                options={tokens}
                onChange={(val) => setToken(val)}
                title="Sélectionner un jeton"
                style={styles.selectInput}
                renderLeading={(item) => (
                  <View style={[styles.tokenIconBox, { backgroundColor: item?.color || '#2775CA' }]}>
                    <Ionicons name={item?.iconName || 'cash-outline'} size={16} color="#FFFFFF" />
                  </View>
                )}
              />
            </View>

            {/* Field 3: Adresse du destinataire */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Adresse du destinataire</Text>
              <View style={styles.recipientInputBox}>
                <View style={styles.recipientLeft}>
                  <View style={styles.recipientAvatar}>
                    <Ionicons name="person-outline" size={18} color="#2563EB" />
                  </View>
                  <TextInput
                    style={styles.recipientTextInput}
                    value={recipient}
                    onChangeText={setRecipient}
                    placeholder="Nom, contact ou adresse crypto..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {recipient.length > 0 && (
                  <TouchableOpacity style={styles.clearBtn} onPress={handleClearRecipient}>
                    <Ionicons name="close" size={16} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Field 4: Montant & Solde */}
            <View style={styles.fieldGroup}>
              <View style={styles.amountHeaderRow}>
                <Text style={styles.fieldLabel}>Montant</Text>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>
                    Disponible: {selectedToken.balance} {selectedToken.value}
                  </Text>
                </View>
              </View>

              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountTextInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#CBD5E1"
                />
                <Text style={styles.amountCurrencyTag}>{selectedToken.value}</Text>
              </View>

              {/* Quick Percentage Selectors */}
              <View style={styles.quickPercentRow}>
                <TouchableOpacity style={styles.percentChip} onPress={() => handleQuickPercent(25)}>
                  <Text style={styles.percentChipText}>25%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.percentChip} onPress={() => handleQuickPercent(50)}>
                  <Text style={styles.percentChipText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.percentChip} onPress={() => handleQuickPercent(75)}>
                  <Text style={styles.percentChipText}>75%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.percentChip, styles.percentChipMax]} onPress={() => handleQuickPercent(100)}>
                  <Text style={styles.percentChipTextMax}>MAX</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSend} activeOpacity={0.88}>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Envoyer {selectedToken.value}</Text>
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
    marginBottom: 16,
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  selectInput: {
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  optionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tokenIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recipientInputBox: {
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipientLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recipientTextInput: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 10,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availableBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availableBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#D97706',
  },
  amountInputContainer: {
    minHeight: 64,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountTextInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 28,
    color: '#0F172A',
    paddingVertical: 10,
  },
  amountCurrencyTag: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#64748B',
    marginLeft: 12,
  },
  quickPercentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  percentChip: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  percentChipMax: {
    backgroundColor: '#FEF3C7',
  },
  percentChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#475569',
  },
  percentChipTextMax: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#D97706',
  },
  submitBtn: {
    backgroundColor: '#0B132B',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0B132B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
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
