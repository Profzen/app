import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeedItem({ icon, iconColor, iconBgColor, title, titleBold, timeAgo, imageColor, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          <Text style={styles.titleBold}>{titleBold}</Text> {title}
        </Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>

      <View style={[styles.imagePlaceholder, { backgroundColor: imageColor }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 4,
  },
  titleBold: {
    fontFamily: 'Inter_600SemiBold',
  },
  timeAgo: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#A0AABF',
  },
  imagePlaceholder: {
    width: 80,
    height: 48,
    borderRadius: 8,
    marginLeft: 12,
  },
});
