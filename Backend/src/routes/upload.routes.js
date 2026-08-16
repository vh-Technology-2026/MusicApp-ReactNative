// ── Upload & Cloudinary Routes Handler ──────────────────────────────────────
import { UploadController } from '../controllers/upload.controller.js';

export async function handleUploadRoutes(pathname, method, request, env) {
  // Get Signed Parameters for direct client upload
  if (pathname === '/api/upload/sign' && method === 'GET') {
    return UploadController.getSignParams(request, env);
  }

  // Upload video or thumbnail to Cloudinary
  if (
    (pathname === '/api/upload/video' || pathname === '/api/upload/thumbnail') &&
    method === 'POST'
  ) {
    return UploadController.uploadFile(request, env);
  }

  return null; // Not matched
}
