import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { MusicTrack, deleteTrackById } from '@/services/music-api';

interface RecentTracksSectionProps {
  tracks: MusicTrack[];
  loading: boolean;
  onRefresh: () => void;
}

export function RecentTracksSection({ tracks, loading, onRefresh }: RecentTracksSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = (id: number, title: string) => {
    Alert.alert('Xóa bài hát', `Bạn có chắc muốn xóa "${title}" khỏi R2 và D1?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrackById(id);
            onRefresh();
          } catch (e: any) {
            Alert.alert('Lỗi', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.title}>🎵 Track Đã Upload ({tracks.length})</Text>
        <Text style={styles.toggle}>{expanded ? '▲ Ẩn' : '▼ Xem'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator color="#06B6D4" style={{ marginVertical: 14 }} />
          ) : tracks.length === 0 ? (
            <Text style={styles.empty}>Chưa có bài hát nào trên R2.</Text>
          ) : (
            tracks.map((t) => (
              <View key={t.id} style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={styles.itemArtist} numberOfLines={1}>
                    🎤 {t.artist}
                  </Text>
                  <Text style={styles.itemKey} numberOfLines={1}>
                    📁 {t.video_key}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(t.id, t.title)}
                  style={{ padding: 6 }}
                >
                  <Text style={{ fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#16162A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#26264A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },
  toggle: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },
  list: { marginTop: 10, gap: 8 },
  empty: { color: '#64748B', fontSize: 12, textAlign: 'center', paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F0F1E', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#26264A' },
  itemTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  itemArtist: { color: '#38BDF8', fontSize: 11, marginTop: 2 },
  itemKey: { color: '#64748B', fontSize: 10, marginTop: 2 },
});
