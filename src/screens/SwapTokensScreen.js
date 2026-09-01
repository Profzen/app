import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet, EVMWallet, SolanaWallet } from '@crossmint/client-sdk-react-native-ui';

import CryptoIcon from '../components/CryptoIcon';
import AppSelect from '../components/AppSelect';
import { useApp } from '../context/AppContext';
import { swapService } from '../services/swapService';

const chainOptions = [
  { value: 'polygon', label: 'Polygon', isCrypto: true, cryptoSymbol: 'Polygon' },
  { value: 'ethereum', label: 'Ethereum', isCrypto: true, cryptoSymbol: 'Ethereum' },
  { value: 'base', label: 'Base', isCrypto: true, cryptoSymbol: 'Base' },
  { value: 'solana', label: 'Solana', isCrypto: true, cryptoSymbol: 'Solana' },
  { value: 'bsc', label: 'BNB Chain', isCrypto: true, cryptoSymbol: 'BNB' },
];
const tokenOptions = ['USDC', 'USDT', 'POL', 'WBTC', 'WETH', 'ETH', 'SOL', 'BNB', 'DAI'].map((value) => ({ value, label: value }));

export default function SwapTokensScreen() {
  const navigation = useNavigation();

  const { wallet: crossmintWallet } = useWallet();
  const { user, session, refreshBalances, t } = useApp();

  const [fromChain, setFromChain] = useState('polygon');
  const [toChain, setToChain] = useState('polygon');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('USDT');

  const [quoteLoading, setQuoteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [txStatus, setTxStatus] = useState(null);
  const [activeTxHash, setActiveTxHash] = useState(null);
  const [signerEmail, setSignerEmail] = useState(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const amountInputRef = React.useRef(null);

  const availableBalance = user?.rawBalances?.find((b) => (b.currency || b.token || b.symbol) === fromToken && (b.chain === fromChain || !b.chain))?.balance || user?.allBalances?.[fromToken] || 0;

  // Debounced quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        getQuote();
      } else {
        setToAmount('');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, fromChain, toChain]);

  const getQuote = async () => {
    setQuoteLoading(true);
    setError(null);
    try {
      const data = await swapService.getQuote(fromToken, toToken, fromAmount, fromChain, toChain, session?.access_token);
      if (data && data.toAmount) {
        // Simple decimal formatting for UI. Backend usually returns raw or formatted depending on logic.
        setToAmount(Number(data.toAmount).toFixed(6).replace(/\.?0+$/, ''));
      }
    } catch (e) {
      console.log('Quote error', e);
    } finally {
      setQuoteLoading(false);
    }
  };

  const pollTransactionStatus = async (txId) => {
    setActiveTxHash(txId);
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const data = await swapService.checkTransactionStatus(txId, session?.access_token);
        const crossStatus = data.crossmintStatus || data.status;
        setTxStatus(crossStatus);

        if (data.status === 'COMPLETED') {
          clearInterval(interval);

          if (data.type === 'APPROVAL') {
            // If it was an approval, immediately trigger the swap execute
            setTxStatus(null);
            handleSwap();
          } else {
            setLoading(false);
            setIsAuthorizing(false);
            refreshBalances();
            setTxStatus('success');
            setTimeout(() => navigation.goBack(), 2000);
          }
          return;
        }

        if (crossStatus === 'failed') {
          clearInterval(interval);
          setError(t('common.wallet.swap_ui.failed', 'Transaction failed'));
          setLoading(false);
          setIsAuthorizing(false);
          return;
        }
      } catch (err) {
        console.log(err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setLoading(false);
        setIsAuthorizing(false);
      }
    }, 5000);
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) > availableBalance) {
      setError(t('common.wallet.swap_ui.insufficient_balance', 'INSUFFICIENT BALANCE'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await swapService.executeSwap(fromToken, toToken, fromAmount, fromChain, toChain, session?.access_token);

      if (res.error) {
        if (res.status === 400 && res.data?.status === 'requires-handshake') {
          const txId = res.data.txId;
          setActiveTxHash(txId);
          setTxStatus('awaiting-approval');
          setSignerEmail(res.data.signerAddress?.replace('email:', '') || user?.email);
          setLoading(false);
          return;
        }

        if (res.status === 400 && res.data?.status === 'requires-approval') {
          // Trigger approval flow
          const approveRes = await swapService.approve(fromToken, fromChain, res.data.spender, session?.access_token);
          if (approveRes.error && approveRes.status === 400 && approveRes.data?.status === 'requires-handshake') {
            const txId = approveRes.data.txId;
            setActiveTxHash(txId);
            setTxStatus('awaiting-approval');
            setSignerEmail(approveRes.data?.signerAddress?.replace('email:', '') || user?.email || user?.user_metadata?.email || 'your registered email');
            setLoading(false);
            return;
          }
          if (!approveRes.error && approveRes.data?.txHash) {
            pollTransactionStatus(approveRes.data.txHash);
          }
          return;
        }
        throw new Error(res.data?.error || 'Swap failed');
      }

      if (res.data?.txHash) {
        pollTransactionStatus(res.data.txHash);
      }
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  };

  const handleAuthorize = async () => {
    try {
      setIsAuthorizing(true);
      if (!crossmintWallet) throw new Error('Crossmint wallet not connected');

      const activeWallet = fromChain === 'solana' ? SolanaWallet.from(crossmintWallet) : EVMWallet.from(crossmintWallet);
      const emailToUse = signerEmail || user?.email;

      await activeWallet.useSigner({ type: 'email', email: emailToUse });
      await activeWallet.approve({ transactionId: activeTxHash });

      pollTransactionStatus(activeTxHash);
    } catch (e) {
      console.error("Authorize error", e);
      setIsAuthorizing(false);

      // Handle already approved errors
      const errMsg = String(e);
      if (errMsg.includes("Already has the required number of approvals")) {
        pollTransactionStatus(activeTxHash);
      }
    }
  };


  const swapSides = () => {
    setFromChain(toChain);
    setToChain(fromChain);
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.pageTitle}>{t('common.wallet.swap_ui.swap_tokens', 'Swap Tokens')}</Text>
            <Text style={styles.pageSubtitle}>{t('common.wallet.swap_ui.swap_subtitle', 'Exchange tokens instantly')}</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <View style={{ width: 44 }} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Chain Selectors */}
          <View style={styles.chainRow}>
            <View style={styles.chainCol}>
              <Text style={styles.inputLabel}>{t('common.wallet.swap_ui.from_chain', 'From Chain')}</Text>
              <AppSelect value={fromChain} options={chainOptions} onChange={setFromChain} title={t('common.wallet.swap_ui.from_chain')} style={styles.chainSelector} textStyle={styles.chainName} chevronColor="#20365B" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.chainCol}>
              <Text style={styles.inputLabel}>{t('common.wallet.swap_ui.to_chain', 'To Chain')}</Text>
              <AppSelect value={toChain} options={chainOptions} onChange={setToChain} title={t('common.wallet.swap_ui.to_chain')} style={styles.chainSelector} textStyle={styles.chainName} chevronColor="#20365B" />
            </View>
          </View>

          {/* DZY Banner */}
          <View style={styles.dzyBanner}>
            <View style={styles.dzyBannerHeader}>
              <Ionicons name="rocket-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.dzyBannerTitle}>{t('common.wallet.swap_ui.dzy_coming_soon', 'DZY Token Coming Soon!')}</Text>
            </View>
            <Text style={styles.dzyBannerText}>
              {t('common.wallet.swap_ui.dzy_launch_desc', { date: 'Q2 2027' })}
            </Text>
          </View>

          {/* Swap Box */}
          <View style={styles.swapContainer}>

            {/* From Input */}
            <View style={styles.inputBox}>
              <View style={styles.inputBoxHeader}>
                <Text style={styles.inputLabel}>{t('common.wallet.swap_ui.from_token', 'From Token')}</Text>
                <View style={styles.balanceInfo}>
                  <Ionicons name="wallet-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
                  <Text style={styles.balanceValue}>{Number(availableBalance).toFixed(4)} {fromToken}</Text>
                  <TouchableOpacity onPress={() => setFromAmount(availableBalance.toString())}>
                    <Text style={styles.maxText}>{t('common.wallet.swap_ui.max', 'MAX')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputRow}>
                <AppSelect value={fromToken} options={tokenOptions} onChange={setFromToken} title={t('common.wallet.swap_ui.from_token')} style={styles.tokenSelector} textStyle={styles.selectedTokenName} renderLeading={(option) => <CryptoIcon symbol={option.value} size={24} style={{ marginRight: 6 }} />} />
                <TouchableOpacity activeOpacity={1} style={[styles.amountInputContainer, isFocused && styles.amountInputContainerFocused]} onPress={() => amountInputRef.current?.focus()}>
                  <TextInput
                    ref={amountInputRef}
                    style={styles.amountInput}
                    value={fromAmount}
                    onChangeText={setFromAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Swap Button */}
            <View style={styles.swapBtnWrapper}>
              <TouchableOpacity style={styles.swapBtn} onPress={swapSides}>
                <Ionicons name="swap-vertical" size={20} color="#1A2840" />
              </TouchableOpacity>
            </View>

            {/* To Input */}
            <View style={styles.inputBox}>
              <View style={styles.inputBoxHeader}>
                <Text style={styles.inputLabel}>{t('common.wallet.swap_ui.to_token_estimated', 'To Token (Estimated)')}</Text>
                {quoteLoading && (
                  <View style={styles.quoteLoadingBadge}>
                    <ActivityIndicator size="small" color="#D97706" style={{ marginRight: 6, transform: [{ scale: 0.8 }] }} />
                    <Text style={styles.quoteLoadingText}>
                      {t('common.wallet.swap_ui.fetching_rate', 'Fetching best rate...')}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.inputRow}>
                <AppSelect value={toToken} options={tokenOptions} onChange={setToToken} title={t('common.wallet.swap_ui.to_chain')} style={styles.tokenSelector} textStyle={styles.selectedTokenName} renderLeading={(option) => <CryptoIcon symbol={option.value} size={24} style={{ marginRight: 6 }} />} />
                <View style={[styles.amountInputContainer, styles.amountInputContainerDisabled]}>
                  <TextInput
                    style={[styles.amountInput, { color: '#878FA4' }]}
                    value={toAmount}
                    editable={false}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>

          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.btnAction, loading && styles.btnActionDisabled]}
            onPress={handleSwap}
            disabled={loading || !fromAmount}
          >
            {loading && <ActivityIndicator color={loading ? "#1A2840" : "#FFF"} style={{ marginRight: 8 }} />}
            {!loading && <Ionicons name="swap-horizontal" size={18} color={(!fromAmount || loading) ? '#94A3B8' : '#FFC759'} style={{ marginRight: 8 }} />}
            <Text style={[styles.btnActionText, (!fromAmount || loading) && { color: '#94A3B8' }]}>
              {loading ? t('common.wallet.swap_ui.executing_swap', 'EXECUTING SWAP...') : t('common.wallet.swap_ui.swap_btn', 'SWAP TOKENS NOW')}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      {/* Signature Required Modal */}
      <Modal visible={txStatus === 'awaiting-approval'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderIcon}>
              <Ionicons name="lock-closed" size={28} color="#EA580C" />
            </View>
            <Text style={styles.modalTitle}>{t('common.wallet.swap_ui.signature_required', 'Signature Required')}</Text>
            <Text style={styles.modalSubtitle}>{t('common.wallet.swap_ui.crossmint_action_needed', 'Crossmint Action Needed')}</Text>

            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoTextBold}>{t('common.wallet.swap_ui.verification_request', 'A verification request has been deployed to your profile.')}</Text>
              <View style={styles.emailBadge}>
                <Text style={styles.emailBadgeText}>{t('common.wallet.swap_ui.check_email', '📧 Check Email:')} {signerEmail}</Text>
              </View>
              <Text style={styles.modalInfoText}>{t('common.wallet.swap_ui.secure_link_prompt', 'Please follow the secure external link or utilize biometric passkey authorizations if prompted.')}</Text>
            </View>

            <TouchableOpacity
              style={[styles.authBtn, isAuthorizing && styles.authBtnDisabled]}
              onPress={handleAuthorize}
              disabled={isAuthorizing}
            >
              {isAuthorizing ? <ActivityIndicator color="#FFF" /> : <Ionicons name="lock-closed" size={20} color="#FFF" style={{ marginRight: 8 }} />}
              <Text style={styles.authBtnText}>
                {isAuthorizing ? t('common.wallet.swap_ui.authorizing', 'Authorizing...') : t('common.wallet.swap_ui.authorize_swap', 'Authorize Swap Release')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTxStatus(null)} style={styles.dismissBtn}>
              <Text style={styles.dismissBtnText}>{t('common.wallet.swap_ui.dismiss_banner', 'Dismiss Banner')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#20365B',
  },
  pageSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#878FA4',
  },
  headerRightIcons: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  chainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chainCol: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#878FA4',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chainSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 46,
    marginTop: 4,
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  chainName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0E0E0E',
    textTransform: 'capitalize',
  },
  dzyBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFC759',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  dzyBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dzyBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#20365B',
  },
  dzyBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#878FA4',
    lineHeight: 18,
  },
  swapContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  inputBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteLoadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  quoteLoadingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#D97706',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#20365B',
    marginRight: 8,
  },
  maxText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFC759',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    width: '45%', // Ensures enough space for the full token name
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTokenName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0E0E0E',
    marginHorizontal: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%', // Explicitly shorter width as requested
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#CBD5E1', // Stronger default visible border
  },
  amountInputContainerFocused: {
    borderColor: '#1A2840', // Navy border when typing
    backgroundColor: '#F8FAFC',
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  amountInputContainerDisabled: {
    backgroundColor: '#F1F5F9', // Grayed out background
    borderColor: '#E2E8F0', // Lighter border
    borderStyle: 'dashed', // Clearly indicates non-interactivity
  },
  amountInput: {
    flex: 1, // Ensures the input is clickable anywhere inside the container
    fontFamily: 'Inter_700Bold',
    fontSize: 20, // Tighter font size as requested
    color: '#1A2840',
    outlineStyle: 'none',
    textAlign: 'right',
    minWidth: 80,
  },
  swapBtnWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 10,
    backgroundColor: '#FAFAFA',
    padding: 4,
    borderRadius: 24,
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20365B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnAction: {
    flexDirection: 'row',
    backgroundColor: '#1A2840',
    paddingVertical: 15,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  btnActionDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnActionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFC759',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 54, 91, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#FFC759',
    alignItems: 'center',
    shadowColor: '#20365B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#20365B',
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFC759',
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInfoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  modalInfoTextBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#20365B',
    marginBottom: 12,
  },
  emailBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  emailBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0E0E0E',
  },
  modalInfoText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#878FA4',
    lineHeight: 18,
  },
  authBtn: {
    backgroundColor: '#20365B',
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#20365B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  authBtnDisabled: {
    backgroundColor: '#B9B9B9',
    shadowOpacity: 0,
    elevation: 0,
  },
  authBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    padding: 12,
  },
  dismissBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
  }
});
