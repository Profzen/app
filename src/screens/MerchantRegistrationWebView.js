import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { isSmallScreen } from '../utils/responsive';

export default function MerchantRegistrationWebView() {
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  // Determine if the URL indicates a successful registration or a login redirect
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log("WebView Navigation:", url);
    
    // If they successfully sign up or log in on the web, 
    // the web app redirects to merchant-dashboard. We should intercept this
    // and close the webview, taking them back to the app's logged-in state.
    if (url.includes('/merchant-dashboard')) {
      // Typically, auth state change in Supabase is synced automatically.
      // We just need to close the webview.
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Registration</Text>
        <View style={{ width: 36 }} /> {/* Spacer for centering */}
      </View>

      <View style={styles.webViewContainer}>
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        )}
        <WebView
          source={{ uri: 'https://dizzitup.com/merchant-login-registration' }}
          style={styles.webview}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 44) + 6 : 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 16 : theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    zIndex: 1,
  },
});
