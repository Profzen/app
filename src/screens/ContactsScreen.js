import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

const BENEFICIARIES_DATA = [
  { id: '1', name: 'John Doe', relation: 'Frère', city: 'Lomé', country: 'Togo', flagCode: 'tg', isBeneficiary: true, isSponsor: true, avatarUrl: 'https://i.pravatar.cc/100?img=11' },
  { id: '2', name: 'Marie K.', relation: 'Soeur', city: 'Dakar', country: 'Sénégal', flagCode: 'sn', isBeneficiary: false, isSponsor: true, avatarUrl: 'https://i.pravatar.cc/100?img=5' },
  { id: '3', name: 'Ousmane T.', relation: 'Ami', city: 'Bamako', country: 'Mali', flagCode: 'ml', isBeneficiary: true, isSponsor: false, avatarUrl: 'https://i.pravatar.cc/100?img=12' },
  { id: '4', name: 'Aissatou B.', relation: 'Famille', city: 'Ouagadougou', country: 'Burkina Faso', flagCode: 'bf', isBeneficiary: true, isSponsor: false, avatarUrl: 'https://i.pravatar.cc/100?img=9' },
  { id: '5', name: 'Kwame A.', relation: 'Ami', city: 'Accra', country: 'Ghana', flagCode: 'gh', isBeneficiary: false, isSponsor: true, avatarUrl: 'https://i.pravatar.cc/100?img=15' },
];

