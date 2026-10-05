import { Linking, Platform } from 'react-native';

let WALLET_API = process.env.EXPO_PUBLIC_DIZZY_WALLET_API_URL || 'https://wallet.dizzitup.com/api';
const walletBase = WALLET_API.replace(/\/wallet\/?$/, '').replace(/\/api\/?$/, '') + '/api/wallet';

export const smsService = {
  /**
   * Send an SMS via DizzitUp's Twilio backend
   * @param {string} phone - Recipient phone number (E.164 formatted preferred)
   * @param {string} message - Message body text
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  sendTwilioSms: async (phone, message) => {
    if (!phone) throw new Error('Phone number is required');

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const res = await fetch(`${walletBase}/send-sms-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: cleanPhone,
        message,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to send SMS via Twilio');
    }
    return data;
  },

  /**
   * Open the native device SMS client
   * @param {string} phone - Optional recipient phone
   * @param {string} message - Message body
   */
  openDeviceSms: async (phone = '', message = '') => {
    const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : '';
    const encodedBody = encodeURIComponent(message);
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = cleanPhone
      ? `sms:${cleanPhone}${separator}body=${encodedBody}`
      : `sms:${separator}body=${encodedBody}`;

    const supported = await Linking.canOpenURL(url).catch(() => false);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
    // Fallback simple url
    await Linking.openURL(`sms:${cleanPhone}`);
    return true;
  },
};
