import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import { useApp } from '../context/AppContext';
import { convertCurrencyAmount } from '../utils/countryCurrencyUtils';
import { getPaymentRailEligibility, COUNTRY_METADATA } from '../services/paymentCorridorService';
import PaymentRegionModal from '../components/PaymentRegionModal';

const BLOCKCHAIN_NETWORKS = [
  {
    id: 'Polygon',
    name: 'Polygon',
    badge: 'PoS',
    tag: 'Rapide & Éco',
    logo: require('../../assets/cryptos/polygon.png'),
    accentColor: '#8247E5',
    lightBg: '#F5F3FF',
  },
  {
    id: 'Base',
    name: 'Base',
    badge: 'L2',
    tag: 'Coinbase L2',
    logo: require('../../assets/cryptos/base.png'),
    accentColor: '#0052FF',
    lightBg: '#EFF6FF',
  },
  {
    id: 'Ethereum',
    name: 'Ethereum',
    badge: 'Mainnet',
    tag: 'L1 Sécurisé',
    logo: require('../../assets/cryptos/ethereum.png'),
    accentColor: '#627EEA',
    lightBg: '#F8FAFC',
  },
  {
    id: 'BNB',
    name: 'BNB Chain',
    badge: 'BSC',
    tag: 'Faibles frais',
    logo: require('../../assets/cryptos/bnb-logo.png'),
    accentColor: '#F3BA2F',
    lightBg: '#FFFBEB',
  },
  {
    id: 'Solana',
    name: 'Solana',
    badge: 'SPL',
    tag: 'Ultra-rapide',
    logo: require('../../assets/cryptos/solana.png'),
    accentColor: '#14F195',
    lightBg: '#ECFDF5',
  },
];

