import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';

/**
 * In-app product video (expo-video): plays inside the gallery slide, never opens the raw storage URL.
 * - Shows a branded play overlay until the buyer taps play.
 * - Pauses automatically when the buyer swipes to another slide.
 * - Native controls (seek, fullscreen) once playing.
 */
export default function ProductVideoSlide({ uri, isActive, playLabel, errorTitle, errorDesc }) {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState('idle');

  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status: next }) => setStatus(next));
    return () => sub.remove();
  }, [player]);

  // Pause when the slide is no longer visible
  useEffect(() => {
    if (!isActive && started) {
      try { player.pause(); } catch (_) { /* player already released */ }
    }
  }, [isActive, started, player]);

  const handlePlay = () => {
    setStarted(true);
    try { player.play(); } catch (_) { setStatus('error'); }
  };

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Ionicons name="videocam-off-outline" size={30} color="#FFB800" />
        <Text style={styles.errorTitle}>{errorTitle}</Text>
        <Text style={styles.errorDesc}>{errorDesc}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={started}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture={false}
      />
      {!started && (
        <TouchableOpacity style={styles.overlay} onPress={handlePlay} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={playLabel}>
          <View style={styles.playCircle}>
            {status === 'loading' ? (
              <ActivityIndicator color="#1A2840" />
            ) : (
              <Ionicons name="play" size={26} color="#1A2840" style={{ marginLeft: 3 }} />
            )}
          </View>
          <Text style={styles.playText}>{playLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A2840', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(26, 40, 64, 0.55)' },
  playCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFB800', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  playText: { marginTop: 8, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  errorTitle: { marginTop: 8, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  errorDesc: { marginTop: 4, color: '#CBD5E1', fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', paddingHorizontal: 24 },
});
