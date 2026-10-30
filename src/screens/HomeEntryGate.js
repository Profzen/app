import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import HomeScreen from './HomeScreen';
import PreHomeSlidesScreen from './PreHomeSlidesScreen';
import { ALL_COUNTRIES } from '../utils/countriesData';

const INTRO_VERSION = 'v3';
const AFRICAN_CODES = new Set('DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU YT MA MZ NA NE NG RE RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'.split(' '));

function isAfricanCountry(value) {
  if (!value || typeof value !== 'string') return false;
  const country = value.trim().toLowerCase();
  const match = ALL_COUNTRIES.find(item => item.code.toLowerCase() === country || item.name.toLowerCase() === country);
  return !!match && AFRICAN_CODES.has(match.code);
}

export default function HomeEntryGate(props) {
  const { user, session, accountMode, isUserLoading } = useApp();
  const [showIntro, setShowIntro] = useState(null);
  const isBusiness = accountMode === 'business' || user?.role === 'merchant';
  const country = isBusiness
    ? (user?.merchantProfile?.country || user?.merchantProfile?.country_code || user?.business_country || user?.country)
    : (user?.country_of_residence || user?.residence_country || user?.country || user?.country_code);
  const profile = isBusiness
    ? (isAfricanCountry(country) ? 'africanBusiness' : 'globalBusiness')
    : (isAfricanCountry(country) ? 'africanPersonal' : 'diaspora');
  const userId = user?.id || session?.user?.id || 'guest';
  const storageKey = `@dizzitup_prehome_${INTRO_VERSION}:${userId}:${profile}`;

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
  if (showIntro) return <PreHomeSlidesScreen key={profile} profile={profile} onComplete={completeIntro} />;
  return <HomeScreen {...props} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' } });
