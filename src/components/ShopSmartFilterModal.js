import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function ShopSmartFilterModal({
  visible,
  onClose,
  products = [],
  currency = 'USD',
  currentFilters,
  onApplyFilters,
}) {
  const { t } = useApp();

  // Extract unique categories from actual products
  const availableCategories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      const c = p.category || p.desc1;
      if (c && typeof c === 'string') cats.add(c.trim());
    });
    return Array.from(cats);
  }, [products]);

  // Compute dynamic min & max price from products
  const priceExtremes = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map((p) => Number(p.price) || 0).filter((v) => v > 0);
    if (prices.length === 0) return { min: 0, max: 1000 };
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Internal draft filter state
  const [sortBy, setSortBy] = useState(currentFilters?.sortBy || 'featured');
  const [selectedCategories, setSelectedCategories] = useState(currentFilters?.categories || []);
  const [inStockOnly, setInStockOnly] = useState(currentFilters?.inStockOnly || false);
  const [minPrice, setMinPrice] = useState(currentFilters?.minPrice ? String(currentFilters.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState(currentFilters?.maxPrice ? String(currentFilters.maxPrice) : '');
  const [selectedPricePreset, setSelectedPricePreset] = useState(currentFilters?.pricePreset || 'all');

  // Sync draft state when modal opens
  useEffect(() => {
    if (visible && currentFilters) {
      setSortBy(currentFilters.sortBy || 'featured');
      setSelectedCategories(currentFilters.categories || []);
      setInStockOnly(currentFilters.inStockOnly || false);
      setMinPrice(currentFilters.minPrice ? String(currentFilters.minPrice) : '');
      setMaxPrice(currentFilters.maxPrice ? String(currentFilters.maxPrice) : '');
      setSelectedPricePreset(currentFilters.pricePreset || 'all');
    }
  }, [visible, currentFilters]);

  // Dynamic price preset options based on actual prices
  const pricePresets = useMemo(() => {
    const min = priceExtremes.min;
    const max = priceExtremes.max;
    const mid1 = Math.round(min + (max - min) * 0.33);
    const mid2 = Math.round(min + (max - min) * 0.66);

    const currLabel = (currency === 'XOF' || currency === 'XAF') ? 'F CFA' : currency;

    return [
      { id: 'all', label: t('filter.allPrices', 'Tous les prix'), min: null, max: null },
      { id: 'low', label: `${t('filter.under', 'Moins de')} ${mid1.toLocaleString()} ${currLabel}`, min: 0, max: mid1 },
      { id: 'mid', label: `${mid1.toLocaleString()} - ${mid2.toLocaleString()} ${currLabel}`, min: mid1, max: mid2 },
      { id: 'high', label: `${mid2.toLocaleString()} ${currLabel} +`, min: mid2, max: null },
    ];
  }, [priceExtremes, currency, t]);

  const handlePricePresetSelect = (preset) => {
    setSelectedPricePreset(preset.id);
    if (preset.id === 'all') {
      setMinPrice('');
      setMaxPrice('');
    } else {
      setMinPrice(preset.min !== null ? String(preset.min) : '');
      setMaxPrice(preset.max !== null ? String(preset.max) : '');
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleReset = () => {
    setSortBy('featured');
    setSelectedCategories([]);
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedPricePreset('all');
  };

  // Compute how many items match the current draft filters in real-time
  const matchingCount = useMemo(() => {
    let result = [...products];

    if (inStockOnly) {
      result = result.filter((p) => p.stock_quantity === undefined || p.stock_quantity > 0);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category || p.desc1));
    }

    const minNum = parseFloat(minPrice);
    const maxNum = parseFloat(maxPrice);
    if (!isNaN(minNum) && minNum > 0) {
      result = result.filter((p) => (Number(p.price) || 0) >= minNum);
    }
    if (!isNaN(maxNum) && maxNum > 0) {
      result = result.filter((p) => (Number(p.price) || 0) <= maxNum);
    }

    return result.length;
  }, [products, inStockOnly, selectedCategories, minPrice, maxPrice]);

  const hasActiveFilters = useMemo(() => {
    return (
      sortBy !== 'featured' ||
      selectedCategories.length > 0 ||
      inStockOnly ||
      Boolean(minPrice) ||
      Boolean(maxPrice) ||
      selectedPricePreset !== 'all'
    );
  }, [sortBy, selectedCategories, inStockOnly, minPrice, maxPrice, selectedPricePreset]);

  const handleApply = () => {
    onApplyFilters({
      sortBy,
      categories: selectedCategories,
      inStockOnly,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      pricePreset: selectedPricePreset,
    });
    onClose();
  };

  const sortOptions = [
    { id: 'featured', label: t('filter.sortFeatured', 'Recommandés (DizzitUp)'), icon: 'sparkles-outline' },
    { id: 'price_asc', label: t('filter.sortPriceAsc', 'Prix : Ordre croissant'), icon: 'arrow-up-outline' },
    { id: 'price_desc', label: t('filter.sortPriceDesc', 'Prix : Ordre décroissant'), icon: 'arrow-down-outline' },
    { id: 'rating', label: t('filter.sortRating', 'Avis & popularité'), icon: 'star-outline' },
    { id: 'newest', label: t('filter.sortNewest', 'Nouveautés'), icon: 'time-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="options" size={20} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.title}>{t('filter.title', 'Filtres & Tri')}</Text>
              {hasActiveFilters && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>•</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                  <Text style={styles.resetBtnText}>{t('filter.reset', 'Réinitialiser')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Section 1: Tri (Sort by) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filter.sortBy', 'Trier par')}</Text>
              <View style={styles.sortGrid}>
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.sortPill, isSelected && styles.sortPillActive]}
                      onPress={() => setSortBy(opt.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={15}
                        color={isSelected ? '#1A2840' : '#64748B'}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.sortPillText, isSelected && styles.sortPillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Fourchette de Prix (Price Range) */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{t('filter.price', 'Prix')}</Text>
                <Text style={styles.sectionSubtitle}>
                  ({(currency === 'XOF' || currency === 'XAF') ? 'F CFA' : currency})
                </Text>
              </View>

              {/* Price Preset Chips */}
              <View style={styles.presetsRow}>
                {pricePresets.map((preset) => {
                  const isSelected = selectedPricePreset === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[styles.presetChip, isSelected && styles.presetChipActive]}
                      onPress={() => handlePricePresetSelect(preset)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Min / Max Inputs */}
              <View style={styles.customPriceRow}>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputPrefix}>Min</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={(val) => {
                      setMinPrice(val);
                      setSelectedPricePreset('custom');
                    }}
                  />
                </View>

                <View style={styles.priceDash}>
                  <Text style={{ color: '#94A3B8', fontSize: 16 }}>—</Text>
                </View>

                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputPrefix}>Max</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder={String(priceExtremes.max || '1000')}
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={(val) => {
                      setMaxPrice(val);
                      setSelectedPricePreset('custom');
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Section 3: Catégories (Categories Multi-Select) */}
            {availableCategories.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{t('filter.categories', 'Catégories')}</Text>
                  {selectedCategories.length > 0 && (
                    <Text style={styles.selectedCountBadge}>
                      {selectedCategories.length} {t('filter.selected', 'sélectionnée(s)')}
                    </Text>
                  )}
                </View>
                <View style={styles.categoryWrap}>
                  {availableCategories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                        onPress={() => toggleCategory(cat)}
                        activeOpacity={0.7}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#1A2840" style={{ marginRight: 4 }} />
                        )}
                        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Section 4: Disponibilité (In Stock Only Toggle) */}
            <View style={[styles.section, styles.switchSection]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{t('filter.inStockOnly', 'En stock uniquement')}</Text>
                <Text style={styles.switchDesc}>{t('filter.inStockDesc', 'Afficher uniquement les articles immédiatement expédiables.')}</Text>
              </View>
              <Switch
                value={inStockOnly}
                onValueChange={setInStockOnly}
                trackColor={{ false: '#E2E8F0', true: '#FFC759' }}
                thumbColor={inStockOnly ? '#FFB800' : '#FFFFFF'}
                ios_backgroundColor="#E2E8F0"
              />
            </View>
          </ScrollView>

          {/* Sticky Bottom Action Bar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.btnCancelText}>{t('common.cancel', 'Annuler')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnApply} onPress={handleApply} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={18} color="#1A2840" style={{ marginRight: 6 }} />
              <Text style={styles.btnApplyText}>
                {t('filter.applyWithCount', `Voir ${matchingCount} produit(s)`, { count: matchingCount })}
              </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.88,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
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
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  activeBadge: {
    marginLeft: 6,
  },
  activeBadgeText: {
    fontSize: 20,
    color: '#FFB800',
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetBtn: {
    marginRight: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#F59E0B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    maxHeight: height * 0.65,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  selectedCountBadge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#B45309',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  sortPillActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FFB800',
  },
  sortPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#475569',
  },
  sortPillTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  presetChipActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FFB800',
  },
  presetChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  presetChipTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  customPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  priceInputPrefix: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    marginRight: 6,
  },
  priceTextInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
    padding: 0,
  },
  priceDash: {
    paddingHorizontal: 10,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryChipActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FFB800',
  },
  categoryChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  categoryChipTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#1A2840',
  },
  switchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    paddingRight: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#475569',
  },
  btnApply: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFB800',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnApplyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
});
