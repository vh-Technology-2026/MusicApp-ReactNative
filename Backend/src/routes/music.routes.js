// ── Music Metadata Routes Handler ──────────────────────────────────────────
import { MusicController } from '../controllers/music.controller.js';

export async function handleMusicRoutes(pathname, method, request, env) {
  // Collection endpoints
  if (pathname === '/api/music') {
    if (method === 'GET') return MusicController.getAll(env);
    if (method === 'POST') return MusicController.create(request, env);
  }

  // Member endpoints (/api/music/:id)
  const match = pathname.match(/^\/api\/music\/(\d+)$/);
  if (match) {
    const id = match[1];
    if (method === 'GET') return MusicController.getById(id, env);
    if (method === 'DELETE') return MusicController.delete(id, env);
  }

  return null; // Not matched
}
