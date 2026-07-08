import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export default function ContactListItem({ avatarUrl, name, countryFlag, countryName, isFavorite, onFavoritePress, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContent}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.countryRow}>
            <Text style={styles.flag}>{countryFlag}</Text>
            <Text style={styles.countryName}>{countryName}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <TouchableOpacity style={styles.favoriteButton} onPress={onFavoritePress}>
          <Ionicons 
            name={isFavorite ? "star" : "star-outline"} 
            size={20} 
            color={isFavorite ? '#FFC759' : '#8B92A5'} 
          />
        </TouchableOpacity>
        <View style={styles.dzyBadge}>
          <Text style={styles.dzyText}>DZY</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#1A2840" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  infoContainer: {
    marginLeft: 12,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 12,
    marginRight: 4,
  },
  countryName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8B92A5',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 4,
    marginRight: 8,
  },
  dzyBadge: {
    backgroundColor: '#FFF8ED',
    borderWidth: 1,
    borderColor: '#FFC759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  dzyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFC759',
  },
  chevron: {
    marginLeft: 4,
  }
});