export default function OrderVerificationScreen({ route }) {
  const navigation = useNavigation();
  const { user, cart, updateCartQuantity, removeFromCart, cartMerchant, t, language, userCountry, setUserCountry } = useApp();

  const directOrder = route?.params?.directOrder;

  // Local state if coming from "Acheter maintenant" with single direct item
  const [directItem, setDirectItem] = useState(
    directOrder
      ? {
        id: directOrder.product.id || 'direct_1',
        productId: directOrder.product.id,
        name: directOrder.product.name || directOrder.product.title || t('product.notFound', 'Produit'),
        price:
          typeof directOrder.product.price === 'number'
            ? directOrder.product.price
            : parseFloat(String(directOrder.product.price || '').replace(/[^0-9.]/g, '')) ||
            (directOrder.product.variants?.[0]?.prices?.[0]?.amount
              ? parseFloat(directOrder.product.variants[0].prices[0].amount)
              : 0),
        currency: directOrder.product.currency || 'XOF',
        quantity: directOrder.quantity || 1,
        image:
          directOrder.product.product_images?.[0] ||
          directOrder.product.images?.[0] ||
          directOrder.product.thumbnail ||
          directOrder.product.image ||
          null,
        category: directOrder.product.category || 'Marketplace',
        merchantId: directOrder.shop?.id || directOrder.product?.merchant_id || null,
        merchantName:
          directOrder.shop?.shop_name ||
          directOrder.shop?.name ||
          directOrder.product?.merchant?.shop_name ||
          t('paymentSuccess.partnerMerchant', 'Commerçant Partenaire'),
        merchantCity: directOrder.shop?.city_village || directOrder.product?.merchant?.city_village || '',
        merchantCountry: directOrder.shop?.country || directOrder.product?.merchant?.country || '',
      }
      : null
  );

  // Active items list: cart items take priority if cart has items, otherwise direct item
  const items = useMemo(() => {
    if (cart && cart.length > 0) return cart;
    if (directItem) return [directItem];
    return [];
  }, [cart, directItem]);

  const [deliveryOption, setDeliveryOption] = useState('home'); // 'home', 'pickup'
  const [paymentRail, setPaymentRail] = useState('crypto'); // 'crypto', 'card', 'momo'
  const [selectedToken, setSelectedToken] = useState('USDC'); // 'USDC', 'USDT', 'EURC', 'DZY'
  const [network, setNetwork] = useState('Polygon'); // 'Polygon', 'Base', 'Ethereum', 'Solana'

  // Payer country determination (userCountry from AppContext/IP geolocation -> fallback 'DZ')
  const [payerCountry, setPayerCountry] = useState(() => {
    const raw = (userCountry || user?.country_code || user?.country || 'DZ').toUpperCase().trim();
    return raw.length === 2 ? raw : (raw === 'FRANCE' ? 'FR' : raw === 'MAROC' ? 'MA' : 'DZ');
  });
  const [regionModalVisible, setRegionModalVisible] = useState(false);

  // Sync with userCountry when geolocation resolves asynchronously
  useEffect(() => {
    if (userCountry && typeof userCountry === 'string' && userCountry.length === 2) {
      setPayerCountry(userCountry.toUpperCase());
    }
  }, [userCountry]);

  // Compute rail eligibility based on country and current active language
  const railEligibility = useMemo(() => {
    return getPaymentRailEligibility(payerCountry, 'checkout', language);
  }, [payerCountry, language]);

  // Fallback if current payment rail is disabled for this country (e.g. DZ, FR, US)
  useEffect(() => {
    if (paymentRail === 'momo' && !railEligibility.momo.enabled) {
      setPaymentRail('crypto');
    }
  }, [payerCountry, railEligibility.momo.enabled]);

  // Dynamic currency
  const rawCurrency = items[0]?.currency || directOrder?.product?.currency || 'XOF';
  // Banking / Gateway payload requires official ISO-4217 code (XOF, USD, EUR, NGN, etc.)
  const apiCurrency = rawCurrency === 'FCFA' ? 'XOF' : rawCurrency;
  // User-facing display currency label
  const displayCurrency = rawCurrency === 'XOF' ? 'FCFA' : rawCurrency;
  const numLocale = language === 'en' ? 'en-US' : 'fr-FR';

  // Recipient info
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [recipientName, setRecipientName] = useState(
    user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || ''
  );
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [recipientAddress, setRecipientAddress] = useState(
    user?.address || (user?.city ? `${user.city}${user.country ? ', ' + user.country : ''}` : '')
  );

  // Quantity updates
  const handleIncrement = (item) => {
    if (cart && cart.length > 0) {
      updateCartQuantity(item.productId || item.id, item.quantity + 1);
    } else if (directItem) {
      setDirectItem((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
    }
  };

  const handleDecrement = (item) => {
    if (item.quantity <= 1) {
      handleRemove(item);
      return;
    }
    if (cart && cart.length > 0) {
      updateCartQuantity(item.productId || item.id, item.quantity - 1);
    } else if (directItem) {
      setDirectItem((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
    }
  };

  const handleRemove = (item) => {
    if (cart && cart.length > 0) {
      removeFromCart(item.productId || item.id);
    } else {
      setDirectItem(null);
    }
  };

  // Merchant info
  const merchantName =
    cartMerchant?.name ||
    directOrder?.shop?.shop_name ||
    directOrder?.shop?.name ||
    items[0]?.merchantName ||
    t('paymentSuccess.partnerMerchant', 'Commerçant Partenaire');
  const merchantInitial = (merchantName || 'DZ').slice(0, 2).toUpperCase();
  const merchantLogo =
    directOrder?.shop?.shop_logo_url ||
    directOrder?.shop?.logoUrl ||
    directOrder?.product?.merchant?.shop_logo_url ||
    cartMerchant?.shop_logo_url ||
    cartMerchant?.logoUrl ||
    items[0]?.merchantLogo;

  const merchantLocation = [
    cartMerchant?.city || directOrder?.shop?.city_village || items[0]?.merchantCity,
    cartMerchant?.country || directOrder?.shop?.country || items[0]?.merchantCountry,
  ]
    .filter(Boolean)
    .join(', ') || t('product.partnerPlatform', 'Partenaire DizzitUp');

  // Pricing calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
  }, [items]);

  // Dynamic merchant delivery fee from live buygoods backend
  const merchantObj = directOrder?.shop || directOrder?.product?.merchant || cartMerchant || items[0]?.merchant;
  const rawDeliveryFee = (merchantObj?.delivery_fee !== undefined && merchantObj?.delivery_fee !== null)
    ? Number(merchantObj.delivery_fee)
    : null;

  const standardDeliveryFee = useMemo(() => {
    if (rawDeliveryFee !== null) {
      return rawDeliveryFee > 0 ? convertCurrencyAmount(rawDeliveryFee, merchantObj?.currency || 'XOF', rawCurrency) : 0;
    }
    return 0; // Free delivery if merchant hasn't specified a custom shipping rate
  }, [rawDeliveryFee, merchantObj?.currency, rawCurrency]);

  const deliveryFee = deliveryOption === 'home' ? standardDeliveryFee : 0;

  // Platform network fee (~0.10 USD / ~65 FCFA) converted to transaction currency
  const platformFee = useMemo(() => {
    return convertCurrencyAmount(0.10, 'USD', rawCurrency);
  }, [rawCurrency]);

  const totalAmount = subtotal + deliveryFee + platformFee;

  // Real-time multi-currency crypto conversion (accurate across ALL currencies USD, EUR, XOF, DZD, NGN, etc.)
  const totalAmountInUsd = useMemo(() => {
    return convertCurrencyAmount(totalAmount, rawCurrency, 'USD');
  }, [totalAmount, rawCurrency]);

  const totalUSDC = totalAmountInUsd.toFixed(2);
  const totalUSDT = totalAmountInUsd.toFixed(2);
  const totalDZY = (totalAmountInUsd * 10).toFixed(1); // 1 USD = 10 DZY
  const totalEURC = (totalAmountInUsd / 1.08).toFixed(2);

  // User balance for selected token
  const userBalance = useMemo(() => {
    if (selectedToken === 'DZY') return user?.balanceDZY || 0;
    if (user?.allBalances && user.allBalances[selectedToken]) {
      return parseFloat(user.allBalances[selectedToken]) || 0;
    }
    return 0;
  }, [user, selectedToken]);

  const hasInsufficientBalance = useMemo(() => {
    if (paymentRail !== 'crypto') return false;
    if (selectedToken === 'DZY') return userBalance < parseFloat(totalDZY);
    if (selectedToken === 'EURC') return userBalance < parseFloat(totalEURC);
    return userBalance < parseFloat(totalUSDC);
  }, [paymentRail, selectedToken, userBalance, totalDZY, totalEURC, totalUSDC]);

  const handleProceedToConfirmation = () => {
    if (items.length === 0) {
      AppToast.showError(t('cart.emptyDesc', 'Your cart is empty.'), t('common.error', 'Error'));
      return;
    }

    const orderPayload = {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      merchant: {
        id: cartMerchant?.id || directOrder?.shop?.id || items[0]?.merchantId || null,
        name: merchantName,
        location: merchantLocation,
      },
      items: items.map((i) => ({
        id: i.id,
        productId: i.productId || i.id,
        name: i.name,
        price: i.price,
        currency: displayCurrency,
        quantity: i.quantity,
        image: i.image,
      })),
      deliveryOption,
      deliveryFee,
      platformFee,
      subtotal,
      totalAmount,
      currency: displayCurrency,
      apiCurrency,
      totalUSDC: parseFloat(totalUSDC),
      totalDZY: parseFloat(totalDZY),
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        address: recipientAddress,
      },
      paymentRail,
      payerCountry,
      selectedToken: paymentRail === 'crypto' ? selectedToken : null,
      network: paymentRail === 'crypto' ? network : null,
      createdAt: new Date().toISOString(),
    };

    navigation.navigate('OrderConfirmationScreen', { orderData: orderPayload });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('orderVerification.title', 'Vérification de commande')}</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>{t('cart.emptyTitle', 'Votre panier est vide')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('cart.emptyDesc', 'Ajoutez des articles depuis la boutique pour finaliser votre commande.')}
          </Text>
          <TouchableOpacity style={styles.btnExplore} onPress={() => navigation.goBack()}>
            <Ionicons name="storefront-outline" size={18} color="#1A2840" style={{ marginRight: 8 }} />
            <Text style={styles.btnExploreText}>{t('cart.continueShopping', 'Continuer mes achats')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orderVerification.title', 'Vérification de commande')}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('HelpCenterPage')}>
          <Ionicons name="headset-outline" size={22} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Merchant Banner */}
        <View style={styles.sellerRow}>
          <View style={styles.sellerLogo}>
            {merchantLogo ? (
              <Image source={{ uri: merchantLogo }} style={{ width: 38, height: 38, borderRadius: 19 }} resizeMode="cover" />
            ) : (
              <Text style={styles.sellerLogoText}>{merchantInitial}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.sellerNameRow}>
              <Text style={styles.sellerName} numberOfLines={1}>
                {merchantName}
              </Text>
              <Ionicons name="checkmark-circle" size={15} color="#3B82F6" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.sellerLocationText}>{merchantLocation}</Text>
          </View>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>
              {items.length} {items.length > 1 ? t('orderVerification.articles', 'articles') : t('orderVerification.article', 'article')}
            </Text>
          </View>
        </View>

        {/* Ordered Items List */}
        <View style={styles.itemsSection}>
          {items.map((item, index) => (
            <View key={item.productId || item.id || index} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                ) : (
                  <View style={styles.mockProductImage}>
                    <Ionicons name="cube-outline" size={28} color="#94A3B8" />
                  </View>
                )}
              </View>

              <View style={styles.productInfo}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category || 'Marketplace'}</Text>
                </View>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>
                  {(Number(item.price) || 0).toLocaleString(numLocale)} {displayCurrency}
                </Text>

                <View style={styles.quantityRow}>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrement(item)}>
                      <Ionicons name="remove" size={14} color="#1A2840" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => handleIncrement(item)}>
                      <Ionicons name="add" size={14} color="#1A2840" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.btnRemoveItem} onPress={() => handleRemove(item)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recipient & Delivery Address Card */}
        <View style={styles.addressCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={18} color="#3B82F6" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.sectionLabel}>{t('orderVerification.deliveryAddress', 'Destinataire & Adresse')}</Text>
              <Text style={styles.recipientNameText}>{recipientName}</Text>
              <Text style={styles.addressValue}>
                {recipientPhone} • {recipientAddress}
              </Text>
            </View>
            <TouchableOpacity style={styles.btnModifier} onPress={() => setIsEditingRecipient(!isEditingRecipient)}>
              <Text style={styles.btnModifierText}>
                {isEditingRecipient ? t('common.done', 'Fermer') : t('orderVerification.modify', 'Modifier')}
              </Text>
              <Ionicons
                name={isEditingRecipient ? 'chevron-up' : 'chevron-forward'}
                size={15}
                color="#3B82F6"
              />
            </TouchableOpacity>
          </View>

          {isEditingRecipient && (
            <View style={styles.editRecipientForm}>
              <Text style={styles.formInputLabel}>{t('orderVerification.recipientNameLabel', 'Nom & Prénom du destinataire')}</Text>
              <TextInput
                style={styles.formInput}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder={t('orderVerification.namePlaceholder', 'Ex : Koffi Mensah')}
              />

              <Text style={styles.formInputLabel}>{t('orderVerification.recipientPhoneLabel', 'Numéro de téléphone')}</Text>
              <TextInput
                style={styles.formInput}
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                placeholder={user?.phone || '+228 90 00 00 00'}
                keyboardType="phone-pad"
              />

              <Text style={styles.formInputLabel}>{t('orderVerification.recipientAddressLabel', 'Adresse / Ville de livraison')}</Text>
              <TextInput
                style={styles.formInput}
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                placeholder={t('orderVerification.addressPlaceholder', 'Quartier, Rue, Ville')}
              />
            </View>
          )}
        </View>

        {/* Delivery Options */}
        <View style={styles.deliverySection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="bus-outline" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.sectionLabel}>{t('orderVerification.deliveryOption', 'Mode de livraison')}</Text>
          </View>

          <View style={styles.deliveryOptionsRow}>
            <TouchableOpacity
              style={[styles.deliveryOption, deliveryOption === 'home' && styles.optionSelected]}
              onPress={() => setDeliveryOption('home')}
            >
              <View style={[styles.radioOuter, deliveryOption === 'home' && styles.radioOuterSelected]}>
                {deliveryOption === 'home' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  <Text style={styles.optionTitle}>{t('orderVerification.homeDelivery', 'À domicile')}</Text>
                  {standardDeliveryFee > 0 ? (
                    <Text style={styles.optionPrice}>
                      {standardDeliveryFee.toLocaleString(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {displayCurrency}
                    </Text>
                  ) : (
                    <Text style={[styles.optionPrice, { color: '#10B981' }]}>
                      {t('orderVerification.free', 'Gratuit')}
                    </Text>
                  )}
                </View>
                <Text style={styles.optionDesc}>{t('orderVerification.homeDeliveryDesc', 'Livraison sécurisée sous 24-48h')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deliveryOption, deliveryOption === 'pickup' && styles.optionSelected]}
              onPress={() => setDeliveryOption('pickup')}
            >
              <View style={[styles.radioOuter, deliveryOption === 'pickup' && styles.radioOuterSelected]}>
                {deliveryOption === 'pickup' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  <Text style={styles.optionTitle}>{t('orderVerification.storePickup', 'En boutique')}</Text>
                  <Text style={[styles.optionPrice, { color: '#10B981' }]}>{t('orderVerification.free', 'Gratuit')}</Text>
                </View>
                <Text style={styles.optionDesc}>{t('orderVerification.storePickupDesc', 'Retrait immédiat en boutique')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Rails Selector */}
        <View style={styles.paymentSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="card-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.sectionLabel}>{t('orderVerification.payWith', 'Moyen de paiement')}</Text>
            </View>
            <TouchableOpacity
              style={styles.payerRegionPill}
              onPress={() => setRegionModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.payerRegionFlag}>{railEligibility.countryFlag}</Text>
              <Text style={styles.payerRegionText}>{railEligibility.countryName || payerCountry}</Text>
              <Ionicons name="chevron-down" size={12} color="#64748B" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.railTabsRow}>
            <TouchableOpacity
              style={[styles.railTab, paymentRail === 'crypto' && styles.railTabActive]}
              onPress={() => setPaymentRail('crypto')}
            >
              <Ionicons name="wallet-outline" size={16} color={paymentRail === 'crypto' ? '#1A2840' : '#64748B'} />
              <Text style={[styles.railTabText, paymentRail === 'crypto' && styles.railTabTextActive]}>
                {t('orderVerification.cryptoTab', 'DZY & Stablecoins')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.railTab, paymentRail === 'card' && styles.railTabActive]}
              onPress={() => setPaymentRail('card')}
            >
              <Ionicons name="card-outline" size={16} color={paymentRail === 'card' ? '#1A2840' : '#64748B'} />
              <Text style={[styles.railTabText, paymentRail === 'card' && styles.railTabTextActive]}>
                {t('orderVerification.cardTab', 'Carte Bancaire')}
              </Text>
            </TouchableOpacity>

            {railEligibility.momo.enabled ? (
              <TouchableOpacity
                style={[styles.railTab, paymentRail === 'momo' && styles.railTabActive]}
                onPress={() => setPaymentRail('momo')}
              >
                <Ionicons name="phone-portrait-outline" size={16} color={paymentRail === 'momo' ? '#1A2840' : '#64748B'} />
                <Text style={[styles.railTabText, paymentRail === 'momo' && styles.railTabTextActive]}>
                  {t('orderVerification.momoTab', 'Mobile Money')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.railTab, styles.railTabDisabled]}
                onPress={() => setRegionModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
                <Text style={[styles.railTabText, styles.railTabTextDisabled]}>
                  {t('orderVerification.momoTab', 'Mobile Money')}
                </Text>
                <View style={styles.unavailableMiniDot} />
              </TouchableOpacity>
            )}
          </View>

          {/* Rail 1: Crypto / Stablecoins */}
          {paymentRail === 'crypto' && (
            <View style={styles.cryptoTokenList}>
              {[
                { symbol: 'USDC', name: 'USD Coin', badge: 'ERC20 / Polygon', rate: totalUSDC },
                { symbol: 'USDT', name: 'Tether USD', badge: 'TRC20 / Polygon', rate: totalUSDT },
                { symbol: 'DZY', name: 'DizzitUp Token', badge: 'DIZZITUP', rate: totalDZY },
                { symbol: 'EURC', name: 'Euro Coin', badge: 'ERC20', rate: totalEURC },
              ].map((tok) => (
                <TouchableOpacity
                  key={tok.symbol}
                  style={[styles.paymentMethodItem, selectedToken === tok.symbol && styles.optionSelected]}
                  onPress={() => setSelectedToken(tok.symbol)}
                >
                  <View style={[styles.radioOuter, selectedToken === tok.symbol && styles.radioOuterSelected]}>
                    {selectedToken === tok.symbol && <View style={styles.radioInner} />}
                  </View>
                  <CryptoIcon symbol={tok.symbol} size={32} />
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodNameRow}>
                      <Text style={styles.paymentMethodName}>{tok.symbol}</Text>
                      <View style={styles.networkBadgeBlue}>
                        <Text style={styles.networkBadgeTextBlue}>{tok.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.paymentMethodSub}>{tok.name}</Text>
                  </View>
                  <View style={styles.paymentMethodValues}>
                    <Text style={styles.paymentMethodValueMain}>
                      {tok.rate} {tok.symbol}
                    </Text>
                    <Text style={styles.paymentMethodValueSub}>
                      ≈ {totalAmount.toLocaleString(numLocale)} {displayCurrency}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Blockchain Network Selector */}
              <View style={styles.networkSubSection}>
                <View style={styles.networkHeaderRow}>
                  <View style={styles.networkHeaderLeft}>
                    <Ionicons name="git-network-outline" size={15} color="#3B82F6" style={{ marginRight: 6 }} />
                    <Text style={styles.networkLabel}>{t('orderVerification.blockchainNetwork', 'Réseau Blockchain')}</Text>
                  </View>
                  <View style={styles.networkActiveTag}>
                    <View style={styles.networkActiveDot} />
                    <Text style={styles.networkActiveTagText}>
                      {BLOCKCHAIN_NETWORKS.find((n) => n.id === network)?.name || network}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.networkScroll}
                >
                  {BLOCKCHAIN_NETWORKS.map((net) => {
                    const isSelected = network === net.id;
                    return (
                      <TouchableOpacity
                        key={net.id}
                        style={[
                          styles.networkCard,
                          isSelected && styles.networkCardSelected,
                        ]}
                        onPress={() => setNetwork(net.id)}
                        activeOpacity={0.8}
                      >
                        {/* Network Logo */}
                        <View style={[styles.networkLogoContainer, { backgroundColor: net.lightBg }]}>
                          <Image
                            source={net.logo}
                            style={styles.networkLogoImg}
                            resizeMode="contain"
                          />
                        </View>

                        {/* Name & Badge */}
                        <View style={styles.networkCardInfo}>
                          <View style={styles.networkCardTitleRow}>
                            <Text style={[styles.networkCardTitle, isSelected && styles.networkCardTitleSelected]}>
                              {net.name}
                            </Text>
                            <View style={[styles.networkMiniBadge, isSelected && styles.networkMiniBadgeSelected]}>
                              <Text style={[styles.networkMiniBadgeText, isSelected && styles.networkMiniBadgeTextSelected]}>
                                {net.badge}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.networkCardTag} numberOfLines={1}>
                            {net.tag}
                          </Text>
                        </View>

                        {/* Selection Checkmark */}
                        <View style={[styles.networkRadioIndicator, isSelected && styles.networkRadioIndicatorSelected]}>
                          {isSelected ? (
                            <Ionicons name="checkmark" size={11} color="#1A2840" />
                          ) : (
                            <View style={styles.networkRadioEmpty} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Network Confirmation Note */}
                <View style={styles.networkNoticeRow}>
                  <Ionicons name="shield-checkmark" size={13} color="#10B981" style={{ marginRight: 5 }} />
                  <Text style={styles.networkNoticeText}>
                    {t('orderVerification.escrowDeployed', `Séquestre Escrow vérifié sur ${network}`, { network })}
                  </Text>
                </View>
              </View>

              {hasInsufficientBalance && (
                <View style={styles.balanceWarningCard}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.balanceWarningTitle}>{t('orderVerification.insufficientBalanceTitle', 'Solde insuffisant')}</Text>
                    <Text style={styles.balanceWarningText}>
                      {t('orderVerification.insufficientBalanceDesc', `Votre solde actuel est de ${userBalance} ${selectedToken}. Vous pouvez recharger votre compte ou choisir un autre moyen.`, {
                        balance: userBalance,
                        token: selectedToken
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.btnTopUpMini} onPress={() => navigation.navigate('TopUpScreen')}>
                    <Text style={styles.btnTopUpMiniText}>{t('orderVerification.topUpBtn', 'Recharger')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Rail 2: Card Payment */}
          {paymentRail === 'card' && (
            <View style={styles.railDetailCard}>
              <View style={styles.cardLogosRow}>
                <View style={styles.cardLogoPill}>
                  <Ionicons name="card" size={20} color="#1A2840" />
                  <Text style={styles.cardLogoText}>{t('orderVerification.cardVisaMc', 'Visa & Mastercard')}</Text>
                </View>
                <View style={styles.verifiedBadgeRow}>
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                  <Text style={styles.verifiedBadgeText}>{t('orderVerification.cardCyberSource', 'CyberSource 3D Secure')}</Text>
                </View>
              </View>
              <Text style={styles.railDetailDesc}>
                {t('orderVerification.cardDesc', 'Paiement direct et sécurisé par carte bancaire internationale via la passerelle Ecobank CyberSource. Aucun frais caché.')}
              </Text>
            </View>
          )}

          {/* Rail 3: Mobile Money */}
          {paymentRail === 'momo' && (
            railEligibility.momo.enabled ? (
              <View style={styles.railDetailCard}>
                <View style={styles.cardLogosRow}>
                  <View style={[styles.cardLogoPill, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                    <Ionicons name="phone-portrait" size={18} color="#D97706" />
                    <Text style={[styles.cardLogoText, { color: '#B45309' }]}>
                      {railEligibility.momo.operators.length > 0
                        ? railEligibility.momo.operators.slice(0, 3).join(', ')
                        : t('orderVerification.momoInstant', 'MoMo Instantané')}
                    </Text>
                  </View>
                  <View style={styles.verifiedBadgeRow}>
                    <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                    <Text style={styles.verifiedBadgeText}>
                      {railEligibility.momo.providers.join(' • ') || 'Sécurisé'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.railDetailDesc}>
                  {t(
                    'paymentRails.momoActiveDesc',
                    `Payez instantanément avec ${railEligibility.momo.operators.join(', ')} en ${railEligibility.countryName}.`,
                    { operators: railEligibility.momo.operators.join(', '), country: railEligibility.countryName }
                  )}
                </Text>
              </View>
            ) : (
              /* Grayed-out Disabled Card for Unsupported Country */
              <TouchableOpacity
                style={styles.railDetailCardDisabled}
                onPress={() => setRegionModalVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.cardLogosRow}>
                  <View style={styles.disabledBadgeRow}>
                    <Ionicons name="lock-closed" size={15} color="#64748B" style={{ marginRight: 5 }} />
                    <Text style={styles.disabledBadgeText}>
                      {t('paymentRails.unavailableInCountry', `Indisponible en/au ${railEligibility.countryName}`, {
                        country: railEligibility.countryName,
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.btnSwitchCountryMini}
                    onPress={() => setRegionModalVisible(true)}
                  >
                    <Text style={styles.btnSwitchCountryMiniText}>
                      {t('paymentRails.switchCountry', 'Changer de pays')}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color="#1D4ED8" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.railDisabledDesc}>
                  {t(
                    'paymentRails.momoUnavailableExplanation',
                    `Le paiement Mobile Money n'est pas disponible pour ${railEligibility.countryName}. Il est actif dans 20 pays d'Afrique (Bénin, Côte d'Ivoire, Sénégal, Togo, Cameroun, Kenya...).`,
                    { country: railEligibility.countryName }
                  )}
                </Text>
                <View style={styles.disabledAlternativeRow}>
                  <Ionicons name="arrow-forward-circle-outline" size={14} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.disabledAlternativeText}>
                    {t('paymentRails.suggestAlternative', 'Sélectionnez Carte Bancaire ou Crypto (USDC/USDT) ci-dessus.')}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionLabel}>{t('orderVerification.orderSummary', 'Récapitulatif des coûts')}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('orderVerification.subtotal', 'Sous-total articles')}</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {displayCurrency}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('orderVerification.delivery', 'Frais de livraison')}</Text>
            <Text style={[styles.summaryValue, deliveryFee === 0 && { color: '#10B981', fontFamily: 'Inter_700Bold' }]}>
              {deliveryFee > 0 ? `${deliveryFee.toLocaleString(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${displayCurrency}` : t('orderVerification.free', 'Gratuit')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.summaryLabel}>{t('orderVerification.networkFeeEst', 'Frais de plateforme / Réseau')}</Text>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.summaryValue}>{platformFee.toLocaleString(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {displayCurrency} (≈ 0.10 USDC)</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('orderVerification.youWillPay', 'Total à payer')}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalValueMain}>
                {paymentRail === 'crypto'
                  ? selectedToken === 'DZY'
                    ? `${totalDZY} DZY`
                    : selectedToken === 'EURC'
                      ? `${totalEURC} EURC`
                      : `${totalUSDC} ${selectedToken}`
                  : `${totalAmount.toLocaleString(numLocale)} ${displayCurrency}`}
              </Text>
              <Text style={styles.totalValueSub}>
                {paymentRail === 'crypto'
                  ? `≈ ${totalAmount.toLocaleString(numLocale)} ${displayCurrency}`
                  : `≈ ${totalUSDC} USDC`}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>{t('orderVerification.securePaymentTitle', 'Paiement sous Séquestre Escrow')}</Text>
            <Text style={styles.securityDesc}>{t('orderVerification.securityDesc', 'Vos fonds sont protégés jusqu\'à confirmation de livraison.')}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnContinue} onPress={handleProceedToConfirmation}>
          <Text style={styles.btnContinueText}>{t('orderVerification.continueBtn', 'Continuer')}</Text>
          <Ionicons name="chevron-forward" size={18} color="#1A2840" />
        </TouchableOpacity>

        {/* Payment Region Switcher Modal */}
        <PaymentRegionModal
          visible={regionModalVisible}
          onClose={() => setRegionModalVisible(false)}
          currentCountryCode={payerCountry}
          onSelectCountry={(code) => {
            setPayerCountry(code);
            if (setUserCountry) setUserCountry(code);
          }}
          onSelectAlternativeMethod={(method) => setPaymentRail(method)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    paddingHorizontal: 16,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  sellerLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1A2840',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sellerLogoText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#FFB800',
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  sellerLocationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemCountText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  itemsSection: {
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  mockProductImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#8B5CF6',
  },
  productTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    paddingHorizontal: 8,
  },
  btnRemoveItem: {
    padding: 6,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addressInfo: {
    flex: 1,
  },
  sectionLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  recipientNameText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginTop: 2,
  },
  addressValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  btnModifier: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnModifierText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#3B82F6',
    marginRight: 2,
  },
  editRecipientForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  formInputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    marginTop: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  deliverySection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  optionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  optionPrice: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#1A2840',
  },
  optionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  paymentSection: {
    marginBottom: 16,
  },
  railTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 4,
  },
  railTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  railTabActive: {
    backgroundColor: '#FFB800',
  },
  railTabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  railTabTextActive: {
    color: '#1A2840',
    fontFamily: 'Inter_700Bold',
  },
  cryptoTokenList: {
    marginTop: 4,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 10,
  },
  paymentMethodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginRight: 6,
  },
  networkBadgeBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  networkBadgeTextBlue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#3B82F6',
  },
  paymentMethodSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  paymentMethodValues: {
    alignItems: 'flex-end',
  },
  paymentMethodValueMain: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  paymentMethodValueSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
  },
  networkSubSection: {
    marginTop: 10,
    marginBottom: 8,
  },
  networkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  networkHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  networkActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  networkActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  networkActiveTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#065F46',
  },
  networkScroll: {
    paddingVertical: 4,
    gap: 10,
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 142,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  networkCardSelected: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FFB800',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  networkLogoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  networkLogoImg: {
    width: 20,
    height: 20,
  },
  networkCardInfo: {
    flex: 1,
    marginRight: 8,
  },
  networkCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  networkCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#334155',
  },
  networkCardTitleSelected: {
    color: '#1A2840',
  },
  networkMiniBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  networkMiniBadgeSelected: {
    backgroundColor: '#FEF3C7',
  },
  networkMiniBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8.5,
    color: '#64748B',
  },
  networkMiniBadgeTextSelected: {
    color: '#92400E',
  },
  networkCardTag: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  networkRadioIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkRadioIndicatorSelected: {
    backgroundColor: '#FFB800',
    borderColor: '#FFB800',
  },
  networkRadioEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  networkNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  networkNoticeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#059669',
  },
  balanceWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  balanceWarningTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#DC2626',
  },
  balanceWarningText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 15,
  },
  btnTopUpMini: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginLeft: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  btnTopUpMiniText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  railDetailCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
  },
  cardLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLogoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  cardLogoText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#10B981',
  },
  railDetailDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  totalValueMain: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 2,
  },
  totalValueSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  securityInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  securityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#065F46',
  },
  securityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#047857',
    marginTop: 1,
  },
  btnContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 13,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  btnContinueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13.5,
    color: '#1A2840',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  btnExplore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnExploreText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  payerRegionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  payerRegionFlag: {
    fontSize: 13,
    marginRight: 4,
  },
  payerRegionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  railTabDisabled: {
    backgroundColor: '#F8FAFC',
    opacity: 0.65,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  railTabTextDisabled: {
    color: '#94A3B8',
    fontFamily: 'Inter_500Medium',
  },
  unavailableMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginLeft: 3,
  },
  railDetailCardDisabled: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 14,
    opacity: 0.9,
  },
  disabledBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  disabledBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#475569',
  },
  btnSwitchCountryMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  btnSwitchCountryMiniText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1D4ED8',
    marginRight: 2,
  },
  railDisabledDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginVertical: 6,
  },
  disabledAlternativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  disabledAlternativeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#065F46',
  },
});
