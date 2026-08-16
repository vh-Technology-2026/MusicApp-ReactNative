import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SongItem } from '@/types/music';

interface TrendingCarouselProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  activeSongId?: string | number;
}

export function TrendingCarousel({ songs, onSelectSong, activeSongId }: TrendingCarouselProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 Thịnh Hành Hôm Nay</Text>
        <Text style={styles.seeAll}>Xem thêm →</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {songs.map((song) => {
          const isActive = activeSongId === song.id;
          return (
            <TouchableOpacity
              key={song.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onSelectSong(song)}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: song.coverUrl }} style={styles.image} resizeMode="cover" />
                <View style={styles.playBadge}>
                  <Text style={styles.playIcon}>{isActive ? '⏸' : '▶'}</Text>
                </View>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {song.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {song.artist}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  seeAll: { fontSize: 12, color: '#06B6D4', fontWeight: '600' },
  scroll: { gap: 12, paddingRight: 16 },
  card: { width: 140, backgroundColor: '#16162A', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#26264A' },
  cardActive: { borderColor: '#06B6D4', shadowColor: '#06B6D4', shadowOpacity: 0.4, shadowRadius: 8 },
  imageWrapper: { width: '100%', height: 120, borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 8 },
  image: { width: '100%', height: '100%' },
  playBadge: { position: 'absolute', bottom: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(124, 58, 237, 0.9)', alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 11, color: '#FFF' },
  title: { fontSize: 13, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  artist: { fontSize: 11, color: '#94A3B8' },
});
