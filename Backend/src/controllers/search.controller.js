// ── Search Controller: BGE-M3 Embedding + Vectorize Semantic Search ──────────
import { jsonResponse, errorResponse } from '../utils/http.js';

const ACCOUNT_ID = 'e31df8959f3a5ef85ea543dd630aeb54';
const CF_AI_MODEL = '@cf/baai/bge-m3';

// Build embedding text from track metadata
function buildTrackText(track) {
  return [
    `Title: ${track.title || ''}`,
    `Artist: ${track.artist || ''}`,
    `Genre: ${track.genre || ''}`,
    track.description ? `Description: ${track.description}` : '',
  ].filter(Boolean).join('\n');
}

// Get embedding vector — try env.AI first (remote), fallback to CF REST API
async function getEmbedding(text, env) {
  // Try Workers AI binding (works in --remote or deployed worker)
  if (env.AI) {
    try {
      const result = await env.AI.run(CF_AI_MODEL, { text: [text] });
      return result.data?.[0] || result[0];
    } catch {
      // Fall through to REST API
    }
  }

  // Fallback: Cloudflare AI REST API (requires CF_API_TOKEN env var)
  const token = env.CF_API_TOKEN;
  if (!token) {
    throw new Error(
      'Workers AI unavailable in local mode. Set CF_API_TOKEN in wrangler.toml [vars] or run `npm run dev:ai` to use remote mode.'
    );
  }
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${CF_AI_MODEL}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: [text] }),
    }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'AI API error');
  return data.result.data[0];
}

export const SearchController = {
  // ── GET /api/music/search?q=... ─────────────────────────────────────────────
  async semanticSearch(request, env) {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q')?.trim();
      const topK = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 20);

      if (!query) return errorResponse('Missing query parameter "q"', 400);

      // Try Vectorize Semantic Search
      if (env.VECTORIZE) {
        try {
          const queryVector = await getEmbedding(query, env);
          const { matches } = await env.VECTORIZE.query(queryVector, {
            topK,
            returnMetadata: 'all',
          });

          if (matches && matches.length > 0) {
            const allTracks = matches.map((match) => ({
              id: match.id,
              title: match.metadata?.title || '',
              artist: match.metadata?.artist || '',
              score: Math.round(match.score * 100) / 100,
              source: match.metadata?.source || 'unknown',
            })).sort((a, b) => b.score - a.score);

            return jsonResponse({ query, total: allTracks.length, results: allTracks, mode: 'semantic' });
          }
        } catch (vErr) {
          console.warn('Vectorize query failed, falling back to D1 text search:', vErr.message);
        }
      }

      // Fallback: Search D1 SQLite database directly with stop-word filtering
      if (env.DB) {
        const stopWords = new Set(['nhạc', 'bài', 'cho', 'để', 'và', 'là', 'thì', 'của', 'với', 'kiểu', 'loại', 'các', 'những', 'cái', 'nó', 'vẫn', 'trả', 'về', 'nghe', 'tôi', 'tui', 'có']);
        const rawWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
        const meaningfulWords = rawWords.filter((w) => !stopWords.has(w));
        const words = (meaningfulWords.length > 0 ? meaningfulWords : rawWords).slice(0, 4);

        const conditions = words.map(() => `(title LIKE ? OR artist LIKE ? OR description LIKE ?)`).join(' OR ');
        const bindings = [];
        words.forEach((w) => {
          const pattern = `%${w}%`;
          bindings.push(pattern, pattern, pattern);
        });
        bindings.push(topK);

        const { results } = await env.DB.prepare(
          `SELECT * FROM music WHERE ${conditions} LIMIT ?`
        )
          .bind(...bindings)
          .all();

        const formatted = (results || []).map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          description: t.description,
          thumbnail_key: t.thumbnail_key,
          video_key: t.video_key,
          score: 1.0,
          source: 'd1_local',
        }));

        return jsonResponse({ query, total: formatted.length, results: formatted, mode: 'd1_fallback', keywords_used: words });
      }

      return jsonResponse({ query, total: 0, results: [] });
    } catch (err) {
      return errorResponse(`Search failed: ${err.message}`, 500);
    }
  },

  // ── POST /api/music/index — Index single track ──────────────────────────────
  async indexTrack(request, env) {
    try {
      const track = await request.json();
      if (!track || !track.id) return errorResponse('Track must have an id', 400);

      const text = buildTrackText(track);
      const vector = await getEmbedding(text, env);

      await env.VECTORIZE.upsert([{
        id: `music:${track.id}`,
        values: vector,
        metadata: { title: track.title, artist: track.artist, source: track.source || 'local' },
      }]);

      return jsonResponse({ success: true, id: `music:${track.id}` });
    } catch (err) {
      return errorResponse(`Indexing failed: ${err.message}`, 500);
    }
  },
};
