import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContactProfileScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="pencil-outline" size={20} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image source={{uri: 'https://i.pravatar.cc/150?img=11'}} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                {/* White background behind the checkmark icon */}
                <View style={styles.verifiedBadgeBg} />
              </View>
            </View>

            <Text style={styles.profileName}>John Doe</Text>

            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <Ionicons name="person-outline" size={14} color="#10B981" style={{marginRight: 4}} />
                <Text style={styles.tagText}>Bénéficiaire</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons name="heart-outline" size={14} color="#10B981" style={{marginRight: 4}} />
                <Text style={styles.tagText}>Parrain</Text>
              </View>
            </View>

            <Text style={styles.locationText}>🇹🇬 Lomé, Togo</Text>
          </View>

          {/* Quick Actions */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('SendMoneyScreen')}>
              <View style={[styles.quickActionIconContainer, {backgroundColor: '#ECFDF5'}]}>
                <Ionicons name="paper-plane-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionTitle}>Envoyer{'\n'}des fonds</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('MobileRechargeScreen')}>
              <View style={[styles.quickActionIconContainer, {backgroundColor: '#FFFBEB'}]}>
                <Ionicons name="download-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionTitle}>Demander{'\n'}des fonds</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('PayBillsScreen')}>
              <View style={[styles.quickActionIconContainer, {backgroundColor: '#EFF6FF'}]}>
                <Ionicons name="bag-handle-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionTitle}>Payer &{'\n'}acheter{'\n'}l'essentiel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ContactHistoryScreen')}>
              <View style={[styles.quickActionIconContainer, {backgroundColor: '#F5F3FF'}]}>
                <Ionicons name="person-add-outline" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionTitle}>Inviter</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Info List */}
          <View style={styles.infoListCard}>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="call-outline" size={18} color="#64748B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>+228 90 12 34 56</Text>
              </View>
              <View style={styles.infoActions}>
                <TouchableOpacity style={styles.infoActionBtn}>
                  <Ionicons name="call-outline" size={18} color="#1A2840" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoActionBtn}>
                  <Ionicons name="chatbubble-outline" size={18} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="mail-outline" size={18} color="#64748B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>johndoe@gmail.com</Text>
              </View>
              <View style={styles.infoActions}>
                <TouchableOpacity style={styles.infoActionBtn}>
                  <Ionicons name="mail-outline" size={18} color="#1A2840" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="location-outline" size={18} color="#64748B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Pays</Text>
                <Text style={styles.infoValue}>Togo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1A2840" />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="people-outline" size={18} color="#64748B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Groupe</Text>
                <Text style={styles.infoValue}>Famille</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1A2840" />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="heart-outline" size={18} color="#10B981" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Parrain</Text>
                <Text style={[styles.infoValue, {color: '#10B981'}]}>Oui</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1A2840" />
            </View>
          </View>

          {/* Verified Contact Banner */}
          <View style={styles.verifiedBanner}>
            <View style={styles.verifiedShield}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.verifiedContent}>
              <Text style={styles.verifiedTitle}>Contact vérifié</Text>
              <Text style={styles.verifiedText}>
                Ce contact est vérifié et peut recevoir{'\n'}de l'argent sur DizzitUp.
              </Text>
            </View>
            <View style={styles.verifiedBadgeIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityHeaderRow}>
            <Text style={styles.activityTitle}>Activité récente</Text>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.viewAllText}>Voir tout</Text>
              <Ionicons name="arrow-forward" size={16} color="#1A2840" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {/* Activity 1 */}
            <TouchableOpacity style={styles.activityItem} onPress={() => navigation.navigate('ContactHistoryScreen')}>
              <View style={[styles.activityIconCircle, {backgroundColor: '#ECFDF5'}]}>
                <Ionicons name="arrow-up-outline" size={18} color="#10B981" style={{transform: [{rotate: '45deg'}]}} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityItemTitle}>Vous avez envoyé des fonds</Text>
                <Text style={styles.activityDate}>23 avril 2024 • 14:32</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityAmountNegative}>- 50,00 DZ</Text>
                <Ionicons name="chevron-forward" size={16} color="#64748B" />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Activity 2 */}
            <TouchableOpacity style={styles.activityItem} onPress={() => navigation.navigate('ContactHistoryScreen')}>
              <View style={[styles.activityIconCircle, {backgroundColor: '#FFFBEB'}]}>
                <Ionicons name="cash-outline" size={18} color="#F59E0B" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityItemTitle}>Demande de fonds</Text>
                <Text style={styles.activityDate}>18 avril 2024 • 09:15</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityAmountPositive}>+ 25,00 DZ</Text>
                <Ionicons name="chevron-forward" size={16} color="#64748B" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.btnSave} onPress={() => navigation.goBack()}>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
            <Text style={styles.btnSaveText}>Save</Text>
          </TouchableOpacity>

        </ScrollView>
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
  headerRightIcons: {
    flexDirection: 'row',
  },
  iconBtnRight: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeBg: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    zIndex: -1,
  },
  profileName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#10B981',
  },
  locationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#475569',
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionCard: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A2840',
    textAlign: 'center',
    lineHeight: 16,
  },
  infoListCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
  },
  infoActions: {
    flexDirection: 'row',
  },
  infoActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  verifiedShield: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verifiedContent: {
    flex: 1,
  },
  verifiedTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  verifiedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  verifiedBadgeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activityTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1A2840',
  },
  viewAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A2840',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityItemTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 4,
  },
  activityDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityAmountNegative: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A2840',
    marginRight: 8,
  },
  activityAmountPositive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#10B981',
    marginRight: 8,
  },
  btnSave: {
    flexDirection: 'row',
    backgroundColor: '#FFB800',
    marginHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSaveText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