export default function ContactsScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLogoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoD}>D</Text>
              <View style={styles.logoStrike} />
            </View>
            <Text style={styles.dizzitText}>Dizzit<Text style={styles.upText}>Up</Text></Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Contacts</Text>
            <Text style={styles.subtitle}>Envoyez de l'argent à vos bénéficiaires à travers l'Afrique.</Text>
          </View>

          {/* Sync Contacts Banner */}
          <TouchableOpacity style={styles.syncBanner}>
            <View style={styles.syncIconContainer}>
              <Ionicons name="phone-portrait-outline" size={24} color="#F59E0B" />
              <Ionicons name="sync" size={14} color="#F59E0B" style={styles.syncBadge} />
            </View>
            <View style={styles.syncTextContainer}>
              <Text style={styles.syncTitle}>Synchroniser vos contacts</Text>
              <Text style={styles.syncSubtitle}>Accédez facilement à vos contacts pour envoyer de l'argent.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1A2840" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#1A2840" style={styles.searchIcon} />
            <View>
              <Text style={styles.searchPlaceholderTop}>Rechercher un contact</Text>
              <Text style={styles.searchPlaceholderBottom}>Nom, téléphone, email, ville ou pays</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
              
              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="cart-outline" size={20} color="#9333EA" />
                </View>
                <Text style={styles.qaTitle}>1. Payer et acheter l'essentiel</Text>
                <Text style={styles.qaDesc}>Payez et achetez l'essentiel pour eux.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="call-outline" size={20} color="#10B981" />
                </View>
                <Text style={styles.qaTitle}>2. Recharger un mobile</Text>
                <Text style={styles.qaDesc}>Rechargez le mobile de vos proches.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.qaTitle}>3. Payer des factures</Text>
                <Text style={styles.qaDesc}>Réglez les factures en toute simplicité.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="swap-horizontal-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.qaTitle}>4. Envoyer / Demander des fonds</Text>
                <Text style={styles.qaDesc}>Envoyez ou demandez des fonds facilement.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <View style={[styles.qaIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="person-add-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.qaTitle}>5. Inviter</Text>
                <Text style={styles.qaDesc}>Invitez vos amis et gagnez <Text style={{color: '#F59E0B'}}>$5 en DZY</Text></Text>
              </TouchableOpacity>

            </ScrollView>
          </View>

          {/* Beneficiaries Section */}
          <View style={styles.beneficiariesSection}>
            <View style={styles.beneficiariesHeader}>
              <Text style={styles.sectionTitle}>Mes bénéficiaires</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Voir tout</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A2840" />
              </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
                <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                <Text style={[styles.filterChipText, styles.filterChipTextActive]}>À proximité</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="earth-outline" size={16} color="#1A2840" />
                <Text style={styles.filterChipText}>Mes pays préférés</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="map-outline" size={16} color="#1A2840" />
                <Text style={styles.filterChipText}>Toute l'Afrique</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.filterChip}>
                <Ionicons name="globe-outline" size={16} color="#1A2840" />
                <Text style={styles.filterChipText}>Reste du monde</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* List Headers */}
            <View style={styles.listHeaderRow}>
              <Text style={[styles.listHeaderText, { flex: 2 }]}>Contact</Text>
              <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>Bénéficiaire</Text>
              <Text style={[styles.listHeaderText, { flex: 1, textAlign: 'center' }]}>Parrain</Text>
              <View style={{ width: 20 }} />
            </View>

            {/* List Items */}
            <View style={styles.listContainer}>
              {BENEFICIARIES_DATA.map((item, index) => (
                <TouchableOpacity key={item.id} style={styles.beneficiaryRow}>
                  {/* Contact Info */}
                  <View style={styles.contactInfo}>
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactRelation}>{item.relation}</Text>
                      <View style={styles.locationRow}>
                        <Image source={{ uri: `https://flagcdn.com/w20/${item.flagCode}.png` }} style={styles.smallFlag} />
                        <Text style={styles.locationText}>{item.city}, {item.country}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Beneficiary Status */}
                  <View style={styles.statusCol}>
                    <Ionicons name="person-outline" size={20} color={item.isBeneficiary ? "#10B981" : "#A0AABF"} />
                    <Text style={[styles.statusText, { color: item.isBeneficiary ? "#10B981" : "#A0AABF" }]}>
                      {item.isBeneficiary ? "Oui" : "Non"}
                    </Text>
                  </View>

                  {/* Sponsor Status */}
                  <View style={styles.statusCol}>
                    {/* Using a heart icon as placeholder for the handshake/heart icon */}
                    <Ionicons name="heart-circle-outline" size={20} color={item.isSponsor ? "#10B981" : "#A0AABF"} />
                    <Text style={[styles.statusText, { color: item.isSponsor ? "#10B981" : "#A0AABF" }]}>
                      {item.isSponsor ? "Oui" : "Non"}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#1A2840" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Invite Banner Footer */}
          <View style={styles.inviteBanner}>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Invitez vos amis{'\n'}et gagnez <Text style={styles.inviteTitleHighlight}>$5 en DZY</Text></Text>
              <Text style={styles.inviteSubtitle}>Envoyez de l'argent, achetez, payez des factures{'\n'}et gagnez des récompenses ensemble.</Text>
              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteButtonText}>Inviter maintenant</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inviteGraphic}>
              <View style={styles.phonePlaceholder}>
                <View style={styles.miniCoin}>
                  <Text style={styles.miniCoinText}>DZY</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBannerButton}>
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
        
        <BottomNavBar 
          activeTab="Contacts" 
          isMenuOpen={isMenuOpen} 
          onCenterButtonPress={() => setIsMenuOpen(!isMenuOpen)} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  logoD: {
    color: '#FFC759',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
  },
  logoStrike: {
    position: 'absolute',
    width: 24,
    height: 2,
    backgroundColor: '#FFC759',
    transform: [{ rotate: '-45deg' }],
  },
  dizzitText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#1A2840',
  },
  upText: {
    color: '#F59E0B',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC759',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 20,
  },
  mainTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A', // Light yellow border
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  syncIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  syncBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  syncTextContainer: {
    flex: 1,
  },
  syncTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  syncSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholderTop: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  searchPlaceholderBottom: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#A0AABF',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1A2840',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  quickActionCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    alignItems: 'center',
  },
  qaIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qaTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
    height: 32, // Fixed height for 2 lines
  },
  qaDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8B92A5',
    textAlign: 'center',
    lineHeight: 14,
  },
  beneficiariesSection: {
    marginBottom: 24,
  },
  beneficiariesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginRight: 4,
  },
  filterScroll: {
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#0F172A', // Dark blue
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8B92A5',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  beneficiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  contactRelation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallFlag: {
    width: 14,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  locationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#1A2840',
  },
  statusCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    marginTop: 2,
  },
  inviteBanner: {
    backgroundColor: '#0F172A', // Dark blue variant
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  inviteContent: {
    flex: 1,
    zIndex: 2,
  },
  inviteTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
  },
  inviteTitleHighlight: {
    color: '#FFC759',
  },
  inviteSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#9CA3AF',
    lineHeight: 14,
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: '#FFC759',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  inviteGraphic: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePlaceholder: {
    width: 60,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  miniCoin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFC759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCoinText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: '#1A2840',
  },
  closeBannerButton: {
    position: 'absolute',
    top: 0,
    right: -10,
  }
});
