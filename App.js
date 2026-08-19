import React from 'react';
import { View, ActivityIndicator, StatusBar, LogBox } from 'react-native';
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
      
      {/* Custom Animated Splash Screen rendered on top of everything using a Modal */}
      {!animationComplete && (
        <Modal transparent={true} animationType="none" visible={true} statusBarTranslucent={true}>
          <AnimatedSplashScreen onAnimationComplete={() => setAnimationComplete(true)} />
        </Modal>
      )}
    </View>
  );
}
