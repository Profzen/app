export const TRANSACTION_TYPES = {
  SEND: "SEND",
  RECEIVE: "RECEIVE",
  TOP_UP: "TOP-UP",
  SWAP: "SWAP",
  STAKE: "STAKE",
  CASH_OUT: "CASH-OUT",
  BUY: "BUY",
  PAY: "PAY",
  SALE: "SALE",
};

export const normalizeTransaction = (tx, source, currentUserId) => {
  const strippedCurrentId = currentUserId ? (currentUserId.startsWith("biz_") ? currentUserId.replace("biz_", "") : currentUserId) : null;

  switch (source) {
    case "wallet":
      return mapWalletTx(tx, strippedCurrentId);
    case "remittance":
      return mapRemittanceTx(tx);
    case "marketplace":
      return mapMarketplaceTx(tx, strippedCurrentId);
    case "pay-bills":
      return mapPayBillsTx(tx);
    default:
      return tx;
  }
};

const mapWalletTx = (tx, currentUserId) => {
  const type = tx.type?.toUpperCase() || "SEND";
  const meta = typeof tx.metadata === "string" ? JSON.parse(tx.metadata || "{}") : (tx.metadata || {});

  let toFrom = "External Wallet";
  if (type === "SWAP" || type === "STAKE" || type === "TOP-UP") {
    toFrom = "You";
  } else if (type === "SEND") {
    toFrom = meta.beneficiary_name || meta.toName || meta.recipient || tx.toAddress || tx.to || "Unknown";
  } else if (type === "RECEIVE") {
    toFrom = meta.sender_name || meta.fromName || meta.sender || tx.fromAddress || tx.from || "Unknown";
  }

  const isValidOnChainHash = (h, chain = '') => {
    if (!h || typeof h !== 'string') return false;
    // Exclude internal UUIDs, errors, or placeholder text
    if (h.includes('-') || h.includes('error') || h.includes('undefined')) return false;
    const c = chain.toLowerCase();
    if (c.includes('solana')) {
      return h.length >= 40 && h.length <= 90;
    }
    // EVM (Polygon, Base, Ethereum, BSC): must start with 0x and standard hash length
    return h.startsWith('0x') && h.length >= 64;
  };

  const chainName = (tx.chain || "Polygon").toLowerCase();
  const candidateHashes = [
    meta?.blockchainHash,
    tx.onChain?.txHash,
    meta?.onChain?.txHash,
    tx.hash,
    tx.txHash
  ];
  const realOnChainHash = candidateHashes.find(h => isValidOnChainHash(h, chainName)) || null;
  const rawHash = realOnChainHash || tx.hash || tx.txHash || null;

  let explorerLink = tx.onChain?.explorerLink || meta?.onChain?.explorerLink || meta?.explorerUrl;
  // Discard invalid explorerLink containing a UUID, error, or incomplete path
  if (explorerLink && (explorerLink.includes('-') || explorerLink.endsWith('/tx/') || explorerLink.includes('undefined') || explorerLink.includes('/error'))) {
    explorerLink = null;
  }

  // Only auto-generate explorerLink if there is a verified on-chain blockchain hash
  if (!explorerLink && realOnChainHash) {
    if (chainName.includes("polygon") || chainName.includes("matic")) {
      explorerLink = `https://polygonscan.com/tx/${realOnChainHash}`;
    } else if (chainName.includes("base")) {
      explorerLink = `https://basescan.org/tx/${realOnChainHash}`;
    } else if (chainName.includes("solana")) {
      explorerLink = `https://solscan.io/tx/${realOnChainHash}`;
    } else if (chainName.includes("bsc") || chainName.includes("bnb")) {
      explorerLink = `https://bscscan.com/tx/${realOnChainHash}`;
    } else {
      explorerLink = `https://etherscan.io/tx/${realOnChainHash}`;
    }
  }

  const effectiveOnChain = (realOnChainHash && explorerLink) ? { txHash: realOnChainHash, explorerLink } : null;

  return {
    id: tx.id || tx.hash,
    type: type,
    status: tx.status?.toUpperCase() || "COMPLETED",
    amount: tx.amount,
    currency: tx.token || "USDC",
    timestamp: new Date(tx.timestamp || tx.createdAt),
    toFrom: toFrom,
    merchant: meta.merchantName || meta.serviceProvider || (type === "PAYMENT" ? "Merchant" : ""),
    country: meta.countryCode || "", 
    chain: tx.chain || "Polygon",
    source: "wallet",
    txHash: rawHash,
    onChain: effectiveOnChain,
    explorerLink: explorerLink,
    metadata: meta,
    rawAddress: type === "SEND" ? (tx.toAddress || tx.to) : type === "RECEIVE" ? (tx.fromAddress || tx.from) : null
  };
};

const mapRemittanceTx = (tx) => {
  return {
    id: tx.id,
    type: TRANSACTION_TYPES.SEND,
    status: tx.status?.toUpperCase() || "PENDING",
    amount: tx.send_amount,
    currency: tx.send_currency || "USD",
    timestamp: new Date(tx.created_at),
    toFrom: tx.beneficiaries?.full_name || `${tx.beneficiaries?.first_name || ''} ${tx.beneficiaries?.last_name || ''}`.trim(),
    merchant: "DizzitUp Remit",
    country: tx.beneficiaries?.country_code || "",
    chain: "Off-chain",
    source: "remittance",
    txHash: null,
    metadata: tx
  };
};

