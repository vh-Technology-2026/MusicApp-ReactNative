// ── Master Router Aggregator ────────────────────────────────────────────────
import { handleUploadRoutes } from './upload.routes.js';
import { handleMusicRoutes } from './music.routes.js';
import { handleUserRoutes } from './user.routes.js';
import { handleSearchRoutes } from './search.routes.js';
import { jsonResponse, errorResponse } from '../utils/http.js';

export async function router(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  // 1. Health & Root endpoints
  if (pathname === '/api/health') {
    return jsonResponse({ status: 'OK', timestamp: new Date().toISOString() });
  }
  if (pathname === '/') {
    return jsonResponse({
      service: 'MusicApp Cloudflare API 🎵',
      features: ['Cloudinary Video Upload', 'BGE-M3 Semantic Search', 'Vectorize', 'D1 Database', 'Jamendo API'],
    });
  }

  // 2. Dispatch to Sub-Routers (search first — specific paths before broad match)
  const searchResponse = await handleSearchRoutes(pathname, method, request, env);
  if (searchResponse) return searchResponse;

  const uploadResponse = await handleUploadRoutes(pathname, method, request, env);
  if (uploadResponse) return uploadResponse;

  const musicResponse = await handleMusicRoutes(pathname, method, request, env);
  if (musicResponse) return musicResponse;

  const userResponse = await handleUserRoutes(pathname, method, request, env);
  if (userResponse) return userResponse;

  // 3. Fallback 404
  return errorResponse('Endpoint not found', 404);
}
