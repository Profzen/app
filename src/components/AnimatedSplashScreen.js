import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing, Platform, Modal } from 'react-native';

export default function AnimatedSplashScreen({ onAnimationComplete }) {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';

    Animated.sequence([
      // 1. Logo fades in while slightly pulsing up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver,
        }),
      ]),
      // 2. The DizzitUp text smoothly fades in below it
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver,
      }),
      // 3. Pause so the user can see it
      Animated.delay(800),
      // 4. Fade the entire container out to reveal the app
      Animated.timing(containerFadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver,
      }),
    ]).start(() => {
      // Unmount the component entirely
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: containerFadeAnim }]} pointerEvents="none">
      <View style={styles.content}>
        <Animated.Image
          source={require('../../assets/brand/dizzitup_logo_cercle.png')}
          style={[
            styles.logo,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.brandText, { opacity: textFadeAnim }]}>
          DizzitApp
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A2840', // Deep Blue
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  brandText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#FFC759', // Gold
    letterSpacing: 2,
  },
});
