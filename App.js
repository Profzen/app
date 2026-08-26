import 'react-native-get-random-values';
import React from 'react';
import { View, ActivityIndicator, StatusBar, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AppProvider } from './src/context/AppContext';
import { CrossmintProvider } from '@crossmint/client-sdk-react-native-ui';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';
import { Modal } from 'react-native';

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

  if (!isAppReady) {
    return null; // Return null instead of ActivityIndicator to let Native splash show
  }

  const appNav = (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <AppProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
          {isValidCrossmintKey ? (
            <CrossmintProvider apiKey={rawCrossmintKey}>
              {appNav}
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
    </View>
  );
}
