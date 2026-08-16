// ── Jamendo API Controller — Fetch & Index Music into Vectorize + D1 ─────────
import { jsonResponse, errorResponse } from '../utils/http.js';

const JAMENDO_API = 'https://api.jamendo.com/v3.0';
const ACCOUNT_ID = 'e31df8959f3a5ef85ea543dd630aeb54';
const CF_AI_MODEL = '@cf/baai/bge-m3';

// Dual-mode: env.AI (remote/deployed) or CF REST API (local via token)
async function getEmbedding(text, env) {
  if (env.AI) {
    try {
      const result = await env.AI.run(CF_AI_MODEL, { text: [text] });
      return result.data?.[0] || result[0];
    } catch { /* fall through */ }
  }
  const token = env.CF_API_TOKEN;
  if (!token) throw new Error('AI unavailable locally. Set CF_API_TOKEN in [vars] or run dev:ai');
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${CF_AI_MODEL}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: [text] }) }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'AI API error');
  return data.result.data[0];
}

// Build rich text representation of a track for embedding
function buildEmbedText(track) {
  return [
    `Title: ${track.name || ''}`,
    `Artist: ${track.artist_name || ''}`,
    `Album: ${track.album_name || ''}`,
    `Genre: ${track.musicinfo?.tags?.genres?.join(', ') || ''}`,
    `Mood: ${track.musicinfo?.tags?.moods?.join(', ') || ''}`,
    `Instruments: ${track.musicinfo?.tags?.instruments?.join(', ') || ''}`,
    `Tags: ${track.musicinfo?.tags?.genres?.join(', ') || ''}`,
    track.musicinfo?.description ? `Description: ${track.musicinfo.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export const JamendoController = {
  // ── GET /api/music/jamendo/search?q=... — Live Jamendo track search ─────────
  async search(request, env) {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q') || '';
      const limit = url.searchParams.get('limit') || '20';
      const clientId = env.JAMENDO_CLIENT_ID || '9eca7504';

      const res = await fetch(
        `${JAMENDO_API}/tracks/?client_id=${clientId}&format=json&limit=${limit}&namesearch=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`
      );
      const data = await res.json();

      const tracks = (data.results || []).map((t) => ({
        id: `jamendo_${t.id}`,
        title: t.name,
        artist: t.artist_name,
        album: t.album_name,
        duration: t.duration,
        artwork: t.album_image,
        audioUrl: t.audio,
        genre: t.musicinfo?.tags?.genres?.[0] || '',
        license: t.license_ccurl,
        source: 'jamendo',
      }));

      return jsonResponse({ query, total: tracks.length, results: tracks });
    } catch (err) {
      return errorResponse(`Jamendo search failed: ${err.message}`, 500);
    }
  },

  // ── POST /api/music/jamendo/index?limit=50 — Batch index Jamendo tracks ─────
  async indexTracks(request, env) {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '30', 10);
      const genre = url.searchParams.get('genre') || '';
      const clientId = env.JAMENDO_CLIENT_ID || '9eca7504';

      const params = new URLSearchParams({
        client_id: clientId, format: 'json', limit: String(limit),
        include: 'musicinfo', audioformat: 'mp32', orderby: 'popularity_total',
      });
      if (genre) params.set('tags', genre);

      const res = await fetch(`${JAMENDO_API}/tracks/?${params}`);
      const data = await res.json();
      const tracks = data.results || [];

      let indexed = 0;
      const errors = [];

      for (const track of tracks) {
        try {
          const embText = buildEmbedText(track);
          const vector = await getEmbedding(embText, env);

          // Upsert into Vectorize
          await env.VECTORIZE.upsert([{
            id: `music:jamendo_${track.id}`,
            values: vector,
            metadata: { title: track.name, artist: track.artist_name, source: 'jamendo' },
          }]);

          // Upsert into D1 (INSERT OR REPLACE)
          await env.DB.prepare(
            `INSERT OR REPLACE INTO music (title, artist, description, video_key, thumbnail_key)
             VALUES (?, ?, ?, ?, ?)`
          )
            .bind(
              track.name,
              track.artist_name,
              `Genre: ${track.musicinfo?.tags?.genres?.join(',')}`,
              track.audio || '',
              track.album_image || ''
            )
            .run();

          indexed++;
        } catch (e) {
          errors.push({ id: track.id, error: e.message });
        }
      }

      return jsonResponse({ success: true, total: tracks.length, indexed, errors });
    } catch (err) {
      return errorResponse(`Jamendo indexing failed: ${err.message}`, 500);
    }
  },
};
