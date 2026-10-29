import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import HomeScreen from './HomeScreen';
import PreHomeSlidesScreen from './PreHomeSlidesScreen';

const INTRO_VERSION = 'v1';

export default function HomeEntryGate(props) {
  const { user, session, accountMode, isUserLoading } = useApp();
  const [showIntro, setShowIntro] = useState(null);
  const isBusinessFirst = accountMode === 'business' || user?.role === 'merchant';
  const userId = user?.id || session?.user?.id || 'guest';
  const storageKey = `@dizzitup_prehome_${INTRO_VERSION}:${userId}`;

  useEffect(() => {
    let active = true;
    if (isUserLoading) return () => { active = false; };
    setShowIntro(null);
    AsyncStorage.getItem(storageKey)
      .then(value => { if (active) setShowIntro(value !== 'done'); })
      .catch(() => { if (active) setShowIntro(false); });
    return () => { active = false; };
  }, [isUserLoading, storageKey]);

  const completeIntro = async () => {
    try { await AsyncStorage.setItem(storageKey, 'done'); } catch (_) { /* continue into the app */ }
    setShowIntro(false);
  };

  if (showIntro === null) {
    return <View style={styles.loading}><ActivityIndicator color="#1A2840" /></View>;
  }
  if (showIntro) return <PreHomeSlidesScreen isBusinessFirst={isBusinessFirst} onComplete={completeIntro} />;
  return <HomeScreen {...props} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' } });
