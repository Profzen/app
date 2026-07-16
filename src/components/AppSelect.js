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
        <Ionicons name="chevron-down" size={20} color={chevronColor} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <TouchableOpacity style={styles.close} onPress={() => setOpen(false)} accessibilityLabel="Fermer la liste">
                <Ionicons name="close" size={22} color="#1A2840" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.options} bounces={false}>
              {options.map((option) => {
                const active = option.value === selected?.value;
                return (
                  <TouchableOpacity key={option.value} style={[styles.option, active && styles.optionActive]} onPress={() => select(option)}>
                    <View style={styles.optionContent}>
                      {option.iconName && <Ionicons name={option.iconName} size={20} color={option.color || '#3B82F6'} />}
                      <View style={styles.optionCopy}>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                        {!!option.subtitle && <Text style={styles.optionSubtitle}>{option.subtitle}</Text>}
                      </View>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color="#F5A900" />}
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
  trigger: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16 },
  triggerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  triggerText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1A2840' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,17,40,0.35)' },
  sheet: { maxHeight: '72%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 24 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#1A2840' },
  close: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  options: { flexGrow: 0 },
  option: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 10 },
  optionActive: { backgroundColor: '#FFF8E6', borderRadius: 12, borderBottomColor: 'transparent' },
  optionContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  optionCopy: { flex: 1, marginLeft: 10 },
  optionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A2840' },
  optionSubtitle: { marginTop: 2, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748B' },
});
