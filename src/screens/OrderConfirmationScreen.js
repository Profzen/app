import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Share, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import CryptoIcon from '../components/CryptoIcon';
import AppToast from '../components/AppToast';

export default function OrderConfirmationScreen() {
  const navigation = useNavigation();
  const [toast, setToast] = useState(null);
  const orderUrl = 'jumia.sn/orders/JM-2026-000152';
  const shareOrder = async () => { try { await Share.share({title:'Achetez-moi ceci',message:`Pouvez-vous payer ce produit pour moi ? ${orderUrl}`}); } finally { setToast({title:'Commande partagée',message:'La demande de paiement est prête.'}); } };
  const copyOrder = async () => { await Clipboard.setStringAsync(orderUrl); setToast({title:'Lien copié',message:'Le lien de commande est dans le presse-papiers.'}); };
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Résumé et confirmation</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="headset-outline" size={24} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Security Alert Banner */}
        <View style={styles.securityAlert}>
          <View style={styles.securityAlertIcon}>
            <Ionicons name="lock-closed-outline" size={20} color="#1A2840" />
          </View>
          <View style={styles.securityAlertContent}>
            <Text style={styles.securityAlertTitle}>Vérifiez et confirmez votre achat</Text>
            <Text style={styles.securityAlertText}>Votre paiement sera envoyé en toute sécurité au vendeur après confirmation sur la blockchain.</Text>
          </View>
          <Ionicons name="shield-checkmark" size={40} color="#FFDCA8" style={styles.securityAlertBgIcon} />
        </View>

        {/* Vous achetez Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Vous achetez</Text>
          <View style={styles.productRow}>
            <View style={styles.productImageContainer}>
              <View style={styles.mockProductImage} />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>Samsung Galaxy A14</Text>
              
              <View style={styles.shopRow}>
                <View style={styles.shopLogo}>
                  <Text style={styles.shopLogoText}>JUMIA</Text>
                </View>
                <Text style={styles.shopName}>Jumia Sénégal</Text>
                <Ionicons name="checkmark-circle" size={12} color="#3B82F6" style={{marginLeft: 4}} />
              </View>
              
              <Text style={styles.orderNumber}>Commande #JM-2026-000152</Text>
            </View>
            <View style={styles.productPriceCol}>
              <Text style={styles.productPrice}>155 000 FCFA</Text>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyBadgeText}>Qté : 1</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Détails du paiement */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Détails du paiement</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vous payez avec</Text>
            <View style={styles.detailValueRow}>
              <CryptoIcon symbol="USDC" size={24} />
              <Text style={styles.detailValue}>USDC</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Réseau sélectionné</Text>
            <View style={styles.detailValueRow}>
              <CryptoIcon symbol="POL" size={24} />
              <Text style={styles.detailValue}>Polygon</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant à payer</Text>
            <Text style={styles.detailValue}>38,95 USDC</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Livraison</Text>
            <Text style={styles.detailValue}>2 jours ouvrés à Lomé, Togo</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Adresse de livraison</Text>
            <Text style={styles.detailValue}>Lomé, Togo</Text>
          </View>
        </View>

        {/* Répartition du paiement */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Répartition du paiement</Text>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabelRow}>
              <Text style={styles.breakdownLabel}>Montant envoyé au vendeur</Text>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{marginLeft: 4}} />
            </View>
            <View style={styles.breakdownValueCol}>
              <Text style={styles.breakdownValueMain}>38,85 USDC</Text>
              <Text style={styles.breakdownValueSub}>≈ 154 500 FCFA</Text>
            </View>
          </View>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabelRow}>
              <Text style={styles.breakdownLabel}>Frais DizzitUp</Text>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{marginLeft: 4}} />
            </View>
            <View style={styles.breakdownValueCol}>
              <Text style={styles.breakdownValueMain}>0,00 USDC</Text>
              <Text style={styles.breakdownValueSub}>Gratuit</Text>
            </View>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabelRow}>
              <Text style={styles.breakdownLabel}>Frais réseau (estimés)</Text>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{marginLeft: 4}} />
            </View>
            <View style={styles.breakdownValueCol}>
              <Text style={styles.breakdownValueMain}>0,10 USDC</Text>
              <Text style={styles.breakdownValueSub}>≈ 400 FCFA</Text>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Vous paierez au total</Text>
            <View style={styles.totalValueCol}>
              <Text style={styles.totalMain}>38,95 USDC</Text>
              <Text style={styles.totalSub}>≈ 154 900 FCFA</Text>
            </View>
          </View>
        </View>

        {/* Informations de la transaction */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informations de la transaction</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>URL de la commande</Text>
            <TouchableOpacity style={styles.infoValueRow} onPress={copyOrder}>
              <Text style={styles.infoValueBlue}>jumia.sn/orders/JM-2026-000152</Text>
              <Ionicons name="copy-outline" size={14} color="#3B82F6" style={{marginLeft: 6}} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.noteRow}>
            <View style={styles.noteContent}>
              <Text style={styles.noteLabel}>Note</Text>
              <Text style={styles.noteText}>Le vendeur recevra le paiement en USDC après confirmation de la transaction sur la blockchain.</Text>
            </View>
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <View>
                <Text style={styles.securityBadgeTitle}>Paiement 100% sécurisé</Text>
                <Text style={styles.securityBadgeDesc}>par smart contract</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achetez-moi ceci banner */}
        <View style={styles.shareBanner}>
          <View style={styles.shareBannerLeft}>
            <View style={styles.shareIconCircle}>
              <Ionicons name="people-outline" size={24} color="#3B82F6" />
            </View>
            <View style={styles.shareContent}>
              <Text style={styles.shareTitle}>Achetez-moi ceci</Text>
              <Text style={styles.shareText}>Vous pouvez partager cette commande avec un proche qui pourra payer ce produit pour vous.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnShare} onPress={shareOrder}>
            <Ionicons name="arrow-redo-outline" size={16} color="#3B82F6" style={{marginRight: 6}} />
            <Text style={styles.btnShareText}>Envoyer à un contact</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnConfirm} onPress={() => navigation.navigate('PaymentInProgressScreen')}>
          <View style={{flex: 1}} />
          <View style={styles.btnConfirmCenter}>
            <View style={styles.btnConfirmTitleRow}>
              <Ionicons name="lock-closed-outline" size={16} color="#1A2840" style={{marginRight: 6}} />
              <Text style={styles.btnConfirmTitle}>Confirmer l'achat</Text>
            </View>
            <Text style={styles.btnConfirmSub}>Vous serez redirigé pour valider la transaction</Text>
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Ionicons name="chevron-forward" size={20} color="#1A2840" />
          </View>
        </TouchableOpacity>
      </View>
      {!!toast && <View style={styles.toastWrap}><AppToast title={toast.title} message={toast.message} onClose={() => setToast(null)} /></View>}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 14,
  },
  toastWrap: { position: 'absolute', left: 14, right: 14, top: 64, zIndex: 40 },
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
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // For the bottom bar
    paddingHorizontal: 16,
  },
  securityAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  securityAlertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityAlertContent: {
    flex: 1,
    zIndex: 1,
  },
  securityAlertTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  securityAlertText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
    lineHeight: 18,
  },
  securityAlertBgIcon: {
    position: 'absolute',
    right: 16,
    opacity: 0.5,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 16,
  },
  productRow: {
    flexDirection: 'row',
  },
  productImageContainer: {
    width: 60,
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mockProductImage: {
    width: '70%',
    height: '80%',
    backgroundColor: '#1A2840',
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 6,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF9E00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  shopLogoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 6,
    color: '#FFFFFF',
  },
  shopName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  orderNumber: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  productPriceCol: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 8,
  },
  qtyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qtyBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#1A2840',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
  },
  breakdownValueCol: {
    alignItems: 'flex-end',
  },
  breakdownValueMain: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  breakdownValueSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  totalValueCol: {
    alignItems: 'flex-end',
  },
  totalMain: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
  },
  totalSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValueBlue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
    marginRight: 16,
  },
  noteLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 4,
  },
  noteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityBadgeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#1A2840',
    marginLeft: 6,
  },
  securityBadgeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    marginLeft: 6,
  },
  shareBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  shareBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareContent: {
    flex: 1,
  },
  shareTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  shareText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  btnShare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  btnShareText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#3B82F6',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  btnConfirmCenter: {
    flex: 3,
    alignItems: 'center',
  },
  btnConfirmTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  btnConfirmTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  btnConfirmSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
  },
});