const getCountryCode = (countryName) => {
  if (!countryName || countryName === "Global") return null;
  const cleanName = countryName.trim();
  
  const staticMap = {
    "Algeria": "DZ", "Angola": "AO", "Benin": "BJ", "Botswana": "BW", "Burkina Faso": "BF",
    "Burundi": "BI", "Cabo Verde": "CV", "Cameroon": "CM", "Central African Republic": "CF",
    "Chad": "TD", "Comoros": "KM", "Democratic Republic of the Congo": "CD", "DR Congo": "CD",
    "Republic of the Congo": "CG", "Djibouti": "DJ", "Egypt": "EG", "Equatorial Guinea": "GQ",
    "Eritrea": "ER", "Eswatini": "SZ", "Ethiopia": "ET", "Gabon": "GA", "Gambia": "GM",
    "Ghana": "GH", "Guinea": "GN", "Guinea-Bissau": "GW", "Ivory Coast": "CI", "Côte d'Ivoire": "CI",
    "Kenya": "KE", "Lesotho": "LS", "Liberia": "LR", "Libya": "LY", "Madagascar": "MG",
    "Malawi": "MW", "Mali": "ML", "Mauritania": "MR", "Mauritius": "MU", "Morocco": "MA",
    "Mozambique": "MZ", "Namibia": "NA", "Niger": "NE", "Nigeria": "NG", "Rwanda": "RW",
    "Sao Tome and Principe": "ST", "Senegal": "SN", "Seychelles": "SC", "Sierra Leone": "SL",
    "Somalia": "SO", "South Africa": "ZA", "South Sudan": "SS", "Sudan": "SD", "Tanzania": "TZ",
    "Togo": "TG", "Tunisia": "TN", "Uganda": "UG", "Zambia": "ZM", "Zimbabwe": "ZW"
  };
  
  const mapKey = Object.keys(staticMap).find(k => k.toLowerCase() === cleanName.toLowerCase());
  if (mapKey) return staticMap[mapKey];

  return cleanName.length === 2 ? cleanName.toUpperCase() : null;
};

const mapMarketplaceTx = (tx, currentUserId) => {
  const isMerchant = currentUserId && tx.merchant_id === currentUserId;
  const meta = typeof tx.transaction_details === "string" ? JSON.parse(tx.transaction_details || "{}") : (tx.transaction_details || {});
  
  const merchantData = Array.isArray(tx.merchant) ? tx.merchant[0] : tx.merchant;
  const dbShopName = merchantData?.shop_name || merchantData?.shop_registered_company_name;
  const metaShopName = meta.items?.[0]?.merchantName || meta.items?.[0]?.supplier || "Platform Merchant";
  
  const shopName = dbShopName || metaShopName;
  const rawCountry = merchantData?.country || meta.items?.[0]?.merchantCountry || meta.items?.[0]?.country || "Global";
  const countryCode = getCountryCode(rawCountry);

    // Incoming funds recorded by a webhook: show as a receive, not a purchase
    if (tx.transaction_type === "crypto_topup" || tx.transaction_type === "fiat_topup") {
      const isCrypto = tx.transaction_type === "crypto_topup";
      const hash = isCrypto ? (meta.provider_transaction_id || null) : null;
      const token = meta.currency === "USDT0" ? "USDT" : (meta.currency || "USDC");
      return {
        id: tx.id,
        type: TRANSACTION_TYPES.RECEIVE,
        status: tx.is_completed ? "COMPLETED" : "PENDING",
        amount: tx.transaction_value_usdc,
        currency: token,
        timestamp: new Date(tx.transaction_date || tx.created_at),
        toFrom: isCrypto ? "External Wallet" : "Wallet top-up",
        merchant: "",
        country: null,
        chain: isCrypto ? (meta.network || "On-chain") : "Off-chain",
        source: "marketplace",
        txHash: hash ? hash.toLowerCase() : null,
        metadata: tx,
      };
    }

    let txType = isMerchant ? TRANSACTION_TYPES.SALE : TRANSACTION_TYPES.BUY;

    return {
      id: tx.id,
      type: txType,
      status: tx.is_completed ? "COMPLETED" : "PENDING",
    amount: tx.transaction_value_usdc,
    currency: "USDC",
    timestamp: new Date(tx.transaction_date || tx.created_at),
    toFrom: isMerchant 
      ? (tx.sponsor ? `${tx.sponsor.first_name || ''} ${tx.sponsor.last_name || ''}`.trim() : "Customer")
      : (tx.beneficiary ? `${tx.beneficiary.first_name || ''} ${tx.beneficiary.last_name || ''}`.trim() : "You"),
    merchant: `DizzitUp Market (${shopName}${rawCountry && rawCountry !== "Global" ? ` - ${rawCountry}` : ''})`,
    country: countryCode,
    chain: "Off-chain",
    source: "marketplace",
    txHash: null,
    metadata: tx
  };
};

const mapPayBillsTx = (tx) => {
  let type = TRANSACTION_TYPES.PAY;
  if (tx.serviceType?.toLowerCase() === "airtime" || tx.serviceType?.toLowerCase() === "data") {
    type = TRANSACTION_TYPES.TOP_UP;
  } else if (tx.serviceType?.toLowerCase() === "giftcard") {
    type = TRANSACTION_TYPES.BUY;
  }

  return {
    id: tx.id || tx.orderId,
    type: type,
    status: tx.status?.toUpperCase() || "PENDING",
    amount: tx.amountToBePaid,
    currency: tx.senderCurrencyCode || "USD",
    timestamp: new Date(tx.createdAt),
    toFrom: type === TRANSACTION_TYPES.TOP_UP ? tx.benPhoneNumber : `${tx.benFirstname || ''} ${tx.benSurname || ''}`.trim(),
    merchant: tx.serviceProvider || "Service Provider",
    country: tx.benCountry || "",
    chain: "Off-chain",
    source: "pay-bills",
    txHash: null,
    metadata: tx
  };
};
