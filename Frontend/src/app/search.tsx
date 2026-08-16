// ── Music Semantic Search Screen ─────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8787';

interface SearchResult {
  id: number | string;
  title: string;
  artist: string;
  description?: string;
  thumbnail_key?: string;
  video_key?: string;
  score?: number;
  source?: string;
}

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return null;
  const pct = Math.round(score * 100);
  const color = pct >= 85 ? '#22C55E' : pct >= 70 ? '#F59E0B' : '#64748B';
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{pct}% match</Text>
    </View>
  );
}

function TrackRow({ item }: { item: SearchResult }) {
  const thumbUrl = item.thumbnail_key
    ? (item.thumbnail_key.startsWith('http') ? item.thumbnail_key : `${API_BASE_URL}/api/file/${encodeURIComponent(item.thumbnail_key)}`)
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&q=80';

  return (
    <View style={styles.trackRow}>
      <Image source={{ uri: thumbUrl }} style={styles.artwork} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>🎤 {item.artist}</Text>
        {item.source === 'jamendo' && (
          <Text style={styles.sourceTag}>☁️ Jamendo</Text>
        )}
      </View>
      <ScoreBadge score={item.score} />
    </View>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); setSearchTime(null); return; }
    setLoading(true);
    const t0 = Date.now();
    try {
      const res = await axios.get<{ results: SearchResult[]; query: string }>(
        `${API_BASE_URL}/api/music/search?q=${encodeURIComponent(q)}&limit=15`
      );
      setResults(res.data.results || []);
      setSearchTime(((Date.now() - t0) / 1000).toFixed(2));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>🔍 Tìm Kiếm Ngữ Nghĩa</Text>
      <Text style={styles.subtitle}>Nhập tiếng Việt hoặc tiếng Anh — BGE-M3 hiểu ngữ nghĩa</Text>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="nhạc nhẹ để học bài · calm study lofi · jazz for focus..."
          placeholderTextColor="#64748B"
          autoFocus={Platform.OS === 'web'}
        />
        {loading && <ActivityIndicator color="#38BDF8" style={styles.spinner} />}
      </View>

      {searchTime && (
        <Text style={styles.meta}>
          ✨ {results.length} kết quả — {searchTime}s · Powered by BAAI/bge-m3 + Vectorize
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TrackRow item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && query ? (
            <Text style={styles.empty}>Không tìm thấy kết quả nào cho "{query}"</Text>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B14' },
  title: { fontSize: 22, fontWeight: '800', color: '#38BDF8', marginHorizontal: 16, marginTop: 12 },
  subtitle: { fontSize: 11, color: '#7C8BA4', marginHorizontal: 16, marginBottom: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#161625', borderRadius: 14, borderWidth: 1, borderColor: '#2D3748', paddingHorizontal: 14 },
  input: { flex: 1, color: '#FFF', fontSize: 15, paddingVertical: 14 },
  spinner: { marginLeft: 8 },
  meta: { fontSize: 11, color: '#8892A4', marginHorizontal: 16, marginBottom: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E2235' },
  artwork: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#1E2235' },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: { fontSize: 14, fontWeight: '700', color: '#F1F5F9' },
  trackArtist: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  sourceTag: { fontSize: 10, color: '#C084FC', marginTop: 2 },
  badge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 60, fontSize: 14 },
});
