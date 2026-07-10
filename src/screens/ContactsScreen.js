import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const quickActions = [
  { id: '1', title: "Payer et\nacheter l'essentiel", subtitle: "Achat de crédit,\ninternet, TV, jeux,\ncrypto et plus", icon: "bag-handle-outline", color: "#8B5CF6" },
  { id: '2', title: "Recharger\nmobile", subtitle: "Achat de crédit\nmobile", icon: "phone-portrait-outline", color: "#10B981" },
  { id: '3', title: "Payer des\nfactures", subtitle: "Électricité, eau,\ninternet et plus", icon: "receipt-outline", color: "#3B82F6" },
  { id: '4', title: "Envoyer /\nDemander\ndes fonds", subtitle: "Transferts d'argent\ninstantanés", icon: "swap-horizontal-outline", color: "#F59E0B" },
  { id: '5', title: "Inviter", subtitle: "Invitez vos amis\net gagnez\n$5 en DZY", icon: "person-add-outline", color: "#8B5CF6" },
];

const contacts = [
  { id: '1', name: "John Doe", relation: "Frère", location: "Lomé, Togo", flag: "🇹🇬", isBeneficiary: true, isSponsor: true, image: "https://i.pravatar.cc/150?img=11" },
  { id: '2', name: "Marie K.", relation: "Sœur", location: "Dakar, Sénégal", flag: "🇸🇳", isBeneficiary: true, isSponsor: true, image: "https://i.pravatar.cc/150?img=5" },
  { id: '3', name: "Ousmane T.", relation: "Ami", location: "Bamako, Mali", flag: "🇲🇱", isBeneficiary: true, isSponsor: false, image: "https://i.pravatar.cc/150?img=12" },
  { id: '4', name: "Aïssatou B.", relation: "Famille", location: "Ouagadougou, Burkina Faso", flag: "🇧🇫", isBeneficiary: true, isSponsor: false, image: "https://i.pravatar.cc/150?img=9" },
  { id: '5', name: "Kwame A.", relation: "Ami", location: "Accra, Ghana", flag: "🇬🇭", isBeneficiary: false, isSponsor: true, image: "https://i.pravatar.cc/150?img=14" },
];

