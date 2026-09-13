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

const PALETTES = [
  { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' }, // Indigo
  { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' }, // Emerald
  { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }, // Amber
  { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' }, // Purple
  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' }, // Blue
  { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' }, // Pink
  { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' }, // Teal
];

function getPalette(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

export default function Avatar({ image, name, size = 40, style }) {
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style
  ];

  // 1. If it's a known avatar ID
  if (image && AVATAR_MAP[image]) {
    return (
      <View style={[containerStyle, { backgroundColor: '#F8FAFC' }]}>
        <Text style={{ fontSize: size * 0.55 }}>{AVATAR_MAP[image]}</Text>
      </View>
    );
  }

  // 2. If it's an HTTP URL or Data URI
  if (image && typeof image === 'string' && (image.startsWith('http') || image.startsWith('data:'))) {
    return (
      <Image 
        source={{ uri: image }} 
        style={containerStyle} 
        resizeMode="cover"
      />
    );
  }

  // 3. If it's a short string (e.g. an emoji passed directly)
  if (image && typeof image === 'string' && image.length <= 4) {
    return (
      <View style={[containerStyle, { backgroundColor: '#F8FAFC' }]}>
        <Text style={{ fontSize: size * 0.45 }}>{image}</Text>
      </View>
    );
  }

  // 4. Initials from Name with deterministic, harmonious palette
  const palette = getPalette(name || '?');
  let initials = '?';
  if (name && name.trim() !== '') {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      initials = parts[0].slice(0, 2).toUpperCase();
    }
  }

  return (
    <View style={[containerStyle, { backgroundColor: palette.bg, borderColor: palette.border, borderWidth: 1 }]}>
      <Text style={[styles.text, { color: palette.text, fontSize: size * 0.38 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.5,
  },
});
