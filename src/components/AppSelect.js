import React, { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppSelect({
  value,
  options,
  onChange,
  title = 'Choisir une option',
  style,
  textStyle,
  renderLeading,
  accessibilityLabel,
  chevronColor = '#1A2840',
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) || options[0];

  const select = (option) => {
    onChange?.(option.value, option);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, style]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ expanded: open }}
      >
        <View style={styles.triggerLeft}>
          {renderLeading?.(selected)}
          <Text style={[styles.triggerText, textStyle]} numberOfLines={1}>{selected?.label}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={chevronColor} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          
          {/* Floating Discrete Modal Card with Margins */}
          <View style={styles.modalCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{title}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)} accessibilityLabel="Fermer la liste">
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsScroll} bounces={false} showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const active = option.value === selected?.value;
                return (
                  <TouchableOpacity 
                    key={option.value} 
                    style={[styles.optionRow, active && styles.optionRowActive]} 
                    onPress={() => select(option)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContent}>
                      {/* Logo Icon Badge */}
                      {option.iconName ? (
                        <View style={[styles.iconBadge, { backgroundColor: option.bg || '#3B82F6' }]}>
                          <Ionicons name={option.iconName} size={16} color={option.color || '#FFFFFF'} />
                        </View>
                      ) : (
                        <View style={[styles.iconBadge, { backgroundColor: '#F1F5F9' }]}>
                          <Text style={styles.iconBadgeText}>{option.label?.substring(0, 2)}</Text>
                        </View>
                      )}

                      <View style={styles.optionTextWrap}>
                        <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
                        {!!(option.subtitle || option.name) && (
                          <Text style={styles.optionSubtitle}>{option.subtitle || option.name}</Text>
                        )}
                      </View>
                    </View>
                    
                    {active && (
                      <View style={styles.activeCheckCircle}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16 },
  triggerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  triggerText: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#0F172A' },
  
  /* Discrete Floating Modal Popup with Margins */
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.45)', paddingHorizontal: 20 },
  modalCard: { width: '100%', maxWidth: 380, maxHeight: '68%', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: '#0F172A' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  optionsScroll: { flexGrow: 0 },
  optionRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, backgroundColor: '#FFFFFF' },
  optionRowActive: { backgroundColor: '#FFFDF0', borderColor: '#FFC759' },
  optionContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBadgeText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: '#0F172A' },
  optionTextWrap: { flex: 1 },
  optionLabel: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: '#0F172A' },
  optionLabelActive: { color: '#0F172A' },
  optionSubtitle: { marginTop: 1, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
  activeCheckCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#D97706', justifyContent: 'center', alignItems: 'center' },
});
