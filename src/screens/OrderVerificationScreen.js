import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OrderVerificationScreen() {
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState('domicile'); // 'domicile', 'boutique'
  const [paymentMethod, setPaymentMethod] = useState('USDT'); // 'USDT', 'USDC', 'EURC', 'DZY'
  const [network, setNetwork] = useState('Polygon'); // 'Polygon', 'Base', 'Ethereum', 'Solana'

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification de la commande</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="headset-outline" size={24} color="#1A2840" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Seller Info */}
        <View style={styles.sellerRow}>
          <View style={styles.sellerLogo}>
            <Text style={styles.sellerLogoText}>JUMIA</Text>
          </View>
          <View>
            <Text style={styles.sellerProduct}>Samsung Galaxy A14</Text>
            <View style={styles.sellerNameRow}>
              <Text style={styles.sellerName}>Jumia Sénégal</Text>
              <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{marginLeft: 4}} />
            </View>
          </View>
        </View>

        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productImageContainer}>
            <View style={styles.mockProductImage} />
          </View>
          <View style={styles.productInfo}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>Smartphone</Text>
            </View>
            <Text style={styles.productTitle}>Samsung Galaxy A14</Text>
            <Text style={styles.productPrice}>155 000 FCFA</Text>
            
            <View style={styles.quantityRow}>
              <Text style={styles.qtyLabel}>Qté</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity style={styles.qtyBtn} onPress={decrement}>
                  <Ionicons name="remove" size={16} color="#1A2840" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={increment}>
                  <Ionicons name="add" size={16} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.addressRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="location-outline" size={20} color="#3B82F6" />
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.sectionLabel}>Adresse de livraison</Text>
            <Text style={styles.addressValue}>Lomé, Togo</Text>
          </View>
          <TouchableOpacity style={styles.btnModifier}>
            <Text style={styles.btnModifierText}>Modifier</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Delivery Options */}
        <View style={styles.deliverySection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="bus-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.sectionLabel}>Option de livraison</Text>
          </View>
          <View style={styles.deliveryOptionsRow}>
            <TouchableOpacity 
              style={[styles.deliveryOption, deliveryOption === 'domicile' && styles.optionSelected]}
              onPress={() => setDeliveryOption('domicile')}
            >
              <View style={[styles.radioOuter, deliveryOption === 'domicile' && styles.radioOuterSelected]}>
                {deliveryOption === 'domicile' && <View style={styles.radioInner} />}
              </View>
              <View>
                <Text style={styles.optionTitle}>Livraison à domicile</Text>
                <Text style={styles.optionDesc}>2 - 4 jours ouvrés</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deliveryOption, deliveryOption === 'boutique' && styles.optionSelected]}
              onPress={() => setDeliveryOption('boutique')}
            >
              <View style={[styles.radioOuter, deliveryOption === 'boutique' && styles.radioOuterSelected]}>
                {deliveryOption === 'boutique' && <View style={styles.radioInner} />}
              </View>
              <View>
                <Text style={styles.optionTitle}>Retrait en boutique</Text>
                <Text style={styles.optionDesc}>Disponible aujourd'hui</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="wallet-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.sectionLabel}>Payer avec</Text>
          </View>

          <View style={styles.paymentList}>
            {/* USDT */}
            <TouchableOpacity 
              style={[styles.paymentMethodItem, paymentMethod === 'USDT' && styles.optionSelected]}
              onPress={() => setPaymentMethod('USDT')}
            >
              <View style={[styles.radioOuter, paymentMethod === 'USDT' && styles.radioOuterSelected]}>
                {paymentMethod === 'USDT' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.tokenIcon, {backgroundColor: '#10B981'}]}><Text style={styles.tokenIconText}>₮</Text></View>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodNameRow}>
                  <Text style={styles.paymentMethodName}>USDT</Text>
                  <View style={styles.networkBadgeBlue}><Text style={styles.networkBadgeTextBlue}>TRC20</Text></View>
                </View>
                <Text style={styles.paymentMethodSub}>Tether</Text>
              </View>
              <View style={styles.paymentMethodValues}>
                <Text style={styles.paymentMethodValueMain}>321,25 USDT</Text>
                <Text style={styles.paymentMethodValueSub}>≈ 210 625 FCFA</Text>
              </View>
            </TouchableOpacity>

            {/* USDC */}
            <TouchableOpacity 
              style={[styles.paymentMethodItem, paymentMethod === 'USDC' && styles.optionSelected]}
              onPress={() => setPaymentMethod('USDC')}
            >
              <View style={[styles.radioOuter, paymentMethod === 'USDC' && styles.radioOuterSelected]}>
                {paymentMethod === 'USDC' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.tokenIcon, {backgroundColor: '#3B82F6'}]}><Text style={styles.tokenIconText}>$</Text></View>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodNameRow}>
                  <Text style={styles.paymentMethodName}>USDC</Text>
                  <View style={styles.networkBadgeGray}><Text style={styles.networkBadgeTextGray}>ERC20</Text></View>
                </View>
                <Text style={styles.paymentMethodSub}>USD Coin</Text>
              </View>
              <View style={styles.paymentMethodValues}>
                <Text style={styles.paymentMethodValueMain}>155,80 USDC</Text>
                <Text style={styles.paymentMethodValueSub}>≈ 102 315 FCFA</Text>
              </View>
            </TouchableOpacity>

            {/* EURC */}
            <TouchableOpacity 
              style={[styles.paymentMethodItem, paymentMethod === 'EURC' && styles.optionSelected]}
              onPress={() => setPaymentMethod('EURC')}
            >
              <View style={[styles.radioOuter, paymentMethod === 'EURC' && styles.radioOuterSelected]}>
                {paymentMethod === 'EURC' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.tokenIcon, {backgroundColor: '#3B82F6'}]}><Text style={styles.tokenIconText}>€</Text></View>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodNameRow}>
                  <Text style={styles.paymentMethodName}>EURC</Text>
                  <View style={styles.networkBadgeGray}><Text style={styles.networkBadgeTextGray}>ERC20</Text></View>
                </View>
                <Text style={styles.paymentMethodSub}>Euro Coin</Text>
              </View>
              <View style={styles.paymentMethodValues}>
                <Text style={styles.paymentMethodValueMain}>50,60 EURC</Text>
                <Text style={styles.paymentMethodValueSub}>≈ 33 400 FCFA</Text>
              </View>
            </TouchableOpacity>

            {/* DZY */}
            <TouchableOpacity 
              style={[styles.paymentMethodItem, paymentMethod === 'DZY' && styles.optionSelected]}
              onPress={() => setPaymentMethod('DZY')}
            >
              <View style={[styles.radioOuter, paymentMethod === 'DZY' && styles.radioOuterSelected]}>
                {paymentMethod === 'DZY' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.tokenIcon, {backgroundColor: '#0A1128'}]}><Text style={[styles.tokenIconText, {color: '#FFB800'}]}>D</Text></View>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodNameRow}>
                  <Text style={styles.paymentMethodName}>DZY</Text>
                  <View style={styles.networkBadgePurple}><Text style={styles.networkBadgeTextPurple}>DIZZITUP</Text></View>
                </View>
                <Text style={styles.paymentMethodSub}>DizzitUp Token</Text>
              </View>
              <View style={styles.paymentMethodValues}>
                <Text style={styles.paymentMethodValueMain}>125 000 DZY</Text>
                <Text style={styles.paymentMethodValueSub}>≈ 95 750 FCFA</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blockchain Network */}
        <View style={styles.networkSection}>
          <View style={styles.networkHeader}>
            <Text style={styles.sectionLabel}>Réseau blockchain</Text>
            <TouchableOpacity>
              <Text style={styles.networkHelpText}>Qu'est-ce que c'est ?</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.networkScroll}>
            
            <TouchableOpacity 
              style={[styles.networkOption, network === 'Polygon' && styles.optionSelected]}
              onPress={() => setNetwork('Polygon')}
            >
              <View style={[styles.radioOuter, network === 'Polygon' && styles.radioOuterSelected, {marginRight: 8}]}>
                {network === 'Polygon' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.networkIcon, {backgroundColor: '#8B5CF6'}]}><Text style={styles.networkIconText}>P</Text></View>
              <Text style={styles.networkOptionText}>Polygon</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.networkOption, network === 'Base' && styles.optionSelected]}
              onPress={() => setNetwork('Base')}
            >
              <View style={[styles.radioOuter, network === 'Base' && styles.radioOuterSelected, {marginRight: 8}]}>
                {network === 'Base' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.networkIcon, {backgroundColor: '#3B82F6'}]}><Text style={styles.networkIconText}>B</Text></View>
              <Text style={styles.networkOptionText}>Base</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.networkOption, network === 'Ethereum' && styles.optionSelected]}
              onPress={() => setNetwork('Ethereum')}
            >
              <View style={[styles.radioOuter, network === 'Ethereum' && styles.radioOuterSelected, {marginRight: 8}]}>
                {network === 'Ethereum' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.networkIcon, {backgroundColor: '#1A2840'}]}><Text style={styles.networkIconText}>E</Text></View>
              <Text style={styles.networkOptionText}>Ethereum</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.networkOption, network === 'Solana' && styles.optionSelected]}
              onPress={() => setNetwork('Solana')}
            >
              <View style={[styles.radioOuter, network === 'Solana' && styles.radioOuterSelected, {marginRight: 8}]}>
                {network === 'Solana' && <View style={styles.radioInner} />}
              </View>
              <View style={[styles.networkIcon, {backgroundColor: '#10B981'}]}><Text style={styles.networkIconText}>S</Text></View>
              <Text style={styles.networkOptionText}>Solana</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionLabel}>Résumé de la commande</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total (Produit)</Text>
            <Text style={styles.summaryValue}>155 000 FCFA</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>2 000 FCFA</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.summaryLabel}>Frais réseau (estimés)</Text>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{marginLeft: 4}} />
            </View>
            <Text style={styles.summaryValue}>≈ 0,10 USDC</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Vous paierez</Text>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.totalValueMain}>38,95 USDC</Text>
              <Text style={styles.totalValueSub}>≈ 25 595 FCFA</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" style={{marginRight: 8}} />
          <View>
            <Text style={styles.securityTitle}>Paiement 100% sécurisé</Text>
            <Text style={styles.securityDesc}>Vos fonds sont protégés</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnContinue} onPress={() => navigation.navigate('')}>
          <Text style={styles.btnContinueText}>Continuer</Text>
          <Ionicons name="chevron-forward" size={18} color="#1A2840" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingBottom: 100, // space for sticky bottom bar
    paddingHorizontal: 16,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF9E00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerLogoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  sellerProduct: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  productImageContainer: {
    width: 100,
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mockProductImage: {
    width: '70%',
    height: '80%',
    backgroundColor: '#1A2840',
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#8B5CF6',
  },
  productTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    marginRight: 12,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    paddingHorizontal: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  addressValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  btnModifier: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnModifierText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#3B82F6',
    marginRight: 4,
  },
  deliverySection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  optionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentList: {
    //
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  paymentMethodName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginRight: 6,
  },
  networkBadgeBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  networkBadgeTextBlue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#3B82F6',
  },
  networkBadgeGray: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  networkBadgeTextGray: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#64748B',
  },
  networkBadgePurple: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  networkBadgeTextPurple: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#8B5CF6',
  },
  paymentMethodSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  paymentMethodValues: {
    alignItems: 'flex-end',
  },
  paymentMethodValueMain: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 2,
  },
  paymentMethodValueSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  networkSection: {
    marginBottom: 24,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkHelpText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#3B82F6',
  },
  networkScroll: {
    paddingBottom: 4,
  },
  networkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  networkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  networkIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  networkOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  totalValueMain: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1A2840',
    marginBottom: 2,
  },
  totalValueSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA', // Or '#FFFFFF' depending on design
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  securityInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  securityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#1A2840',
  },
  securityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    color: '#64748B',
  },
  btnContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  btnContinueText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginRight: 8,
  },
});
