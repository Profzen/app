import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SendMoneyPinScreen() {
  const navigation = useNavigation();
  const [pin, setPin] = useState('1'); // Initial state with 1 digit to match mockup

  const handleKeyPress = (val) => {
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (val !== '.') {
      if (pin.length < 6) {
        setPin(prev => prev + val);
      }
    }
  };

  React.useEffect(() => {
    if (pin.length === 6) navigation.navigate('SendMoneySummaryScreen');
  }, [pin, navigation]);

  const KeyButton = ({ num, isAction, icon, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.keyBtn, 
        isAction && num === 'backspace' && styles.keyBtnBackspace,
        isAction && num === '.' && styles.keyBtnEmpty
      ]} 
      onPress={() => onPress ? onPress() : handleKeyPress(num)}
    >
      {icon ? (
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      ) : (
        <Text style={[styles.keyNum, isAction && num === '.' && {color: '#1A2840'}]}>{num}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A2840" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="arrow-redo" size={20} color="#1A2840" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Envoyer de l'argent</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#1A2840" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1, paddingBottom: 24}} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.pageTitle}>Saisissez votre code PIN</Text>
            <Text style={styles.pageSubtitle}>
              Entrez votre code PIN à 6 chiffres pour{'\n'}confirmer cette transaction.
            </Text>

            {/* PIN Input Boxes */}
            <View style={styles.pinContainer}>
              {[...Array(6)].map((_, i) => {
                const isFilled = i < pin.length;
                const isActive = i === pin.length - 1; // Highlight the last filled one, or the next empty one based on mockup
                // Mockup shows first box yellow with yellow dot, so let's match that if length is 1
                const showYellow = isFilled && isActive;

                return (
                  <View 
                    key={i} 
                    style={[
                      styles.pinBox, 
                      showYellow ? styles.pinBoxActive : null
                    ]}
                  >
                    <View style={[
                      styles.pinDot,
                      showYellow ? styles.pinDotActive : (isFilled ? styles.pinDotFilled : null)
                    ]} />
                  </View>
                );
              })}
            </View>
          </View>

          {/* Circular Keypad */}
          <View style={styles.keypad}>
            <View style={styles.keyRow}>
              <KeyButton num="1" />
              <KeyButton num="2" />
              <KeyButton num="3" />
            </View>
            <View style={styles.keyRow}>
              <KeyButton num="4" />
              <KeyButton num="5" />
              <KeyButton num="6" />
            </View>
            <View style={styles.keyRow}>
              <KeyButton num="7" />
              <KeyButton num="8" />
              <KeyButton num="9" />
            </View>
            <View style={styles.keyRow}>
              <KeyButton num="." isAction={true} />
              <KeyButton num="0" />
              <KeyButton num="backspace" icon="backspace" isAction={true} />
            </View>
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1A2840" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Vos transactions sont sécurisées</Text>
              <Text style={styles.securityDesc}>Nous protégeons vos fonds et vos informations à chaque étape.</Text>
            </View>
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1A2840',
    textAlign: 'center',
    marginBottom: 12,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  pinBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxActive: {
    borderColor: '#FFC759',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1', // Default inactive dot color
  },
  pinDotFilled: {
    backgroundColor: '#1A2840', // Filled dot color (dark blue) - if we want it dark
  },
  pinDotActive: {
    backgroundColor: '#FFC759', // Yellow dot for the active/current input as per mockup
  },
  keypad: {
    paddingHorizontal: 40,
    justifyContent: 'center',
    marginBottom: 40,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9', // Light gray/purple circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBtnEmpty: {
    backgroundColor: 'transparent',
  },
  keyBtnBackspace: {
    backgroundColor: '#1A2840', // Dark blue background for backspace
  },
  keyNum: {
    fontFamily: 'Inter_500Medium',
    fontSize: 28,
    color: '#1A2840',
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FE',
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  securityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  securityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});
