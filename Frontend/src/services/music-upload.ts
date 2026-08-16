// Music Upload Service — communicates with Cloudflare Worker
import axios from 'axios';

// ── Change this to your deployed Worker URL ──────────────────────────────────
export const API_BASE_URL = 'http://localhost:8787';
// Production: 'https://react-native-backend.<your-subdomain>.workers.dev'

export interface MusicTrack {
  id: number;
  title: string;
  description: string;
  artist: string;
  video_key: string;
  thumbnail_key: string;
  created_at: string;
}

export interface UploadProgress {
  phase: 'idle' | 'uploading_video' | 'uploading_thumbnail' | 'saving_metadata' | 'done' | 'error';
  percent: number;
  message: string;
}

import { Platform } from 'react-native';

// ── Upload a file (video or thumbnail) to R2 via Worker ─────────────────────
async function uploadFile(
  fileUri: string,
  type: 'video' | 'thumbnail',
  mimeType: string,
  onProgress?: (p: number) => void
): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const res = await fetch(fileUri);
    const blob = await res.blob();
    formData.append('file', blob, type === 'video' ? 'upload.mp4' : 'upload.jpg');
  } else {
    formData.append('file', {
      uri: fileUri,
      name: type === 'video' ? 'upload.mp4' : 'upload.jpg',
      type: mimeType,
    } as unknown as Blob);
  }

  const response = await axios.post<{ success: boolean; key: string; message: string }>(
    `${API_BASE_URL}/api/upload/${type}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
      timeout: 120_000, // 2 minutes
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Upload failed');
  }

  return response.data.key;
}

// ── Main upload function: video → thumbnail → metadata ──────────────────────
export async function uploadMusicTrack(
  params: {
    videoUri: string;
    thumbnailUri?: string;
    title: string;
    description: string;
    artist: string;
  },
  onProgress: (progress: UploadProgress) => void
): Promise<MusicTrack> {
  const { videoUri, thumbnailUri, title, description, artist } = params;

  // Step 1: Upload video
  onProgress({ phase: 'uploading_video', percent: 0, message: 'Đang tải video lên R2...' });
  const videoKey = await uploadFile(videoUri, 'video', 'video/mp4', (p) => {
    onProgress({ phase: 'uploading_video', percent: p, message: `Tải video... ${p}%` });
  });

  // Step 2: Upload thumbnail (optional)
  let thumbnailKey = '';
  if (thumbnailUri) {
    onProgress({ phase: 'uploading_thumbnail', percent: 0, message: 'Đang tải thumbnail...' });
    thumbnailKey = await uploadFile(thumbnailUri, 'thumbnail', 'image/jpeg', (p) => {
      onProgress({ phase: 'uploading_thumbnail', percent: p, message: `Tải thumbnail... ${p}%` });
    });
  }

  // Step 3: Save metadata to D1
  onProgress({ phase: 'saving_metadata', percent: 99, message: 'Lưu thông tin vào cơ sở dữ liệu...' });
  const res = await axios.post<{ success: boolean; data: MusicTrack }>(
    `${API_BASE_URL}/api/music`,
    { title, description, artist, video_key: videoKey, thumbnail_key: thumbnailKey }
  );

  if (!res.data.success) throw new Error('Failed to save track metadata');

  onProgress({ phase: 'done', percent: 100, message: 'Upload hoàn tất! 🎉' });
  return res.data.data;
}

// ── Get all music tracks ─────────────────────────────────────────────────────
export async function getMusicTracks(): Promise<MusicTrack[]> {
  const res = await axios.get<{ success: boolean; data: MusicTrack[] }>(
    `${API_BASE_URL}/api/music`
  );
  return res.data.data ?? [];
}

// ── Get R2 file URL via Worker proxy ─────────────────────────────────────────
export function getFileUrl(key: string): string {
  return `${API_BASE_URL}/api/file/${encodeURIComponent(key)}`;
}

// ── Delete a track ────────────────────────────────────────────────────────────
export async function deleteMusicTrack(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/api/music/${id}`);
}
