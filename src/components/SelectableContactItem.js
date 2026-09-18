import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';

export default function SelectableContactItem({
  avatarUrl,
  name,
  relation,
  countryName,
  countryFlag,
  statusColor = '#10B981',
  isSelected,
  onSelect,
}) {
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected ? styles.containerSelected : styles.containerNormal]} 
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View style={styles.avatarContainer}>
        <Avatar image={avatarUrl} name={name} size={48} />
        {statusColor && (
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
        <Text style={styles.detailsText} numberOfLines={1}>
          {relation ? `${relation} • ` : ''}{countryName} {countryFlag}
        </Text>
      </View>

      <View style={styles.selectionIndicator}>
        {isSelected ? (
          <View style={styles.checkedCircle}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.uncheckedCircle} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  containerNormal: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F1F5F9',
  },
  containerSelected: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FFC759',
    shadowColor: '#FFC759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1A2840',
    marginBottom: 3,
  },
  detailsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  selectionIndicator: {
    marginLeft: 10,
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFC759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
});
