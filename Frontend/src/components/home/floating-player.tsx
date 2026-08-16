import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SongItem } from '@/types/music';

interface FloatingPlayerProps {
  currentSong: SongItem | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
}

export function FloatingPlayer({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNextSong,
  onPrevSong,
}: FloatingPlayerProps) {
  if (!currentSong) return null;

  return (
    <View style={styles.container}>
      {/* Progress Line */}
      <View style={styles.progressTrack}>
        <View style={styles.progressBar} />
      </View>

      <View style={styles.inner}>
        {/* Cover & Title */}
        <Image source={{ uri: currentSong.coverUrl }} style={styles.cover} resizeMode="cover" />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {onPrevSong && (
            <TouchableOpacity onPress={onPrevSong} style={styles.btnSmall}>
              <Text style={styles.ctrlIcon}>⏮</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onTogglePlay} style={styles.btnPlay}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          {onNextSong && (
            <TouchableOpacity onPress={onNextSong} style={styles.btnSmall}>
              <Text style={styles.ctrlIcon}>⏭</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 70, left: 12, right: 12, backgroundColor: '#181830', borderRadius: 16, borderWidth: 1, borderColor: '#7C3AED66', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  progressTrack: { height: 3, backgroundColor: '#26264A', width: '100%' },
  progressBar: { height: '100%', width: '42%', backgroundColor: '#06B6D4' },
  inner: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  cover: { width: 44, height: 44, borderRadius: 8 },
  info: { flex: 1, marginLeft: 10 },
  title: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  artist: { fontSize: 11, color: '#38BDF8', marginTop: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnSmall: { padding: 6 },
  ctrlIcon: { fontSize: 16, color: '#94A3B8' },
  btnPlay: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#FFF', fontSize: 14 },
});
