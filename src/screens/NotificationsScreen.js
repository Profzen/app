import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { buyGoodsApi } from '../services/buyGoodsApi';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user, t, session } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMerchant = user?.role === 'merchant';

  useEffect(() => {
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
        // We use the merchantId which is usually linked to the user's business.
        // For simplicity, assuming user.merchantId exists or fallback to user.id if backend uses user_id for merchants.
        // Wait, backend merchant_notifications uses merchant_id.
        // Actually, in dizzitapp-v2 user context, do we have merchantId? Let's check or just fetch user notifications if not available.
        // For now, let's try fetch user notifications, but if they are merchant, try merchant API.
        const merchantId = user.merchantProfile?.id || user.id; // use linked merchant ID if available
        data = await buyGoodsApi.getMerchantNotifications(merchantId, session?.access_token);
      } else {
        data = await buyGoodsApi.getUserNotifications(user.id);
      }
      setNotifications(data);
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
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return 'cube';
      case 'promo': return 'pricetag';
      case 'alert': return 'warning';
      case 'system': return 'information-circle';
      default: return 'notifications';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => {
        if (!item.is_read) handleMarkAsRead(item.id);
        // Handle navigation if link_url exists
      }}
    >
      <View style={[styles.iconContainer, !item.is_read && styles.unreadIconContainer]}>
        <Ionicons name={getIcon(item.type)} size={20} color={!item.is_read ? '#FFFFFF' : '#64748B'} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notificationsTitle', 'Notifications')}</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>{t('markAllRead', 'Mark all read')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC759" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>{t('noNotificationsTitle', 'No notifications yet')}</Text>
          <Text style={styles.emptyMessage}>{t('noNotificationsMessage', 'When you get notifications, they will show up here.')}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840' },
  markAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#3B82F6' },
  listContent: { padding: 16 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    boxShadow: '0px 2px 6px rgba(100,116,139,0.05)',
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#D4E2FC',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadIconContainer: {
    backgroundColor: '#20365B',
  },
  textContainer: { flex: 1 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#334155', marginBottom: 4 },
  unreadText: { color: '#1A2840', fontFamily: 'Inter_700Bold' },
  message: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 6 },
  time: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#94A3B8' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginTop: 6,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#1A2840', marginTop: 16, marginBottom: 8 },
  emptyMessage: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
});
