import React from 'react';
import { View, ActivityIndicator, StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';

import { AppProvider } from './src/context/AppContext';
import { CrossmintProvider } from '@crossmint/client-sdk-react-native-ui';

const CROSSMINT_API_KEY = process.env.EXPO_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY || '';

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

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <CrossmintProvider apiKey={CROSSMINT_API_KEY}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CrossmintProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
