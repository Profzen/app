import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar, Modal, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useWallet, EVMWallet, SolanaWallet } from '@crossmint/client-sdk-react-native-ui';
import { getExplorerTxUrl, isOnChainHash } from '../utils/explorer';

import CryptoIcon from '../components/CryptoIcon';
import AppSelect from '../components/AppSelect';
import ScreenFooter from '../components/ScreenFooter';
import { useApp } from '../context/AppContext';
import { swapService } from '../services/swapService';
import { ESTIMATED_NETWORK_FEES_USDC } from '../config/networkFees';

const formatMax6Decimals = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val);
  if (!str.includes('.')) return str;
  const [intPart, decPart] = str.split('.');
  if (!decPart) return intPart;
  const trimmed = decPart.slice(0, 6).replace(/0+$/, '');
  return trimmed.length > 0 ? `${intPart}.${trimmed}` : intPart;
};

const chainOptions = [
  { value: 'polygon', label: 'Polygon', isCrypto: true, cryptoSymbol: 'Polygon' },
  { value: 'ethereum', label: 'Ethereum', isCrypto: true, cryptoSymbol: 'Ethereum' },
  { value: 'base', label: 'Base', isCrypto: true, cryptoSymbol: 'Base' },
  { value: 'solana', label: 'Solana', isCrypto: true, cryptoSymbol: 'Solana' },
  { value: 'bsc', label: 'BNB Chain', isCrypto: true, cryptoSymbol: 'BNB' },
];

const tokensByChain = {
  polygon: ['USDC', 'USDT', 'POL', 'WPOL', 'WETH', 'WBTC'],
  ethereum: ['USDC', 'USDT', 'EURC', 'ETH', 'WETH', 'WBTC', 'DAI', 'POL'],
  base: ['USDC', 'EURC', 'ETH', 'WETH'],
  bsc: ['BNB', 'USDC', 'USDT', 'DAI'],
  solana: ['USDC', 'USDT', 'EURC', 'SOL'],
};

