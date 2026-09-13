import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Share,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import BottomNavBar from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';
import { isSmallScreen } from '../utils/responsive';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import { supabase } from '../services/supabaseClient';

export default function RewardsScreen() {
  const navigation = useNavigation();
  const { t, user, hideBalance, toggleHideBalance } = useApp();
  
  const [activeTab, setActiveTab] = useState('spend'); // 'spend' | 'benefits'
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});

  const isVisible = !hideBalance;

  // Real or dynamic user referral code
  const referralCode = user?.referralCode || (user?.id ? `DZY-${user.id.slice(0, 6).toUpperCase()}` : 'DZY-VIP');

  // Dynamic Rewards Balance from user profile or calculated
  const totalRewardsDzy = Number(user?.balanceDZY || user?.rewardsDZY || 2354.82);
  const availableBalanceDzy = Number(user?.balanceDZY || 845.62);

  // Currency conversion setup
  const userCountryKey = (user?.country || '').toLowerCase().trim();
  const primaryCountry = getCountryCurrencyInfo(userCountryKey);

  let secondaryCountry = getCountryCurrencyInfo('united states');
  if (primaryCountry.currency === 'USD') {
    secondaryCountry = getCountryCurrencyInfo('france');
  }

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('target_currency, rate')
          .eq('base_currency', 'USD')
          .eq('status', 'active');
          
        if (!error && data && data.length > 0) {
          const ratesMap = {};
          data.forEach(r => ratesMap[r.target_currency] = r.rate);
          ratesMap['USD'] = 1;
          setExchangeRates(ratesMap);
        }
      } catch (e) {
        console.warn('Failed to fetch rates', e);
      }
    };
    fetchRates();
  }, []);

  // 10 DZY = $1.00 USD -> 1 DZY = $0.10 USD
  const dzyInUsd = totalRewardsDzy * 0.10;
  const localRate = exchangeRates[primaryCountry.currency] || 655.957; // Default XOF rate if unavailable
  const primaryBalance = dzyInUsd * localRate;
  const secondaryRate = exchangeRates[secondaryCountry.currency] || 1;
  const secondaryBalance = dzyInUsd * secondaryRate;

  const formatNum = (num, min = 2, max = 2) => 
    (num || 0).toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.warn('Failed to copy code', e);
    }
  };

  const handleShareInvite = async () => {
    try {
      const shareMsg = t(
        'rewards.share_message',
        'Join me on DizzitUp to send money, shop, and pay bills in Africa with zero hassle! Use my referral code %{code} to get started: https://dizzitup.com/invite/%{code}',
        { code: referralCode }
      );
      await Share.share({
        message: shareMsg,
        title: t('rewards.referral_title', 'DizzitUp Referral'),
      });
    } catch (e) {
      console.warn('Failed to share invite', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconSquareBtn} 
            onPress={() => navigation.goBack()} 
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={20} color="#1A2840" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t('rewards.title', 'DZY Rewards')}</Text>
          
          <View style={styles.headerRightActions}>
            <TouchableOpacity 
              style={styles.iconSquareBtn} 
              onPress={() => setShowHelpModal(true)}
              accessibilityLabel="Aide"
            >
              <Ionicons name="help-circle-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconSquareBtn} 
              onPress={handleShareInvite}
              accessibilityLabel="Partager"
            >
              <Ionicons name="share-social-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Custom DZY Rewards Balance Card (Exact Home Card Dimensions, Height & Luxury Styling) */}
          <View style={styles.cardContainer}>
            <LinearGradient 
              colors={['#20365B', '#111D33']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.mainCard}
            >
              {/* Header: Logo, Badge, Valuation, Eye Toggle */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.titleWrapper}>
                  <View style={styles.iconCircle}>
                    <Image 
                      source={require('../../assets/brand/finalLogo.png')} 
                      style={{ width: 34, height: 34 }} 
                      resizeMode="contain" 
                    />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.badgeText}>DZY LOYALTY & REWARDS</Text>
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>REWARDS ONLY</Text>
                      </View>
                    </View>
                    <Text style={styles.rateSubtitle}>10 DZY = $1.00 USD (Polygon ERC-20)</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={toggleHideBalance} style={styles.eyeIcon}>
                  <Ionicons 
                    name={isVisible ? 'eye-outline' : 'eye-off-outline'} 
                    size={20} 
                    color="rgba(255,255,255,0.7)" 
                  />
                </TouchableOpacity>
              </View>

              {/* Dual-Compartment Rewards Breakdown: Available vs Lifetime */}
              <View style={styles.dualColumnsRow}>
                {/* Left Column: Available DZY to Redeem */}
                <View style={styles.dualCol}>
                  <View style={styles.colHeaderRow}>
                    <Ionicons name="wallet-outline" size={13} color="#FFC759" style={{ marginRight: 4 }} />
                    <Text style={styles.colTitleLabel}>AVAILABLE</Text>
                  </View>
                  <Text style={styles.colSubtext}>To redeem now</Text>

                  <View style={styles.amountContainer}>
                    <Text 
                      style={[styles.colAmountMain, !isVisible && styles.blurredText]} 
                      numberOfLines={1} 
                      adjustsFontSizeToFit
                    >
                      {formatNum(availableBalanceDzy, 2, 2)}
                    </Text>
                    <Text style={styles.dzyTagText}>DZY</Text>
                  </View>

                  <Text style={[styles.equivText, !isVisible && styles.blurredText]} numberOfLines={1}>
                    ≈ ${formatNum(availableBalanceDzy * 0.10, 2, 2)} USD
                  </Text>
                  <Text style={[styles.equivText, !isVisible && styles.blurredText]} numberOfLines={1}>
                    ≈ {formatNum(availableBalanceDzy * 0.10 * localRate, 0, 0)} {primaryCountry.currency}
                  </Text>
                </View>

                {/* Vertical Divider */}
                <View style={styles.verticalDivider} />

                {/* Right Column: Lifetime DZY Earned */}
                <View style={styles.dualCol}>
                  <View style={styles.colHeaderRow}>
                    <Ionicons name="trophy-outline" size={13} color="#FFC759" style={{ marginRight: 4 }} />
                    <Text style={styles.colTitleLabel}>TOTAL EARNED</Text>
                  </View>
                  <Text style={styles.colSubtext}>Since Day 1</Text>

                  <View style={styles.amountContainer}>
                    <Text 
                      style={[styles.colAmountMain, !isVisible && styles.blurredText]} 
                      numberOfLines={1} 
                      adjustsFontSizeToFit
                    >
                      {formatNum(totalRewardsDzy, 2, 2)}
                    </Text>
                    <Text style={styles.dzyTagText}>DZY</Text>
                  </View>

                  <Text style={[styles.equivText, !isVisible && styles.blurredText]} numberOfLines={1}>
                    ≈ ${formatNum(totalRewardsDzy * 0.10, 2, 2)} USD
                  </Text>
                  <Text style={[styles.equivText, !isVisible && styles.blurredText]} numberOfLines={1}>
                    ≈ {formatNum(totalRewardsDzy * 0.10 * localRate, 0, 0)} {primaryCountry.currency}
                  </Text>
                </View>
              </View>

              {/* Badges Pill Row */}
              <View style={styles.perksRow}>
                <View style={styles.perkPill}>
                  <Ionicons name="flash" size={12} color="#FFC759" style={{ marginRight: 4 }} />
                  <Text style={styles.perkPillText}>5% Cashback on Bills</Text>
                </View>
                <View style={styles.perkPill}>
                  <Ionicons name="trending-up" size={12} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={[styles.perkPillText, { color: '#10B981' }]}>8–15% Staking APY</Text>
                </View>
              </View>

              {/* Rewards-Specific Actions Row (No generic wallet transfer buttons!) */}
              <View style={styles.rewardsActionsRow}>
                <TouchableOpacity 
                  style={styles.rewardActionBtn} 
                  onPress={handleShareInvite}
                  activeOpacity={0.8}
                >
                  <Ionicons name="gift-outline" size={15} color="#FFC759" />
                  <Text style={styles.rewardActionLabel}>{t('rewards.actions.invite', 'Invite & Earn')}</Text>
                </TouchableOpacity>

                <View style={styles.rewardActionDivider} />

                <TouchableOpacity 
                  style={styles.rewardActionBtn} 
                  onPress={() => navigation.navigate('PayBillsScreen')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="receipt-outline" size={15} color="#FFC759" />
                  <Text style={styles.rewardActionLabel}>{t('rewards.actions.use_bills', 'Use in Bills')}</Text>
                </TouchableOpacity>

                <View style={styles.rewardActionDivider} />

                <TouchableOpacity 
                  style={styles.rewardActionBtn} 
                  onPress={() => setShowHelpModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="information-circle-outline" size={15} color="#FFC759" />
                  <Text style={styles.rewardActionLabel}>{t('rewards.actions.rules', 'Rules & FAQ')}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Distinction Clarification Chip */}
            <View style={styles.distinctionChip}>
              <Ionicons name="bulb-outline" size={16} color="#071D54" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.distinctionText}>
                {t(
                  'rewards.distinction_note',
                  'DZY is your loyalty reward balance. It is separate from your USDC/USDT cash deposits and can be used on bills, staked for up to 15% APY, or swapped.'
                )}
              </Text>
            </View>
          </View>

          {/* Section: How to Earn DZY (Real Actionable Programs) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('rewards.how_to_earn', 'Comment gagner des DZY')}</Text>
            <Text style={styles.sectionSubtitle}>
              {t('rewards.how_to_earn_sub', 'Participez à l\'écosystème et débloquez des bonus')}
            </Text>
          </View>

          {/* Card 1: Referral Program (Active Invite & Share) */}
          <View style={styles.programCard}>
            <View style={styles.programCardHeader}>
              <View style={[styles.programIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="people" size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.miniBadgeText, { color: '#B45309' }]}>
                      {t('rewards.referral_badge', 'Gagnez $5 en DZY')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.programTitle}>
                  {t('rewards.referral_title', 'Programme de Parrainage')}
                </Text>
              </View>
            </View>

            <Text style={styles.programDesc}>
              {t(
                'rewards.referral_desc',
                'Invitez vos proches. Recevez $5 en DZY dès leur premier transfert ou paiement de facture.'
              )}
            </Text>

            {/* Referral Code Box */}
            <View style={styles.referralCodeBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.codeLabel}>{t('rewards.referral_code_label', 'Votre code parrain')}</Text>
                <Text style={styles.codeValue}>{referralCode}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.copyBtn, copiedCode && styles.copyBtnSuccess]} 
                onPress={handleCopyCode} 
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={copiedCode ? 'checkmark-circle' : 'copy-outline'} 
                  size={15} 
                  color={copiedCode ? '#FFFFFF' : '#1A2840'} 
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.copyBtnText, copiedCode && { color: '#FFFFFF' }]}>
                  {copiedCode ? t('rewards.code_copied', 'Copié !') : t('rewards.btn_copy_code', 'Copier')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Button: Share */}
            <TouchableOpacity 
              style={styles.primaryActionBtn} 
              onPress={handleShareInvite} 
              activeOpacity={0.85}
            >
              <Ionicons name="paper-plane-outline" size={17} color="#1A2840" style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionBtnText}>
                {t('rewards.btn_share_invite', 'Partager le lien d\'invitation')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: 5% Cashback on Bills & Mobile */}
          <View style={styles.programCard}>
            <View style={styles.programCardHeader}>
              <View style={[styles.programIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="flash" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.miniBadgeText, { color: '#047857' }]}>
                      {t('rewards.cashback_badge', '5% de retour DZY')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.programTitle}>
                  {t('rewards.cashback_title', 'Cashback 5% Instantané')}
                </Text>
              </View>
            </View>

            <Text style={styles.programDesc}>
              {t(
                'rewards.cashback_desc',
                'Payez vos factures (électricité, eau, TV) et rechargez votre mobile pour cumuler automatiquement 5% en DZY tokens crédités sur votre compte.'
              )}
            </Text>

            <TouchableOpacity 
              style={styles.outlineActionBtn} 
              onPress={() => navigation.navigate('PayBillsScreen')}
              activeOpacity={0.85}
            >
              <Ionicons name="receipt-outline" size={16} color="#047857" style={{ marginRight: 6 }} />
              <Text style={[styles.outlineActionBtnText, { color: '#047857' }]}>
                {t('rewards.btn_pay_bills', 'Payer une facture maintenant')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 3: Merchant & POS Acceptance Bonus */}
          <View style={styles.programCard}>
            <View style={styles.programCardHeader}>
              <View style={[styles.programIconWrap, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="storefront" size={22} color="#4F46E5" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#E0E7FF' }]}>
                    <Text style={[styles.miniBadgeText, { color: '#3730A3' }]}>
                      {t('rewards.merchant_badge', 'Marchands & POS')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.programTitle}>
                  {t('rewards.merchant_title', 'Encaissement Commerçant')}
                </Text>
              </View>
            </View>

            <Text style={styles.programDesc}>
              {t(
                'rewards.merchant_desc',
                'Encaissez vos clients par QR code ou terminal POS DizzitUp et recevez 1.5% de bonus mensuel en tokens DZY sur votre volume.'
              )}
            </Text>

            <TouchableOpacity 
              style={styles.outlineActionBtn} 
              onPress={() => navigation.navigate('ReferBusinessScreen')}
              activeOpacity={0.85}
            >
              <Ionicons name="business-outline" size={16} color="#4F46E5" style={{ marginRight: 6 }} />
              <Text style={[styles.outlineActionBtnText, { color: '#4F46E5' }]}>
                {t('rewards.btn_register_pos', 'Enregistrer un commerce')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 4: Community & Staking */}
          <View style={styles.miniCardsRow}>
            <View style={styles.miniGridCard}>
              <Ionicons name="shield-checkmark" size={20} color="#FFC759" />
              <Text style={styles.miniGridTitle}>{t('rewards.staking_title', 'Staking DZY')}</Text>
              <Text style={styles.miniGridDesc}>{t('rewards.staking_desc', 'Jusqu\'à 8% APY sur vos tokens immobilisés.')}</Text>
            </View>
            <View style={styles.miniGridCard}>
              <Ionicons name="trophy" size={20} color="#10B981" />
              <Text style={styles.miniGridTitle}>{t('rewards.ambassador_title', 'Ambassadeur')}</Text>
              <Text style={styles.miniGridDesc}>{t('rewards.ambassador_desc', 'Bonus exclusifs pour les leaders communautaires.')}</Text>
            </View>
          </View>

          {/* Section: How to Use / Spend DZY */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('rewards.how_to_spend', 'Comment utiliser vos DZY')}</Text>
            <Text style={styles.sectionSubtitle}>
              {t('rewards.how_to_spend_sub', 'Vos tokens ont une valeur d\'usage réelle et immédiate')}
            </Text>
          </View>

          {/* Toggle Segments */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeTab === 'spend' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('spend')}
            >
              <Text style={[styles.segmentBtnText, activeTab === 'spend' && styles.segmentBtnTextActive]}>
                {t('rewards.tab_spend', 'Paiements & Achats')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.segmentBtn, activeTab === 'benefits' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('benefits')}
            >
              <Text style={[styles.segmentBtnText, activeTab === 'benefits' && styles.segmentBtnTextActive]}>
                {t('rewards.tab_benefits', 'Avantages Membre')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content: Spend Utilities */}
          {activeTab === 'spend' ? (
            <View style={styles.tabContentCard}>
              <View style={styles.utilityItemRow}>
                <View style={[styles.utilityIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="flash-outline" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utilityTitle}>{t('rewards.utility_bills_title', 'Paiement de factures électricité & eau')}</Text>
                  <Text style={styles.utilityDesc}>{t('rewards.utility_bills_desc', 'Déduisez vos DZY directement du montant de vos factures.')}</Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.utilityItemRow}>
                <View style={[styles.utilityIconWrap, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="card-outline" size={18} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utilityTitle}>{t('rewards.utility_cards_title', 'Cartes cadeaux & Boutiques partenaires')}</Text>
                  <Text style={styles.utilityDesc}>{t('rewards.utility_cards_desc', 'Achetez des bons chez les commerçants du réseau DizzitUp.')}</Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.utilityItemRow}>
                <View style={[styles.utilityIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="phone-portrait-outline" size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utilityTitle}>{t('rewards.utility_airtime_title', 'Recharges mobiles instantanées')}</Text>
                  <Text style={styles.utilityDesc}>{t('rewards.utility_airtime_desc', 'Convertissez vos récompenses en crédit téléphonique partout en Afrique.')}</Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.utilityItemRow}>
                <View style={[styles.utilityIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="swap-horizontal-outline" size={18} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utilityTitle}>{t('rewards.utility_swap_title', 'Conversion en Stablecoins')}</Text>
                  <Text style={styles.utilityDesc}>{t('rewards.utility_swap_desc', 'Échangez vos DZY contre de l\'USDC ou USDT à tout moment.')}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.tabContentCard}>
              <View style={styles.utilityItemRow}>
                <View style={[styles.utilityIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="pricetag-outline" size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utilityTitle}>{t('rewards.benefit_fees_title', 'Frais réduits sur les transferts')}</Text>
                  <Text style={styles.utilityDesc}>{t('rewards.benefit_fees_desc', 'Jusqu\'à 50% de réduction sur les envois internationaux.')}</Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.utilityItemRow}>
                <View style={[styles.utilityIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="star-outline" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utilityTitle}>{t('rewards.benefit_vip_title', 'Statut Client Privilégié')}</Text>
                  <Text style={styles.utilityDesc}>{t('rewards.benefit_vip_desc', 'Support dédié 24/7 et plafonds d\'envoi débloqués.')}</Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.utilityItemRow}>
                <View style={[styles.utilityIconWrap, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="gift-outline" size={18} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utilityTitle}>{t('rewards.benefit_airdrops_title', 'Airdrops & Cadeaux partenaires')}</Text>
                  <Text style={styles.utilityDesc}>{t('rewards.benefit_airdrops_desc', 'Distributions régulières de bonus pour les membres actifs.')}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Official Polygon Utility Token Banner */}
          <View style={styles.infoBoxBanner}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#1A2840" style={{ marginRight: 10 }} />
            <Text style={styles.infoBoxText}>
              {t(
                'rewards.token_info_banner',
                'DZY est le utility token officiel de l\'écosystème DizzitUp au standard ERC-20 sur la blockchain Polygon, garantissant transparence et rapidité.'
              )}
            </Text>
          </View>

          {/* Footer Note */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              {t('rewards.footer_terms', 'Les récompenses sont calculées et créditées directement sur votre compte DZY.')}
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar activeTab="home" />

        {/* Real Help / FAQ Modal */}
        <Modal
          visible={showHelpModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="help-circle" size={24} color="#D97706" />
                </View>
                <TouchableOpacity onPress={() => setShowHelpModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{t('rewards.faq_title', 'À propos de DZY Rewards')}</Text>
              
              <Text style={styles.modalDesc}>
                {t(
                  'rewards.faq_desc',
                  'Le token DZY récompense la fidélité de notre communauté. Chaque dollar équivaut à 10 tokens DZY stables dans l\'écosystème.'
                )}
              </Text>

              <View style={styles.modalHighlightRow}>
                <View style={styles.modalDot} />
                <Text style={styles.modalHighlightText}>
                  {t('rewards.faq_item_1', '10 DZY = $1.00 USD de pouvoir d\'achat dans tous nos services.')}
                </Text>
              </View>

              <View style={styles.modalHighlightRow}>
                <View style={styles.modalDot} />
                <Text style={styles.modalHighlightText}>
                  {t('rewards.faq_item_2', 'Cashback automatique de 5% sur tous vos paiements de factures.')}
                </Text>
              </View>

              <View style={styles.modalHighlightRow}>
                <View style={styles.modalDot} />
                <Text style={styles.modalHighlightText}>
                  {t('rewards.faq_item_3', 'Valable pour les factures, recharges, boutiques et conversions.')}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.modalDismissBtn} 
                onPress={() => setShowHelpModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalDismissBtnText}>{t('common.understood', 'J\'ai compris')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallScreen ? 14 : 20,
    paddingBottom: 10,
  },
  iconSquareBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#1A2840',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 30,
  },
  // Card Container matching Home WalletCard dimensions, height and width
  cardContainer: {
    marginHorizontal: isSmallScreen ? 14 : 20,
    marginTop: 6,
    marginBottom: 14,
  },
  mainCard: {
    borderRadius: 20,
    padding: isSmallScreen ? 14 : 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.2)',
    shadowColor: '#0A1737',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 199, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.3)',
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFC759',
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: '#FFC759',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  proBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 7.5,
    color: '#071D54',
  },
  rateSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  eyeIcon: {
    padding: 6,
  },
  blurredText: {
    opacity: 0,
  },
  dualColumnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  dualCol: {
    flex: 1,
  },
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  colTitleLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10.5,
    color: '#FFC759',
    letterSpacing: 0.5,
  },
  colSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#94A3B8',
    marginBottom: 6,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  colAmountMain: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  dzyTagText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10.5,
    color: '#FFC759',
    marginLeft: 3,
  },
  equivText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 13,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 10,
  },
  perksRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  perkPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 199, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.25)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  perkPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFC759',
  },
  distinctionChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
  },
  distinctionText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 15,
  },
  rewardsActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  rewardActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  rewardActionDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  rewardActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: isSmallScreen ? 14 : 20,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  programCard: {
    marginHorizontal: isSmallScreen ? 14 : 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#0A1737',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  programCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  programIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  miniBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  miniBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
  programTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  programDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  codeLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#64748B',
    marginBottom: 2,
  },
  codeValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#1A2840',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  copyBtnSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  copyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 12,
    paddingVertical: 10,
  },
  primaryActionBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12.5,
    color: '#1A2840',
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 10,
  },
  outlineActionBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12.5,
  },
  miniCardsRow: {
    flexDirection: 'row',
    marginHorizontal: isSmallScreen ? 14 : 20,
    gap: 10,
    marginBottom: 14,
  },
  miniGridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#0A1737',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  miniGridTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12.5,
    color: '#1A2840',
    marginTop: 6,
    marginBottom: 2,
  },
  miniGridDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: isSmallScreen ? 14 : 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#64748B',
  },
  segmentBtnTextActive: {
    color: '#1A2840',
  },
  tabContentCard: {
    marginHorizontal: isSmallScreen ? 14 : 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  utilityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  utilityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  utilityTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 2,
  },
  utilityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoBoxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: isSmallScreen ? 14 : 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  infoBoxText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 23, 55, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 8,
  },
  modalDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  modalHighlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFC759',
    marginTop: 6,
    marginRight: 8,
  },
  modalHighlightText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  modalDismissBtn: {
    backgroundColor: '#FFC759',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalDismissBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
});
