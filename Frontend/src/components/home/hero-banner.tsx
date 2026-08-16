import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SongItem } from '@/types/music';

interface HeroBannerProps {
  featuredSong: SongItem;
  onPlaySong: (song: SongItem) => void;
  isPlaying?: boolean;
}

export function HeroBanner({ featuredSong, onPlaySong, isPlaying }: HeroBannerProps) {
  return (
    <View style={styles.bannerContainer}>
      {/* Background Image / Overlay */}
      <Image
        source={{ uri: featuredSong.coverUrl }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.gradientOverlay} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 FEATURED TRACK</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {featuredSong.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {featuredSong.artist} • {featuredSong.plays} lượt nghe
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onPlaySong(featuredSong)}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            <Text style={styles.playText}>{isPlaying ? 'Tạm Dừng' : 'Phát Nhạc'}</Text>
          </TouchableOpacity>

          <View style={styles.soundWaveRow}>
            <View style={[styles.soundBar, { height: 12 }]} />
            <View style={[styles.soundBar, { height: 20 }]} />
            <View style={[styles.soundBar, { height: 16 }]} />
            <View style={[styles.soundBar, { height: 24 }]} />
            <View style={[styles.soundBar, { height: 10 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: { height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 18, position: 'relative', borderWidth: 1, borderColor: '#7C3AED44' },
  bannerImage: { width: '100%', height: '100%', position: 'absolute' },
  gradientOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(13, 13, 26, 0.75)' },
  content: { flex: 1, padding: 18, justifyContent: 'flex-end' },
  badge: { backgroundColor: '#7C3AED', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  artist: { fontSize: 13, color: '#94A3B8', marginBottom: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#06B6D4', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 25, gap: 6, shadowColor: '#06B6D4', shadowOpacity: 0.5, shadowRadius: 8 },
  playIcon: { fontSize: 14, color: '#0B0B14' },
  playText: { color: '#0B0B14', fontWeight: '800', fontSize: 13 },
  soundWaveRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  soundBar: { width: 3, backgroundColor: '#38BDF8', borderRadius: 2 },
});
