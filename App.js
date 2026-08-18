import React from 'react';
import { View, ActivityIndicator, StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AppProvider } from './src/context/AppContext';
import { CrossmintProvider } from '@crossmint/client-sdk-react-native-ui';

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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFC759" />
      </View>
    );
  }

  const appNav = (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );

  return (
    <SafeAreaProvider>
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
  );
}
