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
      {isWide ? (
        <View style={styles.wideContainer}>
          <View style={[styles.largeIconCircle, { backgroundColor: iconBgColor }]}>
            <View style={styles.multiIconGridWide}>
              {multiIcons.map((icon, index) => (
                <View key={index} style={styles.miniIconCell}>
                  <Ionicons name={icon} size={20} color={iconColor} />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.textContainerWide}>
            <Text style={styles.titleWide}>{title}</Text>
            <Text style={styles.subtitleWide}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1A2840" />
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
              <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1A2840" style={styles.chevron} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: '48%',
    marginBottom: 16,
  },
  cardWide: {
    width: '100%',
    padding: 16,
  },
  wideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  multiIconGridWide: {
    width: 44,
    height: 44,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  miniIconCell: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainerWide: {
    flex: 1,
    marginRight: 12,
  },
  chevron: {
    marginTop: 12,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: '#1A2840',
    marginBottom: 4,
    lineHeight: 16,
  },
  titleWide: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8B92A5',
    lineHeight: 14,
  },
  subtitleWide: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8B92A5',
    lineHeight: 16,
  }
});
