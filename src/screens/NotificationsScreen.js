import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, 
  Platform, LayoutAnimation, UIManager, Animated, Easing, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { buyGoodsApi } from '../services/buyGoodsApi';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', labelKey: 'tabAll', fallback: 'All' },
  { id: 'transaction', labelKey: 'tabTransactions', fallback: 'Transactions' },
  { id: 'alert', labelKey: 'tabAlerts', fallback: 'Alerts' },
  { id: 'promo', labelKey: 'tabPromos', fallback: 'Promotions' }
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user, t, session } = useApp();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Animation value for header
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const isMerchant = user?.role === 'merchant';

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let data = [];
      if (isMerchant) {
        const merchantId = user.merchantProfile?.id || user.id;
        data = await buyGoodsApi.getMerchantNotifications(merchantId, session?.access_token);
      } else {
        data = await buyGoodsApi.getUserNotifications(user.id);
      }
      // Simulate categorizing older notifications if they lack specific types
      const processedData = data.map(n => ({
        ...n,
        type: n.type || (n.title.toLowerCase().includes('pay') ? 'transaction' : 'alert')
      }));
      setNotifications(processedData);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      if (isMerchant) {
        await buyGoodsApi.markMerchantNotificationAsRead(id, session?.access_token);
      } else {
        await buyGoodsApi.markUserNotificationAsRead(id);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      if (isMerchant) {
        const merchantId = user.merchantProfile?.id || user.id;
        await buyGoodsApi.markAllMerchantNotificationsAsRead(merchantId, session?.access_token);
      } else {
        await buyGoodsApi.markAllUserNotificationsAsRead(user.id);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  const getIconConfig = (type, isRead) => {
    const baseColor = isRead ? '#94A3B8' : '#1A2840';
    switch (type) {
      case 'transaction': 
      case 'order': 
        return { name: 'swap-horizontal', bg: isRead ? '#F1F5F9' : '#E8F0FE', color: isRead ? '#94A3B8' : '#3B82F6' };
      case 'promo': 
        return { name: 'star', bg: isRead ? '#F1F5F9' : '#FEF3C7', color: isRead ? '#94A3B8' : '#D97706' };
      case 'alert': 
        return { name: 'flash', bg: isRead ? '#F1F5F9' : '#FEE2E2', color: isRead ? '#94A3B8' : '#EF4444' };
      default: 
        return { name: 'notifications', bg: isRead ? '#F1F5F9' : '#E2E8F0', color: baseColor };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.type === activeTab || (activeTab === 'transaction' && n.type === 'order');
  });

  const renderTab = (tab) => {
    const isActive = activeTab === tab.id;
    return (
      <TouchableOpacity 
        key={tab.id}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setActiveTab(tab.id);
        }}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {t(tab.labelKey, tab.fallback)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {
    const { name, bg, color } = getIconConfig(item.type, item.is_read);
    const isActionable = item.type === 'transaction' || item.type === 'alert';

    return (
      <Animated.View style={[
        styles.cardWrapper, 
        { opacity: headerOpacity, transform: [{ translateY: headerOpacity.interpolate({ inputRange: [0, 1], outputRange: [20 * (index+1), 0] }) }] }
      ]}>
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
          onPress={() => {
            if (!item.is_read) handleMarkAsRead(item.id);
          }}
        >
          <View style={[styles.iconContainer, { backgroundColor: bg }]}>
            <Ionicons name={name} size={20} color={color} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !item.is_read && styles.unreadText]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.time}>
                {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            
            {/* Quick Contextual Actions (Small, sleek links instead of big buttons) */}
            {isActionable && !item.is_read && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionText}>
                    {item.type === 'transaction' ? t('viewDetails', 'View Receipt') : t('takeAction', 'Resolve Now')} <Ionicons name="arrow-forward" size={12} color="#3B82F6"/>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {!item.is_read && <View style={styles.unreadIndicator} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#1A2840" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('activityInboxTitle', 'Activity Inbox')}</Text>
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={22} color="#1A2840" />
          </TouchableOpacity>
        </View>
        
        {/* Dynamic Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {CATEGORIES.map(renderTab)}
        </ScrollView>
      </Animated.View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC759" />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <Animated.View style={[styles.center, { opacity: headerOpacity }]}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="mail-unread-outline" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>{t('noActivityTitle', 'All caught up!')}</Text>
          <Text style={styles.emptyMessage}>
            {t('noActivityMessage', 'Your inbox is empty. New updates, transactions, and reminders will appear here.')}
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: '#1A2840' },
  markAllBtn: { padding: 4, marginRight: -4 },
  
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#1A2840',
    borderColor: '#1A2840',
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFC759', // DizzitUp Yellow accent for active tab
  },

  listContent: { padding: 20, paddingTop: 12, paddingBottom: 100 },
  cardWrapper: { marginBottom: 12 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.4)',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(59, 130, 246, 0.15)', // Very subtle blue tint
    shadowColor: '#3B82F6',
    shadowOpacity: 0.08,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { 
    fontFamily: 'Inter_600SemiBold', 
    fontSize: 15, 
    color: '#475569', 
    flex: 1, 
    paddingRight: 8 
  },
  unreadText: { color: '#1A2840', fontFamily: 'Inter_700Bold' },
  time: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#94A3B8' },
  message: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 13, 
    color: '#64748B', 
    lineHeight: 18 
  },
  
  actionRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAction: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  quickActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#3B82F6',
  },
  
  unreadIndicator: {
    position: 'absolute',
    top: 22,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6', // Notification blue
  },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#1A2840', marginBottom: 8 },
  emptyMessage: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
});
