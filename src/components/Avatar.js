import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const AVATAR_MAP = {
  avatar_1: '👩',
  avatar_2: '👨',
  avatar_3: '👧',
  avatar_4: '👦',
  avatar_5: '👵',
  avatar_6: '👴',
};

export default function Avatar({ image, name, size = 40, style }) {
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style
  ];

  // 1. If it's a known avatar ID
  if (image && AVATAR_MAP[image]) {
    return (
      <View style={containerStyle}>
        <Text style={{ fontSize: size * 0.55 }}>{AVATAR_MAP[image]}</Text>
      </View>
    );
  }

  // 2. If it's an HTTP URL or Data URI
  if (image && (image.startsWith('http') || image.startsWith('data:'))) {
    return <Image source={{ uri: image }} style={containerStyle} />;
  }

  // 3. If it's a short string (e.g. an emoji passed directly, or raw initials)
  if (image && image.length < 10) {
    return (
      <View style={containerStyle}>
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{image}</Text>
      </View>
    );
  }

  // 4. Fallback to Initials from Name
  let initials = '?';
  if (name && name.trim() !== '') {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      initials = (parts[0][0] + '.' + parts[1][0]).toUpperCase();
    } else {
      initials = parts[0][0].toUpperCase();
    }
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  text: {
    fontFamily: 'Inter_700Bold',
    color: '#20365B',
  },
});
