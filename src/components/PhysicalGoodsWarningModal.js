import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function PhysicalGoodsWarningModal({ visible, onClose, onContinue, shopCountry = 'your region' }) {
  const { t } = useApp();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="construct-outline" size={32} color="#F59E0B" />
          </View>
          
          <Text style={styles.title}>
            {t('buyGoods.unavailableTitle', 'Coming Soon')}
          </Text>
          
          <Text style={styles.message}>
            {t('buyGoods.unavailableMessage', "We are establishing a secure delivery network in {{country}} to ensure your loved ones receive authentic products from verified merchants.\n\nBuying physical goods is temporarily unavailable, but you can still browse the shops. In the meantime, you can continue to pay bills, recharge airtime, and send or receive funds. We will notify you as soon as the service is fully rolled out.", { country: shopCountry })}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.continueButton]} 
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>{t('buyGoods.continueBrowsing', 'Continue Browsing')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 40, 64, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: width > 400 ? 360 : width - 48, // Responsive max-width
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 10, // Modern gap property for consistent spacing
  },
  button: {
    width: '100%',
    paddingVertical: 12, // Smaller height than before
    borderRadius: 14, // Softer curves
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#FFB800',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
    fontSize: 15,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
    fontSize: 15,
    textAlign: 'center',
  },
});
