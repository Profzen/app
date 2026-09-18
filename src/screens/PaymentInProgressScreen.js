import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import { useApp } from '../context/AppContext';
import { buyGoodsApi } from '../services/buyGoodsApi';

export default function PaymentInProgressScreen({ route }) {
  const navigation = useNavigation();
  const { clearCart, t, user, language } = useApp();

  const orderData = route?.params?.orderData || {};
  const orderId = route?.params?.orderId || orderData?.orderId || orderData?.id || ('ORD-' + Math.floor(100000 + Math.random() * 900000));
  const escrowPin = orderData?.escrowPin || Math.floor(1000 + Math.random() * 9000).toString();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmations, setConfirmations] = useState(1);
  const [isChecking, setIsChecking] = useState(false);

  const pollTimerRef = useRef(null);

  const getStatusMessage = () => {
    if (confirmations >= 4) return t('paymentInProgress.step4Msg', 'Validation du séquestre escrow...');
    if (confirmations === 3) return t('paymentInProgress.step3Msg', 'Traitement du débit par la banque partenaire...');
    if (confirmations === 2) return t('paymentInProgress.step2Msg', 'Notification envoyée à l’opérateur...');
    return t('paymentInProgress.waitingConfirm', 'Validation de la transaction auprès de la passerelle...');
  };

  const totalAmountVal = Number(orderData.totalAmount ?? orderData.amount ?? 0);
  const orderCurrency = orderData.currency || orderData.items?.[0]?.currency || 'FCFA';

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePaymentSuccess = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    clearCart();
    navigation.replace('PaymentSuccessScreen', {
      transaction: {
        title: orderData.items?.[0]?.name || t('paymentSuccess.marketplacePurchase', 'Commande DizzitUp'),
        amount: totalAmountVal,
        currency: orderCurrency,
        amountCrypto: orderData.selectedToken ? `${orderData.totalUSDC || orderData.amountCrypto || '0'} ${orderData.selectedToken}` : null,
        paymentMethod: orderData.paymentRail === 'momo' || orderData.paymentMethod === 'MOMO'
          ? t('paymentInProgress.momoInstant', 'Mobile Money Instantané')
          : orderData.paymentRail === 'card' || orderData.paymentMethod === 'CARD'
          ? t('paymentInProgress.cardVisaMc', 'Carte Bancaire (Visa/MC)')
          : orderData.paymentRail === 'dzy' || orderData.selectedToken === 'DZY'
          ? 'DZY Wallet'
          : `${orderData.selectedToken || 'USDC'} (${orderData.network || 'Polygon'})`,
        orderId: orderId,
        escrowPin: escrowPin,
        recipientName: orderData.recipient?.name || user?.name || '',
        recipientPhone: orderData.recipient?.phone || user?.phone || '',
        recipientAddress: orderData.recipient?.address || user?.city || '',
        recipientCountry: orderData.recipient?.country || user?.country || '',
        merchantName: orderData.merchant?.name || t('paymentSuccess.partnerMerchant', 'Commerçant Partenaire'),
        date: new Date().toISOString(),
      },
    });
  };

  const checkStatus = async () => {
    try {
      setIsChecking(true);
      const res = await buyGoodsApi.getPaymentStatus(orderId);
      if (res && (res.status === 'completed' || res.status === 'confirmed' || res.status === 'success' || res.success)) {
        handlePaymentSuccess();
        return;
      }
    } catch (e) {
      // Background poll: normal while transaction is pending
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Timer counter
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next === 5) {
          setConfirmations(2);
        } else if (next === 12) {
          setConfirmations(3);
        } else if (next === 20) {
          setConfirmations(4);
        } else if (next >= 30) {
          // If in demo or test environment and 30s elapsed, auto-resolve to avoid infinite wait
          handlePaymentSuccess();
        }
        return next;
      });
    }, 1000);

    // Active status polling every 3.5s
    pollTimerRef.current = setInterval(() => {
      checkStatus();
    }, 3500);

    return () => {
      clearInterval(timer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [orderId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('paymentInProgress.title', 'Paiement en cours')}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('HelpCenterPage')}>
          <Ionicons name="headset-outline" size={22} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#FFB800" />
          </View>
          <Text style={styles.statusTitle}>{t('paymentInProgress.title', 'Paiement en cours...')}</Text>
          <Text style={styles.statusSubtitle}>
            {getStatusMessage()}
          </Text>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.timerText}>
              {t('paymentInProgress.elapsedTime', `Temps écoulé : ${formatTimer(elapsedSeconds)}`, {
                time: formatTimer(elapsedSeconds)
              })}
            </Text>
          </View>
        </View>

        {/* Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepIconCircle, styles.stepIconCircleCompleted]}>
              <Ionicons name="wallet-outline" size={20} color="#10B981" />
              <View style={[styles.stepBadge, { backgroundColor: '#10B981' }]}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.stepTitleCompleted} numberOfLines={1}>{t('paymentInProgress.stepInitiation', 'Initiation')}</Text>
            <Text style={styles.stepSubtitle} numberOfLines={1}>{t('paymentInProgress.stepValidated', 'Validée')}</Text>
          </View>

          <View style={[styles.stepLine, styles.stepLineCompleted]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepIconCircle, styles.stepIconCircleInProgress]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#F59E0B" />
              <View style={[styles.stepBadge, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="time-outline" size={10} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.stepTitleInProgress} numberOfLines={1}>{t('paymentInProgress.stepEscrow', 'Escrow')}</Text>
            <Text style={styles.stepSubtitle} numberOfLines={1}>{t('paymentInProgress.stepSecuring', 'Sécurisation')}</Text>
          </View>

          <View style={[styles.stepLine, confirmations >= 4 ? styles.stepLineCompleted : styles.stepLinePending]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepIconCircle, confirmations >= 4 ? styles.stepIconCircleInProgress : styles.stepIconCirclePending]}>
              <Ionicons name="storefront-outline" size={20} color={confirmations >= 4 ? '#F59E0B' : '#64748B'} />
            </View>
            <Text style={confirmations >= 4 ? styles.stepTitleInProgress : styles.stepTitlePending} numberOfLines={1}>
              {orderData.merchant?.name ? orderData.merchant.name.slice(0, 10) : t('paymentInProgress.stepMerchant', 'Commerçant')}
            </Text>
            <Text style={styles.stepSubtitle} numberOfLines={1}>{t('paymentInProgress.stepPending', 'En attente')}</Text>
          </View>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>{t('paymentInProgress.txDetails', 'Détails de la transaction')}</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="scan-outline" size={16} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.detailLabel}>{t('paymentInProgress.youPay', 'Montant à régler')}</Text>
            </View>
            <View style={styles.detailValueRow}>
              {orderData.selectedToken ? (
                <>
                  <CryptoIcon symbol={orderData.selectedToken} size={20} />
                  <Text style={styles.detailValueBold}>
                    {orderData.totalUSDC || orderData.amountCrypto || '0'} {orderData.selectedToken}
                  </Text>
                </>
              ) : (
                <Text style={styles.detailValueBold}>
                  {totalAmountVal.toLocaleString(language === 'en' ? 'en-US' : 'fr-FR')} {orderCurrency}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="card-outline" size={16} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.detailLabel}>{t('paymentInProgress.paymentMethod', 'Moyen de paiement')}</Text>
            </View>
            <Text style={styles.detailValue}>
              {orderData.paymentRail === 'momo' || orderData.paymentMethod === 'MOMO'
                ? t('paymentInProgress.momoInstant', 'Mobile Money Instantané')
                : orderData.paymentRail === 'card' || orderData.paymentMethod === 'CARD'
                ? t('paymentInProgress.cardVisaMc', 'Carte Bancaire (Visa/MC)')
                : orderData.paymentRail === 'dzy' || orderData.selectedToken === 'DZY'
                ? 'DZY Wallet'
                : `${orderData.selectedToken || 'USDC'} (${orderData.network || 'Polygon'})`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="document-text-outline" size={16} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.detailLabel}>{t('paymentInProgress.orderNumber', 'N° Commande')}</Text>
            </View>
            <Text style={styles.detailValue}>{orderId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Ionicons name="time-outline" size={16} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.detailLabel}>{t('paymentInProgress.status', 'Statut')}</Text>
            </View>
            <View style={styles.statusBadgeYellow}>
              <Text style={styles.statusBadgeTextYellow}>
                {confirmations >= 3
                  ? t('paymentInProgress.stepInValidation', 'En cours de validation')
                  : t('paymentInProgress.stepPending', 'En attente')}
              </Text>
            </View>
          </View>
        </View>

        {/* Confirmation progress card */}
        <View style={styles.cardSection}>
          <View style={styles.blockchainHeader}>
            <Text style={styles.cardTitle}>{t('paymentInProgress.secureConfirmation', 'Confirmation Sécurisée')}</Text>
            <View style={styles.networkBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.networkBadgeText}>{t('paymentInProgress.escrowBadge', 'Escrow Séquestre')}</Text>
            </View>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{t('paymentInProgress.validationSteps', 'Étapes de validation :')}</Text>
            <Text style={styles.progressValue}>
              {t('paymentInProgress.stepCount', `Étape ${confirmations} / 4`, { current: confirmations, total: 4 })}
            </Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(confirmations / 4) * 100}%` }]} />
          </View>
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#10B981" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityBannerTitle}>{t('paymentInProgress.fundsInEscrowTitle', 'Fonds sous Séquestre')}</Text>
            <Text style={styles.securityBannerText}>
              {t('paymentInProgress.fundsInEscrowDesc', 'Le montant ne sera remis au commerçant qu\'après que vous aurez transmis votre code PIN secret au livreur.')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.btnRefresh}
          onPress={checkStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color="#1A2840" />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={18} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.btnRefreshText}>{t('paymentInProgress.checkStatusNow', 'Vérifier le statut maintenant')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnHome} onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.btnHomeText}>{t('paymentInProgress.backToHome', 'Retour à l\'accueil')}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  statusHeader: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  spinnerContainer: {
    marginBottom: 12,
  },
  statusTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 6,
  },
  statusSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  timerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 90,
  },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  stepIconCircleCompleted: {
    backgroundColor: '#ECFDF5',
  },
  stepIconCircleInProgress: {
    backgroundColor: '#FFFBEB',
  },
  stepIconCirclePending: {
    backgroundColor: '#F1F5F9',
  },
  stepBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitleCompleted: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#10B981',
    textAlign: 'center',
  },
  stepTitleInProgress: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#F59E0B',
    textAlign: 'center',
  },
  stepTitlePending: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  stepLinePending: {
    backgroundColor: '#E2E8F0',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
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
    marginVertical: 6,
  },
  statusBadgeYellow: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeTextYellow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#D97706',
  },
  blockchainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  networkBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#065F46',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  progressValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1A2840',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 3,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  securityBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#065F46',
    marginBottom: 2,
  },
  securityBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
  },
  btnRefresh: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  btnRefreshText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  btnHome: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  btnHomeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
});
