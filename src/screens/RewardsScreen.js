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
import {
  scale,
  moderateScale,
  isSmallScreen,
  isShortScreen,
  windowWidth,
} from '../utils/responsive';
import { getCountryCurrencyInfo } from '../utils/countryCurrencyUtils';
import { supabase } from '../services/supabaseClient';

export default function RewardsScreen() {
  const navigation = useNavigation();
  const { t, user, hideBalance, toggleHideBalance } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});

  const isVisible = !hideBalance;

  // Real or dynamic user referral code
  const referralCode =
    user?.referralCode ||
    (user?.id ? `DZY-${user.id.slice(0, 6).toUpperCase()}` : 'DZY-VIP');

  // Dynamic Rewards Balance from user profile or wallet balance
  const totalRewardsDzy = Number(user?.rewardsDZY !== null && user?.rewardsDZY !== undefined ? user.rewardsDZY : (user?.balanceDZY || 0));

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
          data.forEach((r) => (ratesMap[r.target_currency] = r.rate));
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
  const dzyInUsd = totalRewardsDzy * 0.1;
  const localRate = exchangeRates[primaryCountry.currency] || 655.957; // Default XOF rate if unavailable
  const primaryBalance = dzyInUsd * localRate;

  const formatNum = (num, min = 2, max = 2) =>
    (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    });

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
        'Join me on DizzitUp to send money, shop, and pay bills in Africa with zero hassle! Use my referral code {{code}} to earn rewards: https://dizzitup.com/invite?ref={{code}}',
        { code: referralCode }
      );
      await Share.share({
        message: shareMsg,
        title: t('rewards.title', 'DZY Rewards'),
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
            accessibilityLabel={t('common.back', 'Back')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#1A2840" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {t('rewards.title', 'DZY Rewards')}
          </Text>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.iconSquareBtn}
              onPress={() => setShowHelpModal(true)}
              accessibilityLabel={t('rewards.actions.rules', 'How it Works')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="help-circle-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconSquareBtn}
              onPress={handleShareInvite}
              accessibilityLabel={t('rewards.actions.invite', 'Invite & Earn')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
          {/* Custom DZY Rewards Balance Card */}
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={['#20365B', '#111D33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainCard}
            >
              {/* Header Row */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.titleWrapper}>
                  <View style={styles.iconCircle}>
                    <Image
                      source={require('../../assets/brand/finalLogo.png')}
                      style={{ width: isSmallScreen ? 28 : 34, height: isSmallScreen ? 28 : 34 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.badgeText} numberOfLines={1}>
                        {t('rewards.loyalty_badge', 'DZY LOYALTY REWARDS')}
                      </Text>
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>
                          {t('rewards.pre_tge_badge', 'PRE-TGE')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.rateSubtitle} numberOfLines={1}>
                      {t('rewards.token_valuation', '10 DZY = $1.00 USD (Polygon ERC-20)')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={toggleHideBalance}
                  style={styles.eyeIcon}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={isVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="rgba(255,255,255,0.75)"
                  />
                </TouchableOpacity>
              </View>

              {/* Central Balance Display */}
              <View style={styles.heroBalanceBox}>
                <Text style={styles.heroBalanceLabel}>
                  {t('rewards.total_earned_label', 'TOTAL REWARDS BALANCE')}
                </Text>

                <View style={styles.amountRow}>
                  <Text
                    style={[styles.heroAmountText, !isVisible && styles.blurredText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatNum(totalRewardsDzy, 2, 2)}
                  </Text>
                  <View style={styles.dzyTokenTag}>
                    <Text style={styles.dzyTagText}>DZY</Text>
                  </View>
                </View>

                <View style={styles.equivRow}>
                  <Text
                    style={[styles.equivText, !isVisible && styles.blurredText]}
                    numberOfLines={1}
                  >
                    ≈ ${formatNum(dzyInUsd, 2, 2)} USD
                  </Text>
                  <View style={styles.equivDot} />
                  <Text
                    style={[styles.equivText, styles.equivTextLocal, !isVisible && styles.blurredText]}
                    numberOfLines={1}
                  >
                    ≈ {formatNum(primaryBalance, 0, 0)} {primaryCountry.currency}
                  </Text>
                </View>
              </View>

              {/* Status Pill */}
              <View style={styles.statusPillContainer}>
                <View style={styles.statusPill}>
                  <Ionicons name="sparkles" size={13} color="#FFC759" style={{ marginRight: 5 }} />
                  <Text style={styles.statusPillText}>
                    {t('rewards.pre_tge_chip', 'Pre-TGE Off-Chain Rewards')}
                  </Text>
                </View>
              </View>

              {/* Rewards Actions Bar */}
              <View style={styles.rewardsActionsRow}>
                <TouchableOpacity
                  style={styles.rewardActionBtn}
                  onPress={handleShareInvite}
                  activeOpacity={0.8}
                >
                  <Ionicons name="gift-outline" size={15} color="#FFC759" />
                  <Text style={styles.rewardActionLabel} numberOfLines={1}>
                    {t('rewards.actions.invite', 'Invite & Earn')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.rewardActionDivider} />

                <TouchableOpacity
                  style={styles.rewardActionBtn}
                  onPress={() => navigation.navigate('PayBillsScreen')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="receipt-outline" size={15} color="#FFC759" />
                  <Text style={styles.rewardActionLabel} numberOfLines={1}>
                    {t('rewards.actions.use_bills', 'Pay & Earn')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.rewardActionDivider} />

                <TouchableOpacity
                  style={styles.rewardActionBtn}
                  onPress={() => setShowHelpModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="information-circle-outline" size={15} color="#FFC759" />
                  <Text style={styles.rewardActionLabel} numberOfLines={1}>
                    {t('rewards.actions.rules', 'How it Works')}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Distinction Clarification Chip */}
            <View style={styles.distinctionChip}>
              <Ionicons
                name="bulb-outline"
                size={16}
                color="#071D54"
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text style={styles.distinctionText}>
                {t(
                  'rewards.distinction_note',
                  'DZY is your loyalty reward balance. You earn DZY on every bill, mobile recharge, and purchase. All tokens accumulate in your account and will unlock at the Token Generation Event (TGE).'
                )}
              </Text>
            </View>
          </View>

          {/* Section 1: Full Cash-Back Program Table (Solofo's Core Request) */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>
                {t('rewards.cashback_title', 'Cashback on All Payments')}
              </Text>
              <View style={styles.sectionTag}>
                <Text style={styles.sectionTagText}>
                  {t('rewards.cashback_badge_pill', 'Up to 5% Cashback')}
                </Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              {t(
                'rewards.cashback_sub',
                'Earn DZY automatically every time you pay bills, top up mobile airtime, or shop'
              )}
            </Text>
          </View>

          {/* Full Clean Cashback Table Card */}
          <View style={styles.cashbackTableCard}>
            {/* Row 1: Payment in DZY (Highlighted) */}
            <View style={[styles.tableRow, styles.tableRowFeatured]}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="flash" size={18} color="#D97706" />
              </View>
              <View style={styles.methodInfoWrap}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>
                    {t('rewards.rate_dzy_title', 'Payment in DZY')}
                  </Text>
                  <View style={styles.bestRateBadge}>
                    <Text style={styles.bestRateBadgeText}>
                      {t('rewards.rate_dzy_badge', 'Best Rate')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.methodSubtext} numberOfLines={1}>
                  {t('rewards.rate_dzy_sub', 'Highest cashback value across all services')}
                </Text>
              </View>
              <View style={styles.ratePillWrap}>
                <View style={[styles.ratePill, styles.ratePillFeatured]}>
                  <Text style={styles.ratePillTextFeatured}>5%</Text>
                </View>
                <Text style={styles.rateNoteText}>{t('rewards.rate_dzy_note', 'Active at TGE')}</Text>
              </View>
            </View>

            <View style={styles.tableRowDivider} />

            {/* Row 2: Stablecoins */}
            <View style={styles.tableRow}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="cube-outline" size={18} color="#2563EB" />
              </View>
              <View style={styles.methodInfoWrap}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>
                    {t('rewards.rate_stablecoins_title', 'Payment in Stablecoins')}
                  </Text>
                  <View style={[styles.methodCategoryBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.methodCategoryBadgeText, { color: '#1D4ED8' }]}>
                      {t('rewards.rate_stablecoins_badge', 'Crypto')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.methodSubtext} numberOfLines={1}>
                  {t('rewards.rate_stablecoins_sub', 'USDC & USDT payments')}
                </Text>
              </View>
              <View style={styles.ratePillWrap}>
                <View style={[styles.ratePill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Text style={[styles.ratePillText, { color: '#1D4ED8' }]}>3%</Text>
                </View>
              </View>
            </View>

            <View style={styles.tableRowDivider} />

            {/* Row 3: Mobile Money */}
            <View style={styles.tableRow}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="phone-portrait-outline" size={18} color="#10B981" />
              </View>
              <View style={styles.methodInfoWrap}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>
                    {t('rewards.rate_momo_title', 'Payment by Mobile Money')}
                  </Text>
                  <View style={[styles.methodCategoryBadge, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.methodCategoryBadgeText, { color: '#047857' }]}>
                      {t('rewards.rate_momo_badge', 'Mobile Money')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.methodSubtext} numberOfLines={1}>
                  {t('rewards.rate_momo_sub', 'Wave, Orange Money, MTN, Moov & more')}
                </Text>
              </View>
              <View style={styles.ratePillWrap}>
                <View style={[styles.ratePill, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <Text style={[styles.ratePillText, { color: '#047857' }]}>2%</Text>
                </View>
              </View>
            </View>

            <View style={styles.tableRowDivider} />

            {/* Row 4: Bank Card */}
            <View style={styles.tableRow}>
              <View style={[styles.methodIconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="card-outline" size={18} color="#475569" />
              </View>
              <View style={styles.methodInfoWrap}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>
                    {t('rewards.rate_cards_title', 'Payment by Bank Card')}
                  </Text>
                  <View style={[styles.methodCategoryBadge, { backgroundColor: '#F8FAFC' }]}>
                    <Text style={[styles.methodCategoryBadgeText, { color: '#475569' }]}>
                      {t('rewards.rate_cards_badge', 'Bank Card')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.methodSubtext} numberOfLines={1}>
                  {t('rewards.rate_cards_sub', 'Visa & Mastercard worldwide')}
                </Text>
              </View>
              <View style={styles.ratePillWrap}>
                <View style={[styles.ratePill, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                  <Text style={[styles.ratePillText, { color: '#475569' }]}>1%</Text>
                </View>
              </View>
            </View>

            {/* Coverage footer note */}
            <View style={styles.tableCoverageBox}>
              <Ionicons name="checkmark-circle-outline" size={15} color="#047857" style={{ marginRight: 6 }} />
              <Text style={styles.tableCoverageText}>
                {t(
                  'rewards.cashback_coverage_note',
                  'Cashback applies to utility bills, mobile airtime, and marketplace purchases.'
                )}
              </Text>
            </View>
          </View>

          {/* Section 2: How to Earn More DZY */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('rewards.how_to_earn', 'More Ways to Earn DZY')}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t('rewards.how_to_earn_sub', 'Boost your rewards by inviting your community and merchants')}
            </Text>
          </View>

          {/* Program Card 1: Refer a Merchant (50 DZY) */}
          <View style={styles.programCard}>
            <View style={styles.programCardHeader}>
              <View style={[styles.programIconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="storefront" size={22} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={[styles.miniBadgeText, { color: '#6D28D9' }]}>
                      {t('rewards.refer_merchant_badge', 'Earn 50 DZY (≈ $5.00)')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.programTitle} numberOfLines={1}>
                  {t('rewards.refer_merchant_title', 'Refer a Business / Shop')}
                </Text>
              </View>
            </View>

            <Text style={styles.programDesc}>
              {t(
                'rewards.refer_merchant_desc',
                'Recommend a local merchant or shop owner. Earn 50 DZY once they register and accept payments on DizzitUp.'
              )}
            </Text>

            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={() => navigation.navigate('ReferBusinessScreen')}
              activeOpacity={0.85}
            >
              <Ionicons name="business-outline" size={16} color="#7C3AED" style={{ marginRight: 6 }} />
              <Text style={[styles.outlineActionBtnText, { color: '#7C3AED' }]}>
                {t('rewards.btn_refer_merchant', 'Refer a Merchant')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Program Card 2: Refer a Friend (10 DZY) */}
          <View style={styles.programCard}>
            <View style={styles.programCardHeader}>
              <View style={[styles.programIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="people" size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.miniBadgeText, { color: '#B45309' }]}>
                      {t('rewards.refer_friend_badge', 'Earn 10 DZY (≈ $1.00)')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.programTitle} numberOfLines={1}>
                  {t('rewards.refer_friend_title', 'Refer Friends & Family')}
                </Text>
              </View>
            </View>

            <Text style={styles.programDesc}>
              {t(
                'rewards.refer_friend_desc',
                'Share your code with friends. Earn 10 DZY as soon as they make their first payment or top-up.'
              )}
            </Text>

            {/* Referral Code Box */}
            <View style={styles.referralCodeBox}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.codeLabel}>
                  {t('rewards.referral_code_label', 'Your Referral Code')}
                </Text>
                <Text style={styles.codeValue} numberOfLines={1}>
                  {referralCode}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.copyBtn, copiedCode && styles.copyBtnSuccess]}
                onPress={handleCopyCode}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={copiedCode ? 'checkmark-circle' : 'copy-outline'}
                  size={15}
                  color={copiedCode ? '#FFFFFF' : '#1A2840'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.copyBtnText, copiedCode && { color: '#FFFFFF' }]}>
                  {copiedCode ? t('rewards.code_copied', 'Copied!') : t('rewards.btn_copy_code', 'Copy')}
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
                {t('rewards.btn_share_invite', 'Share Invite Link')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Program Card 3: Merchant Settlement Bonus */}
          <View style={styles.programCard}>
            <View style={styles.programCardHeader}>
              <View style={[styles.programIconWrap, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="wallet-outline" size={22} color="#4F46E5" />
              </View>
              <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: '#E0E7FF' }]}>
                    <Text style={[styles.miniBadgeText, { color: '#3730A3' }]}>
                      {t('rewards.merchant_settle_badge', 'For Business Owners')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.programTitle} numberOfLines={1}>
                  {t('rewards.merchant_settle_title', 'Merchant Settlement Bonus')}
                </Text>
              </View>
            </View>

            <Text style={styles.programDesc}>
              {t(
                'rewards.merchant_settle_desc',
                'Merchants who settle sales in DZY receive a 3% volume bonus, 2% for Stablecoins, and 1% for Mobile Money.'
              )}
            </Text>
          </View>

          {/* Section 3: Transparent Token Roadmap (Pre-TGE Guide) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('rewards.roadmap_title', 'DZY Token Roadmap')}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t('rewards.roadmap_sub', 'Transparent, simple, and community-first')}
            </Text>
          </View>

          {/* Roadmap Stepper Card */}
          <View style={styles.roadmapCard}>
            {/* Step 1 */}
            <View style={styles.roadmapStepRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <View style={styles.stepLine} />
              </View>
              <View style={styles.stepContentWrap}>
                <Text style={styles.stepTitle}>
                  {t('rewards.step1_title', '1. Accumulate (Current)')}
                </Text>
                <Text style={styles.stepDesc}>
                  {t(
                    'rewards.step1_desc',
                    'Earn DZY on every transaction and referral. Balances are safely recorded off-chain in your profile.'
                  )}
                </Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.roadmapStepRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepCircle, styles.stepCirclePending]}>
                  <Ionicons name="time-outline" size={14} color="#2563EB" />
                </View>
                <View style={styles.stepLine} />
              </View>
              <View style={styles.stepContentWrap}>
                <Text style={styles.stepTitle}>
                  {t('rewards.step2_title', '2. Token Generation (TGE)')}
                </Text>
                <Text style={styles.stepDesc}>
                  {t(
                    'rewards.step2_desc',
                    'Official smart contract mint on Polygon ERC-20 (target Q4 2026). Your off-chain rewards convert 1:1 on-chain.'
                  )}
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.roadmapStepRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepCircle, styles.stepCircleFuture]}>
                  <Ionicons name="swap-horizontal-outline" size={14} color="#64748B" />
                </View>
              </View>
              <View style={styles.stepContentWrap}>
                <Text style={styles.stepTitle}>
                  {t('rewards.step3_title', '3. Full Utility & Swaps')}
                </Text>
                <Text style={styles.stepDesc}>
                  {t(
                    'rewards.step3_desc',
                    'Direct payment for bills, goods, and gift cards, or swap to USDC/USDT on decentralized markets.'
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Official Polygon Utility Token Banner */}
          <View style={styles.infoBoxBanner}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#1A2840" style={{ marginRight: 10 }} />
            <Text style={styles.infoBoxText}>
              {t(
                'rewards.token_info_banner',
                'DZY is the official utility token of the DizzitUp ecosystem built on Polygon ERC-20, guaranteeing fast, low-cost, and secure transactions.'
              )}
            </Text>
          </View>

          {/* Footer Note */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              {t(
                'rewards.footer_terms',
                'Rewards are calculated automatically and credited directly to your DZY account.'
              )}
            </Text>
          </View>

          <View style={{ height: isShortScreen ? 20 : 36 }} />
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
                <TouchableOpacity
                  onPress={() => setShowHelpModal(false)}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>
                {t('rewards.faq_title', 'About DZY Rewards')}
              </Text>

              <Text style={styles.modalDesc}>
                {t(
                  'rewards.faq_desc',
                  "DZY is DizzitUp's community utility token designed to reward every payment, referral, and merchant in Africa and the diaspora."
                )}
              </Text>

              <View style={styles.modalHighlightRow}>
                <View style={styles.modalDot} />
                <Text style={styles.modalHighlightText}>
                  {t('rewards.faq_item_1', '1 DZY = $0.10 USD (10 DZY = $1.00 USD).')}
                </Text>
              </View>

              <View style={styles.modalHighlightRow}>
                <View style={styles.modalDot} />
                <Text style={styles.modalHighlightText}>
                  {t(
                    'rewards.faq_item_2',
                    'Earn up to 5% instant cashback on all utility bills, mobile airtime, and marketplace purchases.'
                  )}
                </Text>
              </View>

              <View style={styles.modalHighlightRow}>
                <View style={styles.modalDot} />
                <Text style={styles.modalHighlightText}>
                  {t(
                    'rewards.faq_item_3',
                    'No complicated tiers: everyone gets fair, high-yield cashback based directly on the payment method used.'
                  )}
                </Text>
              </View>

              <View style={styles.modalHighlightRow}>
                <View style={styles.modalDot} />
                <Text style={styles.modalHighlightText}>
                  {t(
                    'rewards.faq_item_4',
                    'Tokens accumulate safely in your account before TGE, where they will convert 1:1 to on-chain Polygon DZY.'
                  )}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalDismissBtn}
                onPress={() => setShowHelpModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalDismissBtnText}>
                  {t('rewards.modal_close', 'Got it')}
                </Text>
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
    paddingTop:
      Platform.OS === 'android'
        ? Math.max(StatusBar.currentHeight || 0, 44) + 6
        : 14,
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
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 16 : 18,
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Hero Balance Card */
  cardContainer: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    marginTop: 6,
    marginBottom: 20,
  },
  mainCard: {
    borderRadius: 22,
    padding: isSmallScreen ? 14 : 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: isSmallScreen ? 36 : 42,
    height: isSmallScreen ? 36 : 42,
    borderRadius: isSmallScreen ? 18 : 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#FFC759',
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: 'rgba(255, 199, 89, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.4)',
  },
  proBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: '#FFC759',
    letterSpacing: 0.5,
  },
  rateSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 10 : 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  eyeIcon: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* Central Hero Balance */
  heroBalanceBox: {
    alignItems: 'center',
    marginVertical: isSmallScreen ? 14 : 18,
  },
  heroBalanceLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: isSmallScreen ? 10 : 11,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  heroAmountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 28 : 34,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  dzyTokenTag: {
    backgroundColor: 'rgba(255, 199, 89, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 89, 0.4)',
  },
  dzyTagText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#FFC759',
  },
  equivRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  equivText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: isSmallScreen ? 12 : 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  equivTextLocal: {
    color: '#FFC759',
  },
  equivDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 8,
  },
  blurredText: {
    opacity: 0.25,
  },

  /* Status Pill */
  statusPillContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  statusPillText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: isSmallScreen ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.95)',
  },

  /* Actions Bar */
  rewardsActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rewardActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  rewardActionLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  rewardActionDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  /* Distinction Note */
  distinctionChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: isSmallScreen ? 10 : 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  distinctionText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#334155',
    lineHeight: isSmallScreen ? 16 : 18,
  },

  /* Section Header */
  sectionHeader: {
    paddingHorizontal: isSmallScreen ? 14 : 20,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 16 : 18,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sectionTagText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#B45309',
  },
  sectionSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 12 : 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: isSmallScreen ? 16 : 18,
  },

  /* Cashback Table Card */
  cashbackTableCard: {
    marginHorizontal: isSmallScreen ? 12 : 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallScreen ? 12 : 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 22,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 10 : 12,
    paddingHorizontal: 4,
  },
  tableRowFeatured: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tableRowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  methodIconWrap: {
    width: isSmallScreen ? 34 : 38,
    height: isSmallScreen ? 34 : 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  methodInfoWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  methodTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 13 : 14,
    color: '#0F172A',
  },
  bestRateBadge: {
    backgroundColor: '#FFC759',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestRateBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    color: '#1A2840',
  },
  methodCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodCategoryBadgeText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 9,
  },
  methodSubtext: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#64748B',
    marginTop: 2,
  },
  ratePillWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ratePill: {
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 46,
    alignItems: 'center',
  },
  ratePillFeatured: {
    backgroundColor: '#FFC759',
    borderColor: '#F59E0B',
  },
  ratePillTextFeatured: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 14 : 15,
    color: '#1A2840',
  },
  ratePillText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 13 : 14,
  },
  rateNoteText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 9,
    color: '#D97706',
    marginTop: 2,
  },
  tableCoverageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  tableCoverageText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: isSmallScreen ? 10 : 11,
    color: '#166534',
    lineHeight: 15,
  },

  /* Program Cards */
  programCard: {
    marginHorizontal: isSmallScreen ? 12 : 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallScreen ? 14 : 18,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  programCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  programIconWrap: {
    width: isSmallScreen ? 40 : 44,
    height: isSmallScreen ? 40 : 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  miniBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 10 : 11,
  },
  programTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 14 : 16,
    color: '#0F172A',
  },
  programDesc: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 12 : 13,
    color: '#475569',
    lineHeight: isSmallScreen ? 17 : 19,
    marginBottom: 14,
  },

  /* Referral Code Box */
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  codeLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 14 : 16,
    color: '#0F172A',
    letterSpacing: 1,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  copyBtnText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 13 : 14,
    color: '#1A2840',
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    borderRadius: 12,
  },
  outlineActionBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 13 : 14,
  },

  /* Roadmap Stepper */
  roadmapCard: {
    marginHorizontal: isSmallScreen ? 12 : 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: isSmallScreen ? 14 : 18,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  roadmapStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#10B981',
  },
  stepCirclePending: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  stepCircleFuture: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepLine: {
    width: 2,
    height: 46,
    backgroundColor: '#E2E8F0',
    marginVertical: 3,
  },
  stepContentWrap: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 13 : 14,
    color: '#0F172A',
    marginBottom: 3,
  },
  stepDesc: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#64748B',
    lineHeight: isSmallScreen ? 16 : 18,
  },

  /* Official Banner & Footer */
  infoBoxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: isSmallScreen ? 12 : 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: isSmallScreen ? 12 : 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  infoBoxText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 11 : 12,
    color: '#475569',
    lineHeight: isSmallScreen ? 16 : 18,
  },
  footerRow: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  footerText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: isSmallScreen ? 18 : 22,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: isSmallScreen ? 17 : 19,
    color: '#0F172A',
    marginBottom: 6,
  },
  modalDesc: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: isSmallScreen ? 12 : 13,
    color: '#475569',
    lineHeight: isSmallScreen ? 18 : 20,
    marginBottom: 16,
  },
  modalHighlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFC759',
    marginTop: 6,
    marginRight: 10,
  },
  modalHighlightText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: isSmallScreen ? 12 : 13,
    color: '#1E293B',
    lineHeight: isSmallScreen ? 17 : 19,
  },
  modalDismissBtn: {
    backgroundColor: '#20365B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  modalDismissBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