export default function ContactsScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="notifications-outline" size={20} color="#1A2840" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="gift-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Contacts</Text>
          
          <TouchableOpacity style={styles.syncBtn}>
            <Ionicons name="sync-outline" size={16} color="#3B82F6" style={{marginRight: 8}} />
            <Text style={styles.syncBtnText}>Synchroniser vos contacts</Text>
          </TouchableOpacity>
          
          <Text style={styles.subtitle}>Envoyez de l'argent à vos bénéficiaires à travers l'Afrique.</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
            <View>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un contact"
                placeholderTextColor="#64748B"
              />
              <Text style={styles.searchSubText}>Nom, téléphone, email, ville ou pays</Text>
            </View>
          </View>

          {/* Actions rapides */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard}>
                <View style={styles.quickActionIconContainer}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Mes bénéficiaires */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mes bénéficiaires</Text>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.showLessText}>Afficher moins</Text>
              <Ionicons name="chevron-up" size={14} color="#64748B" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity style={styles.filterChipActive}>
              <Ionicons name="location-outline" size={16} color="#FFFFFF" style={{marginRight: 6}} />
              <Text style={styles.filterChipTextActive}>À proximité</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="heart-outline" size={16} color="#64748B" style={{marginRight: 6}} />
              <Text style={styles.filterChipText}>De mes pays préférés</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="earth-outline" size={16} color="#64748B" style={{marginRight: 6}} />
              <Text style={styles.filterChipText}>De toute l'Afrique</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Ionicons name="globe-outline" size={16} color="#64748B" style={{marginRight: 6}} />
              <Text style={styles.filterChipText}>Du reste du monde</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Contacts List Header */}
          <View style={styles.listHeaderRow}>
            <Text style={[styles.listHeaderText, {flex: 2}]}>Contact</Text>
            <Text style={[styles.listHeaderText, {flex: 1, textAlign: 'center'}]}>Bénéficiaire</Text>
            <Text style={[styles.listHeaderText, {flex: 1, textAlign: 'center'}]}>Parrain</Text>
            <View style={{width: 20}} />
          </View>

          {/* Contacts List */}
          <View style={styles.contactsList}>
            {contacts.map(contact => (
              <TouchableOpacity key={contact.id} style={styles.contactItem}>
                
                {/* Contact Info */}
                <View style={styles.contactInfoCol}>
                  <Image source={{uri: contact.image}} style={styles.contactAvatar} />
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                    <Text style={styles.contactLocation}>{contact.flag} {contact.location}</Text>
                  </View>
                </View>

                {/* Bénéficiaire Status */}
                <View style={styles.statusCol}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={contact.isBeneficiary ? '#10B981' : '#94A3B8'} 
                    style={{marginBottom: 4}}
                  />
                  <Text style={[styles.statusText, {color: contact.isBeneficiary ? '#10B981' : '#94A3B8'}]}>
                    {contact.isBeneficiary ? 'Oui' : 'Non'}
                  </Text>
                </View>

                {/* Parrain Status */}
                <View style={styles.statusCol}>
                  <Ionicons 
                    name="person-add-outline" 
                    size={20} 
                    color={contact.isSponsor ? '#10B981' : '#94A3B8'} 
                    style={{marginBottom: 4}}
                  />
                  <Text style={[styles.statusText, {color: contact.isSponsor ? '#10B981' : '#94A3B8'}]}>
                    {contact.isSponsor ? 'Oui' : 'Non'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#1A2840" />
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>

        {/* Invite Banner (Floating) */}
        <View style={styles.inviteBannerWrapper}>
          <View style={styles.inviteBanner}>
            <TouchableOpacity style={styles.closeBannerBtn}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.inviteBannerLeft}>
              <Text style={styles.inviteBannerTitle}>
                Invitez vos amis{'\n'}et gagnez <Text style={{color: '#FFB800'}}>$5 en DZY</Text>
              </Text>
              <Text style={styles.inviteBannerText}>
                Envoyez de l'argent, achetez, payez des factures et gagnez des récompenses ensemble.
              </Text>
              <TouchableOpacity style={styles.inviteBtn}>
                <Text style={styles.inviteBtnText}>Inviter maintenant</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inviteBannerRight}>
              {/* Abstract illustration representation */}
              <View style={styles.mockPhoneIllustration}>
                <View style={styles.mockPhoneIconCircle}>
                  <Text style={{color: '#FFB800', fontWeight: 'bold', fontSize: 24}}>D</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <BottomNavBar activeTab="contacts" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 32,
    width: 120,
  },
  headerRightIcons: {
    flexDirection: 'row',
  },
  iconBtnRight: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginLeft: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB800',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 160, // extra padding for floating banner
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#0A1128',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  syncBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#3B82F6',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
    padding: 0,
  },
  searchSubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  quickActionCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 12,
  },
  showLessText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  filtersScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1128',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipTextActive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  listHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  listHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  contactsList: {
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  contactInfoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  contactRelation: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  contactLocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  statusCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  inviteBannerWrapper: {
    position: 'absolute',
    bottom: 90, // above bottom nav
    left: 16,
    right: 16,
  },
  inviteBanner: {
    backgroundColor: '#0A1128',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  closeBannerBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  inviteBannerLeft: {
    flex: 1,
    zIndex: 2,
  },
  inviteBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  inviteBannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#E2E8F0',
    marginBottom: 16,
    lineHeight: 16,
  },
  inviteBtn: {
    backgroundColor: '#FFB800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  inviteBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
  },
  inviteBannerRight: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mockPhoneIllustration: {
    width: 60,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockPhoneIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A1128',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
