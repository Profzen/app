import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  Easing,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import enDict from '../i18n/locales/en.json';
import frDict from '../i18n/locales/fr.json';
import ptDict from '../i18n/locales/pt.json';
import amDict from '../i18n/locales/am.json';
import arDict from '../i18n/locales/ar.json';

const LOCALE_DICTS = { en: enDict, fr: frDict, pt: ptDict, am: amDict, ar: arDict };

let currentAppLanguage = 'en';

// Synchronize with active stored language
AsyncStorage.getItem('@dizzitup_language')
  .then((saved) => {
    if (saved && LOCALE_DICTS[saved]) {
      currentAppLanguage = saved;
    }
  })
  .catch(() => {});

export function setAppToastLanguage(lang) {
  if (lang && LOCALE_DICTS[lang]) {
    currentAppLanguage = lang;
  }
}

/**
 * Maps raw backend messages or technical errors to clear, translated, user-friendly messages.
 * Never shows raw backend exceptions, status codes, SQL/Prisma/Supabase, or technical payloads to users.
 */
export function mapBackendErrorMessage(raw, lang) {
  if (!raw) return '';
  const msg = typeof raw === 'string' ? raw : (raw?.message || String(raw));
  const activeLang = (lang && LOCALE_DICTS[lang]) ? lang : currentAppLanguage;
  const dict = LOCALE_DICTS[activeLang] || enDict;
  const errDict = dict.errors || {};

  const lower = msg.toLowerCase();

  // 1. Order already paid / completed (idempotency)
  if (
    lower.includes('already been paid') ||
    lower.includes('already paid') ||
    lower.includes('already completed') ||
    lower.includes('already been completed')
  ) {
    return errDict.alreadyPaid || 'This order has already been paid and completed.';
  }

  // 1b. Payment processing / being confirmed (double charge guard)
  if (
    lower.includes('payment_processing') ||
    lower.includes('being confirmed') ||
    lower.includes('currently being confirmed') ||
    lower.includes('en cours de confirmation') ||
    lower.includes('em confirmação')
  ) {
    return (
      errDict.paymentProcessing ||
      'Your payment is currently being confirmed. Please wait a moment.'
    );
  }

  // 2. Failed to pre-create or initialize payment
  if (
    lower.includes('pre-create') ||
    lower.includes('failed to initialize payment') ||
    lower.includes('failed to pre-create') ||
    lower.includes('card payment could not be initiated')
  ) {
    return errDict.paymentInitFailed || 'Unable to initiate payment. Please try again.';
  }

  // 3. Card declined / cancelled / 3DS issues
  if (
    lower.includes('decline') ||
    lower.includes('cancel') ||
    lower.includes('card error') ||
    lower.includes('cybersource') ||
    lower.includes('card payment could not be processed')
  ) {
    return (
      errDict.cardDeclined ||
      'Card payment was declined or could not be processed. Please check your card or try another method.'
    );
  }

  // 4. Network / connection issues
  if (
    lower.includes('network') ||
    lower.includes('fetch failed') ||
    lower.includes('timeout') ||
    lower.includes('econnrefused') ||
    lower.includes('failed to fetch') ||
    lower.includes('internet')
  ) {
    return (
      errDict.networkError ||
      'Connection issue. Please check your internet connection and try again.'
    );
  }

  // 5. Insufficient balance
  if (
    lower.includes('insufficient') ||
    lower.includes('not enough balance') ||
    lower.includes('insufficient balance')
  ) {
    return (
      errDict.insufficientBalance ||
      'Insufficient balance for this payment. Please choose another method or top up.'
    );
  }

  // 6. Payment transfer failed
  if (
    lower.includes('transfer failed') ||
    lower.includes('payment transfer failed') ||
    lower.includes('failed to send')
  ) {
    return (
      errDict.transferFailed ||
      'Payment transfer could not be completed. Please try again.'
    );
  }

  // 7. Internal server errors / database / code crashes
  if (
    lower.includes('server error') ||
    lower.includes('status code 500') ||
    lower.includes('internal server') ||
    lower.includes('database') ||
    lower.includes('supabase') ||
    lower.includes('prisma') ||
    lower.includes('syntaxerror') ||
    lower.includes('referenceerror') ||
    lower.includes('typeerror') ||
    lower.includes('sql') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504') ||
    /\{.*"error"/.test(msg) ||
    /\[object object\]/i.test(msg)
  ) {
    return (
      errDict.serverError ||
      'A temporary error occurred. Please try again in a moment.'
    );
  }

  // If the message is a long stack trace or technical error
  if (msg.length > 120 && (msg.includes('at ') || msg.includes('Error:'))) {
    return (
      errDict.serverError ||
      'A temporary error occurred. Please try again in a moment.'
    );
  }

  return msg;
}

// Global event bus for programmatic toast calls
const toastListeners = new Set();

export const toastManager = {
  show: (options) => {
    toastListeners.forEach((listener) => listener(options));
  },
  hide: () => {
    toastListeners.forEach((listener) => listener(null));
  },
  subscribe: (listener) => {
    toastListeners.add(listener);
    return () => toastListeners.delete(listener);
  },
};

/**
 * Animated presentation card for toasts (bottom position with progress bar)
 */
function AnimatedToastCard({ title, message, type = 'info', duration = 5000, onClose }) {
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  const isError = type === 'error';
  const autoDuration = typeof duration === 'number' ? duration : 5000;

  useEffect(() => {
    // Entrance animation: spring from bottom up
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 85,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 85,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation for auto-dismiss toasts (info, success)
    if (!isError) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: autoDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 80,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.94,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  let iconName = 'information-circle';
  let badgeBg = 'rgba(255, 199, 89, 0.2)';
  let badgeColor = '#FFC759';
  let borderColor = 'rgba(255, 199, 89, 0.4)';

  if (type === 'error') {
    iconName = 'alert-circle';
    badgeBg = 'rgba(239, 68, 68, 0.2)';
    badgeColor = '#EF4444';
    borderColor = 'rgba(239, 68, 68, 0.45)';
  } else if (type === 'success') {
    iconName = 'checkmark-circle';
    badgeBg = 'rgba(16, 185, 129, 0.2)';
    badgeColor = '#10B981';
    borderColor = 'rgba(16, 185, 129, 0.45)';
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          borderColor,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: badgeBg }]}>
        <Ionicons name={iconName} size={20} color={badgeColor} />
      </View>

      <View style={styles.textContainer}>
        {!!title && <Text style={styles.toastTitle}>{title}</Text>}
        {!!message && <Text style={styles.toastMessage}>{message}</Text>}
      </View>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={handleDismiss}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={16} color="#94A3B8" />
      </TouchableOpacity>

      {/* Progress Bar for Auto-dismiss Toasts (Info & Success) */}
      {!isError && (
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
                backgroundColor: badgeColor,
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
}

/**
 * Standard JSX Component: <AppToast visible={...} title={...} message={...} onClose={...} />
 */
export default function AppToast({
  visible,
  title,
  message,
  onClose,
  type = 'success',
  duration = 5000,
}) {
  useEffect(() => {
    if (!visible || !onClose) return undefined;
    // Errors stay until dismissed! Only auto-dismiss info and success
    if (type === 'error') return undefined;

    const dur = typeof duration === 'number' ? duration : 5000;
    const timer = setTimeout(onClose, dur);
    return () => clearTimeout(timer);
  }, [visible, onClose, duration, type]);

  if (!visible) return null;

  const displayMessage = type === 'error' ? mapBackendErrorMessage(message) : message;

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <View
          pointerEvents="box-none"
          style={[
            styles.container,
            { bottom: Math.max(insets?.bottom || 0, 16) + 16 },
          ]}
        >
          <AnimatedToastCard
            title={title}
            message={displayMessage}
            type={type}
            duration={typeof duration === 'number' ? duration : 5000}
            onClose={onClose}
          />
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

/**
 * Global Toast Container (Mounted at root of App.js to listen to static AppToast.show calls)
 */
export function GlobalToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((options) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (!options) {
        setToast(null);
        return;
      }

      setToast(options);

      // Only auto-dismiss for non-error types (~5 seconds)
      if (options.type !== 'error') {
        const dur = typeof options.duration === 'number' ? options.duration : 5000;
        timerRef.current = setTimeout(() => {
          setToast(null);
        }, dur);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <View
          pointerEvents="box-none"
          style={[
            styles.container,
            { bottom: Math.max(insets?.bottom || 0, 16) + 16 },
          ]}
        >
          <AnimatedToastCard
            title={toast.title}
            message={toast.message}
            type={toast.type}
            duration={typeof toast.duration === 'number' ? toast.duration : 5000}
            onClose={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }
              setToast(null);
            }}
          />
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

// ─────────────────────────────────────────────────────────────
// Static programmatic helpers with error mapping and web-like bottom toast timing
// ─────────────────────────────────────────────────────────────

AppToast.show = (title, message, type = 'info', duration) => {
  const activeLang = currentAppLanguage;
  const dict = LOCALE_DICTS[activeLang] || enDict;

  let finalTitle = title;
  let finalMessage = message;

  if (!message) {
    finalMessage = title;
    finalTitle =
      type === 'error'
        ? (dict.errors?.error || 'Error')
        : type === 'success'
        ? (dict.common?.success || 'Success')
        : 'Notice';
  }

  // Never show raw backend error messages to users: map to clean translated messages
  if (type === 'error') {
    finalMessage = mapBackendErrorMessage(finalMessage, activeLang);
  }

  // Errors stay until dismissed (duration = null); info/success auto-dismiss in ~5s
  const finalDuration =
    type === 'error'
      ? null
      : typeof duration === 'number'
      ? duration
      : 5000;

  toastManager.show({
    title: finalTitle,
    message: finalMessage,
    type,
    duration: finalDuration,
  });
};

AppToast.showSuccess = (message, title) => {
  AppToast.show(title, message, 'success');
};

AppToast.showError = (message, title) => {
  AppToast.show(title, message, 'error');
};

AppToast.showInfo = (message, title) => {
  AppToast.show(title, message, 'info');
};

AppToast.hide = () => {
  toastManager.hide();
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999999,
    elevation: 999999,
    alignItems: 'center',
  },
  toastWrapper: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1A2840', // Deep Brand Navy / Midnight
    borderRadius: 16,
    borderWidth: 1.5,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 14,
    overflow: 'hidden',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  toastTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  toastMessage: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  progressBarTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBarFill: {
    height: '100%',
  },
});

