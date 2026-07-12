import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import ServiceGridCard from '../components/ServiceGridCard';
import BottomNavBar from '../components/BottomNavBar';

export default function ChooseServiceScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choisir un service</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={18} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Sélectionnez le type de service que vous souhaitez envoyer ou payer.</Text>
      </View>

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Contact Card */}
        <View style={styles.selectedContactCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=kemi' }} style={styles.avatar} />
            <View style={styles.checkedCircle}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName} numberOfLines={1}>Mama Kemi Adebayo</Text>
            <Text style={styles.contactRelation}>Mère</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#8B92A5" style={styles.locationIcon} />
              <Text style={styles.contactLocation}>Lagos, Nigeria 🇳🇬</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={14} color="#1A2840" style={styles.editIcon} />
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Sélectionnez un service</Text>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          <ServiceGridCard 
            title="Eau, gaz, électricité"
            subtitle="Payez vos factures d'eau, de gaz, d'électricité et autres factures."
            iconName="document-text-outline"
            iconColor="#F59E0B"
            iconBgColor="#FEF3C7"
            onPress={() => navigation.navigate('ReviewPaymentScreen', { service: 'Factures eau, gaz et électricité' })}
          />
          <ServiceGridCard 
            title="Recharge mobile"
            subtitle="Crédits mobiles instantanés pour vos proches."
            iconName="phone-portrait-outline"
            iconColor="#10B981"
            iconBgColor="#D1FAE5"
            onPress={() => navigation.navigate('MobileRechargeScreen')}
          />
          
          <ServiceGridCard 
            isWide={true}
            title="Internet, TV, Jeux & Crypto"
            subtitle="Abonnements Internet et données, abonnements TV et bouquets, jeux en ligne et services crypto."
            multiIcons={['wifi', 'tv-outline', 'game-controller-outline', 'logo-bitcoin']}
            iconColor="#3B82F6"
            iconBgColor="#EFF6FF"
            onPress={() => navigation.navigate('ReviewPaymentScreen', { service: 'Internet, TV, Jeux & Crypto' })}
          />

          <ServiceGridCard 
            title="Envoyer/Demander des fonds"
            subtitle="Envoyez ou demandez de l'aide à vos proches en quelques secondes."
            iconName="swap-horizontal-outline"
            iconColor="#8B5CF6"
            iconBgColor="#EDE9FE"
            onPress={() => navigation.navigate('SendMoneyScreen')}
          />
          <ServiceGridCard 
            title="Produits & Services essentiels"
            subtitle="Envoyez des produits essentiels à vos proches."
            iconName="basket-outline"
            iconColor="#F97316"
            iconBgColor="#FFEDD5"
            onPress={() => navigation.navigate('ShopsScreen')}
          />
        </View>

        {/* Secure Payments Banner */}
        <View style={styles.paymentBanner}>
          <View style={styles.shieldWrapper}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Paiements sécurisés</Text>
            <Text style={styles.paymentText}>Toutes les transactions sont protégées par le protocole de sécurité DZYwallet.</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Nav Bar */}
      <BottomNavBar activeTab="home" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    paddingRight: 20,
    marginLeft: 36,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24, // Space for BottomNavBar
  },
  selectedContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FFC759',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  checkedCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFBEB',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  contactRelation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8B92A5',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  contactLocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1A2840',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  editIcon: {
    marginRight: 4,
  },
  editButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paymentBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  shieldWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  paymentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  }
});
