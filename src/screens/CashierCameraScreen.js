import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';

export default function CashierCameraScreen() {
  const navigation = useNavigation();
  const { t } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>{t('pos.camera_permission', 'Nous avons besoin de votre permission pour utiliser la caméra')}</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>{t('pos.grant_permission', 'Accorder la permission')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      const parsedData = JSON.parse(data);
      if (parsedData && parsedData.type === 'user_payment') {
        // Handle the scanned payment data
        Alert.alert(
          t('pos.scan_success', 'Client Scanné avec succès'),
          t('pos.process_payment', `Redirection vers l'encaissement de ${parsedData.amount} ${parsedData.currency}`),
          [{ text: 'OK', onPress: () => navigation.navigate('CashierSuccessScreen', { paymentData: parsedData }) }]
        );
      } else {
        Alert.alert('Erreur', 'QR Code non reconnu ou invalide.', [{ text: 'OK', onPress: () => setScanned(false) }]);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Format de QR Code invalide.', [{ text: 'OK', onPress: () => setScanned(false) }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('pos.scan_customer', 'Scanner le Client')}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          <Text style={styles.overlayText}>{t('pos.align_qr', 'Alignez le QR code dans le cadre')}</Text>
        </View>
      </View>

      {scanned && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>{t('pos.scan_again', 'Scanner à nouveau')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 20,
  },
  overlayText: {
    color: '#FFF',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  rescanText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
