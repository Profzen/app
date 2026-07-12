import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppToast({ visible, title, message, onClose }) {
  useEffect(() => {
    if (!visible || !onClose) return undefined;
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [visible, onClose]);
  if (!visible) return null;
  return <View style={styles.toast}><View style={styles.icon}><Ionicons name="checkmark" size={18} color="#FFF" /></View><View style={styles.content}><Text style={styles.title}>{title}</Text>{!!message && <Text style={styles.message}>{message}</Text>}</View><TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color="#64748B" /></TouchableOpacity></View>;
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', top: 18, left: 16, right: 16, zIndex: 100, flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderWidth: 1, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: '#16A34A' },
  content: { flex: 1 }, title: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1A2840' }, message: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748B', marginTop: 2 },
});
