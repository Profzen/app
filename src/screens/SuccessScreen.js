import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessScreen({
  title = "Félicitations !",
  subtitle = "Votre compte a été créé avec succès.",
  buttonText = "Se connecter",
  customIcon,
  onButtonPress
}) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      // Default fallback action for testing
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('HomeScreen');
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Central Content */}
        <View style={styles.content}>
          {/* Animated/Decorated Icon */}
          <View style={styles.iconWrapper}>
            {customIcon ? customIcon : (
              <View style={styles.circle}>
                <Ionicons name="checkmark" size={48} color="#FFFFFF" style={styles.checkIcon} />
              </View>
            )}
            
            {/* Sparkles Decoration (simulated with small icons positioned absolutely) */}
            <Ionicons name="star" size={16} color="#FFDCA8" style={[styles.sparkle, { top: 0, left: 20 }]} />
            <Ionicons name="star" size={12} color="#FFDCA8" style={[styles.sparkle, { top: 20, right: 0 }]} />
            <Ionicons name="star" size={10} color="#FFDCA8" style={[styles.sparkle, { bottom: 20, left: -10 }]} />
            <Ionicons name="star" size={14} color="#FFDCA8" style={[styles.sparkle, { bottom: 10, right: -15 }]} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handlePress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1A2840" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{buttonText}</Text>
                <Ionicons name="arrow-forward" size={20} color="#1A2840" style={styles.buttonIcon} />
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center', // Center the main content vertically
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  checkIcon: {
    marginTop: 4, // Slight optical adjustment
  },
  sparkle: {
    position: 'absolute',
    opacity: 0.8,
    zIndex: 1,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#1A2840',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  button: {
    backgroundColor: theme.colors.accent,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  buttonIcon: {
    marginLeft: 8,
  }
});
