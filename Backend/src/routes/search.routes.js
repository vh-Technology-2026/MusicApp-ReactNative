// ── Search & Jamendo Routes Handler ─────────────────────────────────────────
import { SearchController } from '../controllers/search.controller.js';
import { JamendoController } from '../controllers/jamendo.controller.js';

export async function handleSearchRoutes(pathname, method, request, env) {
  // Semantic search via BGE-M3 + Vectorize
  if (pathname === '/api/music/search' && method === 'GET') {
    return SearchController.semanticSearch(request, env);
  }

  // Live AI Vector Match Test
  if (pathname === '/api/music/test-ai' && method === 'GET') {
    return SearchController.testAiVector(request, env);
  }

  // Index a single track into Vectorize
  if (pathname === '/api/music/index' && method === 'POST') {
    return SearchController.indexTrack(request, env);
  }

  // Live Jamendo track search
  if (pathname === '/api/music/jamendo/search' && method === 'GET') {
    return JamendoController.search(request, env);
  }

  // Batch index Jamendo tracks into Vectorize + D1
  if (pathname === '/api/music/jamendo/index' && method === 'POST') {
    return JamendoController.indexTracks(request, env);
  }

  return null; // Not matched
}
