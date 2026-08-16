import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { uploadVideoInChunks, ChunkProgress } from '@/services/chunk-uploader';
import { saveMusicMetadata, uploadThumbnailImage, fetchMusicTracks, MusicTrack } from '@/services/music-api';
import { VideoPickerSection } from '@/components/admin/video-picker-section';
import { ThumbnailSection } from '@/components/admin/thumbnail-section';
import { TrackFormSection } from '@/components/admin/track-form-section';
import { UploadProgressCard } from '@/components/admin/upload-progress-card';
import { RecentTracksSection } from '@/components/admin/recent-tracks-section';

export default function MusicAdminScreen() {
  const router = useRouter();
  const [videoAsset, setVideoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [thumbnailAsset, setThumbnailAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [artist, setArtist] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<ChunkProgress>({ currentPart: 0, totalParts: 0, percent: 0, phase: 'idle', message: '' });
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const loadTracks = async () => {
    try {
      setLoadingTracks(true);
      const data = await fetchMusicTracks();
      setTracks(data);
    } catch {
      // Backend offline fallback
    } finally {
      setLoadingTracks(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handleStartUpload = async () => {
    if (!videoAsset) return Alert.alert('Thiếu video', 'Vui lòng chọn hoặc quay 1 video.');
    if (!title.trim() || !artist.trim()) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập Title và Artist.');

    const uploadStartTime = Date.now();
    console.log('⏱️ [START] Bắt đầu tải video lên Cloudinary lúc:', new Date().toLocaleTimeString());

    try {
      setIsUploading(true);

      // 1. Upload Video lên Cloudinary
      const videoKey = await uploadVideoInChunks(videoAsset.uri, videoAsset.fileName || 'video.mp4', (p) => setProgress(p));
      const videoElapsed = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
      console.log(`⏱️ [VIDEO DONE] Upload video hoàn tất trong: ${videoElapsed}s. URL:`, videoKey);

      // 2. Upload Thumbnail if present
      let thumbnailKey = '';
      if (thumbnailAsset) {
        setProgress((prev) => ({ ...prev, message: 'Đang tải thumbnail...' }));
        thumbnailKey = await uploadThumbnailImage(thumbnailAsset.uri);
      }

      // 3. Save Metadata to D1 Database
      setProgress((prev) => ({ ...prev, message: 'Lưu metadata vào D1 Database...' }));
      await saveMusicMetadata({ title: title.trim(), description: description.trim(), artist: artist.trim(), video_key: videoKey, thumbnail_key: thumbnailKey });

      const totalElapsed = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
      console.log(`⏱️ [TOTAL TIME] Toàn bộ quá trình hoàn tất trong: ${totalElapsed} giây 🎉`);

      // 4. Set Done State & Auto Redirect to Home
      setProgress({ currentPart: 0, totalParts: 0, percent: 100, phase: 'done', message: `🎉 Upload thành công trong ${totalElapsed}s! Đang chuyển về Trang Chủ...` });
      setVideoAsset(null);
      setThumbnailAsset(null);
      setTitle('');
      setDescription('');
      setArtist('');

      setTimeout(() => {
        setIsUploading(false);
        try {
          router.replace('/' as any);
        } catch {
          router.push('/' as any);
        }
      }, 800);
    } catch (err: any) {
      console.error('❌ [UPLOAD ERROR]:', err);
      setProgress((prev) => ({ ...prev, phase: 'error', message: err.message || 'Upload thất bại' }));
      Alert.alert('Lỗi Upload', err.message || 'Không thể hoàn thành upload video.');
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>TVMUSIC Admin</Text>
          <Text style={styles.subtitle}>⚡ Cloudinary Auto Video Upload & Transcoding</Text>
        </View>

        <VideoPickerSection videoAsset={videoAsset} onSelectVideo={setVideoAsset} disabled={isUploading} />
        <ThumbnailSection thumbnailAsset={thumbnailAsset} onSelectThumbnail={setThumbnailAsset} disabled={isUploading} />
        <TrackFormSection title={title} setTitle={setTitle} description={description} setDescription={setDescription} artist={artist} setArtist={setArtist} disabled={isUploading} />
        <UploadProgressCard progress={progress} isUploading={isUploading} onStartUpload={handleStartUpload} />
        <RecentTracksSection tracks={tracks} loading={loadingTracks} onRefresh={loadTracks} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#38BDF8', letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: '#C084FC', fontWeight: '600', marginTop: 4 },
});