export default function SwapTokensScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { wallet: crossmintWallet, getWallet } = useWallet();
  const { user, session, refreshUser, t } = useApp();

  const [fromChain, setFromChain] = useState('polygon');
  const [toChain, setToChain] = useState('polygon');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('USDT');

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  const [txStatus, setTxStatus] = useState(null);
  const [activeTxHash, setActiveTxHash] = useState(null);
  const [successTxHash, setSuccessTxHash] = useState(null);
  const [signerEmail, setSignerEmail] = useState(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [sdkPromptOpen, setSdkPromptOpen] = useState(false);
  const [swapStep, setSwapStep] = useState(null); // 'approval' | 'swap' | null
  const [hadApprovalStep, setHadApprovalStep] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const amountInputRef = React.useRef(null);
  const pollIntervalRef = React.useRef(null);
  const finalPollIntervalRef = React.useRef(null);
  const approveCalledRef = React.useRef(false);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (finalPollIntervalRef.current) {
      clearInterval(finalPollIntervalRef.current);
      finalPollIntervalRef.current = null;
    }
  };

  const pollForFinalHash = (idToPoll) => {
    let attempts = 0;
    const maxAttempts = 30;
    if (finalPollIntervalRef.current) {
      clearInterval(finalPollIntervalRef.current);
    }
    finalPollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await swapService.checkTransactionStatus(idToPoll, session?.access_token);
        const onChain = data.blockchainHash || data.onChain?.txHash || (data.txHash && isOnChainHash(data.txHash, fromChain) ? data.txHash : null);
        if (onChain) {
          setSuccessTxHash(onChain);
          clearInterval(finalPollIntervalRef.current);
          finalPollIntervalRef.current = null;
        }
      } catch (err) {
        // Polling retry
      }
      if (attempts >= maxAttempts) {
        clearInterval(finalPollIntervalRef.current);
        finalPollIntervalRef.current = null;
      }
    }, 3000);
  };

  const handleResetAfterSuccess = () => {
    setFromAmount('');
    setToAmount('');
    setQuote(null);
    setTxStatus(null);
    setSwapStep(null);
    setHadApprovalStep(false);
    setLoading(false);
    setIsAuthorizing(false);
    setSuccessTxHash(null);
    approveCalledRef.current = false;
    stopPolling();
    if (typeof refreshUser === 'function') refreshUser();
  };

  // Keep toChain in sync with fromChain (just in case it drifts)
  useEffect(() => {
    if (toChain !== fromChain) {
      setToChain(fromChain);
    }
  }, [fromChain]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const availableBalance = user?.rawBalances?.find((b) => (b.currency || b.token || b.symbol) === fromToken && (b.chain === fromChain || !b.chain))?.balance || 0;

  // Debounced quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        getQuote();
      } else {
        setToAmount('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, fromChain, toChain]);

  const getQuote = async () => {
    setQuoteLoading(true);
    setError(null);
    setInfoMsg(null);
    try {
      const data = await swapService.getQuote(fromToken, toToken, fromAmount, fromChain, toChain, session?.access_token);
      if (data && data.toAmount) {
        setQuote(data);
        setToAmount(data.toAmount);
      } else {
        setQuote(null);
        setError(t('common.wallet.swap_ui.quote_failed', 'Could not get a quote. Please try again.'));
      }
    } catch (e) {
      console.log('Quote error', e);
      setQuote(null);
      if (e?.status === 429 || e?.data?.code === 'RATE_LIMITED') {
        const retrySec = e?.data?.retryAfterSeconds || 60;
        setError(t('common.wallet.rate_limited', { seconds: retrySec, defaultValue: `Too many attempts. Please try again in ${retrySec} seconds.` }));
      } else {
        setError(t('common.wallet.swap_ui.quote_failed', 'Could not get a quote. Please try again.'));
      }
    } finally {
      setQuoteLoading(false);
    }
  };

  const pollTransactionStatus = async (txId) => {
    setActiveTxHash(txId);
    let attempts = 0;
    const maxAttempts = 30;

    stopPolling();

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await swapService.checkTransactionStatus(txId, session?.access_token);
        const crossStatus = data.crossmintStatus || data.status;
        setTxStatus(crossStatus);

        if (data.status === 'COMPLETED') {
          stopPolling();

          if (data.type === 'APPROVAL') {
            // If it was an approval, immediately trigger the swap execute
            setTxStatus(null);
            setIsAuthorizing(false);
            setSwapStep('swap');
            approveCalledRef.current = false;
            handleSwap(true);
          } else {
            setLoading(false);
            setIsAuthorizing(false);
            setSwapStep(null);
            setHadApprovalStep(false);
            if (typeof refreshUser === 'function') refreshUser();

            const onChain = data.blockchainHash || data.onChain?.txHash || (data.txHash && isOnChainHash(data.txHash, fromChain) ? data.txHash : null);
            setSuccessTxHash(onChain || txId);
            setTxStatus('success');

            if (!onChain) {
              pollForFinalHash(txId);
            }
          }
          return;
        }

        if (crossStatus === 'failed') {
          stopPolling();
          setError(t('common.wallet.swap_ui.failed', 'Transaction failed'));
          setLoading(false);
          setIsAuthorizing(false);
          setSwapStep(null);
          setHadApprovalStep(false);
          return;
        }
      } catch (err) {
        console.log(err);
      }

      if (attempts >= maxAttempts) {
        stopPolling();
        setLoading(false);
        setIsAuthorizing(false);
        setSwapStep(null);
        setHadApprovalStep(false);
        setInfoMsg(t('common.wallet.swap_ui.status_timeout', 'Still processing. Check your wallet history in a few minutes.'));
      }
    }, 5000);
  };

  const handleSwap = async (isFollowUp = false) => {
    if (!fromAmount || parseFloat(fromAmount) > availableBalance) {
      setError(t('common.wallet.swap_ui.insufficient_balance', 'INSUFFICIENT BALANCE'));
      return;
    }

    const isActualFollowUp = isFollowUp === true;
    approveCalledRef.current = false;
    if (!isActualFollowUp) {
      setHadApprovalStep(false);
      setSwapStep('swap');
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await swapService.executeSwap(fromToken, toToken, fromAmount, fromChain, toChain, session?.access_token);

      if (res.error) {
        if (res.status === 429 || res.data?.code === 'RATE_LIMITED') {
          const retrySec = res.data?.retryAfterSeconds || 60;
          setLoading(false);
          setError(t('common.wallet.rate_limited', { seconds: retrySec, defaultValue: `Too many attempts. Please try again in ${retrySec} seconds.` }));
          return;
        }

        if (res.status === 400 && res.data?.status === 'requires-handshake') {
          const txId = res.data.txId;
          setActiveTxHash(txId);
          setSwapStep('swap');
          setTxStatus('awaiting-approval');
          setSignerEmail(res.data.signerAddress?.replace('email:', '') || user?.email);
          setLoading(false);
          return;
        }

        if (res.status === 400 && res.data?.status === 'requires-approval') {
          // Trigger approval flow
          setHadApprovalStep(true);
          setSwapStep('approval');
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
        setSwapStep('swap');
        pollTransactionStatus(res.data.txHash);
      }
    } catch (e) {
      setLoading(false);
      if (e?.status === 429 || e?.data?.code === 'RATE_LIMITED' || e?.code === 'RATE_LIMITED') {
        const retrySec = e?.data?.retryAfterSeconds || e?.retryAfterSeconds || 60;
        setError(t('common.wallet.rate_limited', { seconds: retrySec, defaultValue: `Too many attempts. Please try again in ${retrySec} seconds.` }));
      } else {
        setError(e.message);
      }
    }
  };

  const handleAuthorize = async () => {
    if (sdkPromptOpen) return; // Crossmint prompt already open
    try {
      setIsAuthorizing(true);
      
      const chainName = fromChain === 'solana' ? 'solana' : 'polygon';
      let activeWallet = null;
      if (typeof getWallet === 'function') {
        activeWallet = await getWallet({ chain: chainName });
      } else if (crossmintWallet) {
        activeWallet = chainName === 'solana' ? SolanaWallet.from(crossmintWallet) : EVMWallet.from(crossmintWallet);
      }

      if (!activeWallet) throw new Error('Crossmint wallet not connected');

      const emailToUse = signerEmail || user?.email;

      await activeWallet.useSigner({ type: 'email', email: emailToUse });
      // Hide our modal while Crossmint's OTP prompt is shown
      setSdkPromptOpen(true);
      approveCalledRef.current = true;
      try {
        await activeWallet.approve({ transactionId: activeTxHash });
      } finally {
        setSdkPromptOpen(false);
      }

      pollTransactionStatus(activeTxHash);
    } catch (e) {
      // Use console.log instead of console.error to prevent giant red toasts in dev mode
      console.log("Authorize error", e);
      
      let errMsg = String(e.message || e);
      
      // Try to parse JSON errors so it doesn't look ugly
      try {
        const parsed = JSON.parse(e.message);
        if (parsed && parsed.message) {
          errMsg = parsed.message;
        }
      } catch (err) {
        // Not JSON, leave as is
      }
      
      // Handle already approved errors gracefully
      if (errMsg.includes("Already has the required number of approvals")) {
        pollTransactionStatus(activeTxHash);
        return;
      }
      
      // If the user simply closed the popup or rejected it, show a friendly info message
      if (errMsg.includes("AuthRejectedError") || errMsg.includes("Authentication was rejected")) {
        if (approveCalledRef.current) {
          setInfoMsg(t('common.wallet.swap_ui.tx_already_submitted', 'This transaction was already submitted for signing. It may still complete. Check your history.'));
          setTxStatus(null);
          return;
        }
        setInfoMsg(t('sendMoney.transfer_not_confirmed', 'Transfer not confirmed. No funds were sent.'));
        stopPolling();
        setTxStatus(null);
        setSwapStep(null);
        setHadApprovalStep(false);
        return;
      }
      
      // Show error in the main UI
      if (approveCalledRef.current) {
        setInfoMsg(t('common.wallet.swap_ui.tx_already_submitted', 'This transaction was already submitted for signing. It may still complete. Check your history.'));
        setTxStatus(null);
        return;
      }
      setError(errMsg);
      stopPolling();
      setTxStatus(null); // Close the modal so they can see the error
      setSwapStep(null);
      setHadApprovalStep(false);
    } finally {
      setIsAuthorizing(false);
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
            <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.pageTitle}>{t('common.wallet.swap_ui.swap_tokens', 'Swap Tokens')}</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {infoMsg && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={18} color="#FFC759" />
              <Text style={styles.infoText}>{infoMsg}</Text>
            </View>
          )}

          {/* Chain Selector */}
          <View style={styles.chainRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>{t('common.wallet.swap_ui.from_chain', "From Chain")}</Text>
              <AppSelect 
                value={fromChain} 
                options={chainOptions} 
                onChange={(val) => {
                  setFromChain(val);
                  setToChain(val);
                  const chainTokens = tokensByChain[val] || [];
                  if (!chainTokens.includes(fromToken) || !chainTokens.includes(toToken) || fromToken === toToken) {
                    setFromToken(chainTokens[0] || 'USDC');
                    setToToken(chainTokens[1] || chainTokens[0] || 'USDT');
                  }
                }} 
                title={t('common.wallet.swap_ui.from_chain', "From Chain")}
                style={styles.chainSelector} 
                textStyle={styles.chainName} 
                chevronColor="#64748B" 
              />
            </View>
          </View>

          {/* DZY Banner */}
          <View style={styles.dzyBanner}>
            <View style={styles.dzyBannerHeader}>
              <Ionicons name="flash-outline" size={16} color="#4ADE80" style={{ marginRight: 6 }} />
              <Text style={styles.dzyBannerTitle}>ZERO-FEE SWAPS COMING</Text>
            </View>
            <Text style={styles.dzyBannerText}>
              {t('common.wallet.swap_ui.dzy_launch_desc', 'DZY launches soon')}
            </Text>
          </View>

          {/* Swap Box */}
          <View style={styles.swapContainer}>

            {/* From Input */}
            <View style={styles.inputBox}>
              <View style={styles.inputBoxHeader}>
                <Text style={styles.inputLabel}>PAY</Text>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceValue}>{Number(availableBalance).toFixed(4)}</Text>
                  <TouchableOpacity onPress={() => setFromAmount(availableBalance.toString())} style={styles.maxBadge}>
                    <Text style={styles.maxText}>MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputRow}>
                <AppSelect value={fromToken} options={(tokensByChain[fromChain] || []).map((value) => ({ value, label: value === 'POL' && fromChain === 'ethereum' ? 'POL (Ethereum)' : value, isCrypto: true, cryptoSymbol: value }))} onChange={setFromToken} title={t('common.wallet.swap_ui.from_token', 'From Token')} style={styles.tokenSelector} textStyle={styles.selectedTokenName} renderLeading={(option) => <CryptoIcon symbol={option?.value || fromToken} size={20} style={{ marginRight: 6 }} />} />
                <TouchableOpacity activeOpacity={1} style={[styles.amountInputContainer, isFocused && styles.amountInputContainerFocused]} onPress={() => amountInputRef.current?.focus()}>
                  <TextInput
                    ref={amountInputRef}
                    style={styles.amountInput}
                    value={fromAmount}
                    onChangeText={(val) => setFromAmount(val.replace(/,/g, '.'))}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#475569"
                    allowFontScaling={false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Swap Button */}
            <View style={styles.swapBtnWrapper}>
              <TouchableOpacity style={styles.swapBtn} onPress={swapSides}>
                <Ionicons name="swap-vertical" size={18} color="#38BDF8" />
              </TouchableOpacity>
            </View>

            {/* To Input */}
            <View style={styles.inputBox}>
              <View style={styles.inputBoxHeader}>
                <Text style={styles.inputLabel}>RECEIVE</Text>
                {quoteLoading && (
                  <View style={styles.quoteLoadingBadge}>
                    <ActivityIndicator size="small" color="#38BDF8" style={{ transform: [{ scale: 0.6 }] }} />
                  </View>
                )}
              </View>
              <View style={styles.inputRow}>
                <AppSelect value={toToken} options={(tokensByChain[toChain] || []).map((value) => ({ value, label: value === 'POL' && toChain === 'ethereum' ? 'POL (Ethereum)' : value, isCrypto: true, cryptoSymbol: value }))} onChange={setToToken} title={t('common.wallet.swap_ui.to_token', 'To Token')} style={styles.tokenSelector} textStyle={styles.selectedTokenName} renderLeading={(option) => <CryptoIcon symbol={option?.value || toToken} size={20} style={{ marginRight: 6 }} />} />
                <View style={[styles.amountInputContainer, styles.amountInputContainerDisabled]}>
                  <TextInput
                    style={[styles.amountInput, { color: '#94A3B8' }]}
                    value={formatMax6Decimals(toAmount)}
                    editable={false}
                    placeholder="0.0"
                    placeholderTextColor="#475569"
                    allowFontScaling={false}
                  />
                </View>
              </View>
            </View>

          </View>

          {toToken === 'WPOL' && (
            <View style={[styles.infoBox, { marginBottom: 16 }]}>
              <Ionicons name="information-circle" size={18} color="#F59E0B" />
              <Text style={[styles.infoText, { color: '#B45309' }]}>
                {t('common.wallet.swap_ui.wpol_receive_warning', 'You will receive WPOL (wrapped POL), not native POL.')}
              </Text>
            </View>
          )}

          {/* Quote Info */}
          {quote && !quoteLoading && (
            <View style={styles.quoteInfoBox}>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>You receive about</Text>
                <Text style={styles.quoteValue}>{formatMax6Decimals(toAmount)} {toToken}</Text>
              </View>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>At least (guaranteed)</Text>
                <Text style={styles.quoteValue}>{formatMax6Decimals(quote.toAmountMin || toAmount)} {toToken}</Text>
              </View>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>
                  {fromChain === 'solana' ? 'Network fee (paid in USDC)' : 'Fees (bridge + network)'}
                </Text>
                <Text style={styles.quoteValue}>
                  {(() => {
                    if (fromChain === 'solana') {
                      const feeNum = parseFloat(quote.totalFeesUSD);
                      const solanaFee = (feeNum && feeNum > 0) ? feeNum : (ESTIMATED_NETWORK_FEES_USDC?.solana ?? 0.01);
                      return `~$${solanaFee.toFixed(2)}`;
                    }
                    const feeStr = quote.totalFeesUSD;
                    if (!feeStr) return "$0.00";
                    const feeNum = parseFloat(feeStr);
                    if (feeNum > 0 && feeNum < 0.01) return "< $0.01";
                    return `$${(isNaN(feeNum) ? 0 : feeNum).toFixed(2)}`;
                  })()}
                </Text>
              </View>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Provider</Text>
                <Text style={styles.quoteValue}>{quote.provider}</Text>
              </View>
            </View>
          )}

          {/* Action Button */}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Sticky Swap Action Footer */}
        <ScreenFooter borderTop={true} backgroundColor="#FAFAFA" borderTopColor="#E2E8F0" paddingTop={10} style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={[styles.btnAction, loading && styles.btnActionDisabled]}
            onPress={() => handleSwap(false)}
            disabled={loading || !fromAmount}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFC759" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="flash" size={16} color="#FFC759" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.btnActionText} maxFontSizeMultiplier={1.3}>
              {loading ? 'PROCESSING...' : 'EXECUTE SWAP'}
            </Text>
          </TouchableOpacity>
        </ScreenFooter>
      </View>

      {/* Modern, Compact Signature Modal */}
      <Modal visible={txStatus === 'awaiting-approval' && !sdkPromptOpen} transparent animationType="fade">
        <View style={[styles.modalOverlay, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeaderIcon}>
              <Ionicons name="finger-print" size={24} color="#38BDF8" />
            </View>
            
            <Text style={styles.modalTitle}>
              {swapStep === 'approval'
                ? t('common.wallet.swap_ui.modal_approval_title', {
                    token: fromToken,
                    defaultValue: `Step 1 of 2: allow ${fromToken} once`,
                  })
                : hadApprovalStep
                ? t('common.wallet.swap_ui.modal_swap_step2_title', 'Step 2 of 2: confirm swap')
                : t('common.wallet.swap_ui.modal_swap_direct_title', 'Confirm swap')}
            </Text>
            
            <View style={styles.modalInfoBox}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="mail" size={14} color="#94A3B8" />
                <Text style={styles.modalInfoText}>{signerEmail}</Text>
              </View>
              <Text style={styles.modalInfoHint}>
                {swapStep === 'approval'
                  ? t('common.wallet.swap_ui.modal_approval_body', {
                      token: fromToken,
                      defaultValue: `This one-time permission lets the swap use your ${fromToken}. You only do this once per token.`,
                    })
                  : t('common.wallet.swap_ui.modal_swap_body', 'Confirm the swap in the secure window. No new code is needed if you just entered one.')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.authBtn, isAuthorizing && styles.authBtnDisabled]}
              onPress={handleAuthorize}
              disabled={isAuthorizing}
            >
              {isAuthorizing ? <ActivityIndicator color="#0F172A" size="small" /> : <Ionicons name="key" size={16} color="#0F172A" style={{ marginRight: 6 }} />}
              <Text style={styles.authBtnText} maxFontSizeMultiplier={1.3}>
                {isAuthorizing ? 'VERIFYING...' : 'AUTHORIZE'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (approveCalledRef.current) {
                  setInfoMsg(t('common.wallet.swap_ui.tx_already_submitted', 'This transaction was already submitted for signing. It may still complete. Check your history.'));
                  setTxStatus(null);
                  setIsAuthorizing(false);
                } else {
                  stopPolling();
                  setTxStatus(null);
                  setIsAuthorizing(false);
                  setSwapStep(null);
                  setHadApprovalStep(false);
                  setInfoMsg(t('sendMoney.transfer_not_confirmed', 'Transfer not confirmed. No funds were sent.'));
                }
              }}
              style={styles.dismissBtn}
            >
              <Text style={styles.dismissBtnText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>

      {/* Modern Swap Success Modal */}
      <Modal visible={txStatus === 'success'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            
            <View style={[styles.modalHeaderIcon, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
            
            <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 6 }]}>
              {t('common.wallet.swap_ui.swap_success_title', 'Swap successful!')}
            </Text>

            <Text style={[styles.modalInfoHint, { textAlign: 'center', marginBottom: 18 }]}>
              {t('common.wallet.swap_ui.swap_success_body', {
                fromAmount,
                fromToken,
                toAmount,
                toToken,
                defaultValue: `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
              })}
            </Text>

            {successTxHash ? (
              <View style={{ width: '100%', marginBottom: 16 }}>
                {!isOnChainHash(successTxHash, fromChain) ? (
                  <View style={styles.referenceBadgeRow}>
                    <Text style={styles.referenceLabel}>
                      {t('common.wallet.swap_ui.reference', 'Reference')}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.hashBox}>
                  <Text style={styles.hashText} numberOfLines={1} ellipsisMode="middle">
                    {successTxHash}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={async () => {
                      try {
                        await Clipboard.setStringAsync(successTxHash);
                        setInfoMsg(t('common.copied_title', { label: successTxHash.startsWith('0x') ? 'Hash' : 'Reference', defaultValue: 'Copied!' }));
                      } catch (err) {}
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="copy-outline" size={16} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {isOnChainHash(successTxHash, fromChain) ? (
              <TouchableOpacity
                style={styles.explorerButton}
                onPress={() => Linking.openURL(getExplorerTxUrl(fromChain, successTxHash))}
                activeOpacity={0.85}
              >
                <Ionicons name="open-outline" size={16} color="#071D54" style={{ marginRight: 8 }} />
                <Text style={styles.explorerButtonText}>
                  {t('common.wallet.swap_ui.view_on_explorer', 'View on explorer')}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={handleResetAfterSuccess}
              style={[styles.authBtn, { width: '100%', marginTop: 8 }]}
            >
              <Text style={styles.authBtnText}>{t('common.wallet.swap_ui.done', 'Done')}</Text>
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
    paddingBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#20365B',
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
  quoteInfoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quoteLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#475569',
  },
  quoteValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0F172A',
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
    paddingHorizontal: 8,
    height: 48,
    width: '47%', // Increased slightly to prevent USDC clipping
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
    width: '51%', // Give it as much space as possible without crushing the token selector
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
    fontSize: 16, // Reduced to prevent clipping on Android with large font scaling
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
    marginTop: 0,
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
    backgroundColor: 'rgba(26, 40, 64, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#FFC759',
    alignItems: 'center',
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#20365B',
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalInfoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalInfoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#20365B',
    marginLeft: 8,
  },
  modalInfoHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#878FA4',
    lineHeight: 18,
    textAlign: 'center',
  },
  authBtn: {
    backgroundColor: '#1A2840',
    width: '100%',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1A2840',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  authBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  authBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFC759',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    padding: 12,
  },
  dismissBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#878FA4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  referenceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  referenceLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hashBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 8,
    height: 48,
    width: '100%',
  },
  hashText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#475569',
    marginRight: 8,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FFC759',
    borderRadius: 14,
    height: 46,
    marginBottom: 12,
    width: '100%',
  },
  explorerButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#071D54',
    letterSpacing: 0.2,
  },
});
