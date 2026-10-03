import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from './CryptoIcon';
import { useApp } from '../context/AppContext';

export default function AppSelect({
  value,
  options = [],
  onChange,
  title,
  searchPlaceholder,
  searchable,
  style,
  textStyle,
  renderLeading,
  accessibilityLabel,
  chevronColor = '#1A2840',
  renderCustomTrigger,
  placeholder,
}) {
  const { t } = useApp();
  const resolvedTitle = title || t('common.selectOption', 'Select an option');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // With a placeholder, an unmatched/empty value stays empty instead of falling back to the first option
  const selected = options.find((option) => option.value === value) || (placeholder ? null : options[0]);

  // Search is shown automatically for long lists (e.g. countries), or when explicitly requested
  const showSearch = searchable !== undefined ? searchable : options.length > 7;

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) =>
      [opt.label, opt.subtitle, opt.name, opt.value]
        .filter((v) => v !== undefined && v !== null)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const handleClose = () => {
    setOpen(false);
    setSearchQuery('');
  };

  const select = (option) => {
    onChange?.(option.value, option);
    handleClose();
  };

  return (
    <>
      {renderCustomTrigger ? (
        renderCustomTrigger({ setOpen, selected })
      ) : (
        <TouchableOpacity
          style={[styles.trigger, style]}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || resolvedTitle}
          accessibilityState={{ expanded: open }}
        >
          <View style={styles.triggerLeft}>
            {renderLeading?.(selected)}
            <Text style={[styles.triggerText, textStyle, !selected && styles.placeholderText]} numberOfLines={1}>{selected?.label || placeholder}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={chevronColor} />
        </TouchableOpacity>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={handleClose}>
        <SafeAreaView style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          
          {/* Floating Discrete Modal Card with Margins */}
          <View style={styles.modalCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{resolvedTitle}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose} accessibilityLabel={t('common.close', 'Close')}>
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {showSearch && (
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchPlaceholder || t('common.search', 'Search')}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }} accessibilityLabel={t('common.clear', 'Clear')}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView style={styles.optionsScroll} bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {filteredOptions.length === 0 && (
                <View style={styles.emptyWrap}>
                  <Ionicons name="search" size={26} color="#CBD5E1" />
                  <Text style={styles.emptyText}>{t('common.noResults', 'No results found')}</Text>
                </View>
              )}
              {filteredOptions.map((option) => {
                const active = option.value === selected?.value;
                return (
                  <TouchableOpacity 
                    key={option.value} 
                    style={[styles.optionRow, active && styles.optionRowActive]} 
                    onPress={() => select(option)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContent}>
                      {/* Logo Icon Badge */}
                      {option.flagUrl ? (
                        <Image source={{ uri: option.flagUrl }} style={{ width: 34, height: 34, borderRadius: 17, marginRight: 12, resizeMode: 'cover', borderWidth: 1, borderColor: '#F1F5F9' }} />
                      ) : (option.cryptoSymbol || option.value) && (option.isCrypto || ['Polygon', 'Ethereum', 'Solana', 'BNB Chain', 'Base', 'USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'POL', 'DAI', 'EURC', 'DIZ'].includes(option.cryptoSymbol || option.value)) ? (
                        <View style={{ marginRight: 12 }}>
                          <CryptoIcon symbol={option.cryptoSymbol || option.value} size={34} />
                        </View>
                      ) : option.iconName ? (
                        <View style={[styles.iconBadge, { backgroundColor: option.bg || '#3B82F6' }]}>
                          <Ionicons name={option.iconName} size={16} color={option.color || '#FFFFFF'} />
                        </View>
                      ) : (
                        <View style={[styles.iconBadge, { backgroundColor: '#F1F5F9' }]}>
                          <Text style={styles.iconBadgeText}>{option.label?.substring(0, 2)}</Text>
                        </View>
                      )}

                      <View style={styles.optionTextWrap}>
                        <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
                        {!!(option.subtitle || option.name) && (
                          <Text style={styles.optionSubtitle}>{option.subtitle || option.name}</Text>
                        )}
                      </View>
                    </View>
                    
                    {active && (
                      <View style={styles.activeCheckCircle}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16 },
  triggerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  triggerText: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#0F172A' },
  placeholderText: { color: '#9CA3AF' },
  
  /* Discrete Floating Modal Popup with Margins */
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.45)', paddingHorizontal: 20 },
  modalCard: { width: '100%', maxWidth: 380, maxHeight: '68%', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, boxShadow: '0px 8px 20px #000' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#0F172A' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 42, marginBottom: 12 },
  searchInput: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#0F172A', paddingVertical: 0 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  emptyText: { marginTop: 8, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#94A3B8', textAlign: 'center' },
  optionsScroll: { flexGrow: 0 },
  optionRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, backgroundColor: '#FFFFFF' },
  optionRowActive: { backgroundColor: '#FFFDF0', borderColor: '#FFC759' },
  optionContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBadgeText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#0F172A' },
  optionTextWrap: { flex: 1 },
  optionLabel: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#0F172A' },
  optionLabelActive: { color: '#0F172A' },
  optionSubtitle: { marginTop: 1, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
  activeCheckCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#D97706', justifyContent: 'center', alignItems: 'center' },
});

