import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceGridCard({ 
  title, 
  subtitle, 
  isWide = false, 
  iconName, 
  iconColor, 
  iconBgColor, 
  multiIcons,
  onPress 
}) {
  return (
    <TouchableOpacity 
      style={[styles.card, isWide && styles.cardWide]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.headerRow, isWide && styles.headerRowWide]}>
        {multiIcons ? (
          <View style={styles.multiIconGrid}>
            {multiIcons.map((icon, index) => (
              <View key={index} style={[styles.miniIconWrapper, { backgroundColor: iconBgColor }]}>
                <Ionicons name={icon} size={14} color={iconColor} />
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
            <Ionicons name={iconName} size={24} color={iconColor} />
          </View>
        )}
        
        <Ionicons name="chevron-forward" size={20} color="#1A2840" style={styles.chevron} />
      </View>

      <Text style={[styles.title, isWide && styles.titleWide]}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: '48%',
    marginBottom: 16,
  },
  cardWide: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerRowWide: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiIconGrid: {
    width: 48,
    height: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  miniIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginTop: 12,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1A2840',
    marginBottom: 6,
    lineHeight: 18,
  },
  titleWide: {
    fontSize: 15,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
    lineHeight: 16,
  }
});
