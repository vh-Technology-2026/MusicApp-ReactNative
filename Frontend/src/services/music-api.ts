// ── Music API & Metadata Service ─────────────────────────────────────────────
import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from './chunk-uploader';

export interface MusicTrack {
  id: number;
  title: string;
  description: string;
  artist: string;
  video_key: string;
  thumbnail_key: string;
  created_at: string;
}

import { uploadToCloudinary } from './chunk-uploader';

// ── Upload Thumbnail (Image) to Cloudinary ──────────────────────────────────
export async function uploadThumbnailImage(imageUri: string): Promise<string> {
  return await uploadToCloudinary(imageUri, 'image', 'thumbnail.jpg');
}

// ── Save Track Metadata to D1 Database ──────────────────────────────────────
export async function saveMusicMetadata(params: {
  title: string;
  description: string;
  artist: string;
  video_key: string;
  thumbnail_key?: string;
}): Promise<MusicTrack> {
  const res = await axios.post<{ success: boolean; data: MusicTrack }>(
    `${API_BASE_URL}/api/music`,
    params
  );
  if (!res.data.success) throw new Error('Không thể lưu thông tin bài hát');
  return res.data.data;
}

// ── Get All Tracks ──────────────────────────────────────────────────────────
export async function fetchMusicTracks(): Promise<MusicTrack[]> {
  const res = await axios.get<{ success: boolean; data: MusicTrack[] }>(
    `${API_BASE_URL}/api/music`
  );
  return res.data.data || [];
}

// ── Delete Track ────────────────────────────────────────────────────────────
export async function deleteTrackById(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/api/music/${id}`);
}

// ── Get Stream URL (Cloudinary or Proxy) ─────────────────────────────────────
export function getFileUrl(keyOrUrl: string): string {
  if (!keyOrUrl) return '';
  if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
    return keyOrUrl;
  }
  return `${API_BASE_URL}/api/file/${encodeURIComponent(keyOrUrl)}`;
}
