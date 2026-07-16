import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('historique');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Historique des Transactions</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnSmall}>
              <Ionicons name="help" size={18} color="#1A2840" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtnSmall, {marginLeft: 8}]} onPress={() => navigation.navigate('FiltersScreen')}>
              <Ionicons name="funnel-outline" size={18} color="#1A2840" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setActiveTab('historique')}
            >
              <View style={styles.tabContent}>
                <Ionicons name="time-outline" size={18} color={activeTab === 'historique' ? '#FFB800' : '#64748B'} style={{marginRight: 6}} />
                <Text style={[styles.tabText, activeTab === 'historique' && styles.tabTextActive]}>HISTORIQUE</Text>
              </View>
              {activeTab === 'historique' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setActiveTab('statistiques')}
            >
              <View style={styles.tabContent}>
                <Ionicons name="stats-chart-outline" size={18} color={activeTab === 'statistiques' ? '#FFB800' : '#64748B'} style={{marginRight: 6}} />
                <Text style={[styles.tabText, activeTab === 'statistiques' && styles.tabTextActive]}>STATISTIQUES</Text>
              </View>
              {activeTab === 'statistiques' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View style={styles.mainCard}>
            
            {/* Dark Blue Header of Card */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Historique des Transactions Pro</Text>
              <Text style={styles.cardSubtitle}>0 transactions au total</Text>
              
              <View style={styles.cardControls}>
                <TouchableOpacity style={styles.datePickerBtn}>
                  <Ionicons name="calendar-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.datePickerText}>Juillet 2026</Text>
                  <Ionicons name="chevron-down" size={16} color="#FFFFFF" style={{marginLeft: 8}} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.releveBtn}>
                  <Ionicons name="download-outline" size={18} color="#1A2840" style={{marginRight: 6}} />
                  <Text style={styles.releveBtnText}>RELEVÉ</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* White Body of Card - Empty State */}
            <View style={styles.cardBody}>
              <View style={styles.emptyIconContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="receipt-outline" size={48} color="#1A2840" />
                  <View style={styles.timeBadge}>
                    <Ionicons name="time" size={16} color="#FFB800" />
                  </View>
                </View>
              </View>

              <Text style={styles.emptyTitle}>Aucune transaction</Text>
              <Text style={styles.emptySubtitle}>
                Votre historique apparaîtra ici{'\n'}dès que vous effectuerez des transactions.
              </Text>

              <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('HomeScreen')}>
                <Ionicons name="swap-horizontal" size={20} color="#1A2840" style={{marginRight: 8}} />
                <Text style={styles.btnActionText}>Effectuer une transaction</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="information" size={16} color="#1A2840" />
            </View>
            <Text style={styles.infoText}>
              Vous pouvez télécharger votre relevé mensuel{'\n'}au format PDF.
            </Text>
          </View>

        </ScrollView>

        <BottomNavBar />
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
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: '#1A2840',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFB800',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 3,
    backgroundColor: '#FFB800',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  mainCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#071536',
    padding: 24,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  cardControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  datePickerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  releveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  releveBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
  },
  cardBody: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#1A2840',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
  },
  btnActionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
  },
});
