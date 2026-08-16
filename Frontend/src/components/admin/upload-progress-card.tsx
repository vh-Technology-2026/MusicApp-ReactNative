import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ChunkProgress } from '@/services/chunk-uploader';
import { CircularProgress } from './circular-progress';

interface UploadProgressCardProps {
  progress: ChunkProgress;
  isUploading: boolean;
  onStartUpload: () => void;
}

export function UploadProgressCard({
  progress,
  isUploading,
  onStartUpload,
}: UploadProgressCardProps) {
  const isStarted = progress.phase !== 'idle';
  const isDone = progress.phase === 'done' || progress.percent === 100;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>4.</Text>
        <Text style={styles.cardTitle}>PUBLISH TO CLOUDINARY (AUTO CONVERT)</Text>
      </View>

      {/* Circular Loading Indicator */}
      {isStarted && (
        <View style={styles.progressContainer}>
          <CircularProgress
            percent={progress.percent}
            currentPart={progress.currentPart}
            totalParts={progress.totalParts}
            isCompleted={isDone}
          />
          <Text style={[styles.msg, isDone && styles.successMsg]}>
            {progress.message}
          </Text>
          {progress.totalParts > 0 && !isDone && (
            <Text style={styles.partBadge}>
              ⚡ Cloudinary Auto Video Transcoding & Optimization
            </Text>
          )}
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.btn, isUploading && styles.btnDisabled]}
        onPress={onStartUpload}
        disabled={isUploading}
      >
        {isUploading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={styles.btnText}>ĐANG TẢI LÊN CLOUDINARY ({progress.percent}%)...</Text>
          </View>
        ) : (
          <Text style={styles.btnText}>☁️ UPLOAD TO CLOUDINARY</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#16162A', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#26264A' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardNumber: { fontSize: 16, fontWeight: '800', color: '#7C3AED', marginRight: 6 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', flex: 1 },
  progressContainer: { alignItems: 'center', marginBottom: 16, backgroundColor: '#0F0F1E', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#26264A' },
  msg: { color: '#38BDF8', fontSize: 12, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  successMsg: { color: '#10B981' },
  partBadge: { color: '#C084FC', fontSize: 11, marginTop: 4, fontWeight: '600' },
  btn: { backgroundColor: '#0284C7', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
