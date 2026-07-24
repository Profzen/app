import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DizzitButton } from '../components/DizzitButton';
import BottomNavBar from '../components/BottomNavBar';

export default function MobileRechargeScreen() {
  const navigation = useNavigation();
  const [selectedAmount, setSelectedAmount] = useState(500);
  const amounts = [500, 1000, 2000, 5000, 10000, 20000];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#1A2840" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recharger un mobile</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={18} color="#1A2840" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('RewardsScreen')}>
                <Ionicons name="gift-outline" size={18} color="#1A2840" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MoreSettingsScreen')}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#1A2840" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Vérifiez les informations et sélectionnez le montant à recharger.</Text>
        </View>

        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Selected Contact Card */}
          <View style={styles.selectedContactCard}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?u=kemi' }} style={styles.avatar} />
              <View style={styles.checkedCircle}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Mama Kemi Adebayo</Text>
              <Text style={styles.contactRelation}>+234 803 456 7890</Text>
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

          {/* Selected Service Row */}
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconWrapper}>
              <Ionicons name="phone-portrait-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>Recharge mobile</Text>
              <Text style={styles.serviceSubtitle}>Crédits mobiles instantanés pour vos proches.</Text>
            </View>
            <TouchableOpacity style={styles.changeServiceBtn} onPress={() => navigation.navigate('ChooseServiceScreen')}>
              <Text style={styles.changeServiceText}>Changer</Text>
              <Ionicons name="chevron-down" size={16} color="#1A2840" />
            </TouchableOpacity>
          </View>

          {/* Detected Operator */}
          <Text style={styles.sectionTitle}>Opérateur détecté</Text>
          <View style={styles.operatorCard}>
            <View style={styles.operatorLogo}>
              <Text style={styles.operatorLogoText}>MTN</Text>
            </View>
            <View style={styles.operatorInfo}>
              <Text style={styles.operatorName}>MTN Nigeria</Text>
              <Text style={styles.operatorDetected}>Opérateur détecté pour ce numéro</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          {/* Select Amount */}
          <Text style={styles.sectionTitle}>Sélectionnez un montant</Text>
          <View style={styles.amountsGrid}>
            {amounts.map((amount) => {
              const isSelected = selectedAmount === amount;
              return (
                <TouchableOpacity
                  key={amount}
                  style={[styles.amountCard, isSelected && styles.amountCardSelected]}
                  onPress={() => setSelectedAmount(amount)}
                >
                  <Text style={[styles.amountText, isSelected && styles.amountTextSelected]}>
                    {amount.toLocaleString('fr-FR')} FCFA
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <DizzitButton title="Continuer ➔" onPress={() => navigation.navigate('ReviewPaymentScreen')} />
        </View>

        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginLeft: 6, position: 'relative' },
  notificationDot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC759' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', marginTop: 4 },
  mainScroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  selectedContactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF0', borderRadius: 16, borderWidth: 1, borderColor: '#FFC759', padding: 14, marginBottom: 16 },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  checkedCircle: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#10B981', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1 },
  contactName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  contactRelation: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationIcon: { marginRight: 4 },
  contactLocation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8B92A5' },
  editButton: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center' },
  editIcon: { marginRight: 4 },
  editButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#1A2840' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, marginBottom: 20 },
  serviceIconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  serviceSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 },
  changeServiceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  changeServiceText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1A2840', marginRight: 4 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840', marginBottom: 10 },
  operatorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, marginBottom: 20 },
  operatorLogo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  operatorLogoText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 12, color: '#000000' },
  operatorInfo: { flex: 1 },
  operatorName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  operatorDetected: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 },
  amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  amountCard: { width: '48%', backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 14, alignItems: 'center' },
  amountCardSelected: { backgroundColor: '#FFFDF0', borderColor: '#FFC759' },
  amountText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: '#1A2840' },
  amountTextSelected: { color: '#B45309' },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
});
