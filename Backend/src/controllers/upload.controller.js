// ── Cloudinary Upload Controller ─────────────────────────────────────────────
import { jsonResponse, errorResponse } from '../utils/http.js';

// SHA-1 signature generator using native Web Crypto API
async function generateSignature(params, apiSecret) {
  const serialized = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&') + apiSecret;

  const msgUint8 = new TextEncoder().encode(serialized);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const UploadController = {
  // ── 1. Tạo Signature cho Client Upload trực tiếp lên Cloudinary ────────────
  async getSignParams(request, env) {
    try {
      const cloudName = env.CLOUDINARY_CLOUD_NAME || 'tdxtzxgh';
      const apiKey = env.CLOUDINARY_API_KEY || '625152226638393';
      const apiSecret = env.CLOUDINARY_API_SECRET || 'ttQBKQ1P00jZ__macku8tBTpt9M';

      const url = new URL(request.url);
      const type = url.searchParams.get('type') || 'video'; // 'video' | 'image'
      const folder = type === 'video' ? 'assets/videos' : 'assets/images';
      const timestamp = Math.round(Date.now() / 1000);

      const signParams = { folder, timestamp };
      const signature = await generateSignature(signParams, apiSecret);

      return jsonResponse({
        success: true,
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
      });
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },

  // ── 2. Backend Relay Upload lên Cloudinary ─────────────────────────────────
  async uploadFile(request, env) {
    try {
      const cloudName = env.CLOUDINARY_CLOUD_NAME || 'tdxtzxgh';
      const apiKey = env.CLOUDINARY_API_KEY || '625152226638393';
      const apiSecret = env.CLOUDINARY_API_SECRET || 'ttQBKQ1P00jZ__macku8tBTpt9M';

      const url = new URL(request.url);
      const type = url.pathname.includes('thumbnail') ? 'image' : 'video';
      const folder = type === 'video' ? 'assets/videos' : 'assets/images';
      const timestamp = Math.round(Date.now() / 1000);

      const signature = await generateSignature({ folder, timestamp }, apiSecret);

      // Parse incoming multipart form data
      const incomingForm = await request.formData();
      const file = incomingForm.get('file');

      if (!file) return errorResponse('No file provided');

      // Forward to Cloudinary
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file', file);
      cloudinaryForm.append('api_key', apiKey);
      cloudinaryForm.append('timestamp', String(timestamp));
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('folder', folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
        { method: 'POST', body: cloudinaryForm }
      );

      const data = await res.json();
      if (!res.ok) {
        return errorResponse(data.error?.message || 'Cloudinary upload failed', 400);
      }

      return jsonResponse({
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        duration: data.duration,
        format: data.format,
        bytes: data.bytes,
        message: 'Upload to Cloudinary successful 🎉',
      }, 201);
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },
};
