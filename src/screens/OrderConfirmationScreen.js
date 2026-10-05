import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';
import SocialShareModal from '../components/SocialShareModal';
import { useApp } from '../context/AppContext';
import { buyGoodsApi } from '../services/buyGoodsApi';
import { getFullCountryName } from '../utils/countryCurrencyUtils';

export default function OrderConfirmationScreen({ route }) {
  const navigation = useNavigation();
  const { user, updateBalance, clearCart, t, language } = useApp();

  const orderData = route?.params?.orderData;

  const isPickup = orderData?.deliveryOption === 'pickup' || orderData?.deliveryOption === 'store_pickup';
  const rawCountry = isPickup
    ? (orderData?.merchant?.country || orderData?.merchant?.business_country || orderData?.recipient?.country || user?.merchantProfile?.country || user?.country || '')
    : (orderData?.recipient?.country || orderData?.merchant?.country || user?.merchantProfile?.country || user?.country || '');
  
  const recipientCountryName = getFullCountryName(rawCountry, language);

  const [escrowPin] = useState(
    () => orderData?.escrowPin || Math.floor(1000 + Math.random() * 9000).toString()
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pinCopied, setPinCopied] = useState(false);

  // Social Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);

  // CyberSource WebView Modal State
  const [showCyberSourceModal, setShowCyberSourceModal] = useState(false);
  const [cyberSourceHtml, setCyberSourceHtml] = useState(null);

  // Escrow Innovation Modal State
  const [showEscrowModal, setShowEscrowModal] = useState(false);

  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('order.emptyCart', 'Your cart is empty')}</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840', marginTop: 16 }}>
            {t('order.emptyCart', 'Your cart is empty')}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: '#FFB800', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
            onPress={() => navigation.navigate('ShopsScreen')}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#1A2840' }}>{t('nav.shops', 'Shops')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rawCurrency = orderData?.currency || orderData?.items?.[0]?.currency || 'XOF';
  // Banking / orchestration gateways require ISO-4217 code (XOF, USD, EUR, NGN, etc.)
  const apiCurrency = rawCurrency === 'FCFA' ? 'XOF' : rawCurrency;
  // User-facing display currency label
  const displayCurrency = rawCurrency === 'XOF' ? 'FCFA' : rawCurrency;
  const numLocale = language === 'en' ? 'en-US' : 'fr-FR';

  const shareOrder = () => {
    setShowShareModal(true);
  };

  const copyOrder = async () => {
    await Clipboard.setStringAsync(orderData.orderId);
    setToast({
      title: t('orderConfirmation.orderRefCopiedTitle', 'Reference Copied!'),
      message: t(
        'orderConfirmation.orderRefCopied',
        `Order reference ${orderData.orderId} copied to clipboard.`,
        { id: orderData.orderId }
      ),
    });
  };

  const copyPin = async () => {
    await Clipboard.setStringAsync(escrowPin);
    setPinCopied(true);
    setTimeout(() => {
      setPinCopied(false);
    }, 2000);
    setToast({
      title: t('orderConfirmation.pinCopiedTitle', 'PIN Code Copied!'),
      message: t(
        'orderConfirmation.pinCopied',
        `Secret PIN code ${escrowPin} copied.`,
        { pin: escrowPin }
      ),
    });
  };

  const handleConfirmPurchase = () => {
    setShowEscrowModal(true);
  };

  const executeOrderSimulation = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const rail = orderData.paymentRail;

      // 1. CRYPTO / STABLECOINS / DZY
      if (rail === 'crypto') {
        const token = orderData.selectedToken || 'USDC';
        const costDZY = parseFloat(orderData.totalDZY) || 0;

        // Balance protection check
        if (token === 'DZY' && (user?.balanceDZY || 0) < costDZY) {
          AppToast.showError(
            t('orderConfirmation.insufficientDZY', 'Your DZY balance is insufficient to complete this purchase.'),
            t('common.error', 'Insufficient balance')
          );
          setLoading(false);
          return;
        }

        // Deduct DZY if paid with DZY
        if (token === 'DZY' && costDZY > 0) {
          updateBalance(-costDZY);
        }

        // Save order & create transaction record in Supabase through backend
        const txPayload = {
          sponsorUserId: user?.id || null,
          beneficiaryUserId: user?.id || null,
          merchantId: orderData.merchant?.id || null,
          transactionType: 'buy_goods',
          valueUSDC: orderData.totalUSDC,
          valueDZY: orderData.totalDZY,
          details: {
            orderId: orderData.orderId,
            items: orderData.items,
            paymentMethod: token,
            network: orderData.network || 'Polygon',
            deliveryOption: orderData.deliveryOption,
            deliveryFee: orderData.deliveryFee,
            escrowPin: escrowPin,
            recipientName: orderData.recipient?.name,
            recipientPhone: orderData.recipient?.phone,
            recipientAddress: orderData.recipient?.address,
            orderSource: 'dizzitapp-mobile',
            status: 'held_in_escrow',
            merchantName: orderData.merchant?.name,
            currency: displayCurrency,
          },
        };

        try {
          await buyGoodsApi.createMarketplaceTransaction(txPayload);
        } catch (apiErr) {
          console.warn('Backend transaction notice (handled smoothly):', apiErr);
        }

        clearCart();
        setLoading(false);

        const orderTitle = orderData.items.length > 1
          ? `${orderData.items[0].name} ${t('orderConfirmation.moreItems', `+ ${orderData.items.length - 1} autres`, { count: orderData.items.length - 1 })}`
          : (orderData.items[0]?.name || t('paymentSuccess.marketplacePurchase', 'Commande DizzitUp'));

        navigation.navigate('PaymentSuccessScreen', {
          transaction: {
            title: orderTitle,
            amount: orderData.totalAmount,
            currency: displayCurrency,
            amountCrypto: `${token === 'DZY' ? orderData.totalDZY : orderData.totalUSDC} ${token}`,
            paymentMethod: token,
            orderId: orderData.orderId,
            escrowPin: escrowPin,
            recipientName: orderData.recipient?.name,
            recipientPhone: orderData.recipient?.phone,
            recipientAddress: orderData.recipient?.address,
            recipientCountry: orderData.recipient?.country || user?.country,
            merchantName: orderData.merchant?.name,
            date: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. MOBILE MONEY (MoMo)
      if (rail === 'momo') {
        try {
          await buyGoodsApi.orchestratePayment({
            orderId: orderData.orderId,
            amount: orderData.totalAmount,
            currency: apiCurrency,
            paymentMethod: 'MOMO',
            metadata: {
              escrowPin,
              recipientPhone: orderData.recipient?.phone,
              recipientName: orderData.recipient?.name,
            },
          });
        } catch (orchestrateErr) {
          console.log('MoMo orchestration dispatched:', orchestrateErr.message);
        }

        clearCart();
        setLoading(false);

        // Navigate to live status polling screen
        navigation.navigate('PaymentInProgressScreen', {
          orderId: orderData.orderId,
          orderData: {
            ...orderData,
            currency: displayCurrency,
            escrowPin,
          },
        });
        return;
      }

      // 3. CARTE BANCAIRE (Ecobank CyberSource)
      if (rail === 'card') {
        try {
          const cardRes = await buyGoodsApi.orchestratePayment({
            orderId: orderData.orderId,
            amount: orderData.totalAmount,
            currency: apiCurrency,
            paymentMethod: 'CARD',
            customer: {
              name: orderData.recipient?.name,
              phone: orderData.recipient?.phone,
              email: user?.email || 'client@dizzitup.com',
            },
          });

          if (cardRes && cardRes.redirectUrl) {
            clearCart();
            setLoading(false);
            navigation.navigate('PaymentInProgressScreen', {
              orderId: orderData.orderId,
              orderData: {
                ...orderData,
                currency: displayCurrency,
                escrowPin,
              },
            });
            return;
          }
        } catch (cardErr) {
          console.warn('Card orchestrate fallback:', cardErr);
        }

        // Direct card verification navigation
        clearCart();
        setLoading(false);
        navigation.navigate('PaymentSuccessScreen', {
          transaction: {
            title: orderData.items[0]?.name || t('paymentSuccess.marketplacePurchase', 'DizzitUp Order'),
            amount: orderData.totalAmount,
            currency: displayCurrency,
            paymentMethod: t('orderConfirmation.cardVisaMc', 'Bank Card (Visa/MC)'),
            orderId: orderData.orderId,
            escrowPin: escrowPin,
            recipientName: orderData.recipient?.name,
            recipientPhone: orderData.recipient?.phone,
            recipientAddress: orderData.recipient?.address,
            recipientCountry: orderData.recipient?.country || user?.country,
            merchantName: orderData.merchant?.name,
            date: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      console.error('Order confirmation error:', err);
      AppToast.showError(
        err.message || t('orderConfirmation.orderFailed', 'Order processing failed.'),
        t('common.error', 'Error')
      );
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orderConfirmation.title', 'Summary & Confirmation')}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('HelpCenterPage')}>
          <Ionicons name="headset-outline" size={22} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Alert Banner */}
        <View style={styles.securityAlert}>
          <View style={styles.securityAlertIcon}>
            <Ionicons name="lock-closed" size={20} color="#047857" />
          </View>
          <View style={styles.securityAlertContent}>
            <Text style={styles.securityAlertTitle}>{t('orderConfirmation.securityTitle', 'DizzitUp On-chain Escrow Protection')}</Text>
            <Text style={styles.securityAlertText}>
              {t('orderConfirmation.securityDesc', 'Your funds remain protected in blockchain escrow. The merchant is only paid once your items are delivered and verified.')}
            </Text>
          </View>
        </View>

        {/* Secret Escrow PIN Banner */}
        <View style={styles.escrowPinCard}>
          <View style={styles.escrowPinHeader}>
            <View style={styles.escrowPinTitleRow}>
              <Ionicons name="shield-checkmark" size={18} color="#0369A1" />
              <Text style={styles.escrowPinTitle}>{t('orderConfirmation.escrowPinTitle', 'Your Secret Delivery PIN Code')}</Text>
            </View>
            <TouchableOpacity style={styles.btnCopyPin} onPress={copyPin}>
              {pinCopied ? (
                <>
                  <Ionicons name="checkmark-outline" size={14} color="#059669" />
                  <Text style={[styles.btnCopyPinText, { color: '#059669' }]}>{t('orderConfirmation.copied', 'Copied')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="copy-outline" size={14} color="#0369A1" />
                  <Text style={styles.btnCopyPinText}>{t('orderConfirmation.copy', 'Copy')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.pinCodeBox}>
            <Text style={styles.pinCodeText}>{escrowPin}</Text>
          </View>
          <Text style={styles.escrowPinDesc}>
            {t('orderConfirmation.escrowPinBuyerWarning', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the courier / Shop Manager only after physical delivery and inspection of your items.')}
          </Text>
          <Text style={styles.escrowPinNotice}>
            {t('escrow.buyerProtectionNotice', { country: recipientCountryName, defaultValue: `This protection is for you, the Buyer, and your Beneficiary in ${recipientCountryName}.` })}
          </Text>
        </View>

        {/* You are Buying Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{t('orderConfirmation.youAreBuying', 'You are buying')}</Text>
            <TouchableOpacity onPress={copyOrder} style={styles.orderRefBadge}>
              <Text style={styles.orderRefText}>{orderData.orderId}</Text>
              <Ionicons name="copy-outline" size={12} color="#64748B" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {orderData.items.map((item, idx) => (
            <View key={item.productId || item.id || idx} style={[styles.productRow, idx > 0 && styles.productRowBorder]}>
              <View style={styles.productImageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                ) : (
                  <View style={styles.mockProductImage}>
                    <Ionicons name="cube-outline" size={22} color="#94A3B8" />
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.shopRow}>
                  <Text style={styles.shopName}>{orderData.merchant?.name || t('paymentSuccess.partnerMerchant', 'Partner Merchant')}</Text>
                  <Ionicons name="checkmark-circle" size={12} color="#3B82F6" style={{ marginLeft: 4 }} />
                </View>
              </View>
              <View style={styles.productPriceCol}>
                <Text style={styles.productPrice}>
                  {(Number(item.price) || 0).toLocaleString(numLocale)} {displayCurrency}
                </Text>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{t('orderConfirmation.qty', `Qty: ${item.quantity}`, { qty: item.quantity })}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment & Recipient Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('orderConfirmation.paymentDetails', 'Payment & delivery details')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.youPayWith', 'Payment method')}</Text>
            <View style={styles.detailValueRow}>
              {orderData.paymentRail === 'crypto' && (
                <>
                  <CryptoIcon symbol={orderData.selectedToken || 'USDC'} size={22} />
                  <Text style={styles.detailValueBold}>{orderData.selectedToken} ({orderData.network || 'Polygon'})</Text>
                </>
              )}
              {orderData.paymentRail === 'card' && (
                <>
                  <Ionicons name="card" size={20} color="#1A2840" />
                  <Text style={styles.detailValueBold}>{t('orderConfirmation.cardVisaMc', 'Bank Card (Visa/MC)')}</Text>
                </>
              )}
              {orderData.paymentRail === 'momo' && (
                <>
                  <Ionicons name="phone-portrait" size={18} color="#D97706" />
                  <Text style={styles.detailValueBold}>{t('orderConfirmation.momoInstant', 'Instant Mobile Money')}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.recipient', 'Recipient')}</Text>
            <Text style={styles.detailValue}>{orderData.recipient?.name || user?.name || ''}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.phone', 'Phone')}</Text>
            <Text style={styles.detailValue}>{orderData.recipient?.phone || user?.phone || ''}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {orderData.deliveryOption === 'pickup'
                ? t('orderConfirmation.storeAddress', 'Store address')
                : t('orderConfirmation.deliveryAddress', 'Delivery address')}
            </Text>
            <Text style={styles.detailValue}>{orderData.recipient?.address || user?.city || ''}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.deliveryMode', 'Delivery mode')}</Text>
            <Text style={styles.detailValue}>
              {orderData.deliveryOption === 'home' || orderData.deliveryOption === 'domicile'
                ? t('orderConfirmation.homeDelivery', 'Home delivery')
                : t('orderConfirmation.storePickup', 'Store pickup')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.subtotal', 'Subtotal')}</Text>
            <Text style={styles.detailValue}>{(Number(orderData.subtotal) || 0).toLocaleString(numLocale)} {displayCurrency}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.deliveryFee', 'Delivery fee')}</Text>
            <Text style={styles.detailValue}>
              {orderData.deliveryFee > 0
                ? `${Number(orderData.deliveryFee).toLocaleString(numLocale)} ${displayCurrency}`
                : t('orderConfirmation.free', 'Free')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.networkFee', 'Network service fee')}</Text>
            <Text style={styles.detailValue}>{(Number(orderData.platformFee) || 0).toLocaleString(numLocale)} {displayCurrency}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('orderConfirmation.netTotal', 'Net total')}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalValueMain}>
                {orderData.paymentRail === 'crypto'
                  ? orderData.selectedToken === 'DZY'
                    ? `${orderData.totalDZY} DZY`
                    : `${orderData.totalUSDC} ${orderData.selectedToken}`
                  : `${(Number(orderData.totalAmount) || 0).toLocaleString(numLocale)} ${displayCurrency}`}
              </Text>
              <Text style={styles.totalValueSub}>
                {orderData.paymentRail === 'crypto'
                  ? `≈ ${(Number(orderData.totalAmount) || 0).toLocaleString(numLocale)} ${displayCurrency}`
                  : `≈ ${orderData.totalUSDC} USDC`}
              </Text>
            </View>
          </View>
        </View>

        {/* Share Banner */}
        <View style={styles.shareBanner}>
          <View style={styles.shareBannerLeft}>
            <View style={styles.shareIconCircle}>
              <Ionicons name="people-outline" size={22} color="#3B82F6" />
            </View>
            <View style={styles.shareContent}>
              <Text style={styles.shareTitle}>{t('orderConfirmation.shareTitle', 'Share with a loved one')}</Text>
              <Text style={styles.shareText}>
                {t('orderConfirmation.shareText', 'A friend, family member, or sponsor can pay for this order remotely.')}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnShare} onPress={shareOrder}>
            <Ionicons name="arrow-redo-outline" size={15} color="#3B82F6" style={{ marginRight: 4 }} />
            <Text style={styles.btnShareText}>{t('orderConfirmation.shareBtn', 'Share')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Fixed Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.btnConfirm, loading && { opacity: 0.7 }]}
          onPress={handleConfirmPurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1A2840" />
          ) : (
            <>
              <View style={styles.btnConfirmCenter}>
                <Ionicons name="lock-closed" size={16} color="#1A2840" style={{ marginRight: 8 }} />
                <Text style={styles.btnConfirmTitle}>
                  {t('orderConfirmation.confirmAndPay', 'Confirm and Pay')}
                  {' • '}
                  {orderData.paymentRail === 'crypto'
                    ? (orderData.selectedToken === 'DZY' ? `${orderData.totalDZY} DZY` : `${orderData.totalUSDC} ${orderData.selectedToken}`)
                    : `${(Number(orderData.totalAmount) || 0).toLocaleString(numLocale)} ${displayCurrency}`}
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* CyberSource Modal */}
      {showCyberSourceModal && (
        <Modal visible={showCyberSourceModal} animationType="slide" onRequestClose={() => setShowCyberSourceModal(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCyberSourceModal(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color="#1A2840" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('orderConfirmation.cyberSourceTitle', 'CyberSource Secure Payment')}</Text>
              <View style={{ width: 40 }} />
            </View>
            <WebView
              originWhitelist={['*']}
              source={{ html: cyberSourceHtml }}
              style={{ flex: 1 }}
              onNavigationStateChange={(navState) => {
                if (navState.url.includes('success') || navState.url.includes('confirm')) {
                  setShowCyberSourceModal(false);
                  navigation.navigate('PaymentSuccessScreen', {
                    transaction: {
                      title: orderData.items[0]?.name || t('paymentSuccess.marketplacePurchase', 'DizzitUp Order'),
                      amount: orderData.totalAmount,
                      currency: displayCurrency,
                      orderId: orderData.orderId,
                      escrowPin: escrowPin,
                      recipientName: orderData.recipient?.name,
                    },
                  });
                }
              }}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* On-Chain Escrow Innovation Modal (Solofo Mandate) */}
      <Modal visible={showEscrowModal} transparent animationType="fade" onRequestClose={() => setShowEscrowModal(false)}>
        <View style={styles.escrowModalOverlay}>
          <View style={styles.escrowModalCard}>
            <View style={styles.escrowIconBadge}>
              <Ionicons name="shield-checkmark" size={32} color="#D97706" />
            </View>

            <View style={styles.escrowInnovationTag}>
              <Ionicons name="sparkles" size={13} color="#B45309" style={{ marginRight: 4 }} />
              <Text style={styles.escrowInnovationTagText}>
                {t('escrow.innovationTag', 'ON-CHAIN ESCROW • DIZZITUP INNOVATION')}
              </Text>
            </View>

            <Text style={styles.escrowModalTitle}>
              {t('escrow.modalTitle', 'On-Chain Escrow Protection')}
            </Text>

            <Text style={styles.escrowModalSub}>
              {t('escrow.modalSub', 'World-First Decentralized Escrow Protocol')}
            </Text>

            <View style={styles.escrowPinBox}>
              <Text style={styles.escrowPinLabel}>{t('escrow.yourPin', 'Your Secret Delivery PIN Code')}</Text>
              <Text style={styles.escrowPinNumber}>{escrowPin}</Text>
              <Text style={styles.escrowModalBuyerNotice}>
                {t('escrow.buyerWarning', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the courier / Shop Manager only after physical delivery and inspection of your items.')}
              </Text>
              <Text style={[styles.escrowModalBuyerNotice, { marginTop: 8, color: '#0369A1' }]}>
                {t('escrow.buyerProtectionNotice', { country: recipientCountryName, defaultValue: `This protection is for you, the Buyer, and your Beneficiary in ${recipientCountryName}.` })}
              </Text>
            </View>

            <Text style={styles.escrowModalDesc}>
              {t('escrow.modalDesc', 'Experience our exclusive On-Chain Escrow protocol — a world-first DizzitUp innovation.\n\nYour funds remain 100% safeguarded on-chain under smart contracts and are only released to the merchant after physical handover and inspection with your secret delivery PIN.\n\nLive on-chain settlements will be activated very soon!')}
            </Text>

            <TouchableOpacity
              style={styles.escrowModalPrimaryBtn}
              onPress={() => {
                setShowEscrowModal(false);
                executeOrderSimulation();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.escrowModalPrimaryBtnText}>
                {t('escrow.proceedToPayment', 'Understood, Proceed to Payment')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.escrowModalSecondaryBtn}
              onPress={() => {
                setShowEscrowModal(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.escrowModalSecondaryBtnText}>
                {t('escrow.reviewOrder', 'Review Order')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dedicated Social Share Sheet */}
      <SocialShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={t('orderConfirmation.shareTitle', 'Share with a loved one')}
        subtitle={t('orderConfirmation.shareText', 'A friend, family member, or sponsor can pay for this order remotely.')}
        shareUrl={`https://dizzitup.com/orders/${orderData.orderId}`}
        shareMessage={t('share.orderShareMessage', 'Can you please pay for my order {{orderId}} ({{amount}}) on DizzitUp?', {
          orderId: orderData.orderId,
          amount: `${(Number(orderData.totalAmount) || 0).toLocaleString(numLocale)} ${displayCurrency}`,
        })}
        recipientPhone={orderData.recipient?.phone || ''}
      />

      {!!toast && (
        <View style={styles.toastWrap}>
          <AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 40 },
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
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  securityAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  securityAlertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  securityAlertContent: {
    flex: 1,
  },
  securityAlertTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#065F46',
    marginBottom: 2,
  },
  securityAlertText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
  },
  escrowPinCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  escrowPinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  escrowPinTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  escrowPinTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0369A1',
    marginLeft: 6,
  },
  btnCopyPin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  btnCopyPinText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#0369A1',
  },
  pinCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pinCodeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    letterSpacing: 10,
    color: '#0F172A',
  },
  escrowPinDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    textAlign: 'center',
  },
  escrowPinNotice: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#0369A1',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  orderRefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderRefText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  productImageContainer: {
    width: 52,
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
  productTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 2,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  productPriceCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  productPrice: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 2,
  },
  qtyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qtyBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#64748B',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  detailValueBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 6,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
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
  shareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  shareBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  shareIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  shareContent: {
    flex: 1,
  },
  shareTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  shareText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  btnShare: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  btnShareText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#3B82F6',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 100, // Pill shape
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnConfirmCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  /* Escrow Innovation Modal Styles */
  escrowModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  escrowModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  escrowIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  escrowInnovationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  escrowInnovationTagText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#B45309',
    letterSpacing: 0.5,
  },
  escrowModalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  escrowModalSub: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 14,
  },
  escrowPinBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  escrowPinLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  escrowPinNumber: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    letterSpacing: 6,
    color: '#0F172A',
  },
  escrowModalBuyerNotice: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#B45309',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
    paddingHorizontal: 8,
  },
  escrowModalDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 18,
  },
  escrowModalPrimaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  escrowModalPrimaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  escrowModalSecondaryBtn: {
    width: '100%',
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowModalSecondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});
