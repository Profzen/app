import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, StatusBar, ActivityIndicator, Modal, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppSelect from '../components/AppSelect';
import AppToast from '../components/AppToast';
import BottomNavBar from '../components/BottomNavBar';
import CryptoIcon from '../components/CryptoIcon';
import { useApp } from '../context/AppContext';
import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { isSmallScreen } from '../utils/responsive';
import { useWallet, EVMWallet, SolanaWallet } from '@crossmint/client-sdk-react-native-ui';

const BLOCKCHAINS = [
  { value: 'Polygon', label: 'Polygon', name: 'Polygon Network', isCrypto: true, cryptoSymbol: 'Polygon' },
  { value: 'Ethereum', label: 'Ethereum', name: 'Ethereum Mainnet', isCrypto: true, cryptoSymbol: 'Ethereum' },
  { value: 'Solana', label: 'Solana', name: 'Solana Network', isCrypto: true, cryptoSymbol: 'Solana' },
  { value: 'BNB Chain', label: 'BNB Chain', name: 'BNB Smart Chain', isCrypto: true, cryptoSymbol: 'BNB Chain' },
  { value: 'Base', label: 'Base', name: 'Base Network', isCrypto: true, cryptoSymbol: 'Base' },
];

const CRYPTO_TOKENS = [
  { value: 'USDC', label: 'USDC', name: 'USD Coin', isCrypto: true, cryptoSymbol: 'USDC', subtitle: 'USD Coin (Stablecoin)' },
  { value: 'USDT', label: 'USDT', name: 'Tether USD', isCrypto: true, cryptoSymbol: 'USDT', subtitle: 'Tether USD (Stablecoin)' },
  { value: 'EURC', label: 'EURC', name: 'Euro Coin', isCrypto: true, cryptoSymbol: 'EURC', subtitle: 'EURC Stablecoin' },
  { value: 'DZY', label: 'DZY', name: 'DizzitUp Token', isCrypto: true, cryptoSymbol: 'DZY', subtitle: 'DizzitUp Utility Token' },
  { value: 'ETH', label: 'ETH', name: 'Ethereum', isCrypto: true, cryptoSymbol: 'ETH', subtitle: 'Ethereum Native Token' },
  { value: 'POL', label: 'POL', name: 'Polygon', isCrypto: true, cryptoSymbol: 'POL', subtitle: 'Polygon Native Token' },
];



