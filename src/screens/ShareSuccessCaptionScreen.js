import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppToast from '../components/AppToast';

export default function ShareSuccessCaptionScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { platform = 'whatsapp', transactionData = {}, cardStyle = '#071D54' } = route.params || {};

  const {
    amount = '100',
    token = 'USDC',
    actionType = 'envoyé',
    senderName = 'John Mensah',
    senderCountry = 'Ghana',
    senderFlag = '🇬🇭',
    recipientName = 'Un bénéficiaire',
    recipientCountry = 'Togo',
    recipientFlag = '🇹🇬',
    network = 'Polygon',
    date = '30 Mai 2025 • 09:41',
    txHash = '0x7a3f...e9b2c4d',
  } = transactionData;

  const defaultCaption = `I, ${senderName.split(' ')[0]} from ${senderCountry} ${senderFlag}, successfully sent ${amount} ${token} to a DZYWallet user in ${recipientCountry} ${recipientFlag} with @DizzitUp. Fast, secure and without borders! 🌍 Join DizzitUp 👉 dizzitup.com/join`;

  const [captionText, setCaptionText] = useState(defaultCaption);
  const [isEditable, setIsEditable] = useState(false);
  const [toast, setToast] = useState(null);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({
          title: 'Partager mon succès DizzitUp',
          text: captionText,
          url: 'https://dizzitup.com/join',
        });
      } else {
        await Share.share({
          title: 'Partager mon succès DizzitUp',
          message: captionText,
          url: 'https://dizzitup.com/join',
        });
      }
      setToast({ title: 'Félicitations !', message: 'Succès partagé ! 1 DZY a été crédité sur votre compte.' });
      setTimeout(() => {
        navigation.navigate('RewardsScreen');
      }, 1500);
    } catch (error) {
      setToast({ title: 'Succès partagé', message: '1 DZY crédité dans vos Rewards !' });
      setTimeout(() => {
        navigation.navigate('RewardsScreen');
      }, 1500);
    }
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
            <Text style={styles.headerTitle}>Rédiger votre message</Text>
            <Text style={styles.headerStepBadge}>Étape 3 sur 3</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Stepper 3 Steps (All active) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Ionicons name="checkmark" size={14} color="#1A2840" />
              </View>
              <Text style={styles.stepTextActive}>Choisir le réseau</Text>
            </View>

            <View style={[styles.stepLine, styles.stepLineActive]} />

            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Ionicons name="checkmark" size={14} color="#1A2840" />
              </View>
              <Text style={styles.stepTextActive}>Aperçu du visuel</Text>
            </View>

            <View style={[styles.stepLine, styles.stepLineActive]} />

            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumberActive}>3</Text>
              </View>
              <Text style={[styles.stepTextActive, { color: '#FFC759', fontFamily: 'Inter_700Bold' }]}>Rédiger le message</Text>
            </View>
          </View>

          {/* Subtitle intro */}
          <Text style={styles.introSubtitle}>
            Modifiez votre message si vous le souhaitez{'\n'}et partagez votre succès.
          </Text>

          {/* Condensed Visual Card Preview */}
          <View style={[styles.visualCard, { backgroundColor: cardStyle }]}>
            <View style={styles.visualHeaderRow}>
              <View style={styles.brandRow}>
                <Image source={require('../../assets/brand/dizzitup_logo_cercle.png')} style={styles.logoCircleImage} />
                <Text style={styles.brandNameText}>Dizzit<Text style={{ color: '#FFC759' }}>Up</Text></Text>
              </View>
              <Text style={styles.hashtagText}>#NoBorder<Text style={{ color: '#FFC759' }}>NoMiddleman</Text></Text>
            </View>

            <View style={styles.statusPillWrap}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Transaction réussie !</Text>
                <View style={styles.checkBadgeGreen}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <Text style={styles.headlineText}>J'ai <Text style={styles.goldText}>{actionType}</Text> des fonds</Text>
            <Text style={styles.amountLargeText}>{amount} {token}</Text>
            <Text style={styles.amountSubText}>via <Text style={{ color: '#FFC759', fontFamily: 'SpaceGrotesk_700Bold' }}>DZYWallet</Text></Text>

            {/* Inset box */}
            <View style={styles.insetBox}>
              <View style={styles.usersRow}>
                <View style={styles.userCol}>
                  <Text style={styles.userLabel}>De</Text>
                  <View style={styles.userAvatarWrap}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatarImg} />
                  </View>
                  <Text style={styles.userName}>{senderName}</Text>
                  <Text style={styles.userCountry}>{senderCountry} {senderFlag}</Text>
                </View>

                <View style={styles.transferArrowCircle}>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </View>

                <View style={styles.userCol}>
                  <Text style={styles.userLabel}>Vers</Text>
                  <View style={[styles.userAvatarWrap, styles.userAvatarShielded]}>
                    <Ionicons name="person" size={20} color="#CBD5E1" />
                  </View>
                  <Text style={styles.userName}>{recipientName}</Text>
                  <Text style={styles.userCountry}>{recipientCountry} {recipientFlag}</Text>
                </View>
              </View>

              <View style={styles.boxDivider} />

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Réseau</Text>
                  <Text style={styles.metaValue}>{network}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Date</Text>
                  <Text style={styles.metaValue}>{date}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>ID de transaction</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>{txHash}</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.footerLeft}>
                <Text style={styles.footerSecurityText}>Sécurisé sur blockchains,</Text>
                <Text style={styles.footerHighlightText}>Sans frontière ni Intermédiaire</Text>
              </View>

              <View style={styles.footerRight}>
                <Text style={styles.joinText}>Join <Text style={{ color: '#FFC759' }}>DizzitUp</Text></Text>
                <View style={styles.urlPill}>
                  <Ionicons name="globe-outline" size={12} color="#FFC759" style={{ marginRight: 4 }} />
                  <Text style={styles.urlPillText}>dizzitup.com/join</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section: Votre message */}
          <View style={styles.captionBoxContainer}>
            <Text style={styles.captionBoxTitle}>Votre message</Text>

            <View style={styles.captionInputCard}>
              <TextInput
                style={styles.captionTextInput}
                value={captionText}
                onChangeText={setCaptionText}
                multiline={true}
                editable={isEditable}
                maxLength={280}
              />

              <View style={styles.captionCardFooter}>
                <Text style={styles.charCounterText}>{captionText.length}/280</Text>

                <TouchableOpacity 
                  style={styles.btnCustomize} 
                  onPress={() => setIsEditable(!isEditable)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil-outline" size={16} color="#1A2840" style={{ marginRight: 6 }} />
                  <Text style={styles.btnCustomizeText}>
                    {isEditable ? 'Valider le message' : 'Personnaliser le message'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Main Action Button */}
          <TouchableOpacity style={styles.btnPrimaryShare} onPress={handleShare} activeOpacity={0.88}>
            <Ionicons name="share-social-outline" size={22} color="#1A2840" style={{ marginRight: 10 }} />
            <Text style={styles.btnPrimaryShareText}>Partagez et gagnez 1 DZY</Text>
          </TouchableOpacity>

          {/* Security Note at bottom */}
          <View style={styles.bottomSecurityRow}>
            <Ionicons name="lock-closed-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
            <Text style={styles.bottomSecurityText}>Partagez en toute sécurité. Vos données restent privées.</Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },

  /* Stepper */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
    width: 80,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    borderColor: '#FFC759',
    backgroundColor: '#FFC759',
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  stepTextActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#1A2840',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: '#FFC759',
  },
  introSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },

  /* Condensed Visual Card Preview */
  visualCard: {
    backgroundColor: '#071D54',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#071D54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  visualHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircleImage: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  brandNameText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  hashtagText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  statusPillWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    marginRight: 4,
  },
  checkBadgeGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headlineText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  goldText: {
    color: '#FFC759',
  },
  amountLargeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 2,
  },
  amountSubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 14,
  },
  insetBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    marginBottom: 14,
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userCol: {
    flex: 1,
    alignItems: 'center',
  },
  userLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
  },
  userAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    marginBottom: 4,
  },
  userAvatarShielded: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 38,
    height: 38,
  },
  userName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  userCountry: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#CBD5E1',
  },
  transferArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#94A3B8',
  },
  metaValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  footerSecurityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#CBD5E1',
  },
  footerHighlightText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFC759',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  joinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  urlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  urlPillText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#071D54',
  },

  /* Caption Box */
  captionBoxContainer: {
    marginBottom: 20,
  },
  captionBoxTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#1A2840',
    marginBottom: 10,
  },
  captionInputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  captionTextInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  },
  captionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  charCounterText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  btnCustomize: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnCustomizeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#1A2840',
  },

  /* Primary Button */
  btnPrimaryShare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC759',
    borderRadius: 14,
    height: 52,
    marginBottom: 16,
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimaryShareText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },

  /* Bottom Security Row */
  bottomSecurityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSecurityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
});
