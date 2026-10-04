import 'react-native-get-random-values';
if (typeof global.window === 'undefined') {
  global.window = global;
}
if (typeof global.crypto !== 'object') {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = require('react-native-get-random-values').getRandomValues;
}
if (typeof window.crypto !== 'object') {
  window.crypto = global.crypto;
}
import React from 'react';
import { View, ActivityIndicator, StatusBar, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AppProvider, useApp } from './src/context/AppContext';
import { CrossmintProvider, CrossmintWalletProvider, useCrossmint } from '@crossmint/client-sdk-react-native-ui';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';
import { GlobalToast } from './src/components/AppToast';
import { Modal } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import Constants from 'expo-constants';
import { navigationRef, notificationService } from './src/services/notificationService';

WebBrowser.maybeCompleteAuthSession();

// Keep the native splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync().catch(() => {});

const rawCrossmintKey = process.env.EXPO_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY;
const isValidCrossmintKey = Boolean(
  rawCrossmintKey &&
  (rawCrossmintKey.startsWith('ck_development_') ||
   rawCrossmintKey.startsWith('ck_staging_') ||
   rawCrossmintKey.startsWith('ck_production_') ||
   rawCrossmintKey.startsWith('sk_development_') ||
   rawCrossmintKey.startsWith('sk_staging_') ||
   rawCrossmintKey.startsWith('sk_production_'))
);

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  '"textShadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  'setLayoutAnimationEnabledExperimental',
  // Crossmint info notice: recovery only applies to device signers (DZYwallet uses email signers)
  '[SDK] wallet.recover.skipped',
  // Crossmint info notice: its internal logger ignores repeated init when getWallet() is called
  '[SDK] SdkLogger.init called multiple times',
]);

if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args[0] || '';
    if (
      typeof msg === 'string' &&
      (msg.includes('"shadow*" style props are deprecated') ||
       msg.includes('"textShadow*" style props are deprecated') ||
       msg.includes('props.pointerEvents is deprecated'))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    html, body, #root {
      height: 100%;
      overflow: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    /* Ensure all ScrollViews in React Native Web respond to mousewheel smoothly */
    div[style*="overflow-y: scroll"],
    div[style*="overflow-y: auto"],
    div[style*="overflow: auto"],
    div[style*="overflow: scroll"] {
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      overscroll-behavior: contain;
    }
  `;
  document.head.appendChild(styleEl);
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const [isAppReady, setIsAppReady] = React.useState(false);
  const [animationComplete, setAnimationComplete] = React.useState(false);

  React.useEffect(() => {
    if (fontsLoaded) {
      setIsAppReady(true);
      // Once fonts are loaded, hide the native splash screen.
      // This reveals our custom AnimatedSplashScreen which is rendered below.
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  React.useEffect(() => {
    let subscription;
    try {
      const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
      if (Platform.OS !== 'web' && !isExpoGo) {
        const Notifications = require('expo-notifications');
        subscription = Notifications.addNotificationResponseReceivedListener(response => {
          notificationService.handleNotificationResponse(response);
        });
      }
    } catch (e) {
      console.log('Notification listener error:', e);
    }

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  if (!isAppReady) {
    return null; // Return null instead of ActivityIndicator to let Native splash show
  }

  const linking = {
    prefixes: ['dizzitup://', 'https://dizzitup.com', 'https://*.dizzitup.com'],
    config: {
      screens: {
        RegisterScreen: 'invite',
        RewardsScreen: 'rewards',
      },
    },
  };

  const appNav = (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <AppNavigator />
    </NavigationContainer>
  );

  function CrossmintJwtSync() {
    const { setJwt } = useCrossmint();
    const { user } = useApp();

    React.useEffect(() => {
      const isMerchant = user?.role === 'merchant';
      const jwt = (isMerchant && user?.businessCrossmintJWT)
        ? user.businessCrossmintJWT
        : (user?.businessCrossmintJWT || user?.crossmintJWT);

      if (jwt && typeof setJwt === 'function') {
        try {
          setJwt(jwt);
        } catch (err) {
          console.warn('[CrossmintJwtSync] setJwt error:', err);
        }
      }
    }, [user?.role, user?.crossmintJWT, user?.businessCrossmintJWT, setJwt]);

    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <AppProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
          {isValidCrossmintKey ? (
            <CrossmintProvider apiKey={rawCrossmintKey}>
              <CrossmintWalletProvider showOtpSignerPrompt={true}>
                <CrossmintJwtSync />
                {appNav}
              </CrossmintWalletProvider>
            </CrossmintProvider>
          ) : (
            appNav
          )}
        </AppProvider>
      </SafeAreaProvider>
      
      {/* Custom Animated Splash Screen rendered on top of everything without a Modal to prevent Android layout bugs */}
      {!animationComplete && (
        <AnimatedSplashScreen onAnimationComplete={() => setAnimationComplete(true)} />
      )}

      {/* Beautiful Animated Toast Container */}
      <GlobalToast />
    </View>
  );
}
