// ── Main TVMUSIC App / Web Screen ──────────────────────────────────────────
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SongItem } from '@/types/music';
import { fetchMusicTracks, searchMusicTracks, getFileUrl } from '@/services/music-api';
import { HeaderNav } from '@/components/home/header-nav';
import { VideoPlayerBanner } from '@/components/home/video-player-banner';
import { CategoryPills } from '@/components/home/category-pills';
import { TrendingCarousel } from '@/components/home/trending-carousel';
import { TrackCardItem } from '@/components/home/track-card-item';

const CURATED_SONGS: SongItem[] = [
  {
    id: 'c1',
    title: 'Midnight Lo-Fi Coding Beats',
    artist: 'ChillHop Studio',
    category: '🎧 Lo-Fi & Study',
    duration: '3:45',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
    plays: '128.4K',
  },
  {
    id: 'c2',
    title: 'Cyberpunk Neon Drift (EDM)',
    artist: 'SynthWave Pulse',
    category: '⚡ EDM & Bass',
    duration: '4:12',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
    plays: '94.2K',
  },
  {
    id: 'c3',
    title: 'Rainy Cafe Acoustic Guitar',
    artist: 'SimEnglish Acoustics',
    category: '🌿 Acoustic & Chill',
    duration: '2:58',
    coverUrl: 'https://images.unsplash.com/photo-1445985543470-41fdd5c31447?w=400&q=80',
    plays: '210.5K',
  },
  {
    id: 'c4',
    title: 'Deep Alpha Waves (432Hz)',
    artist: 'Zen Meditation Lab',
    category: '🧘 Deep Focus',
    duration: '5:20',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    plays: '76.8K',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [songs, setSongs] = useState<SongItem[]>(CURATED_SONGS);
  const [searchResults, setSearchResults] = useState<SongItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongItem | null>(CURATED_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAllTracks = async () => {
    try {
      const r2Tracks = await fetchMusicTracks();
      if (r2Tracks && r2Tracks.length > 0) {
        const r2SongItems: SongItem[] = r2Tracks.map((t) => ({
          id: `cloud_${t.id}`,
          title: t.title,
          artist: t.artist,
          category: t.description ? t.description.slice(0, 25) : '☁️ Cloud Track',
          duration: '3:30',
          coverUrl: t.thumbnail_key
            ? getFileUrl(t.thumbnail_key)
            : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
          videoKey: t.video_key,
          videoUrl: t.video_key ? getFileUrl(t.video_key) : undefined,
          plays: 'Jamendo/D1 HD',
        }));

        setSongs(r2SongItems);
        setCurrentSong(r2SongItems[0]);
      }
    } catch {
      // Backend offline fallback
    }
  };

  useEffect(() => {
    loadAllTracks();
  }, []);

  // Debounced Semantic Search API Trigger
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchMusicTracks(searchQuery);
        const mapped: SongItem[] = results.map((t) => ({
          id: `search_${t.id}`,
          title: t.title,
          artist: t.artist,
          category: '🔍 AI Semantic Match',
          duration: '3:30',
          coverUrl: t.thumbnail_key
            ? getFileUrl(t.thumbnail_key)
            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
          videoKey: t.video_key,
          videoUrl: t.video_key ? getFileUrl(t.video_key) : undefined,
          plays: 'Semantic Match',
        }));
        setSearchResults(mapped);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllTracks();
    setRefreshing(false);
  };

  const filteredSongs = useMemo(() => {
    if (searchResults !== null) {
      return searchResults;
    }

    return songs.filter((s) => {
      const matchCat =
        selectedCategory === 'Tất cả' ||
        (selectedCategory === '🔥 Thịnh Hành' && true) ||
        s.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchCat;
    });
  }, [songs, searchResults, selectedCategory]);

  const handlePlaySong = (song: SongItem) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06B6D4" />}
      >
        {/* Header Navigation */}
        <HeaderNav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Video / Hero Player Banner */}
        {songs.length > 0 && (
          <VideoPlayerBanner
            song={currentSong || songs[0]}
            onPlaySong={handlePlaySong}
            isPlaying={isPlaying}
          />
        )}

        {/* Category Filter Pills */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Trending Horizontal Carousel */}
        <TrendingCarousel
          songs={songs.slice(0, 5)}
          onSelectSong={handlePlaySong}
          activeSongId={isPlaying ? currentSong?.id : undefined}
        />

        {/* Track Feed List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {isSearching
              ? `🔍 Đang tìm kiếm ngữ nghĩa cho "${searchQuery}"...`
              : searchResults !== null
              ? `🔍 Kết quả tìm kiếm ngữ nghĩa cho "${searchQuery}" (${filteredSongs.length})`
              : `🎬 Danh Sách Video & Bài Hát (${filteredSongs.length})`}
          </Text>
        </View>

        {filteredSongs.map((song, index) => (
          <TrackCardItem
            key={song.id}
            song={song}
            rank={index + 1}
            onPlay={handlePlaySong}
            isActive={currentSong?.id === song.id && isPlaying}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B14' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 6 },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
