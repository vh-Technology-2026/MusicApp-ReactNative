import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SongItem } from '@/types/music';

interface TrackCardItemProps {
  song: SongItem;
  rank: number;
  onPlay: (song: SongItem) => void;
  isActive?: boolean;
}

export function TrackCardItem({ song, rank, onPlay, isActive }: TrackCardItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={() => onPlay(song)}
      activeOpacity={0.8}
    >
      {/* Rank Number */}
      <Text style={[styles.rank, isActive && styles.rankActive]}>
        {rank < 10 ? `0${rank}` : rank}
      </Text>

      {/* Thumbnail Artwork */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: song.coverUrl }} style={styles.image} resizeMode="cover" />
        {isActive && (
          <View style={styles.playingIndicator}>
            <Text style={{ fontSize: 10 }}>🎶</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.info}>
        <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist} • {song.plays}
        </Text>
      </View>

      {/* Duration & Play Action */}
      <View style={styles.actionSection}>
        <Text style={styles.duration}>{song.duration}</Text>
        <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(song)}>
          <Text style={styles.playBtnIcon}>{isActive ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121224', borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#1F1F3D' },
  containerActive: { backgroundColor: '#1A1A38', borderColor: '#7C3AED88' },
  rank: { width: 24, fontSize: 13, fontWeight: '800', color: '#64748B', textAlign: 'center' },
  rankActive: { color: '#06B6D4' },
  imageWrapper: { width: 46, height: 46, borderRadius: 8, overflow: 'hidden', marginHorizontal: 10, position: 'relative' },
  image: { width: '100%', height: '100%' },
  playingIndicator: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 182, 212, 0.7)', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  titleActive: { color: '#38BDF8' },
  artist: { fontSize: 11, color: '#94A3B8' },
  actionSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  duration: { fontSize: 11, color: '#64748B' },
  playBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#26264A', alignItems: 'center', justifyContent: 'center' },
  playBtnIcon: { color: '#FFF', fontSize: 11 },
});
