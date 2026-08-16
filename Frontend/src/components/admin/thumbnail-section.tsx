import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ThumbnailSectionProps {
  thumbnailAsset: ImagePicker.ImagePickerAsset | null;
  onSelectThumbnail: (asset: ImagePicker.ImagePickerAsset | null) => void;
  disabled?: boolean;
}

export function ThumbnailSection({
  thumbnailAsset,
  onSelectThumbnail,
  disabled,
}: ThumbnailSectionProps) {
  const handlePick = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Quyền', 'Cần quyền truy cập thư viện ảnh.');

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) onSelectThumbnail(res.assets[0]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>2.</Text>
        <Text style={styles.cardTitle}>THUMBNAIL</Text>
        {thumbnailAsset && !disabled && (
          <TouchableOpacity onPress={() => onSelectThumbnail(null)} style={styles.removeBtn}>
            <Text style={styles.removeText}>✕ Đổi</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.previewBox}>
          {thumbnailAsset ? (
            <Image source={{ uri: thumbnailAsset.uri }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 28 }}>🎵</Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.btn} onPress={handlePick} disabled={disabled}>
            <Text style={styles.btnText}>
              ⬆ {thumbnailAsset ? 'Đổi Thumbnail' : 'Upload Image'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hint}>.jpg / .png • Tỷ lệ 16:9 khuyên dùng</Text>
        </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  previewBox: { width: 78, height: 78, borderRadius: 12, backgroundColor: '#121224', borderWidth: 1, borderColor: '#26264A', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  controls: { flex: 1, gap: 6 },
  btn: { backgroundColor: '#26264A', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3B3B6D' },
  btnText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  hint: { color: '#64748B', fontSize: 11 },
});
