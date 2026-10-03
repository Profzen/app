import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { resolveBeneficiaryCountry } from '../utils/countryCurrencyUtils';
import AppToast from '../components/AppToast';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const cardWidth = (width - 48) / 2;

const getPayBillsApiUrl = () => {
  let url = process.env.EXPO_PUBLIC_PAY_BILLS_API_URL || 'https://api.dizzitup.com';
  return url.replace(/\/api\/?$/, '');
};

const CATEGORIES = [
  { id: 'ALL', labelKey: 'giftCards.catAll', fallback: 'All' },
  { id: 'SHOPPING', labelKey: 'giftCards.catShopping', fallback: 'Shopping' },
  { id: 'FOOD', labelKey: 'giftCards.catFood', fallback: 'Food & Groceries' },
  { id: 'GAMING', labelKey: 'giftCards.catGaming', fallback: 'Gaming' },
  { id: 'STREAMING', labelKey: 'giftCards.catStreaming', fallback: 'Streaming & Media' },
];

export default function ExploreGiftCardsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, user } = useApp();

  const { beneficiary = {}, initialQuery, selectedCardId } = route.params || {};
  const { countryCode, countryName } = resolveBeneficiaryCountry(beneficiary, {
    phone: beneficiary.phone || route.params?.phone,
    user,
    fallback: 'NG',
  });

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');

  // Purchase Modal State
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(beneficiary.email || user?.email || '');
  const [recipientPhone, setRecipientPhone] = useState(beneficiary.phone || user?.phone || '');
  const [emailError, setEmailError] = useState('');
  const [toast, setToast] = useState(null);

  // Sync logged-in user email if not pre-populated
  useEffect(() => {
    if (!recipientEmail && (beneficiary.email || user?.email)) {
      setRecipientEmail(beneficiary.email || user?.email || '');
    }
  }, [beneficiary.email, user?.email]);

  useEffect(() => {
    let isMounted = true;
    const fetchGiftCards = async () => {
      setLoading(true);
      try {
        const baseUrl = getPayBillsApiUrl();

        // 1. Fetch live gift cards for target country (if countryCode provided)
        let countryItems = [];
        if (countryCode) {
          try {
            const res = await fetch(`${baseUrl}/payments/giftCard/cards/country/${countryCode}`, {
              headers: { Accept: 'application/json' },
            });
            if (res.ok) {
              const json = await res.json();
              countryItems = Array.isArray(json) ? json : (Array.isArray(json.content) ? json.content : []);
            }
          } catch (err) {
            console.warn('Failed to load country gift cards:', err);
          }
        }

        // 2. ALWAYS fetch worldwide / global cards so all products (Roblox, Steam, Xbox, Free Fire, etc.) are available for everyone
        let globalItems = [];
        try {
          const fallbackRes = await fetch(`${baseUrl}/payments/giftCard/cards/country/`, {
            headers: { Accept: 'application/json' },
          });
          if (fallbackRes.ok) {
            const fallbackJson = await fallbackRes.json();
            globalItems = Array.isArray(fallbackJson) ? fallbackJson : (Array.isArray(fallbackJson.content) ? fallbackJson.content : []);
          }
        } catch (err) {
          console.warn('Failed to load global gift cards:', err);
        }

        // 3. Merge country items and global items without duplicates (country-specific first)
        const seen = new Set();
        const rawItems = [];

        countryItems.forEach(c => {
          const id = String(c.productId || c.id);
          if (!seen.has(id)) {
            seen.add(id);
            rawItems.push(c);
          }
        });

        globalItems.forEach(c => {
          const id = String(c.productId || c.id);
          if (!seen.has(id)) {
            seen.add(id);
            rawItems.push(c);
          }
        });

        if (rawItems.length > 0 && isMounted) {
          const formatted = rawItems.map(c => {
            const isFixed = c.denominationType === 'FIXED' || (Array.isArray(c.fixedRecipientDenominations) && c.fixedRecipientDenominations.length > 0);
            const fixedDenoms = (Array.isArray(c.fixedRecipientDenominations) && c.fixedRecipientDenominations.length > 0)
              ? c.fixedRecipientDenominations.map(Number).filter(n => !isNaN(n) && n > 0).sort((a, b) => a - b)
              : [];

            const minDenom = (isFixed && fixedDenoms.length > 0)
              ? fixedDenoms[0]
              : parseFloat(c.minRecipientDenomination || c.minSenderDenomination || c.minAmount || 1);

            const maxDenom = (isFixed && fixedDenoms.length > 0)
              ? fixedDenoms[fixedDenoms.length - 1]
              : parseFloat(c.maxRecipientDenomination || c.maxSenderDenomination || c.maxAmount || minDenom);

            const denominationsList = isFixed && fixedDenoms.length > 0
              ? fixedDenoms
              : [minDenom, Math.round((minDenom + maxDenom) / 2), maxDenom].filter((v, idx, arr) => arr.indexOf(v) === idx);

            const cardCurrency = c.recipientCurrencyCode || c.currencyCode || c.currency || 'USD';
            const userCurrency = c.usersCurrencyCode || c.senderCurrencyCode || null;

            // Formatted price string for grid card
            const priceLabel = isFixed && minDenom === maxDenom
              ? `${cardCurrency} ${minDenom}`
              : `${cardCurrency} ${minDenom} - ${maxDenom}`;

            return {
              id: String(c.productId || c.id),
              name: c.productName || c.name,
              brand: c.brand?.brandName || c.brand || c.productName || c.name,
              category: (c.category?.name || c.category || 'DIGITAL').toUpperCase(),
              logo: (Array.isArray(c.logoUrls) && c.logoUrls.length > 0) ? c.logoUrls[0] : (c.logo || null),
              denominations: denominationsList,
              minAmount: minDenom,
              maxAmount: maxDenom,
              currency: cardCurrency,
              userCurrency: userCurrency,
              priceLabel: priceLabel,
              isFixed: isFixed,
              isGlobal: Boolean(c.global),
              countryName: c.country?.name || (c.global ? 'Worldwide' : ''),
              redeemInstruction: c.redeemInstruction?.concise || c.redeemInstruction?.verbose || '',
            };
          });
          setCards(formatted);
        } else if (isMounted) {
          setCards([]);
        }
      } catch (err) {
        console.warn('Error loading gift cards from live API:', err?.message);
        if (isMounted) setCards([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGiftCards();
    return () => { isMounted = false; };
  }, [countryCode, selectedCardId]);

  // Filter Cards
  const filteredCards = useMemo(() => {
    let result = cards;
    if (activeTab !== 'ALL') {
      result = result.filter(c => {
        const cat = (c.category || '').toUpperCase();
        if (activeTab === 'GAMING') return cat.includes('GAM') || c.name.toLowerCase().includes('roblox') || c.name.toLowerCase().includes('free fire') || c.name.toLowerCase().includes('pubg') || c.name.toLowerCase().includes('steam') || c.name.toLowerCase().includes('xbox') || c.name.toLowerCase().includes('playstation') || c.name.toLowerCase().includes('nintendo') || c.name.toLowerCase().includes('razer');
        if (activeTab === 'STREAMING') return cat.includes('STREAM') || cat.includes('MEDIA') || c.name.toLowerCase().includes('netflix') || c.name.toLowerCase().includes('spotify') || c.name.toLowerCase().includes('apple');
        if (activeTab === 'SHOPPING') return cat.includes('SHOP') || cat.includes('RETAIL') || c.name.toLowerCase().includes('amazon') || c.name.toLowerCase().includes('walmart') || c.name.toLowerCase().includes('ebay');
        if (activeTab === 'FOOD') return cat.includes('FOOD') || cat.includes('GROCER') || cat.includes('REST');
        return cat.includes(activeTab);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q));
    }
    return result;
  }, [cards, activeTab, searchQuery]);

  const handleOpenPurchaseModal = (card) => {
    setSelectedCard(card);
    setSelectedAmount(card.denominations?.[0] || card.minAmount);
    setCustomAmount('');
    setEmailError('');
    if (!recipientEmail && (beneficiary.email || user?.email)) {
      setRecipientEmail(beneficiary.email || user?.email || '');
    }
  };

  // Auto-open modal if navigated with selectedCardId or initialQuery
  useEffect(() => {
    if (cards.length > 0) {
      if (selectedCardId) {
        const found = cards.find(c => String(c.id) === String(selectedCardId));
        if (found) {
          handleOpenPurchaseModal(found);
          return;
        }
      }
      if (initialQuery) {
        setSearchQuery(initialQuery);
        const match = cards.find(c =>
          c.name.toLowerCase().includes(initialQuery.toLowerCase()) ||
          c.brand.toLowerCase().includes(initialQuery.toLowerCase())
        );
        if (match) {
          handleOpenPurchaseModal(match);
        }
      }
    }
  }, [cards, selectedCardId, initialQuery]);

  const handleShareBuyMe = async () => {
    if (!selectedCard) return;
    const finalAmount = parseFloat(customAmount) || selectedAmount;
    const cardName = selectedCard.name || 'Gift Card';
    const currency = selectedCard.currency || 'USD';
    const shareUrl = `https://dizzitup.com/marketplace?country=${countryCode}&category=gift_cards&q=${encodeURIComponent(cardName)}&provider_id=${selectedCard.id}&buy_me=true`;

    try {
      await Share.share({
        title: t('giftCards.shareBuyMeTitle', `Gift Request: ${cardName}`, { name: cardName }),
        message: t('giftCards.shareBuyMeMsg', `I would love this ${cardName} (${currency} ${finalAmount}) on DizzitUp! You can gift it to me directly here: ${shareUrl}`, {
          name: cardName,
          amount: `${currency} ${finalAmount}`,
          url: shareUrl,
        }),
      });
      setToast({
        title: t('shop.shareSuccessTitle', 'Gift Link Ready'),
        message: t('giftCards.shareSuccessDesc', 'Gift card request link shared successfully.'),
      });
    } catch {
      setToast({
        title: t('shop.shareCopiedTitle', 'Link Copied'),
        message: shareUrl,
      });
    }
  };

  const handleConfirmPurchase = () => {
    if (!selectedCard) return;

    const finalAmount = parseFloat(customAmount) || selectedAmount;
    if (!finalAmount || finalAmount < selectedCard.minAmount) {
      setToast({
        title: t('common.error', 'Error'),
        message: `${t('giftCards.errorMinAmount', 'Minimum amount is')} ${selectedCard.minAmount} ${selectedCard.currency}`,
        type: 'error',
      });
      return;
    }

    const trimmedEmail = (recipientEmail || '').trim();
    if (!trimmedEmail) {
      const err = t('giftCards.errorEmailRequired', 'Please enter a recipient email address for digital code delivery.');
      setEmailError(err);
      setToast({
        title: t('common.error', 'Error'),
        message: err,
        type: 'error',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      const err = t('giftCards.errorEmailInvalid', 'Please enter a valid email address');
      setEmailError(err);
      setToast({
        title: t('common.error', 'Error'),
        message: err,
        type: 'error',
      });
      return;
    }

    setEmailError('');
    const cardToCheckout = selectedCard;
    setSelectedCard(null);

    // Direct handoff into native PayBillsSummaryScreen
    navigation.navigate('PayBillsSummaryScreen', {
      serviceType: 'gift_cards',
      beneficiary: {
        ...beneficiary,
        email: recipientEmail.trim(),
        phone: recipientPhone.trim() || beneficiary.phone,
      },
      provider: {
        id: cardToCheckout.id,
        name: cardToCheckout.name,
        operatorName: cardToCheckout.brand,
        logo: cardToCheckout.logo,
        type: 'GIFT_CARD',
      },
      accountNumber: recipientEmail.trim(),
      plan: {
        amount: finalAmount,
        costAmount: finalAmount,
        price: finalAmount,
        currency: cardToCheckout.currency,
        destinationCurrency: cardToCheckout.currency,
        receiveAmount: finalAmount,
        receiveCurrency: cardToCheckout.currency,
        feeAmount: (finalAmount * 0.02).toFixed(2),
      },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>

        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.screenHeaderTitle}>{t('giftCards.screenHeader', 'Digital Gift Cards')}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.giftBadge}>
              <View style={styles.goldDot} />
              <Text style={styles.giftBadgeText}>{t('giftCards.badge', 'GIFT SERVICES')}</Text>
            </View>

            <Text style={styles.heroTitle}>
              {t('giftCards.titleExplore', 'Explore')} <Text style={styles.heroTitleGold}>{t('giftCards.titleGiftCards', 'Gift Cards')}</Text>
            </Text>

            <Text style={styles.heroSubtitle}>
              {countryName} • {t('giftCards.selectPreference', 'Select your preference')}
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('giftCards.searchPlaceholder', 'Search brands or games...')}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs (ALL / BRAND / CATEGORY) */}
          <View style={styles.tabsRow}>
            {CATEGORIES.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                    {t(tab.labelKey, tab.fallback)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cards Grid */}
          {loading ? (
            <ActivityIndicator size="large" color="#FFC759" style={{ marginTop: 40 }} />
          ) : filteredCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>{t('giftCards.noCardsFound', 'No gift cards found')}</Text>
              <Text style={styles.emptySubtitle}>{t('giftCards.tryAnotherSearch', 'Try a different search term')}</Text>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {filteredCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.cardItem}
                  onPress={() => handleOpenPurchaseModal(card)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardImageContainer}>
                    {card.logo ? (
                      <Image
                        source={{ uri: card.logo }}
                        style={styles.cardImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.cardImage, { backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="gift-outline" size={36} color="#D97706" />
                      </View>
                    )}
                  </View>

                  <View style={styles.cardDetails}>
                    <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                    <Text style={styles.cardBrand} numberOfLines={1}>{card.brand}</Text>
                    <Text style={styles.cardRange}>
                      {card.priceLabel || (card.minAmount === card.maxAmount ? `${card.currency} ${card.minAmount}` : `${card.currency} ${card.minAmount} - ${card.maxAmount}`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </ScrollView>

        {/* Purchase & Denomination Modal */}
        <Modal
          visible={!!selectedCard}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedCard(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismiss} onPress={() => setSelectedCard(null)} />
            {selectedCard && (
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {selectedCard.logo ? (
                      <Image source={{ uri: selectedCard.logo }} style={styles.modalThumb} resizeMode="contain" />
                    ) : (
                      <View style={[styles.modalThumb, { backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="gift-outline" size={24} color="#D97706" />
                      </View>
                    )}
                    <View>
                      <Text style={styles.modalCardName}>{selectedCard.name}</Text>
                      <Text style={styles.modalCardBrand}>{selectedCard.brand}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedCard(null)}>
                    <Ionicons name="close" size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Select Amount Chips */}
                <Text style={styles.modalSectionLabel}>
                  {t('giftCards.selectAmount', 'SELECT AMOUNT')} ({selectedCard.currency})
                </Text>
                <View style={styles.denominationsRow}>
                  {selectedCard.denominations.map((amount) => {
                    const isSelected = selectedAmount === amount && !customAmount;
                    return (
                      <TouchableOpacity
                        key={amount}
                        style={[styles.denominationChip, isSelected && styles.denominationChipActive]}
                        onPress={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.denominationText, isSelected && styles.denominationTextActive]}>
                          {selectedCard.currency} {amount}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Recipient Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalSectionLabel}>{t('giftCards.deliveryEmail', 'DELIVERY EMAIL ADDRESS')}</Text>
                  <TextInput
                    style={[styles.modalInput, !!emailError && styles.modalInputError]}
                    placeholder="user@example.com"
                    placeholderTextColor="#94A3B8"
                    value={recipientEmail}
                    onChangeText={(text) => {
                      setRecipientEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {!!emailError ? (
                    <Text style={styles.inputErrorText}>{emailError}</Text>
                  ) : (
                    <Text style={styles.inputHint}>
                      {t('giftCards.emailHint', 'The digital gift card code will be sent to this email immediately.')}
                    </Text>
                  )}
                </View>

                {/* In-modal Error Banner */}
                {!!emailError && (
                  <View style={styles.modalAlertBox}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.modalAlertText}>{emailError}</Text>
                  </View>
                )}

                {/* Actions: Buy Me & Checkout */}
                <View style={{ gap: 10 }}>
                  <TouchableOpacity
                    style={styles.modalBuyMeBtn}
                    onPress={handleShareBuyMe}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="gift" size={17} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={styles.modalBuyMeBtnText}>
                      {t('giftCards.buyMe', 'Ask a Friend (Buy Me)')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCheckoutBtn}
                    onPress={handleConfirmPurchase}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalCheckoutBtnText}>
                      {t('billDetails.checkout', 'CHECKOUT')} • {selectedCard.currency} {parseFloat(customAmount) || selectedAmount}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>

              </View>
            )}
          </View>
        </Modal>

        {/* Global Screen Toast */}
        <AppToast
          visible={!!toast}
          title={toast?.title}
          message={toast?.message}
          type={toast?.type || 'error'}
          onClose={() => setToast(null)}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 60,
    zIndex: 999,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  screenHeaderTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  giftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  giftBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#B45309',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallDevice ? 24 : 28,
    color: '#1A2840',
    marginBottom: 4,
  },
  heroTitleGold: {
    color: '#FFB800',
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#20365B',
    borderColor: '#20365B',
  },
  tabButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardItem: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  cardImageContainer: {
    height: 100,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  currencyPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(7, 29, 84, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currencyPillText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: '#FFC759',
  },
  cardDetails: {
    padding: 10,
  },
  cardName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 2,
  },
  cardBrand: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  cardRange: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginTop: 10,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  modalThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  modalCardName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  modalCardBrand: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  modalSectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  denominationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  denominationChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  denominationChipActive: {
    backgroundColor: '#FFC759',
    borderColor: '#FFC759',
  },
  denominationText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  denominationTextActive: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#1A2840',
  },
  inputGroup: {
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  inputHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 14,
  },
  modalBuyMeBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBuyMeBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#059669',
    letterSpacing: 0.3,
  },
  modalCheckoutBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#20365B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckoutBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalInputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  inputErrorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    lineHeight: 15,
  },
  modalAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  modalAlertText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#DC2626',
    flex: 1,
    lineHeight: 16,
  },
});
