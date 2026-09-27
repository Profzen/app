import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function RatingPromptModal({ visible, onClose, transactionType = 'transaction' }) {
  const { t, language } = useApp();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  if (!visible) return null;

  const handleRate = async (stars) => {
    setSelectedRating(stars);
    setHasRated(true);

    setTimeout(async () => {
      if (stars >= 4) {
        // Open App Store or Google Play
        try {
          const storeUrl = Platform.OS === 'ios'
            ? 'https://testflight.apple.com/join/v41'
            : 'https://github.com/Dizzitup/dizzitapp-v2/releases';
          await Linking.openURL(storeUrl);
        } catch (e) {
          console.log('Error opening store review URL', e);
        }
      }
      onClose();
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Logo container */}
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/brand/dizzitup_logo_cercle.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {t('rating.enjoyingApp', 'Enjoying DizzitUp?')}
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {hasRated
              ? t('rating.thankYou', 'Thank you for your rating!')
              : t('rating.tapStar', 'Tap a star to rate it on the App Store.')}
          </Text>

          {/* Stars row */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = selectedRating >= star;
              return (
                <TouchableOpacity
                  key={star}
                  style={styles.starBtn}
                  onPress={() => handleRate(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isFilled ? 'star' : 'star-outline'}
                    size={32}
                    color={isFilled ? '#F59E0B' : '#0052FF'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Not Now button */}
          <TouchableOpacity style={styles.notNowBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.notNowText}>
              {t('rating.notNow', 'Not Now')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  starBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  notNowBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notNowText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
});
