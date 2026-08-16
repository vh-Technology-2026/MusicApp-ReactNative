// ── Cloudflare Worker Entrypoint ───────────────────────────────────────────
import { CORS_HEADERS } from './utils/http.js';
import { router } from './routes/index.js';

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Delegate to Master Router
    return router(request, env);
  },
};
