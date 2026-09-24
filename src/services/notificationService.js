import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { createNavigationContainerRef } from '@react-navigation/native';
import supabase from './supabaseClient';

export const navigationRef = createNavigationContainerRef();

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PROJECT_ID =
  Constants?.expoConfig?.extra?.eas?.projectId ??
  Constants?.easConfig?.projectId ??
  '485a099a-a88c-4405-9211-8abd9429ac31';

export const notificationService = {
  /**
   * Request permissions and get Expo Push Token
   */
  async registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'DizzitApp Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFC759',
      });
    }

    if (!Device.isDevice) {
      console.log('[notificationService] Physical device required for push notifications');
      return null;
    }

    // Expo Go limitation check (SDK 50+ handles push differently in development builds)
    if (Constants.appOwnership === 'expo') {
      console.log('[notificationService] Push notifications require a development or production build');
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[notificationService] Notification permissions not granted');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: PROJECT_ID,
      });

      return tokenData?.data || null;
    } catch (error) {
      console.warn('[notificationService] Error getting push token:', error);
      return null;
    }
  },

  /**
   * Sync the retrieved token to user_profiles in Supabase
   */
  async syncPushTokenToSupabase(userId, token) {
    if (!userId || !token) return false;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          expo_push_token: token,
          push_notifications_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.warn('[notificationService] Failed to sync token to Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[notificationService] Exception syncing token:', err);
      return false;
    }
  },

  /**
   * Handle deep-linking navigation when user taps a push notification
   */
  handleNotificationResponse(response) {
    const data = response?.notification?.request?.content?.data || {};
    if (!navigationRef.isReady()) {
      return;
    }

    const type = data.type || data.screen || '';

    switch (type) {
      case 'bill_reminder':
      case 'utility':
      case 'pay_bill':
        if (data.billId) {
          navigationRef.navigate('BillDetailsScreen', { billId: data.billId });
        } else {
          navigationRef.navigate('PayBillsScreen');
        }
        break;

      case 'weekly_deal':
      case 'deal':
      case 'promo':
      case 'shop':
        if (data.productId && data.shopId) {
          navigationRef.navigate('ProductDetailsScreen', { productId: data.productId, shopId: data.shopId });
        } else if (data.shopId) {
          navigationRef.navigate('ShopDetailsScreen', { shopId: data.shopId });
        } else {
          navigationRef.navigate('ShopsScreen');
        }
        break;

      case 'exchange_rate':
      case 'remittance':
      case 'send_money':
        navigationRef.navigate('SendMoneyScreen');
        break;

      case 'rewards':
      case 'cashback':
      case 'dzy_milestone':
        navigationRef.navigate('RewardsScreen');
        break;

      case 'transaction':
      case 'payment_success':
        navigationRef.navigate('TransactionHistoryScreen');
        break;

      case 'contact_joined':
      case 'network_alert':
        navigationRef.navigate('ContactsScreen');
        break;

      default:
        navigationRef.navigate('NotificationsScreen');
        break;
    }
  },
};

export default notificationService;
