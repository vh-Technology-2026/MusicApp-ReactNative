import axios from 'axios';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { UploadType } from 'expo-file-system';

export const API_BASE_URL = 'http://localhost:8787';

export interface ChunkProgress {
  currentPart: number;
  totalParts: number;
  percent: number;
  phase: 'idle' | 'slicing' | 'uploading' | 'assembling' | 'done' | 'error';
  message: string;
}

interface SignParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
}

// ── Upload Native (iOS/Android) qua Expo FileSystem Upload Task ──────────────
async function uploadNative(
  fileUri: string,
  signData: SignParams,
  type: 'video' | 'image',
  onProgress?: (progress: ChunkProgress) => void
): Promise<string> {
  const { apiKey, timestamp, signature, folder, uploadUrl } = signData;

  const uploadTask = FileSystem.createUploadTask(
    uploadUrl,
    fileUri,
    {
      httpMethod: 'POST',
      uploadType: (FileSystem as any).FileSystemUploadType?.MULTIPART || (UploadType as any).MULTIPART,
      fieldName: 'file',
      parameters: {
        api_key: apiKey,
        timestamp: String(timestamp),
        signature: signature,
        folder: folder,
      },
    },
    (data) => {
      if (data.totalBytesExpectedToSend > 0) {
        const percent = Math.min(
          95,
          Math.max(5, Math.round((data.totalBytesSent / data.totalBytesExpectedToSend) * 100))
        );
        onProgress?.({
          currentPart: 1,
          totalParts: 1,
          percent,
          phase: 'uploading',
          message: `Đang tải ${type === 'video' ? 'video' : 'ảnh'} lên Cloudinary... ${percent}%`,
        });
      }
    }
  );

  const result = await uploadTask.uploadAsync();
  if (!result || result.status >= 400) {
    const errorBody = result?.body ? JSON.parse(result.body) : {};
    throw new Error(errorBody.error?.message || `Upload failed with status ${result?.status}`);
  }

  const responseData = JSON.parse(result.body);
  return responseData.secure_url;
}

// ── Upload Web qua FormData & Axios ─────────────────────────────────────────
async function uploadWeb(
  fileUri: string,
  fileName: string,
  signData: SignParams,
  type: 'video' | 'image',
  onProgress?: (progress: ChunkProgress) => void
): Promise<string> {
  const { apiKey, timestamp, signature, folder, uploadUrl } = signData;

  const res = await fetch(fileUri);
  const blob = await res.blob();

  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const response = await axios.post<{ secure_url: string; error?: { message: string } }>(
    uploadUrl,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) {
          const percent = Math.min(95, Math.max(5, Math.round((e.loaded / e.total) * 100)));
          onProgress?.({
            currentPart: 1,
            totalParts: 1,
            percent,
            phase: 'uploading',
            message: `Đang tải ${type === 'video' ? 'video' : 'ảnh'} lên Cloudinary... ${percent}%`,
          });
        }
      },
      timeout: 300_000,
    }
  );

  if (!response.data || !response.data.secure_url) {
    throw new Error(response.data?.error?.message || 'Cloudinary không trả về URL video hợp lệ');
  }

  return response.data.secure_url;
}

// ── Main Uploader ────────────────────────────────────────────────────────────
export async function uploadToCloudinary(
  fileUri: string,
  type: 'video' | 'image',
  fileName = 'file.mp4',
  onProgress?: (progress: ChunkProgress) => void
): Promise<string> {
  // 1. Lấy Signed Parameters từ Backend Worker (folder: assets/videos hoặc assets/images)
  onProgress?.({
    currentPart: 1,
    totalParts: 1,
    percent: 5,
    phase: 'slicing',
    message: `Đang kết nối Cloudinary (${type === 'video' ? 'Video' : 'Ảnh'})...`,
  });

  const signRes = await axios.get<SignParams>(
    `${API_BASE_URL}/api/upload/sign?type=${type}`
  );
  const signData = signRes.data;

  // 2. Upload theo platform (Native FileSystem hoặc Web)
  let secureUrl = '';
  if (Platform.OS === 'web') {
    secureUrl = await uploadWeb(fileUri, fileName, signData, type, onProgress);
  } else {
    secureUrl = await uploadNative(fileUri, signData, type, onProgress);
  }

  onProgress?.({
    currentPart: 1,
    totalParts: 1,
    percent: 100,
    phase: 'done',
    message: 'Tải lên & tối ưu hóa Cloudinary thành công! 🎉',
  });

  return secureUrl;
}

export const uploadVideoInChunks = (
  videoUri: string,
  fileName = 'video.mp4',
  onProgress?: (progress: ChunkProgress) => void
) => uploadToCloudinary(videoUri, 'video', fileName, onProgress);
