import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getSupportedMoMoCountries, COUNTRY_METADATA } from '../services/paymentCorridorService';

const { width } = Dimensions.get('window');

export default function PaymentRegionModal({
  visible,
  onClose,
  currentCountryCode,
  onSelectCountry,
  onSelectAlternativeMethod,
}) {
  const { t, language } = useApp();
  const [search, setSearch] = useState('');

  const supportedCountries = useMemo(() => getSupportedMoMoCountries(language), [language]);

  const currentMeta = COUNTRY_METADATA[currentCountryCode?.toUpperCase()] || {
    name: currentCountryCode || 'International',
    nameEn: currentCountryCode || 'International',
    flag: '🌍',
  };
  const currentCountryName = (language === 'en' ? currentMeta.nameEn : currentMeta.name) || currentMeta.name;

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return supportedCountries;
    const q = search.toLowerCase().trim();
    return supportedCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [supportedCountries, search]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {t('paymentRails.regionModalTitle', 'Région de paiement Mobile Money')}
              </Text>
              <Text style={styles.subtitle}>
                {t('paymentRails.regionModalSub', 'Détecté actuellement :')} {currentMeta.flag} {currentCountryName}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Notice Card */}
          <View style={styles.infoNoticeCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoNoticeTitle}>
                {t('paymentRails.momoNoticeTitle', 'Pourquoi le Mobile Money est-il grisé ?')}
              </Text>
              <Text style={styles.infoNoticeText}>
                {t(
                  'paymentRails.momoNoticeDesc',
                  'Le Mobile Money nécessite un opérateur africain partenaire (Safaricom, MTN, Airtel, Orange, Vodacom, Moov, Wave...). Si vous détenez un numéro mobile de l’un des pays ci-dessous, sélectionnez-le pour activer ce moyen.'
                )}
              </Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('paymentRails.searchCountryPlaceholder', 'Rechercher un pays (ex: Sénégal, Kenya...)')}
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Countries List */}
          <ScrollView style={styles.countriesScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.listSectionHeader}>
              {t('paymentRails.availableCountriesHeader', '20 Pays Africains Supportés')} ({filteredCountries.length})
            </Text>

            {filteredCountries.map((c) => {
              const isSelected = currentCountryCode?.toUpperCase() === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.countryItem, isSelected && styles.countryItemSelected]}
                  onPress={() => {
                    onSelectCountry(c.code);
                    onClose();
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.countryFlagText}>{c.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
                        {c.name}
                      </Text>
                      <Text style={styles.currencyBadge}>{c.currency}</Text>
                    </View>
                    <Text style={styles.networkTagsText} numberOfLines={1}>
                      {c.networks.join(' • ')}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Alternative Quick CTAs */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.btnAlternative}
              onPress={() => {
                onSelectAlternativeMethod?.('card');
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="card-outline" size={16} color="#1A2840" style={{ marginRight: 6 }} />
              <Text style={styles.btnAlternativeText}>{t('paymentRails.payWithCard', 'Payer par Carte')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAlternative, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
              onPress={() => {
                onSelectAlternativeMethod?.('crypto');
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="wallet-outline" size={16} color="#1D4ED8" style={{ marginRight: 6 }} />
              <Text style={[styles.btnAlternativeText, { color: '#1D4ED8' }]}>{t('paymentRails.payWithCrypto', 'Payer en Crypto')}</Text>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 42,
    height: 4.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16.5,
    color: '#1A2840',
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 14,
    padding: 10,
    marginVertical: 10,
  },
  infoNoticeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1E40AF',
    marginBottom: 2,
  },
  infoNoticeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 15,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#1A2840',
    paddingVertical: 0,
  },
  countriesScroll: {
    maxHeight: 280,
  },
  listSectionHeader: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 6,
  },
  countryItemSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  countryFlagText: {
    fontSize: 24,
  },
  countryName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  countryNameSelected: {
    color: '#065F46',
  },
  currencyBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  networkTagsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  btnAlternative: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAlternativeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#1A2840',
  },
});