export default function SendMoneyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { session, user, t, refreshTransactions, refreshBalances } = useApp();
  const { wallet: crossmintWallet } = useWallet();

  const [txStatus, setTxStatus] = useState(null);
  const [activeTxHash, setActiveTxHash] = useState(null);
  const [signerEmail, setSignerEmail] = useState(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const [apiRecipients, setApiRecipients] = useState([]);
  const [savedBeneficiaries, setSavedBeneficiaries] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const [blockchain, setBlockchain] = useState('Polygon');
  const [token, setToken] = useState('USDC');

  const isMerchant = user?.role === 'merchant';
  const effectiveRawBalances = (isMerchant && user?.businessRawBalances?.length)
    ? user.businessRawBalances
    : (user?.rawBalances?.length ? user.rawBalances : (user?.personalRawBalances || []));

  const [walletBalances, setWalletBalances] = useState(effectiveRawBalances);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);

  // Sync walletBalances when AppContext rawBalances update
  useEffect(() => {
    if (effectiveRawBalances && effectiveRawBalances.length > 0 && walletBalances.length === 0) {
      setWalletBalances(effectiveRawBalances);
    }
  }, [effectiveRawBalances]);
  
  // Recipient selection states
  const initialRecipientName = route.params?.recipient || route.params?.contact?.name || '';
  
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isSearchingRecipient, setIsSearchingRecipient] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [amount, setAmount] = useState('1');
  const [toast, setToast] = useState(null);
  const [missingWalletItem, setMissingWalletItem] = useState(null);

  // Fetch real live wallet balances from dizzy-wallet using appropriate auth token
  useEffect(() => {
    const authToken = (isMerchant && user?.businessDizzyToken)
      ? user.businessDizzyToken
      : (user?.dizzyToken || session?.access_token);

    if (!authToken) return;
    let cancelled = false;
    const fetchBalances = async () => {
      setBalancesLoading(true);
      try {
        let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
        if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
          DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
        } else if (Platform.OS === 'ios' && DIZZY_URL.includes('10.0.2.2')) {
          DIZZY_URL = DIZZY_URL.replace('10.0.2.2', 'localhost');
        }
        const res = await fetch(`${DIZZY_URL}/wallet/balance`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (!cancelled && data) {
          const list = Array.isArray(data) ? data : data.balances || [];
          if (list.length > 0) {
            setWalletBalances(list);
          }
        }
      } catch (err) {
        console.warn('[SendMoneyScreen] Error fetching balances:', err);
      } finally {
        if (!cancelled) setBalancesLoading(false);
      }
    };
    fetchBalances();
    return () => { cancelled = true; };
  }, [session?.access_token, user?.dizzyToken, user?.businessDizzyToken, isMerchant]);

  // Balance helper: find balance matching token AND selected blockchain
  const getBalanceForToken = (symbol, network = blockchain) => {
    if (!symbol) return 0;
    const cleanSym = symbol.toUpperCase();
    const cleanChain = (network || '').toLowerCase().replace(/\s+/g, '');

    const list = walletBalances.length > 0 ? walletBalances : effectiveRawBalances;

    // 1. Check exact match for token + specific chain
    const exactMatch = list.find(b => {
      const bSym = (b.token || b.symbol || b.currency || '').toUpperCase();
      const bChain = (b.chain || b.network || '').toLowerCase().replace(/\s+/g, '');
      const chainMatches = !cleanChain || 
        bChain === cleanChain ||
        (cleanChain === 'polygon' && (bChain === 'matic' || bChain === 'polygon')) ||
        (cleanChain === 'bnbchain' && (bChain === 'bsc' || bChain === 'binance')) ||
        (cleanChain === 'ethereum' && (bChain === 'eth' || bChain === 'mainnet'));
      return bSym === cleanSym && chainMatches;
    });

    if (exactMatch && exactMatch.balance !== undefined) {
      return parseFloat(exactMatch.balance || 0);
    }

    // 2. Fallback to any chain balance for this token
    const anyTokenMatch = list.find(b => {
      const bSym = (b.token || b.symbol || b.currency || '').toUpperCase();
      return bSym === cleanSym;
    });
    if (anyTokenMatch && anyTokenMatch.balance !== undefined) {
      return parseFloat(anyTokenMatch.balance || 0);
    }

    // 3. Fallback to user.allBalances map
    if (user?.allBalances && user.allBalances[cleanSym] !== undefined) {
      return parseFloat(user.allBalances[cleanSym] || 0);
    }

    return 0;
  };

  const currentAvailableBalance = getBalanceForToken(token, blockchain);

  // Rule of provisioned tokens: only show tokens with positive balance if any exist
  const positiveTokens = CRYPTO_TOKENS.filter(t => getBalanceForToken(t.value, blockchain) > 0);
  const availableTokens = positiveTokens.length > 0 ? positiveTokens : CRYPTO_TOKENS;
  const hasZeroBalance = currentAvailableBalance <= 0;

  // Auto-select first positive token if current token has 0 balance and positive ones exist
  useEffect(() => {
    if (positiveTokens.length > 0 && !positiveTokens.some(pt => pt.value === token)) {
      setToken(positiveTokens[0].value);
    }
  }, [walletBalances, blockchain]);

  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setSearchQuery(text);
        setToast({ title: t('sendMoney.clipboard_pasted', 'Pasted from clipboard'), message: text.substring(0, 30) + (text.length > 30 ? '...' : '') });
      } else {
        setToast({ title: t('sendMoney.clipboard_empty', 'Clipboard empty'), message: t('sendMoney.clipboard_empty_desc', 'No text in clipboard.') });
      }
    } catch (e) {
      setToast({ title: t('sendMoney.clipboard_error', 'Clipboard'), message: t('sendMoney.clipboard_read_error', 'Cannot read clipboard.') });
    }
  };

  // Fetch saved beneficiaries from Supabase
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase.from('beneficiaries').select('*').eq('user_id', session.user.id);
        if (data) {
          const formatted = data.map(b => ({
            id: b.id,
            name: `${b.first_name || ''} ${b.last_name || ''}`.trim(),
            tag: b.relationship || t('contacts.relation.friend', 'BENEFICIARY'),
            address: b.evm_address || b.solana_address || b.phone || b.email,
            evm_address: b.evm_address,
            solana_address: b.solana_address,
            avatar_url: b.avatar_url,
            phone: b.phone || b.phone_number,
            email: b.email,
            country: b.country || b.country_name,
            country_code: b.country_code || b.country_code_iso,
            country_iso: b.country_iso || b.country_code_iso,
          }));
          
          const combined = [];
          if (user?.role === 'merchant') {
            combined.push({ id: 'self', name: 'My Account', tag: 'SELF', address: user?.walletAddress || 'My Account' });
          }
          setSavedBeneficiaries([...combined, ...formatted]);
          
          if (initialRecipientName) {
            const initialMatch = [...combined, ...formatted].find(r => r.name.toLowerCase() === initialRecipientName.toLowerCase());
            if (initialMatch) setSelectedRecipient(initialMatch);
          }
        }
      } catch (err) {
        console.error('Error fetching beneficiaries:', err);
      }
    };
    fetchBeneficiaries();
  }, [session, user?.role, user?.walletAddress, initialRecipientName]);

  useEffect(() => {
    const fetchApiRecipients = async () => {
      if (searchQuery.length > 5 && !isNaN(searchQuery.replace(/[^0-9]/g, ''))) {
        setIsSearchingApi(true);
        try {
          let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
          if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
          
          const res = await fetch(`${DIZZY_URL}/wallet/lookup-by-phone?phone=${encodeURIComponent(searchQuery)}`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          });
          const data = await res.json();
          if (res.ok && data.matches) {
            setApiRecipients(data.matches.map(m => ({
              id: m.id,
              name: m.name,
              tag: 'DizzitUp',
              address: m.phone || m.evm_address || 'Utilisateur',
              evm_address: m.evm_address,
              solana_address: m.solana_address,
              phone: m.phone || m.phone_number,
              email: m.email,
              country: m.country || m.country_name,
              country_code: m.country_code || m.country_code_iso,
              country_iso: m.country_iso || m.country_code_iso
            })));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearchingApi(false);
        }
      } else {
        setApiRecipients([]);
      }
    };
    const timeout = setTimeout(fetchApiRecipients, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, session]);

  const filteredRecipients = [...apiRecipients, ...savedBeneficiaries].filter(r => {
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.address && r.address.toLowerCase().includes(q)) || (r.tag && r.tag.toLowerCase().includes(q));
  });

  const handleSelectRecipient = (item) => {
    const hasAddress = !!(item.evm_address || item.solana_address || (item.address && (item.address.startsWith('0x') || item.address.length > 30)));
    if (!hasAddress && item.id !== 'self' && item.name !== 'My Account') {
      setIsSearchingRecipient(false);
      setIsDropdownVisible(false);
      setMissingWalletItem(item);
      return;
    }
    setSelectedRecipient(item);
    setIsSearchingRecipient(false);
    setIsDropdownVisible(false);
    setSearchQuery('');
  };

  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setToast({ title: t('wallet.invalid_amount', 'Invalid amount'), message: t('common.wallet.amount_greater_zero', 'Please enter an amount greater than 0.') });
      return;
    }

    if (parseFloat(amount) > currentAvailableBalance && currentAvailableBalance > 0) {
      setToast({
        title: t('sendMoney.insufficientFunds', 'Insufficient Balance'),
        message: t('sendMoney.insufficientFundsDesc', 'You only have {{bal}} {{token}} available.', {
          bal: currentAvailableBalance.toFixed(4),
          token,
        }),
      });
      return;
    }
    
    let toAddress = selectedRecipient ? (selectedRecipient.evm_address || selectedRecipient.solana_address || selectedRecipient.address) : searchQuery;
    if (toAddress === 'My Account') {
      toAddress = user?.walletAddress;
      if (!toAddress) {
        setToast({ title: t('common.error', 'Error'), message: t('sendMoney.account_address_not_found', 'Account address not found.') });
        return;
      }
    }
    if (!toAddress || toAddress.includes('...')) {
      setToast({ title: t('wallet.invalid_address', 'Invalid address'), message: t('wallet.invalid_address_message', 'Please select a valid recipient.') });
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    try {
      let DIZZY_URL = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
      if (Platform.OS === 'android' && DIZZY_URL.includes('localhost')) {
        DIZZY_URL = DIZZY_URL.replace('localhost', '10.0.2.2');
      } else if (Platform.OS === 'ios' && DIZZY_URL.includes('10.0.2.2')) {
        DIZZY_URL = DIZZY_URL.replace('10.0.2.2', 'localhost');
      }

      const authToken = (isMerchant && user?.businessDizzyToken)
        ? user.businessDizzyToken
        : (user?.dizzyToken || session?.access_token);

      const senderFromAddress = isMerchant
        ? (user?.businessEvmAddress || user?.evmAddress || user?.walletAddress)
        : (user?.evmAddress || user?.walletAddress);
      
      const payload = {
        toAddress,
        fromAddress: senderFromAddress,
        amount: parseFloat(amount),
        token,
        chain: (blockchain || 'polygon').toLowerCase(),
        metadata: {
          recipientName: selectedRecipient ? selectedRecipient.name : searchQuery,
          beneficiary_name: selectedRecipient ? selectedRecipient.name : searchQuery,
          beneficiary_email: selectedRecipient?.email,
          beneficiary_phone: selectedRecipient?.phone,
        }
      };

      const res = await fetch(`${DIZZY_URL}/wallet/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok || !data.success) {
        if (data.status === 'requires-handshake' || data.crossmintStatus === 'awaiting-approval') {
          const txId = data.txId || data.txHash || data.id;
          setActiveTxHash(txId);
          setTxStatus('awaiting-approval');
          setSignerEmail(data.signerAddress?.replace('email:', '') || user?.email);
          setIsSending(false);
          if (txId) {
            pollTransactionStatus(txId, authToken, DIZZY_URL);
          }
          return;
        }
        throw new Error(data.error || data.message || t('sendMoney.send_failed', 'Transaction failed'));
      }

      if (typeof refreshTransactions === 'function') {
        refreshTransactions();
      }

      const finalTxHash = data.txHash || data.transactionId || data.transaction?.id || 'Transaction Confirmed';
      const finalExplorerUrl = data.explorerUrl || (
        data.txHash && data.txHash.startsWith('0x')
          ? `https://polygonscan.com/tx/${data.txHash}`
          : null
      );

      navigation.navigate('SendMoneySuccessScreen', {
        amount,
        token,
        chain: blockchain,
        recipient: selectedRecipient ? selectedRecipient.name : searchQuery,
        hash: finalTxHash,
        explorerUrl: finalExplorerUrl,
        pivotScreen: route.params?.pivotScreen,
        pivotParams: route.params?.pivotParams,
      });
    } catch (e) {
      console.error('[SendMoneyScreen] Send error:', e);
      setErrorMessage(e.message || t('sendMoney.send_failed', 'Transaction failed'));
      setToast({ title: t('common.error', 'Error'), message: e.message });
    } finally {
      setIsSending(false);
    }
  };

  const pollTransactionStatus = (txId, tokenToUse, apiUrl) => {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        let baseApi = apiUrl;
        if (!baseApi) {
          baseApi = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'http://localhost:5000/api';
          if (Platform.OS === 'android' && baseApi.includes('localhost')) {
            baseApi = baseApi.replace('localhost', '10.0.2.2');
          }
        }

        const effectiveAuth = tokenToUse || (isMerchant && user?.businessDizzyToken ? user.businessDizzyToken : (user?.dizzyToken || session?.access_token));
        if (!effectiveAuth) return;

        const res = await fetch(`${baseApi}/swap/check-crossmint-status/${txId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveAuth}`,
          },
        });

        if (!res.ok) return;

        const checkRes = await res.json().catch(() => ({}));
        const crossStatus = checkRes.crossmintStatus || checkRes.status;

        if (checkRes.status === 'COMPLETED' || crossStatus === 'completed' || crossStatus === 'success') {
          clearInterval(interval);
          setTxStatus(null);
          setIsAuthorizing(false);

          if (typeof refreshTransactions === 'function') {
            refreshTransactions();
          }
          if (typeof refreshBalances === 'function') {
            refreshBalances();
          }

          const confirmedHash = checkRes.blockchainHash || checkRes.onChain?.txHash || txId;
          const confirmedExplorerUrl = checkRes.blockchainHash?.startsWith('0x')
            ? `https://polygonscan.com/tx/${checkRes.blockchainHash}`
            : (checkRes.onChain?.explorerLink || null);

          navigation.navigate('SendMoneySuccessScreen', {
            amount,
            token,
            chain: blockchain,
            recipient: selectedRecipient ? selectedRecipient.name : searchQuery,
            hash: confirmedHash,
            explorerUrl: confirmedExplorerUrl,
            pivotScreen: route.params?.pivotScreen,
            pivotParams: route.params?.pivotParams,
          });
          return;
        }

        if (crossStatus === 'failed') {
          clearInterval(interval);
          setTxStatus(null);
          setIsAuthorizing(false);
          setErrorMessage(t('sendMoney.send_failed', 'Transaction failed'));
          return;
        }
      } catch (err) {
        // Silent polling retry
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setIsAuthorizing(false);
        setTxStatus(null);
      }
    }, 4000);
  };

  const handleAuthorize = async () => {
    try {
      setIsAuthorizing(true);
      if (!crossmintWallet) {
        setIsAuthorizing(false);
        if (activeTxHash) {
          pollTransactionStatus(activeTxHash);
        }
        return;
      }

      const activeWallet = (blockchain || 'polygon').toLowerCase() === 'solana'
        ? SolanaWallet.from(crossmintWallet)
        : EVMWallet.from(crossmintWallet);
      const emailToUse = signerEmail || user?.email;

      await activeWallet.useSigner({ type: 'email', email: emailToUse });
      await activeWallet.approve({ transactionId: activeTxHash });

      pollTransactionStatus(activeTxHash);
    } catch (e) {
      console.error("[SendMoneyScreen] Authorize error:", e);
      setIsAuthorizing(false);

      const errMsg = String(e);
      if (errMsg.includes("Already has the required number of approvals")) {
        pollTransactionStatus(activeTxHash);
      } else {
        setErrorMessage(e.message || 'Authorization failed');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            const pivotScreen = route.params?.pivotScreen;
            const pivotParams = route.params?.pivotParams;
            if (pivotScreen) {
              navigation.navigate(pivotScreen, pivotParams);
            } else {
              navigation.goBack();
            }
          }}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t('sendMoney.sendFunds', 'Send Funds')}</Text>
            <View style={styles.secureTagRow}>
              <View style={styles.greenDot} />
              <Text style={styles.secureTagText}>{t('common.secured', 'SECURED')}</Text>
            </View>
          </View>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={18} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RewardsScreen')}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MoreSettingsScreen')}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Main White Form Card - Compact */}
          <View style={styles.formCard}>
            
            {/* Section 1: Recipient Address (Search & Dropdown vs Picked Card) */}
            <Text style={styles.fieldLabel}>{t('pos.recipient_address_caps', 'RECIPIENT ADDRESS / BENEFICIARY')}</Text>

            {(!selectedRecipient || isSearchingRecipient) ? (
              <View style={styles.searchSectionWrapper}>
                {/* Search Input Box with PASTE and QR Code buttons */}
                <View style={styles.searchInputBox}>
                  <Ionicons name="search-outline" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
                  <TextInput
                    style={styles.searchInputField}
                    placeholder={t('common.wallet.search_beneficiary', 'Search by name, phone or address...')}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsDropdownVisible(true)}
                    onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                  />

                  {/* PASTE Button */}
                  <TouchableOpacity style={styles.pasteButton} onPress={handlePasteClipboard} activeOpacity={0.8}>
                    <Text style={styles.pasteButtonText}>PASTE</Text>
                  </TouchableOpacity>

                  {/* QR Code Icon Button */}
                  <TouchableOpacity style={styles.qrCodeButton} onPress={() => setToast({ title: t('common.wallet.scan_to_pay', 'Scan to Pay'), message: t('sendMoney.opening_camera', 'Opening camera...') })} activeOpacity={0.8}>
                    <Ionicons name="qr-code-outline" size={16} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                {/* Recipient Dropdown List Box */}
                {isDropdownVisible && (
                  <View style={styles.dropdownListBox}>
                    <View style={{ paddingVertical: 4 }}>
                      {isSearchingApi && <ActivityIndicator color="#0F172A" style={{ marginVertical: 8 }} />}
                    
                    {/* Item 0: Add permanent beneficiary */}
                    <TouchableOpacity 
                      style={styles.addPermanentItem}
                      onPress={() => navigation.navigate('EditBeneficiaryScreen')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.addPermanentIconBox}>
                        <Ionicons name="person-add-outline" size={16} color="#D97706" />
                      </View>
                      <View style={styles.recipientTextWrap}>
                        <Text style={styles.addPermanentTitle}>{t('common.wallet.add_new_beneficiary', 'Add permanent beneficiary')}</Text>
                        <Text style={styles.addPermanentSubtitle}>{t('contacts.add_permanent_sub', 'Add to saved permanent contacts')}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Recipient List Items */}
                    {filteredRecipients.map((item) => (
                      <TouchableOpacity 
                        key={item.id}
                        style={styles.dropdownItemRow}
                        onPress={() => handleSelectRecipient(item)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.dropdownAvatarCircle}>
                          <Ionicons name="person-outline" size={16} color="#94A3B8" />
                        </View>
                        <View style={styles.recipientTextWrap}>
                          <Text style={styles.dropdownRecipientName}>{item.name}</Text>
                          <View style={styles.tagAddressRow}>
                            <View style={styles.tagBadge}>
                              <Text style={styles.tagBadgeText}>{item.tag}</Text>
                            </View>
                            <Text style={styles.dropdownAddressText} numberOfLines={1} ellipsizeMode="middle">
                              {item.address}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                )}
              </View>
            ) : (
              /* Selected Recipient Card with Clear (x) Button */
              <View style={styles.recipientCard}>
                <View style={styles.userAvatarCircle}>
                  <Ionicons name="person-outline" size={16} color="#2563EB" />
                </View>
                
                <View style={styles.recipientInfoWrap}>
                  <Text style={styles.recipientName} numberOfLines={1} ellipsizeMode="tail">
                    {selectedRecipient.name}
                  </Text>
                  <Text style={styles.recipientAddress} numberOfLines={1} ellipsizeMode="middle">
                    {selectedRecipient.address && selectedRecipient.address.length > 20
                      ? `${selectedRecipient.address.slice(0, 8)}...${selectedRecipient.address.slice(-6)}`
                      : selectedRecipient.address}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.clearRecipientBtn}
                  onPress={() => {
                    setIsSearchingRecipient(true);
                    setIsDropdownVisible(true);
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={14} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}

            {/* Section 2: Provisioned Token (Positive balances prioritized) */}
            <Text style={styles.fieldLabel}>{t('pos.token_caps', 'TOKEN')}</Text>
            <View style={styles.selectBoxRow}>
              <View style={{ marginRight: 8 }}>
                <CryptoIcon symbol={token} size={26} />
              </View>
              <AppSelect
                value={token}
                options={availableTokens.map((item) => {
                  const bal = getBalanceForToken(item.value);
                  return {
                    ...item,
                    label: bal > 0 ? `${item.value} (${bal.toFixed(2)})` : item.value,
                    subtitle: bal > 0 ? `Available: ${bal.toFixed(4)}` : item.subtitle,
                  };
                })}
                onChange={(val) => setToken(val)}
                title={t('pos.choose_currency', 'Choose Currency')}
                style={styles.appSelectFlex}
                textStyle={styles.selectTextBold}
              />
            </View>

            {/* Compact Network Selection Under Token — Polygon default with multichain preservation */}
            <View style={styles.compactNetworkRow}>
              <View style={styles.compactNetworkLabelGroup}>
                <Text style={styles.compactNetworkLabel}>{t('common.wallet.network', 'Network')}:</Text>
                <CryptoIcon symbol={blockchain} size={15} style={{ marginHorizontal: 4 }} />
              </View>
              <AppSelect
                value={blockchain}
                options={BLOCKCHAINS}
                onChange={(val) => setBlockchain(val)}
                title={t('common.wallet.select_chain', 'Select Network')}
                style={styles.compactAppSelect}
                textStyle={styles.compactSelectText}
              />
              {blockchain === 'Polygon' ? (
                <View style={styles.compactDefaultBadge}>
                  <Text style={styles.compactDefaultBadgeText}>DEFAULT (EVM)</Text>
                </View>
              ) : (
                <View style={styles.compactCustomBadge}>
                  <Text style={styles.compactCustomBadgeText}>CUSTOM</Text>
                </View>
              )}
            </View>

            {/* Section 3: Amount & Available Balance */}
            <View style={styles.amountHeaderRow}>
              <Text style={styles.fieldLabelNoMargin}>{t('common.wallet.amount', 'Amount')}</Text>
              <View style={[styles.availableBadge, hasZeroBalance && styles.availableBadgeEmpty]}>
                <Text style={[styles.availableBadgeText, hasZeroBalance && styles.availableBadgeTextEmpty]}>
                  {t('common.wallet.available', 'Available')}: {currentAvailableBalance.toFixed(4)} {token}
                </Text>
              </View>
            </View>

            {/* Top-Up CTA banner if zero balance */}
            {hasZeroBalance && (
              <TouchableOpacity
                style={styles.topUpBannerRow}
                onPress={() => navigation.navigate('TopUpWalletConfirmationScreen', {
                  pivotScreen: 'SendMoneyScreen',
                  pivotParams: route.params,
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={16} color="#D97706" />
                <Text style={styles.topUpBannerText}>
                  {t('sendMoney.topUpNeeded', 'Zero balance. Tap to Top-Up {{token}}', { token })}
                </Text>
                <Ionicons name="arrow-forward" size={13} color="#D97706" />
              </TouchableOpacity>
            )}

            <View style={styles.amountInputRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.amountTokenSuffix}>{token}</Text>
            </View>

            {/* Main CTA Button */}
            <TouchableOpacity style={styles.sendCtaBtn} onPress={handleSend} activeOpacity={0.88} disabled={isSending}>
              {isSending ? <ActivityIndicator color="#FFFFFF" /> : (
                <>
                  <Ionicons name="paper-plane-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.sendCtaText}>{t('pos.send_token', 'Send')} {token}</Text>
                </>
              )}
            </TouchableOpacity>

          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}

        {/* 🌟 Modal when beneficiary has no crypto wallet linked */}
        <Modal
          visible={!!missingWalletItem}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMissingWalletItem(null)}
        >
          <View style={modalStyles.overlay}>
            <View style={modalStyles.card}>
              <View style={modalStyles.iconCircle}>
                <Ionicons name="wallet-outline" size={26} color="#FFC759" />
              </View>

              <Text style={modalStyles.title}>
                {t('wallet.no_crypto_wallet_title', 'No Crypto Wallet Linked')}
              </Text>
              
              <Text style={modalStyles.desc}>
                {t('wallet.no_crypto_wallet_desc', '{{name}} has not linked a crypto wallet on DizzitUp yet. How would you like to proceed?', { name: missingWalletItem?.name || '' })}
              </Text>

              <View style={modalStyles.btnCol}>
                {/* Option 1: Send SMS / WhatsApp Invite */}
                <TouchableOpacity
                  style={modalStyles.primaryBtn}
                  onPress={async () => {
                    const recipientName = missingWalletItem?.name || '';
                    const inviteMsg = `Join me on DizzitUp to easily receive funds and manage your payments: https://dizzitup.com/invite`;
                    try {
                      await Share.share({ message: inviteMsg });
                      setMissingWalletItem(null);
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                >
                  <Ionicons name="paper-plane" size={16} color="#20365B" style={{ marginRight: 6 }} />
                  <Text style={modalStyles.primaryBtnText}>
                    {t('wallet.action_send_invite', 'Send Invite (SMS / WhatsApp)')}
                  </Text>
                </TouchableOpacity>

                {/* Option 2: Enter Address Manually */}
                <TouchableOpacity
                  style={modalStyles.secondaryBtn}
                  onPress={() => {
                    setMissingWalletItem(null);
                    setSearchQuery('');
                    setIsSearchingRecipient(true);
                  }}
                >
                  <Ionicons name="create-outline" size={16} color="#20365B" style={{ marginRight: 6 }} />
                  <Text style={modalStyles.secondaryBtnText}>
                    {t('wallet.action_enter_manual', 'Enter Address Manually')}
                  </Text>
                </TouchableOpacity>

                {/* Option 3: Send Airtime or Pay Bills Instead */}
                <TouchableOpacity
                  style={modalStyles.neutralBtn}
                  onPress={() => {
                    const item = missingWalletItem;
                    setMissingWalletItem(null);
                    navigation.navigate('PayBillsScreen', { beneficiary: item });
                  }}
                >
                  <Ionicons name="flash-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={modalStyles.neutralBtnText}>
                    {t('wallet.action_send_essentials', 'Send Airtime or Pay Bills Instead')}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={modalStyles.closeBtn}
                onPress={() => setMissingWalletItem(null)}
              >
                <Text style={modalStyles.closeBtnText}>{t('common.cancel', 'Cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 🌟 Full-Screen Sending Modal (Instant visual feedback & prevents double clicks) */}
        <Modal
          visible={isSending}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={modalStyles.overlay}>
            <View style={[modalStyles.card, { alignItems: 'center', paddingVertical: 28 }]}>
              <View style={[modalStyles.iconCircle, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', marginBottom: 16 }]}>
                <ActivityIndicator size="large" color="#071D54" />
              </View>

              <Text style={[modalStyles.title, { textAlign: 'center', marginBottom: 6 }]}>
                {t('sendMoney.sending_in_progress', 'Sending {{amount}} {{token}}...', { amount, token })}
              </Text>
              
              <Text style={[modalStyles.desc, { textAlign: 'center', marginBottom: 16 }]}>
                {t('sendMoney.broadcasting_node', 'Submitting transaction to {{chain}} network...', { chain: blockchain })}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 }} />
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', letterSpacing: 0.5 }}>
                  {t('sendMoney.secured_blockchain_tx', 'SECURED BLOCKCHAIN TRANSACTION')}
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* 🌟 Explicit Error Modal (Errors are never missed or obscured) */}
        <Modal
          visible={!!errorMessage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setErrorMessage(null)}
        >
          <View style={modalStyles.overlay}>
            <View style={[modalStyles.card, { alignItems: 'center' }]}>
              <View style={[modalStyles.iconCircle, { backgroundColor: '#FEE2E2', borderColor: '#FECACA', marginBottom: 14 }]}>
                <Ionicons name="alert-circle" size={28} color="#DC2626" />
              </View>

              <Text style={[modalStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
                {t('sendMoney.tx_error_title', 'Transaction Notice')}
              </Text>
              
              <Text style={[modalStyles.desc, { textAlign: 'center', marginBottom: 20 }]}>
                {errorMessage}
              </Text>

              <TouchableOpacity
                style={[modalStyles.primaryBtn, { backgroundColor: '#071D54', width: '100%', justifyContent: 'center' }]}
                onPress={() => setErrorMessage(null)}
              >
                <Text style={[modalStyles.primaryBtnText, { color: '#FFFFFF' }]}>
                  {t('common.done', 'Done')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 🔐 Crossmint Signature / Biometric Handshake Modal */}
        <Modal visible={txStatus === 'awaiting-approval'} transparent animationType="fade">
          <View style={approvalModalStyles.modalOverlay}>
            <View style={approvalModalStyles.modalContent}>
              <View style={approvalModalStyles.modalHeaderIcon}>
                <Ionicons name="lock-closed" size={28} color="#EA580C" />
              </View>
              <Text style={approvalModalStyles.modalTitle}>{t('common.wallet.swap_ui.signature_required', 'Signature Required')}</Text>
              <Text style={approvalModalStyles.modalSubtitle}>{t('common.wallet.swap_ui.crossmint_action_needed', 'Crossmint Action Needed')}</Text>

              <View style={approvalModalStyles.modalInfoBox}>
                <Text style={approvalModalStyles.modalInfoTextBold}>{t('common.wallet.swap_ui.verification_request', 'A verification request has been deployed to your profile.')}</Text>
                <View style={approvalModalStyles.emailBadge}>
                  <Text style={approvalModalStyles.emailBadgeText}>{t('common.wallet.swap_ui.check_email', '📧 Check Email:')} {signerEmail}</Text>
                </View>
                <Text style={approvalModalStyles.modalInfoText}>{t('common.wallet.swap_ui.secure_link_prompt', 'Please follow the secure external link or utilize biometric passkey authorizations if prompted.')}</Text>
              </View>

              <TouchableOpacity
                style={[approvalModalStyles.authBtn, isAuthorizing && approvalModalStyles.authBtnDisabled]}
                onPress={handleAuthorize}
                disabled={isAuthorizing}
              >
                {isAuthorizing ? <ActivityIndicator color="#FFF" /> : <Ionicons name="lock-closed" size={20} color="#FFF" style={{ marginRight: 8 }} />}
                <Text style={approvalModalStyles.authBtnText}>
                  {isAuthorizing ? t('common.wallet.swap_ui.authorizing', 'Authorizing...') : t('common.wallet.swap_ui.authorize_swap', 'Authorize Release')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setTxStatus(null); setIsAuthorizing(false); }} style={approvalModalStyles.dismissBtn}>
                <Text style={approvalModalStyles.dismissBtnText}>{t('common.wallet.swap_ui.dismiss_banner', 'Dismiss Banner')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: { flex: 1, position: 'relative' },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 70, zIndex: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: isSmallScreen ? 12 : 16, paddingBottom: 12, maxWidth: 520, width: '100%', alignSelf: 'center' },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: isSmallScreen ? 16 : 18, color: '#0F172A' },
  secureTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  secureTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', letterSpacing: 0.5 },
  headerRightIcons: { flexDirection: 'row' },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative', backgroundColor: '#FFFFFF' },
  notificationDot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759' },
  mainScroll: { flex: 1 },
  scrollContent: { paddingHorizontal: isSmallScreen ? 12 : 16, paddingTop: 8, paddingBottom: 60, maxWidth: 500, width: '100%', alignSelf: 'center' },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', padding: isSmallScreen ? 12 : 14, boxShadow: '0px 4px 10px #0F172A', maxWidth: 500, width: '100%', alignSelf: 'center' },
  fieldLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#64748B', letterSpacing: 0.5, marginBottom: 5, marginTop: 8, textTransform: 'uppercase' },
  fieldLabelNoMargin: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#64748B' },
  selectBoxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2, marginBottom: 6 },
  tokenIconBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  appSelectFlex: { flex: 1, borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' },
  selectTextBold: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#0F172A' },
  
  /* Compact Network Selection Under Token */
  compactNetworkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 10 },
  compactNetworkLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  compactNetworkLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#64748B' },
  compactAppSelect: { flex: 1, borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent', paddingVertical: 0 },
  compactSelectText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#0F172A' },
  compactDefaultBadge: { backgroundColor: '#15803D', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 4 },
  compactDefaultBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#FFFFFF', letterSpacing: 0.5 },
  compactCustomBadge: { backgroundColor: '#EFF6FF', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 4 },
  compactCustomBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#2563EB', letterSpacing: 0.5 },
  availableBadgeEmpty: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  availableBadgeTextEmpty: { color: '#DC2626' },
  topUpBannerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 12, justifyContent: 'space-between' },
  topUpBannerText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#B45309', flex: 1, marginHorizontal: 8 },

  /* Recipient Search Section (Compact) */
  searchSectionWrapper: { marginBottom: 10 },
  searchInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#0F172A', borderRadius: 14, paddingHorizontal: 10, height: 44, marginBottom: 6 },
  searchInputField: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, color: '#0F172A' },
  pasteButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 5 },
  pasteButtonText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#475569', letterSpacing: 0.5 },
  qrCodeButton: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  dropdownListBox: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0px 2px 6px #000' },
  addPermanentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF5', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  addPermanentIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addPermanentTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#0F172A', marginBottom: 1 },
  addPermanentSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#94A3B8' },
  dropdownItemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dropdownAvatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  recipientTextWrap: { flex: 1 },
  dropdownRecipientName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#0F172A', marginBottom: 1 },
  tagAddressRow: { flexDirection: 'row', alignItems: 'center' },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, marginRight: 5 },
  tagBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#475569' },
  dropdownAddressText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8' },

  /* Selected Recipient Card (Compact) */
  recipientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 10, marginBottom: 10, overflow: 'hidden' },
  userAvatarCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 10, flexShrink: 0 },
  recipientInfoWrap: { flex: 1, minWidth: 0, marginRight: 6, justifyContent: 'center' },
  recipientName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#0F172A', marginBottom: 1 },
  recipientAddress: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
  clearRecipientBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  
  /* Amount Section (Compact) */
  amountHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 4 },
  availableBadge: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  availableBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#D97706' },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 12, height: 46, marginBottom: 14 },
  amountInput: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#0F172A', outlineStyle: 'none' },
  amountTokenSuffix: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: '#64748B' },
  sendCtaBtn: { backgroundColor: '#071D54', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 46, borderRadius: 12, boxShadow: '0px 4px 8px #071D54' },
  sendCtaText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#FFFFFF' },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 54, 91, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  btnCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#20365B',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#20365B',
  },
  neutralBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
  },
  neutralBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#0F172A',
  },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  closeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#94A3B8',
  },
});

const approvalModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
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
    color: '#EA580C',
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
  },
});
