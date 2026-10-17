export function getWalletIdentity(user, session) {
  const isMerchant = user?.role === 'merchant';
  if (isMerchant) {
    const hasShop = Boolean(user?.merchantProfile);
    let reason = null;
    if (!hasShop) {
      const status = user?.merchantShopStatus;
      if (status === 'inactive') {
        reason = 'shop_inactive';
      } else if (status === 'multiple') {
        reason = 'multi_shop';
      } else {
        reason = 'no_shop';
      }
    }
    return {
      isMerchant: true,
      token: user?.businessDizzyToken || null,
      evm: user?.businessEvmAddress || null,
      solana: user?.businessSolanaAddress || null,
      reason,
    };
  }
  return {
    isMerchant: false,
    token: user?.dizzyToken || session?.access_token || null,
    evm: user?.evmAddress || null,
    solana: user?.solanaAddress || null,
    reason: null,
  };
}

export function getWalletErrorMessage(reason, t) {
  if (!reason) return '';
  if (reason === 'shop_inactive') {
    return t
      ? t('common.wallet.shop_inactive', 'Your shop is currently deactivated. Please contact support.')
      : 'Your shop is currently deactivated. Please contact support.';
  }
  if (reason === 'multi_shop') {
    return t
      ? t('common.wallet.multi_shop', 'Several shops are linked to this account. Please contact support.')
      : 'Several shops are linked to this account. Please contact support.';
  }
  return t
    ? t('common.wallet.no_shop', 'Finish setting up your shop to activate your business wallet.')
    : 'Finish setting up your shop to activate your business wallet.';
}

export default getWalletIdentity;
