import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SongItem } from '@/types/music';

interface VideoPlayerBannerProps {
  song: SongItem;
  onPlaySong: (song: SongItem) => void;
  isPlaying?: boolean;
}

function ActiveVideoView({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <View style={styles.videoWrapper}>
      <VideoView player={player} style={styles.video} nativeControls />
    </View>
  );
}

export function VideoPlayerBanner({ song, onPlaySong, isPlaying }: VideoPlayerBannerProps) {
  // If track has a video URL from R2, render video player!
  if (song.videoUrl) {
    return (
      <View style={styles.bannerContainer}>
        <ActiveVideoView uri={song.videoUrl} />
        <View style={styles.videoMetaBar}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.videoBadge}>
                <Text style={styles.videoBadgeText}>🎬 CLOUDINARY VIDEO ĐANG PHÁT</Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              🎤 {song.artist}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Fallback to Image Hero Banner
  return (
    <View style={styles.bannerContainer}>
      <Image source={{ uri: song.coverUrl }} style={styles.bannerImage} resizeMode="cover" />
      <View style={styles.gradientOverlay} />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 FEATURED TRACK</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist} • {song.plays}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.playButton} onPress={() => onPlaySong(song)}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            <Text style={styles.playText}>{isPlaying ? 'Tạm Dừng' : 'Phát Nhạc'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: { borderRadius: 18, overflow: 'hidden', marginBottom: 18, backgroundColor: '#121224', borderWidth: 1, borderColor: '#7C3AED55' },
  videoWrapper: { width: '100%', height: 210, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  videoMetaBar: { padding: 12, backgroundColor: '#16162A', flexDirection: 'row', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  videoBadge: { backgroundColor: '#06B6D4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  videoBadgeText: { color: '#0B0B14', fontSize: 10, fontWeight: '800' },
  bannerImage: { width: '100%', height: 190, position: 'absolute' },
  gradientOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(13, 13, 26, 0.75)' },
  content: { padding: 18, minHeight: 190, justifyContent: 'flex-end' },
  badge: { backgroundColor: '#7C3AED', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  artist: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  playButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#06B6D4', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 6 },
  playIcon: { fontSize: 13, color: '#0B0B14' },
  playText: { color: '#0B0B14', fontWeight: '800', fontSize: 12 },
});
