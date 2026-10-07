import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share, Platform, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import * as Clipboard from 'expo-clipboard';
import AppToast from '../components/AppToast';
import RatingPromptModal from '../components/RatingPromptModal';
import { useApp } from '../context/AppContext';
import { getFlagEmoji, getCountryFromPhone, getFullCountryName } from '../utils/countryCurrencyUtils';

export default function PaymentSuccessScreen({ route }) {
  const navigation = useNavigation();
  const { t, user, language } = useApp();
  const [toast, setToast] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRatingModal(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const tx = route?.params?.transaction || {};
  const txRef = tx.orderId || tx.id || tx.txHash || (tx.created_at ? 'ORD-' + new Date(tx.created_at).getTime() : 'ORD-' + Date.now());
  const displayAmount = tx.amount
    ? `${Number(tx.amount).toLocaleString(language === 'en' ? 'en-US' : 'fr-FR')} ${tx.currency || 'FCFA'}`
    : (tx.amountCrypto || '');
  const serviceTitle = tx.title || t('paymentSuccess.marketplacePurchase', 'Achat Marketplace');
  const merchantName = tx.merchantName || t('paymentSuccess.partnerMerchant', 'Commerçant Partenaire');
  const recipientName = tx.recipientName || tx.recipient || merchantName || user?.name || user?.email || '';
  const recipientSub = tx.recipientAddress || tx.phone || (user?.city ? `${user.city}, ${user.country || ''}` : '');
  const paymentMethodName = tx.paymentMethod || 'DZY Wallet';
  const dateFormatted = tx.date
    ? new Date(tx.date).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Resolve recipient country and real flag
  const resolvedCountry = tx.recipientCountry || tx.recipient?.country || tx.merchantCountry || user?.country || '';
  const resolvedPhone = tx.recipientPhone || tx.phone || tx.recipient?.phone || user?.phone || '';
  const countryFromPhone = getCountryFromPhone(resolvedPhone);
  const recipientCountryName = resolvedCountry || getFullCountryName(countryFromPhone) || '';
  const recipientFlag = getFlagEmoji(resolvedCountry || countryFromPhone);

  const shareReceipt = async () => {
    try {
      await Share.share({
        title: t('paymentSuccess.shareTitle', 'DizzitUp Receipt'),
        message: `${serviceTitle} • ${displayAmount} • ${t('paymentSuccess.orderRef', 'Réf')}: ${txRef}${tx.escrowPin ? ` • PIN: ${tx.escrowPin}` : ''}`
      });
    } finally {
      setToast({
        title: t('paymentSuccess.receiptSharedTitle', 'Reçu partagé'),
        message: t('paymentSuccess.receiptSharedDesc', 'Lien de partage prêt.')
      });
    }
  };

  const copyTransaction = async () => {
    await Clipboard.setStringAsync(txRef);
    setToast({
      title: t('paymentSuccess.txCopiedTitle', 'Réf copiée'),
      message: t('paymentSuccess.txCopiedDesc', 'Référence copiée dans le presse-papier.'),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header (Top Right Icons only) */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('HomeScreen')}>
            <Ionicons name="home-outline" size={22} color="#1A2840" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={shareReceipt} accessibilityLabel={t('paymentSuccess.receiptSharedTitle', 'Share receipt')}>
            <Ionicons name="share-outline" size={22} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Success Animation / Icon Area */}
          <View style={styles.successArea}>
            <View style={styles.successHalo}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.successTitle}>{t('paymentSuccess.title', 'Paiement Réussi !')}</Text>
            <Text style={styles.successSub}>
              {tx.escrowPin
                ? t('paymentSuccess.fundsEscrowed', 'Your funds are secured under an on-chain Smart Contract.')
                : t('paymentSuccess.subtitle', 'Votre paiement a été validé avec succès.')}
            </Text>

            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              <Text style={styles.secureText}>{t('paymentSuccess.secure', '100% Sécurisé par Smart Contract Escrow')}</Text>
            </View>
          </View>

          {/* Secret Escrow PIN Banner for Buy Goods */}
          {!!tx.escrowPin && (
            <View style={styles.escrowSuccessCard}>
              <View style={styles.escrowSuccessHeader}>
                <Ionicons name="key" size={18} color="#FFB800" />
                <Text style={styles.escrowSuccessTitle}>{t('paymentSuccess.escrowPinTitle', 'Votre Code Secret de Livraison')}</Text>
              </View>
              <View style={styles.escrowPinDisplay}>
                <Text style={styles.escrowPinText}>{tx.escrowPin}</Text>
              </View>
              <Text style={styles.escrowSuccessNote}>
                {t('paymentSuccess.escrowPinNote', 'Give this 4-digit secret code to the courier or Shop Manager ONLY after receiving and physically inspecting your items.')}
              </Text>
            </View>
          )}

          {/* Transaction Details Card */}
          <View style={styles.detailsCard}>

            {/* Contact / Recipient Row */}
            <View style={styles.contactRow}>
              <View style={styles.contactAvatarFallback}>
                <Text style={styles.contactAvatarText}>{recipientName.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{recipientName}</Text>
                <Text style={styles.contactRelation}>{serviceTitle}</Text>
                <View style={styles.contactLocation}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" />
                  <Text style={styles.contactLocationText}>{recipientFlag ? `${recipientFlag} ` : ''}{recipientSub}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{t('paymentSuccess.statusSuccess', 'Validé')}</Text>
              </View>
            </View>

            {/* Service / Merchant Row */}
            <View style={styles.serviceRow}>
              <View style={styles.serviceIconBox}>
                <Ionicons name="storefront-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{serviceTitle}</Text>
                <Text style={styles.serviceProvider}>{merchantName}</Text>
              </View>
              <Text style={styles.serviceAmount}>{displayAmount}</Text>
            </View>

            <View style={styles.divider} />

            {/* Detailed Info Rows */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('paymentSuccess.dateTime', 'Date & Heure')}</Text>
              <Text style={styles.detailValue}>{dateFormatted}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('paymentSuccess.paymentMethod', 'Moyen de paiement')}</Text>
              <View style={styles.paymentMethod}>
                <Text style={styles.detailValueBold}>{paymentMethodName}</Text>
              </View>
            </View>

            {!!tx.amountCrypto && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('paymentSuccess.cryptoDebited', 'Montant Crypto débité')}</Text>
                <Text style={styles.detailValue}>{tx.amountCrypto}</Text>
              </View>
            )}

            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.detailLabel}>{t('paymentSuccess.totalPaid', 'Total réglé')}</Text>
              <Text style={styles.totalValue}>{displayAmount}</Text>
            </View>

            <View style={[styles.detailRow, { marginBottom: 0 }]}>
              <Text style={styles.detailLabel}>{t('paymentSuccess.orderRef', 'Réf Commande')}</Text>
              <View style={styles.txNumberRow}>
                <Text style={styles.txNumberValue}>{txRef}</Text>
                <TouchableOpacity style={{ marginLeft: 8 }} onPress={copyTransaction}>
                  <Ionicons name="copy-outline" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

          </View>

          {/* Cashback Reward Banner */}
          <View style={styles.rewardBanner}>
            <View style={styles.giftIconWrapper}>
              <Text style={{ fontSize: 48 }}>🎁</Text>
              <View style={styles.giftCheck}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.rewardContent}>
              <Text style={styles.rewardTitle}>{t('paymentSuccess.cashbackWon', { amount: '2.50', defaultValue: 'You earned {{amount}} DZY in Cashback!' })}</Text>
              <Text style={styles.rewardSub}>{t('paymentSuccess.cashbackCredited', 'This reward has been credited to your DZYWallet.')}</Text>
              <TouchableOpacity style={styles.rewardLink} onPress={() => navigation.navigate('RewardsScreen')}>
                <Text style={styles.rewardLinkText}>{t('paymentSuccess.viewRewards', 'View my Rewards')}</Text>
                <Ionicons name="arrow-forward" size={14} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Partager mon succès CTA Card */}
          <TouchableOpacity
            style={styles.shareCtaCard}
            onPress={() => {
              navigation.navigate('ShareSuccessPlatformScreen', {
                transactionData: {
                  type: 'payment',
                  amount: tx.amount ? String(tx.amount) : '',
                  token: tx.currency || 'FCFA',
                  recipientName: recipientName || merchantName,
                  recipientCountry: recipientCountryName || user?.country || '',
                  recipientFlag: recipientFlag,
                  date: dateFormatted,
                  txHash: txRef,
                  actionKey: 'actionSent',
                },
              });
            }}
            activeOpacity={0.88}
          >
            <View style={styles.shareIconWrapper}>
              {/* Yellow spark rays top right */}
              <View style={styles.sparkRaysWrap}>
                <View style={[styles.sparkRay, { transform: [{ rotate: '-30deg' }] }]} />
                <View style={[styles.sparkRay, { transform: [{ rotate: '0deg' }] }]} />
                <View style={[styles.sparkRay, { transform: [{ rotate: '30deg' }] }]} />
              </View>

              <View style={styles.shareWhiteSquare}>
                <Ionicons name="share-social-outline" size={24} color="#071D54" />
              </View>
            </View>

            <View style={styles.shareTextWrap}>
              <Text style={styles.shareCtaTitle}>{t('paymentSuccess.shareMySuccess', 'Share my success')}</Text>
              <Text style={styles.shareCtaSub1}>
                {t('paymentSuccess.shareRewardSub', 'Earn 1 DZY by tagging @DizzitUp')}
              </Text>
              <Text style={styles.shareCtaSub2}>
                {t('paymentSuccess.shareCustomCard', 'Publish a customized DizzitUp card of this transaction')}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#FFC759" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {(route?.params?.pivotScreen === 'ContactProfileScreen' || tx?.pivotScreen === 'ContactProfileScreen') && (
              <TouchableOpacity 
                style={styles.pivotContactBtn} 
                onPress={() => navigation.navigate('ContactProfileScreen', route?.params?.pivotParams || tx?.pivotParams)}
              >
                <Ionicons name="person-circle-outline" size={20} color="#071D54" style={{ marginRight: 8 }} />
                <Text style={styles.pivotContactBtnText}>
                  {t('paymentSuccess.backToContact', 'Retour au profil du contact')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <Ionicons name="receipt-outline" size={20} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>{t('paymentSuccess.viewReceipt', 'View receipt')}</Text>
            </TouchableOpacity>

            <View style={styles.secondaryBtnRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ShopsScreen')}>
                <Ionicons name="refresh-outline" size={20} color="#1A2840" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryBtnText}>{t('paymentSuccess.makeAnotherPayment', 'Make another payment')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('HomeScreen')}>
                <Ionicons name="home-outline" size={20} color="#1A2840" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryBtnText}>{t('paymentSuccess.backToHome', 'Back to Home')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="Accueil" />
        <RatingPromptModal visible={showRatingModal} onClose={() => setShowRatingModal(false)} />
        {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  container: {
    flex: 1,
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 40 },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  successArea: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  successHalo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 8,
  },
  successSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  secureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  escrowSuccessCard: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  escrowSuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  escrowSuccessTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#92400E',
  },
  escrowPinDisplay: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginVertical: 8,
  },
  escrowPinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    letterSpacing: 8,
    color: '#B45309',
    textAlign: 'center',
  },
  escrowSuccessNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  contactAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    boxShadow: '0px 2px 8px #000',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  contactRelation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contactLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  contactLocationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  flagIcon: {
    width: 14,
    height: 10,
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#10B981',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },
  serviceProvider: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  serviceAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  detailValueBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usdcIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  totalRow: {
    marginBottom: 16,
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#10B981',
  },
  txNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txNumberValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  rewardBanner: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftIconWrapper: {
    marginRight: 16,
    position: 'relative',
  },
  giftCheck: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFBEB',
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 4,
  },
  rewardHighlight: {
    color: '#10B981',
  },
  rewardSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  rewardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  rewardLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    marginRight: 4,
  },

  /* Partager mon succès CTA Card Styles */
  shareCtaCard: {
    backgroundColor: '#071D54',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(7,29,84,0.2)',
    elevation: 4,
  },
  shareIconWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  sparkRaysWrap: {
    position: 'absolute',
    top: -6,
    right: -4,
    flexDirection: 'row',
    gap: 2,
    zIndex: 2,
  },
  sparkRay: {
    width: 2,
    height: 6,
    backgroundColor: '#FFC759',
    borderRadius: 1,
  },
  shareWhiteSquare: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareTextWrap: {
    flex: 1,
    paddingRight: 4,
  },
  shareCtaTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  shareCtaSub1: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  goldText: {
    color: '#FFC759',
    fontFamily: 'Inter_700Bold',
  },
  shareCtaSub2: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#94A3B8',
    lineHeight: 14,
  },

  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  pivotContactBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    borderWidth: 1.5,
    borderColor: '#071D54',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  pivotContactBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#071D54',
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC759',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
});
