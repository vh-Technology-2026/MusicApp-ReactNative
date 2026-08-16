// ── TVMUSIC Explore & Discover Screen ───────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const PLAYLISTS = [
  {
    id: 'p1',
    name: 'Top 50 Việt Nam & Quốc Tế',
    desc: 'Những bài hát đang viral nhiều nhất',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    tracks: '50 bài hát',
  },
  {
    id: 'p2',
    name: 'Lo-Fi Chill & Coding Night',
    desc: 'Giai điệu thư giãn cho lập trình viên',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
    tracks: '32 bài hát',
  },
  {
    id: 'p3',
    name: 'Electronic Gaming Beats',
    desc: 'Âm thanh bùng nổ năng lượng',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
    tracks: '45 bài hát',
  },
  {
    id: 'p4',
    name: 'Acoustic Cafe Guitar',
    desc: 'Nhạc êm dịu góc quán quen',
    cover: 'https://images.unsplash.com/photo-1445985543470-41fdd5c31447?w=400&q=80',
    tracks: '28 bài hát',
  },
];

const GENRES = [
  { name: 'Pop Music', color: '#EC4899', icon: '🎤' },
  { name: 'Hip-Hop & Rap', color: '#F59E0B', icon: '🎧' },
  { name: 'EDM & Dance', color: '#8B5CF6', icon: '⚡' },
  { name: 'Indie & R&B', color: '#10B981', icon: '🎸' },
  { name: 'Deep Focus', color: '#06B6D4', icon: '🧘' },
  { name: 'Cloudflare R2', color: '#3B82F6', icon: '☁️' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎵 TV<Text style={{ color: '#06B6D4' }}>MUSIC</Text></Text>
          <Text style={styles.title}>Khám Phá Âm Nhạc</Text>
          <Text style={styles.subtitle}>Bộ sưu tập Playlist & Thể loại tuyển chọn</Text>
        </View>

        {/* Genres Grid */}
        <Text style={styles.sectionHeading}>🌟 Thể Loại Phổ Biến</Text>
        <View style={styles.genreGrid}>
          {GENRES.map((g) => {
            const isSelected = selectedGenre === g.name;
            return (
              <TouchableOpacity
                key={g.name}
                style={[styles.genreCard, { backgroundColor: g.color + '22', borderColor: g.color + '66' }, isSelected && { borderColor: g.color, backgroundColor: g.color + '44' }]}
                onPress={() => setSelectedGenre(isSelected ? null : g.name)}
              >
                <Text style={styles.genreIcon}>{g.icon}</Text>
                <Text style={styles.genreName}>{g.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Featured Playlists */}
        <Text style={styles.sectionHeading}>💿 Playlist Nổi Bật</Text>
        <View style={styles.playlistList}>
          {PLAYLISTS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.playlistCard}
              onPress={() => router.push('/' as any)}
            >
              <Image source={{ uri: p.cover }} style={styles.playlistCover} resizeMode="cover" />
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.playlistDesc} numberOfLines={1}>{p.desc}</Text>
                <Text style={styles.playlistTracks}>{p.tracks}</Text>
              </View>
              <View style={styles.playBadge}>
                <Text style={{ color: '#FFF', fontSize: 12 }}>▶</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B14' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  header: { marginBottom: 20 },
  logo: { fontSize: 15, fontWeight: '900', color: '#FFF', letterSpacing: 0.5, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 12, marginTop: 10 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  genreCard: { width: '48%', borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  genreIcon: { fontSize: 20 },
  genreName: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  playlistList: { gap: 12 },
  playlistCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151528', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#26264A' },
  playlistCover: { width: 64, height: 64, borderRadius: 10 },
  playlistInfo: { flex: 1, marginLeft: 12 },
  playlistName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  playlistDesc: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  playlistTracks: { color: '#38BDF8', fontSize: 11, fontWeight: '600', marginTop: 4 },
  playBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
});
