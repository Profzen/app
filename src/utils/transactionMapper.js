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

  return {
    id: tx.id || tx.hash,
    type: type,
    status: tx.status?.toUpperCase() || "COMPLETED",
    amount: tx.amount,
    currency: tx.token || "USDC",
    timestamp: new Date(tx.timestamp || tx.createdAt),
    toFrom: toFrom,
    merchant: meta.merchantName || meta.serviceProvider || (type === "PAYMENT" ? "Merchant" : ""),
    country: meta.countryCode || (tx.chain === "polygon" ? "" : ""), 
    chain: tx.chain || "Polygon",
    source: "wallet",
    txHash: tx.hash || tx.txHash,
    onChain: tx.onChain,
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

  return {
    id: tx.id,
    type: isMerchant ? TRANSACTION_TYPES.SALE : TRANSACTION_TYPES.BUY,
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
