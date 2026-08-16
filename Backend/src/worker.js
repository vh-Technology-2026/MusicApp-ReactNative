import { CORS_HEADERS } from './utils/http.js';
import { router } from './routes/index.js';
import { autoSeedJamendo } from './controllers/jamendo.controller.js';

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Delegate to Master Router
    return router(request, env);
  },

  // ── Scheduled Cron Trigger Job (Runs daily at midnight) ────────────────────
  async scheduled(event, env, ctx) {
    ctx.waitUntil(autoSeedJamendo(env));
  },
};
