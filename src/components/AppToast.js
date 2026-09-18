import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
 * Animated presentation card for toasts
 */
function AnimatedToastCard({ title, message, type = 'info', onClose }) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
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
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -60,
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
  let borderColor = 'rgba(255, 199, 89, 0.35)';

  if (type === 'error') {
    iconName = 'alert-circle';
    badgeBg = 'rgba(239, 68, 68, 0.2)';
    badgeColor = '#EF4444';
    borderColor = 'rgba(239, 68, 68, 0.4)';
  } else if (type === 'success') {
    iconName = 'checkmark-circle';
    badgeBg = 'rgba(16, 185, 129, 0.2)';
    badgeColor = '#10B981';
    borderColor = 'rgba(16, 185, 129, 0.4)';
  }

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
        <Ionicons name="close" size={16} color="#878FA4" />
      </TouchableOpacity>
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
  duration = 3500,
}) {
  useEffect(() => {
    if (!visible || !onClose) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, onClose, duration]);

  if (!visible) return null;

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <View
          pointerEvents="box-none"
          style={[styles.container, { top: (insets?.top || 20) + 8 }]}
        >
          <AnimatedToastCard
            title={title}
            message={message}
            type={type}
            onClose={onClose}
          />
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

/**
 * Global Top-Level Toast Container (Mounted in App.js to listen to static AppToast.show calls)
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

      const dur = options.duration || 3500;
      timerRef.current = setTimeout(() => {
        setToast(null);
      }, dur);
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
          style={[styles.container, { top: (insets?.top || 20) + 8 }]}
        >
          <AnimatedToastCard
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

// ─────────────────────────────────────────────────────────────
// 🚀 Static programmatic helpers for smooth, no-alert toasts
// ─────────────────────────────────────────────────────────────

AppToast.show = (title, message, type = 'info', duration = 3500) => {
  const finalTitle = message ? title : (type === 'error' ? 'Notice' : 'Success');
  const finalMessage = message ? message : title;
  toastManager.show({
    title: finalTitle,
    message: finalMessage,
    type,
    duration,
  });
};

AppToast.showSuccess = (message, title = 'Success') => {
  AppToast.show(title, message, 'success');
};

AppToast.showError = (message, title = 'Notice') => {
  AppToast.show(title, message, 'error');
};

AppToast.showInfo = (message, title = 'Information') => {
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
    alignItems: 'center',
  },
  toastWrapper: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#20365B', // Deep Brand Navy
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
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
    color: '#DCE1EA',
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
});
