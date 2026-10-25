import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
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
import ScreenFooter from '../components/ScreenFooter';
import SocialShareModal from '../components/SocialShareModal';
import { useApp } from '../context/AppContext';
import { buyGoodsApi } from '../services/buyGoodsApi';
import { getFullCountryName } from '../utils/countryCurrencyUtils';
import { isPhysicalCart } from '../utils/productUtils';
import { useWallet } from '@crossmint/client-sdk-react-native-ui';
import { getWalletIdentity } from '../utils/walletIdentity';
import { normalizeChainName } from '../config/tokensByChain';

export default function OrderConfirmationScreen({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, session, updateBalance, clearCart, t, language } = useApp();
  const { getWallet } = useWallet();

  const orderData = route?.params?.orderData;

  const isPickup = orderData?.deliveryOption === 'pickup' || orderData?.deliveryOption === 'store_pickup';
  const isPhysical = isPhysicalCart(orderData?.items || [orderData]);
  const rawCountry = isPickup
    ? (orderData?.merchant?.country || orderData?.merchant?.business_country || orderData?.recipient?.country || user?.merchantProfile?.country || user?.country || '')
    : (orderData?.recipient?.country || orderData?.merchant?.country || user?.merchantProfile?.country || user?.country || '');
  
  const recipientCountryName = getFullCountryName(rawCountry, language);

  const [escrowPin] = useState(
    () => orderData?.escrowPin || Math.floor(1000 + Math.random() * 9000).toString()
  );
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
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

  const isRental = orderData.items.every(item => {
    const title = String(item.name || '').toLowerCase();
    const offeringType = String(item.product?.offering_type || item.offering_type || item.product?.metadata?.offering_type || item.metadata?.offering_type || '').toLowerCase();
    const serviceModel = String(item.product?.service_model || item.service_model || item.product?.metadata?.service_model || item.metadata?.service_model || '').toLowerCase();
    
    if (offeringType === 'service' && (serviceModel.includes('rental') || serviceModel.includes('booking'))) {
      return true;
    }
    // Strict fallback: ONLY if not explicitly a physical good, and only for very specific hospitality phrases
    if (offeringType !== 'physical_good') {
      if (/\b(luxury suite|hotel room|airbnb|b&b|guest house|apartment rental)\b/.test(title)) return true;
    }
    return false;
  });

  const isService = orderData.items.every(item => {
    const title = String(item.name || '').toLowerCase();
    const offeringType = String(item.product?.offering_type || item.offering_type || item.product?.metadata?.offering_type || item.metadata?.offering_type || '').toLowerCase();
    const serviceModel = String(item.product?.service_model || item.service_model || item.product?.metadata?.service_model || item.metadata?.service_model || '').toLowerCase();
    
    if (offeringType === 'service' || offeringType === 'digital_product' || serviceModel.includes('service')) {
      return true;
    }
    // Strict fallback: ONLY if not explicitly a physical good, check for service-like keywords
    if (offeringType !== 'physical_good') {
      if (/\b(training|event|class|course|consulting|workshop|ticket|webinar)\b/.test(title)) return true;
    }
    return false;
  });
  const rawCurrency = orderData?.apiCurrency || orderData?.currency || orderData?.items?.[0]?.currency || 'XOF';
  // Banking / orchestration gateways require ISO-4217 code (XOF, USD, EUR, NGN, etc.)
  const apiCurrency = orderData?.apiCurrency || (rawCurrency === 'FCFA' ? 'XOF' : rawCurrency);
  // User-facing display currency label
  const displayCurrency = orderData?.displayCurrency || (rawCurrency === 'XOF' ? 'FCFA' : rawCurrency);
  const displayTotalAmount = orderData?.displayTotalAmount ?? orderData?.totalAmount;
  const displaySubtotal = orderData?.displaySubtotal ?? orderData?.subtotal;
  const displayDeliveryFee = orderData?.displayDeliveryFee ?? orderData?.deliveryFee;
  const displayPlatformFee = orderData?.displayPlatformFee ?? orderData?.platformFee;
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
        "Order reference {{id}} copied to clipboard.",
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
        "Secret PIN code {{pin}} copied.",
        { pin: escrowPin }
      ),
    });
  };

  const getChainBalanceForToken = (symbol, networkName) => {
    if (!symbol) return 0;
    const cleanSym = symbol.toUpperCase();
    const targetChain = normalizeChainName(networkName);

    const list = user?.businessRawBalances?.length
      ? user.businessRawBalances
      : (user?.rawBalances?.length ? user.rawBalances : (user?.personalRawBalances || []));

    const exactMatch = list.find((b) => {
      const bSym = (b.token || b.symbol || b.currency || '').toUpperCase();
      const bChain = normalizeChainName(b.chain || b.network);
      const chainMatches = !targetChain || bChain === targetChain;

      return bSym === cleanSym && chainMatches;
    });

    if (exactMatch && exactMatch.balance !== undefined) {
      return parseFloat(exactMatch.balance || 0);
    }
    return 0;
  };

  const generateCyberSourceHtml = (url, formFields) => {
    const inputs = Object.entries(formFields || {})
      .map(([key, val]) => `<input type="hidden" name="${key}" value="${String(val).replace(/"/g, '&quot;')}" />`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Ecobank CyberSource Checkout</title>
          <style>
            * { box-sizing: border-box; }
            body {
              background-color: #20365B;
              color: #FFFFFF;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 24px;
              text-align: center;
            }
            .card {
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.15);
              border-radius: 20px;
              padding: 32px 24px;
              width: 100%;
              max-width: 340px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.2);
              border-top: 4px solid #FFC759;
              border-radius: 50%;
              width: 44px;
              height: 44px;
              animation: spin 0.8s linear infinite;
              margin-bottom: 18px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .title {
              font-size: 16px;
              font-weight: 700;
              color: #FFFFFF;
              margin-bottom: 6px;
            }
            .subtitle {
              font-size: 12px;
              color: #878FA4;
              line-height: 1.4;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              margin-top: 16px;
              padding: 6px 12px;
              background: rgba(16, 185, 129, 0.15);
              border: 1px solid rgba(16, 185, 129, 0.3);
              border-radius: 20px;
              color: #10B981;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <div class="title">Ecobank Secure Payment</div>
            <div class="subtitle">Connecting securely to CyberSource...</div>
            ${formFields?.amount ? `<div style="margin-top: 12px; font-size: 13px; color: #FFC759; font-weight: 700;">Billed in FCFA (XOF): ${formFields.amount} XOF</div>` : ''}
            <div class="badge">256-BIT SSL ENCRYPTED</div>
          </div>
          <form id="csForm" action="${url}" method="post">
            ${inputs}
          </form>
          <script>
            setTimeout(function() {
              document.getElementById('csForm').submit();
            }, 100);
          </script>
        </body>
      </html>
    `;
  };

  const handleConfirmPurchase = () => {
    if (isPhysical) {
      setShowEscrowModal(true);
    } else {
      executeServiceRealOrder();
    }
  };

  // Physical goods demo flow (kept 100% intact)
  const executePhysicalDemoOrder = async () => {
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
            t('common.error', 'Error')
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
            order_id: orderData.orderId,
            orderId: orderData.orderId,
            items: orderData.items,
            paymentMethod: token,
            network: orderData.network || 'Polygon',
            deliveryOption: orderData.deliveryOption,
            deliveryFee: orderData.deliveryFee,
            escrowPin: isPhysical ? escrowPin : null,
            recipientName: orderData.recipient?.name,
            recipientPhone: orderData.recipient?.phone,
            recipientAddress: orderData.recipient?.address,
            orderSource: 'dizzitapp-mobile',
            status: isPhysical ? 'held_in_escrow' : 'completed',
            merchantName: orderData.merchant?.name,
            currency: displayCurrency,
          },
        };

        try {
          await buyGoodsApi.createMarketplaceTransaction(txPayload);
        } catch (apiErr) {
          console.warn('Backend transaction notice (handled smoothly):', apiErr);
        }

        if (!orderData?.isDirectOrder) {
          clearCart();
        }
        setLoading(false);

        const orderTitle = orderData.items.length > 1
          ? `${orderData.items[0].name} ${t('orderConfirmation.moreItems', '+ {{count}} more', { count: orderData.items.length - 1 })}`
          : (orderData.items[0]?.name || t('paymentSuccess.marketplacePurchase', 'Marketplace Purchase'));

        navigation.navigate('PaymentSuccessScreen', {
          transaction: {
            title: orderTitle,
            amount: displayTotalAmount,
            currency: displayCurrency,
            amountCrypto: `${token === 'DZY' ? orderData.totalDZY : orderData.totalUSDC} ${token}`,
            paymentMethod: token,
            orderId: orderData.orderId,
            escrowPin: isPhysical ? escrowPin : null,
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
              escrowPin: isPhysical ? escrowPin : null,
              recipientPhone: orderData.recipient?.phone,
              recipientName: orderData.recipient?.name,
            },
          });
        } catch (orchestrateErr) {
          console.log('MoMo orchestration dispatched:', orchestrateErr.message);
        }

        if (isPhysical && !orderData?.isDirectOrder) {
          clearCart();
        }
        setLoading(false);

        navigation.navigate('PaymentInProgressScreen', {
          orderId: orderData.orderId,
          orderData: {
            ...orderData,
            currency: displayCurrency,
            displayCurrency,
            displayTotalAmount,
            escrowPin: isPhysical ? escrowPin : null,
            isPhysical,
          },
        });
        return;
      }

      // 3. CARTE BANCAIRE (Ecobank CyberSource)
      if (rail === 'card') {
        if (!orderData?.isDirectOrder) {
          clearCart();
        }
        setLoading(false);
        navigation.navigate('PaymentSuccessScreen', {
          transaction: {
            title: orderData.items[0]?.name || t('paymentSuccess.marketplacePurchase', 'Marketplace Purchase'),
            amount: displayTotalAmount,
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
        return;
      }
    } catch (err) {
      console.error('Physical order confirmation error:', err);
      setLoading(false);
      AppToast.showError(
        err.message || t('orderConfirmation.orderFailed', 'Order processing failed.'),
        t('common.error', 'Error')
      );
    }
  };

  // Real payment flow for SERVICES (Crypto on-chain, CyberSource 3DS Card, MoMo)
  const executeServiceRealOrder = async () => {
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const rail = orderData.paymentRail;
      const token = orderData.selectedToken || 'USDC';
      const network = orderData.network || 'Polygon';

      // Rule 8: For services, ALL rails (card, Mobile Money, crypto) must first create the order
      // in the backend with status payment pending and amount computed by the backend from the DB.
      // Route used: POST /api/marketplace/transactions (webhookRoutes.ts:67)
      const txPayload = {
        sponsorUserId: user?.id || null,
        beneficiaryUserId: user?.id || null,
        merchantId: orderData.merchant?.id || null,
        transactionType: 'buy_goods',
        valueUSDC: orderData.totalUSDC,
        valueDZY: orderData.totalDZY,
        details: {
          order_id: orderData.orderId,
          orderId: orderData.orderId,
          items: orderData.items,
          paymentMethod: rail === 'crypto' ? token : rail.toUpperCase(),
          network: rail === 'crypto' ? network : null,
          deliveryOption: 'service',
          status: 'payment_pending',
          merchantName: orderData.merchant?.name,
          currency: apiCurrency,
        },
      };

      const backendTxRes = await buyGoodsApi.createMarketplaceTransaction(txPayload);
      console.log('Backend service transaction pre-created:', backendTxRes);

      if (!backendTxRes || !backendTxRes.success) {
        throw new Error(backendTxRes?.error || 'Failed to pre-create service order in backend');
      }

      // 1. CRYPTO PAYMENT FOR SERVICES (USDC, USDT, EURC, DZY)
      if (rail === 'crypto') {
        // Rule 2: The backend decides where and how much to pay, never the app
        let payToAddress = backendTxRes?.cryptoPayment?.payToAddress;
        let amountToPay = backendTxRes?.cryptoPayment?.amount;
        let cryptoToken = backendTxRes?.cryptoPayment?.token || token;
        let cryptoChain = (backendTxRes?.cryptoPayment?.chain || network).toLowerCase();

        if (!payToAddress || !amountToPay) {
          const info = await buyGoodsApi.getServiceCryptoPaymentInfo(orderData.orderId, {
            token: cryptoToken,
            chain: cryptoChain,
          });
          payToAddress = info?.payToAddress;
          amountToPay = info?.amount;
          cryptoToken = info?.token || cryptoToken;
          cryptoChain = (info?.chain || cryptoChain).toLowerCase();
        }

        if (!payToAddress) {
          throw new Error(t('orderConfirmation.noMerchantWallet', 'The merchant does not have an active wallet address on this network.'));
        }

        // Rule 1: Balance check before paying
        const chainBal = getChainBalanceForToken(cryptoToken, cryptoChain);
        if (chainBal < amountToPay) {
          setLoading(false);
          AppToast.showError(
            t('orderVerification.notEnoughBalance', 'Not enough balance'),
            t('common.error', 'Error')
          );
          return;
        }

        // Rule 3: The app sends the payment with REAL send (/wallet/send + Crossmint approval)
        const walletIdentity = getWalletIdentity(user, session);
        const authToken = walletIdentity.token;
        const isSolana = cryptoChain === 'solana';
        const fromAddress = isSolana ? walletIdentity.solana : walletIdentity.evm;

        if (!authToken || !fromAddress) {
          throw new Error(
            walletIdentity.isMerchant
              ? 'Merchant business wallet is not ready. Please refresh the app.'
              : 'Wallet is not ready. Please refresh the app.'
          );
        }

        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
          DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        } else if (Platform.OS === 'ios' && DIZZY_URL.includes('10.0.2.2')) {
          DIZZY_URL = DIZZY_URL.replace('10.0.2.2', 'localhost');
        }

        const sendPayload = {
          toAddress: payToAddress,
          fromAddress,
          amount: parseFloat(amountToPay),
          token: cryptoToken,
          chain: cryptoChain,
          metadata: {
            recipientName: orderData.merchant?.name || 'Merchant',
            orderId: orderData.orderId,
            type: 'service_order_payment',
          },
        };

        console.log('Sending real service crypto payment to:', DIZZY_URL, sendPayload);

        const sendRes = await fetch(`${DIZZY_URL}/wallet/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(sendPayload)
        });

        const sendData = await sendRes.json().catch(() => ({}));
        let txHash = null;

        if (!sendRes.ok || !sendData.success) {
          if (sendData.status === 'requires-handshake' || sendData.crossmintStatus === 'awaiting-approval') {
            const txId = sendData.txId || sendData.txHash || sendData.id;
            const actualSignerEmail = sendData.signerAddress?.replace('email:', '') || user?.email;

            if (txId && typeof getWallet === 'function') {
              const chainName = isSolana ? 'solana' : normalizeChainName(cryptoChain);
              if (!chainName) {
                const chainErr = t('orderConfirmation.missing_chain', 'Blockchain network is missing. Please select a valid network.');
                throw new Error(chainErr);
              }
              const activeWallet = await getWallet({ chain: chainName });
              if (activeWallet) {
                if (actualSignerEmail) {
                  await activeWallet.useSigner({ type: 'email', email: actualSignerEmail });
                }
                await activeWallet.approve({ transactionId: txId });
              }
            }
            txHash = txId;
          } else {
            const errMsg = sendData.error || sendData.message || t('orderConfirmation.orderFailed', 'Payment transfer failed');
            throw new Error(errMsg);
          }
        } else {
          txHash = sendData.txHash || sendData.transactionId || sendData.transaction?.id;
        }

        if (!txHash) {
          throw new Error(t('orderConfirmation.noTxHash', 'Failed to retrieve transaction reference.'));
        }

        // Rule 4: Send txHash to backend route that verifies on-chain and marks order paid
        // Rule 5: Success screen ONLY after backend confirms
        let isConfirmed = false;
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            const confirmRes = await buyGoodsApi.confirmServiceCryptoPayment(orderData.orderId, {
              txHash,
              token: cryptoToken,
              chain: cryptoChain,
            });
            console.log(`[confirmServiceCryptoPayment] Attempt ${attempt} result:`, confirmRes);
            if (confirmRes && (confirmRes.success && (confirmRes.status === 'confirmed' || confirmRes.order?.is_completed))) {
              isConfirmed = true;
              break;
            }
          } catch (err) {
            console.log(`[confirmServiceCryptoPayment] Attempt ${attempt} note:`, err?.message);
          }
          if (attempt < 5) {
            await new Promise((r) => setTimeout(r, 3000));
          }
        }

        if (isConfirmed) {
          if (!orderData?.isDirectOrder) {
            clearCart();
          }
          setLoading(false);
          const orderTitle = orderData.items.length > 1
            ? `${orderData.items[0].name} ${t('orderConfirmation.moreItems', '+ {{count}} more', { count: orderData.items.length - 1 })}`
            : (orderData.items[0]?.name || t('paymentSuccess.marketplacePurchase', 'Marketplace Purchase'));

          navigation.navigate('PaymentSuccessScreen', {
            transaction: {
              title: orderTitle,
              amount: displayTotalAmount,
              currency: displayCurrency,
              amountCrypto: `${amountToPay} ${cryptoToken}`,
              paymentMethod: cryptoToken,
              orderId: orderData.orderId,
              txHash,
              recipientName: orderData.merchant?.name,
              recipientCountry: orderData.recipient?.country || user?.country,
              merchantName: orderData.merchant?.name,
              date: new Date().toISOString(),
            },
          });
          return;
        } else {
          // Rule 5: If transfer is sent but not verified yet: "Payment pending", cart kept
          setLoading(false);
          AppToast.showInfo(
            t('orderConfirmation.paymentPendingDesc', 'Your transfer has been submitted to the blockchain and is pending confirmation.'),
            t('orderConfirmation.paymentPending', 'Payment pending')
          );
          navigation.navigate('PaymentInProgressScreen', {
            orderId: orderData.orderId,
            orderData: {
              ...orderData,
              currency: displayCurrency,
              displayCurrency,
              displayTotalAmount,
              isPhysical: false,
              txHash,
              paymentStatus: 'pending',
            },
          });
          return;
        }
      }

      // 2. MOBILE MONEY (MoMo) FOR SERVICES
      if (rail === 'momo') {
        try {
          await buyGoodsApi.orchestratePayment({
            orderId: orderData.orderId,
            amount: orderData.totalAmount,
            currency: apiCurrency,
            paymentMethod: 'MOMO',
            metadata: {
              recipientPhone: orderData.recipient?.phone,
              recipientName: orderData.recipient?.name,
            },
          });
        } catch (orchestrateErr) {
          console.log('MoMo orchestration dispatched:', orchestrateErr?.message);
        }

        setLoading(false);
        navigation.navigate('PaymentInProgressScreen', {
          orderId: orderData.orderId,
          orderData: {
            ...orderData,
            currency: displayCurrency,
            displayCurrency,
            displayTotalAmount,
            isPhysical: false,
          },
        });
        return;
      }

      // 3. CARD PAYMENT (Ecobank CyberSource 3DS) FOR SERVICES
      if (rail === 'card') {
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

        if (cardRes?.status === 'PAYMENT_PROCESSING') {
          setLoading(false);
          AppToast.show(
            t('errors.paymentProcessing', 'Your payment is currently being confirmed. Please wait a moment.'),
            t('common.notice', 'Notice'),
            'info'
          );
          return;
        }

        const checkoutUrl = cardRes?.url || cardRes?.redirectUrl;
        if (checkoutUrl) {
          setLoading(false);
          const html = generateCyberSourceHtml(checkoutUrl, cardRes.formFields);
          setCyberSourceHtml(html);
          setShowCyberSourceModal(true);
          return;
        } else {
          throw new Error(cardRes?.message || t('orderConfirmation.cardError', 'Card payment could not be initiated.'));
        }
      }
    } catch (err) {
      console.error('Service order payment error:', err);
      // Rule 5: If the transfer fails: error, cart kept
      setLoading(false);
      AppToast.showError(
        err.message || t('orderConfirmation.orderFailed', 'Order processing failed.'),
        t('common.error', 'Error')
      );
    } finally {
      isSubmittingRef.current = false;
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
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ContactUsScreen')}>
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
            <Text style={styles.securityAlertTitle}>
              {isPhysical
                ? t('orderConfirmation.securityTitle', 'DizzitUp On-chain Escrow Protection')
                : t('orderConfirmation.securityTitleNeutral', 'Secure Payment')}
            </Text>
            <Text style={styles.securityAlertText}>
              {isPhysical
                ? t('orderConfirmation.securityDesc', 'Your funds remain protected in blockchain escrow. The merchant is only paid once your items are delivered and verified.')
                : t('orderConfirmation.securityDescNeutral', 'Your payment is processed securely.')}
            </Text>
          </View>
        </View>

        {/* Secret Escrow PIN Banner */}
        {isPhysical && (
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
            {isRental
              ? t('orderConfirmation.escrowPinBuyerWarningRental', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the host ONLY upon check-in.')
              : isService
              ? t('orderConfirmation.escrowPinBuyerWarningService', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the provider ONLY after the service is fully rendered.')
              : t('orderConfirmation.escrowPinBuyerWarning', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the courier / Shop Manager only after physical delivery and inspection of your items.')}
          </Text>
          <Text style={styles.escrowPinNotice}>
            {t('escrow.buyerProtectionNotice', { country: recipientCountryName, defaultValue: `This protection is for you, the Buyer, and your Beneficiary in ${recipientCountryName}.` })}
          </Text>
        </View>
        )}

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
                  {(Number(item.displayPrice ?? item.price) || 0).toLocaleString(numLocale)} {displayCurrency}
                </Text>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{t('orderConfirmation.qty', "Qty: {{qty}}", { qty: item.quantity })}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment & Recipient Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('orderConfirmation.paymentDetails', "Payment details")}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.youPayWith', "You pay with")}</Text>
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
              {!isPhysical
                ? t('orderConfirmation.providerAddress', 'Provider location')
                : orderData.deliveryOption === 'pickup'
                ? t('orderConfirmation.storeAddress', 'Store address')
                : t('orderConfirmation.deliveryAddress', 'Delivery address')}
            </Text>
            <Text style={styles.detailValue}>
              {!isPhysical
                ? (orderData.merchant?.location || orderData.merchant?.address || orderData.recipient?.address || user?.city || '')
                : (orderData.recipient?.address || user?.city || '')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {!isPhysical
                ? t('orderConfirmation.serviceMode', 'Service type')
                : t('orderConfirmation.deliveryMode', 'Delivery mode')}
            </Text>
            <Text style={styles.detailValue}>
              {!isPhysical
                ? t('orderConfirmation.directService', 'Direct fulfillment')
                : orderData.deliveryOption === 'home' || orderData.deliveryOption === 'domicile'
                ? t('orderConfirmation.homeDelivery', 'Home delivery')
                : t('orderConfirmation.storePickup', 'Store pickup')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.subtotal', 'Subtotal')}</Text>
            <Text style={styles.detailValue}>{(Number(displaySubtotal) || 0).toLocaleString(numLocale)} {displayCurrency}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.deliveryFee', 'Delivery fee')}</Text>
            <Text style={styles.detailValue}>
              {displayDeliveryFee > 0
                ? `${Number(displayDeliveryFee).toLocaleString(numLocale)} ${displayCurrency}`
                : t('orderConfirmation.free', 'Free')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderConfirmation.networkFee', 'Network service fee')}</Text>
            <Text style={styles.detailValue}>{(Number(displayPlatformFee) || 0).toLocaleString(numLocale)} {displayCurrency}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('orderConfirmation.netTotal', 'Net total')}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalValueMain}>
                {orderData.paymentRail === 'crypto'
                  ? orderData.selectedToken === 'DZY'
                    ? `${orderData.totalDZY} DZY`
                    : `${orderData.totalUSDC} ${orderData.selectedToken}`
                  : `${(Number(displayTotalAmount) || 0).toLocaleString(numLocale)} ${displayCurrency}`}
              </Text>
              <Text style={styles.totalValueSub}>
                {orderData.paymentRail === 'crypto'
                  ? `≈ ${(Number(displayTotalAmount) || 0).toLocaleString(numLocale)} ${displayCurrency}`
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
      <ScreenFooter
        backgroundColor="#FFFFFF"
        borderTop={true}
        borderTopColor="#F1F5F9"
        paddingHorizontal={20}
        paddingTop={12}
      >
        <TouchableOpacity
          style={[styles.btnConfirm, loading && { opacity: 0.7 }]}
          onPress={handleConfirmPurchase}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#1A2840" />
          ) : (
            <View style={styles.btnConfirmCenter}>
              <Ionicons name="lock-closed" size={16} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.btnConfirmTitle} maxFontSizeMultiplier={1.3}>
                {t('orderConfirmation.confirmAndPay', 'Confirm and Pay')}
                {' • '}
                {orderData.paymentRail === 'crypto'
                  ? (orderData.selectedToken === 'DZY' ? `${orderData.totalDZY} DZY` : `${orderData.totalUSDC} ${orderData.selectedToken}`)
                  : `${(Number(displayTotalAmount) || 0).toLocaleString(numLocale)} ${displayCurrency}`}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScreenFooter>

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
                  if (!orderData?.isDirectOrder) {
                    clearCart();
                  }
                  navigation.navigate('PaymentSuccessScreen', {
                    transaction: {
                      title: orderData.items[0]?.name || t('paymentSuccess.marketplacePurchase', "Marketplace Purchase"),
                      amount: displayTotalAmount,
                      currency: displayCurrency,
                      orderId: orderData.orderId,
                      escrowPin: isPhysical ? escrowPin : null,
                      recipientName: orderData.recipient?.name,
                    },
                  });
                } else if (navState.url.includes('/payments/failure') || navState.url.includes('decision=DECLINE') || navState.url.includes('decision=CANCEL')) {
                  setShowCyberSourceModal(false);
                  AppToast.showError(t('orderConfirmation.cardError', 'Card payment could not be processed. Please try again or use another payment method.'));
                }
              }}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* On-Chain Escrow Innovation Modal (Solofo Mandate) */}
      {isPhysical && (
      <Modal visible={showEscrowModal} transparent animationType="fade" onRequestClose={() => setShowEscrowModal(false)}>
        <View style={[styles.escrowModalOverlay, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.escrowModalCard}>
            <ScrollView
              style={{ width: '100%' }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.escrowModalScrollContent}
              bounces={false}
            >
              <View style={styles.escrowIconBadge}>
                <Ionicons name="shield-checkmark" size={32} color="#D97706" />
              </View>

              <View style={styles.escrowInnovationTag}>
                <Ionicons name="sparkles" size={13} color="#B45309" style={{ marginRight: 4 }} />
                <Text style={styles.escrowInnovationTagText} maxFontSizeMultiplier={1.3}>
                  {t('escrow.innovationTag', 'ON-CHAIN ESCROW • DIZZITUP INNOVATION')}
                </Text>
              </View>

              <Text style={styles.escrowModalTitle} maxFontSizeMultiplier={1.3}>
                {t('escrow.modalTitle', 'On-Chain Escrow Protection')}
              </Text>

              <Text style={styles.escrowModalSub} maxFontSizeMultiplier={1.3}>
                {t('escrow.modalSub', 'World-First Decentralized Escrow Protocol')}
              </Text>

              <View style={styles.escrowPinBox}>
                <Text style={styles.escrowPinLabel} maxFontSizeMultiplier={1.3}>{t('escrow.yourPin', 'Your Secret Delivery PIN Code')}</Text>
                <Text style={styles.escrowPinNumber} maxFontSizeMultiplier={1.3}>{escrowPin}</Text>
                <Text style={styles.escrowModalBuyerNotice} maxFontSizeMultiplier={1.3}>
                  {isRental
                    ? t('escrow.buyerWarningRental', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the host ONLY upon check-in.')
                    : isService
                    ? t('escrow.buyerWarningService', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the provider ONLY after the service is fully rendered.')
                    : t('escrow.buyerWarning', '⚠️ This code is for the Buyer. Keep it strictly secret! Never give it to anyone except your Beneficiary, or to the courier / Shop Manager only after physical delivery and inspection of your items.')}
                </Text>
                <Text style={[styles.escrowModalBuyerNotice, { marginTop: 8, color: '#0369A1' }]} maxFontSizeMultiplier={1.3}>
                  {t('escrow.buyerProtectionNotice', { country: recipientCountryName, defaultValue: `This protection is for you, the Buyer, and your Beneficiary in ${recipientCountryName}.` })}
                </Text>
              </View>

              <Text style={styles.escrowModalDesc} maxFontSizeMultiplier={1.3}>
                {t('escrow.modalDesc', "Experience our exclusive On-Chain Escrow protocol — a world-first DizzitUp innovation.\n\nYour funds remain 100% safeguarded on-chain under smart contracts and are only released to the merchant after physical handover and inspection with your secret delivery PIN.\n\nLive on-chain settlements will be activated very soon!")}
              </Text>

              <TouchableOpacity
                style={styles.escrowModalPrimaryBtn}
                onPress={() => {
                  setShowEscrowModal(false);
                  executePhysicalDemoOrder();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.escrowModalPrimaryBtnText} maxFontSizeMultiplier={1.3}>
                  {t('escrow.proceedToPayment', "Understood, proceed to payment")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.escrowModalSecondaryBtn}
                onPress={() => {
                  setShowEscrowModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.escrowModalSecondaryBtnText} maxFontSizeMultiplier={1.3}>
                  {t('escrow.reviewOrder', "Review order")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      )}

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
    paddingHorizontal: 16,
  },
  escrowModalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  escrowModalScrollContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 6,
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
    width: '100%',
  },
  escrowModalSub: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 14,
    width: '100%',
  },
  escrowPinBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    paddingHorizontal: 4,
    width: '100%',
  },
  escrowModalDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 18,
    width: '100%',
  },
  escrowModalPrimaryBtn: {
    width: '100%',
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    textAlign: 'center',
    lineHeight: 19,
  },
  escrowModalSecondaryBtn: {
    width: '100%',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowModalSecondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
