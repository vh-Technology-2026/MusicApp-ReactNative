import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPickerSectionProps {
  videoAsset: ImagePicker.ImagePickerAsset | null;
  onSelectVideo: (asset: ImagePicker.ImagePickerAsset | null) => void;
  disabled?: boolean;
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });
  return (
    <View style={styles.previewContainer}>
      <VideoView player={player} style={styles.videoPlayer} nativeControls />
    </View>
  );
}

export function VideoPickerSection({
  videoAsset,
  onSelectVideo,
  disabled,
}: VideoPickerSectionProps) {
  const handlePick = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Quyền', 'Cần quyền truy cập thư viện.');

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!res.canceled && res.assets[0]) onSelectVideo(res.assets[0]);
  };

  const handleRecord = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return Alert.alert('Quyền', 'Cần quyền camera.');

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 120,
    });
    if (!res.canceled && res.assets[0]) onSelectVideo(res.assets[0]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>1.</Text>
        <Text style={styles.cardTitle}>VIDEO PICKER (CHUNKED MULTIPART)</Text>
        {videoAsset && !disabled && (
          <TouchableOpacity onPress={() => onSelectVideo(null)} style={styles.removeBtn}>
            <Text style={styles.removeText}>✕ Đổi</Text>
          </TouchableOpacity>
        )}
      </View>

      {videoAsset ? (
        <View style={styles.selectedBox}>
          <VideoPreview uri={videoAsset.uri} />
          <View style={styles.infoBar}>
            <Text style={styles.fileName} numberOfLines={1}>
              🎥 {videoAsset.fileName || 'Video đã chọn'}
            </Text>
            {videoAsset.fileSize && (
              <Text style={styles.fileSize}>
                {Math.round((videoAsset.fileSize / 1024 / 1024) * 10) / 10} MB
              </Text>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.dashedBox} onPress={handlePick} disabled={disabled}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 26 }}>🎥</Text>
          </View>
          <Text style={styles.boxTitle}>Chọn hoặc quay video</Text>
          <Text style={styles.boxSub}>Tự động chia thành từng phần 5MB tải lên R2</Text>
        </TouchableOpacity>
      )}

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handlePick} disabled={disabled}>
          <Text style={styles.btnPrimaryText}>📁 Choose Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={handleRecord} disabled={disabled}>
          <Text style={styles.btnOutlineText}>📹 Record Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#16162A', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#26264A' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardNumber: { fontSize: 16, fontWeight: '800', color: '#7C3AED', marginRight: 6 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', flex: 1 },
  removeBtn: { backgroundColor: '#EF444422', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  removeText: { color: '#F87171', fontSize: 11, fontWeight: '600' },
  dashedBox: { borderWidth: 2, borderColor: '#7C3AED66', borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#121224', alignItems: 'center', padding: 20, marginBottom: 12 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#7C3AED22', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  boxTitle: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  boxSub: { color: '#64748B', fontSize: 11, marginTop: 2 },
  selectedBox: { borderRadius: 12, overflow: 'hidden', marginBottom: 12, backgroundColor: '#0F0F1E' },
  previewContainer: { width: '100%', height: 170, backgroundColor: '#000' },
  videoPlayer: { width: '100%', height: '100%' },
  infoBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#16162A' },
  fileName: { color: '#E2E8F0', fontSize: 12, flex: 1 },
  fileSize: { color: '#06B6D4', fontSize: 12, fontWeight: '700', marginLeft: 8 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnPrimary: { flex: 1, backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  btnPrimaryText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  btnOutline: { flex: 1, borderColor: '#06B6D4', borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  btnOutlineText: { color: '#06B6D4', fontWeight: '700', fontSize: 13 },
});
