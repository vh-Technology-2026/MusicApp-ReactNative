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
            const seen = new Set();
            const allTracks = [];
            for (const match of matches) {
              const title = match.metadata?.title || '';
              const artist = match.metadata?.artist || '';
              const key = `${title.trim().toLowerCase()}|${artist.trim().toLowerCase()}`;
              if (!seen.has(key)) {
                seen.add(key);
                allTracks.push({
                  id: match.id,
                  title,
                  artist,
                  score: Math.round(match.score * 100) / 100,
                  source: match.metadata?.source || 'unknown',
                });
              }
            }
            allTracks.sort((a, b) => b.score - a.score);

            return jsonResponse({ query, total: allTracks.length, results: allTracks, mode: 'semantic' });
          }
        } catch (vErr) {
          console.warn('Vectorize query failed, falling back to D1 text search:', vErr.message);
        }
      }

      // Fallback: Search D1 SQLite database directly with stop-word filtering & relevance scoring
      if (env.DB) {
        const stopWords = new Set(['nhạc', 'bài', 'cho', 'để', 'và', 'là', 'thì', 'của', 'với', 'kiểu', 'loại', 'các', 'những', 'cái', 'nó', 'vẫn', 'trả', 'về', 'nghe', 'tôi', 'tui', 'có']);
        const rawWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
        const meaningfulWords = rawWords.filter((w) => !stopWords.has(w));
        const words = (meaningfulWords.length > 0 ? meaningfulWords : rawWords).slice(0, 5);

        const conditions = words.map(() => `(title LIKE ? OR artist LIKE ? OR description LIKE ?)`).join(' OR ');
        const bindings = [];
        words.forEach((w) => {
          const pattern = `%${w}%`;
          bindings.push(pattern, pattern, pattern);
        });
        bindings.push(50); // Fetch top candidate pool

        const { results } = await env.DB.prepare(
          `SELECT * FROM music WHERE ${conditions} LIMIT ?`
        )
          .bind(...bindings)
          .all();

        const formatted = (results || [])
          .map((t) => {
            const text = `${t.title} ${t.artist} ${t.description}`.toLowerCase();
            let matchedCount = 0;
            words.forEach((w) => {
              if (text.includes(w)) matchedCount++;
            });
            return {
              id: t.id,
              title: t.title,
              artist: t.artist,
              description: t.description,
              thumbnail_key: t.thumbnail_key,
              video_key: t.video_key,
              score: Math.min(1.0, Math.round((matchedCount / words.length) * 100) / 100),
              source: 'd1_local',
              _matchedCount: matchedCount,
            };
          })
          .sort((a, b) => b._matchedCount - a._matchedCount);

        // Strict deduplication by title & artist
        const seen = new Set();
        const uniqueTracks = [];
        for (const track of formatted) {
          const key = `${(track.title || '').trim().toLowerCase()}|${(track.artist || '').trim().toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueTracks.push(track);
          }
        }

        const finalResults = uniqueTracks.slice(0, topK);

        return jsonResponse({ query, total: finalResults.length, results: finalResults, mode: 'd1_fallback', keywords_used: words });
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

  // ── GET /api/music/test-ai — Live AI Vector Match Test ──────────────────────
  async testAiVector(request, env) {
    try {
      const queryText = 'nhạc tình yêu nước ngoài';
      const sampleTracks = [
        { title: 'Sweet Love', desc: 'Romantic English love song for couples, soft acoustic guitar' },
        { title: 'Sad Duduk Solo', desc: 'Sad grief heartbreak and melancholy instrumental' },
        { title: 'Hardcore Metal', desc: 'Energetic heavy metal electric guitar noise' },
        { title: 'Club Dance', desc: 'Upbeat EDM dance club electronic party beat' },
      ];

      const queryVec = await getEmbedding(queryText, env);
      const results = [];

      for (const track of sampleTracks) {
        const text = `Title: ${track.title} | Description: ${track.desc}`;
        const trackVec = await getEmbedding(text, env);

        let dot = 0, mA = 0, mB = 0;
        for (let i = 0; i < queryVec.length; i++) {
          dot += queryVec[i] * trackVec[i];
          mA += queryVec[i] * queryVec[i];
          mB += trackVec[i] * trackVec[i];
        }
        const score = dot / (Math.sqrt(mA) * Math.sqrt(mB));
        const matchPct = Math.round(score * 100);

        results.push({
          title: track.title,
          description: track.desc,
          match_score: `${matchPct}%`,
          score_decimal: Math.round(score * 1000) / 1000,
        });
      }

      results.sort((a, b) => b.score_decimal - a.score_decimal);

      return jsonResponse({
        success: true,
        query: queryText,
        note: 'Tiếng Việt 100% -> Tự động khớp với nhạc Romantic English bằng Cloudflare BGE-M3 Vector Embedding',
        results,
      });
    } catch (err) {
      return errorResponse(`Test failed: ${err.message}`, 500);
    }
  },
};
