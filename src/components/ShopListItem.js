import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export default function ShopListItem({ icon, name, category, location, distance, rating, reviews, bgColor, iconColor, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContent}>
        <View style={[styles.logoContainer, { backgroundColor: bgColor }]}>
          {typeof icon === 'string' ? (
            <Text style={styles.logoText}>{icon}</Text>
          ) : (
            <Ionicons name={icon.name} size={24} color={iconColor || '#FFFFFF'} />
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.category}>{category}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#8B92A5" style={styles.locationIcon} />
            <Text style={styles.locationText}>{location} • {distance}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <View style={styles.dzyBadge}>
          <Text style={styles.dzyText}>DZY accepté</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#FFC759" />
          <Text style={styles.ratingScore}>{rating}</Text>
          <Text style={styles.reviewsCount}>({reviews})</Text>
          <Ionicons name="chevron-forward" size={20} color="#1A2840" style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 2,
  },
  category: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8B92A5',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  dzyBadge: {
    backgroundColor: '#FFF8ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  dzyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFC759',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#1A2840',
    marginLeft: 4,
  },
  reviewsCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8B92A5',
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 8,
  }
});
