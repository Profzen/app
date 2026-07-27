import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

export default function ShareSuccessVisualScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { platform = 'whatsapp', transactionData = {} } = route.params || {};

  const {
    amount = '100',
    token = 'USDC',
    actionType = 'envoyé', // 'envoyé', 'rechargé', 'retiré', 'reçu'
    senderName = 'John Mensah',
    senderCountry = 'Ghana',
    senderFlag = '🇬🇭',
    recipientName = 'Un bénéficiaire',
    recipientCountry = 'Togo',
    recipientFlag = '🇹🇬',
    network = 'Polygon',
    date = '30 Mai 2025 - 09:41',
    txHash = '0x7a3f...e9b2c4d',
  } = transactionData;

  const [toast, setToast] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customStyleIndex, setCustomStyleIndex] = useState(0);

  const cardBackgrounds = ['#071D54', '#0F172A', '#1E1B4B'];

  const toggleModifyVisual = () => {
    setCustomStyleIndex((prev) => (prev + 1) % cardBackgrounds.length);
    setToast({ title: 'Visuel modifié', message: 'Nouveau style de carte appliqué !' });
  };

  const handleContinue = () => {
    navigation.navigate('ShareSuccessCaptionScreen', {
      platform,
      transactionData,
      cardStyle: cardBackgrounds[customStyleIndex],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1A2840" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Aperçu de votre visuel</Text>
            <Text style={styles.headerStepBadge}>Étape 2 sur 3</Text>
            <Text style={styles.headerSubtitle}>
              Voici le visuel qui sera partagé. Vous pourrez modifier le texte à l'étape suivante.
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Visual Template Card */}
          <View style={[styles.visualCard, { backgroundColor: cardBackgrounds[customStyleIndex] }]}>
            
            {/* Top Brand Header inside Card */}
            <View style={styles.visualHeaderRow}>
              <View style={styles.brandRow}>
                <Image 
                  source={require('../../assets/brand/dizzitup_logo_cercle.png')} 
                  style={styles.logoCircleImage} 
                />
                <Text style={styles.brandNameText}>Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
              </View>

              <Text style={styles.hashtagText}>
                #NoBorder<Text style={{ color: '#FFC759' }}>NoMiddleman</Text>
              </Text>
            </View>

            {/* Pill: Transaction réussie */}
            <View style={styles.statusPillWrap}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Transaction réussie !</Text>
                <View style={styles.checkBadgeGreen}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Headline */}
            <Text style={styles.headlineText}>
              J'ai <Text style={styles.goldText}>{actionType}</Text> des fonds
            </Text>

            {/* Huge Amount */}
            <Text style={styles.amountLargeText}>{amount} {token}</Text>
            <Text style={styles.amountSubText}>
              via <Text style={{ color: '#FFC759', fontFamily: 'SpaceGrotesk_700Bold' }}>DZYWallet</Text>
            </Text>

            {/* Inset Details Box */}
            <View style={styles.insetBox}>
              
              {/* Sender & Recipient Row */}
              <View style={styles.usersRow}>
                {/* Sender */}
                <View style={styles.userCol}>
                  <Text style={styles.userLabel}>De</Text>
                  <View style={styles.userAvatarWrap}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatarImg} />
                  </View>
                  <Text style={styles.userName}>{senderName}</Text>
                  <Text style={styles.userCountry}>{senderCountry} {senderFlag}</Text>
                </View>

                {/* Center Arrow */}
                <View style={styles.transferArrowCircle}>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>

                {/* Recipient */}
                <View style={styles.userCol}>
                  <Text style={styles.userLabel}>Vers</Text>
                  <View style={[styles.userAvatarWrap, styles.userAvatarShielded]}>
                    <Ionicons name="person" size={24} color="#CBD5E1" />
                  </View>
                  <Text style={styles.userName}>{recipientName}</Text>
                  <Text style={styles.userCountry}>{recipientCountry} {recipientFlag}</Text>
                </View>
              </View>

              <View style={styles.boxDivider} />

              {/* Metadata Grid (3 columns) */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <View style={styles.metaIconRow}>
                    <View style={styles.purplePolyBadge}>
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>∞</Text>
                    </View>
                    <Text style={styles.metaLabel}>Réseau</Text>
                  </View>
                  <Text style={styles.metaValue}>{network}</Text>
                </View>

                <View style={styles.metaCol}>
                  <View style={styles.metaIconRow}>
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text style={styles.metaLabel}>Date</Text>
                  </View>
                  <Text style={styles.metaValue}>{date}</Text>
                </View>

                <View style={styles.metaCol}>
                  <View style={styles.metaIconRow}>
                    <Ionicons name="pricetag-outline" size={14} color="#94A3B8" />
                    <Text style={styles.metaLabel}>ID de transaction</Text>
                  </View>
                  <View style={styles.hashCopyRow}>
                    <Text style={styles.metaValue} numberOfLines={1}>{txHash}</Text>
                    <Ionicons name="copy-outline" size={12} color="#94A3B8" style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </View>
            </View>

            {/* Visual Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.footerLeft}>
                <Text style={styles.footerSecurityText}>Sécurisé sur blockchains,</Text>
                <Text style={styles.footerHighlightText}>Sans frontière ni intermédiaire</Text>
                
                <View style={styles.footerDivider} />

                <Text style={styles.wannaText}>Wanna do the same?</Text>
                <Text style={styles.joinText}>Join Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>

                <View style={styles.urlPill}>
                  <Ionicons name="globe-outline" size={14} color="#FFC759" style={{ marginRight: 6 }} />
                  <Text style={styles.urlPillText}>dizzitup.com/join</Text>
                </View>
              </View>

              <View style={styles.footerRight}>
                <Image 
                  source={require('../../assets/brand/dizzitup_logo_cercle.png')} 
                  style={styles.logoCircleFooter} 
                />
                <Text style={styles.footerBrandTitle}>Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
                <Text style={styles.footerBrandTagline}>Send More, Get More</Text>
              </View>
            </View>

          </View>

          {/* Control Action Buttons (Row of 2) */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={toggleModifyVisual} activeOpacity={0.8}>
              <Ionicons name="pencil-outline" size={18} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.controlBtnText}>Modifier le visuel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsFullscreen(true)} activeOpacity={0.8}>
              <Ionicons name="expand-outline" size={18} color="#1A2840" style={{ marginRight: 8 }} />
              <Text style={styles.controlBtnText}>Plein écran</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Note Banner */}
          <View style={styles.privacyBanner}>
            <View style={styles.shieldIconCircle}>
              <Ionicons name="shield-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.privacyBannerText}>
              Vos informations personnelles sont protégées. Seuls le pays et le prénom sont visibles.
            </Text>
          </View>

          {/* Bottom Primary Action Button */}
          <TouchableOpacity style={styles.btnPrimary} onPress={handleContinue} activeOpacity={0.88}>
            <Text style={styles.btnPrimaryText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={20} color="#1A2840" style={styles.btnArrowRight} />
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Fullscreen Modal Preview */}
        <Modal visible={isFullscreen} animationType="fade" transparent={true} onRequestClose={() => setIsFullscreen(false)}>
          <View style={styles.modalBg}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsFullscreen(false)}>
              <Ionicons name="close-circle" size={36} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.modalCardContainer}>
              <View style={[styles.visualCard, { backgroundColor: cardBackgrounds[customStyleIndex], width: '92%' }]}>
                <View style={styles.visualHeaderRow}>
                  <View style={styles.brandRow}>
                    <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.logoCircleImage} />
                    <Text style={styles.brandNameText}>Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
                  </View>
                  <Text style={styles.hashtagText}>#NoBorder<Text style={{ color: '#FFC759' }}>NoMiddleman</Text></Text>
                </View>
                <Text style={styles.headlineText}>J'ai <Text style={styles.goldText}>{actionType}</Text> des fonds</Text>
                <Text style={styles.amountLargeText}>{amount} {token}</Text>
                <Text style={styles.amountSubText}>via DZYWallet</Text>
              </View>
            </View>
          </View>
        </Modal>

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
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 60, zIndex: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 38,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  headerStepBadge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },

  /* Visual Card Template */
  visualCard: {
    backgroundColor: '#071D54',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  visualHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircleImage: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  brandNameText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  hashtagText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  statusPillWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 6,
  },
  checkBadgeGreen: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headlineText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  goldText: {
    color: '#FFC759',
  },
  amountLargeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 38,
    color: '#10B981',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  amountSubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 20,
  },
  insetBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    marginBottom: 20,
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userCol: {
    flex: 1,
    alignItems: 'center',
  },
  userLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  userAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 6,
  },
  userAvatarShielded: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 48,
    height: 48,
  },
  userName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  userCountry: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  transferArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  boxDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  purplePolyBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8247E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  metaLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  metaValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  hashCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Footer inside Card */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  footerLeft: {
    flex: 1,
  },
  footerSecurityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#CBD5E1',
  },
  footerHighlightText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFC759',
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
    width: '80%',
  },
  wannaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#CBD5E1',
  },
  joinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  urlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  urlPillText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#071D54',
  },
  footerRight: {
    alignItems: 'center',
  },
  logoCircleFooter: {
    width: 36,
    height: 36,
    marginBottom: 4,
  },
  footerBrandTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  footerBrandTagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#CBD5E1',
    marginTop: 2,
  },

  /* Controls Row */
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  controlBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
  },

  /* Privacy Banner */
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
    borderWidth: 1,
    borderColor: '#FEF08A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  shieldIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  privacyBannerText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },

  /* Primary Button */
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    height: 52,
    position: 'relative',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  btnArrowRight: {
    position: 'absolute',
    right: 20,
  },

  /* Modal */
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalCardContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
