import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function PhysicalGoodsWarningModal({ visible, onClose, onContinue }) {
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
            {t('buyGoods.unavailableMessage', "Buying and paying for physical goods is currently unavailable. You may continue browsing the shop, but orders cannot be accepted at this time. Meanwhile, you can continue paying bills & services, recharging your mobile plan, buying gift cards, and sending or receiving funds. We will notify you as soon as the 'Buy goods' service is fully rolled out.")}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.continueButton]} 
              onPress={onContinue}
            >
              <Text style={styles.continueButtonText}>{t('buyGoods.continueBrowsing', 'Continue Browsing')}</Text>
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
    width: width - 48,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
    fontSize: 15,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#FFB800',
    marginLeft: 8,
  },
  continueButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1A2840',
    fontSize: 15,
    textAlign: 'center',
  },
});
